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

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setIsAdminMode(true);
    }
  }, []);

  if (isAdminMode) {
    if (!isAuthenticated) {
      return <Login onLogin={() => setIsAuthenticated(true)} />;
    }
    return <AdminDashboard onBack={() => { setIsAdminMode(false); setIsAuthenticated(false); }} />;
  }

  return (
    <div className="App" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Header />
      <main>
        <Hero />
        <Marquee text="OLMO • STREETWEAR • RAW • IDENTITY" />
        <ProductGrid />
        <Marquee text="EDICIÓN URBANA • SANTA FE • 2026" reverse={true} />

        {/* About / Vibe Section - Raw Urban */}
        <section style={{
          padding: '200px 0',
          textAlign: 'center',
          background: 'var(--bg-primary)',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
            >
              <h2 className="font-display" style={{
                fontSize: '9vw',
                marginBottom: '40px',
                fontWeight: '900',
                letterSpacing: '-3px',
                color: '#fff'
              }}>
                RAW IDENTITY.
              </h2>
              <div style={{ width: '80px', height: '4px', backgroundColor: 'var(--accent)', margin: '0 auto 40px' }}></div>
              <p style={{
                maxWidth: '750px',
                margin: '0 auto',
                color: 'var(--text-secondary)',
                letterSpacing: '3px',
                lineHeight: '1.8',
                fontSize: '15px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                Olmo no es solo ropa. Es una declaración de identidad urbana cruda. <br />
                Forjado en el asfalto santafesino. <br />
                Calidad sin concesiones, actitud real.
              </p>
            </motion.div>
          </div>

          {/* Subtle background element - Identity Stamp */}
          <div style={{
            position: 'absolute',
            bottom: '-5%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '18vw',
            fontWeight: '900',
            color: 'var(--accent)',
            opacity: 0.05,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            letterSpacing: '-10px'
          }}>
            RAW OLMO 26
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
