"use client";

import React from 'react';
import { useGarden } from '@/context/GardenContext';
import SettingsModal from './SettingsModal';

export default function Navigation() {
    const { currentGarden, switchGarden } = useGarden();

    const [showSettings, setShowSettings] = React.useState(false);

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
        </>
    );
}
