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
                flexDirection: 'column',
                background: 'radial-gradient(circle at center, #f5f5f5 0%, #d4d4d4 100%)' // Silver Gradient matching the uploaded branding
            }}
        >
            {/* BACKGROUND TEXTURE - Subtle Noise for realism */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.4,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                zIndex: 0,
                mixBlendMode: 'overlay'
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
                            fontSize: 'clamp(4rem, 18vw, 15rem)', // Adjusted min size for mobile
                            lineHeight: '0.8',
                            fontWeight: '900',
                            color: '#000000', // Pure Black on Silver
                            marginBottom: '10px',
                            letterSpacing: '-5px',
                            textTransform: 'uppercase'
                        }}
                    >
                        OLMO
                    </motion.h1>

                    {/* SUBTITLE MATCHING IMAGE */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 1 }}
                        style={{
                            fontSize: 'clamp(0.8rem, 2vw, 1.5rem)',
                            fontFamily: 'var(--font-body)',
                            color: '#000000', // Black on Silver
                            letterSpacing: '12px', // Wide spacing like the image
                            fontWeight: '600',
                            marginBottom: '60px',
                            marginLeft: '15px' // Optical alignment
                        }}
                    >
                        INDUMENTARIA
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}
                    >
                        <button
                            className="btn-primary"
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
