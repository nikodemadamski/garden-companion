"use client";

import React, { useState } from 'react';
import { PlantSymptom, SymptomCategory, SYMPTOM_CATEGORIES } from '@/types/plant';
import { PlantDiagnosticService } from '@/services/plantDiagnosticService';

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
  onNext: (symptoms: string[]) => void;
}

export default function SymptomSelector({ selectedSymptoms, onSymptomsChange, onNext }: SymptomSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<SymptomCategory>('leaves');
  const allSymptoms = PlantDiagnosticService.getSymptoms();

  const handleSymptomToggle = (symptomId: string) => {
    const newSymptoms = selectedSymptoms.includes(symptomId)
      ? selectedSymptoms.filter(id => id !== symptomId)
      : [...selectedSymptoms, symptomId];
    
    onSymptomsChange(newSymptoms);
  };

  const getCategoryIcon = (category: SymptomCategory) => {
    switch (category) {
      case 'leaves': return '🍃';
      case 'stems': return '🌿';
      case 'roots': return '🌱';
      case 'growth': return '📈';
      default: return '🌿';
    }
  };

  const getCategoryDescription = (category: SymptomCategory) => {
    switch (category) {
      case 'leaves': return 'Issues with leaf color, texture, or condition';
      case 'stems': return 'Problems with stems, branches, or trunk';
      case 'roots': return 'Root-related issues and soil problems';
      case 'growth': return 'Growth patterns, pests, and overall health';
      default: return '';
    }
  };

  const categorySymptoms = allSymptoms.filter(symptom => symptom.category === activeCategory);
  const canProceed = selectedSymptoms.length > 0;

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Category Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          margin: '0 0 1rem 0',
          color: 'var(--color-primary-dark)',
          fontSize: '1.1rem'
        }}>
          Select the area where you notice problems:
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          {SYMPTOM_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                padding: '1rem',
                border: `2px solid ${activeCategory === category ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeCategory === category ? 'var(--color-primary-light)' : 'var(--color-background)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{getCategoryIcon(category)}</span>
                <span style={{ 
                  fontWeight: 600, 
                  textTransform: 'capitalize',
                  color: activeCategory === category ? 'var(--color-primary-dark)' : 'var(--color-text)'
                }}>
                  {category}
                </span>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '0.85rem', 
                color: 'var(--color-text-light)',
                lineHeight: 1.4
              }}>
                {getCategoryDescription(category)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Symptom Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{ 
            margin: 0,
            color: 'var(--color-primary-dark)',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {getCategoryIcon(activeCategory)} {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Symptoms
          </h3>
          <div style={{ 
            fontSize: '0.85rem', 
            color: 'var(--color-text-light)',
            backgroundColor: 'var(--color-background-light)',
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            border: '1px solid var(--color-border)'
          }}>
            {selectedSymptoms.length} selected
          </div>
        </div>

        <p style={{ 
          margin: '0 0 1.5rem 0', 
          fontSize: '0.9rem', 
          color: 'var(--color-text-light)' 
        }}>
          Select all symptoms you've observed. You can choose multiple symptoms from different categories.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '0.75rem' 
        }}>
          {categorySymptoms.map(symptom => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            return (
              <div
                key={symptom.id}
                onClick={() => handleSymptomToggle(symptom.id)}
                style={{
                  padding: '1rem',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-background)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Selection Indicator */}
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  color: 'white'
                }}>
                  {isSelected && '✓'}
                </div>

                <h4 style={{ 
                  margin: '0 0 0.5rem 0',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text)',
                  paddingRight: '2rem'
                }}>
                  {symptom.name}
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.85rem', 
                  color: 'var(--color-text-light)',
                  lineHeight: 1.4
                }}>
                  {symptom.description}
                </p>
              </div>
            );
          })}
        </div>

        {categorySymptoms.length === 0 && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--color-text-light)',
            backgroundColor: 'var(--color-background-light)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              No symptoms available for this category yet.
            </p>
          </div>
        )}
      </div>

      {/* Selected Symptoms Summary */}
      {selectedSymptoms.length > 0 && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--color-success-light)',
          border: '1px solid var(--color-success)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '2rem'
        }}>
          <h4 style={{ 
            margin: '0 0 0.75rem 0',
            color: 'var(--color-success-dark)',
            fontSize: '0.95rem',
            fontWeight: 600
          }}>
            Selected Symptoms ({selectedSymptoms.length}):
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selectedSymptoms.map(symptomId => {
              const symptom = allSymptoms.find(s => s.id === symptomId);
              if (!symptom) return null;
              
              return (
                <span
                  key={symptomId}
                  style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'var(--color-success)',
                    color: 'white',
                    borderRadius: '1rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {getCategoryIcon(symptom.category)} {symptom.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSymptomToggle(symptomId);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: '0',
                      marginLeft: '0.25rem'
                    }}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => onNext(selectedSymptoms)}
          disabled={!canProceed}
          style={{
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: canProceed ? 'var(--color-primary)' : 'var(--color-border)',
            color: canProceed ? 'white' : 'var(--color-text-light)',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            fontSize: '1rem',
            fontWeight: 600,
            opacity: canProceed ? 1 : 0.6,
            transition: 'all 0.2s ease'
          }}
        >
          Analyze Symptoms ({selectedSymptoms.length})
        </button>
      </div>

      {!canProceed && (
        <p style={{
          textAlign: 'center',
          margin: '1rem 0 0 0',
          fontSize: '0.85rem',
          color: 'var(--color-text-light)'
        }}>
          Please select at least one symptom to continue
        </p>
      )}
    </div>
  );
}