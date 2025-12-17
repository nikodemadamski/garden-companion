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
    const { calculateWateringStatus } = useGarden();
    const status = calculateWateringStatus(plant, history);

    // Tamagotchi Logic: Determine Face
    const getFace = () => {
        if (status.status === 'overdue') return '😵'; // Dead/Dying
        if (status.status === 'due') return '😮'; // Thirsty
        if (status.adjustmentReason === 'heat') return '🥵'; // Hot
        if (status.adjustmentReason === 'cold') return '🥶'; // Cold
        if (status.adjustmentReason === 'rain') return '😌'; // Relaxed
        return '🙂'; // Happy
    };

    // Dynamic SVG Illustration based on category (simplified for now with emojis/colors)
    // In a real app, these would be high-quality SVGs
    const getIllustration = () => {
        const type = plant.species.toLowerCase();
        if (type.includes('cactus') || type.includes('succulent')) return '🌵';
        if (type.includes('fern')) return '🌿';
        if (type.includes('flower') || type.includes('rose')) return '🌹';
        if (type.includes('tree') || type.includes('fig')) return '🌳';
        return '🪴';
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
                transition: 'transform 0.2s',
                backgroundColor: 'white'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
                    zIndex: 10
                }}>
                    {status.status === 'due' ? 'Thirsty!' :
                        status.status === 'overdue' ? 'Help!' :
                            status.adjustmentReason === 'rain' ? 'Drinking!' :
                                status.adjustmentReason === 'heat' ? 'Hot!' : 'Cold!'}
                </div>
            )}

            {/* Top Half: Illustration & Face */}
            <div style={{
                height: '120px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                position: 'relative'
            }}>
                <div style={{ fontSize: '5rem' }}>{getIllustration()}</div>
                {/* The Pot Face */}
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    fontSize: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                    {getFace()}
                </div>
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
