"use client";

import React, { useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import { PLANT_CATEGORIES } from '@/data/plantCategories';
import { Plant } from '@/types/plant';

export default function ExploreView() {
    const { addPlant, currentGarden } = useGarden();
    const [isPulling, setIsPulling] = useState(false);
    const [discoveredPlant, setDiscoveredPlant] = useState<any>(null);

    const rarePlants = [
        { name: 'Pink Princess Philodendron', rarity: 'Legendary', icon: '💖', species: 'Philodendron Erubescens' },
        { name: 'Thai Constellation Monstera', rarity: 'Legendary', icon: '✨', species: 'Monstera Deliciosa' },
        { name: 'Blue Oil Fern', rarity: 'Rare', icon: '🌀', species: 'Microsorum Thailandicum' },
        { name: 'Raven ZZ Plant', rarity: 'Rare', icon: '🐦', species: 'Zamioculcas Zamiifolia' },
        { name: 'Watermelon Peperomia', rarity: 'Common', icon: '🍉', species: 'Peperomia Argyreia' },
        { name: 'String of Hearts', rarity: 'Common', icon: '💕', species: 'Ceropegia Woodii' }
    ];

    const handlePull = () => {
        setIsPulling(true);
        setDiscoveredPlant(null);

        // Simulate "Gacha" spin
        setTimeout(() => {
            const random = rarePlants[Math.floor(Math.random() * rarePlants.length)];
            setDiscoveredPlant(random);
            setIsPulling(false);
        }, 1500);
    };

    const handleAdopt = () => {
        if (!discoveredPlant) return;

        const newPlant: Plant = {
            id: crypto.randomUUID(),
            name: discoveredPlant.name,
            species: discoveredPlant.species,
            room: 'Living Room',
            location: 'Indoor',
            type: currentGarden,
            waterFrequencyDays: 7,
            lastWateredDate: new Date().toISOString(),
            dateAdded: new Date().toISOString(),
            xp: 0,
            level: 1,
            rarity: discoveredPlant.rarity
        };

        addPlant(newPlant);
        setDiscoveredPlant(null);
        alert(`(◕‿◕) ${discoveredPlant.name} has joined your garden!`);
    };

    return (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>

            {/* Gacha-style Hero */}
            <section style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                borderRadius: '32px',
                padding: '2rem',
                color: 'white',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(255, 215, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>Daily Discovery</h2>
                    <p style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.9, marginBottom: '1.5rem' }}>
                        Pull a random rare plant! ✨
                    </p>
                    <button
                        onClick={handlePull}
                        disabled={isPulling}
                        style={{
                            backgroundColor: 'white',
                            color: '#FF8C00',
                            padding: '1rem 2rem',
                            borderRadius: '20px',
                            border: 'none',
                            fontWeight: 900,
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            cursor: isPulling ? 'default' : 'pointer',
                            transform: isPulling ? 'scale(0.95)' : 'none',
                            transition: 'all 0.2s ease'
                        }}>
                        {isPulling ? 'SPINNING...' : 'PULL NOW (Free)'}
                    </button>
                </div>
                <div style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-20px',
                    fontSize: '8rem',
                    opacity: 0.2,
                    animation: isPulling ? 'spin 1s linear infinite' : 'none'
                }}>🎁</div>
            </section>

            {/* Discovery Modal */}
            {discoveredPlant && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div className="glass-panel animate-pop-in" style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '32px',
                        textAlign: 'center',
                        maxWidth: '400px',
                        width: '100%'
                    }}>
                        <div style={{
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            color: discoveredPlant.rarity === 'Legendary' ? '#FFD700' : discoveredPlant.rarity === 'Rare' ? '#5856D6' : '#64748B',
                            marginBottom: '0.5rem'
                        }}>
                            {discoveredPlant.rarity.toUpperCase()} DISCOVERY!
                        </div>
                        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{discoveredPlant.icon}</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>{discoveredPlant.name}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
                            A beautiful {discoveredPlant.species} for your collection.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setDiscoveredPlant(null)}
                                style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', fontWeight: 700, background: 'none' }}
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleAdopt}
                                style={{ flex: 2, padding: '1rem', borderRadius: '16px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 800 }}
                            >
                                Adopt Friend!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories Grid */}
            <section>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Categories</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {PLANT_CATEGORIES.slice(0, 4).map(cat => (
                        <div key={cat.id} className="glass-panel" style={{
                            padding: '1.5rem',
                            borderRadius: '24px',
                            textAlign: 'center',
                            backgroundColor: 'white',
                            border: '1px solid #F1F5F9',
                            cursor: 'pointer'
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{cat.label.split('/')[0]}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Curated Collections */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>🔥 Trending in Dublin</h2>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>View All</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                    {['Monstera', 'Snake Plant', 'Spider Plant'].map((p, idx) => (
                        <div key={idx} className="glass-panel" style={{
                            minWidth: '160px',
                            padding: '1rem',
                            borderRadius: '24px',
                            backgroundColor: 'white',
                            border: '1px solid #F1F5F9'
                        }}>
                            <div style={{
                                width: '100%',
                                height: '120px',
                                backgroundColor: '#F8FAFC',
                                borderRadius: '16px',
                                marginBottom: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem'
                            }}>
                                🌱
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{p}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Common in Ireland</div>
                        </div>
                    ))}
                </div>
            </section>
            {/* Community Leaderboard */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>🏆 Top Gardeners (Ireland)</h2>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>View All</span>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', borderRadius: '24px', backgroundColor: 'white', border: '1px solid #F1F5F9' }}>
                    {[
                        { name: 'Aoife from Cork', score: 98, rank: 'Forest Guardian', avatar: '👩‍🌾' },
                        { name: 'Liam in Dublin', score: 92, rank: 'Master Gardener', avatar: '👨‍🌾' },
                        { name: 'You', score: 85, rank: 'Master Gardener', avatar: '👤', isUser: true },
                        { name: 'Siobhan (Galway)', score: 78, rank: 'Green Thumb', avatar: '👩‍🌾' }
                    ].map((user, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.75rem',
                            borderRadius: '16px',
                            backgroundColor: user.isUser ? '#F0FFF4' : 'transparent',
                            marginBottom: idx < 3 ? '0.5rem' : 0
                        }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, width: '24px', color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32' }}>
                                {idx + 1}
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                {user.avatar}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{user.name}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-light)' }}>{user.rank}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 900, color: 'var(--color-primary)' }}>{user.score}%</div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-light)' }}>HARMONY</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
