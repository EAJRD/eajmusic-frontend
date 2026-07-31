import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthService } from '../../src/services/api';
import { Logo } from '../../components/Icons';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('This verification link is missing its token.');
      return;
    }
    (async () => {
      try {
        await AuthService.verifyEmail(token);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'This verification link is invalid or has expired.');
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-card-dark p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-dark-800 text-center">
        <Link to="/" className="flex justify-center mb-2">
          <Logo className="w-12 h-12 text-brand-600" />
        </Link>

        {status === 'verifying' && (
          <>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verifying your email...</h2>
            <p className="text-slate-500 dark:text-slate-400">One moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Email verified</h2>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg text-sm">
              Your email address is confirmed. You're all set.
            </div>
            <Link
              to="/login"
              className="inline-block w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30"
            >
              Continue to Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verification failed</h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You can request a new link from your profile after signing in.
            </p>
          </>
        )}

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
