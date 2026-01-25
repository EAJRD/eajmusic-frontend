import React, { useState } from 'react';
import { Logo } from '../../components/Icons';

interface RegisterProps {
    onNavigate: (domain: 'main' | 'artist' | 'login') => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
    const [loading, setLoading] = useState(false);
    const [accountType, setAccountType] = useState<'artist' | 'label'>('artist');

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
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">Create your account</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Already have an account? <button onClick={() => onNavigate('login')} className="font-bold text-brand-600 hover:text-brand-500">Sign in</button>
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setAccountType('artist')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${accountType === 'artist' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                    >
                        <span className="material-symbols-outlined text-3xl mb-2 text-brand-600">mic</span>
                        <p className={`font-bold text-sm ${accountType === 'artist' ? 'text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Artist</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setAccountType('label')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${accountType === 'label' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                    >
                        <span className="material-symbols-outlined text-3xl mb-2 text-purple-600">business</span>
                        <p className={`font-bold text-sm ${accountType === 'label' ? 'text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Label</p>
                    </button>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="sr-only">Full Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm font-bold"
                            placeholder="Full Name / Artist Name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email-address" className="sr-only">Email address</label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm font-bold"
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm font-bold"
                            placeholder="Password"
                        />
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
                                    Creating Account...
                                </span>
                            ) : (
                                "Sign Up Free"
                            )}
                        </button>
                        <p className="text-xs text-center text-slate-500 mt-4">
                            By clicking Sign Up, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
                        </p>
                    </div>
                </form>
                <div className="text-center mt-2">
                    <button onClick={() => onNavigate('main')} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium">
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;
