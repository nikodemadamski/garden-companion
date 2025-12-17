"use client";

import React from 'react';
import { useGarden } from '@/context/GardenContext';

export default function GardenAnalysis() {
    const { currentGarden, plants } = useGarden();
    const gardenPlants = plants.filter(p => p.type === currentGarden);

    const getRecommendations = () => {
        const recommendations = [];

        if (gardenPlants.length === 0) {
            return ["Start your journey by adding your first plant!"];
        }

        if (gardenPlants.length < 3) {
            recommendations.push("Your garden is looking a bit sparse. Aim for at least 3 plants to create a green corner.");
        }

        // Check for variety (mock logic based on names/species)
        const hasFlowering = gardenPlants.some(p =>
            p.species.toLowerCase().includes('flower') ||
            p.species.toLowerCase().includes('lily') ||
            p.species.toLowerCase().includes('orchid') ||
            p.species.toLowerCase().includes('rose')
        );

        if (!hasFlowering) {
            recommendations.push("You seem to be missing flowering plants. Consider adding a Peace Lily or Orchid for a splash of color.");
        }

        if (currentGarden === 'indoor') {
            const hasAirPurifying = gardenPlants.some(p =>
                p.species.toLowerCase().includes('snake') ||
                p.species.toLowerCase().includes('spider') ||
                p.species.toLowerCase().includes('pothos')
            );

            if (!hasAirPurifying) {
                recommendations.push("Boost your air quality! Snake Plants and Spider Plants are great natural air purifiers.");
            }
        } else {
            // Outdoor logic
            recommendations.push("For a balanced outdoor ecosystem, ensure you have a mix of perennials and annuals.");
        }

        return recommendations;
    };

    const recommendations = getRecommendations();

    if (recommendations.length === 0) return null;

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '3rem' }}>
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✨ Garden Insights
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {recommendations.map((rec, index) => (
                    <div key={index} style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '4px solid var(--color-warning)'
                    }}>
                        <p style={{ fontSize: '1.1rem' }}>{rec}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
