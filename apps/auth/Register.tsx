import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { Logo } from '../../components/Icons';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'ARTIST' as 'ARTIST' | 'LABEL',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and a number';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.accountType
      );

      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-card-dark p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-dark-800">
        <div className="text-center">
          <Link to="/" className="flex justify-center mb-6">
            <Logo className="w-12 h-12 text-brand-600" />
          </Link>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-brand-600 hover:text-brand-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, accountType: 'ARTIST' }))}
            className={`p-4 rounded-xl border-2 text-center transition-all ${formData.accountType === 'ARTIST' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
          >
            <span className="material-symbols-outlined text-3xl mb-2 text-brand-600">mic</span>
            <p className={`font-bold text-sm ${formData.accountType === 'ARTIST' ? 'text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Artist</p>
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, accountType: 'LABEL' }))}
            className={`p-4 rounded-xl border-2 text-center transition-all ${formData.accountType === 'LABEL' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
          >
            <span className="material-symbols-outlined text-3xl mb-2 text-purple-600">business</span>
            <p className={`font-bold text-sm ${formData.accountType === 'LABEL' ? 'text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Label</p>
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="sr-only">
              {formData.accountType === 'ARTIST' ? 'Artist Name' : 'Label Name'}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className={`appearance-none relative block w-full px-3 py-3 border ${validationErrors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-bold`}
              placeholder={formData.accountType === 'ARTIST' ? 'Full Name / Artist Name' : 'Your label name'}
            />
            {validationErrors.name && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`appearance-none relative block w-full px-3 py-3 border ${validationErrors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-bold`}
              placeholder="Email address"
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`appearance-none relative block w-full px-3 py-3 border ${validationErrors.password ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-bold`}
              placeholder="Password"
            />
            {validationErrors.password && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="sr-only">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`appearance-none relative block w-full px-3 py-3 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} placeholder-slate-500 text-slate-900 dark:text-white dark:bg-input-dark rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-bold`}
              placeholder="Confirm your password"
            />
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded mt-1"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
              I agree to the{' '}
              <a href="#" className="text-brand-600 hover:text-brand-500 font-medium">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-brand-600 hover:text-brand-500 font-medium">Privacy Policy</a>
            </label>
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
            <p className="text-xs text-center text-slate-500 mt-4">
              By clicking Create Account, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </form>

        <div className="text-center mt-2">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
