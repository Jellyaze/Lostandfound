import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { User, Session, Provider } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface UserMetadata {
  full_name?: string;
  label?: string;
  age?: number;
  gender?: string;
  contact_number?: string;
  profile_image_url?: string;
  front_id_image_url?: string;
  back_id_image_url?: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  label: string | null;
  age: number | null;
  gender: string | null;
  contact_number: string | null;
  profile_image_url: string | null;
  front_id_image_url: string | null;
  back_id_image_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: ProfileRow | null;

  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, metadata: UserMetadata) => Promise<{ error: any | null }>;

  signInWithGoogle: () => Promise<{ error: any | null }>;
  signInWithFacebook: () => Promise<{ error: any | null }>;
  signInWithApple: () => Promise<{ error: any | null }>;

  updateProfile: (updates: Partial<ProfileRow>) => Promise<{ error: any | null }>;

  signOut: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  profile: null,

  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),

  signInWithGoogle: async () => ({ error: null }),
  signInWithFacebook: async () => ({ error: null }),
  signInWithApple: async () => ({ error: null }),

  updateProfile: async () => ({ error: null }),

  signOut: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

const ensureProfileRow = async (user: User) => {
  const { data: existing, error: selectError } = await supabase
    .from('app_d56ee_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (selectError) {
    console.error('Error checking profile:', selectError);
    return;
  }

  if (existing) return;

  const full_name =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    (user.user_metadata?.display_name as string) ||
    '';

  const profile_image_url =
    (user.user_metadata?.avatar_url as string) ||
    (user.user_metadata?.picture as string) ||
    '';

  const { error: insertError } = await supabase.from('app_d56ee_profiles').insert({
    id: user.id,
    full_name,
    label: null,
    age: null,
    gender: null,
    contact_number: null,
    profile_image_url,
    front_id_image_url: null,
    back_id_image_url: null,
  });

  if (insertError) {
    console.error('Error creating profile for OAuth user:', insertError);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from('app_d56ee_profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data ?? null);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await ensureProfileRow(session.user);
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await ensureProfileRow(session.user);
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata: UserMetadata) => {
    try {
      const redirectTo = AuthSession.makeRedirectUri({ useProxy: true });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: redirectTo,
        },
      });

      if (error) return { error };

      if (data.user) {
        const { error: profileError } = await supabase.from('app_d56ee_profiles').insert({
          id: data.user.id,
          full_name: metadata.full_name ?? '',
          label: metadata.label ?? null,
          age: metadata.age ?? null,
          gender: metadata.gender ?? null,
          contact_number: metadata.contact_number ?? null,
          profile_image_url: metadata.profile_image_url ?? null,
          front_id_image_url: metadata.front_id_image_url ?? null,
          back_id_image_url: metadata.back_id_image_url ?? null,
        });

        if (profileError) console.error('Error creating profile:', profileError);
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithOAuth = async (provider: Provider) => {
    try {
      const redirectTo = AuthSession.makeRedirectUri({ useProxy: true });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) return { error };
      if (!data?.url) return { error: new Error('Missing OAuth URL') };

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type !== 'success') {
        return { error: new Error('OAuth cancelled') };
      }

      const url = result.url;

      const params = new URL(url).searchParams;
      const fragment = url.split('#')[1];
      const fragmentParams = fragment ? new URLSearchParams(fragment) : null;

      const access_token = fragmentParams?.get('access_token') ?? params.get('access_token');
      const refresh_token = fragmentParams?.get('refresh_token') ?? params.get('refresh_token');

      if (!access_token || !refresh_token) {
        return { error: new Error('Missing tokens from OAuth redirect') };
      }

      const { error: setSessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (setSessionError) return { error: setSessionError };

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithGoogle = async () => signInWithOAuth('google');
  const signInWithFacebook = async () => signInWithOAuth('facebook');

  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') {
      return { error: new Error('Apple Sign-In is iOS only') };
    }
    return signInWithOAuth('apple');
  };

  const updateProfile = async (updates: Partial<ProfileRow>) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) return { error: userError };

      const currentUser = userData?.user;
      if (!currentUser) return { error: new Error('No user logged in') };

      const { error } = await supabase
        .from('app_d56ee_profiles')
        .update({
          ...updates,
        })
        .eq('id', currentUser.id);

      if (!error) {
        await fetchProfile(currentUser.id);
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    profile,

    signIn,
    signUp,

    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,

    updateProfile,

    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
