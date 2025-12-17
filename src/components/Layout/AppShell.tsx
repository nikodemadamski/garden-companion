"use client";

import React from 'react';
import { useGarden } from '@/context/GardenContext';
import { fetchLocalWeather, WeatherData } from '@/services/weatherService';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { currentGarden, switchGarden } = useGarden();
    const [weather, setWeather] = React.useState<WeatherData | null>(null);

    React.useEffect(() => {
        // Fetch weather for header (London default for now)
        fetchLocalWeather(51.5074, -0.1278).then(setWeather);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            paddingBottom: '100px', // Space for floating nav
            maxWidth: '600px',
            margin: '0 auto',
            position: 'relative'
        }}>
            {/* Top Bar */}
            <header style={{
                padding: '2rem 1.5rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        Good Morning, <span style={{ color: 'var(--color-primary)' }}>Gardener</span>.
                    </h1>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
                        {weather ? `It's ${Math.round(weather.temperature)}°C today.` : 'Checking weather...'}
                    </p>
                </div>
                <div style={{ fontSize: '2rem' }}>
                    {weather?.isRaining ? '🌧️' : weather?.temperature && weather.temperature > 25 ? '☀️' : '⛅'}
                </div>
            </header>

            {/* Main Canvas */}
            <main style={{ padding: '0 1.5rem' }}>
                {children}
            </main>

            {/* Floating Bottom Nav */}
            <nav style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '0.8rem 1.5rem',
                borderRadius: '50px',
                boxShadow: 'var(--shadow-float)',
                display: 'flex',
                gap: '2rem',
                alignItems: 'center',
                zIndex: 100
            }}>
                <button
                    onClick={() => switchGarden('indoor')}
                    style={{
                        background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
                        opacity: currentGarden === 'indoor' ? 1 : 0.5,
                        transform: currentGarden === 'indoor' ? 'scale(1.1)' : 'scale(1)'
                    }}
                >
                    🏠
                </button>

                <button
                    className="btn-primary"
                    style={{
                        borderRadius: '50%', width: '50px', height: '50px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', padding: 0,
                        boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)'
                    }}
                    onClick={() => document.getElementById('add-plant-trigger')?.click()}
                >
                    +
                </button>

                <button
                    onClick={() => switchGarden('outdoor')}
                    style={{
                        background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
                        opacity: currentGarden === 'outdoor' ? 1 : 0.5,
                        transform: currentGarden === 'outdoor' ? 'scale(1.1)' : 'scale(1)'
                    }}
                >
                    🌳
                </button>
            </nav>
        </div>
    );
}
