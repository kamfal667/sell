import React, { createContext, useState, useEffect } from 'react';

// Créer le contexte
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

// Hook personnalisé pour utiliser le contexte du thème
const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  return context;
};

// Composant Provider
const ThemeProvider = ({ children }) => {
  // Check if theme is stored in localStorage, default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Apply theme class to body when theme changes
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Exporter les composants et hooks
export { ThemeContext, ThemeProvider, useTheme };
