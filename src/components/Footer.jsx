import React from 'react';
import { Instagram, Facebook, Truck, CreditCard } from 'lucide-react';

const Footer = () => {
    return (
        <footer
            id="contact"
            style={{
                backgroundColor: 'var(--bg-dark)',
                color: 'var(--text-primary)',
                padding: '100px 40px 40px',
                borderTop: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-body)',
                position: 'relative'
            }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '80px',
                marginBottom: '100px'
            }}>
                {/* Brand & Social */}
                <div>
                    <h3 className="font-display" style={{ fontSize: '32px', marginBottom: '25px', fontWeight: '900', letterSpacing: '4px' }}>OLMO</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '2', marginBottom: '40px', maxWidth: '350px', letterSpacing: '1px' }}>
                        INDUMENTARIA CON IDENTIDAD URBANA CRUDA. <br />
                        DISEÑADO PARA EL ASFALTO. <br />
                        SANTA FE, ARGENTINA.
                    </p>
                    <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                        <a href="https://www.instagram.com/olmo.ind/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)' }}><Instagram size={22} /></a>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)' }}><Facebook size={22} /></a>
                        <a href="https://wa.me/543424625174" target="_blank" rel="noreferrer">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                alt="WhatsApp"
                                style={{ width: '24px', height: '24px' }}
                            />
                        </a>
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <h4 style={{ fontSize: '12px', fontWeight: '900', marginBottom: '30px', letterSpacing: '3px', color: 'var(--text-primary)' }}>EXPLORAR</h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <li><a href="/shop" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>SHOP</a></li>
                        <li><a href="/shop" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>NUEVOS ADELANTOS</a></li>
                        <li><a href="/shop" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>SALE</a></li>
                        <li><a href="/?admin=true" style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '15px', display: 'block', fontWeight: '800', textDecoration: 'none' }}>ADMIN PANEL</a></li>
                    </ul>
                </div>

                {/* Contact & Help */}
                <div>
                    <h4 style={{ fontSize: '12px', fontWeight: '900', marginBottom: '30px', letterSpacing: '3px', color: 'var(--text-primary)' }}>CONTACTO</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>
                        <p>SANTA FE, ARGENTINA</p>
                        <p>WHATSAPP: 342 462-5174</p>
                        <p>INFO@OLMOIND.COM</p>
                    </div>
                </div>

                {/* Methods Badge */}
                <div>
                    <h4 style={{ fontSize: '12px', fontWeight: '900', marginBottom: '30px', letterSpacing: '3px', color: 'var(--text-primary)' }}>SISTEMA</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-deep)', padding: '12px 20px', border: '1px solid var(--border-subtle)' }}>
                            <CreditCard size={18} color="var(--text-primary)" />
                            <span style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: '800', letterSpacing: '1px' }}>PAGO SEGURO</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-deep)', padding: '12px 20px', border: '1px solid var(--border-subtle)' }}>
                            <Truck size={18} color="var(--text-primary)" />
                            <span style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: '800', letterSpacing: '1px' }}>ENVÍO FEDERAL</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '800', letterSpacing: '2px' }}>
                    © 2026 OLMO INDUMENTARIA • FUTURE URBAN • v2.0
                </p>
                <div style={{ display: 'flex', gap: '30px' }}>
                    <a href="#" style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '600', textDecoration: 'none' }}>PRIVACIDAD</a>
                    <a href="#" style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '600', textDecoration: 'none' }}>TÉRMINOS</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
