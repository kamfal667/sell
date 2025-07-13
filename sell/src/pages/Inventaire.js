import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useUserBusiness } from '../context/UserBusinessContext';
import { supabase, getImageUrl } from '../utils/supabaseClient';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import styles from './Inventaire.module.css';
import commonStyles from '../styles/common.module.css';

const Inventaire = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { businessConfig, currency } = useUserBusiness();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalCategories: 0,
    totalValue: 0,
    totalStock: 0,
    recentProducts: []
  });

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch inventory stats when component mounts
  useEffect(() => {
    if (user && businessConfig) {
      fetchInventoryStats();
    }
  }, [user, businessConfig]);

  const fetchInventoryStats = async () => {
    setLoading(true);
    try {
      // Fetch all products to calculate various stats
      const { data: products, error: productsError } = await supabase
        .from('produits')
        .select('id, nom, prix, stock, stock_min, date_creation, image_url')
        .eq('user_id', user.id);
      
      if (productsError) throw productsError;
      
      // Calculate stats from products data
      const productsCount = products ? products.length : 0;
      
      // Calculate products with low stock (stock < stock_min) in JavaScript
      const lowStockProducts = products ? products.filter(product => 
        product.stock < product.stock_min
      ) : [];
      
      // Calculate total inventory value
      const totalValue = products ? products.reduce((sum, product) => {
        return sum + (parseFloat(product.prix) * product.stock);
      }, 0) : 0;
      
      // Calculate total stock (sum of all product stocks)
      const totalStock = products ? products.reduce((sum, product) => {
        return sum + (parseInt(product.stock) || 0);
      }, 0) : 0;
      
      // Get 5 most recent products
      const recentProducts = products ? 
        [...products].sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation)).slice(0, 5) : [];
      
      // Fetch total number of categories
      const { count: categoriesCount, error: categoriesError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (categoriesError) throw categoriesError;
      
      setStats({
        totalProducts: productsCount || 0,
        lowStockProducts: lowStockProducts?.length || 0,
        totalCategories: categoriesCount || 0,
        totalValue: totalValue || 0,
        totalStock: totalStock || 0,
        recentProducts: recentProducts || []
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques d\'inventaire:', error);
      toast.error('Erreur lors du chargement des statistiques d\'inventaire');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className={`${commonStyles.pageContainer} ${theme === 'dark' ? commonStyles.dark : ''}`}>
      <Sidebar />
      
      <div className={`${commonStyles.mainContent} ${styles.mainContent}`}>
        <h1 className={styles.title}>Inventaire</h1>
        
        {loading ? (
          <div className={styles.loaderContainer}>
            <Loader />
          </div>
        ) : (
          <>
            <div className={styles.statsCards}>
              <div className={styles.statsCard}>
                <h3>Total Produits</h3>
                <p className={styles.statValue}>{stats.totalProducts}</p>
              </div>
              
              <div className={styles.statsCard}>
                <h3>Produits en Stock Faible</h3>
                <p className={`${styles.statValue} ${stats.lowStockProducts > 0 ? styles.warning : ''}`}>
                  {stats.lowStockProducts}
                </p>
              </div>
              
              <div className={styles.statsCard}>
                <h3>Catégories</h3>
                <p className={styles.statValue}>{stats.totalCategories}</p>
              </div>
              
              <div className={styles.statsCard}>
                <h3>Valeur Totale</h3>
                <p className={styles.statValue}>{stats.totalValue.toFixed(2)} {currency}</p>
              </div>
              
              <div className={styles.statsCard}>
                <h3>Stock Total</h3>
                <p className={styles.statValue}>{stats.totalStock}</p>
              </div>
            </div>
            
            <div className={styles.recentProductsSection}>
              <h2>Produits Récemment Ajoutés</h2>
              
              {stats.recentProducts.length > 0 ? (
                <div className={styles.recentProductsList}>
                  {stats.recentProducts.map(product => (
                    <div key={product.id} className={styles.productCard}>
                      <div className={styles.productImageContainer}>
                        {product.image_url ? (
                          <img 
                            src={getImageUrl('images-produits', product.image_url)} 
                            alt={product.nom} 
                            className={styles.productImage}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.png';
                            }}
                          />
                        ) : (
                          <div className={styles.noImage}>Pas d'image</div>
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <h4>{product.nom}</h4>
                        <p>Prix: {parseFloat(product.prix).toFixed(2)} {currency}</p>
                        <p>Stock: {product.stock}</p>
                        <p>Ajouté le: {formatDate(product.date_creation)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noProducts}>Aucun produit récent</p>
              )}
            </div>
            
            <div className={styles.actionsSection}>
              <button 
                className={styles.actionButton}
                onClick={() => navigate('/produits')}
              >
                Gérer les Produits
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => navigate('/categories')}
              >
                Gérer les Catégories
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inventaire;
