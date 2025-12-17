"use client";

import React, { useState, useEffect } from 'react';
import { useGarden } from '@/context/GardenContext';
import { seasonalTaskService } from '@/services/seasonalTaskService';
import { SeasonalTask, SeasonalRecommendationContext } from '@/types/seasonal';
import { PlantCategory } from '@/types/plant';
import { 
  getMonthName, 
  getSeasonEmoji, 
  getCurrentMonth,
  getPriorityColor,
  getCategoryIcon,
  groupTasksByMonth
} from '@/utils/seasonalUtils';

export default function SeasonalCalendar() {
  const { plants } = useGarden();
  const [tasks, setTasks] = useState<SeasonalTask[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(getCurrentMonth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadYearlyTasks();
  }, [plants]);

  const loadYearlyTasks = async () => {
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

      // Get all tasks for the year
      const allTasks = await seasonalTaskService.getSeasonalTasks({
        climate_zone: 'ireland'
      });

      // Filter tasks relevant to user's plants
      const relevantTasks = allTasks.filter(task => {
        if (!task.plant_types || task.plant_types.includes('all')) {
          return true;
        }
        return task.plant_types.some(plantType => userPlantTypes.includes(plantType as PlantCategory));
      });

      setTasks(relevantTasks);
    } catch (err) {
      console.error('Error loading yearly tasks:', err);
      setError('Failed to load calendar data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const groupedTasks = groupTasksByMonth(tasks);
  const currentMonth = getCurrentMonth();

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getMonthTaskSummary = (month: number) => {
    const monthTasks = groupedTasks[month] || [];
    const highPriority = monthTasks.filter(t => t.priority === 'high').length;
    const totalTasks = monthTasks.length;
    
    return { totalTasks, highPriority, tasks: monthTasks };
  };

  const getMonthCardStyle = (month: number) => {
    const isCurrentMonth = month === currentMonth;
    const isSelectedMonth = month === selectedMonth;
    const { totalTasks, highPriority } = getMonthTaskSummary(month);
    
    let backgroundColor = 'rgba(255, 255, 255, 0.8)';
    let borderColor = 'rgba(0, 0, 0, 0.1)';
    
    if (isCurrentMonth) {
      backgroundColor = 'rgba(34, 197, 94, 0.1)';
      borderColor = 'var(--color-primary)';
    } else if (isSelectedMonth) {
      backgroundColor = 'rgba(59, 130, 246, 0.1)';
      borderColor = 'var(--color-secondary)';
    } else if (highPriority > 0) {
      backgroundColor = 'rgba(239, 68, 68, 0.05)';
    }

    return {
      padding: '1rem',
      borderRadius: 'var(--radius-sm)',
      backgroundColor,
      border: `2px solid ${borderColor}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column' as const
    };
  };

  if (loading) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📅</div>
        <p>Loading seasonal calendar...</p>
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
          onClick={loadYearlyTasks}
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

  const selectedMonthTasks = groupedTasks[selectedMonth] || [];

  return (
    <div className="seasonal-calendar">
      {/* Header */}
      <div className="glass-panel animate-fade-in" style={{
        padding: '1.5rem',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(255, 255, 255, 0.9))',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          fontSize: '1.6rem',
          fontWeight: 700
        }}>
          📅 Seasonal Calendar
        </h2>
        <p style={{ 
          color: 'var(--color-text-light)', 
          fontSize: '1rem'
        }}>
          Year-round gardening tasks for your Irish garden
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel animate-fade-in" style={{
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {months.map(month => {
            const { totalTasks, highPriority } = getMonthTaskSummary(month);
            
            return (
              <div
                key={month}
                style={getMonthCardStyle(month)}
                onClick={() => setSelectedMonth(month)}
                onMouseEnter={(e) => {
                  if (month !== currentMonth && month !== selectedMonth) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (month !== currentMonth && month !== selectedMonth) {
                    e.currentTarget.style.backgroundColor = getMonthCardStyle(month).backgroundColor;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Month Header */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <h3 style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    marginBottom: '0.25rem'
                  }}>
                    {getSeasonEmoji(month)} {getMonthName(month)}
                    {month === currentMonth && (
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.4rem',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: 'var(--radius-xs)',
                        fontWeight: 600
                      }}>
                        NOW
                      </span>
                    )}
                  </h3>
                  
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--color-text-light)',
                    display: 'flex',
                    gap: '1rem'
                  }}>
                    <span>{totalTasks} tasks</span>
                    {highPriority > 0 && (
                      <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>
                        {highPriority} urgent
                      </span>
                    )}
                  </div>
                </div>

                {/* Task Preview */}
                <div style={{ flex: 1 }}>
                  {totalTasks === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      color: 'var(--color-text-light)',
                      fontSize: '0.9rem',
                      fontStyle: 'italic'
                    }}>
                      No specific tasks
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {(groupedTasks[month] || []).slice(0, 3).map(task => (
                        <div key={task.id} style={{
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.25rem',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'rgba(255, 255, 255, 0.5)'
                        }}>
                          <div style={{
                            width: '3px',
                            height: '12px',
                            backgroundColor: getPriorityColor(task.priority),
                            borderRadius: '1px'
                          }} />
                          <span>{getCategoryIcon(task.category)}</span>
                          <span style={{ 
                            flex: 1, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                      
                      {totalTasks > 3 && (
                        <div style={{
                          fontSize: '0.7rem',
                          color: 'var(--color-text-light)',
                          textAlign: 'center',
                          marginTop: '0.25rem'
                        }}>
                          +{totalTasks - 3} more tasks
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Month Details */}
      {selectedMonthTasks.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(255, 255, 255, 0.95))'
        }}>
          <h3 style={{ 
            fontSize: '1.3rem', 
            fontWeight: 600, 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {getSeasonEmoji(selectedMonth)} {getMonthName(selectedMonth)} Tasks
            <span style={{ 
              fontSize: '0.8rem', 
              color: 'var(--color-text-light)',
              fontWeight: 400
            }}>
              ({selectedMonthTasks.length} tasks)
            </span>
          </h3>

          <div style={{ 
            display: 'grid', 
            gap: '0.75rem'
          }}>
            {selectedMonthTasks.map(task => (
              <div key={task.id} style={{
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    marginBottom: '0.25rem',
                    color: 'var(--color-primary-dark)'
                  }}>
                    {task.title}
                  </h4>
                  
                  {task.description && (
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: 'var(--color-text)', 
                      marginBottom: '0.5rem',
                      lineHeight: 1.4
                    }}>
                      {task.description}
                    </p>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-light)'
                  }}>
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem' 
                    }}>
                      {getCategoryIcon(task.category)}
                      {task.category}
                    </span>
                    
                    {task.plant_types && task.plant_types.length > 0 && !task.plant_types.includes('all') && (
                      <span>
                        🌱 {task.plant_types.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ 
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: getPriorityColor(task.priority),
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  marginLeft: '1rem'
                }}>
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}