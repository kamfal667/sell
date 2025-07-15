import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './FaqSection.module.css';

/**
 * Composant de la section FAQ
 * Présente une liste de questions fréquentes avec accordéons interactifs
 */
const FaqSection = () => {
  // Données des questions fréquentes
  const faqItems = [
    {
      id: 1,
      question: "Comment SellXY Stocks gère-t-il les stocks multi-boutiques ?",
      answer: "SellXY Stocks synchronise automatiquement vos inventaires entre tous vos points de vente. Chaque transaction est enregistrée en temps réel, ce qui permet d'avoir une vision globale et précise de vos stocks, quel que soit le nombre de boutiques que vous gérez."
    },
    {
      id: 2,
      question: "Puis-je importer mes données existantes ?",
      answer: "Oui, SellXY Stocks vous permet d'importer facilement vos données existantes via des fichiers CSV ou Excel. Notre équipe peut également vous accompagner dans la migration de vos données depuis votre ancien système."
    },
    {
      id: 3,
      question: "Quels types de rapports statistiques sont disponibles ?",
      answer: "SellXY Stocks propose des rapports détaillés sur vos ventes, votre inventaire, vos clients et votre rentabilité. Vous pouvez visualiser vos données sous forme de graphiques personnalisables et exporter vos rapports en plusieurs formats."
    },
    {
      id: 4,
      question: "Comment fonctionne la gestion des utilisateurs ?",
      answer: "Vous pouvez créer autant de comptes utilisateurs que nécessaire (selon votre forfait) et définir des permissions spécifiques pour chacun. Par exemple, vous pouvez limiter l'accès aux données financières ou aux modifications de stock pour certains employés."
    },
    {
      id: 5,
      question: "Est-ce que SellXY Stocks fonctionne hors ligne ?",
      answer: "Oui, SellXY Stocks dispose d'un mode hors ligne qui vous permet de continuer à enregistrer des ventes même sans connexion internet. Les données sont synchronisées automatiquement dès que la connexion est rétablie."
    }
  ];
  
  // État pour suivre l'élément actif (ouvert)
  const [activeId, setActiveId] = useState(null);
  
  // Fonction pour basculer l'état d'un accordéon
  const toggleAccordion = (id) => {
    // Force la fermeture de l'accordéon actif avant d'en ouvrir un autre
    setActiveId(prevId => prevId === id ? null : id);
  };
  
  // Variants pour les animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
  
  const contentVariants = {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: {
      opacity: 1,
      height: "auto",
      overflow: 'hidden',
      transition: {
        height: { duration: 0.4, ease: "easeOut" },
        opacity: { duration: 0.25, ease: "easeIn" }
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      overflow: 'hidden',
      transition: {
        height: { duration: 0.3, ease: "easeIn" },
        opacity: { duration: 0.2, ease: "easeOut" }
      }
    }
  };

  return (
    <div className={styles.faqSection} id="faq">
      <motion.h2 
        className={styles.sectionTitle}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        Questions <span className={styles.gradient}>fréquentes</span>
      </motion.h2>
      
      <motion.p 
        className={styles.sectionDescription}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Tout ce que vous devez savoir sur SellXY Stocks
      </motion.p>
      
      <motion.div 
        className={styles.faqContainer}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {faqItems.map((item) => (
          <motion.div 
            key={item.id}
            className={`${styles.faqItem} ${activeId === item.id ? styles.active : ''}`}
            variants={itemVariants}
          >
            <button 
              className={styles.faqQuestion}
              onClick={() => toggleAccordion(item.id)}
              aria-expanded={activeId === item.id}
              aria-controls={`faq-answer-${item.id}`}
            >
              <span>{item.question}</span>
              <div className={styles.faqIcon}>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={activeId === item.id ? styles.iconActive : ''}
                >
                  <path 
                    d="M12 5V19M5 12H19" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            
            <AnimatePresence>
              {activeId === item.id && (
                <motion.div 
                  id={`faq-answer-${item.id}`}
                  className={styles.faqAnswer}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <p>{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
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
        <p className={styles.ctaText}>Vous avez d'autres questions ?</p>
        <motion.div
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(255, 107, 53, 0.7)" }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/contact" className={styles.ctaButton}>
            Contactez-nous
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FaqSection;
