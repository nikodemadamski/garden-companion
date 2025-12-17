"use client";

import React, { useState } from 'react';
import { ProcessedAlert, PlantProtectionAction } from '@/types/weather';
import { WeatherAlertService } from '@/services/weatherAlertService';

interface WeatherActionModalProps {
  alerts: ProcessedAlert[];
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export default function WeatherActionModal({ alerts, isOpen, onClose, userId }: WeatherActionModalProps) {
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  if (!isOpen || alerts.length === 0) return null;

  const handleActionToggle = (actionId: string) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(actionId)) {
      newCompleted.delete(actionId);
    } else {
      newCompleted.add(actionId);
    }
    setCompletedActions(newCompleted);
  };

  const handleSaveActions = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      // Save completed actions for each alert
      for (const alertData of alerts) {
        const alertActions = Array.from(completedActions).filter(actionId => 
          actionId.startsWith(`${alertData.alert.id}-`)
        ).map(actionId => actionId.replace(`${alertData.alert.id}-`, ''));
        
        if (alertActions.length > 0) {
          await WeatherAlertService.updateAlertActions(alertData.alert.id, alertActions);
        }
      }
      onClose();
    } catch (error) {
      console.error('Failed to save actions:', error);
    } finally {
      setSaving(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'red': return '#dc2626';
      case 'orange': return '#ea580c';
      case 'yellow': return '#ca8a04';
      default: return '#6b7280';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return '#dc2626';
      case 'within_hours': return '#ea580c';
      case 'prepare': return '#059669';
      default: return '#6b7280';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return '🚨';
      case 'within_hours': return '⏰';
      case 'prepare': return '📋';
      default: return '📝';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-IE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '1.5rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>
            Weather Alert Actions
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--color-text-light)'
            }}
          >
            ×
          </button>
        </div>

        {alerts.map((alertData, alertIndex) => (
          <div key={alertData.alert.id} style={{ marginBottom: '2rem' }}>
            {/* Alert Header */}
            <div style={{
              padding: '1rem',
              backgroundColor: `${getSeverityColor(alertData.alert.severity)}15`,
              border: `1px solid ${getSeverityColor(alertData.alert.severity)}`,
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{
                  backgroundColor: getSeverityColor(alertData.alert.severity),
                  color: 'white',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {alertData.alert.severity}
                </span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {alertData.alert.alertType} Alert
                </span>
              </div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                {alertData.alert.description}
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                <div>Starts: {formatTime(alertData.alert.startTime)}</div>
                {alertData.alert.endTime && (
                  <div>Ends: {formatTime(alertData.alert.endTime)}</div>
                )}
              </div>
            </div>

            {/* Protection Actions */}
            <div>
              <h3 style={{ 
                margin: '0 0 1rem 0', 
                color: 'var(--color-primary-dark)',
                fontSize: '1.1rem'
              }}>
                Recommended Actions
              </h3>
              
              {alertData.protectionActions.map((action, actionIndex) => {
                const actionId = `${alertData.alert.id}-${actionIndex}`;
                const isCompleted = completedActions.has(actionId);
                
                return (
                  <div key={actionIndex} style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: isCompleted ? 'var(--color-success-light)' : 'var(--color-background)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <button
                        onClick={() => handleActionToggle(actionId)}
                        style={{
                          width: '1.5rem',
                          height: '1.5rem',
                          borderRadius: '0.25rem',
                          border: '2px solid var(--color-primary)',
                          backgroundColor: isCompleted ? 'var(--color-primary)' : 'transparent',
                          color: isCompleted ? 'white' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          flexShrink: 0,
                          marginTop: '0.125rem'
                        }}
                      >
                        ✓
                      </button>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          <span>{getUrgencyIcon(action.urgency)}</span>
                          <span style={{ fontWeight: 600 }}>{action.action}</span>
                          <span style={{
                            backgroundColor: getUrgencyColor(action.urgency),
                            color: 'white',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}>
                            {action.urgency.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
                          Plants: {action.plantTypes.join(', ')}
                        </div>
                        
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: '1.25rem',
                          fontSize: '0.9rem'
                        }}>
                          {action.instructions.map((instruction, idx) => (
                            <li key={idx} style={{ marginBottom: '0.25rem' }}>
                              {instruction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
          {userId && (
            <button
              onClick={handleSaveActions}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Progress'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}