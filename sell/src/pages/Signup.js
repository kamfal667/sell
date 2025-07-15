import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabaseClient';
import styles from '../styles/common.module.css';
import Loader from '../components/Loader';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

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
    
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est obligatoire';
    }
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            prenom: formData.prenom,
            nom: formData.nom,
          },
        },
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Cet email est déjà utilisé');
        } else {
          toast.error(`Erreur d'inscription: ${error.message}`);
        }
        return;
      }
      
      // Attendre un peu pour s'assurer que la session est bien créée avant de rediriger
      toast.success('Inscription réussie! Redirection vers la configuration de votre boutique...');
      
      // Attendre que la session soit bien établie avant de rediriger
      setTimeout(() => {
        navigate('/onboarding');
      }, 1000);
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
        
        <h1 className={styles.formTitle}>Créer un compte</h1>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="prenom" className={styles.formLabel}>Prénom</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className={styles.formInput}
              disabled={loading}
            />
            {errors.prenom && <p className={styles.error}>{errors.prenom}</p>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="nom" className={styles.formLabel}>Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={styles.formInput}
              disabled={loading}
            />
            {errors.nom && <p className={styles.error}>{errors.nom}</p>}
          </div>
          
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
            S'inscrire
          </button>
        </form>
        
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Déjà un compte? <Link to="/login" className={styles.link}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
