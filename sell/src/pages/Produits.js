import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { supabase, getImageUrl } from '../utils/supabaseClient';
import useIsMobile from '../hooks/useIsMobile';
import MobileLayout from '../components/MobileLayout';
import MobileProduitsView from '../components/MobileProduitsView';
import Loader from '../components/Loader';
import ProduitModal from '../components/ProduitModal';
import styles from './Produits.module.css';

const Produits = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const [produits, setProduits] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduit, setEditingProduit] = useState(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('toutes');
  const [stockFilter, setStockFilter] = useState('tous');

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch products and categories on component mount
  useEffect(() => {
    if (user) {
      fetchProduits();
      fetchCategories();
    }
  }, [user]);
  
  // Appliquer les filtres lorsque les produits ou les filtres changent
  useEffect(() => {
    applyFilters();
  }, [produits, searchTerm, categorieFilter, stockFilter]);

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('produits')
        .select('*, categories(id, nom, couleur)')
        .eq('user_id', user.id)
        .order('date_creation', { ascending: true });

      if (error) {
        throw error;
      }

      // Vérifier si les images existent dans le bucket
      if (data && data.length > 0) {
        console.log('Produits récupérés:', data.length);
        
        // Vérifier le premier produit avec image comme exemple
        const produitAvecImage = data.find(p => p.image_url);
        if (produitAvecImage) {
          console.log('Exemple de produit avec image:', {
            id: produitAvecImage.id,
            nom: produitAvecImage.nom,
            image_url: produitAvecImage.image_url
          });
          
          // Tenter de récupérer les métadonnées de l'image
          try {
            const path = produitAvecImage.image_url;
            const cleanPath = path.startsWith('/') ? path.substring(1) : path;
            
            if (!path.startsWith('http')) {
              const { data: fileData, error: fileError } = await supabase.storage
                .from('produits')
                .list(cleanPath.split('/').slice(0, -1).join('/') || '');
              
              console.log('Fichiers dans le dossier:', fileData);
              console.log('Erreur de liste:', fileError);
            }
          } catch (fileCheckError) {
            console.error('Erreur lors de la vérification du fichier:', fileCheckError);
          }
        }
      }

      setProduits(data || []);
      setFilteredProduits(data || []);
    } catch (error) {
      toast.error(`Erreur lors de la récupération des produits: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('nom', { ascending: true });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      toast.error(`Erreur lors de la récupération des catégories: ${error.message}`);
    }
  };

  const handleAddProduit = () => {
    setEditingProduit(null);
    setModalOpen(true);
  };

  const handleEditProduit = (produit) => {
    setEditingProduit(produit);
    setModalOpen(true);
  };

  const handleDeleteProduit = async (produitId, imageUrl) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      setLoading(true);
      try {
        // Delete the product from the database
        const { error } = await supabase
          .from('produits')
          .delete()
          .eq('id', produitId)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        // If there's an image, delete it from storage
        if (imageUrl) {
          try {
            // Extraire le chemin relatif de l'URL complète
            const storageUrl = supabase.storage.from('produits').getPublicUrl('').data.publicUrl;
            const relativePath = imageUrl.replace(storageUrl, '').split('?')[0];
            
            // Nettoyer le chemin
            const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
            
            // Delete the image from storage if it exists
            if (imageUrl && !imageUrl.startsWith('http')) {
              // Ensure the path is correctly formatted
              const path = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
              
              // Essayer de supprimer l'image du nouveau bucket 'images-produits'
              const { error: deleteError } = await supabase.storage
                .from('images-produits')
                .remove([path]);
              
              if (deleteError) {
                console.error('Error deleting image from images-produits:', deleteError);
                
                // Si l'image n'est pas trouvée dans le nouveau bucket, essayer l'ancien bucket 'produits'
                const { error: oldBucketDeleteError } = await supabase.storage
                  .from('produits')
                  .remove([path]);
                  
                if (oldBucketDeleteError) {
                  console.error('Error deleting image from produits:', oldBucketDeleteError);
                  // Continue with product deletion even if image deletion fails
                } else {
                  console.log('Image deleted successfully from old bucket:', path);
                }
              } else {
                console.log('Image deleted successfully from new bucket:', path);
              }
            }
          } catch (error) {
            console.error('Erreur lors de l\'extraction du chemin de l\'image:', error);
            // Continue even if path extraction fails
          }
        }

        toast.success('Produit supprimé avec succès');
        fetchProduits();
      } catch (error) {
        toast.error(`Erreur lors de la suppression: ${error.message}`);
        setLoading(false);
      }
    }
  };

  const handleSaveProduit = async (values, imageFile) => {
    setLoading(true);
    try {
      let imageUrl = values.image_url || null;

      // Upload new image if provided
      if (imageFile) {
        try {
          // Créer un nom de fichier unique pour éviter les collisions
          const fileName = `${user.id}/${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
          
          // Upload du fichier dans le nouveau bucket 'images-produits'
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images-produits')
            .upload(fileName, imageFile, {
              cacheControl: '3600',
              upsert: true // Permettre l'écrasement si le fichier existe déjà
            });

          if (uploadError) {
            throw uploadError;
          }
          
          // Stocker uniquement le chemin relatif du fichier
          imageUrl = fileName;
          
          console.log('Chemin de l\'image stocké:', imageUrl);
        } catch (error) {
          console.error('Erreur lors de l\'upload de l\'image:', error);
          toast.error(`Erreur lors de l'upload de l'image: ${error.message}`);
          // Continuer sans image
        }
      }

      if (editingProduit) {
        // Update existing product
        const { error } = await supabase
          .from('produits')
          .update({
            nom: values.nom,
            description: values.description,
            prix: values.prix,
            stock: values.stock,
            stock_min: values.stock_min,
            image_url: imageUrl,
            categorie_id: values.categorie_id
          })
          .eq('id', editingProduit.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Produit mis à jour avec succès');
      } else {
        // Create new product
        const { error } = await supabase
          .from('produits')
          .insert({
            user_id: user.id,
            nom: values.nom,
            description: values.description,
            prix: values.prix,
            stock: values.stock,
            stock_min: values.stock_min,
            image_url: imageUrl,
            categorie_id: values.categorie_id
          });

        if (error) throw error;
        toast.success('Produit créé avec succès');
      }

      setModalOpen(false);
      fetchProduits();
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduit(null);
  };

  // Check if stock is low (stock < stock_min)
  const isStockLow = (produit) => {
    return produit.stock < produit.stock_min;
  };
  
  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    console.log('Applying filters:', { searchTerm, categorieFilter, stockFilter });
    console.log('Total products before filtering:', produits.length);
    
    let filtered = [...produits];
    
    // Filtre par terme de recherche (nom du produit)
    if (searchTerm) {
      filtered = filtered.filter(produit => 
        produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (produit.description && produit.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      console.log('After search term filter:', filtered.length);
    }
    
    // Filtre par catégorie
    if (categorieFilter !== 'toutes') {
      console.log('Filtering by category ID:', categorieFilter);
      
      // Vérifier les IDs de catégorie disponibles
      const categoryIds = [...new Set(produits.map(p => p.categorie_id))];
      console.log('Available category IDs in products:', categoryIds);
      
      filtered = filtered.filter(produit => {
        // Comparaison directe des UUID (strings)
        const match = produit.categorie_id === categorieFilter;
        console.log(`Product ${produit.nom}: category_id=${produit.categorie_id}, match=${match}`);
        return match;
      });
      console.log('After category filter:', filtered.length);
    }
    
    // Filtre par niveau de stock
    if (stockFilter === 'bas') {
      filtered = filtered.filter(produit => isStockLow(produit));
      console.log('After low stock filter:', filtered.length);
    } else if (stockFilter === 'normal') {
      filtered = filtered.filter(produit => !isStockLow(produit));
      console.log('After normal stock filter:', filtered.length);
    }
    
    console.log('Final filtered products:', filtered.length);
    setFilteredProduits(filtered);
  };

  // Gestionnaires d'événements pour les filtres
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCategorieFilterChange = (e) => {
    setCategorieFilter(e.target.value);
  };
  
  const handleStockFilterChange = (e) => {
    setStockFilter(e.target.value);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setCategorieFilter('toutes');
    setStockFilter('tous');
  };

  if (isMobile) {
    return (
      <MobileLayout>
        {loading && <Loader />}
        <MobileProduitsView
          produits={filteredProduits}
          onAddProduit={handleAddProduit}
          onEditProduit={handleEditProduit}
          onDeleteProduit={handleDeleteProduit}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categorieFilter={categorieFilter}
          setCategorieFilter={setCategorieFilter}
          stockFilter={stockFilter}
          setStockFilter={setStockFilter}
          categories={categories}
          onResetFilters={resetFilters}
        />
        {modalOpen && (
          <ProduitModal
            isOpen={modalOpen}
            onClose={closeModal}
            onSave={handleSaveProduit}
            produit={editingProduit}
            categories={categories}
          />
        )}
      </MobileLayout>
    );
  }

  return (
    <div className={`${styles.produitsContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <MobileLayout>
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Produits</h1>
          <button 
            className={styles.addButton}
            onClick={handleAddProduit}
            disabled={loading}
          >
            Ajouter un produit
          </button>
        </div>
        
        {loading && <Loader />}
        
        <div className={styles.filterSection}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label htmlFor="categorieFilter">Catégorie:</label>
              <select
                id="categorieFilter"
                value={categorieFilter}
                onChange={handleCategorieFilterChange}
                className={styles.filterSelect}
              >
                <option value="toutes">Toutes</option>
                {categories.map(categorie => (
                  <option key={categorie.id} value={String(categorie.id)}>
                    {categorie.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label htmlFor="stockFilter">Niveau de stock:</label>
              <select
                id="stockFilter"
                value={stockFilter}
                onChange={handleStockFilterChange}
                className={styles.filterSelect}
              >
                <option value="tous">Tous</option>
                <option value="bas">Stock bas</option>
                <option value="normal">Stock normal</option>
              </select>
            </div>
            
            <button
              onClick={resetFilters}
              className={styles.resetButton}
            >
              Réinitialiser
            </button>
          </div>
        </div>
        
        <div className={styles.produitsList}>
          {!loading && filteredProduits.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{produits.length === 0 ? 'Aucun produit' : 'Aucun résultat pour cette recherche'}</p>
            </div>
          ) : (
            filteredProduits.map(produit => (
              <div 
                key={produit.id} 
                className={`${styles.produitCard} ${isStockLow(produit) ? styles.lowStock : ''}`}
              >
                <div className={styles.produitImageContainer}>
                  {produit.image_url ? (
                    <>
                      {console.log('Affichage image produit:', {
                        id: produit.id,
                        nom: produit.nom,
                        image_url_original: produit.image_url,
                        image_url_generated: getImageUrl('images-produits', produit.image_url)
                      })}
                      <img 
                        src={(() => {
                          try {
                            const url = getImageUrl('images-produits', produit.image_url);
                            console.log('URL générée pour', produit.nom, ':', url);
                            return url;
                          } catch (error) {
                            console.error('Erreur lors de la génération d\'URL:', error);
                            return '';
                          }
                        })()} 
                        alt={produit.nom} 
                        className={styles.produitImage}
                        onError={(e) => {
                          console.error('Erreur de chargement d\'image:', {
                            url: e.target.src,
                            produit: produit.nom,
                            image_path: produit.image_url
                          });
                          e.target.onerror = null;
                          e.target.src = '';
                          
                          // Essayer une URL alternative directe
                          const cleanPath = produit.image_url.startsWith('/') 
                            ? produit.image_url.substring(1) 
                            : produit.image_url;
                            
                          if (!produit.image_url.includes('http')) {
                            const directUrl = `https://sznvhjllybyiubxgdhvv.supabase.co/storage/v1/object/public/images-produits/${cleanPath}?t=${Date.now()}`;
                            console.log('Tentative avec URL directe:', directUrl);
                            e.target.src = directUrl;
                            e.target.onerror = (e2) => {
                              e2.target.onerror = null;
                              e2.target.src = '';
                              // Remplacer l'image par un texte d'erreur de façon sécurisée
                              const parent = e2.target.parentElement;
                              if (parent) {
                                // Créer un nouvel élément pour afficher le message d'erreur
                                const errorDiv = document.createElement('div');
                                errorDiv.className = styles.noImage;
                                errorDiv.textContent = 'Erreur de chargement';
                                
                                // Vider le parent et ajouter le message d'erreur
                                while (parent.firstChild) {
                                  parent.removeChild(parent.firstChild);
                                }
                                parent.appendChild(errorDiv);
                              }
                            };
                          } else {
                            // Remplacer l'image par un texte d'erreur de façon sécurisée
                            const parent = e.target.parentElement;
                            if (parent) {
                              // Créer un nouvel élément pour afficher le message d'erreur
                              const errorDiv = document.createElement('div');
                              errorDiv.className = styles.noImage;
                              errorDiv.textContent = 'Erreur de chargement';
                              
                              // Vider le parent et ajouter le message d'erreur
                              while (parent.firstChild) {
                                parent.removeChild(parent.firstChild);
                              }
                              parent.appendChild(errorDiv);
                            }
                          }
                        }}
                    />
                    </>
                  ) : (
                    <div className={styles.noImage}>
                      Pas d'image
                    </div>
                  )}
                </div>
                <div className={styles.produitInfo}>
                  <h3 className={styles.produitName}>{produit.nom}</h3>
                  {produit.description && (
                    <p className={styles.produitDescription}>{produit.description}</p>
                  )}
                  <div className={styles.produitDetails}>
                    <div className={styles.priceInfo}>
                      <p className={styles.produitPrice}>{produit.prix} FCFA</p>
                      {produit.prix_achat > 0 && (
                        <p className={styles.produitPriceAchat}>Achat: {produit.prix_achat} FCFA</p>
                      )}
                      {produit.prix_achat > 0 && (
                        <p className={styles.produitMarge}>
                          Marge: {((produit.prix - produit.prix_achat) / produit.prix * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                    <div className={styles.stockInfo}>
                      <p className={`${styles.produitStock} ${isStockLow(produit) ? styles.stockAlert : ''}`}>
                        Stock: {produit.stock} {isStockLow(produit) && <span className={styles.alertIcon}>⚠️</span>}
                      </p>
                      <p className={styles.stockMin}>Min: {produit.stock_min}</p>
                    </div>
                    {produit.categories && (
                      <div 
                        className={styles.produitCategory}
                        style={{ backgroundColor: produit.categories.couleur }}
                      >
                        {produit.categories.nom}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.produitActions}>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEditProduit(produit)}
                    disabled={loading}
                  >
                    Modifier
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteProduit(produit.id, produit.image_url)}
                    disabled={loading}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {modalOpen && (
        <ProduitModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSave={handleSaveProduit}
          produit={editingProduit}
          categories={categories}
        />
      )}
      </MobileLayout>
    </div>
  );
};

export default Produits;
