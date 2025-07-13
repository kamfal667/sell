import React, { useState, useEffect, useContext } from 'react';
import styles from './CategoryModal.module.css';
import { ThemeContext } from '../context/ThemeContext';

const CategoryModal = ({ isOpen, onClose, onSave, category }) => {
  const { darkMode } = useContext(ThemeContext);
  const [values, setValues] = useState({
    nom: '',
    couleur: '#FF6B35'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with category data if editing
  useEffect(() => {
    if (category) {
      setValues({
        nom: category.nom || '',
        couleur: category.couleur || '#FF6B35'
      });
    } else {
      setValues({
        nom: '',
        couleur: '#FF6B35'
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!values.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    
    if (!values.couleur) {
      newErrors.couleur = 'La couleur est obligatoire';
    } else if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(values.couleur)) {
      newErrors.couleur = 'Format de couleur HEX invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      onSave(values);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.modalHeader}>
          <h2>{category ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nom" className={styles.formLabel}>Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={values.nom}
              onChange={handleChange}
              className={styles.formInput}
              disabled={isSubmitting}
              placeholder="Nom de la catégorie"
            />
            {errors.nom && <p className={styles.error}>{errors.nom}</p>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="couleur" className={styles.formLabel}>Couleur</label>
            <div className={styles.colorPickerContainer}>
              <input
                type="color"
                id="couleur"
                name="couleur"
                value={values.couleur}
                onChange={handleChange}
                className={styles.colorPicker}
                disabled={isSubmitting}
              />
              <input
                type="text"
                name="couleur"
                value={values.couleur}
                onChange={handleChange}
                className={styles.formInput}
                disabled={isSubmitting}
                placeholder="#RRGGBB"
              />
            </div>
            {errors.couleur && <p className={styles.error}>{errors.couleur}</p>}
          </div>
          
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting}
            >
              {category ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
