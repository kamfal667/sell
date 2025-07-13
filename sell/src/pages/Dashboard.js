import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserBusiness } from '../context/UserBusinessContext';
import { ThemeContext } from '../context/ThemeContext';
import styles from './Dashboard.module.css';
import commonStyles from '../styles/common.module.css';
import Sidebar from '../components/Sidebar';
import DashboardCards from '../components/DashboardCards';
import Logout from '../components/Logout';
import Loader from '../components/Loader';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { businessConfig, loading } = useUserBusiness();
  const { darkMode } = React.useContext(ThemeContext);

  // Redirect if user is not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Redirect to onboarding if no business config exists
  React.useEffect(() => {
    if (user && !loading) {
      if (!businessConfig) {
        console.log('No business config found, redirecting to onboarding');
        navigate('/onboarding');
      }
    }
  }, [loading, businessConfig, user, navigate]);

  return (
    <div className={`${styles.dashboardContainer} ${darkMode ? styles.dark : ''}`}>
      <Sidebar />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <Logout />
        </div>
        
        {loading ? (
          <Loader />
        ) : (
          <>
            {businessConfig && (
              <div className={styles.businessInfo}>
                <h2>{businessConfig.nom_boutique}</h2>
                <p className={styles.businessType}>{businessConfig.type_business}</p>
              </div>
            )}
            
            <div className={styles.cardsSection}>
              <DashboardCards />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
