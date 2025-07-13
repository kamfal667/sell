import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useUserBusiness } from '../context/UserBusinessContext';
import { supabase } from '../utils/supabaseClient';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import CommandeModal from '../components/CommandeModal';
import styles from './Commandes.module.css';

const Commandes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useContext(ThemeContext);
  const { currency } = useUserBusiness();
  const [commandes, setCommandes] = useState([]);
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCommande, setEditingCommande] = useState(null);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
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

  // Fetch commandes on component mount
  useEffect(() => {
    if (user) {
      fetchCommandes();
      fetchClients();
      fetchProduits();
    }
  }, [user]);

  // Appliquer les filtres lorsque les commandes ou les filtres changent
  useEffect(() => {
    applyFilters();
  }, [commandes, searchTerm, statusFilter, clientFilter, dateFilter]);

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select(`
          *,
          clients (id, prenom, nom)
        `)
        .eq('user_id', user.id)
        .order('date_creation', { ascending: false });

      if (error) {
        throw error;
      }

      setCommandes(data || []);
      setFilteredCommandes(data || []);
    } catch (error) {
      toast.error(`Erreur lors de la récupération des commandes: ${error.message}`);
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

  const handleAddCommande = () => {
    setEditingCommande(null);
    setModalOpen(true);
  };

  const handleEditCommande = async (commande) => {
    setLoading(true);
    try {
      // Fetch commande products
      const { data: commandeProduits, error } = await supabase
        .from('commande_produits')
        .select(`
          *,
          produits (id, nom, prix)
        `)
        .eq('commande_id', commande.id);

      if (error) {
        throw error;
      }

      // Set the complete commande object with products
      setEditingCommande({
        ...commande,
        produits: commandeProduits || []
      });
      
      setModalOpen(true);
    } catch (error) {
      toast.error(`Erreur lors de la récupération des détails: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCommande = async (commandeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande?')) {
      setLoading(true);
      try {
        // Delete the commande (cascade will delete commande_produits)
        const { error } = await supabase
          .from('commandes')
          .delete()
          .eq('id', commandeId)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        toast.success('Commande supprimée avec succès');
        fetchCommandes();
      } catch (error) {
        toast.error(`Erreur lors de la suppression: ${error.message}`);
        setLoading(false);
      }
    }
  };

  const handleSaveCommande = async (values, commandeProduits) => {
    setLoading(true);
    try {
      let commandeId;
      
      // Calculate total from commande_produits
      const total = commandeProduits.reduce((sum, item) => {
        return sum + (item.quantite * item.prix_unitaire);
      }, 0);

      if (editingCommande) {
        // Update existing commande
        const { error } = await supabase
          .from('commandes')
          .update({
            client_id: values.client_id,
            statut: values.statut,
            total: total
          })
          .eq('id', editingCommande.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        commandeId = editingCommande.id;
        
        // Delete existing commande_produits
        const { error: deleteError } = await supabase
          .from('commande_produits')
          .delete()
          .eq('commande_id', commandeId);
          
        if (deleteError) throw deleteError;
        
        toast.success('Commande mise à jour avec succès');
      } else {
        // Generate a unique commande number
        const numeroCommande = `CMD-${Date.now().toString().slice(-6)}`;
        
        // Create new commande
        const { data, error } = await supabase
          .from('commandes')
          .insert({
            user_id: user.id,
            numero_commande: numeroCommande,
            client_id: values.client_id,
            statut: values.statut,
            total: total
          })
          .select();

        if (error) throw error;
        
        commandeId = data[0].id;
        toast.success('Commande créée avec succès');
      }
      
      // Insert commande_produits
      if (commandeProduits.length > 0) {
        const commandeProduitsToInsert = commandeProduits.map(item => ({
          commande_id: commandeId,
          produit_id: item.produit_id,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          prix_achat: item.prix_achat || 0 // Réactivé maintenant que la colonne existe
        }));
        
        const { error } = await supabase
          .from('commande_produits')
          .insert(commandeProduitsToInsert);
          
        if (error) throw error;
        
        // Mettre à jour le stock pour chaque produit commandé
        // Ne décrémenter le stock que si la commande est confirmée ou livrée
        console.log('Statut de la commande:', values.statut);
        if (values.statut === 'confirmée' || values.statut === 'livrée') {
          console.log('Commande confirmée ou livrée, mise à jour du stock...');
          for (const item of commandeProduits) {
            console.log('Traitement du produit:', item.produit_id, 'Quantité:', item.quantite);
            // Récupérer le produit actuel pour connaître son stock
            const { data: produitData, error: produitError } = await supabase
              .from('produits')
              .select('stock, nom')
              .eq('id', item.produit_id)
              .single();
              
            if (produitError) {
              console.error('Erreur lors de la récupération du produit:', produitError);
              throw produitError;
            }
            
            console.log('Stock actuel du produit', produitData.nom, ':', produitData.stock);
            
            // Calculer le nouveau stock
            const nouveauStock = Math.max(0, produitData.stock - item.quantite);
            console.log('Nouveau stock calculé:', nouveauStock);
            
            // Mettre à jour le stock
            const { data: updateData, error: updateError } = await supabase
              .from('produits')
              .update({ stock: nouveauStock })
              .eq('id', item.produit_id)
              .select();
              
            if (updateError) {
              console.error('Erreur lors de la mise à jour du stock:', updateError);
              throw updateError;
            }
            
            console.log('Stock mis à jour avec succès:', updateData);
          }
        } else {
          console.log('Commande en attente ou annulée, pas de mise à jour du stock');
        }
      }

      setModalOpen(false);
      fetchCommandes();
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      setLoading(false);
    }
  };

  const handleChangeStatus = async (commandeId, newStatus) => {
    setLoading(true);
    try {
      // Récupérer la commande actuelle pour connaître son statut précédent
      const { data: commande, error: commandeError } = await supabase
        .from('commandes')
        .select('statut')
        .eq('id', commandeId)
        .eq('user_id', user.id)
        .single();
      
      if (commandeError) throw commandeError;
      
      const ancienStatut = commande.statut;
      
      // Mettre à jour le statut de la commande
      const { error } = await supabase
        .from('commandes')
        .update({ statut: newStatus })
        .eq('id', commandeId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Gérer la mise à jour du stock en fonction du changement de statut
      // Si la commande passe de 'en attente' à 'confirmée' ou 'livrée', décrémenter le stock
      // Si la commande passe de 'confirmée' ou 'livrée' à 'annulée', réincrémenter le stock
      if (
        (ancienStatut === 'en attente' && (newStatus === 'confirmée' || newStatus === 'livrée')) ||
        ((ancienStatut === 'confirmée' || ancienStatut === 'livrée') && newStatus === 'annulée')
      ) {
        // Récupérer les produits de la commande
        const { data: commandeProduits, error: produitsError } = await supabase
          .from('commande_produits')
          .select(`
            produit_id,
            quantite,
            produits (stock)
          `)
          .eq('commande_id', commandeId);
        
        if (produitsError) throw produitsError;
        
        // Mettre à jour le stock pour chaque produit
        for (const item of commandeProduits) {
          let nouveauStock;
          
          // Si on passe à 'confirmée' ou 'livrée', décrémenter le stock
          if (ancienStatut === 'en attente' && (newStatus === 'confirmée' || newStatus === 'livrée')) {
            nouveauStock = Math.max(0, item.produits.stock - item.quantite);
          }
          // Si on passe à 'annulée', réincrémenter le stock
          else if ((ancienStatut === 'confirmée' || ancienStatut === 'livrée') && newStatus === 'annulée') {
            nouveauStock = item.produits.stock + item.quantite;
          }
          
          // Mettre à jour le stock
          const { error: updateError } = await supabase
            .from('produits')
            .update({ stock: nouveauStock })
            .eq('id', item.produit_id);
            
          if (updateError) throw updateError;
        }
      }
      
      toast.success(`Statut mis à jour: ${newStatus}`);
      fetchCommandes();
    } catch (error) {
      toast.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCommande(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmée':
        return styles.statusConfirmed;
      case 'livrée':
        return styles.statusDelivered;
      case 'annulée':
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getClientName = (commande) => {
    if (commande.clients) {
      return `${commande.clients.prenom} ${commande.clients.nom}`;
    }
    return 'Client inconnu';
  };

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    let filtered = [...commandes];
    
    // Filtre par terme de recherche (numéro de commande)
    if (searchTerm) {
      filtered = filtered.filter(commande => 
        commande.numero_commande.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par statut
    if (statusFilter !== 'tous') {
      filtered = filtered.filter(commande => commande.statut === statusFilter);
    }
    
    // Filtre par client
    if (clientFilter !== 'tous') {
      filtered = filtered.filter(commande => commande.client_id === clientFilter);
    }
    
    // Filtre par date
    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(commande => {
        const commandeDate = new Date(commande.date_creation);
        return commandeDate >= startDate;
      });
    }
    
    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(commande => {
        const commandeDate = new Date(commande.date_creation);
        return commandeDate <= endDate;
      });
    }
    
    setFilteredCommandes(filtered);
  };

  // Gestionnaires d'événements pour les filtres
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
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
    setStatusFilter('tous');
    setClientFilter('tous');
    setDateFilter({
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className={`${styles.commandesContainer} ${darkMode ? styles.dark : ''}`}>
      <Sidebar />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestion des Commandes</h1>
          <button 
            className={styles.addButton}
            onClick={handleAddCommande}
            disabled={loading}
          >
            Ajouter une commande
          </button>
        </div>
        
        {loading && <Loader />}
        
        <div className={styles.filterSection}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label htmlFor="statusFilter">Statut:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className={styles.filterSelect}
              >
                <option value="tous">Tous</option>
                <option value="en attente">En attente</option>
                <option value="confirmée">Confirmée</option>
                <option value="livrée">Livrée</option>
                <option value="annulée">Annulée</option>
              </select>
            </div>
            
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
        
        <div className={styles.commandesList}>
          {!loading && filteredCommandes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{commandes.length === 0 ? 'Aucune commande' : 'Aucun résultat pour cette recherche'}</p>
            </div>
          ) : (
            filteredCommandes.map(commande => (
              <div key={commande.id} className={styles.commandeCard}>
                <div className={styles.commandeHeader}>
                  <div className={styles.commandeNumero}>
                    <h3>{commande.numero_commande}</h3>
                    <span className={`${styles.statusBadge} ${getStatusClass(commande.statut)}`}>
                      {commande.statut}
                    </span>
                  </div>
                  <div className={styles.commandeDate}>
                    {formatDate(commande.date_creation)}
                  </div>
                </div>
                
                <div className={styles.commandeInfo}>
                  <p><strong>Client:</strong> {getClientName(commande)}</p>
                  <p><strong>Total:</strong> {commande.total.toFixed(2)} {currency}</p>
                </div>
                
                <div className={styles.commandeActions}>
                  <div className={styles.statusActions}>
                    <select
                      value={commande.statut}
                      onChange={(e) => handleChangeStatus(commande.id, e.target.value)}
                      className={styles.statusSelect}
                      disabled={loading}
                    >
                      <option value="en attente">En attente</option>
                      <option value="confirmée">Confirmée</option>
                      <option value="livrée">Livrée</option>
                      <option value="annulée">Annulée</option>
                    </select>
                  </div>
                  <div className={styles.buttonActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditCommande(commande)}
                      disabled={loading}
                    >
                      Modifier
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteCommande(commande.id)}
                      disabled={loading}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalOpen && (
        <CommandeModal
          onClose={closeModal}
          onSave={handleSaveCommande}
          commande={editingCommande}
          clients={clients}
          produits={produits}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Commandes;
