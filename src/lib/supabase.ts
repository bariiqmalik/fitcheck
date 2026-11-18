import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from either .env, .env.local, or localStorage
const envUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('fitting_room_supabase_url') || '' : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('fitting_room_supabase_key') || '' : '';

export const activeSupabaseUrl = localUrl || envUrl;
export const activeSupabaseAnonKey = localKey || envKey;

export const isSupabaseConfigured = Boolean(
  activeSupabaseUrl &&
  activeSupabaseAnonKey &&
  activeSupabaseUrl.startsWith('https://') &&
  activeSupabaseAnonKey.length > 20 &&
  !activeSupabaseUrl.includes('your-project')
);

export function getSupabaseClient(): SupabaseClient {
  return createClient(
    isSupabaseConfigured ? activeSupabaseUrl : 'https://placeholder.supabase.co',
    isSupabaseConfigured ? activeSupabaseAnonKey : 'placeholder-anon-key'
  );
}

export const supabase = getSupabaseClient();

export function setRuntimeSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fitting_room_supabase_url', url.trim());
    localStorage.setItem('fitting_room_supabase_key', key.trim());
    localStorage.removeItem('fitting_room_demo_mode');
    window.location.reload();
  }
}

export function clearRuntimeSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fitting_room_supabase_url');
    localStorage.removeItem('fitting_room_supabase_key');
    window.location.reload();
  }
}
