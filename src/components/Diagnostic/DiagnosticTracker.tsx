"use client";

import React, { useState, useEffect } from 'react';
import { PlantDiagnostic } from '@/types/plant';
import { PlantDiagnosticService } from '@/services/plantDiagnosticService';

interface DiagnosticTrackerProps {
  userId: string;
  onViewDiagnostic?: (diagnostic: PlantDiagnostic) => void;
}

interface DiagnosticWithPlant extends PlantDiagnostic {
  plants?: {
    id: string;
    name: string;
    nickname?: string;
    imageUrl?: string;
  };
}

export default function DiagnosticTracker({ userId, onViewDiagnostic }: DiagnosticTrackerProps) {
  const [activeDiagnostics, setActiveDiagnostics] = useState<DiagnosticWithPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadActiveDiagnostics();
  }, [userId]);

  const loadActiveDiagnostics = async () => {
    setLoading(true);
    try {
      const diagnostics = await PlantDiagnosticService.getUserDiagnostics(userId);
      const activeDiagnostics = diagnostics.filter(d => !d.resolved);
      setActiveDiagnostics(activeDiagnostics);
    } catch (error) {
      console.error('Error loading active diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async (diagnosticId: string) => {
    try {
      const success = await PlantDiagnosticService.updateDiagnosticStatus(diagnosticId, true);
      if (success) {
        setActiveDiagnostics(prev => prev.filter(d => d.id !== diagnosticId));
      }
    } catch (error) {
      console.error('Error resolving diagnostic:', error);
    }
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyLevel = (diagnostic: DiagnosticWithPlant) => {
    const daysAgo = getDaysAgo(diagnostic.createdAt);
    const criticalSymptoms = ['root-rot', 'black-stem-base', 'soft-mushy-stem'];
    const hasCritical = diagnostic.symptoms.some(symptom => criticalSymptoms.includes(symptom));
    
    if (hasCritical && daysAgo >= 3) return 'critical';
    if (daysAgo >= 7) return 'high';
    if (daysAgo >= 3) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'Critical - Needs Immediate Attention';
      case 'high': return 'High Priority - Check Progress';
      case 'medium': return 'Medium Priority - Monitor';
      case 'low': return 'Low Priority - Recent';
      default: return 'Monitor';
    }
  };

  const sortedDiagnostics = [...activeDiagnostics].sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const aUrgency = getUrgencyLevel(a);
    const bUrgency = getUrgencyLevel(b);
    return urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
  });

  const displayedDiagnostics = showAll ? sortedDiagnostics : sortedDiagnostics.slice(0, 3);

  if (loading) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--color-background-light)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🩺</span>
          <span style={{ color: 'var(--color-text-light)' }}>Loading active diagnostics...</span>
        </div>
      </div>
    );
  }

  if (activeDiagnostics.length === 0) {
    return (
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'var(--color-success-light)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-success)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-success-dark)' }}>
          All Plants Healthy!
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
          No active health issues to track. Keep up the great plant care!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--color-background)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--color-border)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--color-background-light)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ 
            margin: 0, 
            color: 'var(--color-primary-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🩺 Active Health Issues
          </h3>
          <span style={{
            backgroundColor: activeDiagnostics.length > 0 ? '#ea580c' : 'var(--color-success)',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            {activeDiagnostics.length} Active
          </span>
        </div>
      </div>

      {/* Diagnostics List */}
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {displayedDiagnostics.map((diagnostic) => {
            const urgency = getUrgencyLevel(diagnostic);
            const daysAgo = getDaysAgo(diagnostic.createdAt);
            
            return (
              <div
                key={diagnostic.id}
                style={{
                  padding: '1rem',
                  border: `1px solid ${getUrgencyColor(urgency)}`,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: `${getUrgencyColor(urgency)}10`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  {/* Plant Image */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundImage: `url(${diagnostic.plants?.imageUrl || 'https://images.unsplash.com/photo-1416879115533-1963293d17d4?auto=format&fit=crop&w=100&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0
                  }} />
                  
                  <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <h4 style={{ 
                          margin: '0 0 0.25rem 0', 
                          fontSize: '1rem',
                          color: 'var(--color-text)'
                        }}>
                          {diagnostic.plants?.nickname || diagnostic.plants?.name || 'Unknown Plant'}
                        </h4>
                        <p style={{ 
                          margin: 0, 
                          fontSize: '0.85rem', 
                          color: 'var(--color-text-light)' 
                        }}>
                          {diagnostic.diagnosis || 'Health issue'} • {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago
                        </p>
                      </div>
                      
                      <span style={{
                        backgroundColor: getUrgencyColor(urgency),
                        color: 'white',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {urgency}
                      </span>
                    </div>

                    {/* Urgency Message */}
                    <p style={{ 
                      margin: '0 0 0.75rem 0', 
                      fontSize: '0.8rem', 
                      color: getUrgencyColor(urgency),
                      fontWeight: 500
                    }}>
                      {getUrgencyLabel(urgency)}
                    </p>

                    {/* Symptoms Preview */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {diagnostic.symptoms.slice(0, 3).map((symptom, index) => (
                          <span
                            key={index}
                            style={{
                              padding: '0.125rem 0.5rem',
                              backgroundColor: 'var(--color-background)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '0.75rem',
                              fontSize: '0.7rem',
                              color: 'var(--color-text-light)'
                            }}
                          >
                            {symptom.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                        {diagnostic.symptoms.length > 3 && (
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            fontSize: '0.7rem',
                            color: 'var(--color-text-light)'
                          }}>
                            +{diagnostic.symptoms.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {onViewDiagnostic && (
                        <button
                          onClick={() => onViewDiagnostic(diagnostic)}
                          style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-text)',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          👁️ View Details
                        </button>
                      )}
                      <button
                        onClick={() => handleMarkResolved(diagnostic.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-success)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        ✓ Mark Resolved
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {activeDiagnostics.length > 3 && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {showAll ? 'Show Less' : `Show All ${activeDiagnostics.length} Issues`}
            </button>
          </div>
        )}
      </div>

      {/* Footer with Summary */}
      <div style={{
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--color-background-light)',
        borderTop: '1px solid var(--color-border)',
        fontSize: '0.8rem',
        color: 'var(--color-text-light)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            Critical: {sortedDiagnostics.filter(d => getUrgencyLevel(d) === 'critical').length} • 
            High: {sortedDiagnostics.filter(d => getUrgencyLevel(d) === 'high').length}
          </span>
          <span>
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}