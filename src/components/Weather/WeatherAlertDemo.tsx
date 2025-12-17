"use client";

import React, { useState } from 'react';
import { WeatherAlertBanner, WeatherActionModal, AlertHistory } from './index';
import { ProcessedAlert } from '@/types/weather';

interface WeatherAlertDemoProps {
  userId?: string;
}

/**
 * Demo component showing how to integrate the weather alert system
 * This can be used as a reference for integrating alerts into the main app
 */
export default function WeatherAlertDemo({ userId }: WeatherAlertDemoProps) {
  const [selectedAlert, setSelectedAlert] = useState<ProcessedAlert | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleAlertClick = (alert: ProcessedAlert) => {
    setSelectedAlert(alert);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAlert(null);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>
        Weather Alert System Demo
      </h2>
      
      {/* Weather Alert Banner */}
      <WeatherAlertBanner onAlertClick={handleAlertClick} />
      
      {/* Alert History (only show if userId is provided) */}
      {userId && (
        <div style={{ marginTop: '2rem' }}>
          <AlertHistory userId={userId} limit={5} />
        </div>
      )}
      
      {/* Weather Action Modal */}
      {selectedAlert && (
        <WeatherActionModal
          alerts={[selectedAlert]}
          isOpen={showModal}
          onClose={handleCloseModal}
          userId={userId}
        />
      )}
      
      {/* Integration Instructions */}
      <div className="glass-panel" style={{ 
        padding: '1.5rem', 
        marginTop: '2rem',
        backgroundColor: 'var(--color-background-light)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary-dark)' }}>
          Integration Guide
        </h3>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          <p><strong>To integrate weather alerts into your app:</strong></p>
          <ol style={{ paddingLeft: '1.5rem' }}>
            <li>Add <code>WeatherAlertBanner</code> to your main layout or dashboard</li>
            <li>Include <code>WeatherActionModal</code> for detailed alert actions</li>
            <li>Use <code>AlertHistory</code> in user profile or settings</li>
            <li>Call <code>WeatherAlertService.getActiveAlerts()</code> to check for alerts</li>
            <li>Use <code>PlantProtectionService</code> for customized recommendations</li>
          </ol>
          
          <p style={{ marginTop: '1rem' }}><strong>Key Features:</strong></p>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Real-time weather alert monitoring</li>
            <li>Plant-specific protection recommendations</li>
            <li>Emergency checklists for severe weather</li>
            <li>Action tracking and progress saving</li>
            <li>Alert history and user preferences</li>
          </ul>
        </div>
      </div>
    </div>
  );
}