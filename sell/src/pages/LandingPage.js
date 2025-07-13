import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import styles from './LandingPage.module.css';

// Components
import Header from '../components/LandingPage/Header';
import HeroSection from '../components/LandingPage/HeroSection';
import Illustration3D from '../components/LandingPage/Illustration3D';
import FeaturesSection from '../components/LandingPage/FeaturesSection';
import PricingSection from '../components/LandingPage/PricingSection';
import VideoSection from '../components/LandingPage/VideoSection';
// Section témoignages supprimée
import FaqSection from '../components/LandingPage/FaqSection';
import Footer from '../components/LandingPage/Footer';
import ParticlesBackground from '../components/LandingPage/ParticlesBackground';
import InventoryFlow from '../components/LandingPage/InventoryFlow';

/**
 * Landing Page Component
 * Page d'accueil immersive et premium pour SellXY Stocks
 */
const LandingPage = () => {
  // Références pour le scroll snap et l'animation au scroll
  const containerRef = useRef(null);
  const sectionRefs = useRef([
    React.createRef(), // Hero
    React.createRef(), // Features
    React.createRef(), // Pricing
    React.createRef(), // VSL
    React.createRef(), // FAQ
    React.createRef() // Footer
  ]);
  
  // Animation au scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Effet de parallaxe
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  // État pour suivre la section active
  const [activeSection, setActiveSection] = useState(0);
  
  // Gestion du scroll snap et détection de la section visible
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Déterminer quelle section est actuellement visible
      sectionRefs.current.forEach((ref, index) => {
        if (ref.current) {
          const { offsetTop, offsetHeight } = ref.current;
          const sectionTop = offsetTop - 100; // Ajustement pour le header
          const sectionBottom = offsetTop + offsetHeight;
          
          if (currentScrollPos >= sectionTop && currentScrollPos < sectionBottom) {
            setActiveSection(index);
          }
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    // Appel initial pour définir la section active au chargement
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fonction pour naviguer vers une section spécifique
  const scrollToSection = (index) => {
    if (sectionRefs.current[index] && sectionRefs.current[index].current) {
      sectionRefs.current[index].current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className={styles.landingPageContainer} ref={containerRef}>
      {/* Particules en arrière-plan */}
      <ParticlesBackground />
      
      {/* Header sticky avec indication de la section active */}
      <Header activeSection={activeSection} onNavigate={scrollToSection} />
      
      {/* Section Hero */}
      <section ref={sectionRefs.current[0]} className={`${styles.section} ${styles.heroSection}`}>
        <HeroSection scrollY={parallaxY} />
      </section>
      
      {/* Section Fonctionnalités */}
      <section ref={sectionRefs.current[1]} className={`${styles.section} ${styles.featuresSection}`}>
        <FeaturesSection />
        <div className={styles.inventoryFlowContainer}>
          <h2 className={styles.flowTitle}>Notre processus d'inventaire</h2>
          <InventoryFlow />
        </div>
      </section>
      
      {/* Section Tarifs */}
      <section ref={sectionRefs.current[2]} className={`${styles.section} ${styles.pricingSection}`}>
        <PricingSection />
      </section>
      
      {/* Section VSL (Video Sales Letter) */}
      <section ref={sectionRefs.current[3]} className={`${styles.section} ${styles.videoSection}`}>
        <VideoSection />
      </section>
      
      {/* Section Témoignages supprimée */}
      
      {/* Section FAQ */}
      <section ref={sectionRefs.current[4]} className={`${styles.section} ${styles.faqSection}`}>
        <FaqSection />
      </section>
      
      {/* Footer */}
      <section ref={sectionRefs.current[5]} className={`${styles.section} ${styles.footerSection}`}>
        <Footer />
      </section>
    </div>
  );
};

export default LandingPage;
