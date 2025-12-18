"use client";

import React from 'react';
import { useGarden } from '@/context/GardenContext';
import { PLANT_CATEGORIES } from '@/data/plantCategories';

export default function ExploreView() {
    const { setActiveTab } = useGarden();

    const collections = [
        { id: 'trending', title: 'Trending in Dublin', icon: '🔥', plants: ['Monstera', 'Snake Plant', 'Spider Plant'] },
        { id: 'easy', title: 'Unkillable (For Beginners)', icon: '🛡️', plants: ['Pothos', 'ZZ Plant', 'Aloe Vera'] },
        { id: 'air', title: 'Air Purifiers', icon: '🌬️', plants: ['Peace Lily', 'Rubber Plant', 'English Ivy'] }
    ];

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
                    <button style={{
                        backgroundColor: 'white',
                        color: '#FF8C00',
                        padding: '1rem 2rem',
                        borderRadius: '20px',
                        border: 'none',
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                    }}>
                        PULL NOW (Free)
                    </button>
                </div>
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '8rem', opacity: 0.2 }}>🎁</div>
            </section>

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
            {collections.map(col => (
                <section key={col.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{col.icon} {col.title}</h2>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>View All</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                        {col.plants.map((p, idx) => (
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
            ))}
        </div>
    );
}
