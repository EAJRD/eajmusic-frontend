import React from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { getInsforge } from '../../src/lib/insforge';

const GoogleIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.89c2.28-2.1 3.59-5.2 3.59-8.82Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.89-3c-1.08.73-2.46 1.16-4.05 1.16-3.11 0-5.75-2.1-6.69-4.92H1.29v3.09A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.31 14.33A7.2 7.2 0 0 1 4.93 12c0-.81.14-1.6.38-2.33V6.58H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.42l4.02-3.09Z" />
    <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.58l4.02 3.09C6.25 6.85 8.89 4.77 12 4.77Z" />
  </svg>
);

const GitHubIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.5 0 12.3c0 5.44 3.44 10.05 8.21 11.68.6.12.82-.27.82-.6 0-.29-.01-1.06-.02-2.08-3.34.75-4.04-1.65-4.04-1.65-.55-1.44-1.34-1.82-1.34-1.82-1.09-.77.08-.76.08-.76 1.21.09 1.84 1.28 1.84 1.28 1.07 1.87 2.81 1.33 3.49 1.02.11-.79.42-1.33.76-1.64-2.67-.31-5.47-1.38-5.47-6.13 0-1.35.46-2.46 1.22-3.32-.12-.31-.53-1.56.12-3.25 0 0 1-.33 3.3 1.27a11.3 11.3 0 0 1 6 0c2.3-1.6 3.3-1.27 3.3-1.27.65 1.69.24 2.94.12 3.25.76.86 1.22 1.97 1.22 3.32 0 4.76-2.81 5.81-5.49 6.12.43.38.81 1.13.81 2.29 0 1.65-.02 2.98-.02 3.39 0 .33.22.72.83.6C20.57 22.34 24 17.73 24 12.3 24 5.5 18.63 0 12 0Z" />
  </svg>
);

const PROVIDER_LABEL: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
};

const PROVIDER_ICON: Record<string, React.FC> = {
  google: GoogleIcon,
  github: GitHubIcon,
};

// Providers come from the backend (oAuthProviders, via getPublicAuthConfig),
// never hardcoded - so this list always matches what's actually enabled.
// Fetched here (not in AuthContext) so pages that never render this
// component - the marketing homepage chief among them - never trigger the
// InsForge SDK to load at all.
const OAuthButtons: React.FC<{ accountType?: string; label?: string }> = ({ accountType, label = 'Continue' }) => {
  const { loginWithOAuth } = useAuth();
  const [providers, setProviders] = React.useState<string[]>([]);
  const [error, setError] = React.useState('');
  const [pending, setPending] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    getInsforge()
      .then((insforge) => insforge.auth.getPublicAuthConfig())
      .then(({ data }) => {
        if (!cancelled) setProviders((data as any)?.oAuthProviders || []);
      })
      .catch(() => {
        // Non-fatal - OAuth buttons just won't render.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (providers.length === 0) return null;

  const handleClick = async (provider: string) => {
    setError('');
    setPending(provider);
    const result = await loginWithOAuth(provider, accountType);
    if (!result.success) {
      setError(result.error || 'Failed to start sign-in.');
      setPending(null);
    }
    // On success the page navigates away - no need to reset `pending`.
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white dark:bg-card-dark text-slate-400 font-bold uppercase tracking-wide">Or</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {providers.map((provider) => {
          const Icon = PROVIDER_ICON[provider];
          if (!Icon) return null;
          return (
            <button
              key={provider}
              type="button"
              onClick={() => handleClick(provider)}
              disabled={pending !== null}
              className="flex items-center justify-center gap-3 w-full py-2.5 px-4 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-input-dark hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Icon />
              {pending === provider ? 'Redirecting...' : `${label} with ${PROVIDER_LABEL[provider] || provider}`}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OAuthButtons;
