"use client";

import React, { useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import { PLANT_CATEGORIES } from '@/data/plantCategories';
import { Plant } from '@/types/plant';
import { ProductiveService } from '@/services/productiveService';

export default function ExploreView() {
    const { addPlant, currentGarden } = useGarden();
    const [isPulling, setIsPulling] = useState(false);
    const [discoveredPlant, setDiscoveredPlant] = useState<any>(null);

    const rarePlants = [
        { name: 'Heirloom Tomato', rarity: 'Legendary', icon: '🍅', species: 'Tomato' },
        { name: 'Thai Basil', rarity: 'Rare', icon: '🌿', species: 'Basil' },
        { name: 'Alpine Strawberry', rarity: 'Legendary', icon: '🍓', species: 'Strawberry' },
        { name: 'Rainbow Carrot', rarity: 'Rare', icon: '🥕', species: 'Carrot' },
        { name: 'Chocolate Mint', rarity: 'Common', icon: '🌱', species: 'Mint' },
        { name: 'Giant Potato', rarity: 'Common', icon: '🥔', species: 'Potato' }
    ];
    const [pullsToday, setPullsToday] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('garden_pulls_today');
            const date = localStorage.getItem('garden_pull_date');
            const today = new Date().toDateString();
            if (date === today) return parseInt(saved || '0');
        }
        return 0;
    });

    const PULL_LIMIT = 3;

    const handlePull = () => {
        if (pullsToday >= PULL_LIMIT) {
            alert("You've used all your free pulls for today! Share your garden to get one more. ✨");
            return;
        }

        setIsPulling(true);
        setDiscoveredPlant(null);

        // Simulate "Gacha" spin
        setTimeout(() => {
            const random = rarePlants[Math.floor(Math.random() * rarePlants.length)];
            setDiscoveredPlant(random);
            setIsPulling(false);

            const newCount = pullsToday + 1;
            setPullsToday(newCount);
            if (typeof window !== 'undefined') {
                localStorage.setItem('garden_pulls_today', newCount.toString());
                localStorage.setItem('garden_pull_date', new Date().toDateString());
            }
        }, 1500);
    };

    const handleShareForPull = () => {
        // Mock sharing
        alert("Sharing your garden... 🔗");
        setTimeout(() => {
            setPullsToday(prev => Math.max(0, prev - 1));
            alert("Extra pull granted! (๑>ᴗ<๑)");
        }, 1000);
    };

    const handleAdopt = () => {
        if (!discoveredPlant) return;

        const productiveData = ProductiveService.getPlantData(discoveredPlant.species);

        const newPlant: Plant = {
            id: Math.random().toString(36).substring(2, 11),
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
            rarity: discoveredPlant.rarity,
            // Phase 9: Productive Data
            isPerennial: productiveData?.isPerennial,
            difficulty: productiveData?.difficulty,
            harvestDays: productiveData?.harvestDays
        };

        addPlant(newPlant);
        setDiscoveredPlant(null);
        alert(`(◕‿◕) ${discoveredPlant.name} has joined your productive garden!`);
    };

    return (
        <div className="animate-slide-up" style={{ paddingBottom: '5rem' }}>

            {/* 1. Gacha Hero: The Genetic Lottery (Span 2) */}
            <div className="bento-grid">
                <div className="bento-card span-2" style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '2rem'
                }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Daily Genetic Pull</h2>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.9, marginBottom: '1.5rem' }}>
                            {pullsToday >= PULL_LIMIT ? 'Limit reached! Come back tomorrow.' : `Discover a rare productive variety. (${PULL_LIMIT - pullsToday} left)`}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handlePull}
                                disabled={isPulling || pullsToday >= PULL_LIMIT}
                                style={{
                                    backgroundColor: pullsToday >= PULL_LIMIT ? 'rgba(255,255,255,0.3)' : 'white',
                                    color: pullsToday >= PULL_LIMIT ? 'white' : '#FF8C00',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '16px',
                                    fontWeight: 900,
                                    fontSize: '0.9rem'
                                }}>
                                {isPulling ? 'SPINNING...' : 'PULL NOW'}
                            </button>
                            {pullsToday >= PULL_LIMIT && (
                                <button
                                    onClick={handleShareForPull}
                                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.75rem 1rem', borderRadius: '16px', border: '2px solid white', fontWeight: 900, fontSize: '0.8rem' }}
                                >
                                    SHARE +1
                                </button>
                            )}
                        </div>
                    </div>
                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '6rem', opacity: 0.2, animation: isPulling ? 'spin 1s linear infinite' : 'none' }}>🎁</div>
                </div>

                {/* 2. Fast Wins: Radish/Lettuce (Row Span 2) */}
                <div className="bento-card row-2" style={{ backgroundColor: '#F0FFF4', border: '1px solid #C6F6D5' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#2F855A', marginBottom: '1rem' }}>⚡ FAST CROPS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {['Radish', 'Lettuce'].map(species => {
                            const data = ProductiveService.getPlantData(species);
                            return (
                                <div key={species} style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #C6F6D5' }}>
                                    <div style={{ fontSize: '2rem' }}>{species === 'Radish' ? '🥕' : '🥬'}</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.75rem', marginTop: '0.25rem' }}>{species}</div>
                                    <div style={{ fontSize: '0.6rem', color: '#38A169', fontWeight: 900 }}>{data?.harvestDays} DAYS</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Category: Fruit */}
                <div className="bento-card" style={{ backgroundColor: '#FFF5F5', cursor: 'pointer' }}>
                    <div style={{ fontSize: '2rem' }}>🍎</div>
                    <div style={{ fontWeight: 900, fontSize: '0.8rem', marginTop: '0.5rem', color: '#C53030' }}>FRUIT</div>
                    <div style={{ fontSize: '0.6rem', color: '#E53E3E', fontWeight: 700 }}>Orchards & Berries</div>
                </div>

                {/* 4. Category: Herbs */}
                <div className="bento-card" style={{ backgroundColor: '#F0FFF4', cursor: 'pointer' }}>
                    <div style={{ fontSize: '2rem' }}>🌿</div>
                    <div style={{ fontWeight: 900, fontSize: '0.8rem', marginTop: '0.5rem', color: '#2F855A' }}>HERBS</div>
                    <div style={{ fontSize: '0.6rem', color: '#38A169', fontWeight: 700 }}>Kitchen Garden</div>
                </div>

                {/* 5. Trending Edibles (Span 2) */}
                <div className="bento-card span-2">
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '1rem' }}>🔥 Trending Edibles</h3>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {['Tomato', 'Strawberry', 'Basil', 'Potato'].map(species => (
                            <div key={species} style={{ minWidth: '100px', textAlign: 'center' }}>
                                <div style={{ width: '60px', height: '60px', margin: '0 auto', backgroundColor: '#F7FAFC', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                    {species === 'Tomato' ? '🍅' : species === 'Strawberry' ? '🍓' : species === 'Basil' ? '🌿' : '🥔'}
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '0.7rem', marginTop: '0.5rem' }}>{species}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. Community Leaderboard (Span 3) */}
                <div className="bento-card span-2" style={{ backgroundColor: '#F7FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 900 }}>🏆 Top Producers</h3>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>DUBLIN, IE</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { name: 'Aoife C.', score: '12.4kg', avatar: '👩‍🌾' },
                            { name: 'Liam D.', score: '8.2kg', avatar: '👨‍🌾' },
                            { name: 'You', score: '2.1kg', avatar: '👤', isUser: true }
                        ].map((user, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', backgroundColor: user.isUser ? 'white' : 'transparent', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 900, width: '15px' }}>{idx + 1}</div>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{user.avatar}</div>
                                <div style={{ flex: 1, fontWeight: 800, fontSize: '0.75rem' }}>{user.name}</div>
                                <div style={{ fontWeight: 900, color: 'var(--color-primary)', fontSize: '0.75rem' }}>{user.score}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7. Discovery Modal (Discovery Logic) */}
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
            </div>
        </div>
    );
}
