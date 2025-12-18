"use client";

import React, { useEffect, useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import { WeatherAlertService } from '@/services/weatherAlertService';
import { seasonalTaskService } from '@/services/seasonalTaskService';
import { WeatherAlert, ProcessedAlert } from '@/types/weather';
import { SeasonalTask } from '@/types/seasonal';

export default function GardenDashboard() {
    const { plants, weather, season } = useGarden();
    const [alerts, setAlerts] = useState<ProcessedAlert[]>([]);
    const [tasks, setTasks] = useState<SeasonalTask[]>([]);
    const [loading, setLoading] = useState(true);

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
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [plants]);

    const plantsNeedingWater = plants.filter(p => {
        const lastWatered = new Date(p.lastWateredDate);
        const nextWater = new Date(lastWatered);
        nextWater.setDate(lastWatered.getDate() + p.waterFrequencyDays);
        return nextWater <= new Date();
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
            {/* Weather Alerts Section */}
            {alerts.length > 0 && (
                <section>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                {processed.protectionActions.length > 0 && (
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '8px' }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Recommended Actions:</p>
                                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                            {processed.protectionActions.slice(0, 3).map((action, i) => (
                                                <li key={i} style={{ fontSize: '0.85rem', color: '#4A5568', marginBottom: '0.2rem' }}>
                                                    {action.action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Quick Stats Grid */}
            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '20px', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>💧</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, display: 'block' }}>{plantsNeedingWater.length}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>NEED WATER</span>
                </div>
                <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '20px', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🌱</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, display: 'block' }}>{plants.length}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>TOTAL PLANTS</span>
                </div>
            </section>

            {/* Seasonal Guidance Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                        {season} Guidance
                    </h2>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: '#EBF8F2', padding: '0.25rem 0.75rem', borderRadius: '20px' }}>
                        {new Date().toLocaleString('default', { month: 'long' })}
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tasks.slice(0, 3).map((task, idx) => (
                        <div key={idx} className="glass-panel" style={{ padding: '1rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                backgroundColor: task.priority === 'high' ? '#FFF5F5' : '#F0FFF4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem'
                            }}>
                                {task.category === 'planting' ? '🪴' : task.category === 'harvesting' ? '🧺' : '✂️'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{task.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: '0.2rem 0 0' }}>{task.description?.substring(0, 60)}...</p>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && !loading && (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem', padding: '1rem' }}>
                            No specific tasks for this month. Enjoy your garden!
                        </p>
                    )}
                </div>
            </section>

            {/* Next Steps / Insights */}
            <section className="glass-panel" style={{
                padding: '1.5rem',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)',
                color: 'white'
            }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Gardener's Insight</h2>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', opacity: 0.9 }}>
                    {weather?.isRaining
                        ? "It's raining today, so you can skip watering your outdoor plants. Check your indoor plants' humidity levels instead!"
                        : weather?.temperature && weather.temperature > 20
                            ? "It's quite warm! Make sure to check your pots in the evening as they might dry out faster than usual."
                            : "The weather is mild. A perfect time for some light pruning or preparing your soil for the next season."}
                </p>
                <button style={{
                    marginTop: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.6rem 1rem',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                }}>
                    View Full Guide →
                </button>
            </section>
        </div>
    );
}
