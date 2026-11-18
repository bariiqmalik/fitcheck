import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import { createClient } from '@supabase/supabase-js';
import { activeSupabaseUrl, activeSupabaseAnonKey, setRuntimeSupabaseCredentials } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

interface ConnectSupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectSupabaseModal: React.FC<ConnectSupabaseModalProps> = ({ isOpen, onClose }) => {
  const { success, error: toastError } = useToast();

  const [url, setUrl] = useState(activeSupabaseUrl && !activeSupabaseUrl.includes('your-project') ? activeSupabaseUrl : '');
  const [anonKey, setAnonKey] = useState(activeSupabaseAnonKey && !activeSupabaseAnonKey.includes('your-anon') ? activeSupabaseAnonKey : '');
  const [testing, setTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTestAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl.startsWith('https://') || !cleanUrl.includes('.supabase.co')) {
      setErrorMsg('Please enter a valid Supabase URL (e.g. https://your-project.supabase.co)');
      return;
    }

    if (cleanKey.length < 20) {
      setErrorMsg('Please enter a valid Supabase anon key (starts with eyJ...)');
      return;
    }

    setTesting(true);

    try {
      // Test the credentials by creating a temporary client
      const testClient = createClient(cleanUrl, cleanKey);
      const { error } = await testClient.auth.getSession();

      if (error && error.message && !error.message.includes('fetch')) {
        throw new Error(error.message);
      }

      success('Connected to Supabase!', 'Your cloud database and storage are now active.');
      setRuntimeSupabaseCredentials(cleanUrl, cleanKey);
      onClose();
    } catch (err: any) {
      console.error('Supabase test connection failed:', err);
      setErrorMsg(err.message || 'Could not connect to Supabase. Please verify your Project URL and Anon Key.');
    } finally {
      setTesting(false);
    }
  };

  const handleCopySqlNotice = () => {
    setCopiedSql(true);
    success('Instructions Copied', 'Paste into your Supabase SQL Editor from supabase/schema.sql');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect to Supabase"
      subtitle="Link your personal Supabase project for cloud Auth, Postgres database, and Storage."
      maxWidth="lg"
    >
      <form onSubmit={handleTestAndConnect} className="space-y-5 pt-2">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Instructions banner */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-stone-700 dark:text-stone-300 space-y-2">
          <div className="flex items-center justify-between font-semibold text-stone-900 dark:text-stone-100">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Where to find your credentials:
            </span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Supabase Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
            <li>Open your project at <strong>supabase.com</strong></li>
            <li>Go to <strong>Project Settings</strong> (gear icon) &rarr; <strong>API</strong></li>
            <li>Copy the <strong>Project URL</strong> and <strong>`anon` `public` API key</strong></li>
          </ol>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
            Supabase Project URL *
          </label>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://xyzabcdefg.supabase.co"
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
            Supabase `anon` `public` Key *
          </label>
          <textarea
            rows={2}
            required
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          />
        </div>

        {/* SQL Schema Reminder */}
        <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-stone-900 dark:text-stone-100 block">
              Database Tables & Storage Setup
            </span>
            <span className="text-stone-500 text-[11px]">
              Script is available in <code>supabase/schema.sql</code>
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopySqlNotice}
            className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied' : 'Schema Info'}</span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={testing}
            className="px-6 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-md hover:bg-stone-800 dark:hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {testing ? (
              <div className="w-4 h-4 border-2 border-white dark:border-stone-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Database className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>Test & Save Connection</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

