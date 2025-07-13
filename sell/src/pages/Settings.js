import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useUserBusiness } from '../context/UserBusinessContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import ProfileModal from '../components/ProfileModal';
import BusinessConfigModal from '../components/BusinessConfigModal';
import styles from './Settings.module.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { businessConfig, loading: businessLoading } = useUserBusiness();
  const { theme, toggleTheme } = useTheme();
  
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [businessModalOpen, setBusinessModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Set user data when user is loaded
  useEffect(() => {
    if (user) {
      setUserData({
        email: user.email,
        prenom: user.user_metadata?.first_name || '',
        nom: user.user_metadata?.last_name || '',
        telephone: user.user_metadata?.phone || '',
      });
    }
  }, [user]);

  const handleOpenProfileModal = () => {
    setProfileModalOpen(true);
  };

  const handleOpenBusinessModal = () => {
    setBusinessModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
  };

  const handleCloseBusinessModal = () => {
    setBusinessModalOpen(false);
  };

  if (authLoading || businessLoading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={`${styles.settingsContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <Sidebar />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Paramètres</h1>
          <div className={styles.themeToggle}>
            <button 
              className={styles.themeButton}
              onClick={toggleTheme}
              aria-label={`Activer le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
            >
              {theme === 'light' ? '🌙' : '☀️'} Mode {theme === 'light' ? 'sombre' : 'clair'}
            </button>
          </div>
        </div>
        
        <div className={styles.settingsCards}>
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2>Profil Utilisateur</h2>
              <button 
                className={styles.editButton}
                onClick={handleOpenProfileModal}
              >
                Modifier
              </button>
            </div>
            
            <div className={styles.cardContent}>
              {userData ? (
                <div className={styles.profileInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Prénom:</span>
                    <span className={styles.infoValue}>{userData.prenom || 'Non défini'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Nom:</span>
                    <span className={styles.infoValue}>{userData.nom || 'Non défini'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{userData.email}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Téléphone:</span>
                    <span className={styles.infoValue}>{userData.telephone || 'Non défini'}</span>
                  </div>
                </div>
              ) : (
                <p className={styles.noData}>Chargement des données utilisateur...</p>
              )}
            </div>
          </div>
          
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2>Configuration Boutique</h2>
              <button 
                className={styles.editButton}
                onClick={handleOpenBusinessModal}
              >
                Modifier
              </button>
            </div>
            
            <div className={styles.cardContent}>
              {businessConfig ? (
                <div className={styles.businessInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Nom de la boutique:</span>
                    <span className={styles.infoValue}>{businessConfig.nom_boutique}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Type de business:</span>
                    <span className={styles.infoValue}>{businessConfig.type_business}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Téléphone boutique:</span>
                    <span className={styles.infoValue}>{businessConfig.telephone_boutique}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Devise:</span>
                    <span className={styles.infoValue}>{businessConfig.devise}</span>
                  </div>
                </div>
              ) : (
                <p className={styles.noData}>Aucune configuration de boutique trouvée</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {profileModalOpen && (
        <ProfileModal 
          onClose={handleCloseProfileModal}
          userData={userData}
        />
      )}
      
      {businessModalOpen && (
        <BusinessConfigModal 
          onClose={handleCloseBusinessModal}
          businessConfig={businessConfig}
        />
      )}
    </div>
  );
};

export default Settings;
