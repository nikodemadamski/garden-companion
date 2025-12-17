"use client";

import React from 'react';
import { Plant, PotRecommendation, PotMaterial } from '@/types/plant';

interface PotRecommendationsProps {
  recommendations: PotRecommendation[];
  plant: Plant;
}

export default function PotRecommendations({ recommendations, plant }: PotRecommendationsProps) {
  const getPotMaterialIcon = (material: PotMaterial) => {
    switch (material) {
      case 'terracotta': return '🏺';
      case 'ceramic': return '🫖';
      case 'plastic': return '🪣';
      case 'fabric': return '🧺';
      case 'hanging': return '🪴';
      default: return '🏺';
    }
  };

  const getPotMaterialDescription = (material: PotMaterial) => {
    switch (material) {
      case 'terracotta': 
        return 'Porous clay that allows air circulation and moisture evaporation. Best for plants prone to overwatering.';
      case 'ceramic': 
        return 'Glazed pottery that retains moisture well while providing good stability. Ideal for most houseplants.';
      case 'plastic': 
        return 'Lightweight and retains moisture. Good for plants that need consistent soil moisture.';
      case 'fabric': 
        return 'Breathable material that promotes air pruning of roots. Excellent for root health and drainage.';
      case 'hanging': 
        return 'Suspended containers ideal for trailing plants or space-saving vertical gardens.';
      default: 
        return 'Standard plant container.';
    }
  };

  const getPotMaterialPros = (material: PotMaterial): string[] => {
    switch (material) {
      case 'terracotta': 
        return ['Excellent drainage', 'Prevents overwatering', 'Natural material', 'Good air circulation'];
      case 'ceramic': 
        return ['Attractive appearance', 'Good weight/stability', 'Retains moisture well', 'Easy to clean'];
      case 'plastic': 
        return ['Lightweight', 'Affordable', 'Retains moisture', 'Won\'t break if dropped'];
      case 'fabric': 
        return ['Superior drainage', 'Air prunes roots', 'Prevents root binding', 'Eco-friendly'];
      case 'hanging': 
        return ['Space-saving', 'Good for trailing plants', 'Decorative', 'Improves air circulation'];
      default: 
        return ['Suitable for most plants'];
    }
  };

  const getPotMaterialCons = (material: PotMaterial): string[] => {
    switch (material) {
      case 'terracotta': 
        return ['Dries out quickly', 'Heavy when large', 'Can break easily', 'May need frequent watering'];
      case 'ceramic': 
        return ['Can be expensive', 'Heavy', 'May crack in frost', 'Limited drainage holes'];
      case 'plastic': 
        return ['Can retain too much moisture', 'Less attractive', 'May degrade in UV', 'Poor air circulation'];
      case 'fabric': 
        return ['May dry out quickly', 'Less attractive', 'Shorter lifespan', 'Can be messy'];
      case 'hanging': 
        return ['Requires strong support', 'Limited size options', 'May swing in wind', 'Harder to water'];
      default: 
        return ['May not be optimal for specific needs'];
    }
  };

  const getSizeGuidance = (size: string) => {
    const sizeGuides = {
      'same': 'Keep the current pot size to avoid shocking the plant during recovery.',
      'smaller': 'Use a slightly smaller pot to reduce soil volume and prevent moisture retention.',
      'larger': 'Increase pot size to give roots more room to grow and recover.',
      '2-4 inches': 'Choose a pot that is 2-4 inches larger in diameter than the current one.',
      'current': 'The current pot size is appropriate for your plant\'s needs.'
    };

    // Find matching guidance
    for (const [key, guidance] of Object.entries(sizeGuides)) {
      if (size.toLowerCase().includes(key)) {
        return guidance;
      }
    }

    return 'Follow the specific size recommendation for optimal plant health.';
  };

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ 
        margin: '0 0 1.5rem 0',
        color: 'var(--color-primary-dark)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🏺 Pot Recommendations
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {recommendations.map((rec, index) => (
          <div
            key={index}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              backgroundColor: 'var(--color-background)'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--color-primary-light)',
              borderBottom: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{getPotMaterialIcon(rec.material)}</span>
                <div>
                  <h4 style={{ 
                    margin: '0 0 0.25rem 0', 
                    color: 'var(--color-primary-dark)',
                    textTransform: 'capitalize'
                  }}>
                    {rec.material} Pot
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.9rem', 
                    color: 'var(--color-text-light)' 
                  }}>
                    Size: {rec.size} • Drainage: {rec.drainage ? 'Required' : 'Optional'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem' }}>
              {/* Reasoning */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: 'var(--color-text)',
                  fontSize: '0.95rem'
                }}>
                  Why This Pot?
                </h5>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem', 
                  color: 'var(--color-text-light)',
                  lineHeight: 1.5
                }}>
                  {rec.reasoning}
                </p>
              </div>

              {/* Material Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: 'var(--color-text)',
                  fontSize: '0.95rem'
                }}>
                  About {rec.material.charAt(0).toUpperCase() + rec.material.slice(1)} Pots
                </h5>
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: '0.85rem', 
                  color: 'var(--color-text-light)',
                  lineHeight: 1.4
                }}>
                  {getPotMaterialDescription(rec.material)}
                </p>
              </div>

              {/* Size Guidance */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: 'var(--color-text)',
                  fontSize: '0.95rem'
                }}>
                  Size Guidance
                </h5>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.85rem', 
                  color: 'var(--color-text-light)',
                  lineHeight: 1.4
                }}>
                  {getSizeGuidance(rec.size)}
                </p>
              </div>

              {/* Pros and Cons */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <h5 style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: 'var(--color-success-dark)',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ✅ Advantages
                  </h5>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '1rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-light)'
                  }}>
                    {getPotMaterialPros(rec.material).map((pro, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: '#ea580c',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ⚠️ Considerations
                  </h5>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '1rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-light)'
                  }}>
                    {getPotMaterialCons(rec.material).map((con, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Drainage Requirements */}
              {rec.drainage && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span>💧</span>
                    <strong style={{ fontSize: '0.9rem', color: '#92400e' }}>
                      Drainage Required
                    </strong>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.8rem', 
                    color: '#92400e' 
                  }}>
                    Ensure the pot has adequate drainage holes to prevent water logging and root rot. 
                    Consider adding a saucer to protect surfaces.
                  </p>
                </div>
              )}

              {/* Current Pot Comparison */}
              {plant.potType && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-background-light)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span>🔄</span>
                    <strong style={{ fontSize: '0.9rem' }}>
                      Current vs. Recommended
                    </strong>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.8rem', 
                    color: 'var(--color-text-light)' 
                  }}>
                    Currently using: {plant.potType} → Recommended: {rec.material}
                    {plant.potType === rec.material && ' (No change needed)'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* General Repotting Tips */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: 'var(--color-background-light)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)'
      }}>
        <h4 style={{ 
          margin: '0 0 0.75rem 0', 
          color: 'var(--color-primary-dark)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💡 Repotting Tips for {plant.nickname || plant.name}
        </h4>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '1.25rem',
          fontSize: '0.85rem',
          color: 'var(--color-text-light)'
        }}>
          <li style={{ marginBottom: '0.5rem' }}>
            Best time to repot is during the growing season (spring/early summer)
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Water the plant 1-2 days before repotting to make removal easier
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Gently tease apart root-bound roots to encourage new growth
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Use fresh, well-draining potting mix appropriate for your plant type
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Don't water immediately after repotting - wait 2-3 days to prevent root rot
          </li>
          <li>
            Monitor closely for 2-3 weeks after repotting for signs of transplant shock
          </li>
        </ul>
      </div>
    </div>
  );
}