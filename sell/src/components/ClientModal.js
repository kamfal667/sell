import React, { useState, useEffect, useContext } from 'react';
import styles from './ClientModal.module.css';
import Loader from './Loader';
import { ThemeContext } from '../context/ThemeContext';

const ClientModal = ({ onClose, onSave, client, loading }) => {
  const { darkMode } = useContext(ThemeContext);
  const [values, setValues] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: ''
  });
  const [errors, setErrors] = useState({});

  // Populate form if editing an existing client
  useEffect(() => {
    if (client) {
      setValues({
        prenom: client.prenom || '',
        nom: client.nom || '',
        email: client.email || '',
        telephone: client.telephone || '',
        adresse: client.adresse || ''
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!values.prenom.trim()) {
      newErrors.prenom = 'Le prénom est obligatoire';
    }
    
    if (!values.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    
    if (!values.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est obligatoire';
    }
    
    // Validate email format if provided
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(values);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.modalHeader}>
          <h2>{client ? 'Modifier le client' : 'Ajouter un client'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="prenom">Prénom *</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={values.prenom}
              onChange={handleChange}
              className={errors.prenom ? styles.inputError : ''}
              disabled={loading}
            />
            {errors.prenom && <div className={styles.errorText}>{errors.prenom}</div>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="nom">Nom *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={values.nom}
              onChange={handleChange}
              className={errors.nom ? styles.inputError : ''}
              disabled={loading}
            />
            {errors.nom && <div className={styles.errorText}>{errors.nom}</div>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              className={errors.email ? styles.inputError : ''}
              disabled={loading}
            />
            {errors.email && <div className={styles.errorText}>{errors.email}</div>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="telephone">Téléphone *</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={values.telephone}
              onChange={handleChange}
              className={errors.telephone ? styles.inputError : ''}
              disabled={loading}
            />
            {errors.telephone && <div className={styles.errorText}>{errors.telephone}</div>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="adresse">Adresse</label>
            <textarea
              id="adresse"
              name="adresse"
              value={values.adresse}
              onChange={handleChange}
              disabled={loading}
              rows="3"
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
              {loading ? <Loader small /> : (client ? 'Mettre à jour' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
