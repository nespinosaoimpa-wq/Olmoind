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
    const subtitle = hero.subtitle || 'INDUMENTARIA';
    const cta = hero.cta || 'Ver Colección';
    const bgColor = hero.bgColor || null;

    return (
        <section
            id="home"
            style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                textAlign: 'center',
                background: bgColor || 'linear-gradient(180deg, #F9F9F9 0%, #E2E2E2 100%)',
                padding: '120px 24px 60px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Subtle noise texture */}
            <div style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                opacity: 0.3,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                zIndex: 0,
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.8 }}
                    style={{
                        fontSize: '11px',
                        letterSpacing: '0.4em',
                        textTransform: 'uppercase',
                        color: '#6b7280',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: '600',
                        marginBottom: '16px',
                    }}
                >
                    EST. 2025 // SANTA FE
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                    style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 'clamp(5rem, 22vw, 14rem)',
                        fontWeight: '800',
                        color: '#1A1A1A',
                        lineHeight: '0.85',
                        letterSpacing: '-4px',
                        textTransform: 'uppercase',
                        marginBottom: '12px',
                    }}
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 'clamp(0.7rem, 2vw, 1.1rem)',
                        letterSpacing: '0.5em',
                        textTransform: 'uppercase',
                        color: '#1A1A1A',
                        fontWeight: '300',
                        marginBottom: '48px',
                    }}
                >
                    {subtitle}
                </motion.p>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}
                    style={{
                        padding: '14px 48px',
                        background: '#1A1A1A',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3f3f3f'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1A1A1A'}
                >
                    {cta}
                </motion.button>
            </div>
        </section>
    );
};

export default Hero;
