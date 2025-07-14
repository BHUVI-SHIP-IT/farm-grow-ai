import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, this is expected for new users
          console.log('No profile found for user:', userId);
          return null;
        }
        console.error('Error fetching profile:', error);
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const createInitialProfile = async (userId: string, email: string) => {
    try {
      console.log('Creating initial profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: email,
          role: 'farmer',
          preferred_language: 'english',
          profile_completed: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      console.log('Profile created:', data);
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    console.log('Initializing auth...');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            // Fetch profile data when user is authenticated
            console.log('Fetching profile for authenticated user');
            let profileData = await fetchProfile(session.user.id);
            
            // If no profile exists, create one (fallback in case trigger didn't work)
            if (!profileData) {
              console.log('No profile found, creating one...');
              profileData = await createInitialProfile(session.user.id, session.user.email || '');
            }
            
            setProfile(profileData);
            console.log('Profile set:', profileData);
          } catch (error) {
            console.error('Error handling auth state change:', error);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        
        // Always set loading to false after processing
        setLoading(false);
        console.log('Auth loading set to false');
      }
    );

    // Check for existing session immediately
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (!mounted) return;

        console.log('Session found:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            console.log('Fetching profile during init');
            let profileData = await fetchProfile(session.user.id);
            
            // If no profile exists, create one
            if (!profileData) {
              console.log('No profile found during init, creating one...');
              profileData = await createInitialProfile(session.user.id, session.user.email || '');
            }
            
            setProfile(profileData);
            console.log('Profile set during init:', profileData);
          } catch (error) {
            console.error('Error fetching profile during init:', error);
            setProfile(null);
          }
        }
        
        setLoading(false);
        console.log('Auth initialization complete - loading set to false');
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const redirectUrl = `${window.location.origin}/profile-setup`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No authenticated user') };
    }

    try {
      console.log('Updating profile with data:', updates);
      
      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ 
          user_id: user.id, 
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return { error };
      }

      console.log('Profile updated successfully:', data);
      
      // Update local state immediately
      setProfile(data);
      
      return { error: null };
    } catch (error) {
      console.error('Profile update exception:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};