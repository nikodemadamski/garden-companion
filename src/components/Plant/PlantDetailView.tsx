"use client";

import React, { useState } from 'react';
import { Plant, JournalEntry } from '@/types/plant';
import { useGarden } from '@/context/GardenContext';
import ShareCardModal from './ShareCardModal';
import confetti from 'canvas-confetti';

interface PlantDetailViewProps {
    plant: Plant;
    onClose: () => void;
}

export default function PlantDetailView({ plant, onClose }: PlantDetailViewProps) {
    const { awardXP, addJournalEntry, updatePlant, calculateWateringStatus } = useGarden();
    const [showShare, setShowShare] = useState(false);
    const [isLogging, setIsLogging] = useState(false);
    const [note, setNote] = useState('');

    const status = calculateWateringStatus(plant);
    const isThirsty = status.status !== 'ok';

    // Lifecycle Logic
    const getGrowthStage = (level: number) => {
        if (level >= 20) return { name: 'Ancient Spirit', icon: '✨🌳✨', color: '#805AD5' };
        if (level >= 15) return { name: 'Mature Tree', icon: '🌳', color: '#2F855A' };
        if (level >= 10) return { name: 'Bushy Friend', icon: '🪴', color: '#38A169' };
        if (level >= 5) return { name: 'Sprout', icon: '🌿', color: '#48BB78' };
        return { name: 'Seedling', icon: '🌱', color: '#68D391' };
    };

    const stage = getGrowthStage(plant.level);
    const progressToNextStage = (plant.level % 5) * 20 + (plant.xp / (plant.level * 100) * 20);

    const handleWater = () => {
        const updated = { ...plant, lastWateredDate: new Date().toISOString() };
        updatePlant(updated);
        awardXP(plant.id, 20);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#3182CE', '#63B3ED', '#BEE3F8']
        });
    };

    const handleLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim()) return;
        addJournalEntry(plant.id, {
            id: Math.random().toString(36).substring(2, 11),
            date: new Date().toISOString(),
            note: note,
            type: 'note'
        });
        awardXP(plant.id, 10);
        setNote('');
        setIsLogging(false);
        confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#48BB78', '#F6E05E']
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: isThirsty ? '#FFF5F5' : '#F0FFF4',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute', top: '1.5rem', right: '1.5rem',
                    background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
                    width: '44px', height: '44px', fontSize: '1.2rem', zIndex: 10
                }}
            >✕</button>

            {/* Hero Section: The Plant's Soul */}
            <section style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
            }}>
                {/* Stage Badge */}
                <div style={{
                    backgroundColor: stage.color,
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    marginBottom: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    {stage.name}
                </div>

                {/* Big Avatar */}
                <div style={{
                    fontSize: '8rem',
                    marginBottom: '1rem',
                    filter: isThirsty ? 'grayscale(0.5) contrast(0.8)' : 'none',
                    transition: 'all 0.5s ease',
                    transform: isThirsty ? 'scale(0.9)' : 'scale(1.1)'
                }}>
                    {stage.icon}
                </div>

                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#2D3748' }}>
                    {plant.nickname || plant.name}
                </h1>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#718096', margin: 0 }}>
                    Level {plant.level} • {plant.rarity || 'Common'}
                </p>

                {/* Growth Path Visualization */}
                <div style={{ width: '80%', maxWidth: '300px', marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, color: '#A0AEC0', marginBottom: '0.5rem' }}>
                        <span>{stage.name}</span>
                        <span>NEXT STAGE</span>
                    </div>
                    <div style={{ height: '12px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${progressToNextStage}%`,
                            backgroundColor: stage.color,
                            transition: 'width 1s ease-out'
                        }} />
                    </div>
                </div>
            </section>

            {/* Action Zone: Big Buttons */}
            <section style={{
                padding: '2rem',
                backgroundColor: 'white',
                borderTopLeftRadius: '40px',
                borderTopRightRadius: '40px',
                boxShadow: '0 -20px 40px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {isLogging ? (
                    <form onSubmit={handleLog} style={{ display: 'flex', gap: '0.5rem', animation: 'fade-in 0.3s' }}>
                        <input
                            autoFocus
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="What happened today?"
                            style={{ flex: 1, padding: '1.2rem', borderRadius: '20px', border: '2px solid #E2E8F0', fontSize: '1rem', outline: 'none' }}
                        />
                        <button type="submit" style={{ backgroundColor: '#48BB78', color: 'white', padding: '0 1.5rem', borderRadius: '20px', border: 'none', fontWeight: 800 }}>
                            Save
                        </button>
                    </form>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={handleWater}
                            style={{
                                backgroundColor: isThirsty ? '#3182CE' : '#E2E8F0',
                                color: isThirsty ? 'white' : '#718096',
                                padding: '1.5rem',
                                borderRadius: '24px',
                                border: 'none',
                                fontWeight: 900,
                                fontSize: '1.1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>💧</span>
                            {isThirsty ? 'WATER NOW' : 'HYDRATED'}
                        </button>
                        <button
                            onClick={() => setIsLogging(true)}
                            style={{
                                backgroundColor: '#48BB78',
                                color: 'white',
                                padding: '1.5rem',
                                borderRadius: '24px',
                                border: 'none',
                                fontWeight: 900,
                                fontSize: '1.1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>📝</span>
                            LOG MEMORY
                        </button>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                        onClick={() => setShowShare(true)}
                        style={{
                            backgroundColor: '#F7FAFC',
                            color: '#4A5568',
                            padding: '1rem',
                            borderRadius: '20px',
                            border: '1px solid #E2E8F0',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                        }}
                    >
                        🔗 Share Passport
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: '#F7FAFC',
                            color: '#4A5568',
                            padding: '1rem',
                            borderRadius: '20px',
                            border: '1px solid #E2E8F0',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                        }}
                    >
                        👋 Say Goodbye
                    </button>
                </div>
            </section>

            {showShare && (
                <ShareCardModal
                    plant={plant}
                    onClose={() => setShowShare(false)}
                />
            )}
        </div>
    );
}
