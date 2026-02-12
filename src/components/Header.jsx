import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Search, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useStockStore } from '../store/useStockStore';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, removeItem, clearCart } = useCartStore();
  const { registerSale } = useStockStore();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const menuItems = [
    { name: 'HOME', path: '/' },
    { name: 'SHOP', path: '/shop' },
    { name: 'NEW ARRIVALS', path: '/new' },
    { name: 'SALE', path: '/sale' },
    { name: 'CONTACT', path: '/contact' },
  ];

  const menuVariants = {
    closed: {
      rotateY: -90,
      originX: 'left',
      transition: { duration: 0.5, ease: 'easeInOut' }
    },
    open: {
      rotateY: 0,
      originX: 'left',
      transition: { duration: 0.5, ease: 'easeInOut' }
    }
  };

  return (
    <header className="glass" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, height: '80px', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => setIsOpen(!isOpen)} style={{ display: 'flex', alignItems: 'center' }}>
            <Menu size={24} color="var(--accent)" />
          </button>
          <div style={{ fontWeight: '800', fontSize: '24px', letterSpacing: '4px', color: 'var(--accent)' }}>
            OLMO
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Search size={20} color="var(--accent)" />
          <User size={20} color="var(--accent)" />
          <button onClick={() => setIsCartOpen(true)} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={20} color="var(--accent)" />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent)', color: 'black', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {/* 3D Menu */}
        {isOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1001, perspective: '2000px' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.8)',
                zIndex: 999
              }}
            />

            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '350px',
                height: '100vh',
                background: 'var(--bg-secondary)',
                zIndex: 1001,
                padding: '60px 40px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '20px 0 80px rgba(0,0,0,0.5)',
                borderRight: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <button onClick={() => setIsOpen(false)} style={{ alignSelf: 'flex-end', marginBottom: '40px' }}>
                <X size={24} color="var(--accent)" />
              </button>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {menuItems.map((item) => (
                  <motion.a
                    key={item.name}
                    href={item.path}
                    whileHover={{ x: 10, color: '#fff' }}
                    style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      letterSpacing: '2px',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '10px'
                    }}
                  >
                    {item.name}
                  </motion.a>
                ))}
              </nav>

              <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                © 2026 OLMO INDUMENTARIA
              </div>
            </motion.div>
          </div>
        )}

        {/* Shopping Cart Drawer */}
        {isCartOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000 }}>
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
                zIndex: 999
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
                width: '400px',
                height: '100vh',
                background: 'var(--bg-secondary)',
                zIndex: 1001,
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-20px 0 80px rgba(0,0,0,0.5)',
                borderLeft: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px', color: '#fff' }}>CARRITO</h2>
                <button onClick={() => setIsCartOpen(false)}><X size={24} color="#fff" /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {cart.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>Tu carrito está vacío.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id + item.name} style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
                      <img src={item.image} alt={item.name} style={{ width: '80px', height: '100px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>{item.name}</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>${item.price.toLocaleString()} x {item.quantity}</p>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{ color: '#ff4444', fontSize: '10px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <Trash2 size={12} /> ELIMINAR
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid #333', paddingTop: '20px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>TOTAL:</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>${cartTotal.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => {
                      registerSale(cart);
                      clearCart();
                      setIsCartOpen(false);
                      alert('¡VENTA REGISTRADA CON ÉXITO!');
                    }}
                    style={{ width: '100%', padding: '20px', background: 'var(--accent)', color: '#fff', fontWeight: '900', letterSpacing: '2px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    FINALIZAR COMPRA
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
