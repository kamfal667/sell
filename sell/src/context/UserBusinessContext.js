import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'react-toastify';

const UserBusinessContext = createContext();

export const useUserBusiness = () => useContext(UserBusinessContext);

export const UserBusinessProvider = ({ children }) => {
  const { user } = useAuth();
  const [businessConfig, setBusinessConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBusinessConfig = async () => {
    if (!user) {
      setBusinessConfig(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching business config for user:', user.id);
      const { data, error } = await supabase
        .from('user_business_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
          toast.error(`Erreur lors de la récupération de la configuration: ${error.message}`);
        }
        console.log('No business config found for user:', user.id);
        setBusinessConfig(null);
      } else {
        console.log('Business config found:', data);
        setBusinessConfig(data);
      }
    } catch (error) {
      console.error('Error fetching business config:', error);
      toast.error(`Une erreur est survenue: ${error.message}`);
      setBusinessConfig(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessConfig();
  }, [user]);
  
  // Method to refresh business config after updates
  const refreshBusinessConfig = async () => {
    if (user) {
      await fetchBusinessConfig();
    }
  };

  const value = {
    businessConfig,
    loading,
    businessType: businessConfig?.type_business || null,
    isEcommerce: businessConfig?.type_business === 'E-commerce',
    isPhysical: businessConfig?.type_business === 'Magasin physique',
    isHybrid: businessConfig?.type_business === 'Hybride',
    currency: businessConfig?.devise || 'FCFA',
    refreshBusinessConfig
  };

  return <UserBusinessContext.Provider value={value}>{children}</UserBusinessContext.Provider>;
};
