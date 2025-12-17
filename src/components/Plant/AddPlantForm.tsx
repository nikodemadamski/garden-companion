import React, { useState, useRef, useEffect } from 'react';
import { useGarden } from '@/context/GardenContext';
import { Plant } from '@/types/plant';
import { identifyPlant } from '@/services/plantIdService';
import { PLANT_CATEGORIES, PlantCategory } from '@/data/plantCategories';
import { PlantTemplate } from '@/data/popularPlants';
import { searchPlants, fetchPlantDetails } from '@/services/plantService';

export default function AddPlantForm({ onClose }: { onClose: () => void }) {
    const { addPlant, currentGarden, rooms, addRoom } = useGarden();
    const [step, setStep] = useState<'viewfinder' | 'analyzing' | 'confirm' | 'manual'>('viewfinder');
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [identifiedPlant, setIdentifiedPlant] = useState<PlantTemplate | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Manual Form State
    const [formData, setFormData] = useState<{
        name: string;
        species: string;
        location: string;
        waterFrequencyDays: number;
        imageUrl: string;
        perenualId?: number;
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

        // 1. Show Preview & Analyzing State
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setStep('analyzing');

        try {
            // 2. Simulate AI Analysis
            const result = await identifyPlant(file);
            setIdentifiedPlant(result);

            // Pre-fill form data for confirmation
            setFormData({
                name: result.common_name,
                species: result.scientific_name[0] || '',
                location: 'Living Room', // Default
                waterFrequencyDays: result.water_frequency_days,
                imageUrl: result.default_image || objectUrl,
                room: formData.room // Keep existing selection
            });

            setStep('confirm');
        } catch (error) {
            console.error("Scanning failed", error);
            alert("Could not identify. Please try manual add.");
            setStep('manual');
        }
    };

    const handleConfirm = () => {
        const newPlant: Plant = {
            id: crypto.randomUUID(),
            ...formData,
            type: currentGarden,
            lastWateredDate: new Date().toISOString(),
            dateAdded: new Date().toISOString(),
        };
        addPlant(newPlant);
        onClose();
    };

    // Viewfinder Screen
    if (step === 'viewfinder') {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'black', zIndex: 2000,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '2rem', right: '2rem', color: 'white', fontSize: '2rem' }}
                >✕</button>

                <div style={{ textAlign: 'center', color: 'white', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Scan your Plant</h2>
                    <p style={{ opacity: 0.8 }}>Point your camera at the leaves</p>
                </div>

                {/* Camera Trigger */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        width: '80px', height: '80px',
                        borderRadius: '50%',
                        border: '4px solid white',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'white' }} />
                </div>

                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                <button
                    onClick={() => setStep('manual')}
                    style={{ marginTop: '3rem', color: 'white', textDecoration: 'underline' }}
                >
                    Or add manually
                </button>
            </div>
        );
    }

    // Analyzing Screen (Cute Animation)
    if (step === 'analyzing') {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: '#FDFBF7', zIndex: 2000,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '2rem' }} className="animate-pulse">🌱</div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text)' }}>Analyzing leaf patterns...</h2>
                <div style={{
                    width: '200px', height: '200px',
                    marginTop: '2rem', borderRadius: '20px',
                    backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    opacity: 0.5
                }} />
            </div>
        );
    }

    // Confirmation Screen
    if (step === 'confirm') {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
            }}>
                <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center', backgroundColor: '#FDFBF7' }}>
                    <div style={{
                        width: '100%', height: '200px',
                        borderRadius: '16px', marginBottom: '1.5rem',
                        backgroundImage: `url(${formData.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center'
                    }} />

                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>I think this is a...</h2>
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '1rem', lineHeight: 1.1 }}>
                        {formData.name}
                    </h1>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                        {formData.species}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setStep('manual')}
                            className="btn"
                            style={{ flex: 1, backgroundColor: '#EDF2F7', color: '#4A5568' }}
                        >
                            No, edit
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                        >
                            Yes! Add it
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Manual Fallback (Simplified for brevity, can be expanded)
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', backgroundColor: '#FDFBF7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2>Add Manually</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* Quick Categories */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    {PLANT_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFormData({
                                ...formData,
                                name: cat.label.split('/')[0].trim(),
                                species: cat.label,
                                location: cat.defaultLocation,
                                waterFrequencyDays: cat.defaultWaterFrequency,
                                imageUrl: cat.defaultImage,
                                room: formData.room
                            })}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '20px',
                                border: '1px solid #E2E8F0', whiteSpace: 'nowrap',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <span>{cat.icon}</span> {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search (Perenual) */}
                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <input
                        placeholder="Search Plants (e.g. 'Monstera')"
                        onChange={async (e) => {
                            if (e.target.value.length > 2) {
                                const results = await searchPlants(e.target.value);
                                // Simple dropdown for results
                                const dropdown = document.getElementById('search-results');
                                if (dropdown) {
                                    dropdown.innerHTML = results.slice(0, 5).map(p => `
                                        <div class="search-item" data-id="${p.id}" style="padding: 0.5rem; cursor: pointer; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 0.5rem;">
                                            <img src="${p.default_image || ''}" style="width: 30px; height: 30px; border-radius: 4px; object-fit: cover;" />
                                            <div>
                                                <div style="font-weight: bold;">${p.common_name}</div>
                                                <div style="font-size: 0.8rem; color: #666;">${p.scientific_name[0]}</div>
                                            </div>
                                        </div>
                                    `).join('');

                                    // Add click listeners (hacky for now, but effective)
                                    dropdown.querySelectorAll('.search-item').forEach((item, index) => {
                                        item.addEventListener('click', () => {
                                            const p = results[index];
                                            setFormData({
                                                name: p.common_name,
                                                species: p.scientific_name[0] || '',
                                                location: p.sunlight.join(', '),
                                                waterFrequencyDays: p.water_frequency_days,
                                                imageUrl: p.default_image || '',
                                                perenualId: parseInt(p.id || '0'),
                                                room: formData.room
                                            });
                                            // Clear results
                                            dropdown.innerHTML = '';
                                        });
                                    });
                                }
                            }
                        }}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                    />
                    <div id="search-results" style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        backgroundColor: 'white', borderRadius: '12px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 10,
                        maxHeight: '200px', overflowY: 'auto'
                    }} />
                </div>

                {/* Room Selector */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Room</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {rooms.map(room => (
                            <button
                                key={room}
                                type="button"
                                onClick={() => setFormData({ ...formData, room })}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: formData.room === room ? '2px solid var(--color-primary)' : '1px solid #E2E8F0',
                                    backgroundColor: formData.room === room ? '#F0FFF4' : 'white',
                                    color: formData.room === room ? 'var(--color-primary)' : '#4A5568',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {room}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newRoom = prompt("Enter new room name:");
                                if (newRoom) {
                                    addRoom(newRoom);
                                    setFormData({ ...formData, room: newRoom });
                                }
                            }}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: '1px dashed #CBD5E0',
                                color: '#718096',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            + Add
                        </button>
                    </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
                    <input
                        className="input"
                        placeholder="Plant Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '1rem', marginBottom: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                        required
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Plant</button>
                </form>
            </div>
        </div>
    );
}
