import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabaseClient';
import styles from '../styles/common.module.css';

const Logout = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log('Tentative de déconnexion...');
    
    try {
      // Vérifier si le client Supabase est correctement initialisé
      if (!supabase || !supabase.auth) {
        console.error('Client Supabase non initialisé correctement');
        toast.error('Erreur système: Client non initialisé');
        setIsLoading(false);
        return;
      }
      
      console.log('Appel de supabase.auth.signOut()');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        toast.error(`Erreur de déconnexion: ${error.message}`);
        setIsLoading(false);
        return;
      }
      
      console.log('Déconnexion réussie, redirection vers la page de connexion');
      toast.success('Déconnexion réussie!');
      
      // Forcer la redirection et le rechargement
      window.location.href = '/';
    } catch (error) {
      console.error('Exception lors de la déconnexion:', error);
      toast.error(`Une erreur est survenue: ${error.message || 'Erreur inconnue'}`);
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className={styles.button}
      style={{ maxWidth: '150px', opacity: isLoading ? 0.7 : 1 }}
      disabled={isLoading}
    >
      {isLoading ? 'Déconnexion...' : 'Déconnexion'}
    </button>
  );
};

export default Logout;
