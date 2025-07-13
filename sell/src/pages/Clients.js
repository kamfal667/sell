import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { supabase } from '../utils/supabaseClient';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import ClientModal from '../components/ClientModal';
import styles from './Clients.module.css';

const Clients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = React.useContext(ThemeContext);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch clients on component mount
  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  // Filter clients when search term or clients list changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = clients.filter(client => 
        client.nom.toLowerCase().includes(lowercasedTerm) || 
        client.prenom.toLowerCase().includes(lowercasedTerm) ||
        (client.email && client.email.toLowerCase().includes(lowercasedTerm))
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('date_creation', { ascending: true });

      if (error) {
        throw error;
      }

      setClients(data || []);
      setFilteredClients(data || []);
    } catch (error) {
      toast.error(`Erreur lors de la récupération des clients: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
      setLoading(true);
      try {
        // Delete the client from the database
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', clientId)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        toast.success('Client supprimé avec succès');
        fetchClients();
      } catch (error) {
        toast.error(`Erreur lors de la suppression: ${error.message}`);
        setLoading(false);
      }
    }
  };

  const handleSaveClient = async (values) => {
    setLoading(true);
    try {
      if (editingClient) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            prenom: values.prenom,
            nom: values.nom,
            email: values.email,
            telephone: values.telephone,
            adresse: values.adresse
          })
          .eq('id', editingClient.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Client mis à jour avec succès');
      } else {
        // Create new client
        const { error } = await supabase
          .from('clients')
          .insert({
            user_id: user.id,
            prenom: values.prenom,
            nom: values.nom,
            email: values.email,
            telephone: values.telephone,
            adresse: values.adresse
          });

        if (error) throw error;
        toast.success('Client créé avec succès');
      }

      setModalOpen(false);
      fetchClients();
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClient(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={`${styles.clientsContainer} ${darkMode ? styles.dark : ''}`}>
      <Sidebar />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestion des Clients</h1>
          <button 
            className={styles.addButton}
            onClick={handleAddClient}
            disabled={loading}
          >
            Ajouter un client
          </button>
        </div>
        
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>

        {loading && <Loader />}
        
        <div className={styles.clientsList}>
          {!loading && filteredClients.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{searchTerm ? 'Aucun résultat pour cette recherche' : 'Aucun client'}</p>
            </div>
          ) : (
            filteredClients.map(client => (
              <div key={client.id} className={styles.clientCard}>
                <div className={styles.clientInfo}>
                  <h3>{client.prenom} {client.nom}</h3>
                  <div className={styles.clientDetails}>
                    {client.email && <p><strong>Email:</strong> {client.email}</p>}
                    <p><strong>Téléphone:</strong> {client.telephone}</p>
                    {client.adresse && <p><strong>Adresse:</strong> {client.adresse}</p>}
                  </div>
                </div>
                <div className={styles.clientActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditClient(client)}
                    disabled={loading}
                  >
                    Modifier
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteClient(client.id)}
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
        <ClientModal
          onClose={closeModal}
          onSave={handleSaveClient}
          client={editingClient}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Clients;
