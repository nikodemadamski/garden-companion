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

    // Kawaii Chibi Faces
    const getChibiFace = () => {
        if (status.status === 'overdue') return ' ( >_< ) '; // Distressed
        if (status.status === 'due') return ' ( o_o ) '; // Thirsty
        if (status.adjustmentReason === 'rain') return ' ( ^_^ ) '; // Happy/Rain
        if (status.adjustmentReason === 'heat') return ' ( ;-_-) '; // Sweating

        const happyFaces = [' ( ^.^) ', ' (◕‿◕) ', ' (๑>ᴗ<๑) ', ' (✿◠‿◠) '];
        const index = plant.id.charCodeAt(0) % happyFaces.length;
        return happyFaces[index];
    };

    const getIllustration = () => {
        const type = plant.species?.toLowerCase() || '';
        if (type.includes('cactus') || type.includes('succulent')) return '🌵';
        if (type.includes('fern')) return '🌿';
        if (type.includes('flower') || type.includes('rose')) return '🌸';
        if (type.includes('tree')) return '🌳';
        return '🌱';
    };

    return (
        <div
            onClick={onClick}
            className="glass-panel animate-slide-up"
            style={{
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                cursor: 'pointer',
                backgroundColor: 'white',
                borderRadius: '24px',
                border: status.status === 'due' ? '2px solid #FFCC00' : '1px solid rgba(0,0,0,0.03)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Chibi Avatar Container */}
            <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: status.status === 'due' ? '#FFF9E6' : '#F0FFF4',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '2px solid rgba(0,0,0,0.02)'
            }}>
                <span style={{ fontSize: '2.2rem', marginBottom: '-5px' }}>{getIllustration()}</span>
                <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    color: 'var(--color-primary-dark)',
                    fontFamily: 'monospace',
                    backgroundColor: 'white',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginTop: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    {getChibiFace()}
                </span>
            </div>

            {/* Info Section - Simplified */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        margin: 0,
                        color: '#2D3748',
                        letterSpacing: '-0.01em'
                    }}>
                        {plant.nickname || plant.name}
                    </h3>
                    <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '6px'
                    }}>
                        LVL {plant.level}
                    </span>
                </div>
                <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-light)',
                    margin: '0 0 0.5rem 0',
                    fontWeight: 600
                }}>
                    {plant.room || 'Outdoor'} • {status.label.split('in')[1] || 'Healthy'}
                </p>

                {/* XP Progress Bar */}
                <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#EDF2F7',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '0.5rem'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${(plant.xp / (plant.level * 100)) * 100}%`,
                        backgroundColor: '#5856D6',
                        borderRadius: '10px',
                        transition: 'width 0.5s ease'
                    }} />
                </div>

                {/* Watering Progress Bar */}
                <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#EDF2F7',
                    borderRadius: '10px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: status.status === 'overdue' ? '100%' : status.status === 'due' ? '90%' : '30%',
                        backgroundColor: status.color,
                        borderRadius: '10px',
                        transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }} />
                </div>
            </div>

            {/* Anime-style Status Tag */}
            {status.status !== 'ok' && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: status.color,
                    color: 'white',
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {status.status}
                </div>
            )}
        </div>
    );
}
