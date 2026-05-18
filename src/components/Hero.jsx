import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';

const Hero = () => {
    const { settings, fetchSettings, subscribeToSettings } = useSettingsStore();

    useEffect(() => {
        fetchSettings();
        const unsubscribe = subscribeToSettings();
        return unsubscribe;
    }, []);

    const hero = settings.hero || {};
    const title = hero.title || 'OLMO';
    const subtitle = hero.subtitle || 'NUEVA COLECCIÓN';
    const cta = hero.cta || 'Ver Colección';

    return (
        <section
            id="home"
            style={{
                height: '50vh',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#ffffff', // Clean white background
                borderBottom: '1px solid #f3f4f6'
            }}
        >
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', width: '100%', maxWidth: '800px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    style={{
                        display: 'inline-block',
                        marginBottom: '20px',
                    }}
                >
                    <span style={{
                        fontSize: '11px',
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        color: '#6b7280',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: '700',
                    }}>
                        {subtitle}
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontWeight: '800',
                        color: '#1a1a1a',
                        lineHeight: '1.1',
                        letterSpacing: '-1px',
                        textTransform: 'uppercase',
                        marginBottom: '20px',
                    }}
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                        color: '#6b7280',
                        fontWeight: '400',
                        marginBottom: '40px',
                        maxWidth: '500px',
                        margin: '0 auto 40px',
                        lineHeight: '1.6'
                    }}
                >
                    Indumentaria masculina de diseño. Envíos a todo el país desde Santa Fe.
                </motion.p>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}
                    style={{
                        padding: '16px 40px',
                        background: '#1a1a1a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                >
                    {cta}
                </motion.button>
            </div>
        </section>
    );
};

export default Hero;
