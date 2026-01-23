import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { User, Session } from '@supabase/supabase-js';

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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata: UserMetadata) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata: UserMetadata) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) return { error };

      if (data.user) {
        const { error: profileError } = await supabase
          .from('app_d56ee_profiles')
          .insert({
            id: data.user.id,
            full_name: metadata.full_name,
            label: metadata.label,
            age: metadata.age,
            gender: metadata.gender,
            contact_number: metadata.contact_number,
            profile_image_url: metadata.profile_image_url,
            front_id_image_url: metadata.front_id_image_url,
            back_id_image_url: metadata.back_id_image_url,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  HomeTabs: undefined;
  CreatePost: undefined;
  EditPost: { postId: string };
  ViewPost: { postId: string };
  Chat: { conversationId: string; otherUserId: string };
  ConfirmClaim: { postId: string; claimId: string };
  VerifyReturn: { claimId: string };
  ProfileDetails: undefined;
  NotificationSettings: undefined;
  Settings: undefined;
  MapCreatePost: { onLocationSelect: (location: any) => void };
  MapViewPost: { latitude: number; longitude: number; title: string };
};

export type BottomTabParamList = {
  Home: undefined;
  MyPosts: undefined;
  Messages: undefined;
  Profile: undefined;
};