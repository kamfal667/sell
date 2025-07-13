import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Illustration3D.module.css';

/**
 * Composant d'illustration 3D du flux d'inventaire
 * Représente visuellement le processus : stock > vente > commande > statistiques
 */
const Illustration3D = () => {
  // État pour suivre l'étape active lors du survol
  const [activeStep, setActiveStep] = useState(null);
  
  // Données des étapes du flux d'inventaire
  const steps = [
    {
      id: 'stock',
      title: 'Gestion des stocks',
      description: 'Suivez votre inventaire en temps réel',
      icon: '📦',
      color: '#FF6B35'
    },
    {
      id: 'vente',
      title: 'Processus de vente',
      description: 'Enregistrez vos ventes rapidement',
      icon: '💰',
      color: '#FF8F65'
    },
    {
      id: 'commande',
      title: 'Suivi des commandes',
      description: 'Gérez vos commandes efficacement',
      icon: '🛒',
      color: '#FFA585'
    },
    {
      id: 'stats',
      title: 'Analyse statistique',
      description: 'Visualisez vos performances',
      icon: '📊',
      color: '#16A085'
    }
  ];
  
  // Variants pour les animations
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
        duration: 0.5
      }
    }
  };
  
  const arrowVariants = {
    hidden: { opacity: 0, width: 0 },
    visible: {
      opacity: 1,
      width: '100%',
      transition: {
        duration: 0.8,
        delay: 1.2
      }
    }
  };
  
  const iconVariants = {
    idle: { scale: 1, y: 0 },
    hover: { 
      scale: 1.2, 
      y: -10,
      transition: {
        duration: 0.3,
        yoyo: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  // Fonction pour gérer le survol d'une étape
  const handleStepHover = (stepId) => {
    setActiveStep(stepId);
  };
  
  // Fonction pour réinitialiser l'étape active
  const handleStepLeave = () => {
    setActiveStep(null);
  };

  return (
    <div className={styles.illustrationContainer}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.gradient}>Flux d'inventaire</span> intelligent
      </h2>
      
      <p className={styles.sectionDescription}>
        Découvrez comment SellXY Stocks optimise votre chaîne d'approvisionnement
      </p>
      
      <motion.div 
        className={styles.flowContainer}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <motion.div 
              className={`${styles.stepCard} ${activeStep === step.id ? styles.active : ''}`}
              variants={itemVariants}
              onMouseEnter={() => handleStepHover(step.id)}
              onMouseLeave={handleStepLeave}
              style={{
                '--card-color': step.color
              }}
            >
              <motion.div 
                className={styles.iconContainer}
                variants={iconVariants}
                initial="idle"
                whileHover="hover"
              >
                <span className={styles.icon}>{step.icon}</span>
              </motion.div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </motion.div>
            
            {index < steps.length - 1 && (
              <motion.div 
                className={styles.arrow}
                variants={arrowVariants}
              >
                <div className={styles.arrowLine}></div>
                <div className={styles.arrowHead}></div>
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </motion.div>
      
      <div className={styles.flowDescription}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          Un système intégré qui connecte toutes les étapes de votre activité commerciale
        </motion.p>
      </div>
    </div>
  );
};

export default Illustration3D;
