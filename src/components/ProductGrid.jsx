import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useStockStore } from '../store/useStockStore';
import { useSettingsStore } from '../store/useSettingsStore';

// ── Product Card (2-col grid style matching Stitch design) ──────────────────
const ProductCard = ({ product, onOpen }) => {
    const totalStock = Object.values(product.variants || {}).reduce((a, b) => a + b, 0);
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onClick={() => onOpen(product)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ cursor: 'pointer', position: 'relative' }}
        >
            {/* Image */}
            <div style={{
                aspectRatio: '3/4',
                overflow: 'hidden',
                background: '#e5e7eb',
                marginBottom: '12px',
                borderRadius: '2px',
                position: 'relative',
            }}>
                {totalStock === 0 && (
                    <div style={{
                        position: 'absolute', top: '8px', left: '8px',
                        background: '#ef4444', color: '#fff',
                        padding: '3px 8px', fontSize: '9px', fontWeight: '900',
                        letterSpacing: '1px', zIndex: 10, borderRadius: '2px',
                    }}>AGOTADO</div>
                )}
                <img
                    src={product.image || '/olmo_files/625151196_17921692254243739_4681068032369953326_n.jpg'}
                    alt={product.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: hovered ? 'grayscale(0%)' : 'grayscale(100%)',
                        transform: hovered ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.5s ease',
                    }}
                />
            </div>

            {/* Info */}
            <p style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#6b7280',
                marginBottom: '4px',
                fontFamily: "'Inter', sans-serif",
                fontWeight: '600',
            }}>
                {product.category || 'OLMO CORE'}
            </p>
            <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                fontFamily: "'Inter', sans-serif",
                color: '#1A1A1A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>
                {product.name}
            </h3>
            <p style={{
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '12px',
                fontFamily: "'Inter', sans-serif",
                color: '#1A1A1A',
            }}>
                ${product.price ? product.price.toLocaleString() : '0'},00
            </p>
            <button
                style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1A1A1A',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#3f3f3f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1A1A1A'}
            >
                Comprar
            </button>
        </div>
    );
};

// ── Product Modal ────────────────────────────────────────────────────────────
const ProductModal = ({ product, onClose }) => {
    const { addItem } = useCartStore();
    const [selectedSize, setSelectedSize] = useState(null);
    const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    const getStockForSize = (size) => (product.variants || {})[size] || 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0,
                width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.7)',
                zIndex: 3000,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#ffffff',
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    borderRadius: '16px 16px 0 0',
                    padding: '32px 24px 48px',
                    position: 'relative',
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: '#f3f4f6', border: 'none', borderRadius: '50%',
                        width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#1A1A1A',
                    }}
                >
                    <X size={18} />
                </button>

                {/* Product Image */}
                <div style={{
                    aspectRatio: '3/4',
                    background: '#e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '24px',
                }}>
                    <img
                        src={product.image || '/olmo_files/625151196_17921692254243739_4681068032369953326_n.jpg'}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }}
                    />
                </div>

                {/* Info */}
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b7280', fontFamily: "'Inter', sans-serif" }}>
                    OLMO INDUMENTARIA
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Inter', sans-serif", marginTop: '4px', marginBottom: '8px' }}>
                    {product.name}
                </h2>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Inter', sans-serif", marginBottom: '24px' }}>
                    ${product.price ? product.price.toLocaleString() : '0'},00
                </p>

                {/* Size Selector */}
                <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.15em', marginBottom: '12px', fontFamily: "'Inter', sans-serif" }}>
                    SELECCIONÁ TU TALLE
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {SIZES.map(size => {
                        const stock = getStockForSize(size);
                        const isOut = stock === 0;
                        const isSelected = selectedSize === size;
                        return (
                            <button
                                key={size}
                                disabled={isOut}
                                onClick={() => setSelectedSize(size)}
                                style={{
                                    width: '48px', height: '48px',
                                    border: `1px solid ${isSelected ? '#1A1A1A' : '#e5e7eb'}`,
                                    background: isSelected ? '#1A1A1A' : (isOut ? '#f9fafb' : '#ffffff'),
                                    color: isSelected ? '#fff' : (isOut ? '#d1d5db' : '#1A1A1A'),
                                    fontWeight: '700', fontSize: '12px',
                                    cursor: isOut ? 'not-allowed' : 'pointer',
                                    textDecoration: isOut ? 'line-through' : 'none',
                                    borderRadius: '4px',
                                    fontFamily: "'Inter', sans-serif",
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {size}
                            </button>
                        );
                    })}
                </div>

                {/* Add to Cart */}
                <button
                    disabled={!selectedSize}
                    onClick={() => {
                        if (selectedSize) {
                            addItem({ ...product, size: selectedSize });
                            onClose();
                        }
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: selectedSize ? '#1A1A1A' : '#e5e7eb',
                        color: selectedSize ? '#ffffff' : '#9ca3af',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        cursor: selectedSize ? 'pointer' : 'not-allowed',
                        borderRadius: '4px',
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.2s ease',
                    }}
                >
                    {selectedSize ? 'AGREGAR AL CARRITO' : 'SELECCIONÁ UN TALLE'}
                </button>
            </motion.div>
        </motion.div>
    );
};

// ── Main Product Grid ────────────────────────────────────────────────────────
const ProductGrid = ({ searchQuery = '' }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const { stock } = useStockStore();
    const { settings, fetchSettings, subscribeToSettings } = useSettingsStore();

    useEffect(() => {
        fetchSettings();
        const unsubscribe = subscribeToSettings();
        return unsubscribe;
    }, []);

    // Read categories and contact from Supabase settings
    const savedCategories = Array.isArray(settings.categories) ? settings.categories : [];
    const categories = ['Todos', ...savedCategories];
    const contact = settings.contact || {};

    // Filter: category + search query
    const filteredStock = stock
        .filter(p => activeCategory === 'Todos' || p.category === activeCategory)
        .filter(p => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
                (p.name || '').toLowerCase().includes(q) ||
                (p.category || '').toLowerCase().includes(q)
            );
        });

    return (
        <section id="shop" style={{
            background: 'linear-gradient(180deg, #F9F9F9 0%, #E2E2E2 100%)',
            minHeight: '100vh',
            paddingBottom: '120px', // space for bottom nav
        }}>
            {/* Category Pills */}
            <div style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '12px',
                padding: '24px 24px 8px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            flexShrink: 0,
                            padding: '8px 24px',
                            background: activeCategory === cat ? '#1A1A1A' : '#ffffff',
                            color: activeCategory === cat ? '#ffffff' : '#1A1A1A',
                            border: activeCategory === cat ? 'none' : '1px solid #e5e7eb',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Section Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '24px 24px 16px' }}>
                <h2 style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '22px',
                    fontWeight: '800',
                    letterSpacing: '-0.5px',
                    textTransform: 'uppercase',
                    color: '#1A1A1A',
                }}>
                    Destacados
                </h2>
                <a href="#" style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#1A1A1A',
                    textDecoration: 'underline',
                    textDecorationThickness: '2px',
                    textUnderlineOffset: '4px',
                    fontFamily: "'Inter', sans-serif",
                }}>
                    Ver todo
                </a>
            </div>

            {/* 2-Column Product Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                padding: '0 16px',
            }}>
                {filteredStock.length > 0 ? filteredStock.map(product => (
                    <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} />
                )) : (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#9ca3af',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                    }}>
                        {searchQuery.trim()
                            ? `No se encontraron productos para "${searchQuery}"`
                            : 'No hay productos en esta categoría todavía.'}
                    </div>
                )}
            </div>

            {/* Instagram CTA */}
            <section style={{ padding: '48px 24px', borderTop: '1px solid #e5e7eb', marginTop: '48px', textAlign: 'center' }}>
                <span className="material-icons-outlined" style={{ fontSize: '32px', marginBottom: '16px', display: 'block', color: '#1A1A1A' }}>photo_camera</span>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', fontFamily: "'Inter', sans-serif", color: '#1A1A1A' }}>@olmo.ind</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', fontFamily: "'Inter', sans-serif" }}>Estamos en Instagram</p>
                <a
                    href="https://www.instagram.com/olmo.ind/"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        display: 'inline-block',
                        padding: '12px 40px',
                        border: '1px solid #1A1A1A',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: '#1A1A1A',
                        textDecoration: 'none',
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1A1A1A'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1A1A1A'; }}
                >
                    Seguinos
                </a>
            </section>

            {/* Footer */}
            <footer id="contact" style={{
                background: '#ffffff',
                padding: '48px 32px',
                borderTop: '1px solid #f3f4f6',
            }}>
                <div style={{ marginBottom: '40px' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '24px', opacity: 0.5, fontFamily: "'Inter', sans-serif" }}>Categorías</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {['Inicio', 'Contacto', 'Productos'].map(item => (
                            <li key={item}>
                                <a href="#" style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A1A', textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}>{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ marginBottom: '40px' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '24px', opacity: 0.5, fontFamily: "'Inter', sans-serif" }}>Contactános</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <li style={{ fontSize: '14px', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '12px' }}>📱 {contact.whatsapp || '543434559599'}</li>
                        <li style={{ fontSize: '14px', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '12px' }}>✉️ {contact.email || 'olmoshowroom@gmail.com'}</li>
                        <li style={{ fontSize: '14px', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '12px' }}>📍 {contact.address || 'Cervantes 35 local A'}</li>
                        {contact.instagram && <li style={{ fontSize: '14px', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '12px' }}>📸 @{contact.instagram}</li>}
                    </ul>
                </div>
                <div style={{ paddingTop: '40px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                    <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '20px', fontWeight: '800', letterSpacing: '-1px', opacity: 0.2, color: '#1A1A1A' }}>OLMO</h1>
                    <p style={{ fontSize: '9px', marginTop: '16px', opacity: 0.4, fontFamily: "'Inter', sans-serif", color: '#1A1A1A' }}>Copyright Olmo Indumentaria - 2025. Todos los derechos reservados.</p>
                </div>
            </footer>

            {/* Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
                )}
            </AnimatePresence>
        </section>
    );
};

export default ProductGrid;
