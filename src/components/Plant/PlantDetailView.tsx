"use client";

import React, { useState } from 'react';
import { Plant } from '@/types/plant';
import { useGarden } from '@/context/GardenContext';
import ShareCardModal from './ShareCardModal';
import confetti from 'canvas-confetti';
import { ProductiveService } from '@/services/productiveService';

interface PlantDetailViewProps {
    plant: Plant;
    onClose: () => void;
}

export default function PlantDetailView({ plant, onClose }: PlantDetailViewProps) {
    const { awardXP, addJournalEntry, updatePlant, calculateWateringStatus, getCompanionStatus } = useGarden();
    const [showShare, setShowShare] = useState(false);
    const [isLogging, setIsLogging] = useState(false);
    const [isHarvesting, setIsHarvesting] = useState(false);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [note, setNote] = useState('');
    const [harvestAmount, setHarvestAmount] = useState('');
    const [harvestUnit, setHarvestUnit] = useState('g');

    const status = calculateWateringStatus(plant);
    const isThirsty = status.status !== 'ok';
    const isHospital = plant.status === 'hospital';

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

    // Phase 8: Personalities
    const personalities = ['Drama Queen 💅', 'Sun Seeker ☀️', 'Quiet Observer 😶', 'Social Butterfly 🦋', 'Night Owl 🦉'];
    const personality = personalities[plant.id.charCodeAt(0) % personalities.length];

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

    const handleFirstAid = () => {
        const updated = {
            ...plant,
            status: 'healthy' as const,
            lastWateredDate: new Date().toISOString()
        };
        updatePlant(updated);
        awardXP(plant.id, 50);
        addJournalEntry(plant.id, {
            id: Math.random().toString(36).substring(2, 11),
            date: new Date().toISOString(),
            note: "❤️‍🩹 First Aid administered! Recovered from the hospital.",
            type: 'milestone'
        });
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FF6B6B', '#48BB78', '#FFF']
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

    const handleHarvest = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(harvestAmount);
        if (isNaN(amount) || amount <= 0) return;

        addJournalEntry(plant.id, {
            id: Math.random().toString(36).substring(2, 11),
            date: new Date().toISOString(),
            note: `🧺 Harvested ${amount}${harvestUnit}!`,
            type: 'harvest',
            harvestAmount: amount,
            harvestUnit: harvestUnit
        });

        awardXP(plant.id, 100);
        setHarvestAmount('');
        setIsHarvesting(false);
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#F6E05E', '#48BB78', '#FFF']
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: isHospital ? '#FFF5F5' : (isThirsty ? '#FFF5F5' : '#F0FFF4'),
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
                {/* Stage & Personality Badges */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{
                        backgroundColor: stage.color,
                        color: 'white',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        {stage.name}
                    </div>
                    <div style={{
                        backgroundColor: 'white',
                        color: '#4A5568',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                        {personality}
                    </div>
                    {plant.difficulty && (
                        <div style={{
                            backgroundColor: plant.difficulty === 'Easy' ? '#C6F6D5' : plant.difficulty === 'Medium' ? '#FEEBC8' : '#FED7D7',
                            color: plant.difficulty === 'Easy' ? '#22543D' : plant.difficulty === 'Medium' ? '#744210' : '#822727',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            {plant.difficulty}
                        </div>
                    )}
                    {plant.isPerennial !== undefined && (
                        <div style={{
                            backgroundColor: '#EBF8FF',
                            color: '#2A4365',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            {plant.isPerennial ? 'Perennial ♾️' : 'Annual 🗓️'}
                        </div>
                    )}
                </div>

                {/* Big Avatar */}
                <div style={{
                    fontSize: '8rem',
                    marginBottom: '1rem',
                    filter: (isThirsty || isHospital) ? 'grayscale(0.5) contrast(0.8)' : 'none',
                    transition: 'all 0.5s ease',
                    transform: (isThirsty || isHospital) ? 'scale(0.9)' : 'scale(1.1)',
                    animation: isHospital ? 'pulse 2s infinite' : 'none'
                }}>
                    {isHospital ? '🥀' : stage.icon}
                </div>

                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#2D3748' }}>
                    {plant.nickname || plant.name}
                </h1>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#718096', margin: 0 }}>
                    Level {plant.level} • {plant.rarity || 'Common'}
                </p>

                {/* Productive Wisdom Section */}
                {ProductiveService.getPlantData(plant.species) && (
                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        borderRadius: '24px',
                        textAlign: 'left',
                        width: '90%',
                        maxWidth: '400px',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#2D3748', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>💡</span> COMPANION ANALYSIS
                        </h3>

                        {/* Real-time Companion Status */}
                        <div style={{ marginBottom: '1rem' }}>
                            {getCompanionStatus(plant).friends.length > 0 ? (
                                <div style={{ backgroundColor: '#F0FFF4', padding: '0.5rem', borderRadius: '12px', border: '1px solid #C6F6D5', marginBottom: '0.5rem' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#2F855A' }}>👯 ACTIVE BOOSTS</div>
                                    <div style={{ fontSize: '0.8rem', color: '#276749' }}>
                                        Benefiting from: {getCompanionStatus(plant).friends.join(', ')}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.5rem' }}>
                                    No active companion boosts in this room.
                                </div>
                            )}

                            {getCompanionStatus(plant).foes.length > 0 && (
                                <div style={{ backgroundColor: '#FFF5F5', padding: '0.5rem', borderRadius: '12px', border: '1px solid #FED7D7' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#C53030' }}>⚠️ ACTIVE CONFLICTS</div>
                                    <div style={{ fontSize: '0.8rem', color: '#9B2C2C' }}>
                                        Stressed by: {getCompanionStatus(plant).foes.join(', ')}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.05)', margin: '1rem 0' }} />

                        <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#718096', marginBottom: '0.5rem' }}>GENERAL WISDOM</h4>
                        <p style={{ fontSize: '0.85rem', color: '#4A5568', margin: '0 0 1rem 0', fontStyle: 'italic' }}>
                            "{ProductiveService.getPlantData(plant.species)?.funFact}"
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#2F855A', fontWeight: 700 }}>
                                👯 Best Friends: {ProductiveService.getPlantData(plant.species)?.companions.join(', ')}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#C53030', fontWeight: 700 }}>
                                🚫 Avoid: {ProductiveService.getPlantData(plant.species)?.foes.join(', ')}
                            </div>
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.05)', margin: '1rem 0' }} />

                        {/* Pest Patrol Section */}
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#2D3748', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🐛</span> PEST PATROL
                        </h3>
                        {isDiagnosing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'fade-in 0.3s' }}>
                                {ProductiveService.getPlantData(plant.species)?.commonPests?.map((pest, idx) => (
                                    <div key={idx} style={{ padding: '0.75rem', backgroundColor: '#FFF5F5', borderRadius: '12px', border: '1px solid #FED7D7' }}>
                                        <div style={{ fontWeight: 900, fontSize: '0.85rem', color: '#C53030' }}>{pest.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9B2C2C', margin: '0.25rem 0' }}><strong>Symptoms:</strong> {pest.symptoms}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#2F855A', fontWeight: 700 }}><strong>Organic Treatment:</strong> {pest.treatment}</div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setIsDiagnosing(false)}
                                    style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: 'white', fontSize: '0.75rem', fontWeight: 800 }}
                                >
                                    Close Diagnostic
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>
                                    {ProductiveService.getPlantData(plant.species)?.commonPests?.length || 0} known threats
                                </span>
                                <button
                                    onClick={() => setIsDiagnosing(true)}
                                    style={{
                                        backgroundColor: '#FED7D7',
                                        color: '#C53030',
                                        border: 'none',
                                        padding: '4px 12px',
                                        borderRadius: '10px',
                                        fontSize: '0.75rem',
                                        fontWeight: 900,
                                        cursor: 'pointer'
                                    }}
                                >
                                    REPORT ISSUE
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {isHospital && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#FED7D7',
                        color: '#C53030',
                        borderRadius: '15px',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                    }}>
                        ❤️‍🩹 Currently in the Hospital Wing
                    </div>
                )}

                {/* Growth Path Visualization */}
                {!isHospital && (
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
                )}
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
                {isHospital ? (
                    <button
                        onClick={handleFirstAid}
                        style={{
                            backgroundColor: '#E53E3E',
                            color: 'white',
                            padding: '1.8rem',
                            borderRadius: '24px',
                            border: 'none',
                            fontWeight: 900,
                            fontSize: '1.2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 8px 25px rgba(229, 62, 62, 0.3)',
                            animation: 'bounce 2s infinite'
                        }}
                    >
                        <span style={{ fontSize: '2rem' }}>❤️‍🩹</span>
                        ADMINISTER FIRST AID
                    </button>
                ) : isLogging ? (
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
                ) : isHarvesting ? (
                    <form onSubmit={handleHarvest} style={{ display: 'flex', gap: '0.5rem', animation: 'fade-in 0.3s' }}>
                        <input
                            autoFocus
                            type="number"
                            value={harvestAmount}
                            onChange={(e) => setHarvestAmount(e.target.value)}
                            placeholder="Amount"
                            style={{ flex: 1, padding: '1.2rem', borderRadius: '20px', border: '2px solid #E2E8F0', fontSize: '1rem', outline: 'none' }}
                        />
                        <select
                            value={harvestUnit}
                            onChange={(e) => setHarvestUnit(e.target.value)}
                            style={{ padding: '1rem', borderRadius: '20px', border: '2px solid #E2E8F0', fontSize: '1rem', outline: 'none', backgroundColor: 'white' }}
                        >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="units">units</option>
                        </select>
                        <button type="submit" style={{ backgroundColor: '#F6E05E', color: '#744210', padding: '0 1.5rem', borderRadius: '20px', border: 'none', fontWeight: 800 }}>
                            Harvest
                        </button>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

                        {ProductiveService.getPlantData(plant.species) && (
                            <button
                                onClick={() => setIsHarvesting(true)}
                                style={{
                                    backgroundColor: '#F6E05E',
                                    color: '#744210',
                                    padding: '1.5rem',
                                    borderRadius: '24px',
                                    border: 'none',
                                    fontWeight: 900,
                                    fontSize: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    boxShadow: '0 4px 15px rgba(246, 224, 94, 0.3)'
                                }}
                            >
                                <span style={{ fontSize: '1.8rem' }}>🧺</span>
                                LOG HARVEST
                            </button>
                        )}
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
