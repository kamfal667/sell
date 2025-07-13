import React, { useEffect, useRef } from 'react';
import styles from './ParticlesBackground.module.css';

/**
 * Composant d'arrière-plan avec particules animées
 * Crée un effet visuel immersif pour la landing page
 */
const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Ajuster la taille du canvas à la fenêtre
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initialiser les particules
    let particles = [];
    const particleCount = 100;
    
    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          color: `rgba(255, 107, 53, ${Math.random() * 0.5 + 0.1})`,
          speedX: Math.random() * 1 - 0.5,
          speedY: Math.random() * 1 - 0.5
        });
      }
    };
    
    // Dessiner les particules
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Connecter les particules proches
        particles.forEach(otherParticle => {
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) +
            Math.pow(particle.y - otherParticle.y, 2)
          );
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 107, 53, ${0.2 - distance / 500})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
        
        // Déplacer les particules
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Rebondir sur les bords
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX = -particle.speedX;
        }
        
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY = -particle.speedY;
        }
      });
    };
    
    // Animation loop
    const animate = () => {
      drawParticles();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Initialisation
    resizeCanvas();
    createParticles();
    animate();
    
    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });
    
    // Nettoyage
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas ref={canvasRef} className={styles.particlesCanvas} />
  );
};

export default ParticlesBackground;
