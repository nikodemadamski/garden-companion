import React, { useState, useEffect } from 'react';
import { Plant, JournalEntry } from '@/types/plant';
import { useGarden } from '@/context/GardenContext';
import confetti from 'canvas-confetti';
import { fetchPlantDetails } from '@/services/plantService';
import { fetchHistoricalWeather, HistoricalWeatherData } from '@/services/weatherService';
import ContextCalendar from '@/components/Weather/ContextCalendar';

// Sub-component for async fetching
function PerenualInfo({ id }: { id: number }) {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlantDetails(id.toString()).then(data => {
            setDetails(data);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <p style={{ color: '#A0AEC0', fontStyle: 'italic' }}>Loading care guide...</p>;
    if (!details) return null;

    return (
        <div style={{ backgroundColor: '#F7FAFC', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>🌿 Care Level: {details.care_level}</h4>
            <p style={{ fontSize: '0.9rem', color: '#4A5568', marginBottom: '0.5rem' }}>
                {details.description || "No description available."}
            </p>
            {details.hardiness && (
                <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                    Hardiness Zone: {details.hardiness.min} - {details.hardiness.max}
                </div>
            )}
        </div>
    );
}

interface PlantDetailModalProps {
    plant: Plant;
    onClose: () => void;
}

export default function PlantDetailModal({ plant, onClose }: PlantDetailModalProps) {
    const { updatePlant, addJournalEntry, deletePlant, rooms } = useGarden();
    const [activeTab, setActiveTab] = useState<'care' | 'journal'>('care');
    const [note, setNote] = useState('');
    const [height, setHeight] = useState('');
    const [history, setHistory] = useState<HistoricalWeatherData[]>([]);

    // P5: Fetch history if outdoor
    useEffect(() => {
        if (plant.type === 'outdoor') {
            // Use mock coords or real if available. 
            // In a real app, we'd store lat/long on the plant or user profile.
            fetchHistoricalWeather(51.5074, -0.1278).then(setHistory);
        }
    }, [plant.type]);

    const handleWater = () => {
        const updatedPlant = {
            ...plant,
            lastWateredDate: new Date().toISOString(),
            snoozeUntil: undefined // Clear snooze if watered
        };
        updatePlant(updatedPlant);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#48BB78', '#68D391', '#9AE6B4']
        });
        onClose();
    };

    const handleSnooze = () => {
        // P4: Snooze Logic
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const updatedPlant = {
            ...plant,
            snoozeUntil: tomorrow.toISOString()
        };
        updatePlant(updatedPlant);

        alert("Snoozed for 1 day! 😴");
        onClose();
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to remove this plant?')) {
            deletePlant(plant.id);
            onClose();
        }
    };

    // P6: Growth Tape Logic
    const [sliderValue, setSliderValue] = useState(0);
    const journalWithImages = plant.journal?.filter(j => j.imageUrl) || [];

    // P7: Hospital Logic
    const toggleHospital = () => {
        const newStatus = plant.status === 'hospital' ? 'healthy' : 'hospital';
        updatePlant({ ...plant, status: newStatus });
        if (newStatus === 'hospital') {
            alert("Moved to Hospital. Get well soon! ❤️‍🩹");
        } else {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FF69B4', '#FFB6C1', '#FFF0F5']
            });
            alert("Discharged! Welcome back! 🎉");
        }
    };

    // P8: Pet Profile Logic
    const handleProfileUpdate = (field: keyof Plant, value: any) => {
        updatePlant({ ...plant, [field]: value });
    };

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const entry: JournalEntry = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            note,
            heightCm: height ? parseFloat(height) : undefined,
            // Mock image for P6 (In real app, handle file upload)
            imageUrl: Math.random() > 0.5 ? plant.imageUrl : undefined
        };
        addJournalEntry(plant.id, entry);
        setNote('');
        setHeight('');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
        }} onClick={onClose}>
            <div
                className="glass-panel animate-fade-in"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    height: '90vh', // Taller for more content
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: '#FDFBF7'
                }}
            >
                {/* Header Image */}
                <div style={{
                    height: '200px',
                    backgroundImage: `url(${plant.imageUrl || 'https://images.unsplash.com/photo-1416879115533-1963293d17d4?auto=format&fit=crop&w=800&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '1rem', right: '1rem',
                            background: 'rgba(0,0,0,0.5)', color: 'white',
                            border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >✕</button>

                    {/* P7: Hospital Badge */}
                    {plant.status === 'hospital' && (
                        <div style={{
                            position: 'absolute', bottom: '1rem', left: '1rem',
                            backgroundColor: '#E53E3E', color: 'white',
                            padding: '0.5rem 1rem', borderRadius: '20px',
                            fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            🏥 In Hospital
                        </div>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>

                    {/* P8: Pet Profile Section */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <input
                                    value={plant.nickname || ''}
                                    placeholder={plant.name}
                                    onChange={(e) => handleProfileUpdate('nickname', e.target.value)}
                                    style={{
                                        fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)',
                                        border: 'none', background: 'transparent', width: '100%',
                                        marginBottom: '0.2rem'
                                    }}
                                />
                                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)' }}>{plant.species}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={toggleHospital}
                                    title={plant.status === 'hospital' ? "Discharge" : "Move to Hospital"}
                                    style={{ fontSize: '1.5rem', padding: '0.5rem', background: '#FFF5F5', borderRadius: '50%' }}
                                >
                                    {plant.status === 'hospital' ? '❤️‍🩹' : '🚑'}
                                </button>
                                <button onClick={handleDelete} style={{ color: '#ef4444', opacity: 0.7, fontSize: '1.5rem', padding: '0.5rem' }}>🗑️</button>
                            </div>
                        </div>

                        {/* P8: Gotcha Day & Pot Type */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem', color: '#718096' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                🎂 Gotcha:
                                <input
                                    type="date"
                                    value={plant.gotchaDate ? plant.gotchaDate.split('T')[0] : ''}
                                    onChange={(e) => handleProfileUpdate('gotchaDate', new Date(e.target.value).toISOString())}
                                    style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '0.2rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                🏺 Pot:
                                <select
                                    value={plant.potType || 'terracotta'}
                                    onChange={(e) => handleProfileUpdate('potType', e.target.value)}
                                    style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '0.2rem' }}
                                >
                                    <option value="terracotta">Terracotta</option>
                                    <option value="ceramic">Ceramic</option>
                                    <option value="plastic">Plastic</option>
                                    <option value="hanging">Hanging</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* P7: Hospital Triage Checklist */}
                    {plant.status === 'hospital' && (
                        <div className="animate-fade-in" style={{
                            backgroundColor: '#FFF5F5', padding: '1rem', borderRadius: '12px',
                            border: '2px solid #FEB2B2', marginBottom: '1.5rem'
                        }}>
                            <h4 style={{ color: '#C53030', fontWeight: 700, marginBottom: '0.5rem' }}>🏥 Triage Checklist</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" /> Checked Roots?
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" /> Checked for Pests?
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" /> Repotted if needed?
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Action Row */}
                    {plant.status !== 'hospital' && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                onClick={handleWater}
                                className="btn btn-primary"
                                style={{ flex: 1, fontSize: '1.1rem', padding: '1rem' }}
                            >
                                💧 Watered!
                            </button>
                            <button
                                onClick={handleSnooze}
                                className="btn"
                                style={{ flex: 1, backgroundColor: '#EDF2F7', color: '#4A5568', fontSize: '1.1rem', padding: '1rem' }}
                            >
                                😴 Snooze
                            </button>
                        </div>
                    )}

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #EDF2F7' }}>
                        <button onClick={() => setActiveTab('care')} style={{ padding: '0.5rem 1rem', borderBottom: activeTab === 'care' ? '2px solid var(--color-primary)' : 'none', fontWeight: activeTab === 'care' ? 700 : 400, color: activeTab === 'care' ? 'var(--color-primary)' : 'var(--color-text-light)' }}>Care Guide</button>
                        <button onClick={() => setActiveTab('journal')} style={{ padding: '0.5rem 1rem', borderBottom: activeTab === 'journal' ? '2px solid var(--color-primary)' : 'none', fontWeight: activeTab === 'journal' ? 700 : 400, color: activeTab === 'journal' ? 'var(--color-text-light)' : 'var(--color-primary)' }}>Growth Journal</button>
                    </div>

                    {activeTab === 'care' ? (
                        <div className="animate-fade-in">
                            {/* P5: Context Calendar */}
                            {plant.type === 'outdoor' && history.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <ContextCalendar history={history} />
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ backgroundColor: '#F0FFF4', padding: '1rem', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>☀️</span>
                                    <h4 style={{ fontWeight: 700, margin: '0.5rem 0 0.2rem' }}>Sunlight</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#4A5568' }}>{plant.location}</p>
                                </div>
                                <div style={{ backgroundColor: '#EBF8FF', padding: '1rem', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>💧</span>
                                    <h4 style={{ fontWeight: 700, margin: '0.5rem 0 0.2rem' }}>Water</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#4A5568' }}>Every {plant.waterFrequencyDays} days</p>
                                </div>
                                <div style={{ backgroundColor: '#FFF5F5', padding: '1rem', borderRadius: '12px', gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontSize: '1.5rem' }}>🛋️</span>
                                            <h4 style={{ fontWeight: 700, margin: '0.5rem 0 0.2rem' }}>Room</h4>
                                        </div>
                                        <select
                                            value={plant.room || 'Unassigned'}
                                            onChange={(e) => updatePlant({ ...plant, room: e.target.value })}
                                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'white', fontSize: '0.9rem', color: '#4A5568', cursor: 'pointer' }}
                                        >
                                            <option value="Unassigned">Unassigned</option>
                                            {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {plant.perenualId && <PerenualInfo id={plant.perenualId} />}
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            {/* P6: Growth Tape Slider */}
                            {journalWithImages.length > 0 && (
                                <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#EDF2F7', borderRadius: '12px' }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>🎞️ Growth Tape</h4>
                                    <div style={{ height: '200px', width: '100%', backgroundImage: `url(${journalWithImages[sliderValue]?.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', marginBottom: '1rem' }} />
                                    <input
                                        type="range"
                                        min="0"
                                        max={journalWithImages.length - 1}
                                        value={sliderValue}
                                        onChange={(e) => setSliderValue(parseInt(e.target.value))}
                                        style={{ width: '100%' }}
                                    />
                                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#718096', marginTop: '0.5rem' }}>
                                        {new Date(journalWithImages[sliderValue]?.date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleAddEntry} style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input type="text" placeholder="Add a note..." value={note} onChange={(e) => setNote(e.target.value)} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                                    <input type="number" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)} style={{ width: '100px', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem' }}>📸 Snap & Add Entry</button>
                            </form>

                            <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #E2E8F0' }}>
                                {plant.journal?.slice().reverse().map((entry) => (
                                    <div key={entry.id} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-1.9rem', top: '0', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', border: '2px solid white' }} />
                                        <p style={{ fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '0.2rem' }}>{new Date(entry.date).toLocaleDateString()}</p>
                                        <p style={{ fontWeight: 600 }}>{entry.note}</p>
                                        {entry.heightCm && <p style={{ fontSize: '0.9rem', color: '#48BB78' }}>📏 {entry.heightCm}cm</p>}
                                        {entry.imageUrl && <div style={{ marginTop: '0.5rem', height: '100px', width: '100px', backgroundImage: `url(${entry.imageUrl})`, backgroundSize: 'cover', borderRadius: '8px' }} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
