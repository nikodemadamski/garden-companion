"use client";

import React, { useRef, useState } from 'react';
import { useGarden } from '@/context/GardenContext';

interface SettingsModalProps {
    onClose: () => void;
}

import BottomSheet from './UI/BottomSheet';

interface SettingsModalProps {
    onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
    const { exportGarden, importGarden, signOut, session } = useGarden();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleBackup = () => {
        const jsonString = exportGarden();
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `garden-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setMessage("Backup downloaded! Keep it safe.");
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                const success = importGarden(content);
                if (success) {
                    setMessage("Garden restored successfully! 🌱");
                    setTimeout(onClose, 1500);
                } else {
                    setMessage("Failed to restore. Invalid file.");
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <BottomSheet isOpen={true} onClose={onClose} title="Settings & Data">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {message && (
                    <div style={{
                        padding: '0.75rem', marginBottom: '1rem',
                        backgroundColor: '#F0FFF4', color: '#2F855A',
                        borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}

                <div style={{ padding: '1rem', border: '1px solid #F1F5F9', borderRadius: '20px', backgroundColor: '#F8FAFC' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.25rem' }}>📦 Backup Garden</h3>
                    <p style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '1rem' }}>
                        Save your plants to a file so you never lose them.
                    </p>
                    <button onClick={handleBackup} className="btn" style={{ width: '100%', backgroundColor: 'white', border: '1px solid #E2E8F0' }}>
                        Download Backup
                    </button>
                </div>

                <div style={{ padding: '1rem', border: '1px solid #F1F5F9', borderRadius: '20px', backgroundColor: '#F8FAFC' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.25rem' }}>🔄 Restore Garden</h3>
                    <p style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '1rem' }}>
                        Load a previously saved garden file.
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn"
                        style={{ width: '100%', backgroundColor: 'white', border: '1px solid #E2E8F0' }}
                    >
                        Upload Backup File
                    </button>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleRestore}
                        style={{ display: 'none' }}
                    />
                </div>

                <div style={{ padding: '1rem', border: '1px solid #F1F5F9', borderRadius: '20px', backgroundColor: '#FFF5F5' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.25rem', color: '#C53030' }}>👤 Account</h3>
                    <p style={{ fontSize: '0.75rem', color: '#9B2C2C', marginBottom: '1rem' }}>
                        Signed in as {session?.user.email}
                    </p>
                    <button onClick={signOut} className="btn" style={{ width: '100%', backgroundColor: '#FED7D7', color: '#C53030' }}>
                        Sign Out
                    </button>
                </div>
            </div>
        </BottomSheet>
    );
}
