"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useGarden } from '@/context/GardenContext';
import { PhotoService } from '@/services/photoService';
import { PlantPhoto } from '@/types/plant';
import { formatFileSize } from '@/utils/imageUtils';

export default function GardenGallery() {
    const { session, plants } = useGarden();
    const [photos, setPhotos] = useState<PlantPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlantId, setSelectedPlantId] = useState<string>('all');
    const [selectedPhoto, setSelectedPhoto] = useState<{ photo: PlantPhoto, index: number } | null>(null);

    useEffect(() => {
        if (session?.user.id) {
            loadAllPhotos();
        }
    }, [session]);

    const loadAllPhotos = async () => {
        setLoading(true);
        try {
            const allPhotos = await PhotoService.getAllUserPhotos(session!.user.id);
            setPhotos(allPhotos);
        } catch (error) {
            console.error("Error loading gallery:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPhotos = useMemo(() => {
        if (selectedPlantId === 'all') return photos;
        return photos.filter(p => p.plantId === selectedPlantId);
    }, [photos, selectedPlantId]);

    const getPlantName = (plantId: string) => {
        const plant = plants.find(p => p.id === plantId);
        return plant ? (plant.nickname || plant.name) : 'Unknown Plant';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
                    <p style={{ fontWeight: 700, color: 'var(--color-text-light)' }}>Developing your memories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-slide-up" style={{ paddingBottom: '5rem' }}>
            {/* Filter Bar */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '1.5rem',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                <button
                    onClick={() => setSelectedPlantId('all')}
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '12px',
                        backgroundColor: selectedPlantId === 'all' ? 'var(--color-primary)' : 'white',
                        color: selectedPlantId === 'all' ? 'white' : 'var(--color-text)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                        boxShadow: 'var(--shadow-soft)',
                        border: 'none'
                    }}
                >
                    All Photos
                </button>
                {plants.filter(p => photos.some(photo => photo.plantId === p.id)).map(plant => (
                    <button
                        key={plant.id}
                        onClick={() => setSelectedPlantId(plant.id)}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '12px',
                            backgroundColor: selectedPlantId === plant.id ? 'var(--color-primary)' : 'white',
                            color: selectedPlantId === plant.id ? 'white' : 'var(--color-text)',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap',
                            boxShadow: 'var(--shadow-soft)',
                            border: 'none'
                        }}
                    >
                        {plant.nickname || plant.name}
                    </button>
                ))}
            </div>

            {/* Photo Grid */}
            {filteredPhotos.length > 0 ? (
                <div className="photo-grid">
                    {filteredPhotos.map((photo, index) => (
                        <div
                            key={photo.id}
                            className="photo-item"
                            onClick={() => setSelectedPhoto({ photo, index })}
                        >
                            <img
                                src={photo.thumbnailUrl || photo.url}
                                alt="Garden memory"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', borderRadius: '24px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <h3 style={{ fontWeight: 800, color: 'var(--color-text)' }}>No memories yet</h3>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                        Start logging photos in your plant journals to see them here!
                    </p>
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    onClick={() => setSelectedPhoto(null)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        zIndex: 2000,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                >
                    <button
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'white', fontSize: '1.5rem', background: 'none', border: 'none' }}
                        onClick={() => setSelectedPhoto(null)}
                    >
                        ✕
                    </button>

                    <img
                        src={selectedPhoto.photo.url}
                        alt="Garden memory large"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '70vh',
                            borderRadius: '16px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />

                    <div
                        style={{ marginTop: '1.5rem', textAlign: 'center', color: 'white' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>{getPlantName(selectedPhoto.photo.plantId)}</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{formatDate(selectedPhoto.photo.createdAt)}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
