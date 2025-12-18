"use client";

import React from 'react';
import { useGarden } from '@/context/GardenContext';
import { Plant } from '@/types/plant';

interface DashboardModalProps {
    onClose: () => void;
}

import BottomSheet from '../UI/BottomSheet';
import { ProductiveService } from '@/services/productiveService';

interface DashboardModalProps {
    onClose: () => void;
}

export default function DashboardModal({ onClose }: DashboardModalProps) {
    const { plants, rooms, currentGarden, calculateHarmony, gardenRank: rank, awardXP } = useGarden();
    const harmony = calculateHarmony();

    const totalPlants = plants.length;
    const hospitalPatients = plants.filter(p => p.status === 'hospital').length;

    // Total Harvest Calculation
    const totalHarvest = plants.reduce((acc, p) => {
        p.journal?.forEach(entry => {
            if (entry.type === 'harvest' && entry.harvestAmount) {
                const unit = entry.harvestUnit || 'units';
                acc[unit] = (acc[unit] || 0) + entry.harvestAmount;
            }
        });
        return acc;
    }, {} as Record<string, number>);

    const totalUnits = Object.values(totalHarvest).reduce((a, b) => a + b, 0);

    // Plants by Room
    const plantsByRoom = rooms.reduce((acc, room) => {
        acc[room] = plants.filter(p => p.room === room).length;
        return acc;
    }, {} as Record<string, number>);

    // Upcoming Watering
    const getWateringDue = (plant: Plant) => {
        const lastWatered = new Date(plant.lastWateredDate);
        const nextWater = new Date(lastWatered);
        nextWater.setDate(lastWatered.getDate() + plant.waterFrequencyDays);
        return nextWater;
    };

    const upcomingWatering = [...plants]
        .sort((a, b) => getWateringDue(a).getTime() - getWateringDue(b).getTime())
        .slice(0, 3);

    // AI Recommendations (Simplified logic from GardenAnalysis)
    const getRecommendations = () => {
        const recs = [];
        if (hospitalPatients > 0) recs.push({ icon: '🩹', text: `${hospitalPatients} plants need urgent care!` });
        if (totalPlants < 5) recs.push({ icon: '🌱', text: "Your garden is growing! Add more varieties to boost harmony." });

        const hasHerbs = plants.some(p => ProductiveService.getPlantData(p.species)?.category === 'herb');
        if (!hasHerbs) recs.push({ icon: '🌿', text: "Consider adding herbs for a kitchen-ready garden." });

        return recs.length > 0 ? recs : [{ icon: '✨', text: "Your garden is perfectly balanced today!" }];
    };

    const recommendations = getRecommendations();

    return (
        <BottomSheet isOpen={true} onClose={onClose} title="Garden Insights 📊">
            <div className="bento-grid">

                {/* 1. Harmony Score (Span 2) */}
                <div className="bento-card span-2" style={{
                    background: 'linear-gradient(135deg, #5856D6 0%, #343391 100%)',
                    color: 'white',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase' }}>Harmony Score</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{harmony}%</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2rem' }}>{rank.icon}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>{rank.title}</div>
                        </div>
                    </div>
                </div>

                {/* 2. Total Plants */}
                <div className="bento-card" style={{ backgroundColor: '#F0FFF4' }}>
                    <div style={{ fontSize: '1.5rem' }}>🪴</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2F855A' }}>{totalPlants}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#38A169' }}>PLANTS</div>
                </div>

                {/* 3. Total Bounty */}
                <div className="bento-card" style={{ backgroundColor: '#FFF5F5' }}>
                    <div style={{ fontSize: '1.5rem' }}>🧺</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C53030' }}>{totalUnits}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#E53E3E' }}>UNITS</div>
                </div>

                {/* 4. Plants per Room (Span 2) */}
                <div className="bento-card span-2">
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 900, marginBottom: '1rem' }}>🏠 ROOM DISTRIBUTION</h3>
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {Object.entries(plantsByRoom).map(([room, count]) => (
                            count > 0 && (
                                <div key={room} style={{
                                    minWidth: '100px', padding: '0.75rem',
                                    backgroundColor: '#F8FAFC', borderRadius: '16px',
                                    border: '1px solid #F1F5F9', textAlign: 'center'
                                }}>
                                    <div style={{ fontWeight: 900, fontSize: '1rem' }}>{count}</div>
                                    <div style={{ fontSize: '0.6rem', color: '#718096', fontWeight: 700 }}>{room.toUpperCase()}</div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* 5. Next to Water (Span 2) */}
                <div className="bento-card span-2">
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 900, marginBottom: '1rem' }}>💧 WATERING QUEUE</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {upcomingWatering.map(plant => {
                            const due = getWateringDue(plant);
                            const diffDays = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={plant.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ fontSize: '1.2rem' }}>🌿</div>
                                        <div style={{ fontWeight: 800, fontSize: '0.75rem' }}>{plant.nickname || plant.name}</div>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: diffDays <= 0 ? '#E53E3E' : '#3182CE' }}>
                                        {diffDays <= 0 ? 'DUE NOW' : `IN ${diffDays}D`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 6. AI Recommendations (Span 2) */}
                <div className="bento-card span-2" style={{ backgroundColor: '#FFFFF0', border: '1px solid #FEFCBF' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: '#B7791F', marginBottom: '1rem' }}>✨ AI INSIGHTS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recommendations.map((rec, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2rem' }}>{rec.icon}</span>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#744210' }}>{rec.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </BottomSheet>
    );
}
