"use client";

import React, { useState, useEffect } from 'react';
import { useGarden } from '@/context/GardenContext';
import { ProcessedAlert, fetchWeatherAlerts } from '@/services/weatherAlertService';
import { SeasonalTask, fetchSeasonalTasks } from '@/services/seasonalTaskService';
import { AIService } from '@/services/aiService';
import WeatherAlertBanner from '@/components/Weather/WeatherAlertBanner';
import GardenerAI from '@/components/AI/GardenerAI';
import { ProductiveService } from '@/services/productiveService';

export default function GardenDashboard() {
    const { plants, weather, season, setActiveTab, updatePlant, awardXP, calculateHarmony, gardenRank, calculateWateringStatus } = useGarden();
    const harmony = calculateHarmony();
    const rank = gardenRank;

    const [alerts, setAlerts] = useState<ProcessedAlert[]>([]);
    const [tasks, setTasks] = useState<SeasonalTask[]>([]);
    const [dailyPlan, setDailyPlan] = useState<{ id: string, task: string, priority: 'high' | 'medium' | 'low', completed: boolean, autoCompleted?: boolean }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch alerts and tasks
                const [fetchedAlerts, fetchedTasks] = await Promise.all([
                    fetchWeatherAlerts(53.3498, -6.2603),
                    fetchSeasonalTasks('Spring') // Use fixed for now or dynamic
                ]);

                setAlerts(fetchedAlerts);
                setTasks(fetchedTasks);

                // Generate AI Daily Plan
                const plan = await AIService.generateDailyPlan(plants, weather, fetchedAlerts);
                setDailyPlan(plan.map(p => ({ ...p, completed: false })));
            } catch (error) {
                console.error("Error loading dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [plants, weather]);

    const toggleTask = (taskId: string) => {
        setDailyPlan(prev => prev.map(task => {
            if (task.id === taskId) {
                const newStatus = !task.completed;
                if (newStatus) {
                    // Award XP for completing a daily task
                    const randomPlant = plants[Math.floor(Math.random() * plants.length)];
                    if (randomPlant) awardXP(randomPlant.id, 5);
                }
                return { ...task, completed: newStatus };
            }
            return task;
        }));
    };

    const productivePlants = plants.filter(p => ProductiveService.getPlantData(p.species));
    const productivityScore = productivePlants.length > 0
        ? Math.round((productivePlants.filter(p => calculateWateringStatus(p).status === 'ok').length / productivePlants.length) * 100)
        : 100;

    const getMoodFace = () => {
        if (productivityScore >= 90) return '🧺'; // Bountiful harvest
        if (productivityScore >= 70) return '🌱'; // Growing well
        return '🥀'; // Needs attention
    };

    const isFrostRisk = !!(weather?.temperature && weather.temperature <= 2);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧺</div>
                    <p style={{ fontWeight: 700, color: 'var(--color-text-light)' }}>Calculating your harvest...</p>
                </div>
            </div>
        );
    }

    const totalHarvest = plants.reduce((acc, p) => {
        p.journal?.forEach(entry => {
            if (entry.type === 'harvest' && entry.harvestAmount) {
                const unit = entry.harvestUnit || 'units';
                acc[unit] = (acc[unit] || 0) + entry.harvestAmount;
            }
        });
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>

            {/* Frost Alert (Critical for Productive Plants) */}
            {isFrostRisk && (
                <div style={{
                    backgroundColor: '#EBF8FF',
                    padding: '1rem',
                    borderRadius: '20px',
                    border: '2px solid #4299E1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    animation: 'pulse 2s infinite'
                }}>
                    <span style={{ fontSize: '2rem' }}>❄️</span>
                    <div>
                        <div style={{ fontWeight: 900, color: '#2B6CB0' }}>CRITICAL: FROST ALERT</div>
                        <div style={{ fontSize: '0.85rem', color: '#2C5282', fontWeight: 600 }}>Dublin is at {weather.temperature}°C. Protect your seedlings!</div>
                    </div>
                </div>
            )}

            {/* Productivity Score & Rank Header */}
            <header style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '0.5rem',
                    filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))'
                }}>
                    {getMoodFace()}
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                    {productivityScore}%
                </h1>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-light)', margin: '0.25rem 0 1rem' }}>
                    Productivity Score
                </p>

                {/* Garden Rank Badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: rank.color,
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>{rank.icon}</span>
                    <span style={{ fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase' }}>{rank.title}</span>
                </div>
            </header>

            {/* Bounty Dashboard (Total Harvest) */}
            {Object.keys(totalHarvest).length > 0 && (
                <section>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Total Bounty 🧺</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                        {Object.entries(totalHarvest).map(([unit, amount]) => (
                            <div key={unit} className="glass-panel" style={{ padding: '1rem', borderRadius: '20px', textAlign: 'center', backgroundColor: '#F0FFF4', border: '1px solid #C6F6D5' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2F855A' }}>{amount}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38A169', textTransform: 'uppercase' }}>{unit}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Harvest Forecast Section */}

            {/* Harvest Forecast Section */}
            {productivePlants.length > 0 && (
                <section>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Harvest Forecast</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                        {productivePlants.slice(0, 3).map(p => {
                            const data = ProductiveService.getPlantData(p.species);
                            const daysLeft = Math.max(0, (data?.harvestDays || 30) - (p.level * 2)); // Mock logic for harvest countdown
                            return (
                                <div key={p.id} className="glass-panel" style={{ padding: '1rem', borderRadius: '20px', textAlign: 'center', backgroundColor: 'white' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{data?.category === 'fruit' ? '🍎' : data?.category === 'vegetable' ? '🥕' : '🌿'}</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{p.nickname || p.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 900, marginTop: '0.25rem' }}>
                                        {daysLeft} DAYS LEFT
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Smart Daily Action Plan */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Daily Action Plan</h2>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', backgroundColor: '#F0FFF4', padding: '4px 10px', borderRadius: '12px' }}>AI GENERATED</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', backgroundColor: 'white', border: '1px solid #F1F5F9' }}>
                    {dailyPlan.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {dailyPlan.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => toggleTask(item.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        cursor: 'pointer',
                                        opacity: item.completed ? 0.5 : 1,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '6px',
                                        border: `2px solid ${item.completed ? 'var(--color-primary)' : '#E2E8F0'}`,
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
                                        <div style={{
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            textDecoration: item.completed ? 'line-through' : 'none'
                                        }}>
                                            {item.task}
                                        </div>
                                        {item.autoCompleted && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                                                ✨ AUTO-COMPLETED (RAIN-CHECK)
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        padding: '2px 8px',
                                        borderRadius: '8px',
                                        backgroundColor: item.priority === 'high' ? '#FFF5F5' : '#F7FAFC',
                                        color: item.priority === 'high' ? '#E53E3E' : '#718096'
                                    }}>
                                        {item.priority.toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontWeight: 600 }}>No tasks for today! Enjoy your garden. 🌿</p>
                    )}
                </div>
            </section>

            {/* Weather Alerts & Seasonal Tasks */}
            <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {alerts.length > 0 && (
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Weather Alerts</h2>
                        <WeatherAlertBanner />
                    </div>
                )}

                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>{season} Tasks</h2>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', backgroundColor: 'white', border: '1px solid #F1F5F9' }}>
                        {tasks.map((task, idx) => {
                            const categoryIcons = {
                                planting: '🌱',
                                maintenance: '✂️',
                                harvesting: '🧺',
                                preparation: '🧹'
                            };
                            const icon = categoryIcons[task.category] || '🌿';

                            return (
                                <div key={idx} style={{ marginBottom: idx === tasks.length - 1 ? 0 : '1rem', display: 'flex', gap: '1rem' }}>
                                    <div style={{ fontSize: '1.5rem' }}>{icon}</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{task.title}</div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: '0.2rem 0 0' }}>{task.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* AI Chat Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Chat with AI Gardener</h2>
                </div>
                <GardenerAI />
            </section>
        </div>
    );
}
