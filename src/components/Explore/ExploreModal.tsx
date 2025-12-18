"use client";

import React, { useState } from 'react';
import { exploreTips, exploreProblems, exploreVideos } from '@/data/exploreContent';

interface ExploreModalProps {
    onClose: () => void;
}

export default function ExploreModal({ onClose }: ExploreModalProps) {
    const [activeTab, setActiveTab] = useState<'tips' | 'problems' | 'videos'>('tips');

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end'
        }} onClick={onClose}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '600px',
                height: '85vh',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                padding: '1.5rem',
                overflowY: 'auto',
                animation: 'slideUp 0.3s ease-out',
                backgroundColor: 'white'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>🧭 Explore</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
                    {(['tips', 'problems', 'videos'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                                color: activeTab === tab ? 'var(--color-primary)' : '#718096',
                                fontWeight: activeTab === tab ? 700 : 500,
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* TIPS TAB */}
                    {activeTab === 'tips' && exploreTips.map((tip, index) => (
                        <div key={index} style={{
                            padding: '1rem',
                            backgroundColor: '#F0FFF4',
                            borderRadius: '12px',
                            border: '1px solid #C6F6D5'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#2F855A' }}>{tip.title}</h3>
                            <p style={{ color: '#4A5568', fontSize: '0.95rem' }}>{tip.description}</p>
                            <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8rem', color: '#2F855A', backgroundColor: '#C6F6D5', padding: '2px 8px', borderRadius: '10px' }}>
                                {tip.category}
                            </span>
                        </div>
                    ))}

                    {/* PROBLEMS TAB */}
                    {activeTab === 'problems' && exploreProblems.map((prob, index) => (
                        <div key={index} style={{
                            padding: '1rem',
                            backgroundColor: '#FFF5F5',
                            borderRadius: '12px',
                            border: '1px solid #FED7D7'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#C53030' }}>{prob.problem}</h3>
                                <span style={{
                                    fontSize: '0.8rem',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    backgroundColor: prob.severity === 'High' ? '#C53030' : prob.severity === 'Medium' ? '#DD6B20' : '#38A169',
                                    color: 'white'
                                }}>
                                    {prob.severity}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Symptoms:</strong> {prob.symptoms}</p>
                            <p style={{ fontSize: '0.9rem', color: '#2D3748' }}><strong>💡 Solution:</strong> {prob.solution}</p>
                        </div>
                    ))}

                    {/* VIDEOS TAB */}
                    {activeTab === 'videos' && exploreVideos.map((video, index) => (
                        <a key={index} href={video.url} target="_blank" rel="noopener noreferrer" style={{
                            textDecoration: 'none',
                            display: 'block',
                            padding: '1rem',
                            backgroundColor: '#EBF8FF',
                            borderRadius: '12px',
                            border: '1px solid #BEE3F8',
                            transition: 'transform 0.2s'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2B6CB0', marginBottom: '0.2rem' }}>{video.channel}</h3>
                            <p style={{ fontWeight: 600, color: '#2C5282', marginBottom: '0.5rem' }}>{video.title}</p>
                            <p style={{ color: '#4A5568', fontSize: '0.9rem' }}>{video.description}</p>
                            <div style={{ marginTop: '0.5rem', color: '#E53E3E', fontWeight: 700, fontSize: '0.9rem' }}>▶ Watch on YouTube</div>
                        </a>
                    ))}

                </div>
            </div>
        </div>
    );
}
