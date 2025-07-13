import { supabase } from './supabaseClient';

/**
 * Fonction pour migrer les images d'un bucket à un autre et mettre à jour les références en base de données
 * @param {string} userId - ID de l'utilisateur
 * @param {string} sourceBucket - Nom du bucket source
 * @param {string} targetBucket - Nom du bucket cible
 * @returns {Promise<{success: boolean, message: string}>} - Résultat de la migration
 */
export const migrateImages = async (userId, sourceBucket = 'produits', targetBucket = 'images-produits') => {
  try {
    console.log(`Début de la migration des images de ${sourceBucket} vers ${targetBucket} pour l'utilisateur ${userId}`);
    
    // 1. Récupérer tous les produits de l'utilisateur avec des images
    const { data: produits, error: produitsError } = await supabase
      .from('produits')
      .select('id, nom, image_url')
      .eq('user_id', userId)
      .not('image_url', 'is', null);
      
    if (produitsError) {
      throw new Error(`Erreur lors de la récupération des produits: ${produitsError.message}`);
    }
    
    console.log(`${produits.length} produits trouvés avec des images`);
    
    // 2. Pour chaque produit, migrer l'image
    const results = [];
    
    for (const produit of produits) {
      try {
        if (!produit.image_url || produit.image_url.startsWith('http')) {
          console.log(`Produit ${produit.id} (${produit.nom}): image_url est une URL complète ou null, pas besoin de migration`);
          continue;
        }
        
        // Nettoyer le chemin
        const path = produit.image_url.startsWith('/') ? produit.image_url.substring(1) : produit.image_url;
        console.log(`Traitement de l'image: ${path} pour le produit ${produit.nom}`);
        
        // 3. Télécharger l'image depuis le bucket source
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(sourceBucket)
          .download(path);
          
        if (downloadError) {
          console.error(`Erreur lors du téléchargement de l'image ${path}: ${downloadError.message}`);
          results.push({
            produitId: produit.id,
            nom: produit.nom,
            success: false,
            error: downloadError.message
          });
          continue;
        }
        
        // 4. Uploader l'image dans le bucket cible
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(targetBucket)
          .upload(path, fileData, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error(`Erreur lors de l'upload de l'image ${path}: ${uploadError.message}`);
          results.push({
            produitId: produit.id,
            nom: produit.nom,
            success: false,
            error: uploadError.message
          });
          continue;
        }
        
        console.log(`Image ${path} migrée avec succès`);
        
        // 5. Mettre à jour la référence dans la base de données (optionnel, car le chemin reste le même)
        results.push({
          produitId: produit.id,
          nom: produit.nom,
          success: true,
          path
        });
        
      } catch (error) {
        console.error(`Erreur lors de la migration de l'image pour le produit ${produit.id}: ${error.message}`);
        results.push({
          produitId: produit.id,
          nom: produit.nom,
          success: false,
          error: error.message
        });
      }
    }
    
    // 6. Résumé de la migration
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    return {
      success: true,
      message: `Migration terminée. ${successCount} images migrées avec succès, ${failCount} échecs.`,
      results
    };
    
  } catch (error) {
    console.error(`Erreur lors de la migration: ${error.message}`);
    return {
      success: false,
      message: `Erreur lors de la migration: ${error.message}`
    };
  }
};

/**
 * Fonction pour créer un bucket s'il n'existe pas déjà
 * @param {string} bucketName - Nom du bucket à créer
 * @param {boolean} isPublic - Si le bucket doit être public
 * @returns {Promise<{success: boolean, message: string}>} - Résultat de la création
 */
export const createBucketIfNotExists = async (bucketName, isPublic = true) => {
  try {
    // Vérifier si le bucket existe déjà
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Erreur lors de la récupération des buckets: ${bucketsError.message}`);
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Le bucket ${bucketName} existe déjà`);
      
      // Mettre à jour les permissions du bucket
      if (isPublic) {
        const { error: policyError } = await supabase.storage.from(bucketName).createSignedUrl('test.txt', 60);
        
        if (policyError) {
          console.log(`Mise à jour des permissions du bucket ${bucketName} pour le rendre public`);
          // Essayer de mettre à jour les permissions
          // Note: Cette API n'est pas directement exposée dans le client JS, mais nous pouvons simuler
          console.log(`Veuillez vous assurer que le bucket ${bucketName} est configuré comme public dans la console Supabase`);
        }
      }
      
      return {
        success: true,
        message: `Le bucket ${bucketName} existe déjà`
      };
    }
    
    // Créer le bucket
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic
    });
    
    if (error) {
      throw new Error(`Erreur lors de la création du bucket ${bucketName}: ${error.message}`);
    }
    
    console.log(`Bucket ${bucketName} créé avec succès`);
    
    return {
      success: true,
      message: `Bucket ${bucketName} créé avec succès`
    };
    
  } catch (error) {
    console.error(`Erreur lors de la création du bucket ${bucketName}: ${error.message}`);
    return {
      success: false,
      message: `Erreur lors de la création du bucket ${bucketName}: ${error.message}`
    };
  }
};
