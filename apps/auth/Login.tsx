import React, { useState } from 'react';
import { Logo } from '../../components/Icons';

interface LoginProps {
    onNavigate: (domain: 'main' | 'artist' | 'register') => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            onNavigate('artist');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-6 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-card-dark p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-dark-800">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Logo className="w-12 h-12 text-brand-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Or <button onClick={() => onNavigate('register')} className="font-bold text-brand-600 hover:text-brand-500">create a new account</button>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-t-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm font-bold"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-b-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm font-bold"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-brand-600 hover:text-brand-500">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <button onClick={() => onNavigate('main')} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium">
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
