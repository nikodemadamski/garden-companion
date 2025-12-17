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
                        {/* Plant Image */}
                        <div
                            style={{
                                width: '100%',
                                height: '200px',
                                backgroundImage: `url(${plant.imageUrl || 'https://images.unsplash.com/photo-1416879115533-1963293d17d4?auto=format&fit=crop&w=800&q=80'})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                                border: '3px solid rgba(255,255,255,0.3)',
                            }}
                        />

                        {/* Plant Name */}
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            {plant.nickname || plant.name}
                        </h2>
                        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '1.5rem' }}>{plant.species}</p>

                        {/* Stats Grid */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1.5rem',
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>📅</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Alive For</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{age} Days</div>
                            </div>
                            <div
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>💧</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Watering</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>Every {plant.waterFrequencyDays}d</div>
                            </div>
                        </div>

                        {/* Badge */}
                        {wasSick && (
                            <div
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '20px',
                                    display: 'inline-block',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                🏆 Survivor
                            </div>
                        )}

                        {/* Footer */}
                        <div
                            style={{
                                marginTop: '2rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid rgba(255,255,255,0.3)',
                                fontSize: '0.8rem',
                                opacity: 0.7,
                                textAlign: 'center',
                            }}
                        >
                            Garden Companion App 🌱
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
