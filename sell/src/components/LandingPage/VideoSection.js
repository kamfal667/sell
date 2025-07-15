import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './VideoSection.module.css';

/**
 * Composant de la section vidéo (VSL)
 * Présente une vidéo explicative avec fond parallaxe et sous-titres
 */
const VideoSection = () => {
  // État pour suivre si la vidéo est en lecture
  const [isPlaying, setIsPlaying] = useState(false);
  // État pour suivre si les sous-titres sont affichés
  const [showCaptions, setShowCaptions] = useState(true);
  // Référence pour le conteneur vidéo
  const videoRef = useRef(null);
  
  // Fonction pour gérer le clic sur le bouton de lecture
  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Fonction pour basculer l'affichage des sous-titres
  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
  };
  
  // Variants pour les animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8
      }
    }
  };
  
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.3
      }
    }
  };

  return (
    <motion.div 
      className={styles.videoSection}
      id="video"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className={styles.parallaxBackground}></div>
      
      <div className={styles.videoContainer}>
        <motion.h2 
          className={styles.sectionTitle}
          variants={textVariants}
        >
          <span className={styles.gradient}>Découvrez</span> SellXY Stocks en action
        </motion.h2>
        
        <motion.p 
          className={styles.sectionDescription}
          variants={textVariants}
        >
          Voyez comment notre solution transforme la gestion de votre entreprise
        </motion.p>
        
        <div className={styles.videoWrapper}>
          {/* Placeholder pour react-player - à remplacer par le composant réel une fois installé */}
          <div className={styles.videoPlaceholder}>
            <video 
              ref={videoRef}
              className={styles.video}
              onEnded={() => setIsPlaying(false)}
              controls={false}
            >
              <source src="/13.07.2025_16.03.41_REC.mp4" type="video/mp4" />
              Votre navigateur ne prend pas en charge la lecture de vidéos.
            </video>
            
            {!isPlaying && (
              <div className={styles.playOverlay}>
                <motion.button 
                  className={styles.playButton}
                  onClick={handlePlayClick}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                  </svg>
                </motion.button>
              </div>
            )}
          </div>
          
          {showCaptions && (
            <div className={styles.captionsContainer}>
              <p className={styles.captionText}>
                SellXY Stocks vous permet de gérer votre inventaire, vos ventes et vos commandes en toute simplicité.
              </p>
            </div>
          )}
          
          <div className={styles.videoControls}>
            <button 
              className={`${styles.controlButton} ${isPlaying ? styles.pauseButton : styles.playButton}`}
              onClick={handlePlayClick}
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                </svg>
              )}
            </button>
            
            <button 
              className={`${styles.controlButton} ${showCaptions ? styles.activeButton : ''}`}
              onClick={toggleCaptions}
              aria-label="Sous-titres"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18ZM6 10H8V12H6V10ZM6 14H14V16H6V14ZM16 14H18V16H16V14ZM10 10H18V12H10V10Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
        
        <motion.div 
          className={styles.ctaContainer}
          variants={textVariants}
        >
          <p className={styles.ctaText}>Prêt à transformer votre gestion commerciale ?</p>
          <Link to="/signup">
            <motion.button 
              className={styles.ctaButton}
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(255, 107, 53, 0.7)" }}
              whileTap={{ scale: 0.95 }}
            >
              Essayer gratuitement
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VideoSection;
