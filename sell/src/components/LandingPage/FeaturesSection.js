import React from 'react';
import { motion } from 'framer-motion';
import styles from './FeaturesSection.module.css';

/**
 * Composant de la section Fonctionnalités
 * Présente les 4 principales fonctionnalités de SellXY Stocks
 */
const FeaturesSection = () => {
  // Données des fonctionnalités
  const features = [
    {
      id: 'stock',
      icon: '📦',
      title: 'Stock en temps réel',
      description: 'Suivez votre inventaire en temps réel, recevez des alertes de stock bas et gérez vos approvisionnements efficacement.',
      color: '#FF6B35'
    },
    {
      id: 'sales',
      icon: '🛒',
      title: 'Gestion des ventes et commandes',
      description: 'Enregistrez vos ventes, gérez vos commandes et suivez leur statut du paiement à la livraison.',
      color: '#FF8F65'
    },
    {
      id: 'stats',
      icon: '📊',
      title: 'Statistiques et prévisions',
      description: 'Analysez vos performances commerciales avec des tableaux de bord intuitifs et des graphiques détaillés.',
      color: '#16A085'
    },
    {
      id: 'users',
      icon: '🧑‍🤝‍🧑',
      title: 'Multi-utilisateurs & multi-boutiques',
      description: 'Gérez plusieurs points de vente et accordez des accès personnalisés à votre équipe.',
      color: '#FFA585'
    }
  ];
  
  // Variants pour les animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
  
  const iconVariants = {
    hidden: { scale: 0.8, rotate: -10 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.2,
      rotate: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={styles.featuresContainer} id="features">
      <motion.h2 
        className={styles.sectionTitle}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <span className={styles.gradient}>Fonctionnalités</span> puissantes
      </motion.h2>
      
      <motion.p 
        className={styles.sectionDescription}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Découvrez comment SellXY Stocks transforme votre gestion commerciale
      </motion.p>
      
      <motion.div 
        className={styles.featuresGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {features.map((feature) => (
          <motion.div 
            key={feature.id}
            className={styles.featureCard}
            variants={featureVariants}
            whileHover="hover"
            style={{
              '--feature-color': feature.color
            }}
          >
            <motion.div 
              className={styles.iconContainer}
              variants={iconVariants}
            >
              <span className={styles.icon}>{feature.icon}</span>
            </motion.div>
            
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
            
            <div className={styles.featureGlow}></div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        className={styles.ctaContainer}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        viewport={{ once: true }}
      >
        <p className={styles.ctaText}>Prêt à optimiser votre gestion commerciale ?</p>
        <motion.button 
          className={styles.ctaButton}
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(255, 107, 53, 0.7)" }}
          whileTap={{ scale: 0.95 }}
        >
          Essayer gratuitement
        </motion.button>
      </motion.div>
    </div>
  );
};

export default FeaturesSection;
