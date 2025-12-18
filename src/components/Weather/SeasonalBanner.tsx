"use client";

import React, { useState } from 'react';
import { useGarden } from '@/context/GardenContext';

export default function SeasonalBanner() {
    const { season } = useGarden();
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    let message = "";
    let icon = "";
    let color = "";

    switch (season) {
        case 'Winter':
            message = "Days are shorter. Reduce watering for most plants.";
            icon = "❄️";
            color = "#EBF8FF"; // Light Blue
            break;
        case 'Spring':
            message = "Wakey wakey! Time to fertilize and check for growth.";
            icon = "🌱";
            color = "#F0FFF4"; // Light Green
            break;
        case 'Summer':
            message = "It's hot! Check soil moisture daily.";
            icon = "☀️";
            color = "#FFFFF0"; // Light Yellow
            break;
        case 'Autumn':
            message = "Prepare for dormancy. Reduce fertilizer.";
            icon = "🍂";
            color = "#FFFAF0"; // Light Orange
            break;
    }

    return (
        <div className="animate-fade-in" style={{
            backgroundColor: color,
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2D3748' }}>{season} Approach</h4>
                    <p style={{ fontSize: '0.85rem', color: '#4A5568' }}>{message}</p>
                </div>
            </div>
            <button
                onClick={() => setVisible(false)}
                style={{ color: '#A0AEC0', padding: '0.5rem' }}
            >
                ✕
            </button>
        </div>
    );
}
