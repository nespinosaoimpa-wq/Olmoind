import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useStockStore } from '../store/useStockStore';

// Products are now managed in useStockStore

const ProductCard = ({ product, onOpen }) => {
    // Calculate total stock
    const totalStock = Object.values(product.variants).reduce((a, b) => a + b, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => onOpen(product)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                cursor: 'pointer',
                position: 'relative',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                paddingBottom: '20px',
                opacity: totalStock === 0 ? 0.6 : 1
            }}
        >
            <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#1a1a1a' }}>
                {totalStock === 0 && (
                    <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#ff4444', color: '#fff', padding: '5px 10px', fontSize: '10px', fontWeight: '900', zIndex: 10, letterSpacing: '2px' }}>SIN STOCK</div>
                )}
                <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    src={product.image || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600&h=800'}
                    alt={product.name}
                    style={{ width: '100%', display: 'block', objectFit: 'cover', height: '400px', filter: 'grayscale(20%) brightness(0.9)' }}
                />
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent)', padding: '10px', display: 'flex', alignItems: 'center' }}>
                    <Plus size={16} color="#fff" />
                </div>
            </div>
            <div style={{ padding: '0 20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '2px', marginBottom: '8px', color: 'var(--text-primary)' }}>{product.name}</h3>
                <p style={{ fontSize: '15px', fontWeight: '900', color: 'var(--accent)' }}>${product.price ? product.price.toLocaleString() : '0'}</p>
            </div>
        </motion.div>
    );
};

const ProductModal = ({ product, onClose }) => {
    const { addItem } = useCartStore();
    const [selectedSize, setSelectedSize] = useState(null);
    const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    const getStockForSize = (size) => product.variants[size] || 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1, color: '#fff' }}><X size={24} /></button>

                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '600px', filter: 'grayscale(15%)' }} />

                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div>
                        <span style={{ fontSize: '10px', color: 'var(--accent)', letterSpacing: '3px', fontWeight: '800' }}>{product.category || 'OLMO CORE'}</span>
                        <h2 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '2px', color: '#fff', marginTop: '10px' }}>{product.name}</h2>
                        <p style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginTop: '10px' }}>${product.price.toLocaleString()}</p>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.8' }}>{product.description || 'Prenda de alta calidad diseñada con estética cruda y materiales premium.'}</p>

                    <div>
                        <h4 style={{ fontSize: '11px', color: '#888', marginBottom: '15px', letterSpacing: '2px' }}>SELECCIONAR TALLE</h4>
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
                                            width: '45px',
                                            height: '45px',
                                            border: `1px solid ${selectedSize === size ? '#fff' : 'rgba(255,255,255,0.1)'}`,
                                            color: isOutOfStock ? '#666' : (selectedSize === size ? '#000' : '#fff'),
                                            background: isOutOfStock ? 'rgba(255,0,0,0.1)' : (selectedSize === size ? '#fff' : 'transparent'),
                                            fontWeight: '800',
                                            transition: '0.3s',
                                            textDecoration: isOutOfStock ? 'line-through' : 'none',
                                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                            position: 'relative'
                                        }}
                                    >
                                        {size}
                                        {isOutOfStock && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(45deg, transparent 48%, #ff4444 49%, #ff4444 51%, transparent 52%)', opacity: 0.5 }}></div>}
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
                            padding: '20px',
                            background: !selectedSize ? '#333' : 'var(--accent)',
                            color: '#fff',
                            fontWeight: '900',
                            letterSpacing: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: !selectedSize ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <ShoppingBag size={20} /> {!selectedSize ? 'SELECCIONA UN TALLE' : 'AÑADIR AL CARRITO'}
                    </button>
                    {selectedSize && getStockForSize(selectedSize) < 10 && getStockForSize(selectedSize) > 0 && (
                        <p style={{ fontSize: '10px', color: '#ff4444', fontWeight: '700', letterSpacing: '1px', textAlign: 'center' }}>
                            ¡QUEDAN SOLO {getStockForSize(selectedSize)} UNIDADES EN {selectedSize}!
                        </p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const ProductGrid = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { stock } = useStockStore();

    return (
        <section id="shop" className="container" style={{ padding: '120px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '80px' }}>
                <h2 className="font-display" style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '4px', textAlign: 'center', color: '#fff' }}>LA VITRINA</h2>
                <div style={{ height: '4px', width: '60px', backgroundColor: 'var(--accent)', marginTop: '20px' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '40px' }}>
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
