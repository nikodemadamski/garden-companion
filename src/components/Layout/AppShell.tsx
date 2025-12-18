"use client";

import React, { useEffect, useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import { fetchLocalWeather, WeatherData } from '@/services/weatherService';
import ProfileModal from '@/components/Profile/ProfileModal';
import ExploreModal from '@/components/Explore/ExploreModal';
import GardenGallery from '@/components/Gallery/GardenGallery';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { activeTab, setActiveTab, weather: gardenWeather } = useGarden();
    const [showProfile, setShowProfile] = React.useState(false);
    const [showExplore, setShowExplore] = React.useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Use weather from context if available, otherwise fallback to local fetch
    const weather = gardenWeather;

    return (
        <div className="app-container">
            {/* Premium Header */}
            <header className="app-header">
                <div>
                    <p style={{
                        color: 'var(--color-text-light)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.2rem'
                    }}>
                        {mounted ? new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Loading...'}
                    </p>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                        {activeTab === 'dashboard' ? 'My Garden' :
                            activeTab === 'plants' ? 'My Plants' :
                                activeTab === 'explore' ? 'Explore' :
                                    activeTab === 'gallery' ? 'Gallery' : 'Profile'}
                    </h1>
                </div>
                <div style={{
                    backgroundColor: 'white',
                    padding: '0.75rem',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>
                        {weather?.isRaining ? '🌧️' : (weather?.temperature && weather.temperature > 20) ? '☀️' : '⛅'}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        {weather ? `${Math.round(weather.temperature)}°` : '--°'}
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <main className="app-main">
                {children}
            </main>

            {/* iPhone-style Floating Bottom Nav */}
            <nav className="floating-nav">
                <NavButton
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                    icon="🏠"
                    label="Home"
                />

                <NavButton
                    active={activeTab === 'plants'}
                    onClick={() => setActiveTab('plants')}
                    icon="🌳"
                    label="Plants"
                />

                <NavButton
                    active={activeTab === 'gallery'}
                    onClick={() => setActiveTab('gallery')}
                    icon="📸"
                    label="Gallery"
                />

                {/* Central Add Button */}
                <button
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '20px',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                    }}
                    onClick={() => document.getElementById('add-plant-trigger')?.click()}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    +
                </button>

                <NavButton
                    active={activeTab === 'explore'}
                    onClick={() => setActiveTab('explore')}
                    icon="🧭"
                    label="Explore"
                />

                <NavButton
                    active={activeTab === 'profile'}
                    onClick={() => setActiveTab('profile')}
                    icon="👤"
                    label="Profile"
                />
            </nav>

            {showProfile && (
                <ProfileModal onClose={() => setShowProfile(false)} />
            )}

            {showExplore && (
                <ExploreModal onClose={() => setShowExplore(false)} />
            )}
        </div>
    );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: '4px 8px'
            }}
        >
            <span style={{
                fontSize: '1.4rem',
                opacity: active ? 1 : 0.4,
                transform: active ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s ease'
            }}>
                {icon}
            </span>
            <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: active ? 'var(--color-primary)' : 'var(--color-text-light)',
                opacity: active ? 1 : 0.6
            }}>
                {label}
            </span>
        </button>
    );
}

