import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import AdminDashboard from './admin/AdminDashboard';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';

import { useStockStore } from './store/useStockStore';

import { supabase } from './supabaseClient';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [session, setSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { fetchProducts } = useStockStore();

  useEffect(() => {
    fetchProducts();

    // Initialize session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setIsAdminMode(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  if (isAdminMode) {
    if (!session) {
      return (
        <ErrorBoundary>
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <Login onLogin={() => { }} />
          </div>
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary>
        <AdminDashboard onBack={() => { setIsAdminMode(false); }} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ backgroundColor: '#F9F9F9', minHeight: '100vh' }}>
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main style={{ paddingTop: '100px' }}>
          <Hero />
          <ProductGrid searchQuery={searchQuery} />
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
