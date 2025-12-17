"use client";

import React, { useState, useEffect } from 'react';
import { useGarden } from '@/context/GardenContext';
import { seasonalTaskService } from '@/services/seasonalTaskService';
import { TaskRecommendation, SeasonalRecommendationContext } from '@/types/seasonal';
import { PlantCategory } from '@/types/plant';
import { 
  getCurrentMonth, 
  getPriorityColor, 
  getCategoryIcon,
  isTaskUrgent,
  formatTaskDescription
} from '@/utils/seasonalUtils';

interface TaskReminderProps {
  maxReminders?: number;
  showOnlyUrgent?: boolean;
  onTaskComplete?: (taskId: string) => void;
}

export default function TaskReminder({ 
  maxReminders = 3, 
  showOnlyUrgent = false,
  onTaskComplete 
}: TaskReminderProps) {
  const { plants } = useGarden();
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTaskRecommendations();
    loadCompletedTasks();
  }, [plants]);

  const loadTaskRecommendations = async () => {
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
        climateZone: 'ireland',
        userPreferences: {
          skipLowPriority: showOnlyUrgent
        }
      };

      const taskRecommendations = await seasonalTaskService.getTaskRecommendations(context);
      
      // Filter by urgency if requested
      const filteredRecommendations = showOnlyUrgent 
        ? taskRecommendations.filter(rec => rec.urgency === 'immediate' || isTaskUrgent(rec.task))
        : taskRecommendations;

      setRecommendations(filteredRecommendations.slice(0, maxReminders));
    } catch (err) {
      console.error('Error loading task recommendations:', err);
      setError('Failed to load task reminders.');
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedTasks = () => {
    // Load completed tasks from localStorage
    const stored = localStorage.getItem('completedSeasonalTasks');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCompletedTasks(new Set(parsed));
      } catch (err) {
        console.error('Error parsing completed tasks:', err);
      }
    }
  };

  const markTaskComplete = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    newCompleted.add(taskId);
    setCompletedTasks(newCompleted);
    
    // Save to localStorage
    localStorage.setItem('completedSeasonalTasks', JSON.stringify(Array.from(newCompleted)));
    
    // Call callback if provided
    if (onTaskComplete) {
      onTaskComplete(taskId);
    }

    // Remove from recommendations
    setRecommendations(prev => prev.filter(rec => rec.task.id !== taskId));
  };

  const dismissReminder = (taskId: string) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(taskId);
    setDismissed(newDismissed);
  };

  const undoTaskComplete = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    newCompleted.delete(taskId);
    setCompletedTasks(newCompleted);
    
    // Save to localStorage
    localStorage.setItem('completedSeasonalTasks', JSON.stringify(Array.from(newCompleted)));
    
    // Reload recommendations to show the task again
    loadTaskRecommendations();
  };

  const getUrgencyStyle = (urgency: TaskRecommendation['urgency']) => {
    const styles = {
      immediate: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: '#ef4444',
        pulseColor: '#ef4444'
      },
      this_week: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: '#f59e0b',
        pulseColor: '#f59e0b'
      },
      this_month: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        pulseColor: '#3b82f6'
      }
    };
    return styles[urgency];
  };

  const getUrgencyLabel = (urgency: TaskRecommendation['urgency']) => {
    const labels = {
      immediate: '🚨 Urgent',
      this_week: '⏰ This Week',
      this_month: '📅 This Month'
    };
    return labels[urgency];
  };

  // Filter out completed and dismissed tasks
  const visibleRecommendations = recommendations.filter(rec => 
    !completedTasks.has(rec.task.id) && !dismissed.has(rec.task.id)
  );

  if (loading) {
    return (
      <div className="glass-panel animate-fade-in" style={{ 
        padding: '1rem', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(255, 255, 255, 0.9))'
      }}>
        <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>🔔</div>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
          Loading reminders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ 
        padding: '1rem', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(255, 255, 255, 0.9))'
      }}>
        <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>⚠️</div>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-error)' }}>{error}</p>
      </div>
    );
  }

  if (visibleRecommendations.length === 0) {
    return (
      <div className="glass-panel animate-fade-in" style={{ 
        padding: '1.5rem', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(255, 255, 255, 0.9))'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
        <h4 style={{ marginBottom: '0.25rem', color: 'var(--color-primary-dark)' }}>
          All caught up!
        </h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
          No urgent gardening tasks at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="task-reminder">
      {/* Header */}
      <div className="glass-panel animate-fade-in" style={{
        padding: '1rem',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(255, 255, 255, 0.9))',
        textAlign: 'center'
      }}>
        <h3 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '0.25rem',
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          🔔 Garden Reminders
        </h3>
        <p style={{ 
          color: 'var(--color-text-light)', 
          fontSize: '0.9rem'
        }}>
          {visibleRecommendations.length} task{visibleRecommendations.length !== 1 ? 's' : ''} need your attention
        </p>
      </div>

      {/* Reminder Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {visibleRecommendations.map((recommendation, index) => {
          const urgencyStyle = getUrgencyStyle(recommendation.urgency);
          
          return (
            <div
              key={recommendation.task.id}
              className="glass-panel animate-fade-in"
              style={{
                padding: '1rem',
                background: urgencyStyle.backgroundColor,
                border: `2px solid ${urgencyStyle.borderColor}`,
                borderRadius: 'var(--radius-sm)',
                position: 'relative',
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Urgency Indicator */}
              {recommendation.urgency === 'immediate' && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: urgencyStyle.pulseColor,
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
              )}

              {/* Task Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '0.75rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ 
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.4rem',
                      backgroundColor: urgencyStyle.borderColor,
                      color: 'white',
                      borderRadius: 'var(--radius-xs)',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {getUrgencyLabel(recommendation.urgency)}
                    </span>
                    
                    <span style={{ 
                      fontSize: '0.8rem',
                      color: 'var(--color-text-light)'
                    }}>
                      Score: {recommendation.relevanceScore}
                    </span>
                  </div>
                  
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    marginBottom: '0.25rem',
                    color: 'var(--color-primary-dark)'
                  }}>
                    {recommendation.task.title}
                  </h4>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-light)',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem' 
                    }}>
                      {getCategoryIcon(recommendation.task.category)}
                      {recommendation.task.category}
                    </span>
                    
                    <span style={{ 
                      padding: '0.1rem 0.3rem',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: getPriorityColor(recommendation.task.priority),
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {recommendation.task.priority}
                    </span>
                    
                    {recommendation.userPlantMatch && (
                      <span style={{ color: 'var(--color-primary)' }}>
                        🌱 Matches your plants
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => dismissReminder(recommendation.task.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    color: 'var(--color-text-light)',
                    padding: '0.25rem'
                  }}
                  title="Dismiss reminder"
                >
                  ✕
                </button>
              </div>

              {/* Task Description */}
              {recommendation.task.description && (
                <p style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.4,
                  marginBottom: '1rem',
                  color: 'var(--color-text)'
                }}>
                  {formatTaskDescription(recommendation.task)}
                </p>
              )}

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => markTaskComplete(recommendation.task.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  ✓ Mark Complete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Tasks Summary */}
      {completedTasks.size > 0 && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '1rem',
          marginTop: '1rem',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(255, 255, 255, 0.9))',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--color-text-light)',
            marginBottom: '0.5rem'
          }}>
            ✅ {completedTasks.size} task{completedTasks.size !== 1 ? 's' : ''} completed this session
          </p>
          
          <button
            onClick={() => {
              setCompletedTasks(new Set());
              localStorage.removeItem('completedSeasonalTasks');
              loadTaskRecommendations();
            }}
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: 'transparent',
              color: 'var(--color-text-light)',
              border: '1px solid var(--color-text-light)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Reset Completed Tasks
          </button>
        </div>
      )}

      {/* Add pulse animation styles */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}