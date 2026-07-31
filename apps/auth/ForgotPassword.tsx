import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { Logo } from '../../components/Icons';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword, resetPasswordWithCode } = useAuth();
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setStep('reset');
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPasswordWithCode(email, code, newPassword);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      } else {
        setError(result.error || 'Invalid or expired code.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-card-dark p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-dark-800">
        <div className="text-center">
          <Link to="/" className="flex justify-center mb-6">
            <Logo className="w-12 h-12 text-brand-600" />
          </Link>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Reset your password</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {step === 'email'
              ? "Enter your account email and we'll send you a 6-digit code."
              : `Enter the code we sent to ${email} and choose a new password.`}
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg text-sm">
            Password updated successfully. Redirecting you to sign in...
          </div>
        ) : step === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-bold"
                placeholder="Email address"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleReset}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="code" className="sr-only">Verification code</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="appearance-none relative block w-full px-3 py-3 mb-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg text-center tracking-[0.5em] text-lg font-black focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              />
              <label htmlFor="newPassword" className="sr-only">New password</label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="appearance-none relative block w-full px-3 py-3 mb-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-bold"
              />
              <label htmlFor="confirmPassword" className="sr-only">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
