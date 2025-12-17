"use client";

import React, { useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import ProfileModal from './Profile/ProfileModal';
import SettingsModal from './SettingsModal'; // Keep for now if user wants direct access, or remove? Plan said keep settings for backup.

export default function Navigation() {
    const { currentGarden, switchGarden } = useGarden();

    const [showSettings, setShowSettings] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    return (
        <>
            <nav className="glass-panel" style={{
                position: 'fixed',
                top: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                padding: '0.5rem',
                display: 'flex',
                gap: '0.5rem'
            }}>
                <button
                    className={`btn ${currentGarden === 'indoor' ? 'btn-primary' : ''}`}
                    onClick={() => switchGarden('indoor')}
                    style={{ minWidth: '120px' }}
                >
                    🏠 Indoor
                </button>
                <button
                    className={`btn ${currentGarden === 'outdoor' ? 'btn-primary' : ''}`}
                    onClick={() => switchGarden('outdoor')}
                    style={{ minWidth: '120px' }}
                >
                    🌳 Outdoor
                </button>

                {/* Profile Button */}
                <button
                    className="btn"
                    onClick={() => setShowProfile(true)}
                    style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', backgroundColor: showProfile ? 'var(--color-primary)' : 'transparent', color: showProfile ? 'white' : 'inherit' }}
                    aria-label="Profile"
                >
                    👤
                </button>

                {/* Settings Button - Keeping for Backup/Restore */}
                <button
                    className="btn"
                    onClick={() => setShowSettings(true)}
                    style={{ padding: '0.5rem 1rem', fontSize: '1.2rem' }}
                    aria-label="Settings"
                >
                    ⚙️
                </button>
            </nav>

            {showSettings && (
                <SettingsModal onClose={() => setShowSettings(false)} />
            )}

            {showProfile && (
                <ProfileModal onClose={() => setShowProfile(false)} />
            )}
        </>
    );
}
