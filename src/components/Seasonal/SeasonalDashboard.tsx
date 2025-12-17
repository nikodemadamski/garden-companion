"use client";

import React, { useEffect, useState } from 'react';
import { useGarden } from '@/context/GardenContext';
import { seasonalTaskService } from '@/services/seasonalTaskService';
import { SeasonalGuide, SeasonalRecommendationContext } from '@/types/seasonal';
import { PlantCategory } from '@/types/plant';
import { getCurrentMonth, getMonthName, getSeasonEmoji } from '@/utils/seasonalUtils';
import MonthlyTaskList from './MonthlyTaskList';

export default function SeasonalDashboard() {
  const { plants, season } = useGarden();
  const [seasonalGuide, setSeasonalGuide] = useState<SeasonalGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSeasonalGuide();
  }, [plants]);

  const loadSeasonalGuide = async () => {
    try {
      setLoading(true);
      setError(null);

      // Extract plant types from user's plants
      const userPlantTypes = plants
        .map(plant => plant.category)
        .filter((category): category is PlantCategory => category !== null && category !== undefined);

      const context: SeasonalRecommendationContext = {
        userPlants: userPlantTypes,
        currentMonth: getCurrentMonth(),
        climateZone: 'ireland'
      };

      const guide = await seasonalTaskService.getCurrentMonthGuide(context);
      setSeasonalGuide(guide);
    } catch (err) {
      console.error('Error loading seasonal guide:', err);
      setError('Failed to load seasonal guidance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🌱</div>
        <p>Loading seasonal guidance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(255, 255, 255, 0.8))'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚠️</div>
        <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</p>
        <button 
          onClick={loadSeasonalGuide}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!seasonalGuide) {
    return null;
  }

  const currentMonth = getCurrentMonth();
  const monthName = getMonthName(currentMonth);
  const seasonEmoji = getSeasonEmoji(currentMonth);

  return (
    <div className="seasonal-dashboard">
      {/* Header */}
      <div className="glass-panel animate-fade-in" style={{
        padding: '2rem',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(255, 255, 255, 0.9))',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          fontSize: '1.8rem',
          fontWeight: 700
        }}>
          {seasonEmoji} {monthName} Gardening Guide
        </h2>
        <p style={{ 
          color: 'var(--color-text-light)', 
          fontSize: '1.1rem',
          marginBottom: '1rem'
        }}>
          {season} gardening tasks for your Irish garden
        </p>
        
        {/* Quick Stats */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {seasonalGuide.currentMonth.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
              Current Tasks
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>
              {seasonalGuide.upcomingTasks.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
              Upcoming Tasks
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
              {plants.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
              Your Plants
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Tips */}
      {seasonalGuide.seasonalTips.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(255, 255, 255, 0.9))'
        }}>
          <h3 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '1.2rem',
            fontWeight: 600
          }}>
            💡 Seasonal Tips
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {seasonalGuide.seasonalTips.map((tip, index) => (
              <div key={index} style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid var(--color-primary)',
                fontSize: '0.95rem'
              }}>
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Month Tasks */}
      <div style={{ marginBottom: '1.5rem' }}>
        <MonthlyTaskList 
          title={`${monthName} Tasks`}
          tasks={seasonalGuide.currentMonth}
          priority="current"
        />
      </div>

      {/* Upcoming Tasks */}
      {seasonalGuide.upcomingTasks.length > 0 && (
        <div>
          <MonthlyTaskList 
            title="Coming Up Next Month"
            tasks={seasonalGuide.upcomingTasks}
            priority="upcoming"
          />
        </div>
      )}

      {/* Empty State */}
      {seasonalGuide.currentMonth.length === 0 && seasonalGuide.upcomingTasks.length === 0 && (
        <div className="glass-panel" style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.1), rgba(255, 255, 255, 0.9))'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-light)' }}>
            No specific tasks this month
          </h3>
          <p style={{ color: 'var(--color-text-light)' }}>
            Enjoy maintaining your current plants and planning for the seasons ahead!
          </p>
        </div>
      )}
    </div>
  );
}