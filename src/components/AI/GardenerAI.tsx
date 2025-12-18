"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGarden } from '@/context/GardenContext';
import { AIService, AIChatMessage } from '@/services/aiService';

export default function GardenerAI() {
    const { plants, weather } = useGarden();
    const [messages, setMessages] = useState<AIChatMessage[]>([
        { role: 'assistant', content: "Hi! I'm your Garden AI. How can I help you with your plants today?", timestamp: Date.now() }
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
        }, 1000);
    };

    return (
        <div className="glass-panel" style={{
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '24px',
            backgroundColor: 'white'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #EDF2F7',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'linear-gradient(to right, #F0FFF4, #FFFFFF)'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                }}>
                    🤖
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Garden AI</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, margin: 0 }}>Online • Expert Assistant</p>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '0.8rem 1rem',
                        borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                        backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : '#F1F5F9',
                        color: msg.role === 'user' ? 'white' : 'var(--color-text)',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        lineHeight: '1.4'
                    }}>
                        {msg.content}
                    </div>
                ))}
                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', backgroundColor: '#F1F5F9', borderRadius: '12px', fontSize: '0.8rem', color: '#64748B' }}>
                        AI is thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid #EDF2F7', display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your plants or weather..."
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.9rem',
                        outline: 'none'
                    }}
                />
                <button type="submit" style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                }}>
                    →
                </button>
            </form>
        </div>
    );
}
