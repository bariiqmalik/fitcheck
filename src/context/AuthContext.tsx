import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserPlan } from '../types/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  activateDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_ID = 'demo-user-123e4567-e89b-12d3-a456-426614174000';

const INITIAL_DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  name: 'Camille Laurent',
  age: 28,
  height_cm: 168,
  weight_kg: 58,
  body_type: 'hourglass',
  face_shape: 'oval',
  skin_tone: 'Medium Olive',
  undertone: 'warm',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  profile_completed: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return !isSupabaseConfigured || localStorage.getItem('fitting_room_demo_mode') === 'true';
  });

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      if (isDemoMode) {
        const saved = localStorage.getItem(`fitting_room_profile_${userId}`);
        if (saved) {
          setProfile(JSON.parse(saved));
        } else {
          setProfile(INITIAL_DEMO_PROFILE);
        }
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        const localPlan = localStorage.getItem(`fitting_room_user_plan_${userId}`) as UserPlan | null;
        setProfile({
          ...(data as Profile),
          plan: (data.plan as UserPlan) || localPlan || 'free',
        });
      } else {
        // Create initial blank profile record if none exists yet
        const localPlan = (localStorage.getItem(`fitting_room_user_plan_${userId}`) as UserPlan) || 'free';
        const newProfile: Partial<Profile> = {
          id: userId,
          name: '',
          profile_completed: false,
          plan: localPlan,
        };
        const { data: created } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        if (created) setProfile({ ...(created as Profile), plan: (created.plan as UserPlan) || localPlan });
      }
    } catch (err) {
      console.error('Profile fetch exception:', err);
    }
  }, [isDemoMode]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (!isSupabaseConfigured || isDemoMode) {
          const isDemoActive = localStorage.getItem('fitting_room_demo_mode') === 'true' || !isSupabaseConfigured;
          if (isDemoActive) {
            setIsDemoMode(true);
            const mockUser = {
              id: DEMO_USER_ID,
              email: 'camille@fittingroom.demo',
              user_metadata: { full_name: 'Camille Laurent' },
              app_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            } as unknown as User;
            setUser(mockUser);
            await fetchProfile(DEMO_USER_ID);
          }
          setLoading(false);
          return;
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id);
          }
          setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (!mounted) return;
            setSession(newSession);
            setUser(newSession?.user ?? null);
            if (newSession?.user) {
              await fetchProfile(newSession.user.id);
            } else {
              setProfile(null);
            }
            setLoading(false);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [fetchProfile, isDemoMode]);

  const activateDemoUser = () => {
    setIsDemoMode(true);
    localStorage.setItem('fitting_room_demo_mode', 'true');
    const mockUser = {
      id: DEMO_USER_ID,
      email: 'camille@fittingroom.demo',
      user_metadata: { full_name: 'Camille Laurent' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;
    setUser(mockUser);
    setProfile(INITIAL_DEMO_PROFILE);
    localStorage.setItem(`fitting_room_profile_${DEMO_USER_ID}`, JSON.stringify(INITIAL_DEMO_PROFILE));
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (isDemoMode) {
      activateDemoUser();
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    if (isDemoMode) {
      activateDemoUser();
      return { error: null, needsEmailConfirmation: false };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || '',
          },
        },
      });

      if (error) return { error };

      // If Supabase has email confirmation enabled, session might be null
      const needsEmailConfirmation = !data.session;
      return { error: null, needsEmailConfirmation };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    if (isDemoMode) {
      activateDemoUser();
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const resetPassword = async (email: string) => {
    if (isDemoMode) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('fitting_room_demo_mode');
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('User not logged in') };

    const updated = {
      ...(profile || { id: user.id, profile_completed: false }),
      ...updates,
      updated_at: new Date().toISOString(),
    } as Profile;

    if (isDemoMode) {
      setProfile(updated);
      localStorage.setItem(`fitting_room_profile_${user.id}`, JSON.stringify(updated));
      return { error: null };
    }

    try {
      if (updates.plan) {
        localStorage.setItem(`fitting_room_user_plan_${user.id}`, updates.plan);
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(updated)
        .select()
        .single();

      if (error) {
        // Fallback: If Postgres schema doesn't yet have 'plan' column, upsert without it
        if (error.message?.includes('plan') || error.details?.includes('plan')) {
          const { plan: _unusedPlan, ...withoutPlan } = updated;
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('profiles')
            .upsert(withoutPlan)
            .select()
            .single();

          if (fallbackError) return { error: fallbackError };
          const resolvedPlan = updates.plan || profile?.plan || 'free';
          setProfile({ ...(fallbackData as Profile), plan: resolvedPlan });
          return { error: null };
        }
        return { error };
      }

      if (data) {
        const resolvedPlan = (data.plan as UserPlan) || updates.plan || profile?.plan || 'free';
        setProfile({ ...(data as Profile), plan: resolvedPlan });
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const deleteAccount = async () => {
    if (!user) return { error: new Error('Not logged in') };

    if (isDemoMode) {
      localStorage.removeItem('fitting_room_demo_mode');
      localStorage.removeItem(`fitting_room_profile_${user.id}`);
      localStorage.removeItem(`fitting_room_wardrobe_${user.id}`);
      localStorage.removeItem(`fitting_room_outfits_${user.id}`);
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error: null };
    }

    try {
      // Call Postgres RPC function defined in schema.sql
      const { error } = await supabase.rpc('delete_user_account');
      if (error) {
        // Fallback: manually delete profile row and sign out
        await supabase.from('profiles').delete().eq('id', user.id);
      }
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isDemoMode,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPassword,
        signOut,
        updateProfile,
        refreshProfile,
        deleteAccount,
        activateDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

