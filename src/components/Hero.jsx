import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section
            id="home"
            className="hero-section"
        >
            {/* Central Logo Group */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                >
                    <h1 className="hero-title font-display">
                        OLMO
                    </h1>
                    <p style={{
                        fontSize: 'clamp(14px, 2.5vw, 22px)',
                        letterSpacing: '1.2em',
                        color: 'var(--white)',
                        textTransform: 'uppercase',
                        marginLeft: '1.2em',
                        fontWeight: '400',
                        marginTop: '20px'
                    }}>
                        INDUMENTARIA
                    </p>
                </motion.div>

                {/* Slogan - Raw and Bold */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1.2 }}
                    style={{ marginTop: '70px' }}
                >
                    <h2 style={{
                        fontSize: '12px',
                        letterSpacing: '10px',
                        color: '#aaa',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                    }}>
                        ROPA <span style={{ color: 'var(--white)' }}>URBANA</span>
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 1 }}
                    style={{ marginTop: '60px' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <a
                            href="#shop"
                            className="btn-buy"
                        >
                            EXPLORAR DROP
                        </a>
                        <a
                            href="https://www.instagram.com/olmo.ind/"
                            target="_blank"
                            rel="noreferrer"
                            className="instagram-link"
                        >
                            @OLMO.IND
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Vertical Badge / Scroll Indicator */}
            <div style={{
                position: 'absolute',
                bottom: '5vh',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                zIndex: 5
            }}>
                <div style={{ height: '60px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                <span style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                    Explorar
                </span>
            </div>
        </section>
    );
};

export default Hero;
