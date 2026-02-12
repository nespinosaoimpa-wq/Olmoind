import React, { useState, useRef } from 'react';
import {
    Package, Users, BarChart2, ArrowLeft, Plus, Edit2,
    Trash2, X, Save, ShoppingBag, Upload, Monitor, Smartphone,
    ChevronRight, CreditCard, Clock
} from 'lucide-react';
import { useStockStore } from '../store/useStockStore';

const AdminDashboard = ({ onBack }) => {
    const { stock, sales, updateStock, addStockItem, deleteStockItem, registerSale } = useStockStore();
    const [activeTab, setActiveTab] = useState('stock');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        size: 'M',
        count: 0,
        price: 0,
        image: ''
    });

    // Stats based on sales
    const totalRevenue = sales.reduce((acc, sale) => {
        return acc + sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, 0);

    const totalItemsSold = sales.reduce((acc, sale) => {
        return acc + sale.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    const lowStockCount = stock.filter(item => item.count < 10).length;

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                size: item.size,
                count: item.count,
                price: item.price,
                image: item.image || ''
            });
            setPreviewImage(item.image || null);
        } else {
            setEditingItem(null);
            setFormData({ name: '', size: 'M', count: 0, price: 0, image: '' });
            setPreviewImage(null);
        }
        setIsModalOpen(true);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (editingItem) {
            updateStock(editingItem.id, formData);
        } else {
            addStockItem(formData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿ELIMINAR ESTE PRODUCTO?')) {
            deleteStockItem(id);
        }
    };

    const tabs = [
        { id: 'stock', label: 'Inventario', icon: <Package size={20} /> },
        { id: 'sales', label: 'Ventas', icon: <ShoppingBag size={20} /> },
        { id: 'users', label: 'Clientes', icon: <Users size={20} /> },
        { id: 'stats', label: 'Estadísticas', icon: <BarChart2 size={20} /> }
    ];

    return (
        <div style={{
            backgroundColor: 'var(--bg-primary)',
            minHeight: '100vh',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-main)',
            position: 'relative'
        }}>
            {/* Header / Top Bar */}
            <div style={{
                background: 'var(--bg-secondary)',
                padding: '20px 40px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: '800', fontSize: '11px' }}>
                        <ArrowLeft size={16} /> <span className="hide-mobile">SALIR</span>
                    </button>
                    <h1 className="font-display" style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '4px', color: '#fff' }}>OLMO ADMIN</h1>
                </div>

                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="show-mobile"
                    style={{ color: 'var(--accent)' }}
                >
                    <X size={24} style={{ display: isMobileMenuOpen ? 'block' : 'none' }} />
                    <Monitor size={24} style={{ display: isMobileMenuOpen ? 'none' : 'block' }} />
                </button>
            </div>

            <div className="container" style={{ padding: '40px' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                    gap: '40px'
                }}>
                    {/* Sidebar / Nav */}
                    <div style={{
                        display: window.innerWidth < 768 && !isMobileMenuOpen ? 'none' : 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        width: window.innerWidth < 768 ? '100%' : '260px',
                        flexShrink: 0
                    }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderRadius: '1px',
                                    backgroundColor: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-secondary)',
                                    color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                                    fontWeight: '900',
                                    transition: '0.3s',
                                    border: '1px solid var(--border-color)',
                                    letterSpacing: '2px',
                                    fontSize: '10px',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {tab.icon} {tab.label}
                                <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: activeTab === tab.id ? 1 : 0 }} />
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div style={{
                        flex: 1,
                        background: 'var(--bg-secondary)',
                        padding: '40px',
                        borderRadius: '1px',
                        border: '1px solid var(--border-color)',
                        overflowX: 'auto'
                    }}>
                        {activeTab === 'stock' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                                    <div>
                                        <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '2px', marginBottom: '10px' }}>INVENTARIO</h2>
                                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>GESTIONA TUS PRODUCTOS Y STOCK REAL</p>
                                    </div>
                                    <button
                                        onClick={() => handleOpenModal()}
                                        className="btn-primary"
                                        style={{ background: 'var(--accent)', color: '#fff', padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '900' }}>
                                        <Plus size={18} /> NUEVO ARTÍCULO
                                    </button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--accent)', fontSize: '10px', letterSpacing: '2px' }}>
                                                <th style={{ padding: '20px 15px' }}>INFO</th>
                                                <th style={{ padding: '20px 15px' }}>PRODUCTO</th>
                                                <th style={{ padding: '20px 15px' }}>TALLE</th>
                                                <th style={{ padding: '20px 15px' }}>STOCK</th>
                                                <th style={{ padding: '20px 15px' }}>PRECIO</th>
                                                <th style={{ padding: '20px 15px', textAlign: 'right' }}>ACCIONES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stock.map(item => (
                                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '13px' }}>
                                                    <td style={{ padding: '15px' }}>
                                                        <div style={{ width: '40px', height: '50px', background: '#333', overflow: 'hidden' }}>
                                                            {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px', fontWeight: '800', color: '#fff' }}>{item.name}</td>
                                                    <td style={{ padding: '15px', color: 'var(--text-secondary)', fontWeight: '700' }}>{item.size}</td>
                                                    <td style={{ padding: '15px', color: item.count < 5 ? '#ff4444' : '#fff', fontWeight: '900' }}>
                                                        {item.count}
                                                    </td>
                                                    <td style={{ padding: '15px', color: '#fff' }}>${item.price.toLocaleString()}</td>
                                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                                                            <button onClick={() => handleOpenModal(item)} style={{ color: 'var(--accent)' }}><Edit2 size={16} /></button>
                                                            <button onClick={() => handleDelete(item.id)} style={{ color: '#ff4444' }}><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'sales' && (
                            <div>
                                <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '900', marginBottom: '10px', letterSpacing: '2px' }}>ORDENES Y VENTAS</h2>
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '40px', fontWeight: '600' }}>HISTORIAL DE MOVIMIENTOS Y DESCUENTO DE STOCK</p>

                                {sales.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '100px 0', border: '1px dashed var(--border-color)' }}>
                                        <Clock size={40} color="var(--accent)" style={{ marginBottom: '20px' }} />
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', letterSpacing: '2px' }}>NO HAY VENTAS REGISTRADAS AÚN</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {sales.slice().reverse().map(sale => (
                                            <div key={sale.id} style={{
                                                background: 'var(--bg-primary)',
                                                padding: '25px',
                                                border: '1px solid var(--border-color)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                flexWrap: 'wrap',
                                                gap: '20px'
                                            }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                                        <span style={{ fontSize: '10px', padding: '4px 8px', background: 'var(--accent)', color: '#fff', fontWeight: '900' }}>ORDEN #{sale.id.toString().slice(-4)}</span>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(sale.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        {sale.items.map((item, idx) => (
                                                            <p key={idx} style={{ fontSize: '13px', fontWeight: '700' }}>
                                                                {item.quantity}x {item.name} <span style={{ color: 'var(--accent)' }}>({item.size})</span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '5px' }}>TOTAL</p>
                                                    <p style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent)' }}>
                                                        ${sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div>
                                <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '900', marginBottom: '40px', letterSpacing: '2px' }}>BASE DE CLIENTES</h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--accent)', fontSize: '10px', letterSpacing: '2px' }}>
                                            <th style={{ padding: '20px 15px' }}>NOMBRE</th>
                                            <th style={{ padding: '20px 15px' }}>EMAIL</th>
                                            <th style={{ padding: '20px 15px' }}>TOTAL PEDIDOS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { id: 1, name: 'NICOLÁS OLMO', email: 'NICO@OLMO.COM', orders: sales.length },
                                            { id: 2, name: 'MARCOS RUIZ', email: 'MARCOS@STREET.COM', orders: 0 },
                                        ].map(user => (
                                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '15px', fontWeight: '800', color: '#fff' }}>{user.name}</td>
                                                <td style={{ padding: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>{user.email}</td>
                                                <td style={{ padding: '15px', color: '#fff', fontWeight: '900' }}>{user.orders}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div>
                                <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '900', marginBottom: '40px', letterSpacing: '2px' }}>DESEMPEÑO REAL</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                    <div style={{ padding: '30px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                                        <p style={{ fontSize: '10px', color: 'var(--accent)', marginBottom: '15px', letterSpacing: '3px', fontWeight: '900' }}>RECAUDACIÓN TOTAL</p>
                                        <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>${totalRevenue.toLocaleString()}</h3>
                                    </div>
                                    <div style={{ padding: '30px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                                        <p style={{ fontSize: '10px', color: 'var(--accent)', marginBottom: '15px', letterSpacing: '3px', fontWeight: '900' }}>ARTÍCULOS VENDIDOS</p>
                                        <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>{totalItemsSold}</h3>
                                    </div>
                                    <div style={{ padding: '30px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                                        <p style={{ fontSize: '10px', color: 'var(--accent)', marginBottom: '15px', letterSpacing: '3px', fontWeight: '900' }}>ALERTAS STOCK</p>
                                        <h3 style={{ fontSize: '28px', fontWeight: '900', color: lowStockCount > 0 ? '#ff4444' : '#fff' }}>{lowStockCount}</h3>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.98)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
                    <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '40px',
                        width: '100%',
                        maxWidth: '500px',
                        borderRadius: '1px',
                        border: '1px solid var(--accent)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <h3 className="font-display" style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '2px' }}>{editingItem ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--accent)' }}><X /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            {/* Image Upload Area */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '900', letterSpacing: '2px' }}>FOTO DEL PRODUCTO</label>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        background: 'var(--bg-primary)',
                                        border: '1px dashed var(--border-color)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {previewImage ? (
                                        <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <>
                                            <Upload size={30} color="var(--accent)" style={{ marginBottom: '10px' }} />
                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800' }}>SUBIR DESDE GALERÍA</span>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '900', letterSpacing: '2px' }}>NOMBRE</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '18px', color: '#fff', fontSize: '14px', fontWeight: '700' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '900', letterSpacing: '2px' }}>TALLE</label>
                                    <select
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '18px', color: '#fff', fontWeight: '700' }}>
                                        <option>S</option><option>M</option><option>L</option><option>XL</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '900', letterSpacing: '2px' }}>STOCK</label>
                                    <input
                                        type="number"
                                        value={formData.count}
                                        onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '18px', color: '#fff', fontWeight: '700' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '900', letterSpacing: '2px' }}>PRECIO</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '18px', color: '#fff', fontWeight: '800' }} />
                            </div>

                            <button
                                onClick={handleSave}
                                className="btn-primary"
                                style={{ background: 'var(--accent)', color: '#fff', padding: '20px', fontWeight: '900', marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Save size={18} /> {editingItem ? 'ACTUALIZAR ARTÍCULO' : 'DAR DE ALTA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Mobile Styles Injection */}
            <style>{`
                @media (max-width: 768px) {
                    .hide-mobile { display: none; }
                    .show-mobile { display: block; }
                    .container { padding: 20px !important; }
                }
                @media (min-width: 769px) {
                    .show-mobile { display: none; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
