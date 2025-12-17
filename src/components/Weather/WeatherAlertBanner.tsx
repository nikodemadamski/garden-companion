"use client";

import React, { useEffect, useState } from 'react';
import { WeatherAlertService } from '@/services/weatherAlertService';
import { ProcessedAlert } from '@/types/weather';

interface WeatherAlertBannerProps {
  onAlertClick?: (alert: ProcessedAlert) => void;
}

export default function WeatherAlertBanner({ onAlertClick }: WeatherAlertBannerProps) {
  const [activeAlerts, setActiveAlerts] = useState<ProcessedAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveAlerts();
    // Check for new alerts every 5 minutes
    const interval = setInterval(loadActiveAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveAlerts = async () => {
    try {
      const alerts = await WeatherAlertService.getActiveAlerts();
      setActiveAlerts(alerts);
    } catch (error) {
      console.error('Failed to load weather alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'red':
        return '#dc2626'; // red-600
      case 'orange':
        return '#ea580c'; // orange-600
      case 'yellow':
        return '#ca8a04'; // yellow-600
      default:
        return '#6b7280'; // gray-500
    }
  };

  const getSeverityIcon = (alertType: string) => {
    switch (alertType) {
      case 'wind':
        return '💨';
      case 'rain':
        return '🌧️';
      case 'storm':
        return '⛈️';
      case 'temperature':
        return '🌡️';
      default:
        return '⚠️';
    }
  };

  const getUrgencyText = (alert: ProcessedAlert) => {
    const immediateActions = alert.protectionActions.filter(action => action.urgency === 'immediate');
    if (immediateActions.length > 0) {
      return 'Immediate action needed';
    }
    
    const withinHoursActions = alert.protectionActions.filter(action => action.urgency === 'within_hours');
    if (withinHoursActions.length > 0) {
      return 'Action needed within hours';
    }
    
    return 'Prepare for weather';
  };

  if (loading) {
    return null; // Don't show loading state for alerts
  }

  if (activeAlerts.length === 0) {
    return null; // No alerts to display
  }

  // Show the most severe alert
  const primaryAlert = activeAlerts.reduce((prev, current) => {
    const severityOrder = { red: 3, orange: 2, yellow: 1 };
    return severityOrder[current.alert.severity as keyof typeof severityOrder] > 
           severityOrder[prev.alert.severity as keyof typeof severityOrder] ? current : prev;
  });

  return (
    <div 
      className="glass-panel animate-fade-in"
      style={{
        padding: '1rem',
        marginBottom: '1rem',
        background: `linear-gradient(135deg, ${getSeverityColor(primaryAlert.alert.severity)}15, ${getSeverityColor(primaryAlert.alert.severity)}08)`,
        border: `2px solid ${getSeverityColor(primaryAlert.alert.severity)}`,
        cursor: onAlertClick ? 'pointer' : 'default'
      }}
      onClick={() => onAlertClick?.(primaryAlert)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>
            {getSeverityIcon(primaryAlert.alert.alertType)}
          </span>
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.25rem'
            }}>
              <span style={{
                backgroundColor: getSeverityColor(primaryAlert.alert.severity),
                color: 'white',
                padding: '0.125rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                {primaryAlert.alert.severity}
              </span>
              <span style={{ 
                fontWeight: 600, 
                color: 'var(--color-primary-dark)',
                textTransform: 'capitalize'
              }}>
                {primaryAlert.alert.alertType} Alert
              </span>
            </div>
            <p style={{ 
              margin: 0, 
              color: 'var(--color-text)',
              fontSize: '0.9rem'
            }}>
              {primaryAlert.alert.description}
            </p>
            <p style={{ 
              margin: '0.25rem 0 0 0', 
              color: getSeverityColor(primaryAlert.alert.severity),
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              {getUrgencyText(primaryAlert)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeAlerts.length > 1 && (
            <span style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '50%',
              fontSize: '0.75rem',
              fontWeight: 600,
              minWidth: '1.5rem',
              textAlign: 'center'
            }}>
              +{activeAlerts.length - 1}
            </span>
          )}
          {onAlertClick && (
            <span style={{ 
              color: 'var(--color-primary)',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              View Details →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}