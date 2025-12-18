"use client";

import React from 'react';
import { Plant } from '@/types/plant';
import { useGarden } from '@/context/GardenContext';
import { HistoricalWeatherData } from '@/services/weatherService';

interface PlantCardProps {
    plant: Plant;
    history: HistoricalWeatherData[];
    onClick: () => void;
}

export default function PlantCard({ plant, history, onClick }: PlantCardProps) {
    const { calculateWateringStatus, weather } = useGarden();
    const status = calculateWateringStatus(plant, history);

    // Tamagotchi Logic: Determine Face
    const getFace = () => {
        if (status.status === 'overdue') return '😵';
        if (status.status === 'due') return '😫';
        if (status.adjustmentReason === 'heat') return '🥵';
        if (status.adjustmentReason === 'cold') return '🥶';
        if (status.adjustmentReason === 'rain') return '😌';

        const happyFaces = ['🙂', '😊', '😄', '😌'];
        const index = plant.id.charCodeAt(0) % happyFaces.length;
        return happyFaces[index];
    };

    const showScarf = weather && weather.temperature < 10 && plant.type === 'outdoor';

    const getIllustration = () => {
        const type = plant.species?.toLowerCase() || '';
        if (type.includes('cactus') || type.includes('succulent')) return '🌵';
        if (type.includes('fern')) return '🌿';
        if (type.includes('flower') || type.includes('rose') || type.includes('lily')) return '🌺';
        if (type.includes('tree') || type.includes('fig')) return '🌳';
        if (type.includes('palm')) return '🌴';
        return '🪴';
    };

    return (
        <div
            onClick={onClick}
            className="glass-panel"
            style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: 'white',
                borderRadius: '20px',
                border: status.status === 'due' ? '1px solid var(--color-warning)' : '1px solid rgba(0,0,0,0.03)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            {/* Left Side: Illustration & Face */}
            <div style={{
                width: '70px',
                height: '70px',
                backgroundColor: '#F8F9FA',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                flexShrink: 0
            }}>
                <span style={{ fontSize: '2.5rem' }}>{getIllustration()}</span>
                <span style={{
                    position: 'absolute',
                    bottom: '-5px',
                    right: '-5px',
                    fontSize: '1.2rem',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                    {getFace()}
                </span>
                {showScarf && (
                    <span style={{ position: 'absolute', top: '-5px', left: '-5px', fontSize: '1.2rem' }}>🧣</span>
                )}
            </div>

            {/* Right Side: Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {plant.name}
                    </h3>
                    <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: status.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {status.status === 'ok' ? 'Healthy' : status.status === 'due' ? 'Thirsty' : 'Overdue'}
                    </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {plant.species || 'Unknown Species'} • {plant.room || 'Outdoor'}
                </p>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: '#EDF2F7', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: status.status === 'overdue' ? '100%' : status.status === 'due' ? '85%' : '40%',
                        backgroundColor: status.color,
                        transition: 'width 0.5s ease'
                    }} />
                </div>
            </div>

            {/* Chevron */}
            <div style={{ opacity: 0.2, fontSize: '1.2rem' }}>›</div>
        </div>
    );
}

