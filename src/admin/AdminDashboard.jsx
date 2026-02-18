import React, { useState, useRef, useEffect } from 'react';
import {
    Package, Users, BarChart2, ArrowLeft, Plus, Edit2,
    Trash2, X, Save, ShoppingBag, Upload, Monitor, Smartphone,
    ChevronRight, CreditCard, Clock, CheckCircle, Truck, AlertCircle
} from 'lucide-react';
import { useStockStore } from '../store/useStockStore';
import { supabase } from '../supabaseClient';

const AdminDashboard = ({ onBack }) => {
    const { stock, sales, updateStock, addProduct, deleteProduct, fetchProducts } = useStockStore();
    const [activeTab, setActiveTab] = useState('stock');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Local state for sales with status (until synced)
    const [localSales, setLocalSales] = useState([]);

    useEffect(() => {
        fetchProducts();
        // Fetch sales with status
        const fetchSales = async () => {
            const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
            if (data) setLocalSales(data);
        }
        fetchSales();
    }, []);

    const [previewImage, setPreviewImage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        image: '',
        variants: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
    });

    const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    // Stats
    const totalRevenue = localSales.reduce((acc, sale) => acc + sale.total, 0);
    const totalItemsSold = localSales.reduce((acc, sale) => {
        const items = sale.items || [];
        return acc + items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
    const lowStockCount = stock.filter(item => {
        const total = Object.values(item.variants).reduce((a, b) => a + b, 0);
        return total < 10;
    }).length;

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                price: item.price,
                image: item.image || '',
                variants: { ...item.variants }
            });
            setPreviewImage(item.image || null);
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                price: 0,
                image: '',
                variants: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
            });
            setPreviewImage(null);
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e) => {
        setFormData({ ...formData, image: e.target.value });
        setPreviewImage(e.target.value);
    };

    const handleVariantChange = (size, value) => {
        setFormData({
            ...formData,
            variants: {
                ...formData.variants,
                [size]: parseInt(value) || 0
            }
        });
    };

    const handleSave = async () => {
        if (editingItem) {
            await updateStock(editingItem.id, formData.variants);
            // Also update basic details if needed, but store mainly handles stock. 
            // For full CRUD, we'd need another store method or direct supabase call here.
            await supabase.from('products').update({
                name: formData.name,
                price: formData.price,
                image: formData.image
            }).eq('id', editingItem.id);
        } else {
            await addProduct(formData);
        }
        setIsModalOpen(false);
        fetchProducts();
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿ELIMINAR ESTE PRODUCTO?')) {
            await deleteProduct(id);
            fetchProducts();
        }
    };

    const handleUpdateStatus = async (saleId, newStatus) => {
        // Optimistic update
        setLocalSales(localSales.map(s => s.id === saleId ? { ...s, status: newStatus } : s));

        await supabase.from('sales').update({ status: newStatus }).eq('id', saleId);
    };

    const tabs = [
        { id: 'stock', label: 'INVENTARIO', icon: <Package size={18} /> },
        { id: 'sales', label: 'VENTAS', icon: <ShoppingBag size={18} /> },
        { id: 'users', label: 'CLIENTES', icon: <Users size={18} /> },
        { id: 'stats', label: 'METRICAS', icon: <BarChart2 size={18} /> }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Enviado': return '#00ff88';
            case 'Entregado': return '#00ccff';
            case 'Cancelado': return '#ff4444';
            default: return '#ffaa00'; // Pendiente
        }
    };

    return (
        <div style={{
            backgroundColor: '#0f172a',
            minHeight: '100vh',
            color: '#f1f5f9',
            fontFamily: "'Inter', sans-serif",
            paddingBottom: '96px', // space for bottom nav
        }}>
            {/* TOP BAR - Stitch Dark Admin Style */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(15,23,42,0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #1e293b',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#ffffff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#000', fontWeight: '900', fontSize: '18px', fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}>O</span>
                    </div>
                    <h1 style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>Olmo Admin</h1>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={onBack} style={{ padding: '8px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                        <ArrowLeft size={16} />
                    </button>
                </div>
            </header>

            <div style={{ padding: '16px' }}>
                {/* MAIN CONTENT */}
                <div style={{ flex: 1 }}>

                    {/* DASHBOARD - Stitch Style */}
                    {activeTab === 'stock' && (
                        <div>
                            {/* Monthly Revenue */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div>
                                    <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Reporte Mensual</p>
                                    <h2 style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-1px', color: '#ffffff' }}>${totalRevenue.toLocaleString()},00</h2>
                                </div>
                                <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    ↑ {localSales.length} ventas
                                </div>
                            </div>

                            {/* Chart */}
                            <div style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
                                <div style={{ height: '128px', width: '100%', position: 'relative' }}>
                                    <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="cg" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,120 Q50,110 80,60 T160,80 T240,40 T320,90 T400,30 L400,150 L0,150 Z" fill="url(#cg)" />
                                        <path d="M0,120 Q50,110 80,60 T160,80 T240,40 T320,90 T400,30" fill="none" stroke="#64748b" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
                                    {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(d => (
                                        <span key={d} style={{ fontSize: '9px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b' }}>Pedidos Recientes</h3>
                                <button onClick={() => setActiveTab('sales')} style={{ color: '#fff', background: 'none', border: 'none', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', textDecoration: 'underline' }}>Ver todos</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                                {localSales.slice(0, 3).map(sale => (
                                    <div key={sale.id} style={{ background: 'rgba(30,41,59,0.3)', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}>
                                                <ShoppingBag size={18} color="#64748b" />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '700', fontSize: '13px', color: '#fff', letterSpacing: '0.05em' }}>ORDEN #{sale.id.slice(0, 6).toUpperCase()}</p>
                                                <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>{new Date(sale.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: '900', fontSize: '13px', color: '#fff' }}>${sale.total.toLocaleString()}</p>
                                            <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: sale.status === 'Enviado' ? '#3b82f6' : '#f59e0b' }}>{sale.status || 'Pendiente'}</span>
                                        </div>
                                    </div>
                                ))}
                                {localSales.length === 0 && <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px' }}>No hay pedidos todavía.</p>}
                            </div>

                            {/* Stock Management */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b' }}>Gestión de Stock</h3>
                                <button onClick={() => handleOpenModal()} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Plus size={20} /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {stock.map(item => (
                                    <div key={item.id} style={{ background: '#1e293b', border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                                        <div style={{ padding: '16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15,23,42,0.4)' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', overflow: 'hidden', flexShrink: 0 }}>
                                                {item.image && <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '13px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.name}</p>
                                                <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>${item.price.toLocaleString()}</p>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    {item.category && <span style={{ padding: '2px 8px', background: '#1e293b', fontSize: '9px', fontWeight: '700', color: '#64748b', borderRadius: '2px' }}>{item.category.toUpperCase()}</span>}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleOpenModal(item)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div style={{ overflowX: 'auto', padding: '16px', display: 'flex', gap: '12px' }}>
                                            {Object.entries(item.variants).map(([size, count]) => (
                                                <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: '900', color: count === 0 ? '#ef4444' : '#64748b' }}>{size}</span>
                                                    <div style={{ width: '44px', height: '44px', borderRadius: '4px', border: `1px solid ${count === 0 ? 'rgba(239,68,68,0.5)' : '#334155'}`, background: count === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(30,41,59,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: count === 0 ? '#ef4444' : '#f1f5f9' }}>
                                                        {count === 0 ? '✕' : count}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ padding: '12px 16px', background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleOpenModal(item)} style={{ background: '#ffffff', color: '#000000', border: 'none', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer' }}>Actualizar Inventario</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tienda Digital Quick Actions */}
                            <div style={{ marginTop: '32px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', marginBottom: '16px' }}>Tienda Digital</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                    {[{ icon: '🎨', label: 'Estética' }, { icon: '🖼️', label: 'Banners' }, { icon: '📦', label: 'Productos', action: () => handleOpenModal() }, { icon: '💰', label: 'Precios' }].map(item => (
                                        <button key={item.label} onClick={item.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '16px', background: 'rgba(30,41,59,0.3)', border: '1px solid #1e293b', borderRadius: '8px', gap: '12px', cursor: 'pointer' }}>
                                            <span style={{ fontSize: '20px' }}>{item.icon}</span>
                                            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e2e8f0' }}>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VENTAS */}
                    {activeTab === 'sales' && (
                        <div className="reveal active">
                            <h2 className="font-display" style={{ fontSize: '24px', fontWeight: '900', marginBottom: '20px' }}>ORDENES</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {localSales.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No hay ventas registradas.</p>}
                                {localSales.map(sale => (
                                    <div key={sale.id} className="glass-card" style={{ padding: '20px', borderRadius: '4px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                                <ShoppingBag size={18} color="var(--text-primary)" />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }}>ORDEN #{sale.id.slice(0, 6).toUpperCase()}</h4>
                                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(sale.created_at).toLocaleDateString()} • {new Date(sale.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>

                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            {sale.items && sale.items.map((item, idx) => (
                                                <p key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    <span style={{ color: '#fff', fontWeight: '700' }}>{item.quantity}x</span> {item.name} ({item.size})
                                                </p>
                                            ))}
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>${sale.total.toLocaleString()}</p>
                                        </div>

                                        {/* STATUS SELECTOR */}
                                        <select
                                            value={sale.status || 'Pendiente'}
                                            onChange={(e) => handleUpdateStatus(sale.id, e.target.value)}
                                            style={{
                                                background: 'transparent',
                                                border: `1px solid ${getStatusColor(sale.status)}`,
                                                color: getStatusColor(sale.status),
                                                padding: '8px 15px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="Pendiente" style={{ background: '#000', color: '#ffaa00' }}>PENDIENTE</option>
                                            <option value="Enviado" style={{ background: '#000', color: '#00ff88' }}>ENVIADO</option>
                                            <option value="Entregado" style={{ background: '#000', color: '#00ccff' }}>ENTREGADO</option>
                                            <option value="Cancelado" style={{ background: '#000', color: '#ff4444' }}>CANCELADO</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STATS */}
                    {activeTab === 'stats' && (
                        <div className="reveal active">
                            <h2 className="font-display" style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px' }}>METRICAS</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div className="glass-card" style={{ padding: '30px' }}>
                                    <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '10px' }}>INGRESOS TOTALES</p>
                                    <h3 style={{ fontSize: '32px', fontWeight: '900' }}>${totalRevenue.toLocaleString()}</h3>
                                </div>
                                <div className="glass-card" style={{ padding: '30px' }}>
                                    <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '10px' }}>ITEMS VENDIDOS</p>
                                    <h3 style={{ fontSize: '32px', fontWeight: '900' }}>{totalItemsSold}</h3>
                                </div>
                                <div className="glass-card" style={{ padding: '30px' }}>
                                    <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '10px' }}>ALERTA DE STOCK</p>
                                    <h3 style={{ fontSize: '32px', fontWeight: '900', color: lowStockCount > 0 ? '#ff4444' : '#fff' }}>{lowStockCount}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="reveal active">
                            <h2 className="font-display" style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px' }}>CLIENTES</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Próximamente: Base de datos de clientes integrada.</p>
                        </div>
                    )}

                </div>
            </div>

            {/* BOTTOM NAVIGATION - Stitch Admin Style */}
            <nav style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                background: 'rgba(15,23,42,0.95)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid #1e293b',
                padding: '12px 32px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100,
            }}>
                {[
                    { id: 'stock', icon: '⊞', label: 'Dashboard' },
                    { id: 'sales', icon: '🛍', label: 'Pedidos' },
                    { id: 'stats', icon: '📊', label: 'Métricas' },
                    { id: 'users', icon: '⚙', label: 'Ajustes' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                            color: activeTab === tab.id ? '#ffffff' : '#475569',
                            background: 'none', border: 'none', cursor: 'pointer',
                        }}
                    >
                        <span style={{ fontSize: '22px', lineHeight: 1 }}>{tab.icon}</span>
                        <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Inter', sans-serif" }}>{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }} onClick={() => setIsModalOpen(false)}>
                    <div style={{ width: '100%', maxWidth: '500px', background: '#0f172a', borderRadius: '16px 16px 0 0', padding: '32px 24px 48px', border: '1px solid #1e293b' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>Editor de Producto</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: '#1e293b', border: 'none', color: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[{ label: 'URL Imagen', key: 'image', type: 'text', placeholder: 'https://' }, { label: 'Nombre', key: 'name', type: 'text' }, { label: 'Precio', key: 'price', type: 'number' }].map(field => (
                                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Inter', sans-serif" }}>{field.label}</label>
                                    <input
                                        type={field.type}
                                        value={formData[field.key]}
                                        onChange={(e) => { if (field.key === 'image') { handleImageChange(e); } else { setFormData({ ...formData, [field.key]: field.type === 'number' ? parseInt(e.target.value) : e.target.value }); } }}
                                        placeholder={field.placeholder}
                                        style={{ background: '#1e293b', border: '1px solid #334155', padding: '12px 16px', color: '#f1f5f9', outline: 'none', borderRadius: '6px', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}
                                    />
                                </div>
                            ))}

                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Inter', sans-serif", display: 'block', marginBottom: '10px' }}>Stock por Talle</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {SIZES.map(size => (
                                        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>{size}</span>
                                            <input
                                                type="number"
                                                value={formData.variants[size]}
                                                onChange={(e) => handleVariantChange(size, e.target.value)}
                                                style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px', color: '#f1f5f9', textAlign: 'center', borderRadius: '6px', width: '100%', outline: 'none', fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '700' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleSave} style={{ width: '100%', marginTop: '8px', background: '#ffffff', color: '#000000', border: 'none', padding: '16px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', borderRadius: '8px', fontFamily: "'Inter', sans-serif" }}>
                                GUARDAR CAMBIOS
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
