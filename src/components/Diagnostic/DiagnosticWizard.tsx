"use client";

import React, { useState } from 'react';
import { Plant, PlantSymptom, SymptomCategory } from '@/types/plant';
import { PlantDiagnosticService, DiagnosticResult } from '@/services/plantDiagnosticService';
import SymptomSelector from './SymptomSelector';
import TreatmentPlan from './TreatmentPlan';

interface DiagnosticWizardProps {
  plant: Plant;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (symptoms: string[], result: DiagnosticResult) => void;
}

type WizardStep = 'symptoms' | 'results' | 'treatment';

export default function DiagnosticWizard({ plant, isOpen, onClose, onSave }: DiagnosticWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('symptoms');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSymptomsSelected = (symptoms: string[]) => {
    setSelectedSymptoms(symptoms);
    const result = PlantDiagnosticService.diagnose(symptoms);
    setDiagnosticResult(result);
    setCurrentStep('results');
  };

  const handleSaveDiagnostic = async () => {
    if (!diagnosticResult || selectedSymptoms.length === 0) return;

    setSaving(true);
    try {
      const diagnosis = diagnosticResult.possibleCauses.length > 0 
        ? diagnosticResult.possibleCauses[0].name 
        : 'General care needed';

      const treatmentPlan = {
        diagnosis,
        immediateActions: diagnosticResult.recommendedActions
          .filter(action => action.urgency === 'immediate')
          .map(action => action.action),
        ongoingCare: diagnosticResult.recommendedActions
          .filter(action => action.urgency !== 'immediate')
          .map(action => action.action),
        followUpSchedule: diagnosticResult.followUpSchedule,
        potRecommendations: diagnosticResult.potRecommendations
      };

      await PlantDiagnosticService.saveDiagnostic(
        plant.id,
        selectedSymptoms,
        diagnosis,
        treatmentPlan
      );

      if (onSave) {
        onSave(selectedSymptoms, diagnosticResult);
      }

      onClose();
    } catch (error) {
      console.error('Error saving diagnostic:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep('symptoms');
    setSelectedSymptoms([]);
    setDiagnosticResult(null);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'symptoms': return 'Describe the Symptoms';
      case 'results': return 'Diagnostic Results';
      case 'treatment': return 'Treatment Plan';
      default: return 'Plant Diagnostic';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'symptoms': 
        return `Select all symptoms you've noticed on ${plant.nickname || plant.name}. The more accurate your selection, the better the diagnosis.`;
      case 'results': 
        return 'Based on the symptoms, here are the most likely causes and recommended actions.';
      case 'treatment': 
        return 'Detailed treatment plan with step-by-step instructions.';
      default: 
        return '';
    }
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
        maxWidth: '800px',
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
                🩺 {getStepTitle()}
              </h2>
              <p style={{ 
                margin: 0, 
                color: 'var(--color-text-light)',
                fontSize: '0.9rem'
              }}>
                {getStepDescription()}
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
            border: '1px solid var(--color-border)'
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

          {/* Progress Steps */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {(['symptoms', 'results'] as WizardStep[]).map((step, index) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: currentStep === step ? 'var(--color-primary)' : 
                                   index < (['symptoms', 'results'] as WizardStep[]).indexOf(currentStep) ? 'var(--color-success)' : 'var(--color-border)',
                  color: currentStep === step || index < (['symptoms', 'results'] as WizardStep[]).indexOf(currentStep) ? 'white' : 'var(--color-text-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {index < (['symptoms', 'results'] as WizardStep[]).indexOf(currentStep) ? '✓' : index + 1}
                </div>
                <span style={{
                  fontSize: '0.85rem',
                  color: currentStep === step ? 'var(--color-primary)' : 'var(--color-text-light)',
                  fontWeight: currentStep === step ? 600 : 400,
                  textTransform: 'capitalize'
                }}>
                  {step === 'symptoms' ? 'Symptoms' : 'Results'}
                </span>
                {index < 1 && (
                  <div style={{
                    width: '2rem',
                    height: '2px',
                    backgroundColor: index < (['symptoms', 'results'] as WizardStep[]).indexOf(currentStep) ? 'var(--color-success)' : 'var(--color-border)',
                    marginLeft: '0.5rem'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {currentStep === 'symptoms' && (
            <SymptomSelector
              selectedSymptoms={selectedSymptoms}
              onSymptomsChange={setSelectedSymptoms}
              onNext={handleSymptomsSelected}
            />
          )}

          {currentStep === 'results' && diagnosticResult && (
            <div style={{ padding: '1.5rem' }}>
              {/* Possible Causes */}
              {diagnosticResult.possibleCauses.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ 
                    margin: '0 0 1rem 0',
                    color: 'var(--color-primary-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🔍 Most Likely Causes
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {diagnosticResult.possibleCauses.map((issue, index) => (
                      <div key={index} style={{
                        padding: '1rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: index === 0 ? 'var(--color-primary-light)' : 'var(--color-background)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{
                            backgroundColor: issue.severity === 'high' ? '#dc2626' : 
                                           issue.severity === 'medium' ? '#ea580c' : '#059669',
                            color: 'white',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {issue.severity}
                          </span>
                          <h4 style={{ margin: 0, fontWeight: 600 }}>{issue.name}</h4>
                          {index === 0 && (
                            <span style={{
                              backgroundColor: 'var(--color-primary)',
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              MOST LIKELY
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                          Common causes: {issue.causes.slice(0, 2).join(', ')}
                        </p>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                          Confidence: {Math.round(issue.commonness * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  margin: '0 0 1rem 0',
                  color: 'var(--color-primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ⚡ Immediate Actions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {diagnosticResult.recommendedActions
                    .filter(action => action.urgency === 'immediate')
                    .map((action, index) => (
                    <div key={index} style={{
                      padding: '1rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc2626' }}>{action.action}</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        {action.instructions.map((instruction, idx) => (
                          <li key={idx} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pot Recommendations */}
              {diagnosticResult.potRecommendations && diagnosticResult.potRecommendations.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ 
                    margin: '0 0 1rem 0',
                    color: 'var(--color-primary-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🏺 Pot Recommendations
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {diagnosticResult.potRecommendations.map((rec, index) => (
                      <div key={index} style={{
                        padding: '1rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-background-light)'
                      }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                          <div>
                            <strong>Size:</strong> {rec.size}
                          </div>
                          <div>
                            <strong>Material:</strong> {rec.material}
                          </div>
                          <div>
                            <strong>Drainage:</strong> {rec.drainage ? 'Required' : 'Optional'}
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                          {rec.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'treatment' && diagnosticResult && (
            <TreatmentPlan
              result={diagnosticResult}
              plant={plant}
              onBack={() => setCurrentStep('results')}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            {currentStep === 'results' && (
              <button
                onClick={handleRestart}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ← Change Symptoms
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {currentStep === 'results' && (
              <>
                <button
                  onClick={() => setCurrentStep('treatment')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid var(--color-primary)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  View Treatment Plan
                </button>
                <button
                  onClick={handleSaveDiagnostic}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Save Diagnosis'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}