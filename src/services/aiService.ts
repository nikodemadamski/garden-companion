import { Plant } from '@/types/plant';
import { WeatherData } from '@/services/weatherService';
import { ProcessedAlert } from '@/types/weather';

export interface AIChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export class AIService {
    static async getGardeningAdvice(query: string, plants: Plant[], weather: WeatherData | null): Promise<string> {
        // In a real app, this would call an LLM API (OpenAI, Claude, etc.)
        // For this "free AI assistance", we'll use a sophisticated rule-based engine 
        // that feels like an AI by using the user's specific garden context.

        const queryLower = query.toLowerCase();
        const plantNames = plants.map(p => p.name).join(', ');

        if (queryLower.includes('water') || queryLower.includes('thirsty')) {
            const thirsty = plants.filter(p => {
                const lastWatered = new Date(p.lastWateredDate);
                const nextWater = new Date(lastWatered);
                nextWater.setDate(lastWatered.getDate() + p.waterFrequencyDays);
                return nextWater <= new Date();
            });

            if (thirsty.length > 0) {
                return `Based on your garden data, ${thirsty.length} of your plants are thirsty: ${thirsty.map(p => p.name).join(', ')}. ${weather?.isRaining ? "However, it's raining in Dublin right now, so you can skip the outdoor ones!" : "I recommend watering them this evening."}`;
            }
            return "All your plants seem well-hydrated for now! I'll let you know if that changes based on the weather forecast.";
        }

        if (queryLower.includes('weather') || queryLower.includes('forecast') || queryLower.includes('ireland')) {
            if (!weather) return "I'm still fetching the latest Irish weather data. One moment!";
            let advice = `Currently in Ireland, it's ${Math.round(weather.temperature)}°C and ${weather.isRaining ? 'raining' : 'clear'}. `;
            if (weather.temperature < 5) advice += "It's quite cold! Make sure your sensitive outdoor plants are covered or moved inside.";
            else if (weather.temperature > 20) advice += "It's a warm day for Ireland! Your pots might dry out faster than usual.";
            return advice;
        }

        if (queryLower.includes('diagnostic') || queryLower.includes('sick') || queryLower.includes('yellow')) {
            return "I can help with that! Please use the Diagnostic Wizard in the 'Explore' tab for a step-by-step analysis, or tell me more about the symptoms (e.g., are the leaves drooping or spotted?).";
        }

        // Default "AI" response that uses context
        return `I'm your Garden AI. I see you have ${plants.length} plants including ${plants.slice(0, 2).map(p => p.name).join(' and ')}. How can I help you with your ${weather?.isRaining ? 'rainy' : 'sunny'} day gardening today?`;
    }

    static generateDailyPlan(plants: Plant[], weather: WeatherData | null, alerts: ProcessedAlert[]): { id: string, task: string, priority: 'high' | 'medium' | 'low', completed: boolean }[] {
        const plan: { id: string, task: string, priority: 'high' | 'medium' | 'low', completed: boolean }[] = [];

        // 1. Watering Tasks
        const thirsty = plants.filter(p => {
            const lastWatered = new Date(p.lastWateredDate);
            const nextWater = new Date(lastWatered);
            nextWater.setDate(lastWatered.getDate() + p.waterFrequencyDays);
            return nextWater <= new Date();
        });

        thirsty.forEach(p => {
            const isOutdoorRainy = p.type === 'outdoor' && weather?.isRaining;
            plan.push({
                id: `water-${p.id}`,
                task: isOutdoorRainy ? `Check ${p.name} (Nature is watering it! 🌧️)` : `Water ${p.name}`,
                priority: isOutdoorRainy ? 'low' : 'high',
                completed: false
            });
        });

        // 2. Weather Alert Tasks
        alerts.forEach(alert => {
            alert.protectionActions.forEach((action, idx) => {
                plan.push({
                    id: `alert-${alert.alert.id}-${idx}`,
                    task: action.action,
                    priority: alert.alert.severity === 'red' ? 'high' : 'medium',
                    completed: false
                });
            });
        });

        // 3. General Maintenance
        if (weather && weather.temperature > 25) {
            plan.push({ id: 'mist', task: 'Mist indoor tropical plants (High heat)', priority: 'medium', completed: false });
        }

        return plan;
    }
}
