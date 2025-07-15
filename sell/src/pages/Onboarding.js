import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useUserBusiness } from '../context/UserBusinessContext';
import styles from '../styles/common.module.css';
import Loader from '../components/Loader';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { businessConfig, loading: configLoading } = useUserBusiness();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nom_boutique: '',
    type_business: 'E-commerce',
    telephone_boutique: '+225 ',
    devise: 'FCFA',
  });
  const [errors, setErrors] = useState({});

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Only redirect to dashboard if user has completed business config
  useEffect(() => {
    if (businessConfig && !configLoading && user) {
      // Si l'utilisateur a déjà une configuration, on le redirige vers le dashboard
      navigate('/dashboard');
    }
  }, [user, businessConfig, configLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation spéciale pour le champ téléphone
    if (name === 'telephone_boutique') {
      // Vérifier si la valeur commence par +225 et ne contient que des chiffres après
      const prefix = '+225 ';
      
      // Si l'utilisateur essaie de supprimer le préfixe, on le maintient
      if (!value.startsWith(prefix)) {
        // Extraire uniquement les chiffres de la saisie
        const digits = value.replace(/\D/g, '');
        setFormData({ ...formData, [name]: prefix + digits });
      } else {
        // Extraire la partie après le préfixe
        const afterPrefix = value.substring(prefix.length);
        // Ne garder que les chiffres
        const onlyDigits = afterPrefix.replace(/\D/g, '');
        setFormData({ ...formData, [name]: prefix + onlyDigits });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.nom_boutique.trim()) {
          newErrors.nom_boutique = 'Le nom de la boutique est obligatoire';
        }
        break;
      case 2:
        if (!formData.type_business) {
          newErrors.type_business = 'Le type de business est obligatoire';
        }
        break;
      case 3:
        if (!formData.telephone_boutique.trim()) {
          newErrors.telephone_boutique = 'Le téléphone de la boutique est obligatoire';
        } else {
          // Vérifier que le numéro contient au moins 8 chiffres après le préfixe +225
          const prefix = '+225 ';
          const digitsAfterPrefix = formData.telephone_boutique
            .substring(prefix.length)
            .replace(/\D/g, '');
          
          if (digitsAfterPrefix.length < 8) {
            newErrors.telephone_boutique = 'Le numéro doit contenir au moins 8 chiffres après +225';
          }
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Insert business config with FCFA as default currency
      const { error } = await supabase.from('user_business_config').insert({
        user_id: user.id,
        nom_boutique: formData.nom_boutique,
        type_business: formData.type_business,
        telephone_boutique: formData.telephone_boutique,
        devise: 'FCFA', // Devise FCFA par défaut
      });
      
      if (error) {
        toast.error(`Erreur lors de l'enregistrement: ${error.message}`);
        return;
      }
      
      toast.success('Configuration enregistrée avec succès!');
      
      // Forcer un court délai pour s'assurer que la redirection se produit après l'enregistrement
      setTimeout(() => {
        // Redirection forcée vers le dashboard
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      toast.error(`Une erreur est survenue: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.formGroup}>
            <label htmlFor="nom_boutique" className={styles.formLabel}>Nom de la boutique</label>
            <input
              type="text"
              id="nom_boutique"
              name="nom_boutique"
              value={formData.nom_boutique}
              onChange={handleChange}
              className={styles.formInput}
              disabled={loading}
            />
            {errors.nom_boutique && <p className={styles.error}>{errors.nom_boutique}</p>}
          </div>
        );
      case 2:
        return (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Type de business</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="type_business"
                  value="E-commerce"
                  checked={formData.type_business === 'E-commerce'}
                  onChange={handleChange}
                  className={styles.radioInput}
                  disabled={loading}
                />
                E-commerce
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="type_business"
                  value="Magasin physique"
                  checked={formData.type_business === 'Magasin physique'}
                  onChange={handleChange}
                  className={styles.radioInput}
                  disabled={loading}
                />
                Magasin physique
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="type_business"
                  value="Hybride"
                  checked={formData.type_business === 'Hybride'}
                  onChange={handleChange}
                  className={styles.radioInput}
                  disabled={loading}
                />
                Hybride
              </label>
            </div>
            {errors.type_business && <p className={styles.error}>{errors.type_business}</p>}
          </div>
        );
      case 3:
        return (
          <div className={styles.formGroup}>
            <label htmlFor="telephone_boutique" className={styles.formLabel}>Téléphone de la boutique</label>
            <input
              type="tel"
              id="telephone_boutique"
              name="telephone_boutique"
              value={formData.telephone_boutique}
              onChange={handleChange}
              className={styles.formInput}
              disabled={loading}
              placeholder="+225 XXXXXXXX"
            />
            <p className={styles.helpText} style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>Format: +225 suivi de votre numéro</p>
            {errors.telephone_boutique && <p className={styles.error}>{errors.telephone_boutique}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.formContainer} ${styles.glassContainer}`}>
        {(loading || configLoading) && <Loader />}
        
        <h1 className={styles.formTitle}>Configuration de votre boutique</h1>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Étape {currentStep} sur 3
        </p>
        
        <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
          {renderStep()}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={handlePrevious}
                className={styles.button}
                style={{ maxWidth: '45%' }}
                disabled={loading}
              >
                Précédent
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                type="button" 
                onClick={handleNext}
                className={styles.button}
                style={{ maxWidth: currentStep > 1 ? '45%' : '100%' }}
                disabled={loading}
              >
                Suivant
              </button>
            ) : (
              <button 
                type="submit" 
                className={styles.button}
                style={{ maxWidth: '45%' }}
                disabled={loading}
              >
                Terminer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
