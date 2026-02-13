import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useStockStore } from '../store/useStockStore';

const ProductCard = ({ product, onOpen }) => {
    const totalStock = Object.values(product.variants).reduce((a, b) => a + b, 0);

    return (
        <div
            className="glass-card"
            onClick={() => onOpen(product)}
            style={{
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '2px',
                height: '100%'
            }}
        >
            {/* Stock Badge - Technical Look */}
            {totalStock === 0 && (
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff4444', color: '#fff', padding: '5px 10px', fontSize: '9px', fontWeight: '900', zIndex: 10, letterSpacing: '1px' }}>OUT OF STOCK</div>
            )}

            {/* Image */}
            <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#111' }}>
                <img
                    src={product.image || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600&h=800'}
                    alt={product.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'grayscale(100%) contrast(1.1) brightness(0.9)',
                        transition: 'transform 0.5s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.filter = 'grayscale(0%) contrast(1.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'grayscale(100%) contrast(1.1) brightness(0.9)'; }}
                />
            </div>

            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>{product.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
                        ${product.price ? product.price.toLocaleString() : '0'}
                    </p>
                </div>
                <button
                    style={{
                        marginTop: '15px',
                        fontSize: '10px',
                        width: '100%',
                        padding: '10px',
                        border: '1px solid var(--border-subtle)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: '700',
                        letterSpacing: '2px'
                    }}
                    onMouseEnter={(e) => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.color = 'var(--text-secondary)'; }}
                >
                    VIEW DETAILS
                </button>
            </div>
        </div>
    );
};

const ProductModal = ({ product, onClose }) => {
    const { addItem } = useCartStore();
    const [selectedSize, setSelectedSize] = useState(null);
    const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    const getStockForSize = (size) => product.variants[size] || 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ background: 'var(--bg-dark)', width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-glow)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={32} /></button>

                <div style={{ height: '100%', minHeight: '400px', background: '#050505' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
                </div>

                <div style={{ padding: '50px', display: 'flex', flexDirection: 'column', gap: '30px', justifyContent: 'center' }}>
                    <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '3px', fontWeight: '800' }}>{product.category || 'OLMO CORE'}</span>
                        <h2 className="font-display" style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '2px', color: 'var(--text-primary)', marginTop: '10px', lineHeight: '1' }}>{product.name}</h2>
                        <p style={{ fontSize: '24px', fontWeight: '400', color: 'var(--text-primary)', marginTop: '15px', fontFamily: 'var(--font-body)' }}>${product.price.toLocaleString()}</p>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.8', fontFamily: 'var(--font-body)' }}>{product.description || 'Premium urban construct. Heavyweight fabric. Designed for the streets.'}</p>

                    <div>
                        <h4 style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '15px', letterSpacing: '2px', fontWeight: '800' }}>SELECT SIZE</h4>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {SIZES.map(size => {
                                const stock = getStockForSize(size);
                                const isOutOfStock = stock === 0;
                                return (
                                    <button
                                        key={size}
                                        disabled={isOutOfStock}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            border: `1px solid ${selectedSize === size ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                                            color: isOutOfStock ? 'var(--text-muted)' : (selectedSize === size ? '#000' : 'var(--text-primary)'),
                                            background: isOutOfStock ? 'rgba(255,255,255,0.05)' : (selectedSize === size ? 'var(--text-primary)' : 'transparent'),
                                            fontWeight: '700',
                                            transition: '0.3s',
                                            textDecoration: isOutOfStock ? 'line-through' : 'none',
                                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        disabled={!selectedSize}
                        onClick={() => {
                            if (selectedSize) {
                                addItem({ ...product, size: selectedSize });
                                onClose();
                            }
                        }}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            textAlign: 'center',
                            opacity: !selectedSize ? 0.5 : 1,
                            cursor: !selectedSize ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {!selectedSize ? 'SELECT SIZE' : 'ADD TO BAG'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ProductGrid = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { stock } = useStockStore();

    return (
        <section id="shop" className="section container" style={{ padding: '150px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '100px' }}>
                <h2 className="font-display" style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '6px', textAlign: 'center', color: 'var(--text-primary)' }}>LATEST DROPS</h2>
                <div style={{ height: '1px', width: '80px', backgroundColor: 'var(--text-primary)', marginTop: '20px' }}></div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '40px'
            }}>
                {stock.map(product => (
                    <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} />
                ))}
            </div>

            <AnimatePresence>
                {selectedProduct && (
                    <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
                )}
            </AnimatePresence>
        </section>
    );
};

export default ProductGrid;
