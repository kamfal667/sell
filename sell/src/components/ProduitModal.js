import React, { useState, useEffect, useContext } from 'react';
import styles from './ProduitModal.module.css';
import { ThemeContext } from '../context/ThemeContext';
import { getImageUrl } from '../utils/supabaseClient';

const ProduitModal = ({ isOpen, onClose, onSave, produit, categories }) => {
  const { theme } = useContext(ThemeContext);
  const [values, setValues] = useState({
    nom: '',
    description: '',
    prix: 0,
    prix_achat: 0,
    stock: 0,
    stock_min: 0,
    image_url: '',
    categorie_id: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Initialize form with product data if editing
  useEffect(() => {
    if (produit) {
      setValues({
        nom: produit.nom || '',
        description: produit.description || '',
        prix: produit.prix || 0,
        prix_achat: produit.prix_achat || 0,
        stock: produit.stock || 0,
        stock_min: produit.stock_min || 0,
        image_url: produit.image_url || '',
        categorie_id: produit.categorie_id || ''
      });
      
      if (produit.image_url) {
        // Utiliser getImageUrl pour générer l'URL d'aperçu
        try {
          const previewUrl = produit.image_url.includes('http') 
            ? produit.image_url  // Si c'est déjà une URL complète
            : getImageUrl('images-produits', produit.image_url);  // Sinon, générer l'URL
          console.log('URL de prévisualisation générée:', previewUrl);
          setImagePreview(previewUrl);
        } catch (error) {
          console.error('Erreur lors de la génération de l\'URL de prévisualisation:', error);
          setImagePreview('');
        }
      }
    } else {
      setValues({
        nom: '',
        description: '',
        prix: 0,
        prix_achat: 0,
        stock: 0,
        stock_min: 0,
        image_url: '',
        categorie_id: categories.length > 0 ? categories[0].id : ''
      });
      setImagePreview('');
    }
  }, [produit, categories]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Pour les champs numériques, convertir les chaînes vides en 0
    const processedValue = type === 'number' && value === '' ? 0 : value;
    
    setValues({ ...values, [name]: processedValue });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      setErrors({ ...errors, image: 'Le fichier doit être une image' });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'L\'image ne doit pas dépasser 5MB' });
      return;
    }

    setImageFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Clear error
    if (errors.image) {
      setErrors({ ...errors, image: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!values.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    
    if (values.prix < 0) {
      newErrors.prix = 'Le prix doit être positif ou nul';
    }
    
    if (values.prix_achat < 0) {
      newErrors.prix_achat = 'Le prix d\'achat doit être positif ou nul';
    }
    
    if (values.stock < 0) {
      newErrors.stock = 'Le stock doit être positif ou nul';
    }
    
    if (values.stock_min < 0) {
      newErrors.stock_min = 'Le stock minimum doit être positif ou nul';
    }
    
    if (!values.categorie_id && categories.length > 0) {
      newErrors.categorie_id = 'Veuillez sélectionner une catégorie';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      onSave(values, imageFile);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setValues({ ...values, image_url: '' });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.modalHeader}>
          <h2>{produit ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            disabled={isSubmitting}
            type="button"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label htmlFor="nom" className={styles.formLabel}>Nom*</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={values.nom}
                  onChange={handleChange}
                  className={styles.formInput}
                  disabled={isSubmitting}
                  placeholder="Nom du produit"
                />
                {errors.nom && <p className={styles.error}>{errors.nom}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.formLabel}>Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  className={styles.formTextarea}
                  disabled={isSubmitting}
                  placeholder="Description du produit"
                  rows={4}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="prix_achat" className={styles.formLabel}>Prix d'achat</label>
                  <input
                    type="number"
                    id="prix_achat"
                    name="prix_achat"
                    value={values.prix_achat === 0 ? '' : values.prix_achat}
                    onChange={handleChange}
                    className={styles.formInput}
                    disabled={isSubmitting}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                  {errors.prix_achat && <p className={styles.error}>{errors.prix_achat}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="prix" className={styles.formLabel}>Prix de vente</label>
                  <input
                    type="number"
                    id="prix"
                    name="prix"
                    value={values.prix === 0 ? '' : values.prix}
                    onChange={handleChange}
                    className={styles.formInput}
                    disabled={isSubmitting}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                  {errors.prix && <p className={styles.error}>{errors.prix}</p>}
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="categorie_id" className={styles.formLabel}>Catégorie</label>
                <select
                  id="categorie_id"
                  name="categorie_id"
                  value={values.categorie_id}
                  onChange={handleChange}
                  className={styles.formSelect}
                  disabled={isSubmitting || categories.length === 0}
                >
                  {categories.length === 0 ? (
                    <option value="">Aucune catégorie disponible</option>
                  ) : (
                    <>
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.nom}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {errors.categorie_id && <p className={styles.error}>{errors.categorie_id}</p>}
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="stock" className={styles.formLabel}>Stock</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={values.stock === 0 ? '' : values.stock}
                    onChange={handleChange}
                    className={styles.formInput}
                    disabled={isSubmitting}
                    min="0"
                    step="1"
                    placeholder="0"
                  />
                  {errors.stock && <p className={styles.error}>{errors.stock}</p>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="stock_min" className={styles.formLabel}>Stock minimum</label>
                  <input
                    type="number"
                    id="stock_min"
                    name="stock_min"
                    value={values.stock_min === 0 ? '' : values.stock_min}
                    onChange={handleChange}
                    className={styles.formInput}
                    disabled={isSubmitting}
                    min="0"
                    step="1"
                    placeholder="0"
                  />
                  {errors.stock_min && <p className={styles.error}>{errors.stock_min}</p>}
                </div>
              </div>
            </div>
            
            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Image</label>
                <div className={styles.imageUploadContainer}>
                  {imagePreview ? (
                    <div className={styles.imagePreviewContainer}>
                      <img 
                        src={imagePreview} 
                        alt="Aperçu" 
                        className={styles.imagePreview}
                        onError={(e) => {
                          console.error('Erreur de chargement d\'image dans la modale:', imagePreview);
                          e.target.onerror = null;
                          e.target.src = '';
                        }}
                      />
                      <button 
                        type="button" 
                        className={styles.removeImageButton}
                        onClick={removeImage}
                        disabled={isSubmitting}
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <div className={styles.imageUploadPlaceholder}>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleImageChange}
                        className={styles.imageInput}
                        disabled={isSubmitting}
                        accept="image/*"
                      />
                      <label htmlFor="image" className={styles.imageUploadLabel}>
                        Choisir une image
                      </label>
                    </div>
                  )}
                </div>
                {errors.image && <p className={styles.error}>{errors.image}</p>}
              </div>
            </div>
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
              {produit ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProduitModal;
