import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useUserBusiness } from '../context/UserBusinessContext';
import { supabase } from '../utils/supabaseClient';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import VenteModal from '../components/VenteModal';
import styles from './Ventes.module.css';

const Ventes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useContext(ThemeContext);
  const { currency } = useUserBusiness();
  const [ventes, setVentes] = useState([]);
  const [filteredVentes, setFilteredVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVente, setEditingVente] = useState(null);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('tous');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch ventes on component mount
  useEffect(() => {
    if (user) {
      fetchVentes();
      fetchClients();
      fetchProduits();
    }
  }, [user]);

  // Appliquer les filtres lorsque les ventes ou les filtres changent
  useEffect(() => {
    applyFilters();
  }, [ventes, searchTerm, clientFilter, dateFilter]);

  const fetchVentes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ventes')
        .select(`
          *,
          clients (id, prenom, nom)
        `)
        .eq('user_id', user.id)
        .order('date_vente', { ascending: false });

      if (error) {
        throw error;
      }

      setVentes(data || []);
      setFilteredVentes(data || []);
    } catch (error) {
      toast.error(`Erreur lors de la récupération des ventes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('nom', { ascending: true });

      if (error) {
        throw error;
      }

      setClients(data || []);
    } catch (error) {
      toast.error(`Erreur lors de la récupération des clients: ${error.message}`);
    }
  };

  const fetchProduits = async () => {
    try {
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('user_id', user.id)
        .order('nom', { ascending: true });

      if (error) {
        throw error;
      }

      setProduits(data || []);
    } catch (error) {
      toast.error(`Erreur lors de la récupération des produits: ${error.message}`);
    }
  };

  const handleAddVente = () => {
    setEditingVente(null);
    setModalOpen(true);
  };

  const handleEditVente = async (vente) => {
    setLoading(true);
    try {
      // Fetch vente products
      const { data: venteProduits, error } = await supabase
        .from('vente_produits')
        .select(`
          *,
          produits (id, nom, prix)
        `)
        .eq('vente_id', vente.id);

      if (error) {
        throw error;
      }

      // Set the complete vente object with products
      setEditingVente({
        ...vente,
        produits: venteProduits || []
      });
      
      setModalOpen(true);
    } catch (error) {
      toast.error(`Erreur lors de la récupération des détails: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVente = async (venteId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente?')) {
      setLoading(true);
      try {
        // Delete the vente (cascade will delete vente_produits)
        const { error } = await supabase
          .from('ventes')
          .delete()
          .eq('id', venteId)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        toast.success('Vente supprimée avec succès');
        fetchVentes();
      } catch (error) {
        toast.error(`Erreur lors de la suppression: ${error.message}`);
        setLoading(false);
      }
    }
  };

  const handleSaveVente = async (values, venteProduits) => {
    setLoading(true);
    try {
      let venteId;
      
      // Calculate total from vente_produits
      const total = venteProduits.reduce((sum, item) => {
        return sum + (item.quantite * item.prix_unitaire);
      }, 0);

      if (editingVente) {
        // Update existing vente
        const { error } = await supabase
          .from('ventes')
          .update({
            client_id: values.client_id || null,
            total: total
          })
          .eq('id', editingVente.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        venteId = editingVente.id;
        
        // Delete existing vente_produits
        const { error: deleteError } = await supabase
          .from('vente_produits')
          .delete()
          .eq('vente_id', venteId);
          
        if (deleteError) throw deleteError;
        
        toast.success('Vente mise à jour avec succès');
      } else {
        // Generate a unique vente number
        const numeroVente = `VNT-${Date.now().toString().slice(-6)}`;
        
        // Create new vente
        const { data, error } = await supabase
          .from('ventes')
          .insert({
            user_id: user.id,
            numero_vente: numeroVente,
            client_id: values.client_id || null,
            total: total
          })
          .select();

        if (error) throw error;
        
        venteId = data[0].id;
        toast.success('Vente créée avec succès');
      }
      
      // Insert vente_produits
      if (venteProduits.length > 0) {
        const venteProduitsToInsert = venteProduits.map(item => ({
          vente_id: venteId,
          produit_id: item.produit_id,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire
        }));
        
        const { error } = await supabase
          .from('vente_produits')
          .insert(venteProduitsToInsert);
          
        if (error) throw error;
        
        // Mettre à jour le stock pour chaque produit vendu
        for (const item of venteProduits) {
          // Récupérer le produit actuel pour connaître son stock
          const { data: produitData, error: produitError } = await supabase
            .from('produits')
            .select('stock')
            .eq('id', item.produit_id)
            .single();
            
          if (produitError) throw produitError;
          
          // Calculer le nouveau stock
          const nouveauStock = Math.max(0, produitData.stock - item.quantite);
          
          // Mettre à jour le stock
          const { error: updateError } = await supabase
            .from('produits')
            .update({ stock: nouveauStock })
            .eq('id', item.produit_id);
            
          if (updateError) throw updateError;
        }
      }

      setModalOpen(false);
      fetchVentes();
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingVente(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClientName = (vente) => {
    if (vente.clients) {
      return `${vente.clients.prenom} ${vente.clients.nom}`;
    }
    return 'Client non spécifié';
  };

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    let filtered = [...ventes];
    
    // Filtre par terme de recherche (numéro de vente)
    if (searchTerm) {
      filtered = filtered.filter(vente => 
        vente.numero_vente.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par client
    if (clientFilter !== 'tous') {
      filtered = filtered.filter(vente => vente.client_id === clientFilter);
    }
    
    // Filtre par date
    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(vente => {
        const venteDate = new Date(vente.date_vente);
        return venteDate >= startDate;
      });
    }
    
    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(vente => {
        const venteDate = new Date(vente.date_vente);
        return venteDate <= endDate;
      });
    }
    
    setFilteredVentes(filtered);
  };

  // Gestionnaires d'événements pour les filtres
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleClientFilterChange = (e) => {
    setClientFilter(e.target.value);
  };
  
  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setClientFilter('tous');
    setDateFilter({
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className={`${styles.ventesContainer} ${darkMode ? styles.dark : ''}`}>
      <Sidebar />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestion des Ventes</h1>
          <button 
            className={styles.addButton}
            onClick={handleAddVente}
            disabled={loading}
          >
            Ajouter une vente
          </button>
        </div>
        
        {loading && <Loader />}
        
        <div className={styles.filterSection}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Rechercher une vente..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label htmlFor="clientFilter">Client:</label>
              <select
                id="clientFilter"
                value={clientFilter}
                onChange={handleClientFilterChange}
                className={styles.filterSelect}
              >
                <option value="tous">Tous</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.prenom} {client.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label htmlFor="startDate">Du:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateFilter.startDate}
                onChange={handleDateFilterChange}
                className={styles.filterDate}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <label htmlFor="endDate">Au:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateFilter.endDate}
                onChange={handleDateFilterChange}
                className={styles.filterDate}
              />
            </div>
            
            <button
              onClick={resetFilters}
              className={styles.resetButton}
            >
              Réinitialiser
            </button>
          </div>
        </div>
        
        <div className={styles.ventesList}>
          {!loading && filteredVentes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{ventes.length === 0 ? 'Aucune vente' : 'Aucun résultat pour cette recherche'}</p>
            </div>
          ) : (
            filteredVentes.map(vente => (
              <div key={vente.id} className={styles.venteCard}>
                <div className={styles.venteHeader}>
                  <div className={styles.venteNumero}>
                    <h3>{vente.numero_vente}</h3>
                    <span className={styles.paymentMethod}>Espèces</span>
                  </div>
                  <div className={styles.venteDate}>
                    {formatDate(vente.date_vente)}
                  </div>
                </div>
                
                <div className={styles.venteInfo}>
                  <p><strong>Client:</strong> {getClientName(vente)}</p>
                  <p><strong>Total:</strong> {vente.total.toFixed(2)} {currency}</p>
                </div>
                
                <div className={styles.venteActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditVente(vente)}
                    disabled={loading}
                  >
                    Modifier
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteVente(vente.id)}
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
        <VenteModal
          onClose={closeModal}
          onSave={handleSaveVente}
          vente={editingVente}
          clients={clients}
          produits={produits}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Ventes;
