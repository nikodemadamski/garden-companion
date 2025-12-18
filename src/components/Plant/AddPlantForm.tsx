"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGarden } from '@/context/GardenContext';
import { Plant } from '@/types/plant';
import { identifyPlant } from '@/services/plantIdService';
import { PLANT_CATEGORIES, PlantCategory } from '@/data/plantCategories';
import { searchPlants } from '@/services/plantService';

export default function AddPlantForm({ onClose }: { onClose: () => void }) {
    const { addPlant, currentGarden, rooms, addRoom } = useGarden();
    const [step, setStep] = useState<'viewfinder' | 'analyzing' | 'confirm' | 'manual'>('viewfinder');
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<{
        name: string;
        species: string;
        location: string;
        waterFrequencyDays: number;
        imageUrl: string;
        room: string;
    }>({
        name: '',
        species: '',
        location: '',
        waterFrequencyDays: 7,
        imageUrl: '',
        room: 'Living Room',
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setStep('analyzing');

        try {
            const result = await identifyPlant(file);
            setFormData({
                name: result.common_name,
                species: result.scientific_name[0] || '',
                location: 'Living Room',
                waterFrequencyDays: result.water_frequency_days,
                imageUrl: result.default_image || objectUrl,
                room: formData.room
            });
            setStep('confirm');
        } catch (error) {
            setStep('manual');
        }
    };

    const handleConfirm = () => {
        const newPlant: Plant = {
            id: Math.random().toString(36).substring(2, 11),
            ...formData,
            type: currentGarden,
            lastWateredDate: new Date().toISOString(),
            dateAdded: new Date().toISOString(),
            xp: 0,
            level: 1
        };
        addPlant(newPlant);
        onClose();
    };

    if (step === 'viewfinder') {
        return (
            <div className="animate-fade-in" style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '2rem'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', color: 'white', fontSize: '1.5rem', background: 'none', border: 'none' }}>✕</button>

                <div style={{ textAlign: 'center', color: 'white', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>New Plant Friend!</h2>
                    <p style={{ opacity: 0.7 }}>Take a photo to identify instantly ✨</p>
                </div>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        width: '120px', height: '120px',
                        borderRadius: '50%',
                        border: '6px solid white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(255,255,255,0.2)'
                    }}
                >
                    <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: 'white' }} />
                </div>

                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

                <button onClick={() => setStep('manual')} style={{ marginTop: '3rem', color: 'white', opacity: 0.6, fontSize: '0.9rem', background: 'none', border: 'none', textDecoration: 'underline' }}>
                    Or add manually
                </button>
            </div>
        );
    }

    if (step === 'analyzing') {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'white', zIndex: 2000,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }} className="animate-bounce">🔍🌱</div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Thinking...</h2>
                <p style={{ color: 'var(--color-text-light)' }}>Identifying your green friend</p>
            </div>
        );
    }

    if (step === 'confirm') {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
            }}>
                <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '32px' }}>
                    <div style={{
                        width: '100%', height: '250px',
                        borderRadius: '24px', marginBottom: '1.5rem',
                        backgroundImage: `url(${formData.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center'
                    }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Found it!</h2>
                    <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>{formData.name}</h1>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => setStep('manual')} className="btn" style={{ flex: 1, backgroundColor: '#F1F5F9' }}>Edit</button>
                        <button onClick={handleConfirm} className="btn btn-primary" style={{ flex: 1 }}>Looks Good!</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }}>
            <div className="animate-slide-up" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '32px 32px 0 0',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Add Manually</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem' }}>✕</button>
                </div>

                {/* Simplified Room Selector */}
                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-light)' }}>Where will it live?</p>
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {rooms.map(room => (
                            <button
                                key={room}
                                onClick={() => setFormData({ ...formData, room })}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '20px',
                                    border: 'none',
                                    backgroundColor: formData.room === room ? 'var(--color-primary)' : '#F1F5F9',
                                    color: formData.room === room ? 'white' : 'var(--color-text)',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {room}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Simplified Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-light)' }}>What's its name?</p>
                    <input
                        className="input"
                        placeholder="e.g. Monstera or 'Lily'"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '1.2rem', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '1rem' }}
                    />
                </div>

                {/* Quick Templates */}
                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-light)' }}>Quick Start</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {PLANT_CATEGORIES.slice(0, 4).map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFormData({
                                    ...formData,
                                    name: cat.label.split('/')[0].trim(),
                                    species: cat.label,
                                    waterFrequencyDays: cat.defaultWaterFrequency,
                                    imageUrl: cat.defaultImage
                                })}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    border: '1px solid #F1F5F9',
                                    backgroundColor: 'white',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cat.label.split('/')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1.2rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 800 }}
                >
                    Add to Garden ✨
                </button>
            </div>
        </div>
    );
}
