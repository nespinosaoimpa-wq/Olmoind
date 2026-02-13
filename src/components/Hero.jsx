import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Hero = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const yModel = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section
            ref={ref}
            className="section"
            id="home"
            style={{
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}
        >
            {/* BACKGROUND TEXTURE - Concrete/Noise could be added here */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)',
                zIndex: 0
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <motion.div style={{ y: yText, opacity: opacityText }}>
                    <motion.h4
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 1 }}
                        style={{
                            fontFamily: 'var(--font-body)',
                            color: 'var(--text-secondary)',
                            letterSpacing: '8px',
                            fontSize: '14px',
                            marginBottom: '20px',
                            fontWeight: '600'
                        }}
                    >
                        EST. 2026 // SANTA FE
                    </motion.h4>

                    {/* MASSIVE BRAND LOGO */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                        className="font-display"
                        style={{
                            fontSize: 'clamp(3rem, 10vw, 8rem)', // Slightly smaller to fit full word
                            lineHeight: '0.85',
                            fontWeight: '900',
                            color: 'var(--text-primary)',
                            marginBottom: '40px',
                            letterSpacing: '-2px',
                            textShadow: '0 0 30px rgba(0,0,0,0.1)'
                        }}
                    >
                        OLMO<br />INDUMENTARIA
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}
                    >
                        <button
                            className="btn-primary"
                            style={{ background: 'var(--text-primary)', color: '#ffffff' }} // White text
                            onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}
                        >
                            VER COLECCIÓN
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* SCROLL INDICATOR */}
            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    x: '-50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    opacity: opacityText
                }}
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-display)', letterSpacing: '2px', color: 'var(--text-secondary)' }}>SCROLL</span>
                <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--text-secondary), transparent)' }} />
            </motion.div>
        </section>
    );
};

export default Hero;
