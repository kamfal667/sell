import { createClient } from '@supabase/supabase-js';

// Define Supabase URL and key
let supabaseUrl = 'https://sznvhjllybyiubxgdhvv.supabase.co';
let supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bnZoamxseWJ5aXVieGdkaHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2Njc3MTksImV4cCI6MjA2NzI0MzcxOX0.5S_TkB-fGn92HGbm9JxAz9yZ4o4gnkd42JhnucY9EGU';

// Try to use environment variables if available
try {
  if (process.env.REACT_APP_SUPABASE_URL) {
    supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  }
  
  if (process.env.REACT_APP_SUPABASE_ANON_KEY) {
    supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  }
} catch (error) {
  console.warn('Error accessing environment variables:', error.message);
}

// Create Supabase client
let supabase;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client created successfully');
} catch (error) {
  console.error('Failed to create Supabase client:', error.message);
  // Create a dummy client that won't throw errors but won't work either
  supabase = {
    auth: {
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized properly' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized properly' } }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized properly' } })
        }),
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized properly' } })
      }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized properly' } })
    })
  };
}

// Fonction utilitaire pour obtenir l'URL publique d'une image
const getImageUrl = (bucket, path) => {
  if (!path) return null;
  
  // Si c'est déjà une URL complète, la retourner directement
  if (path.startsWith('http')) {
    // Ajouter un timestamp pour éviter la mise en cache
    return `${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }
  
  // S'assurer que le chemin est correctement formaté
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  try {
    // Récupérer l'URL publique directement depuis Supabase
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(cleanPath);
    
    // Ajouter un timestamp pour éviter la mise en cache du navigateur
    const publicUrl = data?.publicUrl || null;
    if (publicUrl) {
      console.log(`URL générée: ${publicUrl}`);
      return `${publicUrl}?t=${Date.now()}`;
    }
    
    // Si nous n'avons pas pu obtenir une URL publique, essayons de construire une URL directe
    const directUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
    console.log(`URL directe générée: ${directUrl}`);
    return `${directUrl}?t=${Date.now()}`;
  } catch (error) {
    console.error(`Erreur lors de la génération d'URL pour: bucket=${bucket}, path=${cleanPath}`, error);
    // Essayer une URL directe comme solution de secours
    const fallbackUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}?t=${Date.now()}`;
    console.log(`URL de secours générée: ${fallbackUrl}`);
    return fallbackUrl;
  }
};

export { supabase, getImageUrl };
