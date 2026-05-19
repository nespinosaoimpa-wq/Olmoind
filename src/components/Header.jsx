import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Search, Menu, X, Home, Grid, ShoppingCart, User, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useStockStore } from '../store/useStockStore';
import { useSettingsStore } from '../store/useSettingsStore';

const Header = ({ searchQuery, setSearchQuery }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mp');
  const { cart, removeItem, clearCart, totalItems } = useCartStore();
  const { registerSale } = useStockStore();
  const { settings, fetchSettings } = useSettingsStore();

  React.useEffect(() => {
    fetchSettings();
  }, []);

  React.useEffect(() => {
    if (settings?.payments) {
      // Pick first active payment method
      const activeMethod = Object.entries(settings.payments).find(([k, v]) => v.active)?.[0];
      if (activeMethod) {
        setPaymentMethod(activeMethod);
      }
    }
  }, [settings]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to top for 'home'
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const payments = settings?.payments || {
    mp: { active: true, publicKey: '', accessToken: '' },
    transfer: { active: true, alias: 'OLMO.VENTAS.MP', cbu: '0000003100045678901234', titular: 'Olmo S.R.L.', banco: 'Banco Macro' },
    cash: { active: true, instructions: 'Retiro en showroom o coordinando contra entrega en efectivo.' },
    posnet: { active: true },
    modo: { active: false },
    gocuotas: { active: false }
  };

  const [isProcessingMP, setIsProcessingMP] = useState(false);

  // Mercado Pago: Checkout Pro API Call
  const handleMercadoPago = async () => {
    setIsProcessingMP(true);
    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total: cartTotal })
      });

      const data = await response.json();
      
      if (response.ok && data.init_point) {
        // Register the sale in the database before redirecting
        await registerSale(cart, {
          method: 'Mercado Pago',
          source: 'Tienda Online',
          status: 'Pendiente'
        });
        clearCart();
        setIsCartOpen(false);
        // Redirect the user to Mercado Pago official checkout
        window.location.href = data.init_point;
      } else {
        alert('Ups, falta vincular Mercado Pago. Contacta por WhatsApp mientras tanto.');
        setIsProcessingMP(false);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con Mercado Pago.');
      setIsProcessingMP(false);
    }
  };

  const handleCheckout = async () => {
    if (paymentMethod === 'mp') {
      await handleMercadoPago();
    } else {
      let methodLabel = '';
      let additionalInfo = '';
      
      switch (paymentMethod) {
        case 'transfer':
          methodLabel = 'Transferencia Bancaria';
          additionalInfo = `%0ADatos del Pago:%0A• CBU: ${payments.transfer?.cbu || ''}%0A• Alias: ${payments.transfer?.alias || ''}%0A• Titular: ${payments.transfer?.titular || ''}%0A• Banco: ${payments.transfer?.banco || ''}`;
          break;
        case 'cash':
          methodLabel = 'Efectivo';
          break;
        case 'modo':
          methodLabel = 'MODO';
          break;
        case 'gocuotas':
          methodLabel = 'Go Cuotas';
          break;
        default:
          methodLabel = 'WhatsApp';
      }

      const itemsList = cart.map(i => `• ${i.name} (${i.size}) x${i.quantity} = $${(i.price * i.quantity).toLocaleString()}`).join('%0A');
      const msg = `Hola! Quiero hacer un pedido:%0A${itemsList}%0A%0ATOTAL: $${cartTotal.toLocaleString()}%0A%0AMedio de Pago: ${methodLabel}${additionalInfo}`;
      const phone = settings.contact?.whatsapp || '543434559599';
      
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      
      await registerSale(cart, {
        method: methodLabel,
        source: 'Tienda Online',
        status: 'Pendiente'
      });
      
      clearCart();
      setIsCartOpen(false);
    }
  };

  const getButtonBg = () => {
    switch (paymentMethod) {
      case 'mp': return '#009ee3';
      case 'transfer': return '#10b981';
      case 'cash': return '#f59e0b';
      case 'modo': return '#ff003c';
      case 'gocuotas': return '#4ade80';
      default: return '#25d366';
    }
  };

  const getButtonText = () => {
    if (isProcessingMP) return '⌛ PROCESANDO PAGO...';
    switch (paymentMethod) {
      case 'mp': return '💳 PAGAR CON MERCADO PAGO';
      case 'transfer': return '🏦 CONFIRMAR TRANSFERENCIA';
      case 'cash': return '💵 PEDIR EN EFECTIVO';
      case 'modo': return '🔴 PAGAR CON MODO';
      case 'gocuotas': return '⚡ PAGAR CON GO CUOTAS';
      default: return '💬 PEDIR POR WHATSAPP';
    }
  };

  return (
    <>
      {/* TOP HEADER (Olmo Style) */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        background: '#ffffff', // Olmo white
        color: '#1A1A1A',
        fontFamily: "'Inter', sans-serif",
        borderBottom: '1px solid #e5e7eb'
      }}>
        {/* Main Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          maxWidth: '1400px',
          margin: '0 auto',
          gap: '24px'
        }}>
          {/* Left: Hamburger (Mobile) + Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-menu-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A' }}
            >
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <a href="/" style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '28px',
                fontWeight: '900',
                letterSpacing: '-1px',
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
                fontWeight: '500',
                color: '#1A1A1A',
                marginTop: '4px',
              }}>
                Indumentaria
              </span>
            </div>
          </div>

          {/* Middle: Search Bar (Desktop) */}
          <div className="desktop-search" style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px 12px 48px',
                fontSize: '14px',
                outline: 'none',
                color: '#1A1A1A',
              }}
            />
            <Search size={18} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280',
            }} />
          </div>

          {/* Right: Icons (Desktop) */}
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            <a href="https://wa.me/543434559599" target="_blank" rel="noreferrer" className="desktop-menu-link" style={{ color: '#1A1A1A', textDecoration: 'none', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               <span style={{ fontSize: '11px', fontWeight: '500' }}>Ayuda</span>
            </a>
            <a href="/?admin=true" className="desktop-menu-link" style={{ color: '#1A1A1A', textDecoration: 'none', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
               <User size={22} />
               <span style={{ fontSize: '11px', fontWeight: '500' }}>Mi cuenta</span>
            </a>
            <button
              onClick={() => setIsCartOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
            >
              <div style={{ position: 'relative' }}>
                  <ShoppingCart size={22} />
                  {totalItems > 0 && (
                    <span style={{
                      position: 'absolute', top: '-6px', right: '-8px',
                      background: '#1A1A1A', color: '#fff', fontSize: '9px',
                      fontWeight: '800', width: '16px', height: '16px',
                      borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', border: '1px solid #ffffff'
                    }}>
                      {totalItems}
                    </span>
                  )}
              </div>
              <span className="desktop-menu-link" style={{ fontSize: '11px', fontWeight: '500' }}>Mi carrito</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mobile-search" style={{ padding: '0 24px 16px', position: 'relative' }}>
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px 12px 40px',
              fontSize: '14px',
              outline: 'none',
              color: '#1A1A1A'
            }}
          />
          <Search size={16} style={{
            position: 'absolute',
            left: '36px',
            top: '32%',
            transform: 'translateY(-50%)',
            color: '#1A1A1A',
          }} />
        </div>

        {/* Bottom Nav Bar (Centered Links - Desktop) */}
        <div className="desktop-menu-link" style={{ borderTop: '1px solid #e5e7eb', background: '#ffffff' }}>
            <nav style={{
                display: 'flex', justifyContent: 'center', gap: '48px', padding: '14px 0',
                maxWidth: '1400px', margin: '0 auto', width: '100%'
            }}>
                <a href="#" onClick={(e) => { e.preventDefault(); scrollTo('home'); }} style={{ color: '#1A1A1A', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Inicio</a>
                <a href="#" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }} style={{ color: '#1A1A1A', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Contacto</a>
                <a href="#" onClick={(e) => { e.preventDefault(); scrollTo('shop'); }} style={{ color: '#1A1A1A', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Productos</a>
            </nav>
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
                  href="#"
                  onClick={(e) => { e.preventDefault(); scrollTo(item.id); setMobileMenuOpen(false); }}
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

      {/* BOTTOM NAVIGATION BAR (Mobile Only) */}
      <nav className="mobile-search" style={{
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
            href="#"
            onClick={(e) => { e.preventDefault(); item.action ? item.action() : scrollTo(item.id); }}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
                    <span style={{ color: '#6b7280', fontWeight: '600' }}>TOTAL</span>
                    <span style={{ fontWeight: '800', color: '#1A1A1A' }}>${cartTotal.toLocaleString()}</span>
                  </div>

                  {/* Payment method selector */}
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontFamily: "'Inter', sans-serif" }}>Método de pago</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                    {payments.mp?.active && (
                      <button
                        onClick={() => setPaymentMethod('mp')}
                        style={{
                          padding: '12px 8px', borderRadius: '8px', border: `2px solid ${paymentMethod === 'mp' ? '#009ee3' : '#e5e7eb'}`,
                          background: paymentMethod === 'mp' ? '#f0f9ff' : '#fff',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>💳</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#009ee3', fontFamily: "'Inter', sans-serif" }}>Mercado Pago</span>
                      </button>
                    )}
                    {payments.transfer?.active && (
                      <button
                        onClick={() => setPaymentMethod('transfer')}
                        style={{
                          padding: '12px 8px', borderRadius: '8px', border: `2px solid ${paymentMethod === 'transfer' ? '#10b981' : '#e5e7eb'}`,
                          background: paymentMethod === 'transfer' ? '#f0fdf4' : '#fff',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>🏦</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#10b981', fontFamily: "'Inter', sans-serif" }}>Transferencia</span>
                      </button>
                    )}
                    {payments.cash?.active && (
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        style={{
                          padding: '12px 8px', borderRadius: '8px', border: `2px solid ${paymentMethod === 'cash' ? '#f59e0b' : '#e5e7eb'}`,
                          background: paymentMethod === 'cash' ? '#fffbeb' : '#fff',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>💵</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#f59e0b', fontFamily: "'Inter', sans-serif" }}>Efectivo</span>
                      </button>
                    )}
                    {payments.modo?.active && (
                      <button
                        onClick={() => setPaymentMethod('modo')}
                        style={{
                          padding: '12px 8px', borderRadius: '8px', border: `2px solid ${paymentMethod === 'modo' ? '#ff003c' : '#e5e7eb'}`,
                          background: paymentMethod === 'modo' ? '#fff1f2' : '#fff',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>🔴</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#ff003c', fontFamily: "'Inter', sans-serif" }}>MODO</span>
                      </button>
                    )}
                    {payments.gocuotas?.active && (
                      <button
                        onClick={() => setPaymentMethod('gocuotas')}
                        style={{
                          padding: '12px 8px', borderRadius: '8px', border: `2px solid ${paymentMethod === 'gocuotas' ? '#4ade80' : '#e5e7eb'}`,
                          background: paymentMethod === 'gocuotas' ? '#f0fdf4' : '#fff',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>⚡</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#15803d', fontFamily: "'Inter', sans-serif" }}>Go Cuotas</span>
                      </button>
                    )}
                  </div>

                  {paymentMethod === 'mp' && (
                    <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'Inter', sans-serif", marginBottom: '12px', textAlign: 'center' }}>
                      Te vamos a contactar por WhatsApp para enviarte el link de pago de Mercado Pago o coordinarlo.
                    </p>
                  )}
                  {paymentMethod === 'transfer' && (
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px', fontSize: '11px', color: '#334155' }}>
                      <p style={{ fontWeight: '700', margin: '0 0 6px 0', textTransform: 'uppercase', fontSize: '10px', color: '#10b981' }}>Datos bancarios para transferencia:</p>
                      <p style={{ margin: '2px 0' }}><strong>Banco:</strong> {payments.transfer?.banco || 'Banco Macro'}</p>
                      <p style={{ margin: '2px 0' }}><strong>Titular:</strong> {payments.transfer?.titular || 'Olmo S.R.L.'}</p>
                      <p style={{ margin: '2px 0' }}><strong>CBU:</strong> {payments.transfer?.cbu || '0000003100045678901234'}</p>
                      <p style={{ margin: '2px 0' }}><strong>Alias:</strong> {payments.transfer?.alias || 'OLMO.VENTAS.MP'}</p>
                      <p style={{ marginTop: '6px', fontSize: '9.5px', color: '#64748b', fontStyle: 'italic' }}>Enviá el comprobante de transferencia al finalizar por WhatsApp.</p>
                    </div>
                  )}
                  {paymentMethod === 'cash' && (
                    <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'Inter', sans-serif", marginBottom: '12px', textAlign: 'center' }}>
                      {payments.cash?.instructions || 'Retiro en showroom o coordinando contra entrega en efectivo.'}
                    </p>
                  )}
                  {paymentMethod === 'modo' && (
                    <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'Inter', sans-serif", marginBottom: '12px', textAlign: 'center' }}>
                      Pagar de forma rápida y segura con tu billetera M Modo. Te enviaremos el link/QR por WhatsApp.
                    </p>
                  )}
                  {paymentMethod === 'gocuotas' && (
                    <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'Inter', sans-serif", marginBottom: '12px', textAlign: 'center' }}>
                      Pagá en cuotas con tu tarjeta de débito a través de Go Cuotas.
                    </p>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessingMP}
                    style={{
                      width: '100%',
                      background: getButtonBg(),
                      color: '#ffffff',
                      border: 'none',
                      padding: '16px',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      cursor: isProcessingMP ? 'not-allowed' : 'pointer',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: isProcessingMP ? 0.7 : 1
                    }}
                  >
                    {getButtonText()}
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
