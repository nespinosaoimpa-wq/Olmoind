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
                height: '80vh',
                minHeight: '600px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#1A1A1A'
            }}
        >
            {/* Background Image */}
            <div style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                backgroundImage: 'url("https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                zIndex: 0,
            }} />

            {/* Dark Overlay for readability */}
            <div style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
                zIndex: 1,
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', width: '100%', maxWidth: '800px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.8 }}
                    style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        border: '1px solid rgba(255,255,255,0.4)',
                        borderRadius: '9999px',
                        marginBottom: '24px',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <span style={{
                        fontSize: '10px',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: '600',
                    }}>
                        {subtitle}
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                    style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 'clamp(4rem, 15vw, 10rem)',
                        fontWeight: '900',
                        color: '#ffffff',
                        lineHeight: '0.9',
                        letterSpacing: '-2px',
                        textTransform: 'uppercase',
                        marginBottom: '24px',
                        textShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: '400',
                        marginBottom: '48px',
                        maxWidth: '500px',
                        margin: '0 auto 48px'
                    }}
                >
                    Indumentaria masculina de diseño. Envíos a todo el país desde Santa Fe.
                </motion.p>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}
                    style={{
                        padding: '16px 48px',
                        background: '#ffffff',
                        color: '#1A1A1A',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                    }}
                >
                    {cta}
                </motion.button>
            </div>
        </section>
    );
};

export default Hero;
