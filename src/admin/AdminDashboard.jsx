import React, { useState, useEffect, useRef } from 'react';
import {
    Package, BarChart2, ArrowLeft, Plus, Edit2,
    Trash2, X, ShoppingBag, Phone, Mail, MapPin, Instagram,
    Image, Palette, Tag, LayoutGrid, Save, Check, Upload, Loader
} from 'lucide-react';
import { useStockStore } from '../store/useStockStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { supabase } from '../supabaseClient';
import Resizer from 'react-image-file-resizer';

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle = {
    background: '#1e293b', border: '1px solid #334155',
    padding: '12px 16px', color: '#f1f5f9', outline: 'none',
    borderRadius: '8px', fontSize: '14px', fontFamily: "'Inter', sans-serif",
    width: '100%', boxSizing: 'border-box',
};
const labelStyle = {
    fontSize: '10px', fontWeight: '700', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    fontFamily: "'Inter', sans-serif", display: 'block', marginBottom: '6px',
};
const card = {
    background: 'rgba(30,41,59,0.4)', border: '1px solid #1e293b',
    borderRadius: '10px', padding: '20px', marginBottom: '12px',
};
const sectionTitle = {
    fontSize: '11px', fontWeight: '900', textTransform: 'uppercase',
    letterSpacing: '0.15em', color: '#64748b', marginBottom: '16px',
};

const AdminDashboard = ({ onBack }) => {
    const { stock, updateStock, addProduct, deleteProduct, fetchProducts } = useStockStore();
    const { settings, fetchSettings, updateSetting, subscribeToSettings, uploadImage } = useSettingsStore();

    const [activeTab, setActiveTab] = useState('stock');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [localSales, setLocalSales] = useState([]);
    const [savedMsg, setSavedMsg] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

    // ── Product form ──────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        name: '', price: 0, image: '', category: '',
        variants: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
    });
    const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    // ── Local editable copies of settings ────────────────────────────────────
    const [contact, setContact] = useState({});
    const [hero, setHero] = useState({});
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newBannerUrl, setNewBannerUrl] = useState('');
    const [newCategory, setNewCategory] = useState('');

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalRevenue = localSales.reduce((acc, s) => acc + s.total, 0);
    const totalItemsSold = localSales.reduce((acc, s) => acc + (s.items || []).reduce((sum, i) => sum + i.quantity, 0), 0);
    const lowStockCount = stock.filter(item => Object.values(item.variants).reduce((a, b) => a + b, 0) < 10).length;

    useEffect(() => {
        fetchProducts();
        fetchSettings();
        const unsubscribe = subscribeToSettings();

        const fetchSales = async () => {
            const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
            if (data) setLocalSales(data);
        };
        fetchSales();

        return unsubscribe;
    }, []);

    // Sync local editable state when settings load from Supabase
    useEffect(() => {
        setContact(settings.contact || {});
        setHero(settings.hero || {});
        setBanners(Array.isArray(settings.banners) ? settings.banners : []);
        setCategories(Array.isArray(settings.categories) ? settings.categories : []);
    }, [settings]);

    // ── Save helpers ──────────────────────────────────────────────────────────
    const showSaved = () => {
        setSavedMsg('¡Guardado!');
        setTimeout(() => setSavedMsg(''), 2500);
    };

    // ── Image upload from device ──────────────────────────────────────────────
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            // Resize image before upload
            const resizedImage = await new Promise((resolve) => {
                Resizer.imageFileResizer(
                    file,
                    1200, // max width
                    1200, // max height
                    'JPEG',
                    80, // quality
                    0, // rotation
                    (uri) => resolve(uri),
                    'blob' // output type
                );
            });

            const publicUrl = await uploadImage(resizedImage);
            setFormData(prev => ({ ...prev, image: publicUrl }));
        } catch (err) {
            console.error('Resize/Upload error:', err);
            alert('Error al procesar/subir imagen: ' + err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    // ── Product handlers ──────────────────────────────────────────────────────
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ name: item.name, price: item.price, image: item.image || '', category: item.category || '', variants: { ...item.variants } });
        } else {
            setEditingItem(null);
            setFormData({ name: '', price: 0, image: '', category: '', variants: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 } });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (editingItem) {
            await updateStock(editingItem.id, formData.variants);
            await supabase.from('products').update({
                name: formData.name, price: formData.price,
                image: formData.image, category: formData.category
            }).eq('id', editingItem.id);
        } else {
            await addProduct(formData);
        }
        setIsModalOpen(false);
        fetchProducts();
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este producto?')) {
            await deleteProduct(id);
            fetchProducts();
        }
    };

    const handleUpdateStatus = async (saleId, newStatus) => {
        setLocalSales(localSales.map(s => s.id === saleId ? { ...s, status: newStatus } : s));
        await supabase.from('sales').update({ status: newStatus }).eq('id', saleId);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Enviado': return '#3b82f6';
            case 'Entregado': return '#10b981';
            case 'Cancelado': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    // ── Shared UI components ──────────────────────────────────────────────────
    const SectionHeader = ({ title, action }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={sectionTitle}>{title}</h3>
            {action}
        </div>
    );

    const SaveButton = ({ onClick, label = 'Guardar' }) => (
        <button onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#ffffff', color: '#000', border: 'none',
            padding: '12px 24px', borderRadius: '8px', fontSize: '11px',
            fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginTop: '8px',
        }}>
            <Save size={14} /> {label}
        </button>
    );

    const navTabs = [
        { id: 'stock', icon: <LayoutGrid size={20} />, label: 'Dashboard' },
        { id: 'sales', icon: <ShoppingBag size={20} />, label: 'Pedidos' },
        { id: 'stats', icon: <BarChart2 size={20} />, label: 'Métricas' },
        { id: 'settings', icon: <Palette size={20} />, label: 'Tienda' },
    ];

    return (
        <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9', fontFamily: "'Inter', sans-serif", paddingBottom: '96px' }}>

            {/* TOP BAR */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #1e293b', padding: '12px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#000', fontWeight: '900', fontSize: '18px', fontFamily: "'Montserrat', sans-serif" }}>O</span>
                    </div>
                    <h1 style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f1f5f9' }}>Olmo Admin <span style={{ opacity: 0.5, fontSize: '10px' }}>v1.7.4</span></h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {savedMsg && (
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> {savedMsg}
                        </span>
                    )}
                    <button onClick={onBack} style={{ padding: '8px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <ArrowLeft size={18} />
                    </button>
                </div>
            </header>

            <div style={{ padding: '16px' }}>

                {/* ── DASHBOARD ─────────────────────────────────────────────── */}
                {activeTab === 'stock' && (
                    <div>
                        {/* Revenue */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div>
                                <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Reporte Mensual</p>
                                <h2 style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-1px', color: '#fff' }}>${totalRevenue.toLocaleString()},00</h2>
                            </div>
                            <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', border: '1px solid rgba(16,185,129,0.2)' }}>
                                ↑ {localSales.length} ventas
                            </div>
                        </div>

                        {/* Chart */}
                        <div style={{ ...card, marginBottom: '32px' }}>
                            <div style={{ height: '100px' }}>
                                <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="cg" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,80 Q50,70 80,40 T160,55 T240,25 T320,60 T400,20 L400,100 L0,100 Z" fill="url(#cg)" />
                                    <path d="M0,80 Q50,70 80,40 T160,55 T240,25 T320,60 T400,20" fill="none" stroke="#475569" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
                                {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(d => (
                                    <span key={d} style={{ fontSize: '9px', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>{d}</span>
                                ))}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <SectionHeader title="Pedidos Recientes" action={
                            <button onClick={() => setActiveTab('sales')} style={{ color: '#fff', background: 'none', border: 'none', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', textDecoration: 'underline' }}>Ver todos</button>
                        } />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                            {localSales.slice(0, 3).map(sale => (
                                <div key={sale.id} style={{ ...card, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}>
                                            <ShoppingBag size={16} color="#64748b" />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '700', fontSize: '12px', color: '#fff' }}>#{sale.id.slice(0, 6).toUpperCase()}</p>
                                            <p style={{ fontSize: '10px', color: '#64748b' }}>{new Date(sale.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: '900', fontSize: '13px', color: '#fff' }}>${sale.total.toLocaleString()}</p>
                                        <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', color: getStatusColor(sale.status) }}>{sale.status || 'Pendiente'}</span>
                                    </div>
                                </div>
                            ))}
                            {localSales.length === 0 && <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px' }}>No hay pedidos todavía.</p>}
                        </div>

                        {/* Stock */}
                        <SectionHeader title="Gestión de Stock" action={
                            <button onClick={() => handleOpenModal()} style={{ background: '#334155', border: 'none', color: '#f1f5f9', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Plus size={16} />
                            </button>
                        } />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {stock.map(item => (
                                <div key={item.id} style={{ background: '#1e293b', borderRadius: '10px', overflow: 'hidden', border: '1px solid #334155' }}>
                                    <div style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', overflow: 'hidden', flexShrink: 0 }}>
                                            {item.image && <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#fff', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                                            <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>${item.price.toLocaleString()} {item.category && `· ${item.category}`}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                            <button onClick={() => handleOpenModal(item)} style={{ background: '#334155', border: 'none', color: '#94a3b8', borderRadius: '6px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={13} /></button>
                                            <button onClick={() => handleDelete(item.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: '6px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={13} /></button>
                                        </div>
                                    </div>
                                    <div style={{ overflowX: 'auto', padding: '0 14px 14px', display: 'flex', gap: '8px' }}>
                                        {Object.entries(item.variants).map(([size, count]) => (
                                            <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                                <span style={{ fontSize: '9px', fontWeight: '900', color: count === 0 ? '#ef4444' : '#64748b' }}>{size}</span>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '6px',
                                                    border: `1px solid ${count === 0 ? 'rgba(239,68,68,0.4)' : '#334155'}`,
                                                    background: count === 0 ? 'rgba(239,68,68,0.08)' : 'rgba(30,41,59,0.5)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '12px', fontWeight: '700',
                                                    color: count === 0 ? '#ef4444' : '#f1f5f9',
                                                }}>
                                                    {count === 0 ? '—' : count}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {stock.length === 0 && <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '32px' }}>No hay productos. Usá el botón + para agregar.</p>}
                        </div>
                    </div>
                )}

                {/* ── PEDIDOS ───────────────────────────────────────────────── */}
                {activeTab === 'sales' && (
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-0.5px' }}>Órdenes</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {localSales.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No hay ventas registradas.</p>}
                            {localSales.map(sale => (
                                <div key={sale.id} style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid #334155' }}>
                                            <ShoppingBag size={16} color="#64748b" />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#fff' }}>ORDEN #{sale.id.slice(0, 6).toUpperCase()}</h4>
                                            <p style={{ fontSize: '10px', color: '#64748b' }}>{new Date(sale.created_at).toLocaleDateString()} · {new Date(sale.created_at).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: '160px' }}>
                                        {(sale.items || []).map((item, idx) => (
                                            <p key={idx} style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                <span style={{ color: '#fff', fontWeight: '700' }}>{item.quantity}x</span> {item.name} ({item.size})
                                            </p>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <p style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>${sale.total.toLocaleString()}</p>
                                        <select
                                            value={sale.status || 'Pendiente'}
                                            onChange={(e) => handleUpdateStatus(sale.id, e.target.value)}
                                            style={{
                                                background: 'transparent',
                                                border: `1px solid ${getStatusColor(sale.status)}`,
                                                color: getStatusColor(sale.status),
                                                padding: '6px 12px', borderRadius: '20px',
                                                fontSize: '10px', fontWeight: '700', cursor: 'pointer', outline: 'none',
                                            }}
                                        >
                                            <option value="Pendiente" style={{ background: '#0f172a', color: '#f59e0b' }}>PENDIENTE</option>
                                            <option value="Enviado" style={{ background: '#0f172a', color: '#3b82f6' }}>ENVIADO</option>
                                            <option value="Entregado" style={{ background: '#0f172a', color: '#10b981' }}>ENTREGADO</option>
                                            <option value="Cancelado" style={{ background: '#0f172a', color: '#ef4444' }}>CANCELADO</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── MÉTRICAS ──────────────────────────────────────────────── */}
                {activeTab === 'stats' && (
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-0.5px' }}>Métricas</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
                            {[
                                { label: 'Ingresos Totales', value: `$${totalRevenue.toLocaleString()}`, color: '#10b981' },
                                { label: 'Items Vendidos', value: totalItemsSold, color: '#3b82f6' },
                                { label: 'Órdenes', value: localSales.length, color: '#a78bfa' },
                                { label: 'Stock Bajo', value: lowStockCount, color: lowStockCount > 0 ? '#ef4444' : '#10b981' },
                            ].map(m => (
                                <div key={m.label} style={{ ...card, marginBottom: 0 }}>
                                    <p style={{ fontSize: '9px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{m.label}</p>
                                    <h3 style={{ fontSize: '26px', fontWeight: '900', color: m.color, letterSpacing: '-1px' }}>{m.value}</h3>
                                </div>
                            ))}
                        </div>
                        <div style={card}>
                            <p style={sectionTitle}>Productos con stock bajo (&lt;10 unidades)</p>
                            {stock.filter(item => Object.values(item.variants).reduce((a, b) => a + b, 0) < 10).map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                                    <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '600' }}>{item.name}</span>
                                    <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '900' }}>{Object.values(item.variants).reduce((a, b) => a + b, 0)} uds.</span>
                                </div>
                            ))}
                            {lowStockCount === 0 && <p style={{ color: '#10b981', fontSize: '13px', textAlign: 'center', padding: '16px' }}>✓ Todo el stock está en buen nivel</p>}
                        </div>
                    </div>
                )}

                {/* ── TIENDA ────────────────────────────────────────────────── */}
                {activeTab === 'settings' && (
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-0.5px' }}>Configuración de Tienda</h2>

                        {/* CONTACTO */}
                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ width: '32px', height: '32px', background: 'rgba(59,130,246,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Phone size={16} color="#3b82f6" />
                                </div>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Datos de Contacto</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { key: 'whatsapp', label: 'WhatsApp (número)', placeholder: '543434559599' },
                                    { key: 'instagram', label: 'Instagram (sin @)', placeholder: 'olmo.ind' },
                                    { key: 'email', label: 'Email', placeholder: 'olmoshowroom@gmail.com' },
                                    { key: 'address', label: 'Dirección', placeholder: 'Cervantes 35 local A' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label style={labelStyle}>{f.label}</label>
                                        <input
                                            type="text"
                                            value={contact[f.key] || ''}
                                            onChange={e => setContact({ ...contact, [f.key]: e.target.value })}
                                            placeholder={f.placeholder}
                                            style={inputStyle}
                                        />
                                    </div>
                                ))}
                                <SaveButton onClick={async () => { await updateSetting('contact', contact); showSaved(); }} />
                            </div>
                        </div>

                        {/* ESTÉTICA */}
                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ width: '32px', height: '32px', background: 'rgba(167,139,250,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Palette size={16} color="#a78bfa" />
                                </div>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Estética del Hero</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { key: 'title', label: 'Título principal', placeholder: 'OLMO' },
                                    { key: 'subtitle', label: 'Subtítulo', placeholder: 'INDUMENTARIA' },
                                    { key: 'cta', label: 'Texto del botón CTA', placeholder: 'Ver Colección' },
                                    { key: 'bgColor', label: 'Color de fondo (CSS)', placeholder: 'linear-gradient(180deg, #F9F9F9 0%, #E2E2E2 100%)' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label style={labelStyle}>{f.label}</label>
                                        <input
                                            type="text"
                                            value={hero[f.key] || ''}
                                            onChange={e => setHero({ ...hero, [f.key]: e.target.value })}
                                            placeholder={f.placeholder}
                                            style={inputStyle}
                                        />
                                    </div>
                                ))}
                                <SaveButton onClick={async () => { await updateSetting('hero', hero); showSaved(); }} />
                            </div>
                        </div>

                        {/* BANNERS */}
                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ width: '32px', height: '32px', background: 'rgba(16,185,129,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Image size={16} color="#10b981" />
                                </div>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Banners</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="text"
                                    value={newBannerUrl}
                                    onChange={e => setNewBannerUrl(e.target.value)}
                                    placeholder="URL de imagen (https://...)"
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <button
                                    onClick={async () => {
                                        if (newBannerUrl.trim()) {
                                            const updated = [...banners, { url: newBannerUrl.trim(), alt: 'Banner' }];
                                            setBanners(updated);
                                            await updateSetting('banners', updated);
                                            setNewBannerUrl('');
                                            showSaved();
                                        }
                                    }}
                                    style={{ background: '#334155', border: 'none', color: '#f1f5f9', borderRadius: '8px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            {banners.length === 0 && <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', padding: '16px' }}>No hay banners. Agregá una URL de imagen.</p>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {banners.map((b, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#0f172a', borderRadius: '8px', padding: '8px', border: '1px solid #334155' }}>
                                        <img src={b.url} alt={b.alt} style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: '#1e293b', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                                        <p style={{ flex: 1, fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.url}</p>
                                        <button
                                            onClick={async () => {
                                                const updated = banners.filter((_, i) => i !== idx);
                                                setBanners(updated);
                                                await updateSetting('banners', updated);
                                                showSaved();
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', flexShrink: 0 }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CATEGORÍAS */}
                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ width: '32px', height: '32px', background: 'rgba(245,158,11,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Tag size={16} color="#f59e0b" />
                                </div>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Grupos de Prendas</h3>
                            </div>
                            <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>Estas categorías aparecen como filtros en la tienda y en el formulario de productos.</p>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    onKeyDown={async e => {
                                        if (e.key === 'Enter' && newCategory.trim()) {
                                            const updated = [...categories, newCategory.trim()];
                                            setCategories(updated);
                                            await updateSetting('categories', updated);
                                            setNewCategory('');
                                            showSaved();
                                        }
                                    }}
                                    placeholder="Ej: Buzos, Remeras, Gorras..."
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <button
                                    onClick={async () => {
                                        if (newCategory.trim()) {
                                            const updated = [...categories, newCategory.trim()];
                                            setCategories(updated);
                                            await updateSetting('categories', updated);
                                            setNewCategory('');
                                            showSaved();
                                        }
                                    }}
                                    style={{ background: '#334155', border: 'none', color: '#f1f5f9', borderRadius: '8px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {categories.map((cat, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '6px 14px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>{cat}</span>
                                        <button
                                            onClick={async () => {
                                                const updated = categories.filter((_, i) => i !== idx);
                                                setCategories(updated);
                                                await updateSetting('categories', updated);
                                                showSaved();
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {categories.length === 0 && <p style={{ color: '#475569', fontSize: '12px' }}>No hay categorías. Agregá una.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTTOM NAV */}
            <nav style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(20px)',
                borderTop: '1px solid #1e293b', padding: '10px 24px 24px',
                display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100,
            }}>
                {navTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            color: activeTab === tab.id ? '#ffffff' : '#475569',
                            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
                        }}
                    >
                        {tab.icon}
                        <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif" }}>{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* PRODUCT MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }} onClick={() => setIsModalOpen(false)}>
                    <div style={{ width: '100%', maxWidth: '500px', background: '#0f172a', borderRadius: '16px 16px 0 0', padding: '28px 20px 48px', border: '1px solid #1e293b', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#f1f5f9' }}>
                                {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: '#1e293b', border: 'none', color: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* Name */}
                            <div>
                                <label style={labelStyle}>Nombre</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                            </div>

                            {/* Price */}
                            <div>
                                <label style={labelStyle}>Precio</label>
                                <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} style={inputStyle} />
                            </div>

                            {/* Category */}
                            <div>
                                <label style={labelStyle}>Categoría</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                                    <option value="">Sin categoría</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            {/* Image — URL or File Upload */}
                            <div>
                                <label style={labelStyle}>Imagen del Producto</label>

                                {/* Preview */}
                                {formData.image && (
                                    <div style={{ marginBottom: '10px', borderRadius: '8px', overflow: 'hidden', height: '120px', background: '#1e293b' }}>
                                        <img src={formData.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}

                                {/* Upload from device */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    style={{
                                        width: '100%', padding: '12px', marginBottom: '8px',
                                        background: uploadingImage ? '#1e293b' : 'rgba(59,130,246,0.1)',
                                        border: '1px dashed #3b82f6', borderRadius: '8px',
                                        color: '#3b82f6', fontSize: '12px', fontWeight: '700',
                                        cursor: uploadingImage ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    {uploadingImage ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Subiendo...</> : <><Upload size={14} /> Subir desde dispositivo</>}
                                </button>

                                {/* Or URL */}
                                <p style={{ fontSize: '10px', color: '#475569', textAlign: 'center', margin: '4px 0' }}>— o pegá una URL —</p>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://..."
                                    style={inputStyle}
                                />
                            </div>

                            {/* Stock per size */}
                            <div>
                                <label style={labelStyle}>Stock por Talle</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {SIZES.map(size => (
                                        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>{size}</span>
                                            <input
                                                type="number"
                                                value={formData.variants[size]}
                                                onChange={e => setFormData({ ...formData, variants: { ...formData.variants, [size]: parseInt(e.target.value) || 0 } })}
                                                style={{ ...inputStyle, textAlign: 'center', padding: '10px 4px', fontSize: '15px', fontWeight: '700' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleSave} style={{ width: '100%', marginTop: '4px', background: '#ffffff', color: '#000000', border: 'none', padding: '16px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', borderRadius: '10px', fontFamily: "'Inter', sans-serif" }}>
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
