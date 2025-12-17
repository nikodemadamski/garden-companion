"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Plant, GardenType, JournalEntry } from '@/types/plant';
import { HistoricalWeatherData, WeatherData, fetchLocalWeather } from '@/services/weatherService';

interface WateringStatus {
    status: 'ok' | 'due' | 'overdue';
    label: string;
    color: string;
    adjustmentReason?: 'rain' | 'heat' | 'cold';
}

interface GardenContextType {
    currentGarden: GardenType;
    switchGarden: (type: GardenType) => void;
    plants: Plant[];
    addPlant: (plant: Plant) => void;
    updatePlant: (plant: Plant) => void;
    deletePlant: (id: string) => void;
    getPlantsByGarden: (type: GardenType) => Plant[];
    addJournalEntry: (plantId: string, entry: JournalEntry) => void;
    calculateWateringStatus: (plant: Plant, history?: HistoricalWeatherData[]) => WateringStatus;
    rooms: string[];
    addRoom: (name: string) => void;
    deleteRoom: (name: string) => void;
    exportGarden: () => string;
    importGarden: (jsonString: string) => boolean;
    weather: WeatherData | null;
    season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
}

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export function GardenProvider({ children }: { children: ReactNode }) {
    const [currentGarden, setCurrentGarden] = useState<GardenType>('indoor');
    const [plants, setPlants] = useState<Plant[]>([]);
    const [rooms, setRooms] = useState<string[]>(['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Bathroom', 'Balcony']);
    const [weather, setWeather] = useState<WeatherData | null>(null);

    // Fetch Weather on Mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const data = await fetchLocalWeather(position.coords.latitude, position.coords.longitude);
                setWeather(data);
            }, (error) => {
                console.error("Geolocation error", error);
            });
        }
    }, []);

    // Load from local storage on mount
    useEffect(() => {
        const storedPlants = localStorage.getItem('garden_plants');
        const storedRooms = localStorage.getItem('garden_rooms');

        if (storedPlants) {
            try {
                setPlants(JSON.parse(storedPlants));
            } catch (e) {
                console.error("Failed to parse plants from local storage", e);
            }
        }

        if (storedRooms) {
            try {
                setRooms(JSON.parse(storedRooms));
            } catch (e) {
                console.error("Failed to parse rooms from local storage", e);
            }
        }
    }, []);

    // Save to local storage whenever plants change
    useEffect(() => {
        localStorage.setItem('garden_plants', JSON.stringify(plants));
    }, [plants]);

    // Save to local storage whenever rooms change
    useEffect(() => {
        localStorage.setItem('garden_rooms', JSON.stringify(rooms));
    }, [rooms]);

    const switchGarden = (type: GardenType) => {
        setCurrentGarden(type);
    };

    const addPlant = (plant: Plant) => {
        setPlants((prev) => [...prev, plant]);
    };

    const updatePlant = (updatedPlant: Plant) => {
        setPlants((prev) => prev.map((p) => (p.id === updatedPlant.id ? updatedPlant : p)));
    };

    const deletePlant = (id: string) => {
        setPlants((prev) => prev.filter((p) => p.id !== id));
    };

    const addRoom = (name: string) => {
        if (!rooms.includes(name)) {
            setRooms(prev => [...prev, name]);
        }
    };

    const deleteRoom = (name: string) => {
        setRooms(prev => prev.filter(r => r !== name));
    };

    const addJournalEntry = (plantId: string, entry: JournalEntry) => {
        setPlants((prev) => prev.map((p) => {
            if (p.id === plantId) {
                return {
                    ...p,
                    journal: [...(p.journal || []), entry]
                };
            }
            return p;
        }));
    };

    const getPlantsByGarden = (type: GardenType) => {
        return plants.filter((p) => p.type === type);
    };

    const calculateWateringStatus = (plant: Plant, history?: HistoricalWeatherData[]): WateringStatus => {
        const lastWatered = new Date(plant.lastWateredDate);
        let frequency = plant.waterFrequencyDays;
        let reason: 'rain' | 'heat' | 'cold' | undefined;

        // P7: Hospital Logic
        if (plant.status === 'hospital') {
            return { status: 'ok', label: 'Recovering ❤️‍🩹', color: '#E53E3E', adjustmentReason: undefined };
        }

        // Smart Logic for Outdoor Plants
        if (plant.type === 'outdoor' && history && history.length > 0) {
            // 1. Rain Check (Last 3 days)
            const recentRain = history.slice(0, 3).reduce((sum, day) => sum + day.rainSum, 0);
            if (recentRain > 10) {
                // Nature watered it! Reset effective last watered date to today (conceptually)
                // Or simply extend the frequency
                frequency += 3;
                reason = 'rain';
            }

            // 2. Heat Check (Last 7 days avg max temp)
            const avgTemp = history.reduce((sum, day) => sum + day.maxTemp, 0) / history.length;
            if (avgTemp > 30) {
                frequency = Math.max(1, frequency - 2); // Water sooner
                reason = 'heat';
            } else if (avgTemp < 10) {
                frequency += 2; // Water less often
                reason = 'cold';
            }
        }

        // P4: Snooze Logic
        if (plant.snoozeUntil) {
            const snoozeDate = new Date(plant.snoozeUntil);
            const now = new Date();
            if (snoozeDate > now) {
                return { status: 'ok', label: 'Snoozed 😴', color: '#718096', adjustmentReason: undefined };
            }
        }

        const nextWater = new Date(lastWatered);
        nextWater.setDate(lastWatered.getDate() + frequency);

        const today = new Date();
        const diffTime = nextWater.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (reason === 'rain') return { status: 'ok', label: `Nature Watered (Rain)`, color: '#3b82f6', adjustmentReason: 'rain' };
        if (diffDays < 0) return { status: 'overdue', label: `Overdue by ${Math.abs(diffDays)} days`, color: '#ef4444', adjustmentReason: reason };
        if (diffDays === 0) return { status: 'due', label: 'Water Today!', color: '#f59e0b', adjustmentReason: reason };

        let label = `Water in ${diffDays} days`;
        if (reason === 'heat') label += " (Sooner due to heat)";
        if (reason === 'cold') label += " (Later due to cold)";

        return { status: 'ok', label, color: 'var(--color-primary)', adjustmentReason: reason };
    };

    const [season, setSeason] = useState<'Spring' | 'Summer' | 'Autumn' | 'Winter'>('Spring');

    useEffect(() => {
        const month = new Date().getMonth(); // 0-11
        // Northern Hemisphere
        if (month >= 2 && month <= 4) setSeason('Spring');
        else if (month >= 5 && month <= 7) setSeason('Summer');
        else if (month >= 8 && month <= 10) setSeason('Autumn');
        else setSeason('Winter');
    }, []);

    return (
        <GardenContext.Provider
            value={{
                currentGarden,
                switchGarden,
                plants,
                addPlant,
                updatePlant,
                deletePlant,
                getPlantsByGarden,
                addJournalEntry,
                calculateWateringStatus,
                rooms,
                addRoom,
                deleteRoom,
                exportGarden: () => {
                    const data = {
                        plants,
                        rooms,
                        version: '1.0',
                        exportDate: new Date().toISOString()
                    };
                    return JSON.stringify(data, null, 2);
                },
                importGarden: (jsonString: string) => {
                    try {
                        const data = JSON.parse(jsonString);
                        if (data.plants && Array.isArray(data.plants)) {
                            setPlants(data.plants);
                        }
                        if (data.rooms && Array.isArray(data.rooms)) {
                            setRooms(data.rooms);
                        }
                        return true;
                    } catch (e) {
                        console.error("Failed to import garden", e);
                        return false;
                    }
                },
                weather,
                season,
            }}
        >
            {children}
        </GardenContext.Provider>
    );
}

export function useGarden() {
    const context = useContext(GardenContext);
    if (context === undefined) {
        throw new Error('useGarden must be used within a GardenProvider');
    }
    return context;
}
