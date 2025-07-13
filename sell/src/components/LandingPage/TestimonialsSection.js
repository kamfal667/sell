import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TestimonialsSection.module.css';

/**
 * Composant de la section Témoignages
 * Présente un slider de témoignages clients avec effet machine à écrire
 */
const TestimonialsSection = () => {
  // Données des témoignages
  const testimonials = [
    {
      id: 1,
      name: 'Sophie Martin',
      role: 'Propriétaire de boutique',
      avatar: '/assets/avatar-1.png',
      text: "SellXY Stocks a transformé ma gestion d'inventaire. Je gagne des heures chaque semaine et j'ai réduit mes ruptures de stock de 80%."
    },
    {
      id: 2,
      name: 'Thomas Dubois',
      role: 'Directeur commercial',
      avatar: '/assets/avatar-2.png',
      text: "L'interface est intuitive et les statistiques nous permettent de prendre des décisions éclairées. Notre CA a augmenté de 25% depuis que nous utilisons SellXY Stocks."
    },
    {
      id: 3,
      name: 'Amina Koné',
      role: 'Gérante multi-boutiques',
      avatar: '/assets/avatar-3.png',
      text: "Gérer plusieurs points de vente n'a jamais été aussi simple. La synchronisation en temps réel et les alertes de stock bas sont des fonctionnalités indispensables."
    }
  ];
  
  // État pour suivre l'index du témoignage actif
  const [activeIndex, setActiveIndex] = useState(0);
  // État pour l'effet machine à écrire
  const [displayText, setDisplayText] = useState('');
  // État pour suivre si l'animation d'écriture est terminée
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  // Référence pour le timer d'auto-défilement
  const timerRef = useRef(null);
  // Référence pour le timer de l'effet machine à écrire
  const typeTimerRef = useRef(null);
  
  // Effet pour gérer l'auto-défilement des témoignages
  useEffect(() => {
    // Réinitialiser le timer à chaque changement de témoignage
    clearTimeout(timerRef.current);
    
    // Démarrer un nouveau timer pour le défilement automatique
    // seulement si l'animation d'écriture est terminée
    if (isTypingComplete) {
      timerRef.current = setTimeout(() => {
        goToNext();
      }, 8000); // 8 secondes par témoignage (augmenté pour plus de temps de lecture)
    }
    
    // Nettoyage à la destruction du composant
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(typeTimerRef.current);
    };
  }, [activeIndex, isTypingComplete]);
  
  // Effet pour l'animation de machine à écrire
  useEffect(() => {
    // Réinitialiser le texte et l'état de l'animation
    setDisplayText('');
    setIsTypingComplete(false);
    
    // Récupérer le texte complet du témoignage actif
    const fullText = testimonials[activeIndex].text;
    let index = 0;
    
    // Fonction pour ajouter un caractère à la fois
    const typeText = () => {
      if (index < fullText.length) {
        setDisplayText(prev => prev + fullText.charAt(index));
        index++;
        typeTimerRef.current = setTimeout(typeText, 30); // Vitesse de frappe
      } else {
        setIsTypingComplete(true);
      }
    };
    
    // Démarrer l'animation après un court délai
    typeTimerRef.current = setTimeout(typeText, 300);
    
    // Nettoyage
    return () => {
      clearTimeout(typeTimerRef.current);
    };
  }, [activeIndex]);
  
  // Fonction pour aller au témoignage suivant
  const goToNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  // Fonction pour aller au témoignage précédent
  const goToPrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
  
  // Fonction pour aller à un témoignage spécifique
  const goToIndex = (index) => {
    setActiveIndex(index);
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
  
  const testimonialVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className={styles.testimonialsSection}
      id="testimonials"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.h2 
        className={styles.sectionTitle}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        Ce que disent nos <span className={styles.gradient}>clients</span>
      </motion.h2>
      
      <motion.p 
        className={styles.sectionDescription}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Découvrez comment SellXY Stocks aide les entreprises à se développer
      </motion.p>
      
      <div className={styles.testimonialsContainer}>
        <button 
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={goToPrev}
          aria-label="Témoignage précédent"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        <div className={styles.testimonialWrapper}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeIndex}
              className={styles.testimonialCard}
              variants={testimonialVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className={styles.testimonialContent}>
                <div className={styles.quoteIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 11H6C5.46957 11 4.96086 10.7893 4.58579 10.4142C4.21071 10.0391 4 9.53043 4 9V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H8C8.53043 5 9.03914 5.21071 9.41421 5.58579C9.78929 5.96086 10 6.46957 10 7V15C10 15.5304 9.78929 16.0391 9.41421 16.4142C9.03914 16.7893 8.53043 17 8 17H6M20 11H16C15.4696 11 14.9609 10.7893 14.5858 10.4142C14.2107 10.0391 14 9.53043 14 9V7C14 6.46957 14.2107 5.96086 14.5858 5.58579C14.9609 5.21071 15.4696 5 16 5H18C18.5304 5 19.0391 5.21071 19.4142 5.58579C19.7893 5.96086 20 6.46957 20 7V15C20 15.5304 19.7893 16.0391 19.4142 16.4142C19.0391 16.7893 18.5304 17 18 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                
                <p className={styles.testimonialText}>
                  {displayText}
                  <span className={isTypingComplete ? styles.cursorHidden : styles.cursor}>|</span>
                </p>
                
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorInfo}>
                    <h4 className={styles.authorName}>{testimonials[activeIndex].name}</h4>
                    <p className={styles.authorRole}>{testimonials[activeIndex].role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <button 
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={goToNext}
          aria-label="Témoignage suivant"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      
      <div className={styles.dotsContainer}>
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === activeIndex ? styles.activeDot : ''}`}
            onClick={() => goToIndex(index)}
            aria-label={`Témoignage ${index + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TestimonialsSection;
