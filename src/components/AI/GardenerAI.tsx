"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGarden } from '@/context/GardenContext';
import { AIService, AIChatMessage } from '@/services/aiService';

export default function GardenerAI() {
    const { plants, weather } = useGarden();
    const [messages, setMessages] = useState<AIChatMessage[]>([
        { role: 'assistant', content: "Hi! I'm your Garden AI. I'm watching your plants for you! (◕‿◕) ", timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: AIChatMessage = { role: 'user', content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking
        setTimeout(async () => {
            const response = await AIService.getGardeningAdvice(input, plants, weather);
            const assistantMsg: AIChatMessage = { role: 'assistant', content: response, timestamp: Date.now() };
            setMessages(prev => [...prev, assistantMsg]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <div className="glass-panel animate-slide-up" style={{
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '32px',
            backgroundColor: 'white',
            border: '2px solid #F1F5F9'
        }}>
            {/* Kawaii Header */}
            <div style={{
                padding: '1.25rem',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'linear-gradient(to right, #F0FFF4, #FFFFFF)'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    boxShadow: '0 4px 12px rgba(72, 187, 120, 0.2)'
                }}>
                    🤖
                </div>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Garden AI</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 800, margin: 0 }}>
                        (๑&gt;ᴗ&lt;๑) ONLINE
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
            }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '1rem 1.25rem',
                        borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                        backgroundColor: msg.role === 'user' ? '#5856D6' : '#F1F5F9',
                        color: msg.role === 'user' ? 'white' : '#2D3748',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        lineHeight: '1.5'
                    }}>
                        {msg.content}
                    </div>
                ))}
                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', backgroundColor: '#F1F5F9', borderRadius: '12px', fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
                        AI is thinking... ✨
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.75rem' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    style={{
                        flex: 1,
                        padding: '1rem 1.25rem',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        fontSize: '1rem',
                        outline: 'none',
                        backgroundColor: '#F8FAFC'
                    }}
                />
                <button type="submit" style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    width: '50px',
                    height: '50px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)'
                }}>
                    →
                </button>
            </form>
        </div>
    );
}
