import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/common.module.css';
import Loader from '../components/Loader';
import googleIcon from '../assets/google-icon.svg';

const Login = () => {
  const navigate = useNavigate();
  const { businessConfig } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  // Redirect if user is already logged in and has business config
  useEffect(() => {
    if (businessConfig) {
      navigate('/dashboard');
    }
  }, [businessConfig, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast.error(`Erreur de connexion avec Google: ${error.message}`);
        setLoading(false);
        return;
      }
      
      // La redirection est gérée par Supabase OAuth et notre page AuthCallback
      // setLoading(false) n'est pas nécessaire car nous serons redirigés
    } catch (error) {
      toast.error(`Une erreur est survenue: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        toast.error(`Erreur de connexion: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Connexion réussie!');
      
      // Check if user has business config
      const { data: businessData, error: businessError } = await supabase
        .from('user_business_config')
        .select('*')
        .eq('user_id', data.session.user.id)
        .single();
      
      if (businessError && businessError.code !== 'PGRST116') {
        toast.error(`Erreur lors de la récupération des données: ${businessError.message}`);
        return;
      }
      
      // Redirect to onboarding if no business config, otherwise to dashboard
      if (!businessData) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(`Une erreur est survenue: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.formContainer} ${styles.glassContainer}`}>
        {loading && <Loader />}
        
        <div className={styles.logoContainer}>
          <img src="/assets/logo.png" alt="SellXY Stocks Logo" className={styles.logo} />
        </div>
        
        <h1 className={styles.formTitle}>Connexion</h1>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.formInput}
              disabled={loading}
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.formInput}
              disabled={loading}
            />
            {errors.password && <p className={styles.error}>{errors.password}</p>}
          </div>
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            Se connecter
          </button>
        </form>
        
        <div className={styles.divider}>
          <span>ou</span>
        </div>
        
        <button 
          type="button" 
          className={styles.googleButton}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <img src={googleIcon} alt="Google" className={styles.googleIcon} />
          Se connecter avec Google
        </button>
        
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Pas encore de compte? <Link to="/signup" className={styles.link}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
