"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Plant, GardenType, JournalEntry } from '@/types/plant';
import { HistoricalWeatherData, WeatherData, fetchLocalWeather } from '@/services/weatherService';
import { supabase } from '@/lib/supabaseClient';
import Login from '@/components/Auth/Login';
import { Session } from '@supabase/supabase-js';

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
    session: Session | null;
    signOut: () => void;
    loginStreak: number;
    wateringStreak: number;
}

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export function GardenProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [currentGarden, setCurrentGarden] = useState<GardenType>('indoor');
    const [plants, setPlants] = useState<Plant[]>([]);
    const [rooms, setRooms] = useState<string[]>(['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Bathroom', 'Balcony']);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loginStreak, setLoginStreak] = useState(0);
    const [wateringStreak, setWateringStreak] = useState(0);

    // Auth & Data Fetching
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log("Session init:", session ? "Logged In" : "No Session");
            setSession(session);
            if (session) fetchData(session.user.id);
            else setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("Auth change:", _event, session ? "Logged In" : "No Session");
            setSession(session);
            if (session) fetchData(session.user.id);
            else {
                setPlants([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchData = async (userId: string) => {
        setLoading(true);
        try {
            // Fetch Plants
            const { data: plantsData, error: plantsError } = await supabase
                .from('plants')
                .select('*');

            if (plantsError) throw plantsError;

            if (plantsData) {
                const mappedPlants: Plant[] = plantsData.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    species: p.species,
                    type: p.type,
                    location: p.location,
                    waterFrequencyDays: p.water_frequency_days,
                    lastWateredDate: p.last_watered_date,
                    imageUrl: p.image_url,
                    notes: p.notes,
                    dateAdded: p.date_added,
                    journal: p.journal,
                    perenualId: p.perenual_id,
                    room: p.room,
                    snoozeUntil: p.snooze_until,
                    status: p.status,
                    nickname: p.nickname,
                    gotchaDate: p.gotcha_date,
                    potType: p.pot_type
                }));
                setPlants(mappedPlants);
            }

            // Fetch Settings (Rooms & Streaks)
            const { data: settingsData, error: settingsError } = await supabase
                .from('user_settings')
                .select('*')
                .single();

            if (settingsData) {
                if (settingsData.rooms) setRooms(settingsData.rooms);
                if (settingsData.login_streak) setLoginStreak(settingsData.login_streak);
                if (settingsData.watering_streak) setWateringStreak(settingsData.watering_streak);

                // Handle Login Streak
                const today = new Date().toISOString().split('T')[0];
                const lastLogin = settingsData.last_login_date;

                if (lastLogin !== today) {
                    let newStreak = settingsData.login_streak || 0;
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (lastLogin === yesterdayStr) {
                        newStreak += 1;
                    } else {
                        newStreak = 1; // Reset or start new
                    }

                    // Update DB
                    await supabase.from('user_settings').upsert({
                        user_id: userId,
                        last_login_date: today,
                        login_streak: newStreak
                    });
                    setLoginStreak(newStreak);
                }
            } else {
                // Initialize settings for new user
                const today = new Date().toISOString().split('T')[0];
                await supabase.from('user_settings').upsert({
                    user_id: userId,
                    last_login_date: today,
                    login_streak: 1,
                    rooms: ['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Bathroom', 'Balcony']
                });
                setLoginStreak(1);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const switchGarden = (type: GardenType) => {
        setCurrentGarden(type);
    };

    const addPlant = async (plant: Plant) => {
        // Optimistic update
        setPlants((prev) => [...prev, plant]);

        const { error } = await supabase.from('plants').insert({
            // id: plant.id, // Let Supabase generate ID or use UUID? Better to let Supabase gen, but we need it for UI.
            // If we use crypto.randomUUID() in frontend, we can send it.
            id: plant.id,
            user_id: session?.user.id,
            name: plant.name,
            species: plant.species,
            type: plant.type,
            location: plant.location,
            water_frequency_days: plant.waterFrequencyDays,
            last_watered_date: plant.lastWateredDate,
            image_url: plant.imageUrl,
            notes: plant.notes,
            date_added: plant.dateAdded,
            perenual_id: plant.perenualId,
            room: plant.room,
            snooze_until: plant.snoozeUntil,
            status: plant.status,
            nickname: plant.nickname,
            gotcha_date: plant.gotchaDate,
            pot_type: plant.potType,
            journal: plant.journal || []
        });

        if (error) {
            console.error('Error adding plant:', error);
            // Revert optimistic update?
        }
    };

    const updatePlant = async (updatedPlant: Plant) => {
        const oldPlant = plants.find(p => p.id === updatedPlant.id);
        setPlants((prev) => prev.map((p) => (p.id === updatedPlant.id ? updatedPlant : p)));

        // Check if watered
        if (oldPlant && oldPlant.lastWateredDate !== updatedPlant.lastWateredDate) {
            const today = new Date().toISOString().split('T')[0];

            // Fetch current settings to check last watered date
            const { data: settings } = await supabase.from('user_settings').select('*').single();

            if (settings && settings.last_watered_date !== today) {
                const newStreak = (settings.watering_streak || 0) + 1;
                await supabase.from('user_settings').upsert({
                    user_id: session?.user.id,
                    last_watered_date: today,
                    watering_streak: newStreak
                });
                setWateringStreak(newStreak);
            }
        }

        const { error } = await supabase.from('plants').update({
            name: updatedPlant.name,
            species: updatedPlant.species,
            type: updatedPlant.type,
            location: updatedPlant.location,
            water_frequency_days: updatedPlant.waterFrequencyDays,
            last_watered_date: updatedPlant.lastWateredDate,
            image_url: updatedPlant.imageUrl,
            notes: updatedPlant.notes,
            perenual_id: updatedPlant.perenualId,
            room: updatedPlant.room,
            snooze_until: updatedPlant.snoozeUntil,
            status: updatedPlant.status,
            nickname: updatedPlant.nickname,
            gotcha_date: updatedPlant.gotchaDate,
            pot_type: updatedPlant.potType,
            journal: updatedPlant.journal
        }).eq('id', updatedPlant.id);

        if (error) console.error('Error updating plant:', error);
    };

    const deletePlant = async (id: string) => {
        setPlants((prev) => prev.filter((p) => p.id !== id));
        const { error } = await supabase.from('plants').delete().eq('id', id);
        if (error) console.error('Error deleting plant:', error);
    };

    const addRoom = async (name: string) => {
        if (!rooms.includes(name)) {
            const newRooms = [...rooms, name];
            setRooms(newRooms);

            // Upsert settings
            const { error } = await supabase.from('user_settings').upsert({
                user_id: session?.user.id,
                rooms: newRooms
            });
            if (error) console.error('Error updating rooms:', error);
        }
    };

    const deleteRoom = async (name: string) => {
        const newRooms = rooms.filter(r => r !== name);
        setRooms(newRooms);

        const { error } = await supabase.from('user_settings').upsert({
            user_id: session?.user.id,
            rooms: newRooms
        });
        if (error) console.error('Error updating rooms:', error);
    };

    const addJournalEntry = (plantId: string, entry: JournalEntry) => {
        const plant = plants.find(p => p.id === plantId);
        if (plant) {
            const updatedPlant = {
                ...plant,
                journal: [...(plant.journal || []), entry]
            };
            updatePlant(updatedPlant);
        }
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
                frequency += 3;
                reason = 'rain';
            }

            // 2. Heat Check (Last 7 days avg max temp)
            const avgTemp = history.reduce((sum, day) => sum + day.maxTemp, 0) / history.length;
            if (avgTemp > 30) {
                frequency = Math.max(1, frequency - 2);
                reason = 'heat';
            } else if (avgTemp < 10) {
                frequency += 2;
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

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Garden...</div>;
    }

    if (!session) {
        return <Login />;
    }

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
                    // Import logic might need to be updated to save to DB?
                    // For now, let's keep it local or warn user.
                    // Implementing full import to DB is complex.
                    alert("Import is currently only local-session based in this version.");
                    return false;
                },
                weather,
                season,
                session,
                signOut,
                loginStreak,
                wateringStreak
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
