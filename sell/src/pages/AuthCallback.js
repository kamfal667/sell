import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import styles from '../styles/common.module.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Récupérer la session actuelle
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session || !session.user) {
          throw new Error('Aucune session utilisateur trouvée');
        }

        // Vérifier si l'utilisateur a déjà une configuration d'entreprise
        const { data: businessData, error: businessError } = await supabase
          .from('user_business_config')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (businessError && businessError.code !== 'PGRST116') {
          throw businessError;
        }

        // Rediriger vers onboarding si pas de config, sinon vers dashboard
        if (!businessData) {
          toast.success('Connexion réussie! Configurez votre entreprise.');
          navigate('/onboarding');
        } else {
          toast.success('Connexion réussie!');
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Erreur de callback OAuth:', err);
        setError(err.message);
        toast.error(`Erreur d'authentification: ${err.message}`);
        // En cas d'erreur, rediriger vers la page de connexion
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.glassContainer}>
          <h2>Authentification en cours...</h2>
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.glassContainer}>
          <h2>Erreur d'authentification</h2>
          <p>{error}</p>
          <button 
            className={styles.button}
            onClick={() => navigate('/login')}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
