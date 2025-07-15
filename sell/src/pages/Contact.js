import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Contact.module.css';

/**
 * Page de contact
 * Permet aux utilisateurs d'envoyer un message via un formulaire
 */
const Contact = () => {
  // États pour les champs du formulaire
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // État pour les messages de validation/erreur
  const [formStatus, setFormStatus] = useState({
    message: '',
    isError: false,
    isSuccess: false
  });
  
  // État pour indiquer si le formulaire est en cours d'envoi
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation de base pour l'email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormStatus({
        message: 'Veuillez remplir tous les champs obligatoires.',
        isError: true,
        isSuccess: false
      });
      return;
    }
    
    // Validation de l'email
    if (!isValidEmail(email)) {
      setFormStatus({
        message: 'Veuillez entrer une adresse email valide.',
        isError: true,
        isSuccess: false
      });
      return;
    }
    
    // Simulation d'envoi du formulaire
    setIsSubmitting(true);
    
    try {
      // Ici, vous pourriez intégrer un service d'envoi d'email comme EmailJS, 
      // ou envoyer les données à votre backend
      
      // Simulation d'un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Réinitialisation du formulaire après envoi réussi
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      
      // Affichage du message de succès
      setFormStatus({
        message: 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
        isError: false,
        isSuccess: true
      });
      
    } catch (error) {
      // Gestion des erreurs
      setFormStatus({
        message: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.',
        isError: true,
        isSuccess: false
      });
      console.error('Erreur lors de l\'envoi du formulaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Animations
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };
  
  const formVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8,
        delay: 0.3
      } 
    }
  };
  
  const inputVariants = {
    focus: { 
      scale: 1.02,
      boxShadow: '0 4px 20px rgba(255, 107, 53, 0.2)',
      borderColor: '#FF6B35',
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className={styles.contactContainer}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className={styles.contactContent}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.gradient}>Contactez</span>-nous
        </motion.h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Une question ? Une demande spécifique ? Nous sommes là pour vous aider.
        </motion.p>
        
        <div className={styles.contactLayout}>
          <motion.div 
            className={styles.contactInfo}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className={styles.infoContent}>
                <h3>Adresse</h3>
                <p>Riviera palmeraie</p>
                <p>Abidjan, Côte d'Ivoire</p>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <i className="fas fa-envelope"></i>
              </div>
              <div className={styles.infoContent}>
                <h3>Email</h3>
                <p>contact@sellxy.com</p>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <i className="fas fa-phone-alt"></i>
              </div>
              <div className={styles.infoContent}>
                <h3>Téléphone</h3>
                <p>+225 0767568549 / 0140 78 78 45</p>
              </div>
            </div>
            
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialIcon}><i className="fab fa-facebook-f"></i></a>
              <a href="#" className={styles.socialIcon}><i className="fab fa-twitter"></i></a>
              <a href="#" className={styles.socialIcon}><i className="fab fa-instagram"></i></a>
              <a href="#" className={styles.socialIcon}><i className="fab fa-linkedin-in"></i></a>
            </div>
          </motion.div>
          
          <motion.form 
            className={styles.contactForm}
            onSubmit={handleSubmit}
            variants={formVariants}
            initial="initial"
            animate="animate"
          >
            <div className={styles.formGroup}>
              <motion.input
                type="text"
                id="name"
                name="name"
                placeholder="Votre nom *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.formControl}
                whileFocus="focus"
                variants={inputVariants}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <motion.input
                type="email"
                id="email"
                name="email"
                placeholder="Votre email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formControl}
                whileFocus="focus"
                variants={inputVariants}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <motion.input
                type="text"
                id="subject"
                name="subject"
                placeholder="Sujet"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={styles.formControl}
                whileFocus="focus"
                variants={inputVariants}
              />
            </div>
            
            <div className={styles.formGroup}>
              <motion.textarea
                id="message"
                name="message"
                placeholder="Votre message *"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${styles.formControl} ${styles.textarea}`}
                whileFocus="focus"
                variants={inputVariants}
                required
                rows={5}
              />
            </div>
            
            {formStatus.message && (
              <motion.div 
                className={`${styles.formMessage} ${formStatus.isError ? styles.error : ''} ${formStatus.isSuccess ? styles.success : ''}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {formStatus.message}
              </motion.div>
            )}
            
            <motion.button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
