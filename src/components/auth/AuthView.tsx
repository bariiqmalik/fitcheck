import React, { useState } from 'react';
import { Shirt, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';

export const AuthView: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, activateDemoUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [googleNoticeOpen, setGoogleNoticeOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setEmailSentNotice(false);

    if (!email || !password) {
      setAuthError('Please fill in both email and password.');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'signup') {
        const { error, needsEmailConfirmation } = await signUpWithEmail(email, password, name);
        if (error) {
          setAuthError(error.message);
        } else if (needsEmailConfirmation) {
          setEmailSentNotice(true);
          success('Account Created', 'Please check your email to confirm your account.');
        } else {
          success('Welcome to Fitting Room!', 'Your wardrobe journey starts here.');
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setAuthError(error.message);
        } else {
          success('Welcome Back!', 'Logged in successfully.');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Show helpful configuration notice modal so user never hits the raw Supabase 400 error page
    setGoogleNoticeOpen(true);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetting(true);
    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        toastError('Reset link failed', error.message);
      } else {
        setResetSuccess(true);
        success('Reset Link Sent', 'Check your inbox for password reset instructions.');
      }
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* Left editorial visual hero banner */}
      <div className="lg:w-1/2 relative bg-stone-900 text-stone-100 flex flex-col justify-between p-8 sm:p-12 lg:p-16 min-h-[380px] lg:min-h-screen overflow-hidden">
        {/* Background Editorial Fashion Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transform hover:scale-100 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />

        {/* Top brand header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl tracking-widest uppercase font-bold text-white">
              Fitting Room
            </h1>
            <p className="text-xs text-stone-300 tracking-wider uppercase font-light">
              Your Personal AI Stylist
            </p>
          </div>
        </div>

        {/* Editorial Value Pitch */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-amber-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Specifically for Your Body & Face
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-tight text-white mb-4">
            Never wonder what to wear again.
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Upload your wardrobe pieces. Our stylist engine analyses your exact body proportions, face shape, and color undertones to build flattering, weather-appropriate outfits in seconds.
          </p>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
          <span>Row Level Security & Private Vault</span>
          <span>Capsule Wardrobe Ready</span>
        </div>
      </div>

      {/* Right side Auth Form Container */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {mode === 'signin' ? 'Welcome back' : 'Create your wardrobe vault'}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
              {mode === 'signin'
                ? 'Sign in to access your digitized closet and style recommendations.'
                : 'Join Fitting Room and elevate your daily styling routine.'}
            </p>
          </div>

          {/* Quick 1-Click Demo Access */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border-2 border-amber-500/30 dark:border-amber-500/20 text-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Fastest Way: Instant Demo
            </span>
            <p className="text-xs text-stone-600 dark:text-stone-300 mb-3">
              Explore Fitting Room immediately with a pre-loaded wardrobe & profile — no signup needed!
            </p>
            <button
              type="button"
              onClick={activateDemoUser}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-sm font-bold shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enter Demo Mode (1-Click)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800" />
            </div>
            <span className="relative px-4 text-xs uppercase tracking-wider text-stone-400 bg-stone-50 dark:bg-stone-950 font-medium">
              or use your Supabase account
            </span>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-850 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
            <span className="text-[10px] text-stone-400 font-normal">(Needs OAuth in Supabase)</span>
          </button>

          {/* Inline Alerts */}
          {authError && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {emailSentNotice && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Confirmation link sent! Please check your inbox and verify your email.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Camille Laurent"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-sm transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setForgotModalOpen(true);
                    }}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white dark:border-stone-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between sign in and sign up */}
          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 text-center">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {mode === 'signin' ? "Don't have an account yet?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setAuthError(null);
                }}
                className="ml-1.5 font-semibold text-stone-900 dark:text-stone-100 hover:underline"
              >
                {mode === 'signin' ? 'Sign up for free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => {
          setForgotModalOpen(false);
          setResetSuccess(false);
        }}
        title="Reset Password"
        subtitle="Enter your email address and we'll send you a link to reset your password."
      >
        {resetSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
              Reset Link Dispatched
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto mb-6">
              If an account exists with {resetEmail}, you will receive password reset instructions.
            </p>
            <button
              onClick={() => setForgotModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Your Email
              </label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetting}
                className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-xs hover:bg-stone-800 disabled:opacity-50"
              >
                {resetting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
      </Modal>
      {/* Google Sign-in Setup Guidance Modal */}
      <Modal
        isOpen={googleNoticeOpen}
        onClose={() => setGoogleNoticeOpen(false)}
        title="Google Authentication"
        subtitle="Google OAuth requires registering credentials in Supabase first."
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            By default, new Supabase projects do not have Google OAuth enabled until you provide your Google Cloud Client ID & Secret in the Supabase Dashboard.
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs space-y-2">
            <span className="font-semibold text-stone-900 dark:text-stone-100 block">
              How to test immediately:
            </span>
            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400 text-[11px]">
              <li><strong>Option 1 (Fastest):</strong> Click "Enter Demo Mode" below to jump straight in with 1 click.</li>
              <li><strong>Option 2:</strong> Use the Email & Password form right on this page with any test email.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setGoogleNoticeOpen(false);
                activateDemoUser();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enter Demo Mode (1-Click)</span>
            </button>

            <button
              type="button"
              onClick={() => setGoogleNoticeOpen(false)}
              className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold"
            >
              Use Email & Password
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

