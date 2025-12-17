import React from 'react';
import { useGarden } from '@/context/GardenContext';
import { Plant } from '@/types/plant';

interface DashboardModalProps {
    onClose: () => void;
}

export default function DashboardModal({ onClose }: DashboardModalProps) {
    const { plants, rooms, currentGarden } = useGarden();

    const totalPlants = plants.length;
    const indoorPlants = plants.filter(p => p.type === 'indoor').length;
    const outdoorPlants = plants.filter(p => p.type === 'outdoor').length;
    const hospitalPatients = plants.filter(p => p.status === 'hospital').length;

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
        .slice(0, 5);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={onClose}>
            <div className="glass-panel animate-fade-in" style={{
                width: '90%', maxWidth: '600px',
                padding: '2rem', backgroundColor: '#FDFBF7',
                position: 'relative', maxHeight: '90vh', overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.5rem' }}
                >✕</button>

                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem', textAlign: 'center' }}>📊 Garden Dashboard</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="stat-card" style={{ backgroundColor: '#E6FFFA', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2C7A7B' }}>{totalPlants}</div>
                        <div style={{ color: '#285E61', fontWeight: 600 }}>Total Plants</div>
                    </div>
                    <div className="stat-card" style={{ backgroundColor: '#FFF5F5', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#C53030' }}>{hospitalPatients}</div>
                        <div style={{ color: '#9B2C2C', fontWeight: 600 }}>In Hospital</div>
                    </div>
                    <div className="stat-card" style={{ backgroundColor: '#EBF8FF', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2B6CB0' }}>{indoorPlants}</div>
                        <div style={{ color: '#2A4365', fontWeight: 600 }}>Indoor</div>
                    </div>
                    <div className="stat-card" style={{ backgroundColor: '#F0FFF4', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2F855A' }}>{outdoorPlants}</div>
                        <div style={{ color: '#22543D', fontWeight: 600 }}>Outdoor</div>
                    </div>
                </div>

                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>🏠 Plants per Room</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.8rem', marginBottom: '2rem' }}>
                    {Object.entries(plantsByRoom).map(([room, count]) => (
                        count > 0 && (
                            <div key={room} style={{ padding: '0.8rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{count}</div>
                                <div style={{ fontSize: '0.8rem', color: '#718096' }}>{room}</div>
                            </div>
                        )
                    ))}
                </div>

                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>💧 Next to Water</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {upcomingWatering.map(plant => {
                        const due = getWateringDue(plant);
                        const diffDays = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                        return (
                            <div key={plant.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundImage: `url(${plant.imageUrl})`, backgroundSize: 'cover' }} />
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{plant.nickname || plant.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>{plant.room || plant.location}</div>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700, color: diffDays <= 0 ? '#E53E3E' : '#3182CE' }}>
                                    {diffDays <= 0 ? 'Today!' : `In ${diffDays}d`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
