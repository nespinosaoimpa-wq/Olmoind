import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import AdminDashboard from './admin/AdminDashboard';
import Login from './components/Login';

import { useStockStore } from './store/useStockStore';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { fetchProducts } = useStockStore();

  useEffect(() => {
    fetchProducts();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setIsAdminMode(true);
    }
  }, []);

  if (isAdminMode) {
    if (!isAuthenticated) {
      return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
          <Login onLogin={() => setIsAuthenticated(true)} />
        </div>
      );
    }
    return <AdminDashboard onBack={() => { setIsAdminMode(false); setIsAuthenticated(false); }} />;
  }

  return (
    <div style={{ backgroundColor: '#F9F9F9', minHeight: '100vh' }}>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main style={{ paddingTop: '100px' }}>
        <Hero />
        <ProductGrid searchQuery={searchQuery} />
      </main>
    </div>
  );
}

export default App;
