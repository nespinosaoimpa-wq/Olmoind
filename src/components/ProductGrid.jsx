import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useStockStore } from '../store/useStockStore';
import { useSettingsStore } from '../store/useSettingsStore';

// ── Product Card (Clean style matching reference) ─────────────────────────────
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
                background: '#f9fafb', // Light gray background in case image is transparent
                marginBottom: '16px',
                position: 'relative',
            }}>
                {totalStock === 0 && (
                    <div style={{
                        position: 'absolute', top: '8px', left: '8px',
                        background: '#1A1A1A', color: '#fff',
                        padding: '4px 8px', fontSize: '10px', fontWeight: '800',
                        letterSpacing: '1px', zIndex: 10,
                    }}>AGOTADO</div>
                )}
                <img
                    src={(Array.isArray(product.images) && product.images[0]) || product.image || '/olmo_files/625151196_17921692254243739_4681068032369953326_n.jpg'}
                    alt={product.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: hovered ? 'scale(1.03)' : 'scale(1)',
                        transition: 'transform 0.4s ease',
                    }}
                />
            </div>

            {/* Info */}
            <div style={{ padding: '0 4px' }}>
                <h3 style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    marginBottom: '4px',
                    fontFamily: "'Inter', sans-serif",
                    color: '#1A1A1A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {product.name}
                </h3>
                <p style={{
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#6b7280',
                    fontFamily: "'Inter', sans-serif",
                }}>
                    ${product.price ? product.price.toLocaleString() : '0'}
                </p>
            </div>
        </div>
    );
};

// ── Product Modal ────────────────────────────────────────────────────────────
const ProductModal = ({ product, onClose }) => {
    const { addItem } = useCartStore();
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    const getStockForSize = (size) => (product.variants || {})[size] || 0;
    
    // Safety check for images array
    const images = Array.isArray(product.images) && product.images.length > 0 
        ? product.images 
        : (product.image ? [product.image] : ['/olmo_files/625151196_17921692254243739_4681068032369953326_n.jpg']);

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
                        zIndex: 10
                    }}
                >
                    <X size={18} />
                </button>

                {/* Product Images Gallery */}
                <div style={{ marginBottom: '24px' }}>
                    {/* Main Image */}
                    <div style={{
                        aspectRatio: '3/4',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginBottom: images.length > 1 ? '12px' : '0',
                    }}>
                        <img
                            src={images[currentImageIdx]}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                            {images.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setCurrentImageIdx(idx)}
                                    style={{
                                        minWidth: '80px', height: '106px', flexShrink: 0,
                                        borderRadius: '6px', overflow: 'hidden', 
                                        border: currentImageIdx === idx ? '2px solid #1A1A1A' : '1px solid #e5e7eb',
                                        cursor: 'pointer',
                                        opacity: currentImageIdx === idx ? 1 : 0.6,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
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
                                <span translate="no" className="notranslate" style={{ fontFamily: "'Inter', sans-serif" }}>{size}</span>
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

    // Filter: category + search query, then sort by best selling (sales_count)
    const filteredStock = stock
        .filter(p => activeCategory === 'Todos' || p.category === activeCategory)
        .filter(p => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
                (p.name || '').toLowerCase().includes(q) ||
                (p.category || '').toLowerCase().includes(q)
            );
        })
        .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));

    return (
        <section id="shop" style={{
            background: 'linear-gradient(180deg, #F9F9F9 0%, #E2E2E2 100%)',
            minHeight: '100vh',
            paddingBottom: '120px', // space for bottom nav
        }}>
            {/* Category Pills */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
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

            {/* Multi-Column Product Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '24px 16px',
                padding: '0 24px',
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

            {/* Instagram CTA Removed */}

            {/* Footer (3-Column Layout) */}
            <footer id="contact" style={{
                background: '#f9fafb',
                padding: '60px 32px 40px',
                borderTop: '1px solid #e5e7eb',
                fontFamily: "'Inter', sans-serif",
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '48px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    marginBottom: '48px',
                }}>
                    {/* Col 1: Categorías */}
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#1A1A1A' }}>Categorías</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {['Inicio', 'Todos los productos', 'Contacto'].map(item => (
                                <li key={item}>
                                    <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ fontSize: '14px', fontWeight: '400', color: '#6b7280', textDecoration: 'none', transition: 'color 0.2s' }}
                                       onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
                                       onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                                    >{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 2: Contactános */}
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#1A1A1A' }}>Contactános</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <li style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                {contact.whatsapp || '543434559599'}
                            </li>
                            <li style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                {contact.phone || '03424551225'}
                            </li>
                            <li style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                {contact.address || 'Cervantes 35 local A'}
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Siganos conectados */}
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#1A1A1A' }}>Sigamos conectados</h4>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <a href={`https://www.instagram.com/${contact.instagram || 'olmo.ind'}/`} target="_blank" rel="noreferrer"
                               style={{
                                   width: '40px', height: '40px', borderRadius: '50%',
                                   background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                   transition: 'background 0.2s ease'
                               }}
                               onMouseEnter={(e) => e.currentTarget.style.background = '#E1306C'}
                               onMouseLeave={(e) => e.currentTarget.style.background = '#1A1A1A'}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer"
                               style={{
                                   width: '40px', height: '40px', borderRadius: '50%',
                                   background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                   transition: 'background 0.2s ease'
                               }}
                               onMouseEnter={(e) => e.currentTarget.style.background = '#1877F2'}
                               onMouseLeave={(e) => e.currentTarget.style.background = '#1A1A1A'}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Medios de pago y envío */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A', minWidth: '120px' }}>Medios de pago</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {['💳 Visa', '💳 Mastercard', '💳 Mercado Pago', '🏦 Transferencia'].map(m => (
                                <span key={m} style={{ fontSize: '11px', color: '#6b7280', background: '#ffffff', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: '4px', fontWeight: '500' }}>{m}</span>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A', minWidth: '120px' }}>Medios de envío</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {['📦 Correo Argentino', '🚚 Envío local'].map(m => (
                                <span key={m} style={{ fontSize: '11px', color: '#6b7280', background: '#ffffff', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: '4px', fontWeight: '500' }}>{m}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '24px', textAlign: 'center', maxWidth: '1200px', margin: '24px auto 0' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>© 2026 Olmo Indumentaria. Todos los derechos reservados.</p>
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
