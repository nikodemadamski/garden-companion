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
    const { plants, weather, calculateWateringStatus, setActiveTab, gardenRank: rank, seeds, awardXP, calculateHarmony, season, addPlant, productiveData } = useGarden();
    const harmony = calculateHarmony();

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

    const productivePlants = plants.filter(p => p.species && productiveData[p.species]);
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

    const successionAlerts = plants.reduce((acc, p) => {
        const data = p.species ? productiveData[p.species] : undefined;
        if (data?.successionDays) {
            const addedDate = new Date(p.dateAdded);
            const today = new Date();
            const diffDays = Math.floor((today.getTime() - addedDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays >= data.successionDays) {
                // Check if we already have an alert for this species
                if (!acc.find(a => a.species === p.species)) {
                    acc.push({
                        species: p.species,
                        name: p.name,
                        daysOverdue: diffDays - data.successionDays,
                        interval: data.successionDays
                    });
                }
            }
        }
        return acc;
    }, [] as { species: string, name: string, daysOverdue: number, interval: number }[]);

    return (
        <div className="animate-slide-up" style={{ paddingBottom: '5rem' }}>

            {/* Bento Grid Container */}
            <div className="bento-grid">

                {/* 1. The Pulse: Score & Weather (Span 2) */}
                <div className="bento-card span-2" style={{
                    background: 'linear-gradient(135deg, #34C759 0%, #248A3D 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Garden Health</div>
                            <div style={{ fontSize: '3rem', fontWeight: 900, margin: '0.5rem 0' }}>{productivityScore}%</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{rank.icon}</span>
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{rank.title}</span>
                                </div>
                                {plants.length === 0 && (
                                    <button
                                        onClick={() => {
                                            const samples = [
                                                { id: 'sample-1', name: 'Big Red', species: 'Tomato', type: 'outdoor' as const, location: 'Sunny Spot', waterFrequencyDays: 3, lastWateredDate: new Date().toISOString(), dateAdded: new Date().toISOString(), status: 'ok' as const, level: 1, xp: 0, room: 'Balcony' },
                                                { id: 'sample-2', name: 'Sweet Basil', species: 'Basil', type: 'indoor' as const, location: 'Kitchen Window', waterFrequencyDays: 2, lastWateredDate: new Date().toISOString(), dateAdded: new Date().toISOString(), status: 'ok' as const, level: 1, xp: 0, room: 'Kitchen' },
                                                { id: 'sample-3', name: 'Summer Berries', species: 'Strawberry', type: 'outdoor' as const, location: 'Patio', waterFrequencyDays: 4, lastWateredDate: new Date().toISOString(), dateAdded: new Date().toISOString(), status: 'ok' as const, level: 1, xp: 0, room: 'Balcony' }
                                            ];
                                            samples.forEach(s => {
                                                const { id: _, ...rest } = s;
                                                // @ts-ignore
                                                const newPlant = { ...rest, id: Math.random().toString(36).substring(2, 11) };
                                                // @ts-ignore
                                                addPlant(newPlant);
                                            });
                                        }}
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🌱 SEED GARDEN
                                    </button>
                                )}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '3rem' }}>{getMoodFace()}</div>
                            {weather && (
                                <div style={{ marginTop: '0.5rem', fontWeight: 700 }}>
                                    {Math.round(weather.temperature)}°C • {weather.isRaining ? '🌧️' : '☀️'}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Background Decoration */}
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '8rem', opacity: 0.1, pointerEvents: 'none' }}>🌿</div>
                </div>

                {/* 2. Weather Wisdom: Actionable Insights */}
                <div className="bento-card" style={{
                    background: isFrostRisk ? '#FFF5F5' : 'white',
                    border: isFrostRisk ? '2px solid #F56565' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{isFrostRisk ? '❄️' : weather?.isRaining ? '🌧️' : '☀️'}</span>
                        <div style={{ fontWeight: 900, fontSize: '0.7rem', color: 'var(--color-text-light)' }}>WEATHER WISDOM</div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        {isFrostRisk ? 'Frost tonight! Cover your sensitive outdoor crops.' :
                            weather?.isRaining ? 'Nature is watering. Skip the outdoor watering today.' :
                                (weather?.temperature && weather.temperature > 22) ? 'Heatwave alert! Check soil moisture more frequently.' :
                                    'Perfect growing conditions. A great day for some light pruning.'}
                    </div>
                </div>

                {/* 3. Harvest Forecast (Row Span 2) */}
                <div className="bento-card row-2" style={{ backgroundColor: '#FFF5F5' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>⏳</span> FORECAST
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {productivePlants.length > 0 ? productivePlants.slice(0, 4).map(p => {
                            const data = p.species ? productiveData[p.species] : undefined;
                            const daysLeft = Math.max(0, (data?.harvestDays || 30) - (p.level * 2));
                            return (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ fontSize: '1.5rem' }}>{data?.category === 'fruit' ? '🍎' : data?.category === 'vegetable' ? '🥕' : '🌿'}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.75rem' }}>{p.nickname || p.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#E53E3E', fontWeight: 900 }}>{daysLeft} DAYS</div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center', padding: '1rem 0' }}>No productive plants yet.</div>
                        )}
                    </div>
                </div>

                {/* 4. Total Bounty */}
                <div className="bento-card" style={{ backgroundColor: '#F0FFF4' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 900, marginBottom: '0.5rem', color: '#2F855A' }}>BOUNTY</h3>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#276749' }}>
                                {Object.values(totalHarvest).reduce((a, b) => a + b, 0)}
                            </div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#38A169' }}>TOTAL UNITS</div>
                        </div>
                    </div>
                </div>

                {/* 5. Seed Vault */}
                <div className="bento-card" style={{ backgroundColor: '#EBF8FF' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 900, marginBottom: '0.5rem', color: '#2B6CB0' }}>VAULT</h3>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2C5282' }}>{seeds.length}</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#3182CE' }}>VARIETIES</div>
                        </div>
                    </div>
                </div>

                {/* 6. Succession Scheduler (Span 2) */}
                <div className="bento-card span-2" style={{ backgroundColor: '#FAF5FF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#553C9A' }}>SUCCESSION</h3>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#805AD5', backgroundColor: 'white', padding: '2px 8px', borderRadius: '8px' }}>SOWING TIME</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {successionAlerts.length > 0 ? successionAlerts.map((alert, idx) => (
                            <div key={idx} style={{
                                minWidth: '140px',
                                padding: '0.75rem',
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                border: '1px solid #E9D8FD'
                            }}>
                                <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#553C9A' }}>{alert.species}</div>
                                <div style={{ fontSize: '0.6rem', color: '#6B46C1', margin: '0.25rem 0' }}>Every {alert.interval} days</div>
                                <button
                                    onClick={() => setActiveTab('explore')}
                                    style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#805AD5', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '4px', borderRadius: '8px' }}
                                >
                                    SOW
                                </button>
                            </div>
                        )) : (
                            <div style={{ fontSize: '0.75rem', color: '#6B46C1', opacity: 0.7 }}>Your garden is perfectly synced.</div>
                        )}
                    </div>
                </div>

                {/* 7. Daily Action Plan (Row Span 2) */}
                <div className="bento-card row-2" style={{ border: '1px solid #F1F5F9' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📋</span> DAILY PLAN
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {dailyPlan.slice(0, 6).map((item) => (
                            <div key={item.id} onClick={() => toggleTask(item.id)} style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer', opacity: item.completed ? 0.5 : 1 }}>
                                <div style={{
                                    width: '18px', height: '18px', borderRadius: '4px', border: '2px solid #E2E8F0',
                                    backgroundColor: item.completed ? 'var(--color-primary)' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6rem'
                                }}>
                                    {item.completed && '✓'}
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textDecoration: item.completed ? 'line-through' : 'none' }}>{item.task}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 8. AI Gardener Chat (Span 2) */}
                <div className="bento-card span-2" style={{ padding: 0, overflow: 'hidden' }}>
                    <GardenerAI compact={true} />
                </div>

                {/* 9. Seasonal Tasks (Span 3) */}
                <div className="bento-card span-2" style={{ backgroundColor: '#F7FAFC' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '1rem' }}>{season} Tasks</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {tasks.slice(0, 4).map((task, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ fontSize: '1.2rem' }}>🌿</div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.75rem' }}>{task.title}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)' }}>{task.category}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
