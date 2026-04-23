import { useState } from 'react';
import { BrandMark, Button, Field } from './components/ui';
import { signup, login } from './lib/api';

interface AuthProps {
    onAuth: (username: string, token: string) => void;
}

function Auth({ onAuth }: AuthProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim()) { setError('Username is required'); return; }
        if (!password.trim()) { setError('Password is required'); return; }
        if (username.length < 3) { setError('Username must be at least 3 characters'); return; }
        if (password.length < 4) { setError('Password must be at least 4 characters'); return; }

        setIsLoading(true);

        try {
            const fn = isLogin ? login : signup;
            const { token, username: returnedUsername } = await fn(username.trim(), password);
            // Persist token so refresh keeps you logged in
            localStorage.setItem('chat_token', token);
            localStorage.setItem('chat_username', returnedUsername);
            onAuth(returnedUsername, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-base)',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background glow blobs */}
            <div style={{
                position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
                width: 500, height: 300, borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '10%',
                width: 300, height: 300, borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div
                className="animate-pop-in"
                style={{
                    width: '100%',
                    maxWidth: 420,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Top accent line */}
                <div style={{
                    height: 3,
                    background: 'linear-gradient(90deg, #7c3aed, #6d28d9, #5b21b6)',
                    boxShadow: '0 2px 16px rgba(124,58,237,0.6)',
                }} />

                <div style={{ padding: '40px 36px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 36, textAlign: 'center' }}>
                        <BrandMark size={52} />
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                                {isLogin ? 'Welcome back' : 'Create account'}
                            </h1>
                            <p style={{ marginTop: 8, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {isLogin ? 'Sign in to join the conversation.' : 'Join the real-time chat network.'}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <Field
                            id="auth-username"
                            label="Username"
                            type="text"
                            value={username}
                            onChange={e => { setUsername(e.target.value); setError(''); }}
                            placeholder="Enter your username"
                            autoFocus
                            autoComplete="username"
                        />
                        <Field
                            id="auth-password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            placeholder="Enter your password"
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                        />

                        {error && (
                            <div
                                className="animate-fade-in"
                                style={{
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.25)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '10px 14px',
                                    fontSize: '13px',
                                    color: '#f87171',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <Button
                            id="auth-submit-btn"
                            type="submit"
                            size="lg"
                            disabled={isLoading}
                            style={{ width: '100%', marginTop: 4, opacity: isLoading ? 0.7 : 1 }}
                        >
                            {isLoading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: 'spin 1s linear infinite' }}>
                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                    </svg>
                                    {isLogin ? 'Signing in…' : 'Creating account…'}
                                </span>
                            ) : isLogin ? 'Sign In' : 'Create Account'}
                        </Button>
                    </form>

                    {/* Toggle */}
                    <div style={{ marginTop: 28, textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            {' '}
                            <button
                                id="auth-toggle-btn"
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--accent-light)',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    padding: '0 2px',
                                }}
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </main>
    );
}

export default Auth;
