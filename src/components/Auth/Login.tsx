import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#F7FAFC',
            padding: '1rem'
        }}>
            <div className="glass-panel" style={{
                padding: '2rem',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌱 Garden Companion</h1>
                <p style={{ marginBottom: '2rem', color: '#4A5568' }}>Sign in to access your garden</p>

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    />
                    <input
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ padding: '0.8rem' }}
                    >
                        {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    style={{ marginTop: '1rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    {isSignUp ? 'Already have an account? Sign In' : 'No account? Sign Up'}
                </button>
            </div>
        </div>
    );
}
