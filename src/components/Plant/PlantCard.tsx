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
        if (status.status === 'overdue') return '😵'; // Dead/Dying
        if (status.status === 'due') return '😫'; // Thirsty/Sad
        if (status.adjustmentReason === 'heat') return '🥵'; // Hot
        if (status.adjustmentReason === 'cold') return '🥶'; // Cold
        if (status.adjustmentReason === 'rain') return '😌'; // Relaxed

        // Random happy faces for variety
        const happyFaces = ['🙂', '😊', '😄', '😌'];
        // Use plant ID to consistently pick the same face for the same plant
        const index = plant.id.charCodeAt(0) % happyFaces.length;
        return happyFaces[index];
    };

    // Scarf Logic (P3)
    const showScarf = weather && weather.temperature < 10 && plant.type === 'outdoor';

    // Dynamic SVG Illustration based on category
    const getIllustration = () => {
        const type = plant.species.toLowerCase();
        if (type.includes('cactus') || type.includes('succulent')) return '🌵';
        if (type.includes('fern')) return '🌿';
        if (type.includes('flower') || type.includes('rose') || type.includes('lily')) return '🌺';
        if (type.includes('tree') || type.includes('fig')) return '🌳';
        if (type.includes('palm')) return '🌴';
        return '🪴';
    };

    // Animation Class
    const getAnimationClass = () => {
        if (status.status === 'due') return 'animate-pulse'; // Thirsty plants pulse/droop
        if (status.status === 'ok') return 'hover:animate-bounce'; // Happy plants bounce on hover
        return '';
    };

    return (
        <div
            onClick={onClick}
            className="glass-panel"
            style={{
                position: 'relative',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: 'white',
                transform: status.status === 'due' ? 'rotate(-1deg)' : 'none', // Slight tilt if thirsty
                border: status.status === 'due' ? '2px solid #FBD38D' : '2px solid transparent'
            }}
            onMouseEnter={(e) => {
                if (status.status === 'ok') e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = status.status === 'due' ? 'rotate(-1deg)' : 'translateY(0) scale(1)';
            }}
        >
            {/* Status Badge (Bubble) */}
            {(status.status !== 'ok' || status.adjustmentReason) && (
                <div className="animate-fade-in" style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    backgroundColor: status.color,
                    color: 'white',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    animation: status.status === 'due' ? 'bounce 1s infinite' : 'none'
                }}>
                    {status.status === 'due' ? 'Thirsty!' :
                        status.status === 'overdue' ? 'Help!' :
                            status.adjustmentReason === 'rain' ? 'Drinking!' :
                                status.adjustmentReason === 'heat' ? 'Hot!' : 'Cold!'}
                </div>
            )}

            {/* Top Half: Illustration & Face */}
            <div className={getAnimationClass()} style={{
                height: '140px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                position: 'relative'
            }}>
                <div style={{ fontSize: '6rem', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }}>
                    {getIllustration()}
                </div>

                {/* The Pot Face */}
                <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    fontSize: '2.5rem',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 2
                }}>
                    {getFace()}
                </div>

                {/* Scarf Accessory */}
                {showScarf && (
                    <div style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '30%',
                        fontSize: '2rem',
                        zIndex: 3,
                        transform: 'rotate(-10deg)'
                    }}>
                        🧣
                    </div>
                )}
            </div>

            {/* Bottom Half: Info */}
            <div style={{ textAlign: 'center', width: '100%' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                    {plant.name}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '1rem' }}>
                    {plant.species}
                </p>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '4px', backgroundColor: '#EDF2F7', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: status.status === 'overdue' ? '100%' : status.status === 'due' ? '90%' : '50%', // Simplified progress logic
                        backgroundColor: status.color,
                        transition: 'width 0.5s ease'
                    }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#CBD5E0', marginTop: '0.5rem', textAlign: 'right' }}>
                    {status.label}
                </p>
            </div>
        </div>
    );
}
