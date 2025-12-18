"use client";

import React, { useEffect, useState } from 'react';
import { WeatherAlertService } from '@/services/weatherAlertService';
import { ProcessedAlert } from '@/types/weather';
import { useGarden } from '@/context/GardenContext';

interface WeatherAlertBannerProps {
  onAlertClick?: (alert: ProcessedAlert) => void;
}

export default function WeatherAlertBanner({ onAlertClick }: WeatherAlertBannerProps) {
  const { setActiveTab } = useGarden();
  const [activeAlerts, setActiveAlerts] = useState<ProcessedAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveAlerts();
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
      case 'red': return '#FF3B30'; // iOS Red
      case 'orange': return '#FF9500'; // iOS Orange
      case 'yellow': return '#FFCC00'; // iOS Yellow
      default: return '#8E8E93';
    }
  };

  const getSeverityIcon = (alertType: string) => {
    switch (alertType) {
      case 'wind': return '💨';
      case 'rain': return '🌧️';
      case 'storm': return '⛈️';
      case 'temperature': return '🌡️';
      default: return '⚠️';
    }
  };

  if (loading || activeAlerts.length === 0) return null;

  const primaryAlert = activeAlerts.reduce((prev, current) => {
    const severityOrder = { red: 3, orange: 2, yellow: 1 };
    return severityOrder[current.alert.severity as keyof typeof severityOrder] >
      severityOrder[prev.alert.severity as keyof typeof severityOrder] ? current : prev;
  });

  const handleClick = () => {
    setActiveTab('dashboard');
    if (onAlertClick) onAlertClick(primaryAlert);
  };

  return (
    <div
      className="animate-slide-up"
      style={{
        padding: '1rem',
        marginBottom: '1.5rem',
        backgroundColor: `${getSeverityColor(primaryAlert.alert.severity)}10`,
        borderRadius: '20px',
        border: `1px solid ${getSeverityColor(primaryAlert.alert.severity)}40`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}
      onClick={handleClick}
    >
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        backgroundColor: getSeverityColor(primaryAlert.alert.severity),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        flexShrink: 0,
        boxShadow: `0 4px 12px ${getSeverityColor(primaryAlert.alert.severity)}30`
      }}>
        {getSeverityIcon(primaryAlert.alert.alertType)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.1rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: getSeverityColor(primaryAlert.alert.severity),
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {primaryAlert.alert.severity} Alert
          </span>
          {activeAlerts.length > 1 && (
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: 'rgba(0,0,0,0.05)',
              padding: '0.1rem 0.4rem',
              borderRadius: '6px',
              fontWeight: 600
            }}>
              +{activeAlerts.length - 1} more
            </span>
          )}
        </div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
          {primaryAlert.alert.description}
        </h3>
      </div>

      <div style={{ fontSize: '1.2rem', opacity: 0.3 }}>›</div>
    </div>
  );
}