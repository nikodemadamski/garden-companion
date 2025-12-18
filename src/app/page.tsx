"use client";

import React, { useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import PlantList from '@/components/Plant/PlantList';
import AddPlantForm from '@/components/Plant/AddPlantForm';
import AppShell from '@/components/Layout/AppShell';
import GardenDashboard from '@/components/Dashboard/GardenDashboard';
import SeasonalDashboard from '@/components/Seasonal/SeasonalDashboard';
import WeatherAlertBanner from '@/components/Weather/WeatherAlertBanner';

export default function Home() {
  const { activeTab } = useGarden();
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
        <SeasonalDashboard />
      )}

      {activeTab === 'profile' && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👤</div>
          <h2>Your Profile</h2>
          <p>Profile settings and history will appear here.</p>
        </div>
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

