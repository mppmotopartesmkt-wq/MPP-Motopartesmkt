import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { syncLocalProductsToSupabase } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');

  // Auto-sync any local products trapped in this browser on mount
  useEffect(() => {
    syncLocalProductsToSupabase().catch((err) => {
      console.warn('Auto-sync on load:', err);
    });
  }, []);

  // Listen to hash changes (#admin or #store)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.hash === '#store' || window.location.hash === '') {
        setCurrentView('store');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = 'admin';
    setCurrentView('admin');
  };

  const navigateToStore = () => {
    window.location.hash = '';
    setCurrentView('store');
  };

  return (
    <AuthProvider>
      <CartProvider>
        {currentView === 'admin' ? (
          <AdminDashboard onBackToStore={navigateToStore} />
        ) : (
          <Home onNavigateToAdmin={navigateToAdmin} />
        )}
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
