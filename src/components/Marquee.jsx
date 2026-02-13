import React from 'react';
import { motion } from 'framer-motion';

const Marquee = ({ text, reverse = false }) => {
    return (
        <div style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            padding: '20px 0',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-dark)',
            position: 'relative',
            zIndex: 1
        }}>
            <motion.div
                animate={{ x: reverse ? [0, -1000] : [-1000, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block' }}
            >
                <span style={{
                    fontSize: '6vw',
                    fontWeight: '900',
                    fontFamily: 'var(--font-display)',
                    color: 'transparent',
                    WebkitTextStroke: '1px rgba(255,255,255,0.1)',
                    paddingRight: '50px',
                    letterSpacing: '4px'
                }}>
                    {Array(10).fill(text).join(' • ')}
                </span>
            </motion.div>
        </div>
    );
};

export default Marquee;
