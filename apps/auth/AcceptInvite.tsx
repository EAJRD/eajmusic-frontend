import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { PublicService } from '../../src/services/api';
import { Logo } from '../../components/Icons';
import { validatePassword } from '../../src/utils/passwordPolicy';
import { savePendingRegistration, clearPendingRegistration } from '../../src/utils/pendingRegistration';

// Landing page for a label-artist invitation link (see POST
// /artist/label/artists/invite + labelInvitationEmailHtml). No account
// exists yet at this point — this page is what actually creates it, gated
// entirely by the token in the URL. The email and name are fixed by the
// invitation (the label already set them); the invited person only ever
// chooses their own password.
const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, verifyEmailCode, resendVerificationCode } = useAuth();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'loading' | 'invalid' | 'ready'>('loading');
  const [invitation, setInvitation] = useState<{ email: string; name: string; labelName: string } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    PublicService.getLabelInvitation(token)
      .then((data) => {
        if (!data) throw new Error('invalid');
        setInvitation(data);
        setStatus('ready');
      })
      .catch(() => setStatus('invalid'));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    if (!invitation) return;

    const pwError = validatePassword(password);
    if (pwError) { setPasswordError(pwError); return; }
    if (password !== confirmPassword) { setPasswordError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const result = await register(invitation.name, invitation.email, password, 'ARTIST');
      if (result.success && result.requireEmailVerification) {
        savePendingRegistration({ email: invitation.email, name: invitation.name, accountType: 'ARTIST', invitationToken: token });
        setStep('verify');
      } else if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Failed to accept invitation.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;
    setError('');
    setLoading(true);
    try {
      const result = await verifyEmailCode(invitation.email, otp, invitation.name, 'ARTIST', token);
      if (result.success) {
        clearPendingRegistration();
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Invalid or expired code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!invitation) return;
    setResending(true);
    setResendMessage('');
    try {
      const result = await resendVerificationCode(invitation.email);
      setResendMessage(result.success ? 'Code sent. Check your inbox.' : (result.error || 'Failed to resend code.'));
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-6">
        <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-card-dark p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-dark-800">
          <Link to="/" className="flex justify-center mb-2"><Logo className="w-12 h-12 text-brand-600" /></Link>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">This invitation link is invalid or has expired</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ask the label that invited you to send a new one.</p>
          <Link to="/login" className="inline-block mt-2 text-sm font-bold text-brand-600 hover:text-brand-500">Back to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-card-dark p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-dark-800">
        <div className="text-center">
          <Link to="/" className="flex justify-center mb-6"><Logo className="w-12 h-12 text-brand-600" /></Link>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {invitation?.labelName} invited you to EAJMUSIC
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Choose a password to activate <span className="font-bold">{invitation?.email}</span>.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-left">
            {error}
          </div>
        )}

        {step === 'verify' ? (
          <form className="space-y-6" onSubmit={handleVerify}>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              Enter the 6-digit code we sent to <span className="font-bold">{invitation?.email}</span>.
            </p>
            <input
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
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Join'}
            </button>
            <div className="text-center">
              {resendMessage && <p className="text-xs text-slate-500 mb-2">{resendMessage}</p>}
              <button type="button" onClick={handleResend} disabled={resending} className="text-sm font-bold text-brand-600 hover:text-brand-500 disabled:opacity-50">
                {resending ? 'Sending...' : "Didn't get a code? Resend"}
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-bold"
                placeholder="Password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-bold"
                placeholder="Confirm your password"
              />
            </div>
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Accept Invitation'}
            </button>
          </form>
        )}

        <div className="text-center mt-2">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
