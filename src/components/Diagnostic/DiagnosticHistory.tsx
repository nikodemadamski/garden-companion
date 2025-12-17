"use client";

import React, { useState, useEffect } from 'react';
import { Plant, PlantDiagnostic } from '@/types/plant';
import { PlantDiagnosticService } from '@/services/plantDiagnosticService';

interface DiagnosticHistoryProps {
  plant: Plant;
  isOpen: boolean;
  onClose: () => void;
  onViewDiagnostic?: (diagnostic: PlantDiagnostic) => void;
}

export default function DiagnosticHistory({ plant, isOpen, onClose, onViewDiagnostic }: DiagnosticHistoryProps) {
  const [diagnostics, setDiagnostics] = useState<PlantDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'resolved' | 'active'>('all');

  useEffect(() => {
    if (isOpen) {
      loadDiagnostics();
    }
  }, [isOpen, plant.id]);

  const loadDiagnostics = async () => {
    setLoading(true);
    try {
      const history = await PlantDiagnosticService.getDiagnosticHistory(plant.id);
      setDiagnostics(history);
    } catch (error) {
      console.error('Error loading diagnostic history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolved = async (diagnosticId: string, currentStatus: boolean) => {
    try {
      const success = await PlantDiagnosticService.updateDiagnosticStatus(diagnosticId, !currentStatus);
      if (success) {
        setDiagnostics(prev => 
          prev.map(d => 
            d.id === diagnosticId ? { ...d, resolved: !currentStatus } : d
          )
        );
      }
    } catch (error) {
      console.error('Error updating diagnostic status:', error);
    }
  };

  const filteredDiagnostics = diagnostics.filter(diagnostic => {
    switch (filter) {
      case 'resolved': return diagnostic.resolved;
      case 'active': return !diagnostic.resolved;
      default: return true;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (symptoms: string[]) => {
    // Determine severity based on symptom types
    const criticalSymptoms = ['root-rot', 'black-stem-base', 'soft-mushy-stem'];
    const hasCritical = symptoms.some(symptom => criticalSymptoms.includes(symptom));
    
    if (hasCritical) return '#dc2626'; // Red for critical
    if (symptoms.length >= 3) return '#ea580c'; // Orange for multiple symptoms
    return '#059669'; // Green for minor issues
  };

  const getSeverityLabel = (symptoms: string[]) => {
    const criticalSymptoms = ['root-rot', 'black-stem-base', 'soft-mushy-stem'];
    const hasCritical = symptoms.some(symptom => criticalSymptoms.includes(symptom));
    
    if (hasCritical) return 'Critical';
    if (symptoms.length >= 3) return 'Moderate';
    return 'Minor';
  };

  if (!isOpen) return null;

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
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '1rem'
          }}>
            <div>
              <h2 style={{ 
                margin: '0 0 0.5rem 0', 
                color: 'var(--color-primary-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📋 Diagnostic History
              </h2>
              <p style={{ 
                margin: 0, 
                color: 'var(--color-text-light)',
                fontSize: '0.9rem'
              }}>
                Track health issues and treatments for {plant.nickname || plant.name}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--color-text-light)',
                padding: '0.25rem'
              }}
            >
              ×
            </button>
          </div>

          {/* Plant Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem',
            backgroundColor: 'var(--color-background-light)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundImage: `url(${plant.imageUrl || 'https://images.unsplash.com/photo-1416879115533-1963293d17d4?auto=format&fit=crop&w=100&q=80'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                {plant.nickname || plant.name}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                {plant.species} • {plant.location}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { key: 'all', label: 'All', count: diagnostics.length },
              { key: 'active', label: 'Active', count: diagnostics.filter(d => !d.resolved).length },
              { key: 'resolved', label: 'Resolved', count: diagnostics.filter(d => d.resolved).length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                style={{
                  padding: '0.5rem 1rem',
                  border: `1px solid ${filter === tab.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: filter === tab.key ? 'var(--color-primary-light)' : 'var(--color-background)',
                  color: filter === tab.key ? 'var(--color-primary-dark)' : 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: filter === tab.key ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {tab.label}
                <span style={{
                  backgroundColor: filter === tab.key ? 'var(--color-primary)' : 'var(--color-border)',
                  color: filter === tab.key ? 'white' : 'var(--color-text-light)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '1rem',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem',
              color: 'var(--color-text-light)'
            }}>
              Loading diagnostic history...
            </div>
          ) : filteredDiagnostics.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--color-text-light)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🩺</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>
                {filter === 'all' ? 'No Diagnostics Yet' : 
                 filter === 'active' ? 'No Active Issues' : 'No Resolved Issues'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {filter === 'all' 
                  ? 'Start your first plant health check to track issues and treatments.'
                  : filter === 'active'
                  ? 'Great! Your plant has no active health issues.'
                  : 'No resolved diagnostics to show.'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredDiagnostics.map((diagnostic) => (
                <div
                  key={diagnostic.id}
                  style={{
                    border: `1px solid ${diagnostic.resolved ? 'var(--color-success)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: diagnostic.resolved ? 'var(--color-success-light)' : 'var(--color-background)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Diagnostic Header */}
                  <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: diagnostic.resolved ? 'var(--color-success-light)' : 'var(--color-background-light)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <span style={{
                            backgroundColor: getSeverityColor(diagnostic.symptoms),
                            color: 'white',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {getSeverityLabel(diagnostic.symptoms)}
                          </span>
                          {diagnostic.resolved && (
                            <span style={{
                              backgroundColor: 'var(--color-success)',
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              ✓ RESOLVED
                            </span>
                          )}
                        </div>
                        <h3 style={{ 
                          margin: '0 0 0.25rem 0', 
                          fontSize: '1.1rem',
                          color: diagnostic.resolved ? 'var(--color-success-dark)' : 'var(--color-text)'
                        }}>
                          {diagnostic.diagnosis || 'General Health Check'}
                        </h3>
                        <p style={{ 
                          margin: 0, 
                          fontSize: '0.85rem', 
                          color: 'var(--color-text-light)' 
                        }}>
                          {formatDate(diagnostic.createdAt)}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {onViewDiagnostic && (
                          <button
                            onClick={() => onViewDiagnostic(diagnostic)}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-background)',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            👁️ View
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleResolved(diagnostic.id, diagnostic.resolved)}
                          style={{
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: diagnostic.resolved ? 'var(--color-border)' : 'var(--color-success)',
                            color: diagnostic.resolved ? 'var(--color-text)' : 'white',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          {diagnostic.resolved ? '↩️ Reopen' : '✓ Resolve'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Content */}
                  <div style={{ padding: '1rem' }}>
                    {/* Symptoms */}
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ 
                        margin: '0 0 0.5rem 0', 
                        fontSize: '0.9rem',
                        color: 'var(--color-text-light)'
                      }}>
                        Reported Symptoms:
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {diagnostic.symptoms.map((symptom, index) => (
                          <span
                            key={index}
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: 'var(--color-background-light)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '1rem',
                              fontSize: '0.8rem',
                              color: 'var(--color-text)'
                            }}
                          >
                            {symptom.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Treatment Plan Summary */}
                    {diagnostic.treatmentPlan && (
                      <div>
                        <h4 style={{ 
                          margin: '0 0 0.5rem 0', 
                          fontSize: '0.9rem',
                          color: 'var(--color-text-light)'
                        }}>
                          Treatment Plan:
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>
                          {diagnostic.treatmentPlan.immediateActions && diagnostic.treatmentPlan.immediateActions.length > 0 && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>Immediate:</strong> {diagnostic.treatmentPlan.immediateActions.slice(0, 2).join(', ')}
                              {diagnostic.treatmentPlan.immediateActions.length > 2 && '...'}
                            </div>
                          )}
                          {diagnostic.treatmentPlan.ongoingCare && diagnostic.treatmentPlan.ongoingCare.length > 0 && (
                            <div>
                              <strong>Ongoing:</strong> {diagnostic.treatmentPlan.ongoingCare.slice(0, 2).join(', ')}
                              {diagnostic.treatmentPlan.ongoingCare.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
            {filteredDiagnostics.length} {filter === 'all' ? 'total' : filter} diagnostic{filteredDiagnostics.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}