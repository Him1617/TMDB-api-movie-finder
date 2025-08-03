import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ onClose }) => {
    const { login, signup } = useAuth();
    const [tab, setTab] = useState('signin'); // 'signin' | 'signup'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (tab === 'signup') {
                if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
                await signup(name.trim(), email.trim(), password);
            } else {
                await login(email.trim(), password);
            }
            onClose();
        } catch (err) {
            setError(err?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>
                {/* Close button */}
                <button className="auth-close" onClick={onClose} aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>

                {/* Logo / Title */}
                <div className="auth-header">
                    <div className="auth-logo">🎬</div>
                    <h2 className="auth-title">
                        {tab === 'signin' ? 'Welcome Back' : 'Join MovieFinder'}
                    </h2>
                    <p className="auth-subtitle">
                        {tab === 'signin'
                            ? 'Sign in to save your favourite movies'
                            : 'Create an account to start saving favourites'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
                        onClick={() => { setTab('signin'); setError(''); }}
                    >Sign In</button>
                    <button
                        className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
                        onClick={() => { setTab('signup'); setError(''); }}
                    >Sign Up</button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {tab === 'signup' && (
                        <div className="auth-field">
                            <label htmlFor="auth-name">Full Name</label>
                            <input
                                id="auth-name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="auth-email">Email</label>
                        <input
                            id="auth-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="auth-password">Password</label>
                        <input
                            id="auth-password"
                            type="password"
                            placeholder={tab === 'signup' ? 'Min 8 characters' : '••••••••'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={8}
                            autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading
                            ? <span className="auth-spinner" />
                            : tab === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                {/* Switch tab */}
                <p className="auth-switch">
                    {tab === 'signin'
                        ? <>Don't have an account? <button onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button></>
                        : <>Already have an account? <button onClick={() => { setTab('signin'); setError(''); }}>Sign In</button></>}
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
