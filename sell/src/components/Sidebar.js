import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUserBusiness } from '../context/UserBusinessContext';
import { useTheme } from '../context/ThemeContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { isEcommerce, isPhysical, isHybrid } = useUserBusiness();
  const { theme } = useTheme();

  return (
    <div className={`${styles.sidebar} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.logo}>
        <img src="/assets/logo.png" alt="SellXY Stocks Logo" className={styles.logoImage} />
      </div>
      <nav className={styles.nav}>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>📊</span>
          Dashboard
        </NavLink>
        
        {/* Conditional links based on business type */}
        {(isEcommerce || isHybrid) && (
          <NavLink 
            to="/commandes" 
            className={({ isActive }) => 
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <span className={styles.icon}>📦</span>
            Commandes
          </NavLink>
        )}
        
        {(isPhysical || isHybrid) && (
          <NavLink 
            to="/ventes" 
            className={({ isActive }) => 
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <span className={styles.icon}>💰</span>
            Ventes
          </NavLink>
        )}
        
        {/* Stats link - always present */}
        <NavLink 
          to="/stats" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>📈</span>
          Statistiques
        </NavLink>
        
        {/* Always present links */}
        <NavLink 
          to="/categories" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>🏷️</span>
          Catégories
        </NavLink>
        
        <NavLink 
          to="/produits" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>📦</span>
          Produits
        </NavLink>
        
        <NavLink 
          to="/inventaire" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>📋</span>
          Inventaire
        </NavLink>
        
        <NavLink 
          to="/clients" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>👥</span>
          Clients
        </NavLink>
        
        <NavLink 
          to="/parametres" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>⚙️</span>
          Paramètres
        </NavLink>
        
        {/* L'onglet Migration Images a été retiré car la migration est terminée */}
      </nav>
    </div>
  );
};

export default Sidebar;
