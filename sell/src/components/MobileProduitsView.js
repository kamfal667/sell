import React from 'react';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaImage } from 'react-icons/fa';
import { getImageUrl } from '../utils/supabaseClient';
import styles from './MobileProduitsView.module.css';

const MobileProduitsView = ({ 
  produits, 
  onAddProduit, 
  onEditProduit, 
  onDeleteProduit,
  searchTerm,
  setSearchTerm,
  categorieFilter,
  setCategorieFilter,
  stockFilter,
  setStockFilter,
  categories,
  onResetFilters
}) => {
  return (
    <div className={styles.mobileContainer}>
      {/* Header avec titre et bouton d'ajout */}
      <div className={styles.header}>
        <h1 className={styles.title}>Produits</h1>
        <button 
          className={styles.addButton}
          onClick={onAddProduit}
        >
          <FaPlus />
        </button>
      </div>

      {/* Barre de recherche */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Filtres */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Catégorie:</label>
            <select
              value={categorieFilter}
              onChange={(e) => setCategorieFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="toutes">Toutes</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Stock:</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="tous">Tous</option>
              <option value="en_stock">En stock</option>
              <option value="stock_faible">Stock faible</option>
              <option value="rupture">Rupture</option>
            </select>
          </div>
        </div>

        <button 
          className={styles.resetButton}
          onClick={onResetFilters}
        >
          Réinitialiser
        </button>
      </div>

      {/* Liste des produits */}
      <div className={styles.produitsContainer}>
        {produits.length === 0 ? (
          <div className={styles.emptyState}>
            <FaImage className={styles.emptyIcon} />
            <p className={styles.emptyText}>Aucun produit trouvé</p>
          </div>
        ) : (
          produits.map((produit) => (
            <div key={produit.id} className={styles.produitCard}>
              <div className={styles.produitImage}>
                {produit.image_url ? (
                  <img 
                    src={getImageUrl(produit.image_url)} 
                    alt={produit.nom}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.noImage}>
                    <FaImage />
                  </div>
                )}
              </div>

              <div className={styles.produitInfo}>
                <h3 className={styles.produitNom}>{produit.nom}</h3>
                <p className={styles.produitDescription}>{produit.description}</p>
                
                <div className={styles.produitDetails}>
                  <div className={styles.priceContainer}>
                    <span className={styles.price}>{produit.prix} FCFA</span>
                  </div>
                  
                  <div className={styles.stockContainer}>
                    <span className={`${styles.stock} ${
                      produit.stock <= produit.stock_min ? styles.stockLow : 
                      produit.stock === 0 ? styles.stockOut : styles.stockOk
                    }`}>
                      Stock: {produit.stock}
                    </span>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button 
                    className={styles.editButton}
                    onClick={() => onEditProduit(produit)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => onDeleteProduit(produit.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileProduitsView;
