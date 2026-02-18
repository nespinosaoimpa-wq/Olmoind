import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Search, Menu, X, Home, Grid, ShoppingCart, User, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useStockStore } from '../store/useStockStore';

const Header = ({ searchQuery, setSearchQuery }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, removeItem, clearCart, totalItems } = useCartStore();
  const { registerSale } = useStockStore();

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* TOP HEADER */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
      }}>
        {/* Top Row: Menu | Logo | Cart */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px 8px',
        }}>
          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A', padding: '4px' }}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <a href="/" style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '1.5rem',
              fontWeight: '800',
              letterSpacing: '-2px',
              color: '#1A1A1A',
              textDecoration: 'none',
              lineHeight: '1',
            }}>
              OLMO
            </a>
            <span style={{
              fontSize: '8px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              fontWeight: '300',
              color: '#1A1A1A',
              marginTop: '2px',
              fontFamily: "'Inter', sans-serif",
            }}>
              Indumentaria
            </span>
          </div>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A', padding: '4px', position: 'relative' }}
          >
            <ShoppingBag size={24} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#1A1A1A',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '900',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 24px 12px', position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
          }} />
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '9999px',
              padding: '10px 16px 10px 40px',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              outline: 'none',
              color: '#1A1A1A',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </header>

      {/* MOBILE FULL-SCREEN MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '80%',
              maxWidth: '320px',
              height: '100vh',
              background: '#ffffff',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              padding: '40px 32px',
              boxShadow: '4px 0 30px rgba(0,0,0,0.15)',
            }}
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-end', marginBottom: '40px', color: '#1A1A1A' }}
            >
              <X size={24} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {[
                { label: 'Inicio', id: 'home' },
                { label: 'Productos', id: 'shop' },
                { label: 'Contacto', id: 'contact' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={`#${item.id}`}
                  onClick={() => { scrollTo(item.id); setMobileMenuOpen(false); }}
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    letterSpacing: '-1px',
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACKDROP for menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 1999,
            }}
          />
        )}
      </AnimatePresence>

      {/* BOTTOM NAVIGATION BAR */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid #e5e7eb',
        padding: '12px 24px 16px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        {[
          { icon: <Home size={22} />, label: 'Inicio', id: 'home' },
          { icon: <Grid size={22} />, label: 'Productos', id: 'shop' },
          { icon: <ShoppingCart size={22} />, label: 'Carrito', action: () => setIsCartOpen(true) },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href || `#${item.id}`}
            onClick={item.action ? (e) => { e.preventDefault(); item.action(); } : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: '#1A1A1A',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            {item.icon}
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: "'Inter', sans-serif",
            }}>
              {item.label}
            </span>
          </a>
        ))}
      </nav>

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 2999,
                backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0, right: 0,
                width: '90%', maxWidth: '420px',
                height: '100vh',
                background: '#ffffff',
                zIndex: 3000,
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#1A1A1A' }}>
                  CARRITO ({totalItems})
                </h2>
                <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A' }}>
                  <X size={22} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cart.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9ca3af', gap: '16px' }}>
                    <ShoppingBag size={40} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '600' }}>Tu carrito está vacío</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id + item.size} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                      <div style={{ width: '72px', height: '90px', background: '#f3f4f6', overflow: 'hidden', borderRadius: '4px', flexShrink: 0 }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Inter', sans-serif", marginBottom: '4px' }}>{item.name}</h4>
                          <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'Inter', sans-serif" }}>TALLE: {item.size} | CANT: {item.quantity}</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Inter', sans-serif" }}>${(item.price * item.quantity).toLocaleString()}</span>
                          <button onClick={() => removeItem(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700' }}>
                            <Trash2 size={14} /> QUITAR
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
                    <span style={{ color: '#6b7280', fontWeight: '600' }}>TOTAL</span>
                    <span style={{ fontWeight: '800', color: '#1A1A1A' }}>${cartTotal.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => { registerSale(cart); clearCart(); setIsCartOpen(false); }}
                    style={{
                      width: '100%',
                      background: '#1A1A1A',
                      color: '#ffffff',
                      border: 'none',
                      padding: '16px',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    FINALIZAR COMPRA
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
