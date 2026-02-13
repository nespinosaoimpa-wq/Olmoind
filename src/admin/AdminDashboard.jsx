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
            backgroundColor: 'var(--bg-deep)',
            minHeight: '100vh',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            paddingBottom: '50px'
        }}>
            {/* TOP BAR */}
            <div className="glass-card" style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                borderBottom: '1px solid var(--border-subtle)',
                padding: '15px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(5,5,5,0.8)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                        <ArrowLeft size={16} /> SALIR
                    </button>
                    <h1 className="font-display" style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '4px' }}>OLMO<span style={{ color: 'var(--accent-dim)' }}>.ADMIN</span></h1>
                </div>

                <div className="show-mobile">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'none', border: 'none', color: '#fff' }}>
                        {isMobileMenuOpen ? <X /> : <Monitor />}
                    </button>
                </div>
            </div>

            <div className="container" style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', gap: '40px' }}>

                    {/* SIDEBAR */}
                    <div style={{
                        width: window.innerWidth < 768 ? '100%' : '250px',
                        display: window.innerWidth < 768 && !isMobileMenuOpen ? 'none' : 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px',
                                    borderRadius: '4px',
                                    background: activeTab === tab.id ? 'var(--text-primary)' : 'transparent',
                                    color: activeTab === tab.id ? '#000' : 'var(--text-secondary)',
                                    border: activeTab === tab.id ? 'none' : '1px solid var(--border-subtle)',
                                    fontWeight: '700',
                                    fontSize: '11px',
                                    letterSpacing: '1px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {tab.icon} {tab.label}
                                {activeTab === tab.id && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                            </button>
                        ))}
                    </div>

                    {/* MAIN CONTENT */}
                    <div style={{ flex: 1 }}>

                        {/* INVENTARIO */}
                        {activeTab === 'stock' && (
                            <div className="reveal active">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                                    <div>
                                        <h2 className="font-display" style={{ fontSize: '24px', fontWeight: '900' }}>INVENTARIO</h2>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{stock.length} PRODUCTOS ACTIVOS</p>
                                    </div>
                                    <button onClick={() => handleOpenModal()} className="btn-primary" style={{ padding: '10px 20px' }}>
                                        <Plus size={16} style={{ marginRight: '8px' }} /> AGREGAR
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                    {stock.map(item => {
                                        const totalStock = Object.values(item.variants).reduce((a, b) => a + b, 0);
                                        return (
                                            <div key={item.id} className="glass-card" style={{ padding: '20px', borderRadius: '4px', position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                    <span style={{ fontSize: '10px', background: '#333', padding: '4px 8px', borderRadius: '2px' }}>{item.category || 'GENERAL'}</span>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => handleOpenModal(item)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                                        <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                                    <div style={{ width: '60px', height: '80px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                                                        {item.image && <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    </div>
                                                    <div>
                                                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '5px' }}>{item.name}</h3>
                                                        <p style={{ fontSize: '16px', fontWeight: '400', color: 'var(--text-secondary)' }}>${item.price.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                    {Object.entries(item.variants).map(([size, count]) => (
                                                        <div key={size} style={{ fontSize: '10px', background: count > 0 ? '#1a1a1a' : '#220000', padding: '4px 8px', borderRadius: '2px', border: count > 0 ? '1px solid #333' : '1px solid #550000', color: count > 0 ? '#fff' : '#ff4444' }}>
                                                            {size}: <span style={{ fontWeight: '900' }}>{count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
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
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '40px', borderRadius: '4px', border: '1px solid var(--text-primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <h3 className="font-display">EDITOR DE PRODUCTO</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}><X /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)' }}>URL IMAGEN</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={handleImageChange}
                                    style={{ background: '#111', border: '1px solid #333', padding: '15px', color: '#fff', outline: 'none' }}
                                    placeholder="https://"
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)' }}>NOMBRE</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                    style={{ background: '#111', border: '1px solid #333', padding: '15px', color: '#fff', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)' }}>PRECIO</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                    style={{ background: '#111', border: '1px solid #333', padding: '15px', color: '#fff', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)' }}>STOCK POR TALLE</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' }}>
                                    {SIZES.map(size => (
                                        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <span style={{ fontSize: '10px', color: '#666' }}>{size}</span>
                                            <input
                                                type="number"
                                                value={formData.variants[size]}
                                                onChange={(e) => handleVariantChange(size, e.target.value)}
                                                style={{ background: '#111', border: '1px solid #333', padding: '10px', color: '#fff', textAlign: 'center' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleSave} className="btn-primary" style={{ width: '100%', marginTop: '20px', background: 'var(--text-primary)', color: '#000', borderColor: 'var(--text-primary)' }}>
                                GUARDAR CAMBIOS
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .show-mobile { display: none; }
                @media (max-width: 768px) {
                    .show-mobile { display: block; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
