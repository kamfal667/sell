import React from 'react';
import { motion } from 'framer-motion';
import styles from './InventoryFlow.module.css';

/**
 * Composant InventoryFlow
 * Affiche un flux visuel élégant du processus d'inventaire
 */
const InventoryFlow = () => {
  // Animation pour les étapes du flux
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  // Données des étapes du flux
  const flowSteps = [
    {
      icon: '📦',
      title: 'Gestion des stocks',
      description: 'Suivez votre inventaire en temps réel'
    },
    {
      icon: '💰',
      title: 'Processus de vente',
      description: 'Enregistrez vos ventes rapidement'
    },
    {
      icon: '🛒',
      title: 'Suivi des commandes',
      description: 'Gérez vos commandes efficacement'
    },
    {
      icon: '📊',
      title: 'Statistiques',
      description: 'Analysez vos performances'
    }
  ];

  return (
    <div className={styles.flowContainer}>
      <motion.div 
        className={styles.flowSteps}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {flowSteps.map((step, index) => (
          <React.Fragment key={index}>
            <motion.div 
              className={styles.flowStep}
              variants={itemVariants}
            >
              <div className={styles.iconContainer}>
                <span className={styles.icon}>{step.icon}</span>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </motion.div>
            
            {index < flowSteps.length - 1 && (
              <motion.div 
                className={styles.connector}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.5 + (index * 0.3), duration: 0.8 }}
                viewport={{ once: true }}
              />
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

export default InventoryFlow;
