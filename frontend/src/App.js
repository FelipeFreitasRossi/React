// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Loader from './components/Loader';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Crypto from './pages/Crypto';
import ScrollToTop from './components/ScrollToTop'; // ← importe o ScrollToTop

// Componente interno para acessar o tema
const AppContent = () => {
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao validar sessão:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(() => validateSession(), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (username, email) => {
    const userData = { username, email };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
  };

  const handleSignUp = (username, email) => {
    console.log('Usuário cadastrado:', username, email);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (newData) => {
    const updated = { ...user, ...newData };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  if (loading) return <Loader />;

  return (
    <StyledThemeProvider theme={currentTheme}>
      <Router>
        <ScrollToTop /> {/* ← Adicione aqui, dentro do Router */}
        <Header user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/moedas" element={<Crypto />} />
          <Route
            path="/perfil"
            element={isAuthenticated ? <Profile user={user} updateUser={updateUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/configuracoes"
            element={isAuthenticated ? <Settings /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <LoginForm onLogin={handleLogin} onSignUp={handleSignUp} />
              )
            }
          />
        </Routes>
        <Footer />
      </Router>
    </StyledThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;