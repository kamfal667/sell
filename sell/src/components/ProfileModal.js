import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Loader from './Loader';
import styles from './ProfileModal.module.css';

const ProfileModal = ({ onClose, userData }) => {
  const { refreshUser } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    prenom: userData?.prenom || '',
    nom: userData?.nom || '',
    email: userData?.email || '',
    telephone: userData?.telephone || '',
    motdepasse: '',
    confirmMotdepasse: '',
    changePassword: false
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const validateForm = () => {
    // Basic validation
    if (!formData.prenom.trim()) {
      toast.error('Le prénom est requis');
      return false;
    }
    
    if (!formData.nom.trim()) {
      toast.error('Le nom est requis');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('L\'email est requis');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Format d\'email invalide');
      return false;
    }
    
    // Phone validation (optional)
    if (formData.telephone && !/^\+?[0-9\s-]{8,15}$/.test(formData.telephone)) {
      toast.error('Format de téléphone invalide');
      return false;
    }
    
    // Password validation (if changing password)
    if (formData.changePassword) {
      if (formData.motdepasse.length < 6) {
        toast.error('Le mot de passe doit contenir au moins 6 caractères');
        return false;
      }
      
      if (formData.motdepasse !== formData.confirmMotdepasse) {
        toast.error('Les mots de passe ne correspondent pas');
        return false;
      }
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
      // Update user metadata (first name, last name, phone)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: formData.prenom,
          last_name: formData.nom,
          phone: formData.telephone
        }
      });
      
      if (metadataError) throw metadataError;
      
      // Update email if changed
      if (formData.email !== userData.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        
        if (emailError) throw emailError;
        toast.info('Un email de confirmation a été envoyé à votre nouvelle adresse');
      }
      
      // Update password if requested
      if (formData.changePassword && formData.motdepasse) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.motdepasse
        });
        
        if (passwordError) throw passwordError;
        toast.success('Mot de passe mis à jour avec succès');
      }
      
      toast.success('Profil mis à jour avec succès');
      await refreshUser();
      onClose();
    } catch (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className={`${styles.modalOverlay} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Modifier le profil</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="prenom">Prénom</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Votre prénom"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Votre nom"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="+33 6 12 34 56 78"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="changePassword"
                checked={formData.changePassword}
                onChange={handleChange}
              />
              Changer le mot de passe
            </label>
          </div>
          
          {formData.changePassword && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="motdepasse">Nouveau mot de passe</label>
                <div className={styles.passwordInput}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="motdepasse"
                    name="motdepasse"
                    value={formData.motdepasse}
                    onChange={handleChange}
                    placeholder="Minimum 6 caractères"
                    required={formData.changePassword}
                  />
                  <button 
                    type="button" 
                    className={styles.togglePassword}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="confirmMotdepasse">Confirmer le mot de passe</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmMotdepasse"
                  name="confirmMotdepasse"
                  value={formData.confirmMotdepasse}
                  onChange={handleChange}
                  placeholder="Confirmer le mot de passe"
                  required={formData.changePassword}
                />
              </div>
            </>
          )}
          
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

export default ProfileModal;
