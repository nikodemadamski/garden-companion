"use client";

import React, { useState } from 'react';
import { Plant } from '@/types/plant';
import { DiagnosticResult } from '@/services/plantDiagnosticService';
import PotRecommendations from './PotRecommendations';

interface TreatmentPlanProps {
  result: DiagnosticResult;
  plant: Plant;
  onBack: () => void;
}

export default function TreatmentPlan({ result, plant, onBack }: TreatmentPlanProps) {
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'immediate' | 'ongoing' | 'schedule'>('immediate');

  const handleActionToggle = (actionId: string) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(actionId)) {
      newCompleted.delete(actionId);
    } else {
      newCompleted.add(actionId);
    }
    setCompletedActions(newCompleted);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return '#dc2626';
      case 'within_days': return '#ea580c';
      case 'ongoing': return '#059669';
      default: return '#6b7280';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return '🚨';
      case 'within_days': return '⏰';
      case 'ongoing': return '🔄';
      default: return '📝';
    }
  };

  const immediateActions = result.recommendedActions.filter(action => action.urgency === 'immediate');
  const ongoingActions = result.recommendedActions.filter(action => action.urgency !== 'immediate');

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Treatment Plan Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={onBack}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--color-border)',
              borderRadius: '50%',
              backgroundColor: 'var(--color-background)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
          <h2 style={{ 
            margin: 0,
            color: 'var(--color-primary-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📋 Treatment Plan for {plant.nickname || plant.name}
          </h2>
        </div>

        {result.possibleCauses.length > 0 && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary-dark)' }}>
              Primary Diagnosis: {result.possibleCauses[0].name}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
              This treatment plan addresses the most likely cause based on your selected symptoms.
            </p>
          </div>
        )}
      </div>

      {/* Treatment Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--color-border)'
        }}>
          {[
            { key: 'immediate', label: 'Immediate Actions', count: immediateActions.length },
            { key: 'ongoing', label: 'Ongoing Care', count: ongoingActions.length },
            { key: 'schedule', label: 'Follow-up Schedule', count: result.followUpSchedule.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '0.75rem 1rem',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.key ? 'var(--color-primary)' : 'transparent'}`,
                backgroundColor: 'transparent',
                color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-light)',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {tab.label}
              <span style={{
                backgroundColor: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-border)',
                color: activeTab === tab.key ? 'white' : 'var(--color-text-light)',
                padding: '0.125rem 0.5rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Immediate Actions Tab */}
        {activeTab === 'immediate' && (
          <div>
            {immediateActions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {immediateActions.map((action, index) => {
                  const actionId = `immediate-${index}`;
                  const isCompleted = completedActions.has(actionId);
                  
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '1.5rem',
                        border: `2px solid ${isCompleted ? 'var(--color-success)' : '#fecaca'}`,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isCompleted ? 'var(--color-success-light)' : '#fef2f2'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <button
                          onClick={() => handleActionToggle(actionId)}
                          style={{
                            width: '1.5rem',
                            height: '1.5rem',
                            borderRadius: '0.25rem',
                            border: `2px solid ${isCompleted ? 'var(--color-success)' : '#dc2626'}`,
                            backgroundColor: isCompleted ? 'var(--color-success)' : 'transparent',
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
                            gap: '0.75rem',
                            marginBottom: '0.75rem'
                          }}>
                            <span style={{ fontSize: '1.25rem' }}>{getUrgencyIcon(action.urgency)}</span>
                            <h3 style={{ 
                              margin: 0, 
                              color: isCompleted ? 'var(--color-success-dark)' : '#dc2626',
                              textDecoration: isCompleted ? 'line-through' : 'none'
                            }}>
                              {action.action}
                            </h3>
                            <span style={{
                              backgroundColor: getUrgencyColor(action.urgency),
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              textTransform: 'uppercase'
                            }}>
                              {action.urgency.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div style={{ marginBottom: '1rem' }}>
                            <h4 style={{ 
                              margin: '0 0 0.5rem 0', 
                              fontSize: '0.9rem',
                              color: 'var(--color-text-light)'
                            }}>
                              Instructions:
                            </h4>
                            <ol style={{ 
                              margin: 0, 
                              paddingLeft: '1.25rem',
                              fontSize: '0.9rem'
                            }}>
                              {action.instructions.map((instruction, idx) => (
                                <li key={idx} style={{ 
                                  marginBottom: '0.5rem',
                                  textDecoration: isCompleted ? 'line-through' : 'none',
                                  opacity: isCompleted ? 0.7 : 1
                                }}>
                                  {instruction}
                                </li>
                              ))}
                            </ol>
                          </div>

                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '1rem',
                            fontSize: '0.85rem'
                          }}>
                            <div>
                              <strong>Expected Results:</strong>
                              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-light)' }}>
                                {action.expectedResults}
                              </p>
                            </div>
                            <div>
                              <strong>Timeframe:</strong>
                              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-light)' }}>
                                {action.timeframe}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-background-light)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)'
              }}>
                <p style={{ margin: 0, color: 'var(--color-text-light)' }}>
                  No immediate actions required. Your plant's issues can be addressed with ongoing care.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Ongoing Care Tab */}
        {activeTab === 'ongoing' && (
          <div>
            {ongoingActions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ongoingActions.map((action, index) => {
                  const actionId = `ongoing-${index}`;
                  const isCompleted = completedActions.has(actionId);
                  
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '1.5rem',
                        border: `1px solid ${isCompleted ? 'var(--color-success)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isCompleted ? 'var(--color-success-light)' : 'var(--color-background)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '1rem'
                      }}>
                        <button
                          onClick={() => handleActionToggle(actionId)}
                          style={{
                            width: '1.5rem',
                            height: '1.5rem',
                            borderRadius: '0.25rem',
                            border: `2px solid ${isCompleted ? 'var(--color-success)' : getUrgencyColor(action.urgency)}`,
                            backgroundColor: isCompleted ? 'var(--color-success)' : 'transparent',
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
                            gap: '0.75rem',
                            marginBottom: '0.75rem'
                          }}>
                            <span style={{ fontSize: '1.25rem' }}>{getUrgencyIcon(action.urgency)}</span>
                            <h3 style={{ 
                              margin: 0, 
                              color: isCompleted ? 'var(--color-success-dark)' : 'var(--color-text)',
                              textDecoration: isCompleted ? 'line-through' : 'none'
                            }}>
                              {action.action}
                            </h3>
                            <span style={{
                              backgroundColor: getUrgencyColor(action.urgency),
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              textTransform: 'capitalize'
                            }}>
                              {action.urgency.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <ul style={{ 
                            margin: '0 0 1rem 0', 
                            paddingLeft: '1.25rem',
                            fontSize: '0.9rem'
                          }}>
                            {action.instructions.map((instruction, idx) => (
                              <li key={idx} style={{ 
                                marginBottom: '0.5rem',
                                textDecoration: isCompleted ? 'line-through' : 'none',
                                opacity: isCompleted ? 0.7 : 1
                              }}>
                                {instruction}
                              </li>
                            ))}
                          </ul>

                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '1rem',
                            fontSize: '0.85rem'
                          }}>
                            <div>
                              <strong>Expected Results:</strong>
                              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-light)' }}>
                                {action.expectedResults}
                              </p>
                            </div>
                            <div>
                              <strong>Timeframe:</strong>
                              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-light)' }}>
                                {action.timeframe}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-background-light)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)'
              }}>
                <p style={{ margin: 0, color: 'var(--color-text-light)' }}>
                  No ongoing care actions needed beyond regular plant maintenance.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Follow-up Schedule Tab */}
        {activeTab === 'schedule' && (
          <div>
            {result.followUpSchedule.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.followUpSchedule.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-background)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{item}</p>
                    </div>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: 'var(--color-background-light)',
                      borderRadius: '1rem',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-light)',
                      border: '1px solid var(--color-border)'
                    }}>
                      📅 Reminder
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-background-light)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)'
              }}>
                <p style={{ margin: 0, color: 'var(--color-text-light)' }}>
                  No specific follow-up schedule needed. Monitor your plant's progress regularly.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pot Recommendations */}
      {result.potRecommendations && result.potRecommendations.length > 0 && (
        <PotRecommendations 
          recommendations={result.potRecommendations}
          plant={plant}
        />
      )}

      {/* Progress Summary */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--color-background-light)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary-dark)' }}>
          Progress Summary
        </h4>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
          <div>
            <strong>Completed Actions:</strong> {completedActions.size}
          </div>
          <div>
            <strong>Total Actions:</strong> {result.recommendedActions.length}
          </div>
          <div>
            <strong>Progress:</strong> {result.recommendedActions.length > 0 ? Math.round((completedActions.size / result.recommendedActions.length) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
}