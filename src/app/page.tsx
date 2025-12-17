"use client";

import React, { useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import PlantList from '@/components/Plant/PlantList';
import AddPlantForm from '@/components/Plant/AddPlantForm';
import AppShell from '@/components/Layout/AppShell';
import GardenAnalysis from '@/components/Analysis/GardenAnalysis';
import WeatherWidget from '@/components/Weather/WeatherWidget';

export default function Home() {
  const { currentGarden, plants } = useGarden();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const gardenPlants = plants.filter(p => p.type === currentGarden);
  const plantsNeedingWater = gardenPlants.filter(p => {
    const lastWatered = new Date(p.lastWateredDate);
    const nextWater = new Date(lastWatered);
    nextWater.setDate(lastWatered.getDate() + p.waterFrequencyDays);
    return nextWater <= new Date();
  }).length;

  return (
    <AppShell>
      <PlantList />

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
