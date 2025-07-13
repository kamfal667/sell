import React from 'react';
import { useTheme } from '../context/ThemeContext';
import styles from './DashboardCard.module.css';

const DashboardCard = ({ title, value, icon, color }) => {
  const { theme } = useTheme();
  return (
    <div className={`${styles.card} ${theme === 'dark' ? styles.dark : ''}`} style={{ borderTop: `4px solid ${color || '#FF6B35'}` }}>
      <div className={styles.cardIcon} style={{ backgroundColor: `${color || '#FF6B35'}20` }}>
        <span>{icon}</span>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardValue}>{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
