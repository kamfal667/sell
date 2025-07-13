import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useUserBusiness } from '../context/UserBusinessContext';
import { useTheme } from '../context/ThemeContext';
import Loader from './Loader';
import styles from './BusinessConfigModal.module.css';

const BusinessConfigModal = ({ onClose, businessConfig }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { refreshBusinessConfig } = useUserBusiness();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom_boutique: businessConfig?.nom_boutique || '',
    type_business: businessConfig?.type_business || 'E-commerce',
    telephone_boutique: businessConfig?.telephone_boutique || '',
    devise: businessConfig?.devise || 'FCFA'
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    // Basic validation
    if (!formData.nom_boutique.trim()) {
      toast.error('Le nom de la boutique est requis');
      return false;
    }
    
    if (!formData.type_business) {
      toast.error('Le type de business est requis');
      return false;
    }
    
    // Phone validation (optional)
    if (formData.telephone_boutique && !/^\+?[0-9\s-]{8,15}$/.test(formData.telephone_boutique)) {
      toast.error('Format de téléphone invalide');
      return false;
    }
    
    if (!formData.devise.trim()) {
      toast.error('La devise est requise');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_business_config')
        .update({
          nom_boutique: formData.nom_boutique,
          type_business: formData.type_business,
          telephone_boutique: formData.telephone_boutique,
          devise: formData.devise
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success('Configuration de la boutique mise à jour avec succès');
      await refreshBusinessConfig();
      onClose();
    } catch (error) {
      toast.error(`Erreur lors de la mise à jour de la configuration: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`${styles.modalOverlay} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Modifier la configuration</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nom_boutique">Nom de la boutique</label>
            <input
              type="text"
              id="nom_boutique"
              name="nom_boutique"
              value={formData.nom_boutique}
              onChange={handleChange}
              placeholder="Nom de votre boutique"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Type de business</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="type_business"
                  value="E-commerce"
                  checked={formData.type_business === 'E-commerce'}
                  onChange={handleChange}
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
                />
                Hybride
              </label>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="telephone_boutique">Téléphone boutique</label>
            <input
              type="tel"
              id="telephone_boutique"
              name="telephone_boutique"
              value={formData.telephone_boutique}
              onChange={handleChange}
              placeholder="+33 1 23 45 67 89"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="devise">Devise</label>
            <input
              type="text"
              id="devise"
              name="devise"
              value={formData.devise}
              onChange={handleChange}
              placeholder="EUR, USD, FCFA, etc."
              required
            />
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? <Loader /> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessConfigModal;
