import React, { useState, useEffect, useRef } from 'react';
import {
    Package, BarChart2, ArrowLeft, Plus, Edit2,
    Trash2, X, ShoppingBag, Phone, Mail, MapPin, Instagram,
    Image, Palette, Tag, LayoutGrid, Save, Check, Upload, Loader, LogOut, Home, ArrowUpRight, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useStockStore } from '../store/useStockStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { supabase } from '../supabaseClient';
import FileResizer from 'react-image-file-resizer';

// ── Tiendanube Theme Design System ─────────────────────────────────────────────
const colors = {
    primary: '#5c2e91',          // Violeta Tiendanube Corporativo
    primaryHover: '#4c2378',     // Violeta Oscuro
    bg: '#f8fafc',               // Fondo Gris Suave
    sidebar: '#ffffff',          // Sidebar Blanco Premium
    sidebarActive: '#f3e8ff',    // Fondo Violeta Suave Activo
    text: '#1e293b',             // Slate 800 (Alta Legibilidad)
    textSecondary: '#64748b',    // Slate 500
    border: '#e2e8f0',           // Gris Slate 200
    cardBg: '#ffffff',           // Blanco Puro
    success: '#10b981',          // Verde Esmeralda
    warning: '#f59e0b',          // Ámbar
    error: '#ef4444',            // Rojo Coral
    info: '#3b82f6'              // Azul
};

const inputStyle = {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    padding: '10px 14px',
    color: colors.text,
    outline: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
};

const labelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: "'Inter', sans-serif",
    display: 'block',
    marginBottom: '6px',
};

const card = {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)',
};

const sectionTitle = {
    fontSize: '14px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colors.text,
    marginBottom: '16px',
    fontFamily: "'Inter', sans-serif",
};

const AdminDashboard = ({ onBack }) => {
    const { stock, updateStock, addProduct, deleteProduct, fetchProducts } = useStockStore();
    const { settings, fetchSettings, updateSetting, subscribeToSettings, uploadImage } = useSettingsStore();

    const [activeTab, setActiveTab] = useState('home'); // Tiendanube clones default to Home/Inicio
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [localSales, setLocalSales] = useState([]);
    const [savedMsg, setSavedMsg] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastError, setLastError] = useState(null);
    const [debugLog, setDebugLog] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef(null);

    const addLog = (msg) => {
        setDebugLog(prev => [...prev.slice(-3), `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    // Global error listener to prevent crashes
    useEffect(() => {
        const handleError = (event) => {
            console.error('Caught global error:', event.error);
            setLastError(String(event.error?.message || event.message || 'Error desconocido del sistema'));
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    // ── Product form ──────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        name: '', price: 0, images: [], category: '',
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

    // Stats calculations
    const totalRevenue = (localSales || []).reduce((acc, s) => acc + (s.total || 0), 0);
    const totalItemsSold = (localSales || []).reduce((acc, s) => acc + (s.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0), 0);
    const lowStockCount = (stock || []).filter(item => {
        if (!item || !item.variants) return false;
        return Object.values(item.variants).reduce((a, b) => (a || 0) + (b || 0), 0) < 10;
    }).length;

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

    // Sync local editable state when settings load
    useEffect(() => {
        setContact(settings.contact || {});
        setHero(settings.hero || {});
        setBanners(Array.isArray(settings.banners) ? settings.banners : []);
        setCategories(Array.isArray(settings.categories) ? settings.categories : []);
    }, [settings]);

    const showSaved = () => {
        setSavedMsg('¡Guardado!');
        setTimeout(() => setSavedMsg(''), 2500);
    };

    // ── Image upload from device with resizer ──────────────────────────────────────
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido.');
            return;
        }

        setUploadingImage(true);
        try {
            const resizerFn = FileResizer?.imageFileResizer || (typeof FileResizer === 'function' ? FileResizer : null);

            if (!resizerFn) {
                console.error('FileResizer not found', FileResizer);
                throw new Error('No se pudo encontrar el procesador de imágenes.');
            }

            addLog('Redimensionando imagen...');
            const resizedImage = await new Promise((resolve, reject) => {
                try {
                    resizerFn(
                        file,
                        1200, 1200, 'JPEG', 80, 0,
                        (uri) => {
                            if (uri) resolve(uri);
                            else reject(new Error('El procesador de imagen devolvió vacío.'));
                        },
                        'blob'
                    );
                } catch (resizerErr) {
                    reject(resizerErr);
                }
            });

            addLog('Subiendo a la nube...');
            const publicUrl = await uploadImage(resizedImage);

            if (publicUrl) {
                const cleanUrl = typeof publicUrl === 'string' ? publicUrl : String(publicUrl);
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), cleanUrl]
                }));
                addLog('¡Imagen subida con éxito!');
            }
        } catch (err) {
            console.error('Resize/Upload error:', err);
            const errMsg = err.message || 'Error desconocido';
            addLog('ERROR: ' + errMsg);
            alert('Error al procesar/subir imagen: ' + errMsg);
        } finally {
            setUploadingImage(false);
            if (e.target) e.target.value = '';
        }
    };

    // ── Product handlers ──────────────────────────────────────────────────────
    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            const initialImages = Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []);
            setFormData({
                name: item.name || '',
                price: item.price || 0,
                images: initialImages,
                category: item.category || '',
                variants: item.variants ? { ...item.variants } : { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
            });
        } else {
            setEditingItem(null);
            setFormData({ name: '', price: 0, images: [], category: '', variants: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 } });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        addLog('Iniciando guardado...');
        setIsSaving(true);
        try {
            if (editingItem) {
                addLog('Actualizando producto existente...');
                const { error } = await supabase.from('products').update({
                    name: formData.name,
                    price: formData.price,
                    images: formData.images,
                    image: formData.images[0] || '', // Maintain legacy field
                    category: formData.category,
                    variants: formData.variants
                }).eq('id', editingItem.id);

                if (error) throw error;
                addLog('Respuesta ok de Supabase (Update).');
            } else {
                addLog('Insertando nuevo producto...');
                await addProduct(formData);
                addLog('Respuesta ok de Supabase (Insert).');
            }

            showSaved();
            addLog('Guardado con éxito.');
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            addLog('ERROR CRÍTICO AL GUARDAR: ' + (error.message || 'Error desconocido'));
            if (error.message?.includes("column 'images' of relation 'products'")) {
                alert('⚠️ ERROR DE BASE DE DATOS: Falta la columna "images" en la tabla "products". Revisa las tablas.');
            } else {
                alert('No se pudo guardar el producto: ' + (error.message || 'Error de conexión'));
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Deseas eliminar este producto?')) {
            await deleteProduct(id);
            fetchProducts();
        }
    };

    const handleUpdateStatus = async (saleId, newStatus) => {
        setLocalSales(localSales.map(s => s.id === saleId ? { ...s, status: newStatus } : s));
        await supabase.from('sales').update({ status: newStatus }).eq('id', saleId);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Enviado': return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
            case 'Entregado': return { bg: '#d1fae5', color: '#047857', border: '#a7f3d0' };
            case 'Cancelado': return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' };
            default: return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' }; // Pendiente
        }
    };

    const navTabs = [
        { id: 'home', icon: <Home size={18} />, label: 'Inicio' },
        { id: 'products', icon: <Package size={18} />, label: 'Productos' },
        { id: 'sales', icon: <ShoppingBag size={18} />, label: 'Ventas y Pedidos' },
        { id: 'settings', icon: <Palette size={18} />, label: 'Personalizar Tienda' },
        { id: 'contact', icon: <Phone size={18} />, label: 'Datos de Contacto' },
    ];

    // Dynamic setup checklist for e-commerce store
    const checklistItems = [
        { text: 'Conectar base de datos de Olmo.indumentaria', done: true },
        { text: 'Cargar tu primer producto al catálogo', done: stock.length > 0 },
        { text: 'Configurar WhatsApp o datos de contacto', done: !!contact.whatsapp },
        { text: 'Agregar categorías o personalizar el Hero', done: categories.length > 0 || !!hero.title },
    ];

    const filteredStock = stock.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div translate="no" style={{ display: 'flex', background: colors.bg, minHeight: '100vh', color: colors.text, fontFamily: "'Inter', sans-serif" }}>

            {/* ── BARRA LATERAL (SIDEBAR CLON TIENDANUBE) ────────────────────────────────── */}
            <aside style={{
                width: '260px',
                background: colors.sidebar,
                borderRight: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                zIndex: 100,
                boxShadow: '2px 0 8px rgba(0,0,0,0.02)'
            }}>
                {/* Brand Header */}
                <div style={{ padding: '24px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: colors.primary, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: '900', fontSize: '18px', fontFamily: "'Montserrat', sans-serif" }}>O</span>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: 0, letterSpacing: '0.2px' }}>Olmo Indumentaria</h1>
                        <span style={{ fontSize: '10px', color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Administrador</span>
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <nav style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
                    {navTabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: isActive ? colors.sidebarActive : 'transparent',
                                    color: isActive ? colors.primary : colors.textSecondary,
                                    fontWeight: isActive ? '700' : '500',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    fontFamily: "'Inter', sans-serif"
                                }}
                            >
                                {isActive && <div style={{ width: '4px', height: '18px', background: colors.primary, borderRadius: '4px', position: 'absolute', left: '4px' }}></div>}
                                {React.cloneElement(tab.icon, { color: isActive ? colors.primary : colors.textSecondary })}
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                {/* User Session Footer */}
                <div style={{ padding: '16px', borderTop: `1px solid ${colors.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: colors.primary }}>
                            AD
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', fontWeight: '700', color: colors.text, margin: 0 }}>Administrador</p>
                            <span style={{ fontSize: '10px', color: colors.success, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.success }}></span> En línea
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                            background: '#fee2e2', color: colors.error, border: 'none',
                            padding: '10px 16px', borderRadius: '8px', width: '100%',
                            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                            transition: 'background 0.2s', fontFamily: "'Inter', sans-serif"
                        }}
                    >
                        <LogOut size={14} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* ── CONTENIDO PRINCIPAL (MAIN CANVAS) ────────────────────────────────────── */}
            <main style={{ flex: 1, marginLeft: '260px', padding: '32px 40px', minWidth: 0 }}>

                {/* TOP BREADCRUMB BAR */}
                <header style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '32px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px'
                }}>
                    <div>
                        <div style={{ fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Olmo.indumentaria</div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>
                            {activeTab === 'home' && 'Inicio'}
                            {activeTab === 'products' && 'Catálogo de Productos'}
                            {activeTab === 'sales' && 'Gestión de Pedidos'}
                            {activeTab === 'settings' && 'Personalización de Tienda'}
                            {activeTab === 'contact' && 'Datos de Contacto'}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {savedMsg && (
                            <span style={{ fontSize: '12px', fontWeight: '700', color: colors.success, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={16} /> <span>{savedMsg}</span>
                            </span>
                        )}
                        <button
                            onClick={onBack}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: '#ffffff', border: `1px solid ${colors.border}`,
                                padding: '8px 16px', borderRadius: '8px', color: colors.primary,
                                fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                                transition: 'all 0.2s', textDecoration: 'none'
                            }}
                        >
                            <span>Ir a la Tienda</span> <ArrowUpRight size={14} />
                        </button>
                    </div>
                </header>

                {/* ERROR GLOBAL DISPLAY */}
                {lastError && (
                    <div style={{
                        background: '#fef2f2', color: colors.error,
                        padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`,
                        marginBottom: '24px', fontSize: '13px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontWeight: '800', marginBottom: '4px' }}>⚠️ Notificación de Error del Sistema</p>
                                <p style={{ opacity: 0.9 }}>{lastError}</p>
                            </div>
                            <button onClick={() => setLastError(null)} style={{ background: 'none', border: 'none', color: colors.error, cursor: 'pointer', fontWeight: '700' }}>✕</button>
                        </div>
                    </div>
                )}

                {/* ── 1. PESTAÑA: INICIO (DASHBOARD GENERAL) ────────────────────────────────── */}
                {activeTab === 'home' && (
                    <div>
                        {/* Welcome Banner */}
                        <div style={{
                            background: `linear-gradient(135deg, ${colors.primary} 0%, #3e1b68 100%)`,
                            borderRadius: '16px', padding: '32px', color: '#ffffff', marginBottom: '32px',
                            boxShadow: '0 10px 15px -3px rgba(92, 46, 145, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>¡Hola, Administrador!</h3>
                                <p style={{ margin: '8px 0 0 0', opacity: 0.85, fontSize: '13px', fontWeight: '500' }}>
                                    Gestioná tus ventas, productos y estética desde el panel oficial de tu marca.
                                </p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center' }}>
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', opacity: 0.8 }}>Estatus de Servidor</span>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '800', color: '#4ade80' }}>Supabase Conectado</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                            {/* Checklist Widget */}
                            <div style={card}>
                                <h3 style={sectionTitle}>Pasos sugeridos para tener tu tienda lista</h3>
                                <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '-10px', marginBottom: '24px' }}>
                                    Completa esta lista de verificación rápida para asegurar el lanzamiento exitoso de tu catálogo.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {checklistItems.map((item, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '12px 16px', borderRadius: '8px',
                                            background: item.done ? 'rgba(16, 185, 129, 0.04)' : '#f8fafc',
                                            border: `1px solid ${item.done ? 'rgba(16, 185, 129, 0.15)' : colors.border}`
                                        }}>
                                            <CheckCircle2 size={20} color={item.done ? colors.success : '#cbd5e1'} style={{ flexShrink: 0 }} />
                                            <span style={{
                                                fontSize: '13px', fontWeight: '600',
                                                color: item.done ? '#065f46' : colors.text,
                                                textDecoration: item.done ? 'line-through' : 'none'
                                            }}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Analytics Quick Log */}
                            <div style={card}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={sectionTitle}>Logs Recientes</h3>
                                    <button onClick={() => setDebugLog([])} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}>Limpiar</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {debugLog.map((log, i) => (
                                        <div key={`log-${i}`} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', borderLeft: `3px solid ${colors.primary}` }}>
                                            <span style={{ fontSize: '11px', color: colors.textSecondary, fontFamily: 'monospace' }}>{log}</span>
                                        </div>
                                    ))}
                                    {debugLog.length === 0 && <p style={{ fontSize: '12px', color: colors.textSecondary, textAlign: 'center', padding: '24px' }}>Sin actividad de sistema.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Metrics Summary cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '32px' }}>
                            {[
                                { label: 'Ventas Totales', value: `$${totalRevenue.toLocaleString()}`, color: colors.success, desc: 'Acumulado histórico' },
                                { label: 'Prendas Vendidas', value: totalItemsSold, color: colors.info, desc: 'Unidades entregadas' },
                                { label: 'Órdenes Totales', value: localSales.length, color: '#8b5cf6', desc: 'Pedidos registrados' },
                                { label: 'Stock Bajo', value: lowStockCount, color: lowStockCount > 0 ? colors.error : colors.success, desc: 'Menos de 10 unidades' },
                            ].map(m => (
                                <div key={m.label} style={{ ...card, marginBottom: 0 }}>
                                    <span style={{ fontSize: '10px', color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{m.label}</span>
                                    <h4 style={{ fontSize: '28px', fontWeight: '800', color: m.color, margin: '8px 0 2px 0', letterSpacing: '-0.5px' }}>{m.value}</h4>
                                    <span style={{ fontSize: '10px', color: colors.textSecondary }}>{m.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── 2. PESTAÑA: PRODUCTOS (INVENTARIO Y STOCK) ────────────────────────────────── */}
                {activeTab === 'products' && (
                    <div>
                        {/* Control actions */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
                            {/* Search bar */}
                            <div style={{ position: 'relative', width: '300px' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar producto o categoría..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <button
                                onClick={() => handleOpenModal()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: colors.primary, color: '#ffffff', border: 'none',
                                    padding: '12px 20px', borderRadius: '8px', fontSize: '13px',
                                    fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s',
                                    fontFamily: "'Inter', sans-serif"
                                }}
                            >
                                <Plus size={16} /> Nuevo Producto
                            </button>
                        </div>

                        {/* Products Catalog */}
                        <div style={card}>
                            <h3 style={sectionTitle}>Lista de Productos ({filteredStock.length})</h3>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: `2px solid ${colors.border}`, paddingBottom: '12px' }}>
                                            <th style={{ padding: '12px', fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '750' }}>Detalle</th>
                                            <th style={{ padding: '12px', fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '750' }}>Categoría</th>
                                            <th style={{ padding: '12px', fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '750' }}>Precio</th>
                                            <th style={{ padding: '12px', fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '750' }}>Stock por Talle</th>
                                            <th style={{ padding: '12px', fontSize: '11px', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '750', textAlign: 'right' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStock.map(item => (
                                            <tr key={item.id} style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background 0.1s' }} className="table-row-hover">
                                                {/* Thumbnail and Name */}
                                                <td style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <div style={{
                                                        width: '50px', height: '50px', borderRadius: '6px',
                                                        border: `1px solid ${colors.border}`, overflow: 'hidden', background: '#f8fafc',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                    }}>
                                                        {item.image ? (
                                                            <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={item.name} />
                                                        ) : (
                                                            <Image size={18} color="#94a3b8" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '13px', fontWeight: '700', color: colors.text, textTransform: 'uppercase', display: 'block' }}>{item.name}</span>
                                                        <span style={{ fontSize: '10px', color: colors.textSecondary, fontFamily: 'monospace' }}>ID: {item.id.slice(0, 8).toUpperCase()}</span>
                                                    </div>
                                                </td>

                                                {/* Category */}
                                                <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: colors.textSecondary }}>
                                                    {item.category || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Sin categoría</span>}
                                                </td>

                                                {/* Price */}
                                                <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '850', color: colors.text }}>
                                                    ${(item.price || 0).toLocaleString()}
                                                </td>

                                                {/* Variants */}
                                                <td style={{ padding: '16px 12px' }}>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        {Object.entries(item.variants || {}).map(([size, count]) => {
                                                            const isZero = count === 0;
                                                            return (
                                                                <div key={size} style={{
                                                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                                    border: `1px solid ${isZero ? '#fee2e2' : colors.border}`,
                                                                    borderRadius: '6px', padding: '4px 8px', minWidth: '32px',
                                                                    background: isZero ? '#fef2f2' : '#ffffff'
                                                                }}>
                                                                    <span style={{ fontSize: '8px', fontWeight: '850', color: isZero ? colors.error : colors.textSecondary }}>{size}</span>
                                                                    <span style={{ fontSize: '11px', fontWeight: '700', color: isZero ? colors.error : colors.text }}>{count}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => handleOpenModal(item)}
                                                            style={{
                                                                background: 'none', border: `1px solid ${colors.border}`,
                                                                color: colors.primary, borderRadius: '6px', width: '32px', height: '32px',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            style={{
                                                                background: 'none', border: `1px solid #fee2e2`,
                                                                color: colors.error, borderRadius: '6px', width: '32px', height: '32px',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredStock.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: colors.textSecondary }}>
                                                    No se encontraron productos en el catálogo.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 3. PESTAÑA: PEDIDOS (VENTAS REALIZADAS) ────────────────────────────────── */}
                {activeTab === 'sales' && (
                    <div>
                        <div style={card}>
                            <h3 style={sectionTitle}>Lista de Ventas y Pedidos ({localSales.length})</h3>
                            <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '-10px', marginBottom: '24px' }}>
                                Administra los estatus de entrega para cada pedido. Esto ayuda al comprador a tener seguimiento de su orden.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {localSales.map(sale => {
                                    const status = sale.status || 'Pendiente';
                                    const st = getStatusStyles(status);
                                    return (
                                        <div key={sale.id} style={{
                                            border: `1px solid ${colors.border}`, borderRadius: '12px',
                                            background: '#ffffff', padding: '20px', display: 'flex', flexWrap: 'wrap',
                                            gap: '20px', alignItems: 'center', justifyContent: 'space-between',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                        }}>
                                            {/* Order code & Date */}
                                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                                                    <ShoppingBag size={18} color={colors.primary} />
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '13px', fontWeight: '850', color: colors.text, margin: 0 }}>ORDEN #{sale.id.slice(0, 6).toUpperCase()}</h4>
                                                    <span style={{ fontSize: '10px', color: colors.textSecondary }}>{sale.created_at ? `${new Date(sale.created_at).toLocaleDateString()} · ${new Date(sale.created_at).toLocaleTimeString()}` : '—'}</span>
                                                </div>
                                            </div>

                                            {/* Cart items list */}
                                            <div style={{ flex: 1, minWidth: '200px' }}>
                                                {(sale.items || []).map((item, idx) => (
                                                    <p key={idx} style={{ fontSize: '11.5px', color: '#475569', margin: '2px 0' }}>
                                                        <strong style={{ color: colors.text }}>{item.quantity}x</strong> {item.name} <span style={{ color: colors.primary, fontWeight: '700' }}>({item.size})</span>
                                                    </p>
                                                ))}
                                            </div>

                                            {/* Price Total and Status Selector */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '700' }}>Monto total</span>
                                                    <p style={{ fontSize: '17px', fontWeight: '900', color: colors.text, margin: 0 }}>${(sale.total || 0).toLocaleString()}</p>
                                                </div>

                                                <select
                                                    value={status}
                                                    onChange={(e) => handleUpdateStatus(sale.id, e.target.value)}
                                                    style={{
                                                        background: st.bg,
                                                        border: `1px solid ${st.border}`,
                                                        color: st.color,
                                                        padding: '8px 14px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        outline: 'none',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    <option value="Pendiente" style={{ background: '#ffffff', color: '#b45309' }}>PENDIENTE</option>
                                                    <option value="Enviado" style={{ background: '#ffffff', color: '#0369a1' }}>ENVIADO</option>
                                                    <option value="Entregado" style={{ background: '#ffffff', color: '#047857' }}>ENTREGADO</option>
                                                    <option value="Cancelado" style={{ background: '#ffffff', color: '#b91c1c' }}>CANCELADO</option>
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                                {localSales.length === 0 && (
                                    <p style={{ color: colors.textSecondary, textAlign: 'center', padding: '40px' }}>No hay ventas registradas todavía.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 4. PESTAÑA: PERSONALIZACIÓN (TIENDA ESTÉTICA Y CATEGORÍAS) ────────────────────────────────── */}
                {activeTab === 'settings' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        {/* HERO E BANNER SETTINGS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Estética del Hero */}
                            <div style={card}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <div style={{ width: '32px', height: '32px', background: 'rgba(92,46,145,0.06)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Palette size={16} color={colors.primary} />
                                    </div>
                                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: 0 }}>Texto de Portada (Hero)</h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {[
                                        { key: 'title', label: 'Título principal', placeholder: 'OLMO' },
                                        { key: 'subtitle', label: 'Subtítulo del Hero', placeholder: 'INDUMENTARIA' },
                                        { key: 'cta', label: 'Texto del Botón (CTA)', placeholder: 'Ver Colección' },
                                        { key: 'bgColor', label: 'Color o Gradiente de Fondo (CSS)', placeholder: 'linear-gradient(180deg, #F9F9F9 0%, #E2E2E2 100%)' },
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

                                    <button onClick={async () => { await updateSetting('hero', hero); showSaved(); }} style={{
                                        background: colors.primary, color: '#ffffff', border: 'none',
                                        padding: '12px 20px', borderRadius: '8px', fontSize: '12px',
                                        fontWeight: '700', cursor: 'pointer', marginTop: '10px',
                                        transition: 'background 0.2s', alignSelf: 'flex-start',
                                        fontFamily: "'Inter', sans-serif"
                                    }}>
                                        Guardar Estética
                                    </button>
                                </div>
                            </div>

                            {/* Banners Promocionales */}
                            <div style={card}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <div style={{ width: '32px', height: '32px', background: 'rgba(92,46,145,0.06)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image size={16} color={colors.primary} />
                                    </div>
                                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: 0 }}>Banners de Carrusel</h3>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                    <input
                                        type="text"
                                        value={newBannerUrl}
                                        onChange={e => setNewBannerUrl(e.target.value)}
                                        placeholder="Pegar enlace de imagen (https://...)"
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
                                        style={{
                                            background: colors.primary, border: 'none', color: '#fff',
                                            borderRadius: '8px', width: '44px', height: '44px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', flexShrink: 0
                                        }}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                {banners.length === 0 && <p style={{ color: colors.textSecondary, fontSize: '12px', textAlign: 'center', padding: '16px' }}>No hay banners. Agrega enlaces de fotos.</p>}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {banners.map((b, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', borderRadius: '8px', padding: '8px', border: `1px solid ${colors.border}` }}>
                                            <img src={b.url} alt={b.alt} style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: '#e2e8f0', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                                            <p style={{ flex: 1, fontSize: '11px', color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{b.url}</p>
                                            <button
                                                onClick={async () => {
                                                    const updated = banners.filter((_, i) => i !== idx);
                                                    setBanners(updated);
                                                    await updateSetting('banners', updated);
                                                    showSaved();
                                                }}
                                                style={{ background: 'none', border: 'none', color: colors.error, cursor: 'pointer', flexShrink: 0 }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CATEGORIES SETTINGS */}
                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ width: '32px', height: '32px', background: 'rgba(92,46,145,0.06)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Tag size={16} color={colors.primary} />
                                </div>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: 0 }}>Grupos y Categorías de Prendas</h3>
                            </div>
                            <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '20px', marginTop: '-10px' }}>
                                Configura las categorías que aparecen como filtros de navegación en tu tienda Olmo.
                            </p>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
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
                                    placeholder="Ej: Buzos, Remeras, Accesorios..."
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
                                    style={{
                                        background: colors.primary, border: 'none', color: '#fff',
                                        borderRadius: '8px', width: '44px', height: '44px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', flexShrink: 0
                                    }}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {categories.map((cat, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '6px 14px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: colors.text }}>{cat}</span>
                                        <button
                                            onClick={async () => {
                                                const updated = categories.filter((_, i) => i !== idx);
                                                setCategories(updated);
                                                await updateSetting('categories', updated);
                                                showSaved();
                                            }}
                                            style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {categories.length === 0 && <p style={{ color: colors.textSecondary, fontSize: '12px' }}>Aún no has creado categorías.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 5. PESTAÑA: CONTACTO (DATOS DE WHATSAPP, EMAIL, REDES) ────────────────────────────────── */}
                {activeTab === 'contact' && (
                    <div style={{ maxWidth: '600px' }}>
                        <div style={card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ width: '32px', height: '32px', background: 'rgba(92,46,145,0.06)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Phone size={16} color={colors.primary} />
                                </div>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: 0 }}>Datos de Contacto y Redes</h3>
                            </div>
                            <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '24px', marginTop: '-10px' }}>
                                Estos datos vinculan los botones de WhatsApp de compras, correos de facturación y links de Instagram del footer de tu web.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { key: 'whatsapp', label: 'Número de WhatsApp (Con código de país, ej: 543434559599)', placeholder: '543434559599' },
                                    { key: 'instagram', label: 'Nombre de usuario de Instagram (Sin @)', placeholder: 'olmo.ind' },
                                    { key: 'email', label: 'Correo electrónico de consultas', placeholder: 'olmoshowroom@gmail.com' },
                                    { key: 'address', label: 'Dirección física o Local comercial', placeholder: 'Cervantes 35 local A' },
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

                                <button onClick={async () => { await updateSetting('contact', contact); showSaved(); }} style={{
                                    background: colors.primary, color: '#ffffff', border: 'none',
                                    padding: '14px 24px', borderRadius: '8px', fontSize: '13px',
                                    fontWeight: '700', cursor: 'pointer', marginTop: '12px',
                                    transition: 'background 0.2s', alignSelf: 'flex-start',
                                    fontFamily: "'Inter', sans-serif"
                                }}>
                                    Guardar Datos de Contacto
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ── PRODUCT MODAL REDISEÑADO (SLIDE-UP PREMIUM) ────────────────────────────────────────── */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }} onClick={() => setIsModalOpen(false)}>
                    <div style={{ width: '100%', maxWidth: '520px', background: '#ffffff', borderRadius: '16px', padding: '30px', border: `1px solid ${colors.border}`, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }} onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.5px', color: colors.text, margin: 0 }}>
                                {editingItem ? 'Editar Producto' : 'Crear Nuevo Producto'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', color: colors.textSecondary, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Name */}
                            <div>
                                <label style={labelStyle}>Nombre del Artículo</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} placeholder="Ej: Remera Over Olmo" />
                            </div>

                            {/* Price */}
                            <div>
                                <label style={labelStyle}>Precio (ARS)</label>
                                <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} style={inputStyle} placeholder="12500" />
                            </div>

                            {/* Category */}
                            <div>
                                <label style={labelStyle}>Categoría</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="">Sin categoría</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            {/* Images Gallery */}
                            <div>
                                <label style={labelStyle}>Galería de Fotos ({(formData.images || []).length})</label>

                                {/* Gallery Row */}
                                <div style={{
                                    display: 'flex', gap: '10px', overflowX: 'auto',
                                    padding: '8px 0', marginBottom: '12px',
                                    scrollbarWidth: 'none'
                                }}>
                                    {(formData.images || []).map((url, idx) => (
                                        <div key={idx} style={{
                                            position: 'relative', minWidth: '76px', height: '76px',
                                            borderRadius: '8px', overflow: 'hidden', border: `1px solid ${colors.border}`, background: '#f8fafc'
                                        }}>
                                            <img src={url} alt={`img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                                style={{
                                                    position: 'absolute', top: '3px', right: '3px',
                                                    background: colors.error, border: 'none',
                                                    borderRadius: '50%', width: '18px', height: '18px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', color: '#fff', padding: 0
                                                }}
                                            >
                                                <X size={10} />
                                            </button>
                                            {idx === 0 && (
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(16,185,129,0.85)', color: '#fff', fontSize: '8px', textAlign: 'center', fontWeight: '800', padding: '2px 0' }}>PORTADA</div>
                                            )}
                                        </div>
                                    ))}
                                    {formData.images.length === 0 && (
                                        <div style={{ width: '100%', height: '76px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${colors.border}` }}>
                                            <span style={{ fontSize: '11px', color: colors.textSecondary }}>Sin fotos cargadas</span>
                                        </div>
                                    )}
                                </div>

                                {/* Upload Button */}
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    style={{
                                        width: '100%', padding: '12px', marginBottom: '8px',
                                        background: uploadingImage ? '#f1f5f9' : 'rgba(92, 46, 145, 0.05)',
                                        border: `1px dashed ${colors.primary}`, borderRadius: '8px',
                                        color: colors.primary, fontSize: '12px', fontWeight: '700',
                                        cursor: uploadingImage ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        fontFamily: "'Inter', sans-serif", transition: 'background 0.2s'
                                    }}
                                >
                                    {uploadingImage ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Subiendo...</> : <><Upload size={14} /> Subir Foto de Dispositivo</>}
                                </button>

                                {/* Paste URL */}
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <input
                                        type="text"
                                        id="manualUrl"
                                        placeholder="Pegar URL directa de foto..."
                                        style={{ ...inputStyle, flex: 1 }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                setFormData(prev => ({ ...prev, images: [...prev.images, e.target.value.trim()] }));
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const inp = document.getElementById('manualUrl');
                                            if (inp.value.trim()) {
                                                setFormData(prev => ({ ...prev, images: [...prev.images, inp.value.trim()] }));
                                                inp.value = '';
                                            }
                                        }}
                                        style={{ background: colors.primary, border: 'none', color: '#fff', padding: '0 14px', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Stock by size */}
                            <div>
                                <label style={labelStyle}>Stock por Talle</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                                    {SIZES.map(size => (
                                        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '10px', fontWeight: '800', color: colors.textSecondary }}>{size}</span>
                                            <input
                                                type="number"
                                                value={formData.variants[size]}
                                                onChange={e => setFormData({ ...formData, variants: { ...formData.variants, [size]: parseInt(e.target.value) || 0 } })}
                                                style={{ ...inputStyle, textAlign: 'center', padding: '8px 4px', fontSize: '14px', fontWeight: '700' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving || uploadingImage}
                                style={{
                                    width: '100%', marginTop: '8px',
                                    background: (isSaving || uploadingImage) ? '#94a3b8' : colors.primary,
                                    color: '#ffffff', border: 'none', padding: '16px',
                                    fontSize: '13px', fontWeight: '700', cursor: (isSaving || uploadingImage) ? 'not-allowed' : 'pointer',
                                    borderRadius: '8px', fontFamily: "'Inter', sans-serif",
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {isSaving ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> GUARDANDO...</> : 'GUARDAR PRODUCTO'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
