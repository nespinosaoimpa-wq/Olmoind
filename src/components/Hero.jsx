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
                justifyContent: 'center'
            }}
        >
            {/* BACKGROUND ELEMENTS - NEON GHOSTS */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: '30vw',
                height: '30vw',
                background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
                filter: 'blur(40px)',
                zIndex: 0
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    height: '100%',
                    alignItems: 'center'
                }}>

                    {/* LEFT CLUSTER - TEXT */}
                    <motion.div style={{ y: yText, opacity: opacityText, zIndex: 2 }}>
                        <motion.h4
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 1 }}
                            style={{
                                fontFamily: 'var(--font-body)',
                                color: 'var(--text-secondary)',
                                letterSpacing: '4px',
                                fontSize: '12px',
                                marginBottom: '20px',
                                fontWeight: '600'
                            }}
                        >
                            EST. 2026 // SANTA FE
                        </motion.h4>
                        <motion.h1
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                            className="font-display"
                            style={{
                                fontSize: 'clamp(3rem, 8vw, 8rem)',
                                lineHeight: '0.9',
                                fontWeight: '900',
                                color: 'var(--text-primary)',
                                marginBottom: '30px',
                                marginLeft: '-5px' // Optical alignment
                            }}
                        >
                            FUTURE<br />URBAN<br />WEAR.
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            style={{ display: 'flex', gap: '20px' }}
                        >
                            <button className="btn-primary">EXPLORE DROPS</button>
                            <button style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                fontFamily: 'var(--font-display)',
                                fontSize: '10px',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                textUnderlineOffset: '5px'
                            }}>
                                VIEW LOOKBOOK
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT CLUSTER - 3D MODEL */}
                    <motion.div
                        style={{ y: yModel, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                    >
                        {/* CIRCLE BEHIND MODEL */}
                        <div style={{
                            position: 'absolute',
                            width: '40vw',
                            height: '40vw',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '50%',
                            zIndex: -1,
                            opacity: 0.5
                        }} />

                        {/* MODEL */}
                        <model-viewer
                            src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
                            alt="A 3D model of an astronaut"
                            auto-rotate
                            camera-controls
                            shadow-intensity="1"
                            exposure="0.6"
                            style={{ width: '100%', height: '80vh' }}
                        // Customizing model-viewer CSS vars for transparency if supported or via canvas manipulation
                        >
                        </model-viewer>
                    </motion.div>
                </div>
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

            {/* CSS Helper for Mobile Layout */}
            <style>{`
                @media (max-width: 768px) {
                    .container > div { grid-template-columns: 1fr !important; }
                    h1 { font-size: 15vw !important; }
                    model-viewer { height: 50vh !important; }
                }
            `}</style>
        </section>
    );
};

export default Hero;
