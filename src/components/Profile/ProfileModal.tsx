"use client";

import React, { useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import DashboardModal from '@/components/Analysis/DashboardModal';
import BottomSheet from '../UI/BottomSheet';

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
        <BottomSheet isOpen={true} onClose={onClose} title="My Profile">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    backgroundColor: '#F8FAFC', margin: '0 auto 1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem', border: '1px solid #F1F5F9'
                }}>
                    👤
                </div>
                <p style={{ color: '#718096', fontSize: '0.9rem', fontWeight: 600 }}>{session?.user.email}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    backgroundColor: '#FFF5F5', padding: '1.5rem', borderRadius: '24px',
                    textAlign: 'center', border: '1px solid #FED7D7'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#C53030' }}>{loginStreak}</div>
                    <div style={{ fontSize: '0.7rem', color: '#9B2C2C', fontWeight: 800, textTransform: 'uppercase' }}>Day Streak</div>
                </div>
                <div style={{
                    backgroundColor: '#EBF8FF', padding: '1.5rem', borderRadius: '24px',
                    textAlign: 'center', border: '1px solid #BEE3F8'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💧</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2B6CB0' }}>{wateringStreak}</div>
                    <div style={{ fontSize: '0.7rem', color: '#2C5282', fontWeight: 800, textTransform: 'uppercase' }}>Watering</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                    onClick={() => setShowDashboard(true)}
                    className="btn"
                    style={{ width: '100%', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    📊 View Insights
                </button>

                <button
                    onClick={signOut}
                    className="btn"
                    style={{ width: '100%', backgroundColor: '#FED7D7', color: '#C53030' }}
                >
                    Sign Out
                </button>
            </div>
        </BottomSheet>
    );
}
