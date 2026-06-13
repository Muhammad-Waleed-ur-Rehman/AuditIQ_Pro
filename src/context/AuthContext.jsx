import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (currentUser) => {
    if (!supabase || !currentUser) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, organization, job_title, department, phone, location, certifications, bio, created_at, updated_at')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (!error) {
      setProfile(data);
    } else {
      console.warn('Unable to load profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    const initialiseAuth = async () => {
      const { data: { session: currentSession } = {}, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.error('Unable to restore Supabase session:', error);
      }

      setSession(currentSession ?? null);
      setUser(currentSession?.user ?? null);
      await loadProfile(currentSession?.user ?? null);
      setLoading(false);
    };

    initialiseAuth();

    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      await loadProfile(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured. Please add your environment variables first.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email, password, metadata = {}) => {
    if (!supabase) throw new Error('Supabase is not configured. Please add your environment variables first.');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    if (!supabase || !user) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() });
    if (error) throw error;
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({ user, session, profile, loading, signIn, signUp, signOut, updateProfile }),
    [user, session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
