"use client";

import React, { useEffect, useState } from 'react';
import { WeatherAlert } from '@/types/weather';
import { WeatherAlertService } from '@/services/weatherAlertService';

interface AlertHistoryProps {
  userId: string;
  limit?: number;
}

export default function AlertHistory({ userId, limit = 10 }: AlertHistoryProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAlertHistory();
  }, [userId, limit]);

  const loadAlertHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const history = await WeatherAlertService.getUserAlertHistory(userId, limit);
      setAlerts(history);
    } catch (err) {
      console.error('Failed to load alert history:', err);
      setError('Failed to load alert history');
    } finally {
      setLoading(false);
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

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'wind': return '💨';
      case 'rain': return '🌧️';
      case 'storm': return '⛈️';
      case 'temperature': return '🌡️';
      default: return '⚠️';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(durationMs / (1000 * 60));
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
  };

  const isAlertActive = (alert: WeatherAlert) => {
    const now = new Date();
    const startTime = new Date(alert.startTime);
    const endTime = alert.endTime ? new Date(alert.endTime) : null;
    
    return startTime <= now && (!endTime || endTime > now);
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-text-light)' }}>Loading alert history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-error)' }}>{error}</div>
        <button
          onClick={loadAlertHistory}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'transparent',
            color: 'var(--color-primary)',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-text-light)' }}>
          No weather alerts in your history yet.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ 
        margin: '0 0 1.5rem 0', 
        color: 'var(--color-primary-dark)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        📋 Alert History
        <span style={{
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          padding: '0.125rem 0.5rem',
          borderRadius: '50%',
          fontSize: '0.75rem',
          fontWeight: 600
        }}>
          {alerts.length}
        </span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              border: `1px solid ${getSeverityColor(alert.severity)}40`,
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              backgroundColor: isAlertActive(alert) 
                ? `${getSeverityColor(alert.severity)}10` 
                : 'var(--color-background)',
              position: 'relative'
            }}
          >
            {isAlertActive(alert) && (
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                backgroundColor: getSeverityColor(alert.severity),
                color: 'white',
                padding: '0.125rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                ACTIVE
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '1.25rem', marginTop: '0.125rem' }}>
                {getAlertIcon(alert.alertType)}
              </span>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    backgroundColor: getSeverityColor(alert.severity),
                    color: 'white',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {alert.severity}
                  </span>
                  <span style={{ 
                    fontWeight: 600, 
                    textTransform: 'capitalize',
                    color: 'var(--color-primary-dark)'
                  }}>
                    {alert.alertType} Alert
                  </span>
                  <span style={{
                    color: 'var(--color-text-light)',
                    fontSize: '0.8rem'
                  }}>
                    {formatDuration(alert.startTime, alert.endTime)}
                  </span>
                </div>
                
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: 'var(--color-text)',
                  fontSize: '0.9rem'
                }}>
                  {alert.description}
                </p>
                
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--color-text-light)',
                  marginBottom: '0.5rem'
                }}>
                  <div>Started: {formatDate(alert.startTime)}</div>
                  {alert.endTime && (
                    <div>
                      {isAlertActive(alert) ? 'Ends' : 'Ended'}: {formatDate(alert.endTime)}
                    </div>
                  )}
                </div>

                {alert.actionsTaken && alert.actionsTaken.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 600, 
                      color: 'var(--color-success)',
                      marginBottom: '0.25rem'
                    }}>
                      ✓ Actions Taken:
                    </div>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: '1rem',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-light)'
                    }}>
                      {alert.actionsTaken.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length >= limit && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1rem',
          padding: '1rem',
          borderTop: '1px solid var(--color-border)'
        }}>
          <div style={{ 
            color: 'var(--color-text-light)', 
            fontSize: '0.9rem'
          }}>
            Showing last {limit} alerts
          </div>
        </div>
      )}
    </div>
  );
}