"use client";

import React, { useState, useEffect } from 'react';
import { useGarden } from '@/context/GardenContext';
import { Plant } from '@/types/plant';
import { fetchHistoricalWeather, HistoricalWeatherData } from '@/services/weatherService';
import ContextCalendar from '@/components/Weather/ContextCalendar';
import PlantCard from './PlantCard';
import SeasonalBanner from '@/components/Weather/SeasonalBanner';
import PlantDetailView from './PlantDetailView';

export default function PlantList() {
    const { plants, currentGarden, switchGarden } = useGarden();
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const [history, setHistory] = useState<HistoricalWeatherData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (currentGarden === 'outdoor') {
            fetchHistoricalWeather(53.3498, -6.2603).then(setHistory);
        } else {
            setHistory([]);
        }
    }, [currentGarden]);

    const filteredPlants = plants.filter((p) => {
        const matchesGarden = p.type === currentGarden;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.species?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.nickname?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesGarden && matchesSearch;
    });

    const groupedPlants = React.useMemo(() => {
        if (currentGarden === 'outdoor') return { 'Outdoor Garden': filteredPlants };

        const groups: Record<string, Plant[]> = {};
        filteredPlants.forEach(plant => {
            const room = plant.room || 'Unassigned';
            if (!groups[room]) groups[room] = [];
            groups[room].push(plant);
        });

        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === 'Unassigned') return 1;
            if (b === 'Unassigned') return -1;
            return a.localeCompare(b);
        });

        const sortedGroups: Record<string, Plant[]> = {};
        sortedKeys.forEach(key => sortedGroups[key] = groups[key]);
        return sortedGroups;
    }, [filteredPlants, currentGarden]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Search & Filter Bar */}
            <div style={{ position: 'sticky', top: '90px', zIndex: 40, backgroundColor: 'rgba(248, 249, 250, 0.8)', backdropFilter: 'blur(10px)', padding: '0.5rem 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        backgroundColor: '#E2E8F0',
                        padding: '2px',
                        borderRadius: '12px',
                        position: 'relative'
                    }}>
                        <TabButton
                            active={currentGarden === 'indoor'}
                            onClick={() => switchGarden('indoor')}
                            label="🏠 Indoor"
                        />
                        <TabButton
                            active={currentGarden === 'outdoor'}
                            onClick={() => switchGarden('outdoor')}
                            label="🌳 Outdoor"
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search your plants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem 0.8rem 2.5rem',
                                borderRadius: '16px',
                                border: 'none',
                                backgroundColor: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                fontSize: '0.95rem'
                            }}
                        />
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                    </div>
                </div>
            </div>

            <SeasonalBanner />
            {currentGarden === 'outdoor' && <ContextCalendar history={history} />}

            <div style={{ marginBottom: '4rem' }}>
                {Object.entries(groupedPlants).map(([room, roomPlants]) => (
                    <div key={room} style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            marginBottom: '1rem',
                            color: 'var(--color-text)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            {room}
                            <span style={{
                                fontSize: '0.8rem',
                                color: 'var(--color-text-light)',
                                fontWeight: 600,
                                backgroundColor: '#EDF2F7',
                                padding: '0.1rem 0.5rem',
                                borderRadius: '10px'
                            }}>
                                {roomPlants.length}
                            </span>
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '1.25rem',
                        }}>
                            {roomPlants.map((plant) => (
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

                {filteredPlants.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-light)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                        <h3>No plants found.</h3>
                        <p>Try a different search or add a new plant!</p>
                    </div>
                )}
            </div>

            {selectedPlant && (
                <PlantDetailView
                    plant={selectedPlant}
                    onClose={() => setSelectedPlant(null)}
                />
            )}
        </div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: active ? 'white' : 'transparent',
                boxShadow: active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: active ? 'var(--color-text)' : 'var(--color-text-light)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}
        >
            {label}
        </button>
    );
}
