"use client";

import React, { useEffect, useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import { fetchLocalWeather, WeatherData } from '@/services/weatherService';

export default function WeatherWidget() {
    const { currentGarden, plants, updatePlant } = useGarden();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [skippedCount, setSkippedCount] = useState(0);

    useEffect(() => {
        if (currentGarden !== 'outdoor') return;

        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const data = await fetchLocalWeather(position.coords.latitude, position.coords.longitude);
                setWeather(data);
                setLoading(false);
                checkAutoSkip(data);
            }, (error) => {
                console.error("Geolocation error", error);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [currentGarden]);

    const checkAutoSkip = (data: WeatherData) => {
        if (data.rainSum24h > 5) { // If rained more than 5mm
            let count = 0;
            const outdoorPlants = plants.filter(p => p.type === 'outdoor');

            outdoorPlants.forEach(plant => {
                const lastWatered = new Date(plant.lastWateredDate);
                const today = new Date();
                // If watered more than 24h ago, update "last watered" to today effectively skipping a manual water
                if ((today.getTime() - lastWatered.getTime()) > (24 * 60 * 60 * 1000)) {
                    // We don't actually change the record without user permission usually, 
                    // but for "Automation" we can just show a message or do it.
                    // Let's just count how many *would* be skipped or mark them visually.
                    // For this demo, let's just show the alert.
                    count++;
                }
            });
            setSkippedCount(count);
        }
    };

    if (currentGarden !== 'outdoor') return null;

    if (loading) return <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem' }}>Loading Weather...</div>;

    if (!weather) return <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem' }}>Weather unavailable. Enable location.</div>;

    return (
        <div className="glass-panel animate-fade-in" style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(200,230,255,0.4))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🌦️ {weather.locationName}
                </h3>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    {weather.temperature}°C
                </div>
                <p style={{ color: 'var(--color-text-light)' }}>
                    Rain (24h): {weather.rainSum24h}mm
                </p>
            </div>

            {weather.rainSum24h > 5 && (
                <div style={{
                    backgroundColor: 'var(--color-accent)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    maxWidth: '200px'
                }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>💧 Nature is watering!</p>
                    <p style={{ fontSize: '0.9rem' }}>
                        Heavy rain detected. You can likely skip watering your {skippedCount > 0 ? skippedCount : ''} outdoor plants today.
                    </p>
                </div>
            )}
        </div>
    );
}
