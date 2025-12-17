"use client";

import React, { useState, useEffect } from 'react';
import { useGarden } from '@/context/GardenContext';
import { Plant } from '@/types/plant';
import PlantDetailModal from './PlantDetailModal';
import { fetchHistoricalWeather, HistoricalWeatherData } from '@/services/weatherService';
import ContextCalendar from '@/components/Weather/ContextCalendar';
import PlantCard from './PlantCard';
import SeasonalBanner from '@/components/Weather/SeasonalBanner';

export default function PlantList() {
    const { plants, currentGarden, updatePlant, deletePlant } = useGarden();
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [history, setHistory] = useState<HistoricalWeatherData[]>([]);

    useEffect(() => {
        if (currentGarden === 'outdoor') {
            // Fetch history for outdoor context
            fetchHistoricalWeather(51.5074, -0.1278).then(setHistory);
        } else {
            setHistory([]);
        }
    }, [currentGarden]);

    const gardenPlants = plants.filter((p) => p.type === currentGarden);

    const handleWater = (e: React.MouseEvent, plant: Plant) => {
        e.stopPropagation(); // Prevent opening modal
        const updatedPlant = {
            ...plant,
            lastWateredDate: new Date().toISOString(),
        };
        updatePlant(updatedPlant);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent opening modal
        if (confirm('Are you sure you want to remove this plant?')) {
            deletePlant(id);
        }
    };

    const groupedPlants = React.useMemo(() => {
        if (currentGarden === 'outdoor') return { 'Outdoor': gardenPlants };

        const groups: Record<string, Plant[]> = {};
        // Initialize with "Unassigned" to ensure it exists if needed, 
        // but we might want sorted keys.

        gardenPlants.forEach(plant => {
            const room = plant.room || 'Unassigned';
            if (!groups[room]) groups[room] = [];
            groups[room].push(plant);
        });

        // Sort keys: specific rooms first, Unassigned last
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === 'Unassigned') return 1;
            if (b === 'Unassigned') return -1;
            return a.localeCompare(b);
        });

        const sortedGroups: Record<string, Plant[]> = {};
        sortedKeys.forEach(key => sortedGroups[key] = groups[key]);
        return sortedGroups;
    }, [gardenPlants, currentGarden]);

    if (gardenPlants.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-light)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌱</div>
                <h3>Your {currentGarden} garden is empty.</h3>
                <p>Add your first plant to get started!</p>
            </div>
        );
    }

    return (
        <>
            <SeasonalBanner />
            {currentGarden === 'outdoor' && <ContextCalendar history={history} />}

            <div style={{ marginBottom: '4rem' }}>
                {Object.entries(groupedPlants).map(([room, plants]) => (
                    <div key={room} style={{ marginBottom: '3rem' }}>
                        {currentGarden === 'indoor' && (
                            <h2 style={{
                                fontSize: '1.5rem',
                                marginBottom: '1.5rem',
                                color: 'var(--color-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                paddingLeft: '0.5rem',
                                borderLeft: '4px solid var(--color-accent)'
                            }}>
                                {room}
                                <span style={{
                                    fontSize: '0.9rem',
                                    opacity: 0.6,
                                    fontWeight: 'normal'
                                }}>
                                    ({plants.length})
                                </span>
                            </h2>
                        )}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '2rem',
                        }}>
                            {plants.map((plant) => (
                                <PlantCard
                                    key={plant.id}
                                    plant={plant}
                                    history={history}
                                    onClick={() => setSelectedPlant(plant)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedPlant && (
                <PlantDetailModal
                    plant={selectedPlant}
                    onClose={() => setSelectedPlant(null)}
                />
            )}
        </>
    );
}
