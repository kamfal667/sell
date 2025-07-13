import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { supabase } from '../utils/supabaseClient';
import { migrateImages, createBucketIfNotExists } from '../utils/migrationUtils';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import styles from './ImageMigration.module.css'; // Utiliser des styles spécifiques

const ImageMigration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [migrationResults, setMigrationResults] = useState(null);
  const [bucketStatus, setBucketStatus] = useState(null);

  // Redirect if user is not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleCheckBucket = async () => {
    setLoading(true);
    try {
      // Vérifier si le bucket existe déjà avec un cache-buster
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        throw new Error(`Erreur lors de la récupération des buckets: ${bucketsError.message}`);
      }
      
      console.log('Buckets disponibles:', buckets);
      
      // Vérifier avec insensibilité à la casse
      const bucketExists = buckets.some(bucket => 
        bucket.name.toLowerCase() === 'images-produits'.toLowerCase()
      );
      
      // Trouver le nom exact du bucket s'il existe
      const existingBucket = buckets.find(bucket => 
        bucket.name.toLowerCase() === 'images-produits'.toLowerCase()
      );
      
      if (bucketExists) {
        const exactName = existingBucket ? existingBucket.name : 'images-produits';
        setBucketStatus({
          success: true,
          message: `Le bucket "${exactName}" existe déjà.`,
          buckets: buckets
        });
        toast.success(`Le bucket "${exactName}" existe déjà.`);
      } else {
        setBucketStatus({
          success: false,
          message: `Le bucket images-produits n'existe pas. Veuillez le créer manuellement via la console Supabase.`,
          buckets: buckets
        });
        toast.warning(`Le bucket images-produits n'existe pas. Veuillez le créer manuellement via la console Supabase.`);
      }
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateImages = async () => {
    setLoading(true);
    try {
      // On sait que le bucket existe (créé manuellement), donc on passe directement à la migration
      // sans appeler createBucketIfNotExists qui ne fonctionne pas à cause des permissions
      
      // Migrer les images
      const result = await migrateImages(user.id);
      setMigrationResults(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFixImagePaths = async () => {
    setLoading(true);
    try {
      // Récupérer tous les produits avec des images
      const { data: produits, error: produitsError } = await supabase
        .from('produits')
        .select('id, nom, image_url')
        .eq('user_id', user.id)
        .not('image_url', 'is', null);
        
      if (produitsError) throw produitsError;
      
      let updatedCount = 0;
      let results = [];
      
      // Pour chaque produit, mettre à jour le chemin pour utiliser le nouveau bucket
      for (const produit of produits) {
        try {
          if (produit.image_url && !produit.image_url.startsWith('http')) {
            // Nettoyer le chemin (enlever le / initial s'il existe)
            const cleanPath = produit.image_url.startsWith('/') ? produit.image_url.substring(1) : produit.image_url;
            
            // Mise à jour du chemin pour utiliser le nouveau bucket
            const { error: updateError } = await supabase
              .from('produits')
              .update({ image_url: cleanPath })
              .eq('id', produit.id);
              
            if (updateError) {
              console.error(`Erreur lors de la mise à jour du produit ${produit.id}: ${updateError.message}`);
              results.push({
                nom: produit.nom,
                success: false,
                error: updateError.message
              });
            } else {
              updatedCount++;
              results.push({
                nom: produit.nom,
                success: true,
                path: cleanPath
              });
            }
          }
        } catch (error) {
          console.error(`Erreur lors du traitement du produit ${produit.id}: ${error.message}`);
          results.push({
            nom: produit.nom,
            success: false,
            error: error.message
          });
        }
      }
      
      setMigrationResults({
        success: true,
        message: `${updatedCount} chemins d'images corrigés. Les images utiliseront maintenant le bucket "images-produits".`,
        results
      });
      
      toast.success(`${updatedCount} chemins d'images corrigés`);
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.dark : ''}`}>
      <Sidebar />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Migration des Images</h1>
          <p className={styles.subtitle}>
            Cet outil vous permet de résoudre les problèmes d'affichage des images produits.
          </p>
        </div>
        
        {loading && <Loader />}
        
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Configuration du Bucket</h2>
          <div className={styles.sectionContent}>
            <p>
              Cette action va vérifier si le bucket "images-produits" existe déjà.
            </p>
            <p>
              <strong>Note importante:</strong> Pour créer le bucket manuellement, connectez-vous à votre console Supabase, accédez à la section "Storage", cliquez sur "New Bucket", nommez-le "images-produits" et cochez l'option "Public bucket".
            </p>
            <button 
              className={styles.actionButton}
              onClick={handleCheckBucket}
              disabled={loading}
            >
              Vérifier Bucket
            </button>
            
            {bucketStatus && (
              <div className={bucketStatus.success ? styles.successMessage : styles.errorMessage}>
                {bucketStatus.message}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Migration des Images</h2>
          <div className={styles.sectionContent}>
            <p>
              Cette action va migrer toutes les images du bucket "produits" vers le nouveau bucket "images-produits".
            </p>
            <button 
              className={styles.actionButton}
              onClick={handleMigrateImages}
              disabled={loading}
            >
              Migrer les Images
            </button>
            
            {migrationResults && (
              <div className={migrationResults.success ? styles.successMessage : styles.errorMessage}>
                <p>{migrationResults.message}</p>
                {migrationResults.results && migrationResults.results.length > 0 && (
                  <div className={styles.resultsContainer}>
                    <h3>Détails:</h3>
                    <ul>
                      {migrationResults.results.map((result, index) => (
                        <li key={index} className={result.success ? styles.successItem : styles.errorItem}>
                          {result.nom}: {result.success ? `Migré avec succès (${result.path})` : `Échec: ${result.error}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Correction des Chemins d'Images</h2>
          <div className={styles.sectionContent}>
            <p>
              Cette action va corriger les chemins d'images dans la base de données (enlever les "/" initiaux).
            </p>
            <button 
              className={styles.actionButton}
              onClick={handleFixImagePaths}
              disabled={loading}
            >
              Corriger les Chemins
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageMigration;
