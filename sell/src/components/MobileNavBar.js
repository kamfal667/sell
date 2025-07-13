import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useUserBusiness } from '../context/UserBusinessContext';
import { useTheme } from '../context/ThemeContext';
import styles from './MobileNavBar.module.css';

const MobileNavBar = () => {
  const { isEcommerce, isPhysical, isHybrid } = useUserBusiness();
  const { theme } = useTheme();
  const [showMore, setShowMore] = useState(false);

  return (
    <div className={`${styles.mobileNavBar} ${theme === 'dark' ? styles.dark : ''} ${showMore ? styles.expanded : ''}`}>
      <nav className={styles.nav}>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>📊</span>
          <span className={styles.label}>Dashboard</span>
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
            <span className={styles.label}>Commandes</span>
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
            <span className={styles.label}>Ventes</span>
          </NavLink>
        )}
        
        <NavLink 
          to="/stats" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>📈</span>
          <span className={styles.label}>Statistiques</span>
        </NavLink>
        
        <NavLink 
          to="/categories" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>🏷️</span>
          <span className={styles.label}>Catégories</span>
        </NavLink>
        
        <NavLink 
          to="/produits" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>📦</span>
          <span className={styles.label}>Produits</span>
        </NavLink>
        
        <NavLink 
          to="/inventaire" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>📋</span>
          <span className={styles.label}>Inventaire</span>
        </NavLink>
        
        <NavLink 
          to="/clients" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>👥</span>
          <span className={styles.label}>Clients</span>
        </NavLink>
        
        <NavLink 
          to="/parametres" 
          className={({ isActive }) => 
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>⚙️</span>
          <span className={styles.label}>Paramètres</span>
        </NavLink>
        
        <button 
          className={styles.toggleButton}
          onClick={() => setShowMore(!showMore)}
        >
          <span className={styles.icon}>{showMore ? '▲' : '▼'}</span>
          <span className={styles.label}>{showMore ? 'Moins' : 'Plus'}</span>
        </button>
      </nav>
    </div>
  );
};

export default MobileNavBar;
