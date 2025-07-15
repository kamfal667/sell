import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './HeroSection.module.css';

/**
 * Composant Hero Section immersif avec vidéo et animations
 * Première vue de la landing page
 */
const HeroSection = ({ scrollY }) => {
  // Variants pour les animations
  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        delay: 0.3,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (custom) => ({ 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        delay: 0.5 + (custom * 0.2),
        ease: "easeOut"
      }
    }),
    hover: { 
      scale: 1.05,
      boxShadow: "0px 0px 20px rgba(255, 107, 53, 0.7)"
    },
    tap: { 
      scale: 0.95 
    }
  };

  return (
    <div className={styles.heroContainer}>
      {/* Vidéo d'arrière-plan */}
      <div className={styles.videoBackground}>
        <video autoPlay loop muted playsInline className={styles.video}>
          <source src="https://assets.mixkit.co/videos/preview/mixkit-managing-a-business-from-a-digital-tablet-13005-large.mp4" type="video/mp4" />
          Votre navigateur ne prend pas en charge les vidéos HTML5.
        </video>
        <div className={styles.overlay}></div>
      </div>
      
      {/* Contenu principal */}
      <div className={styles.heroContent}>
        <motion.h1 
          className={styles.heroTitle}
          initial="hidden"
          animate="visible"
          variants={titleVariants}
        >
          Gérez vos stocks et ventes en temps réel, où que vous soyez.
        </motion.h1>
        
        <motion.p 
          className={styles.heroSubtitle}
          initial="hidden"
          animate="visible"
          variants={subtitleVariants}
        >
          Optimisez votre activité grâce à un tableau de bord tout-en-un.
        </motion.p>
      
        <div className={styles.heroButtons}>
          <Link to="/auth">
            <motion.button 
              className={styles.primaryButton}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
              custom={0}
            >
              Créer mon compte gratuit
            </motion.button>
          </Link>
          
          <a href="#video">
            <motion.button 
              className={styles.secondaryButton}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
              custom={1}
            >
              Voir la démo
            </motion.button>
          </a>
        </div>
      </div>
      
      {/* Effet de particules numériques */}
      <div className={styles.dataParticles}>
        <motion.div 
          className={`${styles.particle} ${styles.particle1}`}
          animate={{ 
            y: [0, -20, 0], 
            opacity: [0.4, 1, 0.4] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          1
        </motion.div>
        <motion.div 
          className={`${styles.particle} ${styles.particle2}`}
          animate={{ 
            y: [0, -30, 0], 
            opacity: [0.3, 0.8, 0.3] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          0
        </motion.div>
        <motion.div 
          className={`${styles.particle} ${styles.particle3}`}
          animate={{ 
            y: [0, -25, 0], 
            opacity: [0.5, 1, 0.5] 
          }}
          transition={{ 
            duration: 3.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          1
        </motion.div>
        <motion.div 
          className={`${styles.particle} ${styles.particle4}`}
          animate={{ 
            y: [0, -15, 0], 
            opacity: [0.2, 0.7, 0.2] 
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          0
        </motion.div>
        <motion.div 
          className={`${styles.particle} ${styles.particle5}`}
          animate={{ 
            y: [0, -20, 0], 
            opacity: [0.3, 0.9, 0.3] 
          }}
          transition={{ 
            duration: 3.2, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8
          }}
        >
          1
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className={styles.scrollIndicator}
        animate={{ 
          y: [0, 10, 0], 
          opacity: [0.5, 1, 0.5] 
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        <span className={styles.scrollText}>Découvrir</span>
        <span className={styles.scrollArrow}>↓</span>
      </motion.div>
    </div>
  );
};

export default HeroSection;
