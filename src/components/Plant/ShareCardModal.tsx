"use client";

import React, { useRef } from 'react';
import { Plant } from '@/types/plant';
import { toPng } from 'html-to-image';

interface ShareCardModalProps {
    plant: Plant;
    onClose: () => void;
}

export default function ShareCardModal({ plant, onClose }: ShareCardModalProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const calculateAge = () => {
        const startDate = plant.gotchaDate ? new Date(plant.gotchaDate) : new Date(plant.dateAdded);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;

        try {
            const dataUrl = await toPng(cardRef.current, {
                quality: 1.0,
                pixelRatio: 2,
            });

            const link = document.createElement('a');
            link.download = `${plant.name}-share-card.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to generate image:', error);
            alert('Failed to generate image. Please try again.');
        }
    };

    const age = calculateAge();
    const wasSick = plant.status === 'hospital' || plant.journal?.some(j => j.note.toLowerCase().includes('hospital'));

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    maxWidth: '500px',
                    width: '100%',
                }}
            >
                {/* The Card to be Exported */}
                <div
                    ref={cardRef}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '16px',
                        padding: '2rem',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background Pattern */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0.1,
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {/* Plant Avatar / Chibi */}
                        <div style={{
                            width: '100%',
                            height: '180px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '6rem',
                            marginBottom: '1.5rem',
                            border: '4px solid rgba(255,255,255,0.4)'
                        }}>
                            {plant.level >= 5 ? '👑🌱✨' : '🌱'}
                        </div>

                        {/* Plant Name & Rarity */}
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                                {plant.nickname || plant.name}
                            </h2>
                            {plant.rarity && (
                                <span style={{
                                    backgroundColor: plant.rarity === 'Legendary' ? '#FFD700' : plant.rarity === 'Rare' ? '#5856D6' : 'rgba(255,255,255,0.3)',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase'
                                }}>
                                    {plant.rarity}
                                </span>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.25)', padding: '1rem', borderRadius: '20px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.8, marginBottom: '0.2rem' }}>LEVEL</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{plant.level}</div>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.25)', padding: '1rem', borderRadius: '20px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.8, marginBottom: '0.2rem' }}>ALIVE FOR</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{age}d</div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ textAlign: 'center', opacity: 0.8, fontSize: '0.8rem', fontWeight: 700 }}>
                            (◕‿◕) Garden Companion
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button onClick={handleDownload} className="btn btn-primary" style={{ flex: 1 }}>
                        📥 Download Image
                    </button>
                    <button onClick={onClose} className="btn" style={{ flex: 1, backgroundColor: '#EDF2F7' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
