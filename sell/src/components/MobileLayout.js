import React from 'react';
import useIsMobile from '../hooks/useIsMobile';
import Sidebar from './Sidebar';
import styles from './MobileLayout.module.css';

const MobileLayout = ({ children }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={styles.mobileContainer}>
        <div className={styles.mobileContent}>
          {children}
        </div>
      </div>
    );
  }

  // Desktop layout with sidebar
  return (
    <div className={styles.desktopContainer}>
      <Sidebar />
      <div className={styles.desktopContent}>
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;
