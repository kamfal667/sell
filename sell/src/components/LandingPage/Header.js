import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

/**
 * Composant Header avec effet glassmorphism
 * Navigation responsive avec menu burger en mobile
 * @param {number} activeSection - Index de la section active
 * @param {function} onNavigate - Fonction pour naviguer vers une section
 */
const Header = ({ activeSection = 0, onNavigate }) => {
  // État pour le menu mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // État pour l'effet de scroll
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Gestion du scroll pour ajouter une ombre au header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      if (scrollTop > 10) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fermer le menu mobile lors d'un clic sur un lien et naviguer vers la section
  const handleLinkClick = (index) => {
    setIsMenuOpen(false);
    if (onNavigate) {
      onNavigate(index);
    }
  };
  
  // Animation pour le menu mobile
  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  // Animation pour les items du menu
  const itemVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0 }
  };
  
  return (
    <header className={`${styles.header} ${hasScrolled ? styles.scrolled : ''}`}>
      <div className={styles.headerContainer}>
        {/* Logo */}
        <Link to="/" className={styles.logoContainer}>
          <div className={styles.logo}>
            <img src="/assets/logo.png" alt="SellXY Stocks Logo" className={styles.logoImage} />
          </div>
        </Link>
        
        {/* Navigation Desktop */}
        <nav className={styles.desktopNav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <a 
                href="#features" 
                className={`${styles.navLink} ${activeSection === 1 ? styles.active : ''}`}
                onClick={(e) => { e.preventDefault(); handleLinkClick(1); }}
              >
                Fonctionnalités
              </a>
            </li>
            <li className={styles.navItem}>
              <a 
                href="#pricing" 
                className={`${styles.navLink} ${activeSection === 2 ? styles.active : ''}`}
                onClick={(e) => { e.preventDefault(); handleLinkClick(2); }}
              >
                Tarifs
              </a>
            </li>
            <li className={styles.navItem}>
              <a 
                href="#video" 
                className={`${styles.navLink} ${activeSection === 3 ? styles.active : ''}`}
                onClick={(e) => { e.preventDefault(); handleLinkClick(3); }}
              >
                Vidéo
              </a>
            </li>
            <li className={styles.navItem}>
              <a 
                href="#faq" 
                className={`${styles.navLink} ${activeSection === 4 ? styles.active : ''}`}
                onClick={(e) => { e.preventDefault(); handleLinkClick(4); }}
              >
                FAQ
              </a>
            </li>
          </ul>
        </nav>
        
        {/* Login Button */}
        <Link to="/login" className={styles.loginButton}>
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Se connecter
          </motion.span>
        </Link>
        
        {/* CTA Button */}
        <Link to="/signup" className={styles.ctaButton}>
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Créer mon compte
          </motion.span>
        </Link>
        
        {/* Burger Menu Button */}
        <button 
          className={`${styles.burgerButton} ${isMenuOpen ? styles.open : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
        </button>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              className={styles.mobileNav}
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <motion.ul className={styles.mobileNavList}>
                <motion.li variants={itemVariants} className={styles.mobileNavItem}>
                  <div className={styles.mobileLogo}>
                    <img src="/assets/logo.png" alt="SellXY Stocks Logo" className={styles.mobileLogoImage} />
                  </div>
                </motion.li>
                <motion.li variants={itemVariants} className={styles.mobileNavItem}>
                  <a 
                    href="#features" 
                    className={`${styles.mobileNavLink} ${activeSection === 1 ? styles.active : ''}`}
                    onClick={(e) => { e.preventDefault(); handleLinkClick(1); }}
                  >
                    Fonctionnalités
                  </a>
                </motion.li>
                <motion.li variants={itemVariants} className={styles.mobileNavItem}>
                  <a 
                    href="#pricing" 
                    className={`${styles.mobileNavLink} ${activeSection === 2 ? styles.active : ''}`}
                    onClick={(e) => { e.preventDefault(); handleLinkClick(2); }}
                  >
                    Tarifs
                  </a>
                </motion.li>
                <motion.li variants={itemVariants} className={styles.mobileNavItem}>
                  <a 
                    href="#video" 
                    className={`${styles.mobileNavLink} ${activeSection === 3 ? styles.active : ''}`}
                    onClick={(e) => { e.preventDefault(); handleLinkClick(3); }}
                  >
                    Vidéo
                  </a>
                </motion.li>
                <motion.li variants={itemVariants} className={styles.mobileNavItem}>
                  <a 
                    href="#faq" 
                    className={`${styles.mobileNavLink} ${activeSection === 4 ? styles.active : ''}`}
                    onClick={(e) => { e.preventDefault(); handleLinkClick(4); }}
                  >
                    FAQ
                  </a>
                </motion.li>
                <motion.li variants={itemVariants} className={styles.mobileNavItem}>
                  <Link to="/signup" className={styles.mobileCta} onClick={handleLinkClick}>
                    Créer mon compte
                  </Link>
                </motion.li>
              </motion.ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
