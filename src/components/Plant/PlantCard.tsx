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

    // Kawaii Chibi Faces + Evolution Accessories
    const getChibiFace = () => {
        let face = '';
        if (status.status === 'overdue') face = ' ( >_< ) ';
        else if (status.status === 'due') face = ' ( o_o ) ';
        else if (status.adjustmentReason === 'rain') face = ' ( ^_^ ) ';
        else if (status.adjustmentReason === 'heat') face = ' ( ;-_-) ';
        else {
            const happyFaces = [' ( ^.^) ', ' (◕‿◕) ', ' (๑>ᴗ<๑) ', ' (✿◠‿◠) '];
            face = happyFaces[plant.id.charCodeAt(0) % happyFaces.length];
        }

        // Evolution: Add Crown for Level 5+
        if (plant.level >= 5) {
            return `👑${face}✨`;
        }
        return face;
    };

    const getIllustration = () => {
        const type = plant.species?.toLowerCase() || '';
        if (type.includes('cactus') || type.includes('succulent')) return '🌵';
        if (type.includes('fern')) return '🌿';
        if (type.includes('flower') || type.includes('rose')) return '🌸';
        if (type.includes('tree')) return '🌳';
        return '🌱';
    };

    const isHospital = plant.status === 'hospital';

    return (
        <div
            onClick={onClick}
            className={`plant-card ${isHospital ? 'hospital-mode' : ''}`}
            style={{
                backgroundColor: isHospital ? '#FFF5F5' : 'white',
                borderRadius: '24px',
                padding: '1.2rem',
                boxShadow: isHospital ? '0 8px 20px rgba(229, 62, 62, 0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                border: isHospital ? '2px solid #FEB2B2' : '1px solid #EDF2F7',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {isHospital && (
                <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    backgroundColor: '#E53E3E',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    zIndex: 2
                }}>
                    HOSPITAL ❤️‍🩹
                </div>
            )}

            {/* Plant Image / Avatar */}
            <div style={{
                height: '140px',
                backgroundColor: isHospital ? '#FED7D7' : '#F7FAFC',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                position: 'relative'
            }}>
                {isHospital ? '🥀' : (plant.level >= 10 ? '🌳' : plant.level >= 5 ? '🌿' : '🌱')}

                {/* Status Badge */}
                <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    right: '10px',
                    backgroundColor: status.color,
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    {status.label}
                </div>
            </div>

            {/* Info Section - Simplified */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            margin: 0,
                            color: '#2D3748',
                            letterSpacing: '-0.01em'
                        }}>
                            {plant.nickname || plant.name}
                        </h3>
                        {plant.rarity && (
                            <span style={{
                                fontSize: '0.6rem',
                                fontWeight: 900,
                                backgroundColor: plant.rarity === 'Legendary' ? '#FFD700' : plant.rarity === 'Rare' ? '#5856D6' : '#E2E8F0',
                                color: plant.rarity === 'Common' ? '#64748B' : 'white',
                                padding: '1px 4px',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                            }}>
                                {plant.rarity}
                            </span>
                        )}
                    </div>
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
