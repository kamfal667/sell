import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Footer.module.css';

/**
 * Composant Footer premium
 * Présente le logo, les liens, les réseaux sociaux avec un design premium
 */
const Footer = () => {
  // Année courante pour le copyright
  const currentYear = new Date().getFullYear();
  
  // Données des liens de navigation
  const navLinks = [
    { name: 'Accueil', path: '#hero' },
    { name: 'Fonctionnalités', path: '#features' },
    { name: 'Tarifs', path: '#pricing' },
    { name: 'Vidéo', path: '#video' },
    { name: 'FAQ', path: '#faq' },
    { name: 'Contact', path: '/contact', isExternal: true }
  ];
  
  // Données des liens de ressources
  const resourceLinks = [
    { name: 'Documentation', path: '/docs' },
    { name: 'Blog', path: '/blog' },
    { name: 'Support', path: '/support' },
    { name: 'Tutoriels', path: '/tutorials' }
  ];
  
  // Données des liens légaux
  const legalLinks = [
    { name: 'Conditions d\'utilisation', path: '/terms' },
    { name: 'Politique de confidentialité', path: '/privacy' },
    { name: 'Mentions légales', path: '/legal' }
  ];
  
  // Données des réseaux sociaux
  const socialLinks = [
    { 
      name: 'Facebook', 
      path: 'https://facebook.com', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      name: 'Twitter', 
      path: 'https://twitter.com', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M23 3.00005C22.0424 3.67552 20.9821 4.19216 19.86 4.53005C19.2577 3.83756 18.4573 3.34674 17.567 3.12397C16.6767 2.90121 15.7395 2.95724 14.8821 3.2845C14.0247 3.61176 13.2884 4.19445 12.773 4.95376C12.2575 5.71308 11.9877 6.61238 12 7.53005V8.53005C10.2426 8.57561 8.50127 8.18586 6.93101 7.39549C5.36074 6.60513 4.01032 5.43868 3 4.00005C3 4.00005 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.50005C20.9991 7.2215 20.9723 6.94364 20.92 6.67005C21.9406 5.66354 22.6608 4.39276 23 3.00005Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      name: 'LinkedIn', 
      path: 'https://linkedin.com', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      name: 'Instagram', 
      path: 'https://instagram.com', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1902 8.22773 13.4229 8.09407 12.5922C7.9604 11.7615 8.09207 10.9099 8.47033 10.1584C8.84859 9.40685 9.45419 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.1283C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17.5 6.5H17.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];
  
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

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGradient}></div>
      
      <div className={styles.footerContent}>
        <motion.div 
          className={styles.footerTop}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div 
            className={styles.footerLogo}
            variants={itemVariants}
          >
            <Link to="/" className={styles.logoLink}>
              <img src="/assets/logo.png" alt="SellXY Stocks Logo" className={styles.logo} />
              <span className={styles.logoText}>SellXY Stocks</span>
            </Link>
            <p className={styles.tagline}>
              La solution complète pour gérer votre inventaire et booster vos ventes
            </p>
          </motion.div>
          
          <div className={styles.footerLinks}>
            <motion.div 
              className={styles.linksColumn}
              variants={itemVariants}
            >
              <h4 className={styles.columnTitle}>Navigation</h4>
              <ul className={styles.linksList}>
                {navLinks.map((link, index) => (
                  <li key={index} className={styles.linkItem}>
                    {link.isExternal ? (
                      <Link to={link.path} className={styles.link}>
                        {link.name}
                      </Link>
                    ) : (
                      <a href={link.path} className={styles.link}>
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              className={styles.linksColumn}
              variants={itemVariants}
            >
              <h4 className={styles.columnTitle}>Ressources</h4>
              <ul className={styles.linksList}>
                {resourceLinks.map((link, index) => (
                  <li key={index} className={styles.linkItem}>
                    <Link to={link.path} className={styles.link}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              className={styles.linksColumn}
              variants={itemVariants}
            >
              <h4 className={styles.columnTitle}>Légal</h4>
              <ul className={styles.linksList}>
                {legalLinks.map((link, index) => (
                  <li key={index} className={styles.linkItem}>
                    <Link to={link.path} className={styles.link}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          className={styles.footerBottom}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div 
            className={styles.socialLinks}
            variants={itemVariants}
          >
            {socialLinks.map((social, index) => (
              <a 
                key={index} 
                href={social.path} 
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </motion.div>
          
          <motion.div 
            className={styles.copyright}
            variants={itemVariants}
          >
            <p>&copy; {currentYear} SellXY Stocks. Tous droits réservés.</p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
