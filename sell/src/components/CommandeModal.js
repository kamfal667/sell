import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import Loader from './Loader';
import styles from './CommandeModal.module.css';
import { ThemeContext } from '../context/ThemeContext';
import { useUserBusiness } from '../context/UserBusinessContext';

const CommandeModal = ({ onClose, onSave, commande, clients, produits, loading }) => {
  const { darkMode } = useContext(ThemeContext);
  const { currency } = useUserBusiness();
  const [formValues, setFormValues] = useState({
    client_id: '',
    statut: 'en attente'
  });
  
  const [selectedProduits, setSelectedProduits] = useState([]);
  const [total, setTotal] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  // Initialize form values when editing an existing commande
  useEffect(() => {
    if (commande) {
      setFormValues({
        client_id: commande.client_id || '',
        statut: commande.statut || 'en attente'
      });
      
      // Initialize selected products if editing
      if (commande.produits && commande.produits.length > 0) {
        const initialProduits = commande.produits.map(item => ({
          produit_id: item.produit_id,
          nom: item.produits?.nom || 'Produit inconnu',
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          prix_achat: item.prix_achat || item.produits?.prix_achat || 0, // Utiliser le prix d'achat enregistré ou celui du produit
          sous_total: item.quantite * item.prix_unitaire
        }));
        
        setSelectedProduits(initialProduits);
      }
    }
  }, [commande]);

  // Calculate total whenever selected products change
  useEffect(() => {
    const newTotal = selectedProduits.reduce((sum, item) => {
      return sum + (item.quantite * item.prix_unitaire);
    }, 0);
    
    setTotal(newTotal);
  }, [selectedProduits]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleAddProduit = () => {
    setSelectedProduits([
      ...selectedProduits,
      {
        produit_id: '',
        nom: '',
        quantite: 1,
        prix_unitaire: 0,
        prix_achat: 0,
        sous_total: 0
      }
    ]);
  };

  const handleRemoveProduit = (index) => {
    const newSelectedProduits = [...selectedProduits];
    newSelectedProduits.splice(index, 1);
    setSelectedProduits(newSelectedProduits);
  };

  const handleProduitChange = (index, field, value) => {
    const newSelectedProduits = [...selectedProduits];
    
    if (field === 'produit_id') {
      // Find the selected product
      const selectedProduit = produits.find(p => p.id === value);
      if (selectedProduit) {
        newSelectedProduits[index] = {
          ...newSelectedProduits[index],
          produit_id: value,
          nom: selectedProduit.nom,
          prix_unitaire: selectedProduit.prix,
          prix_achat: selectedProduit.prix_achat || 0, // Stocker le prix d'achat
          sous_total: newSelectedProduits[index].quantite * selectedProduit.prix
        };
      }
    } else if (field === 'quantite') {
      const quantite = parseInt(value) || 0;
      newSelectedProduits[index] = {
        ...newSelectedProduits[index],
        quantite,
        sous_total: quantite * newSelectedProduits[index].prix_unitaire
      };
    }
    
    setSelectedProduits(newSelectedProduits);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formValues.client_id) {
      errors.client_id = 'Veuillez sélectionner un client';
    }
    
    if (selectedProduits.length === 0) {
      errors.produits = 'Veuillez ajouter au moins un produit';
    } else {
      // Check each product
      const produitsErrors = [];
      
      selectedProduits.forEach((item, index) => {
        const itemErrors = {};
        
        if (!item.produit_id) {
          itemErrors.produit_id = 'Produit requis';
        }
        
        if (item.quantite <= 0) {
          itemErrors.quantite = 'Quantité invalide';
        }
        
        if (Object.keys(itemErrors).length > 0) {
          produitsErrors[index] = itemErrors;
        }
      });
      
      if (produitsErrors.length > 0) {
        errors.produitsDetails = produitsErrors;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Format products for saving
      const commandeProduits = selectedProduits.map(item => ({
        produit_id: item.produit_id,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        prix_achat: item.prix_achat // Ajouter le prix d'achat pour le calcul des bénéfices
      }));
      
      onSave(formValues, commandeProduits);
    } else {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.modalHeader}>
          <h2>{commande ? 'Modifier la commande' : 'Nouvelle commande'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        {loading ? (
          <div className={styles.loaderContainer}>
            <Loader />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="client_id">Client *</label>
              <select
                id="client_id"
                name="client_id"
                value={formValues.client_id}
                onChange={handleChange}
                className={formErrors.client_id ? styles.inputError : ''}
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.prenom} {client.nom}
                  </option>
                ))}
              </select>
              {formErrors.client_id && (
                <div className={styles.errorMessage}>{formErrors.client_id}</div>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="statut">Statut</label>
              <select
                id="statut"
                name="statut"
                value={formValues.statut}
                onChange={handleChange}
              >
                <option value="en attente">En attente</option>
                <option value="confirmée">Confirmée</option>
                <option value="livrée">Livrée</option>
                <option value="annulée">Annulée</option>
              </select>
            </div>
            
            <div className={styles.produitsSection}>
              <div className={styles.produitsSectionHeader}>
                <h3>Produits</h3>
                <button 
                  type="button" 
                  className={styles.addProduitButton}
                  onClick={handleAddProduit}
                >
                  + Ajouter un produit
                </button>
              </div>
              
              {formErrors.produits && (
                <div className={styles.errorMessage}>{formErrors.produits}</div>
              )}
              
              {selectedProduits.length === 0 ? (
                <div className={styles.noProduits}>
                  Aucun produit sélectionné
                </div>
              ) : (
                <div className={styles.produitsList}>
                  {selectedProduits.map((item, index) => (
                    <div key={index} className={styles.produitItem}>
                      <div className={styles.produitDetails}>
                        <div className={styles.produitSelect}>
                          <select
                            value={item.produit_id}
                            onChange={(e) => handleProduitChange(index, 'produit_id', e.target.value)}
                            className={formErrors.produitsDetails?.[index]?.produit_id ? styles.inputError : ''}
                          >
                            <option value="">Sélectionner un produit</option>
                            {produits.map(produit => (
                              <option key={produit.id} value={produit.id}>
                                {produit.nom} - {produit.prix.toFixed(2)} {currency}
                              </option>
                            ))}
                          </select>
                          {formErrors.produitsDetails?.[index]?.produit_id && (
                            <div className={styles.errorMessage}>
                              {formErrors.produitsDetails[index].produit_id}
                            </div>
                          )}
                        </div>
                        
                        <div className={styles.produitQuantity}>
                          <label>Quantité</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantite}
                            onChange={(e) => handleProduitChange(index, 'quantite', e.target.value)}
                            className={formErrors.produitsDetails?.[index]?.quantite ? styles.inputError : ''}
                          />
                          {formErrors.produitsDetails?.[index]?.quantite && (
                            <div className={styles.errorMessage}>
                              {formErrors.produitsDetails[index].quantite}
                            </div>
                          )}
                        </div>
                        
                        <div className={styles.produitPrice}>
                          <span>Prix: {item.prix_unitaire.toFixed(2)} {currency}</span>
                          <span>Sous-total: {item.sous_total.toFixed(2)} {currency}</span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        className={styles.removeProduitButton}
                        onClick={() => handleRemoveProduit(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className={styles.totalSection}>
              <h3>Total: {total.toFixed(2)} {currency}</h3>
            </div>
            
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className={styles.saveButton}>
                {commande ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CommandeModal;
