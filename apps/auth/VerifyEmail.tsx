import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { Logo } from '../../components/Icons';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmailCode, resendVerificationCode } = useAuth();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await verifyEmailCode(email, otp);
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Invalid or expired code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Enter your email first.');
      return;
    }
    setResending(true);
    setResendMessage('');
    setError('');
    try {
      const result = await resendVerificationCode(email);
      setResendMessage(result.success ? 'Code sent. Check your inbox.' : (result.error || 'Failed to resend code.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-card-dark p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-dark-800 text-center">
        <Link to="/" className="flex justify-center mb-2">
          <Logo className="w-12 h-12 text-brand-600" />
        </Link>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verify your email</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Enter the 6-digit code we sent you.</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-left">
            {error}
          </div>
        )}

        <form className="space-y-4 text-left" onSubmit={handleVerify}>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="appearance-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-bold"
            />
          </div>
          <div>
            <label htmlFor="otp" className="sr-only">Verification code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="appearance-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg text-center tracking-[0.5em] text-lg font-black focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length !== 6 || !email}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div>
          {resendMessage && <p className="text-xs text-slate-500 mb-2">{resendMessage}</p>}
          <button type="button" onClick={handleResend} disabled={resending} className="text-sm font-bold text-brand-600 hover:text-brand-500 disabled:opacity-50">
            {resending ? 'Sending...' : "Didn't get a code? Resend"}
          </button>
        </div>

        <div className="pt-2">
          <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
