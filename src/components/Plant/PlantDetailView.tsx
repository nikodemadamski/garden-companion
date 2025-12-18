"use client";

import React, { useState } from 'react';
import { Plant } from '@/types/plant';
import { useGarden } from '@/context/GardenContext';
import ShareCardModal from './ShareCardModal';
import confetti from 'canvas-confetti';
import { ProductiveService } from '@/services/productiveService';

import BottomSheet from '../UI/BottomSheet';

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

    const { addSeed } = useGarden();

    const handleSaveSeeds = () => {
        const newSeed = {
            id: Math.random().toString(36).substring(2, 11),
            species: plant.species,
            quantity: 10,
            unit: 'seeds' as const,
            dateAdded: new Date().toISOString(),
            viability: 95,
            notes: `Saved from ${plant.nickname || plant.name} (Level ${plant.level})`
        };
        addSeed(newSeed);
        awardXP(plant.id, 150);
        addJournalEntry(plant.id, {
            id: Math.random().toString(36).substring(2, 11),
            date: new Date().toISOString(),
            note: "🧬 Saved seeds for the vault! The legacy continues.",
            type: 'milestone'
        });
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#3182CE', '#F6E05E', '#FFF']
        });
        alert(`(◕‿◕) 10 seeds of ${plant.species} added to your Seed Vault!`);
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
            fontFamily: 'system-ui, -apple-system, sans-serif',
            overflowY: 'auto'
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
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem 2rem',
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

            {/* Wisdom Bento Zone */}
            <section style={{ padding: '0 2rem 2rem' }}>
                <div className="bento-grid">
                    {/* Companion Analysis */}
                    <div className="bento-card span-2" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: '#2D3748', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>💡</span> COMPANIONS
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {getCompanionStatus(plant).friends.length > 0 && (
                                <div style={{ fontSize: '0.75rem', color: '#2F855A', fontWeight: 700 }}>
                                    👯 BOOSTS: {getCompanionStatus(plant).friends.join(', ')}
                                </div>
                            )}
                            {getCompanionStatus(plant).foes.length > 0 && (
                                <div style={{ fontSize: '0.75rem', color: '#C53030', fontWeight: 700 }}>
                                    ⚠️ CONFLICTS: {getCompanionStatus(plant).foes.join(', ')}
                                </div>
                            )}
                            <div style={{ fontSize: '0.7rem', color: '#718096', fontStyle: 'italic' }}>
                                "{ProductiveService.getPlantData(plant.species)?.funFact}"
                            </div>
                        </div>
                    </div>

                    {/* Pest Patrol Trigger */}
                    <div className="bento-card"
                        onClick={() => setIsDiagnosing(true)}
                        style={{ backgroundColor: '#FED7D7', cursor: 'pointer', justifyContent: 'center', alignItems: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>🐛</span>
                        <div style={{ fontWeight: 900, fontSize: '0.7rem', color: '#C53030', marginTop: '0.5rem' }}>PEST PATROL</div>
                    </div>

                    {/* Share Card Trigger */}
                    <div className="bento-card"
                        onClick={() => setShowShare(true)}
                        style={{ backgroundColor: '#EBF8FF', cursor: 'pointer', justifyContent: 'center', alignItems: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>🔗</span>
                        <div style={{ fontWeight: 900, fontSize: '0.7rem', color: '#2B6CB0', marginTop: '0.5rem' }}>PASSPORT</div>
                    </div>
                </div>
            </section>

            {/* Action Zone: Floating Bar Style */}
            <section style={{
                marginTop: 'auto',
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
                            backgroundColor: '#E53E3E', color: 'white', padding: '1.5rem', borderRadius: '24px', border: 'none',
                            fontWeight: 900, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                            boxShadow: '0 8px 25px rgba(229, 62, 62, 0.3)'
                        }}
                    >
                        <span>❤️‍🩹</span> ADMINISTER FIRST AID
                    </button>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button
                                onClick={handleWater}
                                style={{
                                    backgroundColor: isThirsty ? '#3182CE' : '#E2E8F0',
                                    color: isThirsty ? 'white' : '#718096',
                                    padding: '1.2rem', borderRadius: '24px', border: 'none',
                                    fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                <span>💧</span> {isThirsty ? 'WATER' : 'HYDRATED'}
                            </button>
                            <button
                                onClick={() => setIsLogging(true)}
                                style={{
                                    backgroundColor: '#48BB78', color: 'white',
                                    padding: '1.2rem', borderRadius: '24px', border: 'none',
                                    fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                <span>📝</span> LOG
                            </button>
                        </div>

                        {ProductiveService.getPlantData(plant.species) && (
                            <button
                                onClick={() => setIsHarvesting(true)}
                                style={{
                                    backgroundColor: '#F6E05E', color: '#744210',
                                    padding: '1.5rem', borderRadius: '24px', border: 'none',
                                    fontWeight: 900, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                                    boxShadow: '0 4px 15px rgba(246, 224, 94, 0.3)'
                                }}
                            >
                                <span>🧺</span> LOG HARVEST
                            </button>
                        )}

                        {plant.level >= 10 && ProductiveService.getPlantData(plant.species) && (
                            <button
                                onClick={handleSaveSeeds}
                                style={{
                                    backgroundColor: '#EBF8FF', color: '#2B6CB0',
                                    padding: '1rem', borderRadius: '24px', border: '2px dashed #3182CE',
                                    fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                <span>🧬</span> SAVE SEEDS
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* Bottom Sheets */}

            {/* 1. Log Memory Sheet */}
            <BottomSheet isOpen={isLogging} onClose={() => setIsLogging(false)} title="Log a Memory 📝">
                <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <textarea
                        autoFocus
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What happened today? (e.g., First flower spotted!)"
                        style={{
                            width: '100%', padding: '1.5rem', borderRadius: '20px', border: '2px solid #F1F5F9',
                            fontSize: '1.1rem', outline: 'none', minHeight: '150px', backgroundColor: '#F8FAFC'
                        }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '1.2rem', fontSize: '1.1rem' }}>
                        SAVE MEMORY
                    </button>
                </form>
            </BottomSheet>

            {/* 2. Log Harvest Sheet */}
            <BottomSheet isOpen={isHarvesting} onClose={() => setIsHarvesting(false)} title="Log Harvest 🧺">
                <form onSubmit={handleHarvest} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            autoFocus
                            type="number"
                            value={harvestAmount}
                            onChange={(e) => setHarvestAmount(e.target.value)}
                            placeholder="Amount"
                            style={{ flex: 2, padding: '1.2rem', borderRadius: '20px', border: '2px solid #F1F5F9', fontSize: '1.2rem', outline: 'none', backgroundColor: '#F8FAFC' }}
                        />
                        <select
                            value={harvestUnit}
                            onChange={(e) => setHarvestUnit(e.target.value)}
                            style={{ flex: 1, padding: '1.2rem', borderRadius: '20px', border: '2px solid #F1F5F9', fontSize: '1.1rem', outline: 'none', backgroundColor: 'white' }}
                        >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="units">units</option>
                        </select>
                    </div>
                    <button type="submit" className="btn" style={{ backgroundColor: '#F6E05E', color: '#744210', padding: '1.2rem', fontSize: '1.1rem', fontWeight: 900 }}>
                        CONFIRM HARVEST
                    </button>
                </form>
            </BottomSheet>

            {/* 3. Pest Patrol Sheet */}
            <BottomSheet isOpen={isDiagnosing} onClose={() => setIsDiagnosing(false)} title="Pest Patrol 🐛">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {ProductiveService.getPlantData(plant.species)?.commonPests?.map((pest, idx) => (
                        <div key={idx} className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#FFF5F5', border: '1px solid #FED7D7' }}>
                            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#C53030', marginBottom: '0.5rem' }}>{pest.name}</div>
                            <div style={{ fontSize: '0.9rem', color: '#9B2C2C', marginBottom: '1rem' }}><strong>Symptoms:</strong> {pest.symptoms}</div>
                            <div style={{
                                padding: '1rem', backgroundColor: 'white', borderRadius: '12px',
                                fontSize: '0.85rem', color: '#2F855A', fontWeight: 700, border: '1px solid #C6F6D5'
                            }}>
                                🌿 ORGANIC TREATMENT: {pest.treatment}
                            </div>
                        </div>
                    ))}
                    <button onClick={() => setIsDiagnosing(false)} className="btn" style={{ marginTop: '1rem', border: '1px solid #E2E8F0' }}>
                        CLOSE PATROL
                    </button>
                </div>
            </BottomSheet>

            {showShare && (
                <ShareCardModal
                    plant={plant}
                    onClose={() => setShowShare(false)}
                />
            )}
        </div>
    );
}
