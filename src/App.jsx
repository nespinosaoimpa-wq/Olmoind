import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Marquee from './components/Marquee';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminDashboard from './admin/AdminDashboard';
import Login from './components/Login';

import { useStockStore } from './store/useStockStore';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { fetchProducts } = useStockStore();

  useEffect(() => {
    fetchProducts(); // Load data from Supabase

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setIsAdminMode(true);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [isAdminMode]); // Re-run if view changes

  if (isAdminMode) {
    if (!isAuthenticated) {
      return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
          <Login onLogin={() => setIsAuthenticated(true)} />
        </div>
      );
    }
    return <AdminDashboard onBack={() => { setIsAdminMode(false); setIsAuthenticated(false); }} />;
  }

  return (
    <div className="App" style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh' }}>
      <Header />
      <main>
        <Hero />
        <Marquee text="OLMO • FUTURE • URBAN • WEAR" />
        <ProductGrid />

        {/* About / Manifesto Section - Future Urban */}
        <section className="section reveal" id="about" style={{
          padding: '200px 0',
          textAlign: 'center',
          background: 'var(--bg-deep)',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Background Gradient Mesh */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 60%)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            >
              <h2 className="font-display" style={{
                fontSize: 'clamp(40px, 8vw, 120px)',
                marginBottom: '40px',
                fontWeight: '900',
                letterSpacing: '-2px',
                color: 'var(--text-primary)',
                lineHeight: 0.9
              }}>
                FUTURE<br />IS NOW.
              </h2>
              <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--text-primary)', margin: '0 auto 40px' }}></div>
              <p style={{
                maxWidth: '600px',
                margin: '0 auto',
                color: 'var(--text-secondary)',
                letterSpacing: '2px',
                lineHeight: '1.8',
                fontSize: '14px',
                textTransform: 'uppercase',
                fontWeight: '500',
                fontFamily: 'var(--font-body)'
              }}>
                Olmo representa la evolución del streetwear en Santa Fe. <br />
                Diseño técnico. Estética oscura. <br />
                Sin concesiones.
              </p>
            </motion.div>
          </div>

          {/* Background Text Element */}
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '20vw',
            fontWeight: '900',
            fontFamily: 'var(--font-display)',
            color: 'rgba(255,255,255,0.02)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            letterSpacing: '-10px'
          }}>
            OLMOIND26
          </div>
        </section>

        <Marquee text="SANTA FE • ARGENTINA • 2026" reverse={true} />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
