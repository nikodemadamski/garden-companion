"use client";

import React, { ReactNode, useEffect } from 'react';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

export default function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="bottom-sheet-backdrop" onClick={onClose}>
            <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
                <div className="bottom-sheet-handle" />
                {title && (
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        {title}
                    </h2>
                )}
                {children}
            </div>
        </div>
    );
}
