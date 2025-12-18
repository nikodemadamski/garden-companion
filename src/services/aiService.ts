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
        const queryLower = query.toLowerCase();

        // Expert logic for Irish Climate
        if (queryLower.includes('water') || queryLower.includes('thirsty')) {
            const thirsty = plants.filter(p => {
                const lastWatered = new Date(p.lastWateredDate);
                const nextWater = new Date(lastWatered);
                nextWater.setDate(lastWatered.getDate() + p.waterFrequencyDays);
                return nextWater <= new Date();
            });

            if (thirsty.length > 0) {
                const outdoorThirsty = thirsty.filter(p => p.type === 'outdoor');
                if (weather?.rainSum24h && weather.rainSum24h > 2 && outdoorThirsty.length > 0) {
                    return `Good news! It rained ${weather.rainSum24h}mm in Dublin recently. Nature has already watered your ${outdoorThirsty.map(p => p.name).join(', ')}. You only need to check your indoor plants today! ✨`;
                }
                return `I've analyzed your garden. ${thirsty.length} plants need attention. ${weather?.isRaining ? "It's raining now, so hold off on the outdoor ones!" : "The soil is likely dry—time for a drink."}`;
            }
            return "Your garden is perfectly hydrated! The Irish mist is doing its job. ( ^_^) ";
        }

        if (queryLower.includes('sick') || queryLower.includes('yellow') || queryLower.includes('brown')) {
            return "Brown tips usually mean low humidity (common in Irish heated homes!), while yellow leaves often mean overwatering. Which plant is showing these signs? I can check its specific care history.";
        }

        return `I'm your Garden AI. I'm monitoring your ${plants.length} plants and the current ${weather?.temperature}°C Dublin weather. How can I help you stay on top of your garden today?`;
    }

    static generateDailyPlan(plants: Plant[], weather: WeatherData | null, alerts: ProcessedAlert[]): { id: string, task: string, priority: 'high' | 'medium' | 'low', completed: boolean, autoCompleted?: boolean }[] {
        const plan: { id: string, task: string, priority: 'high' | 'medium' | 'low', completed: boolean, autoCompleted?: boolean }[] = [];

        // 1. Smart Rain-Check Logic
        const isNatureWatering = (weather?.rainSum24h && weather.rainSum24h > 2) || weather?.isRaining;

        plants.forEach(p => {
            const lastWatered = new Date(p.lastWateredDate);
            const nextWater = new Date(lastWatered);
            nextWater.setDate(lastWatered.getDate() + p.waterFrequencyDays);

            if (nextWater <= new Date()) {
                const shouldAutoValue = p.type === 'outdoor' && isNatureWatering;
                plan.push({
                    id: `water-${p.id}`,
                    task: shouldAutoValue ? `Nature watered ${p.name} 🌧️` : `Water ${p.name}`,
                    priority: shouldAutoValue ? 'low' : 'high',
                    completed: !!shouldAutoValue,
                    autoCompleted: !!shouldAutoValue
                });
            }
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

        // 3. Seasonal Maintenance (Simplified)
        if (weather && weather.temperature < 5) {
            plan.push({ id: 'frost-check', task: 'Check for ground frost', priority: 'high', completed: false });
        }

        return plan.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return 0;
        });
    }
}
