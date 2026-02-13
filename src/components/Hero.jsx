import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section
            id="home"
            style={{
                height: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#e5e5e5'
            }}>
            {/* Background Image / Texture / Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                backgroundColor: '#e5e5e5'
            }}>
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.15,
                        filter: 'grayscale(100%) contrast(1.1)'
                    }}
                >
                    {/* 
                        PLACEHOLDER VIDEO: Urban/Streetwear Vibe.
                        To use your own video:
                        1. Place your 'banner.mp4' file in the 'public' folder.
                        2. Change the src below to: src="/banner.mp4"
                    */}
                    <source src="https://videos.pexels.com/video-files/3042918/3042918-hd_1920_1080_30fps.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, rgba(229,229,229,0.8) 100%)',
                    zIndex: 1
                }}></div>
                {/* Subtle Geometric Element for "Logo" feel */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80vw',
                    height: '80vw',
                    maxWidth: '800px',
                    maxHeight: '800px',
                    border: '1px solid rgba(0,0,0,0.03)',
                    borderRadius: '50%',
                    zIndex: 0
                }}></div>
            </div>

            {/* Central Logo Group */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                >
                    <h1 className="font-display" style={{
                        fontSize: 'clamp(100px, 18vw, 260px)',
                        fontWeight: '900',
                        letterSpacing: '-0.04em',
                        lineHeight: 0.8,
                        marginBottom: '8px',
                        color: '#000',
                    }}>
                        OLMO
                    </h1>
                    <p style={{
                        fontSize: 'clamp(14px, 2.5vw, 22px)',
                        letterSpacing: '1.2em',
                        color: '#000',
                        textTransform: 'uppercase',
                        marginLeft: '1.2em',
                        fontWeight: '400'
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
                        color: '#333',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                    }}>
                        ROPA <span style={{ color: '#000' }}>URBANA</span>
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 1 }}
                    style={{ marginTop: '60px' }}
                >
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <a
                            href="#shop"
                            className="btn-primary"
                            style={{
                                padding: '22px 60px',
                                fontSize: '13px',
                                backgroundColor: '#000',
                                color: '#fff',
                                border: 'none',
                                fontWeight: '900',
                                letterSpacing: '3px',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            EXPLORAR DROP
                        </a>
                        <a
                            href="https://www.instagram.com/olmo.ind/"
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary"
                            style={{
                                padding: '22px 30px',
                                fontSize: '13px',
                                backgroundColor: 'transparent',
                                color: '#000',
                                border: '2px solid #000',
                                fontWeight: '900',
                                letterSpacing: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                textDecoration: 'none'
                            }}
                        >
                            INSTAGRAM
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
                <div style={{ height: '60px', width: '1px', backgroundColor: 'rgba(0,0,0,0.2)' }}></div>
                <span style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)' }}>
                    Explorar
                </span>
            </div>

            {/* Subtle side text for balance */}
            <div style={{
                position: 'absolute',
                left: '40px',
                top: '50%',
                transform: 'translateY(-50%) rotate(-90deg)',
                transformOrigin: 'left center',
                pointerEvents: 'none'
            }}>
                <span style={{ fontSize: '10px', letterSpacing: '5px', color: 'rgba(0,0,0,0.05)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    ROPA URBANA MASCULINA
                </span>
            </div>
        </section>
    );
};

export default Hero;
