"use client";

import React from 'react';
import { HistoricalWeatherData } from '@/services/weatherService';

interface ContextCalendarProps {
    history: HistoricalWeatherData[];
}

export default function ContextCalendar({ history }: ContextCalendarProps) {
    if (!history || history.length === 0) return null;

    const getWeatherIcon = (code: number, rain: number) => {
        if (rain > 5) return '🌧️';
        if (code === 0) return '☀️';
        if (code <= 3) return '⛅';
        return '☁️';
    };

    return (
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📅 Context Calendar <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#666' }}>(Past 7 Days)</span>
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', overflowX: 'auto', gap: '0.5rem' }}>
                {history.map((day) => {
                    const date = new Date(day.date);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const isToday = new Date().toISOString().split('T')[0] === day.date;

                    return (
                        <div key={day.date} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minWidth: '50px',
                            padding: '0.5rem',
                            backgroundColor: isToday ? 'var(--color-primary)' : 'rgba(255,255,255,0.5)',
                            color: isToday ? 'white' : 'inherit',
                            borderRadius: 'var(--radius-sm)',
                            border: isToday ? '2px solid white' : 'none',
                            boxShadow: isToday ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                            transform: isToday ? 'scale(1.05)' : 'none',
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isToday ? 'rgba(255,255,255,0.9)' : '#666' }}>{dayName}</span>
                            <span style={{ fontSize: '1.5rem', margin: '0.2rem 0' }}>{getWeatherIcon(day.weatherCode, day.rainSum)}</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{Math.round(day.maxTemp)}°</span>
                            {day.rainSum > 0 && (
                                <span style={{ fontSize: '0.7rem', color: isToday ? 'white' : '#3b82f6' }}>{day.rainSum}mm</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
