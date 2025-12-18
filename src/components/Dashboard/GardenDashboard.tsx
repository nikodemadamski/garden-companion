"use client";

import React, { useEffect, useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import { WeatherAlertService } from '@/services/weatherAlertService';
import { seasonalTaskService } from '@/services/seasonalTaskService';
import { AIService } from '@/services/aiService';
import { WeatherAlert, ProcessedAlert } from '@/types/weather';
import { SeasonalTask } from '@/types/seasonal';
import GardenerAI from '@/components/AI/GardenerAI';

export default function GardenDashboard() {
    const { plants, weather, season, setActiveTab, updatePlant } = useGarden();
    const [alerts, setAlerts] = useState<ProcessedAlert[]>([]);
    const [tasks, setTasks] = useState<SeasonalTask[]>([]);
    const [dailyPlan, setDailyPlan] = useState<{ id: string, task: string, priority: 'high' | 'medium' | 'low', completed: boolean }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAIChat, setShowAIChat] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch Weather Alerts
                const activeAlerts = await WeatherAlertService.getActiveAlerts(plants);
                setAlerts(activeAlerts);

                // Fetch Seasonal Tasks
                const currentMonth = new Date().getMonth() + 1;
                const seasonalTasks = await seasonalTaskService.getSeasonalTasks({
                    month: currentMonth,
                    climate_zone: 'ireland'
                });
                setTasks(seasonalTasks);

                // Generate Smart Daily Plan
                const plan = AIService.generateDailyPlan(plants, weather, activeAlerts);
                setDailyPlan(plan);
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [plants, weather]);

    const toggleTask = (id: string) => {
        setDailyPlan(prev => prev.map(t => {
            if (t.id === id) {
                // If it's a watering task, actually update the plant's last watered date
                if (id.startsWith('water-') && !t.completed) {
                    const plantId = id.replace('water-', '');
                    const plant = plants.find(p => p.id === plantId);
                    if (plant) {
                        updatePlant({ ...plant, lastWateredDate: new Date().toISOString() });
                    }
                }
                return { ...t, completed: !t.completed };
            }
            return t;
        }));
    };

    if (showAIChat) {
        return (
            <div className="animate-slide-up">
                <button
                    onClick={() => setShowAIChat(false)}
                    style={{ marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    ← Back to Dashboard
                </button>
                <GardenerAI />
            </div>
        );
    }

    return (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>

            {/* Smart Daily Action Plan */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Daily Action Plan</h2>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>
                        {dailyPlan.filter(t => t.completed).length}/{dailyPlan.length} DONE
                    </span>
                </div>
                <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '24px', backgroundColor: 'white' }}>
                    {dailyPlan.length > 0 ? (
                        dailyPlan.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleTask(item.id)}
                                style={{
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #F1F5F9',
                                    opacity: item.completed ? 0.5 : 1,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    border: `2px solid ${item.completed ? 'var(--color-primary)' : '#CBD5E0'}`,
                                    backgroundColor: item.completed ? 'var(--color-primary)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '0.8rem'
                                }}>
                                    {item.completed && '✓'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        margin: 0,
                                        textDecoration: item.completed ? 'line-through' : 'none'
                                    }}>
                                        {item.task}
                                    </p>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        color: item.priority === 'high' ? 'var(--color-danger)' : 'var(--color-text-light)',
                                        textTransform: 'uppercase'
                                    }}>
                                        {item.priority} Priority
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>✨ Your garden is all set for today!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* AI Assistant Teaser */}
            <section
                onClick={() => setShowAIChat(true)}
                style={{
                    background: 'linear-gradient(135deg, #5856D6 0%, #34C759 100%)',
                    borderRadius: '24px',
                    padding: '1.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(88, 86, 214, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Ask Garden AI</h2>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1rem', maxWidth: '80%' }}>
                        "Should I prune my roses today?" or "Why are my leaves turning yellow?"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                        Start Chatting <span style={{ fontSize: '1.2rem' }}>→</span>
                    </div>
                </div>
                <div style={{
                    position: 'absolute',
                    right: '-10px',
                    bottom: '-10px',
                    fontSize: '5rem',
                    opacity: 0.2,
                    transform: 'rotate(-15deg)'
                }}>
                    🤖
                </div>
            </section>

            {/* Weather Alerts Section */}
            {alerts.length > 0 && (
                <section>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ⚠️ Weather Alerts
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {alerts.map((processed, idx) => (
                            <div key={idx} style={{
                                backgroundColor: processed.alert.severity === 'red' ? '#FFF5F5' : processed.alert.severity === 'orange' ? '#FFFAF0' : '#FFFFF0',
                                borderLeft: `4px solid ${processed.alert.severity === 'red' ? '#E53E3E' : processed.alert.severity === 'orange' ? '#DD6B20' : '#D69E2E'}`,
                                padding: '1rem',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2D3748', marginBottom: '0.25rem' }}>
                                    {processed.alert.alertType.toUpperCase()} ALERT
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: '#4A5568', marginBottom: '0.75rem' }}>
                                    {processed.alert.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Seasonal Guidance Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{season} Guide</h2>
                    <button
                        onClick={() => setActiveTab('explore')}
                        style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}
                    >
                        View All
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tasks.slice(0, 2).map((task, idx) => (
                        <div key={idx} className="glass-panel" style={{ padding: '1rem', borderRadius: '20px', display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'white' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                backgroundColor: task.priority === 'high' ? '#FFF5F5' : '#F0FFF4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                flexShrink: 0
                            }}>
                                {task.category === 'planting' ? '🪴' : task.category === 'harvesting' ? '🧺' : '✂️'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{task.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: '0.1rem 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {task.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Weather Insight */}
            <section className="glass-panel" style={{
                padding: '1.5rem',
                borderRadius: '24px',
                backgroundColor: 'white',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>💡</span>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Smart Insight</h2>
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--color-text-light)', margin: 0 }}>
                    {weather?.isRaining
                        ? "It's raining in Dublin. I've automatically lowered the priority of outdoor watering tasks in your plan."
                        : weather?.temperature && weather.temperature > 20
                            ? "High temperature detected. I've added misting and extra watering checks to your daily plan."
                            : "The weather is stable. A great time to follow your standard care routine."}
                </p>
            </section>
        </div>
    );
}
