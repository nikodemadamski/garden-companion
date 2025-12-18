"use client";

import React, { useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import PlantList from '@/components/Plant/PlantList';
import AddPlantForm from '@/components/Plant/AddPlantForm';
import AppShell from '@/components/Layout/AppShell';
import GardenDashboard from '@/components/Dashboard/GardenDashboard';
import ExploreView from '@/components/Explore/ExploreView';
import WeatherAlertBanner from '@/components/Weather/WeatherAlertBanner';
import GardenGallery from '@/components/Gallery/GardenGallery';

export default function Home() {
  const { activeTab, session, loginStreak, wateringStreak, signOut } = useGarden();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <AppShell>
      {/* Conditional Rendering based on activeTab */}
      {activeTab === 'dashboard' && (
        <>
          <WeatherAlertBanner />
          <GardenDashboard />
        </>
      )}

      {activeTab === 'plants' && (
        <PlantList />
      )}

      {activeTab === 'explore' && (
        <ExploreView />
      )}

      {activeTab === 'profile' && (
        <div className="animate-slide-up" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            margin: '0 auto 1.5rem'
          }}>
            👤
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Profile</h2>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
            {session?.user?.email}
          </p>

          <div className="glass-panel" style={{ padding: '1rem', borderRadius: '20px', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ padding: '0.75rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' }}>
              <span>Login Streak</span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{loginStreak} days 🔥</span>
            </div>
            <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Watering Streak</span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{wateringStreak} days 💧</span>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="btn"
            style={{
              backgroundColor: '#FEE2E2',
              color: '#EF4444',
              width: '100%',
              fontWeight: 700
            }}
          >
            Sign Out
          </button>
        </div>
      )}

      {activeTab === 'gallery' && (
        <GardenGallery />
      )}

      {/* Hidden trigger for the Add Plant modal (connected to AppShell button) */}
      <button
        id="add-plant-trigger"
        style={{ display: 'none' }}
        onClick={() => setIsAddModalOpen(true)}
      />

      {isAddModalOpen && (
        <AddPlantForm onClose={() => setIsAddModalOpen(false)} />
      )}
    </AppShell>
  );
}

