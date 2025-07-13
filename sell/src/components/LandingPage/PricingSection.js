import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './PricingSection.module.css';

/**
 * Composant de la section Tarifs
 * Présente les différentes offres tarifaires avec effet glassmorphism
 */
const PricingSection = () => {
  // Données des plans tarifaires
  const pricingPlans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0',
      currency: 'FCFA',
      period: 'pour toujours',
      description: 'Parfait pour démarrer et tester l\'application',
      features: [
        '1 utilisateur',
        'Gestion de stock basique',
        'Tableau de bord simplifié',
        'Support communautaire'
      ],
      cta: 'Commencer gratuitement',
      popular: false,
      color: 'rgba(255, 255, 255, 0.1)'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '20 000',
      currency: 'FCFA',
      period: 'par mois',
      description: 'Idéal pour les petites et moyennes entreprises',
      features: [
        '3 utilisateurs',
        'Gestion de stock avancée',
        'Statistiques détaillées',
        'Support prioritaire',
        'Gestion multi-boutique (1)',
        'Exportation des données'
      ],
      cta: 'Choisir ce plan',
      popular: true,
      color: 'linear-gradient(135deg, #FF6B35, #FF8F65)'
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      price: '40 000',
      currency: 'FCFA',
      period: 'par mois',
      description: 'Pour les entreprises avec plusieurs points de vente',
      features: [
        'Utilisateurs illimités',
        'Gestion de stock premium',
        'Statistiques avancées',
        'Support dédié 24/7',
        'Multi-boutiques illimitées',
        'API personnalisée',
        'Formation sur mesure'
      ],
      cta: 'Contacter les ventes',
      popular: false,
      color: 'rgba(22, 160, 133, 0.3)'
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
  
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: (popular) => ({
      y: -15,
      boxShadow: popular 
        ? '0 20px 40px rgba(255, 107, 53, 0.3), 0 0 30px rgba(255, 107, 53, 0.2)' 
        : '0 20px 40px rgba(0, 0, 0, 0.3)',
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };
  
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 20px rgba(255, 107, 53, 0.7)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <div className={styles.pricingContainer} id="pricing">
      <motion.h2 
        className={styles.sectionTitle}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <span className={styles.gradient}>Tarifs</span> transparents
      </motion.h2>
      
      <motion.p 
        className={styles.sectionDescription}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Choisissez le plan qui correspond à vos besoins
      </motion.p>
      
      <motion.div 
        className={styles.pricingGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {pricingPlans.map((plan) => (
          <motion.div 
            key={plan.id}
            className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''}`}
            variants={cardVariants}
            custom={plan.popular}
            whileHover="hover"
            style={{
              background: plan.popular ? plan.color : 'rgba(18, 18, 18, 0.7)'
            }}
          >
            {plan.popular && (
              <div className={styles.popularBadge}>Populaire</div>
            )}
            
            <h3 className={styles.planName}>{plan.name}</h3>
            
            <div className={styles.planPrice}>
              <span className={styles.currency}>{plan.currency}</span>
              <span className={styles.amount}>{plan.price}</span>
              <span className={styles.period}>/{plan.period}</span>
            </div>
            
            <p className={styles.planDescription}>{plan.description}</p>
            
            <ul className={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <motion.li 
                  key={index}
                  className={styles.featureItem}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  viewport={{ once: true }}
                >
                  <span className={styles.featureIcon}>✓</span>
                  {feature}
                </motion.li>
              ))}
            </ul>
            
            <Link to={plan.id === 'enterprise' ? '/contact' : '/signup'} className={styles.ctaLink}>
              <motion.button 
                className={`${styles.ctaButton} ${plan.popular ? styles.popularButton : ''}`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {plan.cta}
              </motion.button>
            </Link>
            
            {plan.popular && <div className={styles.glow}></div>}
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        className={styles.guaranteeContainer}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        viewport={{ once: true }}
      >
        <p className={styles.guaranteeText}>
          <span className={styles.guaranteeIcon}>🔒</span>
          Satisfait ou remboursé pendant 14 jours. Aucun engagement.
        </p>
      </motion.div>
    </div>
  );
};

export default PricingSection;
