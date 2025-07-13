import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { UserBusinessProvider } from './context/UserBusinessContext';
import { ThemeProvider } from './context/ThemeContext';
import MobileNavBar from './components/MobileNavBar';
import { Analytics } from '@vercel/analytics/react';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Produits from './pages/Produits';
import Clients from './pages/Clients';
import Commandes from './pages/Commandes';
import Ventes from './pages/Ventes';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import ImageMigration from './pages/ImageMigration';
import Inventaire from './pages/Inventaire';
import LandingPage from './pages/LandingPage';
import AuthCallback from './pages/AuthCallback';

// Styles
import './App.css';
import './styles/mobile-adjustments.css'; // Ajustements CSS pour mobile

function App() {
  return (
    <AuthProvider>
      <UserBusinessProvider>
        <ThemeProvider>
          <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/produits" element={<Produits />} />
              <Route path="/commandes" element={<Commandes />} />
              <Route path="/ventes" element={<Ventes />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/inventaire" element={<Inventaire />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/parametres" element={<Settings />} />
              <Route path="/migration-images" element={<ImageMigration />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Analytics />
            {/* Barre de navigation mobile qui s'affiche uniquement sur le dashboard */}
            {window.location.pathname === '/dashboard' && <MobileNavBar />}
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
          </Router>
        </ThemeProvider>
      </UserBusinessProvider>
    </AuthProvider>
  );
}

export default App;
