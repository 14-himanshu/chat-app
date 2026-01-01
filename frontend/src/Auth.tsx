import { useState } from 'react';

interface AuthProps {
    onAuth: (username: string) => void;
}

function Auth({ onAuth }: AuthProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        // For now, we'll use localStorage for simple auth
        // In production, this should be a real backend API
        if (isLogin) {
            const storedPassword = localStorage.getItem(`user_${username}`);
            if (!storedPassword) {
                setError('User not found. Please sign up first.');
                return;
            }
            if (storedPassword !== password) {
                setError('Invalid password');
                return;
            }
            onAuth(username);
        } else {
            // Signup
            const existingUser = localStorage.getItem(`user_${username}`);
            if (existingUser) {
                setError('Username already exists');
                return;
            }
            localStorage.setItem(`user_${username}`, password);
            onAuth(username);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit(e as any);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md bg-[#09090b] rounded-xl border border-zinc-800 p-10 sm:p-16 flex flex-col gap-10 shadow-2xl shadow-zinc-900/20">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Real Time Chat</h1>
                    </div>
                    <p className="text-zinc-400 text-sm">
                        {isLogin ? 'Welcome back! Sign in to continue' : 'Create an account to get started'}
                    </p>
                </div>

                {/* Auth Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="space-y-2">
                        <label htmlFor="username" className="block text-zinc-300 text-xs font-medium uppercase tracking-wider ml-1">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter your username"
                            className="w-full h-12 bg-black border border-zinc-800 rounded-2xl px-5 text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all text-sm"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-zinc-300 text-xs font-medium uppercase tracking-wider ml-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter your password"
                            className="w-full h-12 bg-black border border-zinc-800 rounded-2xl px-5 text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all text-sm"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                            <p className="text-red-400 text-xs font-medium text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="h-12 bg-white text-black rounded-2xl font-semibold text-sm hover:bg-zinc-200 active:scale-95 transition-all mt-2 shadow-lg shadow-white/5"
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                {/* Toggle Auth Mode */}
                <div className="text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
                    >
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <span className="text-white font-medium underline underline-offset-4 decoration-zinc-700">
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Auth;
