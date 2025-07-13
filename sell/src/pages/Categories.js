import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { supabase } from '../utils/supabaseClient';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import CategoryModal from '../components/CategoryModal';
import styles from './Categories.module.css';

const Categories = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = React.useContext(ThemeContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch categories on component mount
  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('date_creation', { ascending: true });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      toast.error(`Erreur lors de la récupération des catégories: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie?')) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryId)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        toast.success('Catégorie supprimée avec succès');
        fetchCategories();
      } catch (error) {
        toast.error(`Erreur lors de la suppression: ${error.message}`);
        setLoading(false);
      }
    }
  };

  const handleSaveCategory = async (values) => {
    setLoading(true);
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            nom: values.nom,
            couleur: values.couleur
          })
          .eq('id', editingCategory.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Catégorie mise à jour avec succès');
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            nom: values.nom,
            couleur: values.couleur
          });

        if (error) throw error;
        toast.success('Catégorie créée avec succès');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className={`${styles.categoriesContainer} ${darkMode ? styles.dark : ''}`}>
      <Sidebar />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Catégories</h1>
          <button 
            className={styles.addButton}
            onClick={handleAddCategory}
            disabled={loading}
          >
            Ajouter une catégorie
          </button>
        </div>
        
        {loading && <Loader />}
        
        <div className={styles.categoriesList}>
          {!loading && categories.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Aucune catégorie</p>
            </div>
          ) : (
            categories.map(category => (
              <div 
                key={category.id} 
                className={styles.categoryCard}
                style={{ borderLeft: `4px solid ${category.couleur}` }}
              >
                <div className={styles.categoryInfo}>
                  <div 
                    className={styles.colorSwatch} 
                    style={{ backgroundColor: category.couleur }}
                  />
                  <span className={styles.categoryName}>{category.nom}</span>
                </div>
                <div className={styles.categoryActions}>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEditCategory(category)}
                    disabled={loading}
                  >
                    Modifier
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteCategory(category.id)}
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
        <CategoryModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSave={handleSaveCategory}
          category={editingCategory}
        />
      )}
    </div>
  );
};

export default Categories;
