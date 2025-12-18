"use client";

import React, { useState } from 'react';
import { Plant, JournalEntry } from '@/types/plant';
import { useGarden } from '@/context/GardenContext';
import ShareCardModal from './ShareCardModal';

interface PlantDetailViewProps {
    plant: Plant;
    onClose: () => void;
}

export default function PlantDetailView({ plant, onClose }: PlantDetailViewProps) {
    const { awardXP, addJournalEntry, weather } = useGarden();
    const [note, setNote] = useState('');
    const [showShare, setShowShare] = useState(false);

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim()) return;

        const entry: JournalEntry = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            note: note,
            type: 'note'
        };

        addJournalEntry(plant.id, entry);
        awardXP(plant.id, 10);
        setNote('');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'white',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            animation: 'slide-up 0.3s ease-out'
        }}>
            {/* Header / Hero */}
            <section style={{
                height: '40vh',
                background: 'linear-gradient(to bottom, #F0FFF4, #FFFFFF)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        left: '1.5rem',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    ✕
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>
                        {plant.level >= 5 ? `👑🌱✨` : '🌱'}
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>{plant.nickname || plant.name}</h1>
                    <p style={{ fontSize: '1rem', color: 'var(--color-text-light)', fontWeight: 700 }}>{plant.species}</p>

                    {plant.rarity && (
                        <span style={{
                            backgroundColor: plant.rarity === 'Legendary' ? '#FFD700' : plant.rarity === 'Rare' ? '#5856D6' : '#E2E8F0',
                            color: plant.rarity === 'Common' ? '#64748B' : 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            marginTop: '0.5rem',
                            display: 'inline-block'
                        }}>
                            {plant.rarity}
                        </span>
                    )}
                </div>
            </section>

            {/* Stats Grid */}
            <section style={{ padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '-2rem' }}>
                <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', borderRadius: '24px', backgroundColor: 'white', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>LEVEL</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>{plant.level}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', borderRadius: '24px', backgroundColor: 'white', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>XP</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#5856D6' }}>{plant.xp}</div>
                </div>
                <button
                    onClick={() => setShowShare(true)}
                    className="glass-panel"
                    style={{ padding: '1rem', textAlign: 'center', borderRadius: '24px', backgroundColor: 'white', boxShadow: '0 8px 20px rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer' }}
                >
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>SHARE</div>
                    <div style={{ fontSize: '1.2rem' }}>🔗</div>
                </button>
            </section>

            {/* Growth Timeline */}
            <section style={{ padding: '2rem 1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Growth Timeline</h2>

                {/* Add Entry Form */}
                <form onSubmit={handleAddEntry} style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem' }}>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Log a memory... (e.g. 'New leaf today!')"
                        style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '0.9rem', outline: 'none' }}
                    />
                    <button type="submit" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 800 }}>
                        Log
                    </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '2px', backgroundColor: '#F1F5F9' }} />

                    {/* Birth Entry */}
                    <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✨</div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-light)' }}>
                                {new Date(plant.dateAdded).toLocaleDateString()}
                            </div>
                            <div style={{ fontWeight: 700 }}>Joined the Garden</div>
                        </div>
                    </div>

                    {/* Journal Entries */}
                    {plant.journal?.slice().reverse().map((entry, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>📝</div>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-light)' }}>
                                    {new Date(entry.date).toLocaleDateString()}
                                </div>
                                <div style={{ fontWeight: 600, color: '#2D3748' }}>{entry.note}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Irish Care Tip */}
            <section style={{ padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', background: 'linear-gradient(135deg, #5856D6 0%, #34C759 100%)', color: 'white' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>🇮🇪 Irish Care Tip</h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, margin: 0, lineHeight: '1.5' }}>
                        {weather?.temperature && weather.temperature < 10
                            ? "It's a cold day in Ireland! Keep this friend away from drafty windows and reduce watering until it warms up."
                            : "The Irish light is perfect today. Ensure this plant gets its daily dose of bright, indirect light."}
                    </p>
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
