import React, { useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import DashboardModal from '@/components/Analysis/DashboardModal';

interface ProfileModalProps {
    onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
    const { session, signOut, loginStreak, wateringStreak } = useGarden();
    const [showDashboard, setShowDashboard] = useState(false);

    if (showDashboard) {
        return <DashboardModal onClose={() => setShowDashboard(false)} />;
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={onClose}>
            <div className="glass-panel animate-fade-in" style={{
                width: '90%', maxWidth: '400px',
                padding: '2rem', backgroundColor: '#FDFBF7',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.5rem' }}
                >✕</button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        backgroundColor: '#E2E8F0', margin: '0 auto 1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '3rem'
                    }}>
                        👤
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Profile</h2>
                    <p style={{ color: '#718096', fontSize: '0.9rem' }}>{session?.user.email}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        backgroundColor: '#FFF5F5', padding: '1rem', borderRadius: '12px',
                        textAlign: 'center', border: '1px solid #FED7D7'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#C53030' }}>{loginStreak}</div>
                        <div style={{ fontSize: '0.8rem', color: '#9B2C2C', fontWeight: 600 }}>Day Streak</div>
                    </div>
                    <div style={{
                        backgroundColor: '#EBF8FF', padding: '1rem', borderRadius: '12px',
                        textAlign: 'center', border: '1px solid #BEE3F8'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💧</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2B6CB0' }}>{wateringStreak}</div>
                        <div style={{ fontSize: '0.8rem', color: '#2C5282', fontWeight: 600 }}>Watering Streak</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={() => setShowDashboard(true)}
                        className="btn"
                        style={{ width: '100%', backgroundColor: '#EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        📊 View Garden Dashboard
                    </button>

                    <button
                        onClick={signOut}
                        className="btn"
                        style={{ width: '100%', backgroundColor: '#FED7D7', color: '#C53030' }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
