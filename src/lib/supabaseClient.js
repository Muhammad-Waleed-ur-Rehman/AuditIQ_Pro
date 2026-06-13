import { createClient } from '@supabase/supabase-js';

const env = import.meta.env || {};

const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const cleanedUrl = (supabaseUrl || '').trim();
const cleanedKey = (supabaseAnonKey || '').trim();

export const isSupabaseConfigured =
  cleanedUrl !== '' &&
  cleanedKey !== '' &&
  cleanedUrl !== 'your_supabase_project_url' &&
  cleanedKey !== 'your_supabase_anon_key';

export const supabase = isSupabaseConfigured
  ? createClient(cleanedUrl, cleanedKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function getSupabaseErrorMessage(error) {
  if (!error) return 'Supabase returned an unknown error.';
  if (typeof error === 'string') return error;
  return error.message || 'Supabase request failed.';
}
