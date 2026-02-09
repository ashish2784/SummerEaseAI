
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthFormProps {
  type: 'login' | 'signup';
  onToggle: () => void;
  onBack?: () => void;
}

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onToggle, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [validation, setValidation] = useState<PasswordValidation>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    if (type === 'signup') {
      setValidation({
        length: password.length >= 12, // Increased to 12 for robust security
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
      });
    }
  }, [password, type]);

  const isPasswordStrong = Object.values(validation).every(Boolean);
  const strengthScore = Object.values(validation).filter(Boolean).length;

  const getStrengthColor = () => {
    if (strengthScore <= 2) return 'bg-red-500';
    if (strengthScore <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore <= 4) return 'Fair';
    if (isPasswordStrong) return 'Strong & Secure';
    return 'Processing...';
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setMessage('Password reset instructions sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'signup' && !isPasswordStrong) {
      setError('High security requirements not met. Please follow the password guidelines.');
      return;
    }
    
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (type === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (signUpError) throw signUpError;
        setMessage('Verification email sent! Please check your inbox to activate your account.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-6 py-12 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {onBack && (
          <button 
            onClick={onBack}
            className="mb-6 flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        )}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border border-gray-100 dark:border-slate-800">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm mb-10 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-500/5 rounded-3xl mb-4">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black leading-9 tracking-tight text-gray-900 dark:text-white">
              {type === 'login' ? 'Vault Access' : 'Secure Registration'}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 font-medium">
              {type === 'login' ? 'Enter your credentials to proceed' : 'Create a highly secure entry point'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {type === 'signup' && (
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-2xl border-0 py-4 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm px-5 transition-all outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-2xl border-0 py-4 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm px-5 transition-all outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">Security Phrase</label>
                {type === 'login' && (
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-widest"
                  >
                    Reset?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-2xl border-0 py-4 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm px-5 transition-all outline-none"
              />

              {type === 'signup' && password.length > 0 && (
                <div className="mt-6 space-y-4 p-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Entropy Score</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${strengthScore === 5 ? 'text-green-500' : 'text-gray-500'}`}>{getStrengthLabel()}</span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                      style={{ width: `${(strengthScore / 5) * 100}%` }}
                    ></div>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-2">
                    {[
                      { key: 'length', label: '12+ Characters' },
                      { key: 'uppercase', label: 'Uppercase Letter' },
                      { key: 'lowercase', label: 'Lowercase Letter' },
                      { key: 'number', label: 'Numeric Digit' },
                      { key: 'special', label: 'Special Symbol' }
                    ].map((item) => (
                      <li key={item.key} className="flex items-center text-[10px] space-x-2">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${validation[item.key as keyof PasswordValidation] ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-transparent'}`}>
                           <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className={`font-bold transition-colors ${validation[item.key as keyof PasswordValidation] ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl animate-shake">
                <p className="text-red-600 dark:text-red-400 text-xs font-bold text-center leading-relaxed">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold text-center leading-relaxed">{message}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || (type === 'signup' && !isPasswordStrong)}
                className="flex w-full justify-center rounded-2xl bg-indigo-600 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (type === 'login' ? 'Authenticate' : 'Establish Vault')}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 dark:border-slate-800 text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              {type === 'login' ? "Unauthorized access?" : 'Already verified?'}
              <button 
                onClick={onToggle} 
                className="ml-2 font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors uppercase text-xs tracking-widest"
              >
                {type === 'login' ? 'Create Account' : 'Sign in'}
              </button>
            </p>
            <div className="mt-8 flex items-center justify-center space-x-3 opacity-30 grayscale">
               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
               </svg>
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Post-Quantum RSA Shield</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
