import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign, Smartphone, Check, X, FileText } from 'lucide-react';
import { useStockStore } from '../../store/useStockStore';
import { supabase } from '../../supabaseClient';

const colors = {
    primary: '#5c2e91', bg: '#f8fafc', text: '#1e293b',
    textSecondary: '#64748b', border: '#e2e8f0', cardBg: '#ffffff',
    success: '#10b981', warning: '#f59e0b', error: '#ef4444',
};

const PAYMENT_METHODS = [
    { id: 'cash', label: 'Efectivo', icon: <DollarSign size={18} />, color: colors.success },
    { id: 'transfer', label: 'Transferencia', icon: <CreditCard size={18} />, color: '#0ea5e9' },
    { id: 'card', label: 'Tarjeta', icon: <CreditCard size={18} />, color: '#8b5cf6' },
    { id: 'mp', label: 'Mercado Pago', icon: <Smartphone size={18} />, color: '#00b1ea' },
];

const PosModule = () => {
    const { stock, registerSale } = useStockStore();
    const [query, setQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [saleComplete, setSaleComplete] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [amountTendered, setAmountTendered] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    
    // Caja States
    const [showCaja, setShowCaja] = useState(false);
    const [dailySales, setDailySales] = useState([]);
    const [cajaLoading, setCajaLoading] = useState(false);

    const searchRef = useRef(null);

    // Focus search on mount (also works with barcode pistol scanner)
    useEffect(() => {
        if (searchRef.current) searchRef.current.focus();
    }, []);

    const filteredProducts = query.trim().length === 0 ? stock : stock.filter(p => {
        const q = query.toLowerCase();
        return (
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.id?.toLowerCase().startsWith(q)
        );
    });

    const addToCart = (product, size) => {
        const key = `${product.id}-${size}`;
        const stock_for_size = (product.variants || {})[size] || 0;
        setCart(prev => {
            const existing = prev.find(i => i.key === key);
            if (existing) {
                if (existing.quantity >= stock_for_size) return prev;
                return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { key, id: product.id, name: product.name, price: product.price, size, quantity: 1, maxStock: stock_for_size, image: product.images?.[0] || product.image }];
        });
        setQuery('');
        if (searchRef.current) searchRef.current.focus();
    };

    const updateQty = (key, delta) => {
        setCart(prev => prev.map(i => i.key === key ? { ...i, quantity: Math.max(1, Math.min(i.quantity + delta, i.maxStock)) } : i));
    };

    const removeItem = (key) => setCart(prev => prev.filter(i => i.key !== key));

    const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

    const handleSale = async () => {
        if (cart.length === 0) return;
        setProcessing(true);
        try {
            let finalNotes = paymentNotes;
            if (paymentMethod === 'Efectivo' && amountTendered) {
                const vuelto = parseFloat(amountTendered) - total;
                finalNotes = `Pagó con: $${amountTendered} | Vuelto: $${vuelto >= 0 ? vuelto : 0}`;
            }

            await registerSale(cart, {
                method: paymentMethod,
                notes: finalNotes
            });

            setSaleComplete(true);
            setTimeout(() => {
                setSaleComplete(false);
                setShowCheckout(false);
                setCart([]);
                setQuery('');
                setAmountTendered('');
                setPaymentNotes('');
                if (searchRef.current) searchRef.current.focus();
            }, 2500);
        } catch (e) {
            alert('Error al registrar la venta: ' + e.message);
        } finally {
            setProcessing(false);
        }
    };

    const fetchDailyCaja = async () => {
        setCajaLoading(true);
        try {
            // Get today's start and end timestamps in ISO
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            
            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .gte('created_at', startOfDay.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDailySales(data || []);
        } catch (e) {
            console.error('Error fetching caja:', e);
            alert('Error al cargar la caja.');
        } finally {
            setCajaLoading(false);
        }
    };

    const openCaja = () => {
        fetchDailyCaja();
        setShowCaja(true);
    };

    // Calculate Caja Totals
    const cajaSummary = dailySales.reduce((acc, sale) => {
        const method = sale.payment_method || 'Desconocido';
        if (!acc[method]) acc[method] = 0;
        acc[method] += sale.total || 0;
        acc.total += sale.total || 0;
        return acc;
    }, { total: 0 });

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', height: 'calc(100vh - 160px)' }}>
            {/* Left Panel: Product Search */}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, margin: '0 0 4px 0' }}>Punto de Venta</h2>
                        <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0 }}>
                            Buscá por nombre, categoría, o escaneá el código de barras
                        </p>
                    </div>
                    <button onClick={openCaja} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px', background: '#fff', border: `1px solid ${colors.border}`,
                        borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: colors.text,
                        cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <FileText size={16} color={colors.primary} />
                        Ver Caja / Historial
                    </button>
                </div>

                {/* Barcode / Search Input */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="🔍 Escribí, escaneá código de barras o nombre del producto..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        style={{
                            width: '100%', boxSizing: 'border-box',
                            background: '#fff', border: `2px solid ${colors.primary}`,
                            borderRadius: '10px', padding: '14px 16px 14px 44px',
                            fontSize: '15px', fontFamily: "'Inter', sans-serif",
                            color: colors.text, outline: 'none',
                        }}
                        autoComplete="off"
                    />
                </div>

                {/* Product Grid */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', alignContent: 'start' }}>
                    {filteredProducts.map(product => {
                        const totalStock = Object.values(product.variants || {}).reduce((a, b) => a + b, 0);
                        const sizes = Object.entries(product.variants || {}).filter(([, qty]) => qty > 0);
                        return (
                            <div key={product.id} style={{
                                background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '10px',
                                overflow: 'hidden', transition: 'all 0.2s',
                                opacity: totalStock === 0 ? 0.5 : 1,
                            }}>
                                <div style={{ height: '120px', background: '#f8fafc', overflow: 'hidden', position: 'relative' }}>
                                    {product.images?.[0] || product.image ? (
                                        <img src={product.images?.[0] || product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '32px' }}>👕</div>
                                    )}
                                    {totalStock === 0 && (
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>AGOTADO</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '10px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: '700', color: colors.text, margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                                    <p style={{ fontSize: '14px', fontWeight: '800', color: colors.primary, margin: '0 0 8px 0' }}>${product.price?.toLocaleString()}</p>
                                    {/* Size buttons */}
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {sizes.map(([size, qty]) => (
                                            <button key={size} onClick={() => addToCart(product, size)} style={{
                                                fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px',
                                                border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer',
                                                color: colors.text, fontFamily: "'Inter', sans-serif",
                                                transition: 'all 0.15s'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = `1px solid ${colors.primary}`; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = colors.text; e.currentTarget.style.border = `1px solid ${colors.border}`; }}
                                                title={`Stock: ${qty}`}
                                            >
                                                <span translate="no">{size}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredProducts.length === 0 && query && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: colors.textSecondary }}>
                            <p style={{ fontSize: '14px', fontWeight: '600' }}>No se encontraron productos para "{query}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Cart */}
            <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {/* Cart Header */}
                <div style={{ padding: '20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingCart size={20} color={colors.primary} />
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text, margin: 0 }}>Carrito ({cart.length})</h3>
                </div>

                {/* Cart Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: colors.textSecondary }}>
                            <ShoppingCart size={40} style={{ marginBottom: '12px', opacity: 0.2 }} />
                            <p style={{ fontSize: '13px', fontWeight: '600' }}>El carrito está vacío</p>
                            <p style={{ fontSize: '12px', marginTop: '4px' }}>Buscá y seleccioná un talle para agregar</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
                            {item.image && <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '12px', fontWeight: '700', color: colors.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                                <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '2px 0 0 0' }}>
                                    <span translate="no">Talle {item.size}</span> • ${item.price?.toLocaleString()}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                <button onClick={() => updateQty(item.key, -1)} style={{ width: '24px', height: '24px', border: `1px solid ${colors.border}`, borderRadius: '4px', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Minus size={12} />
                                </button>
                                <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                <button onClick={() => updateQty(item.key, 1)} style={{ width: '24px', height: '24px', border: `1px solid ${colors.border}`, borderRadius: '4px', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Plus size={12} />
                                </button>
                                <button onClick={() => removeItem(item.key)} style={{ width: '24px', height: '24px', border: 'none', borderRadius: '4px', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.error, marginLeft: '4px' }}>
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment and Total */}
                <div style={{ padding: '16px', borderTop: `1px solid ${colors.border}` }}>
                    {/* Payment Method */}
                    <p style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: '10px' }}>Medio de Pago</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                        {PAYMENT_METHODS.map(pm => (
                            <button key={pm.id} onClick={() => setPaymentMethod(pm.id)} style={{
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 12px',
                                borderRadius: '8px', border: paymentMethod === pm.id ? `2px solid ${pm.color}` : `1px solid ${colors.border}`,
                                background: paymentMethod === pm.id ? `${pm.color}10` : '#fff',
                                cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                                color: paymentMethod === pm.id ? pm.color : colors.textSecondary,
                                fontFamily: "'Inter', sans-serif", transition: 'all 0.15s'
                            }}>
                                {pm.icon} {pm.label}
                            </button>
                        ))}
                    </div>

                    {/* Total */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: colors.text }}>TOTAL</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: colors.primary }}>${total.toLocaleString()}</span>
                    </div>

                    {/* Confirm Button */}
                    <button onClick={() => setShowCheckout(true)} disabled={cart.length === 0 || processing} style={{
                        width: '100%', padding: '16px', background: cart.length === 0 ? '#e2e8f0' : colors.primary,
                        color: cart.length === 0 ? '#94a3b8' : '#fff', border: 'none', borderRadius: '10px',
                        fontSize: '15px', fontWeight: '800', cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                        fontFamily: "'Inter', sans-serif", transition: 'all 0.2s'
                    }}>
                        Cobrar ${total.toLocaleString()}
                    </button>
                </div>
            </div>

            {/* Checkout Modal Overlay */}
            {showCheckout && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '16px', padding: '32px',
                        width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative'
                    }}>
                        {saleComplete ? (
                            <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <Check size={32} />
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', color: colors.text, margin: '0 0 8px 0' }}>¡Venta Registrada!</h3>
                                <p style={{ color: colors.textSecondary }}>La caja ha sido actualizada.</p>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => setShowCheckout(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}>
                                    <X size={20} />
                                </button>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text, marginBottom: '24px' }}>Detalles de Cobro</h2>

                                <div style={{ background: '#f8fafc', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '13px', fontWeight: '700', color: colors.textSecondary, margin: '0 0 4px 0', textTransform: 'uppercase' }}>Total a Pagar</p>
                                    <p style={{ fontSize: '36px', fontWeight: '900', color: colors.primary, margin: 0 }}>${total.toLocaleString()}</p>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Método de Pago</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {['Efectivo', 'Débito', 'Crédito', 'Transferencia', 'Mixto', 'Crédito de la casa'].map(method => (
                                            <button key={method} onClick={() => { setPaymentMethod(method); setPaymentNotes(''); setAmountTendered(''); }} style={{
                                                padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                                border: paymentMethod === method ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                                                background: paymentMethod === method ? `${colors.primary}10` : '#fff',
                                                color: paymentMethod === method ? colors.primary : colors.text,
                                                fontFamily: "'Inter', sans-serif"
                                            }}>
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {paymentMethod === 'Efectivo' && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>¿Con cuánto paga?</label>
                                        <div style={{ position: 'relative' }}>
                                            <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
                                            <input
                                                type="number"
                                                placeholder="Ej: 50000"
                                                value={amountTendered}
                                                onChange={e => setAmountTendered(e.target.value)}
                                                style={{
                                                    width: '100%', boxSizing: 'border-box', background: '#fff', border: `1px solid ${colors.border}`,
                                                    borderRadius: '8px', padding: '12px 16px 12px 36px', fontSize: '16px', fontWeight: '700',
                                                    color: colors.text, outline: 'none', fontFamily: "'Inter', sans-serif"
                                                }}
                                            />
                                        </div>
                                        {amountTendered && parseFloat(amountTendered) >= total && (
                                            <div style={{ marginTop: '12px', padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                                                <p style={{ fontSize: '13px', color: '#065f46', margin: 0, display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                                                    <span>VUELTO A ENTREGAR:</span>
                                                    <span style={{ fontSize: '16px' }}>${(parseFloat(amountTendered) - total).toLocaleString()}</span>
                                                </p>
                                            </div>
                                        )}
                                        {amountTendered && parseFloat(amountTendered) < total && (
                                            <p style={{ fontSize: '12px', color: colors.error, marginTop: '8px', fontWeight: '600' }}>El monto es menor al total.</p>
                                        )}
                                    </div>
                                )}

                                {(paymentMethod === 'Mixto' || paymentMethod === 'Crédito de la casa') && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                                            {paymentMethod === 'Mixto' ? 'Detalle del pago (Ej: 10000 efvo, resto débito)' : 'Nombre del cliente / Detalles'}
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentNotes}
                                            onChange={e => setPaymentNotes(e.target.value)}
                                            placeholder="Ingresá los detalles aquí..."
                                            style={{
                                                width: '100%', boxSizing: 'border-box', background: '#fff', border: `1px solid ${colors.border}`,
                                                borderRadius: '8px', padding: '12px 16px', fontSize: '14px',
                                                color: colors.text, outline: 'none', fontFamily: "'Inter', sans-serif"
                                            }}
                                        />
                                    </div>
                                )}

                                <button onClick={handleSale} disabled={processing || (paymentMethod === 'Efectivo' && amountTendered && parseFloat(amountTendered) < total)} style={{
                                    width: '100%', padding: '16px', background: colors.primary, color: '#fff',
                                    border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '800', cursor: processing ? 'not-allowed' : 'pointer',
                                    fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', opacity: processing ? 0.7 : 1
                                }}>
                                    {processing ? 'Confirmando...' : 'Confirmar Venta y Cerrar Caja'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Caja / Historial Modal */}
            {showCaja && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '16px', padding: '32px',
                        width: '90%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative'
                    }}>
                        <button onClick={() => setShowCaja(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}>
                            <X size={20} />
                        </button>
                        
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text, marginBottom: '24px' }}>
                            Cierre de Caja - {new Date().toLocaleDateString('es-AR')}
                        </h2>

                        {cajaLoading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: colors.textSecondary }}>Cargando datos de hoy...</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                                {/* Resumen Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                                        <p style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', margin: '0 0 4px 0' }}>Total del Día</p>
                                        <p style={{ fontSize: '24px', fontWeight: '900', color: colors.primary, margin: 0 }}>${cajaSummary.total.toLocaleString()}</p>
                                        <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '4px 0 0 0' }}>{dailySales.length} ventas</p>
                                    </div>
                                    {Object.entries(cajaSummary).filter(([k]) => k !== 'total').map(([method, amount]) => (
                                        <div key={method} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                                            <p style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', margin: '0 0 4px 0' }}>{method}</p>
                                            <p style={{ fontSize: '18px', fontWeight: '800', color: colors.text, margin: 0 }}>${amount.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Historial List */}
                                <h3 style={{ fontSize: '14px', fontWeight: '800', color: colors.text, marginBottom: '12px' }}>Historial de Hoy</h3>
                                <div style={{ overflowY: 'auto', flex: 1, border: `1px solid ${colors.border}`, borderRadius: '12px', background: '#f8fafc' }}>
                                    {dailySales.length === 0 ? (
                                        <div style={{ padding: '32px', textAlign: 'center', color: colors.textSecondary, fontSize: '13px' }}>No hay ventas registradas el día de hoy.</div>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                            <thead style={{ background: '#fff', position: 'sticky', top: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                <tr>
                                                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: '700' }}>Hora</th>
                                                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: '700' }}>Método</th>
                                                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: '700' }}>Total</th>
                                                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: '700' }}>Detalles / Notas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dailySales.map(sale => (
                                                    <tr key={sale.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                                        <td style={{ padding: '12px 16px', color: colors.text }}>{new Date(sale.created_at).toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'})}</td>
                                                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                                                            <span style={{ background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>{sale.payment_method || 'N/A'}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', fontWeight: '700', color: colors.primary }}>${sale.total?.toLocaleString()}</td>
                                                        <td style={{ padding: '12px 16px', color: colors.textSecondary }}>
                                                            {sale.notes ? sale.notes : (
                                                                <span style={{ opacity: 0.5 }}>{(sale.items || []).length} art.</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button onClick={() => window.print()} style={{
                                        padding: '12px 24px', background: '#1e293b', color: '#fff', border: 'none',
                                        borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif"
                                    }}>
                                        🖨️ Imprimir Resumen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PosModule;
