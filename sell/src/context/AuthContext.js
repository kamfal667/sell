import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        toast.error(`Erreur d'authentification: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Method to refresh user data after profile updates
  const refreshUser = async () => {
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      setUser(updatedUser || null);
    } catch (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    }
  };

  const value = {
    user,
    session,
    loading,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
