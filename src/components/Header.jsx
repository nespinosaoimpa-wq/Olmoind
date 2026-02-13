import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Menu, X, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useStockStore } from '../store/useStockStore';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, removeItem, clearCart, totalItems } = useCartStore();
  const { registerSale } = useStockStore();

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'HOME', path: '#home' },
    { name: 'SHOP', path: '#shop' },
    { name: 'DROPS', path: '#shop' },
    { name: 'VISUALS', path: '#about' },
  ];

  return (
    <>
      <header
        className="glass-card"
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '95%',
          maxWidth: '1200px',
          padding: '15px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          borderRadius: '2px', // Slight rounded for modern feel, or keep 0 for brutalist
          border: isScrolled ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)',
          background: isScrolled ? 'rgba(5,5,5,0.9)' : 'rgba(20,20,20,0.4)',
          backdropFilter: 'blur(15px)',
          transition: 'all 0.4s ease'
        }}
      >
        {/* LOGO - CYBER/FUTURE */}
        <div style={{ zIndex: 1001 }}>
          <a href="/" style={{
            fontSize: '1.5rem',
            fontWeight: '900',
            letterSpacing: '4px',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontFamily: 'var(--font-display)',
            textShadow: '0 0 10px rgba(0,0,0,0.1)'
          }}>
            OLMO<span style={{ fontSize: '12px', color: 'var(--accent-dim)', marginLeft: '5px' }}>IND.</span>
          </a>
        </div>

        {/* DESKTOP MENU - FLOATING & GLOW */}
        <nav className="desktop-nav" style={{ display: 'none' }}>
          <ul style={{ display: 'flex', gap: '40px', listStyle: 'none' }}>
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.path}
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '11px',
                    fontWeight: '600',
                    letterSpacing: '2px',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--text-primary)';
                    e.target.style.textShadow = '0 0 8px rgba(255,255,255,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-secondary)';
                    e.target.style.textShadow = 'none';
                  }}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ICONS & ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px', zIndex: 1001 }}>
          <button style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => window.location.href = '/admin?admin=true'}>
            <User size={18} />
          </button>

          <button
            style={{ color: 'var(--text-primary)', position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--text-primary)',
                color: '#000',
                fontSize: '9px',
                fontWeight: '900',
                width: '14px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}>
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            style={{ color: 'var(--text-primary)', background: 'none', border: 'none' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* CSS Helper for Responsive Display */}
      <style>{`
        @media (min-width: 768px) {
            .desktop-nav { display: block !important; }
            .mobile-toggle { display: none !important; }
        }
        @media (max-width: 767px) {
            .desktop-nav { display: none !important; }
            .mobile-toggle { display: block !important; }
        }
      `}</style>

      {/* MOBILE OVERLAY MENU - FULL SCREEN CYBER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100vh',
              background: 'var(--bg-deep)',
              zIndex: 900,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '30px',
              paddingTop: '60px' // Clear header
            }}
          >
            {/* Background Mesh/Gradient for Mobile Menu */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, transparent 70%)', zIndex: -1 }} />

            {menuItems.map((item, i) => (
              <motion.a
                key={item.name}
                href={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.1) }}
                style={{
                  fontSize: '3rem',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontWeight: '900',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  WebkitTextStroke: '1px rgba(255,255,255,0.2)'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Drawer - Modern */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.8)',
                zIndex: 1999,
                backdropFilter: 'blur(5px)'
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '90%',
                maxWidth: '450px',
                height: '100vh',
                background: '#0a0a0a',
                zIndex: 2000,
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid var(--border-subtle)',
                boxShadow: '-20px 0 50px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '2px', color: 'var(--text-primary)' }}>BAG ({totalItems})</h2>
                <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}><X size={24} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {cart.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.5 }}>
                    <ShoppingBag size={40} style={{ marginBottom: '20px' }} />
                    <p style={{ fontFamily: 'var(--font-body)', letterSpacing: '1px' }}>YOUR BAG IS EMPTY</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id + item.name + item.size} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
                      <div style={{ width: '80px', height: '100px', background: '#1a1a1a', overflow: 'hidden' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '5px' }}>{item.name}</h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>SIZE: {item.size} | QTY: {item.quantity}</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>${(item.price * item.quantity).toLocaleString()}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700' }}
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontFamily: 'var(--font-display)', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>TOTAL</span>
                    <span style={{ fontWeight: '900', color: 'var(--text-primary)' }}>${cartTotal.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => {
                      registerSale(cart);
                      clearCart();
                      setIsCartOpen(false);
                      // In a real app, this would redirect to checkout
                    }}
                    className="btn-primary"
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    CHECKOUT
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
