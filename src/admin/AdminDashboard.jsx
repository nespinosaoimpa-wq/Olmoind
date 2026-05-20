import React, { useState, useEffect, useRef } from 'react';
import {
    Package, BarChart2, Plus, Edit2,
    Trash2, X, ShoppingBag, Phone, Mail, MapPin, Instagram,
    Image, Palette, Tag, Save, Check, Upload, LogOut, Home, ArrowUpRight, CheckCircle2,
    Users, Truck, CreditCard, Monitor, TrendingUp, Settings, ChevronDown, ChevronRight, Scan, Loader
} from 'lucide-react';
import { useStockStore } from '../store/useStockStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { supabase } from '../supabaseClient';
import FileResizer from 'react-image-file-resizer';
import DiscountsModule from './modules/DiscountsModule';
import ShippingModule from './modules/ShippingModule';
import PosModule from './modules/PosModule';
import CustomersModule from './modules/CustomersModule';
import StatisticsModule from './modules/StatisticsModule';
import { COLOR_PALETTE, isLightColor } from '../constants/colorPalette';


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

const PaymentIcons = {
    mp: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#00b1ea"/>
            <path d="M7 13.5L10 16.5L17 8.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    transfer: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#10b981"/>
            <path d="M4 18H20M5 15V9M9 15V9M13 15V9M17 15V9M4 9L12 4L20 9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    cash: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#f59e0b"/>
            <rect x="5" y="8" width="14" height="8" rx="2" stroke="#ffffff" strokeWidth="2"/>
            <circle cx="12" cy="12" r="2.5" fill="#ffffff"/>
        </svg>
    ),
    posnet: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#8b5cf6"/>
            <rect x="6" y="5" width="12" height="14" rx="2" stroke="#ffffff" strokeWidth="2"/>
            <line x1="8" y1="9" x2="16" y2="9" stroke="#ffffff" strokeWidth="2"/>
            <circle cx="9" cy="13" r="0.8" fill="#ffffff"/>
            <circle cx="12" cy="13" r="0.8" fill="#ffffff"/>
            <circle cx="15" cy="13" r="0.8" fill="#ffffff"/>
            <circle cx="9" cy="15" r="0.8" fill="#ffffff"/>
            <circle cx="12" cy="15" r="0.8" fill="#ffffff"/>
            <circle cx="15" cy="15" r="0.8" fill="#ffffff"/>
        </svg>
    ),
    modo: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#ff003c"/>
            <circle cx="12" cy="12" r="5" stroke="#ffffff" strokeWidth="2.5"/>
        </svg>
    ),
    gocuotas: (
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#4ade80"/>
            <path d="M13 5L6 13H12L11 19L18 11H12L13 5Z" fill="#ffffff"/>
        </svg>
    )
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
    const [salesFilter, setSalesFilter] = useState('all'); // 'all' | 'online' | 'pos'
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
        variants: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        colors: []
    });
    const [customColorName, setCustomColorName] = useState('');
    const [customColorHex, setCustomColorHex] = useState('#3b82f6');
    const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    // ── Local editable copies of settings ────────────────────────────────────
    const [contact, setContact] = useState({});
    const [hero, setHero] = useState({});
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newBannerUrl, setNewBannerUrl] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [activeAccordion, setActiveAccordion] = useState('mp');
    const [paymentsConfig, setPaymentsConfig] = useState({
        mp: { active: true, publicKey: '', accessToken: '', env: 'test', webhookUrl: '' },
        transfer: { active: true, alias: '', cbu: '', titular: '', banco: '', cuit: '' },
        cash: { active: true, instructions: '' },
        posnet: { active: true },
        modo: { active: false, storeId: '', publicKey: '', privateKey: '' },
        gocuotas: { active: false, email: '', apiKey: '', branchId: '' }
    });

    const [copiedMpWebhook, setCopiedMpWebhook] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState({});

    const isPaymentMethodConfigured = (id, config) => {
        if (!config) return false;
        const item = config[id] || {};
        switch (id) {
            case 'mp':
                return !!(item.publicKey?.trim() && item.accessToken?.trim());
            case 'transfer':
                return !!(item.alias?.trim() && item.cbu?.trim() && item.titular?.trim());
            case 'cash':
                return !!item.instructions?.trim();
            case 'posnet':
                return true;
            case 'modo':
                return !!(item.storeId?.trim() && item.publicKey?.trim() && item.privateKey?.trim());
            case 'gocuotas':
                return !!(item.email?.trim() && item.apiKey?.trim() && item.branchId?.trim());
            default:
                return false;
        }
    };

    const handleTestConnection = (methodId) => {
        const isConfig = isPaymentMethodConfigured(methodId, paymentsConfig);
        setConnectionStatus(prev => ({
            ...prev,
            [methodId]: isConfig ? 'success' : 'error'
        }));
        setTimeout(() => {
            setConnectionStatus(prev => ({
                ...prev,
                [methodId]: null
            }));
        }, 4000);
    };

    const handleTogglePaymentMethod = (methodId) => {
        setPaymentsConfig(prev => ({
            ...prev,
            [methodId]: {
                ...prev[methodId],
                active: !prev[methodId]?.active
            }
        }));
    };

    const handleUpdateConfig = (methodId, field, val) => {
        setPaymentsConfig(prev => ({
            ...prev,
            [methodId]: {
                ...prev[methodId],
                [field]: val
            }
        }));
    };

    const handleSavePaymentsConfig = async () => {
        try {
            await updateSetting('payments', paymentsConfig);
            showSaved();
        } catch (err) {
            console.error('Error saving payment config:', err);
            alert('Error al guardar la configuración de pagos.');
        }
    };

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
        const savedPayments = settings.payments || {};
        setPaymentsConfig({
            mp: { active: true, publicKey: '', accessToken: '', env: 'test', webhookUrl: '', ...savedPayments.mp },
            transfer: { active: true, alias: '', cbu: '', titular: '', banco: '', cuit: '', ...savedPayments.transfer },
            cash: { active: true, instructions: '', ...savedPayments.cash },
            posnet: { active: true, ...savedPayments.posnet },
            modo: { active: false, storeId: '', publicKey: '', privateKey: '', ...savedPayments.modo },
            gocuotas: { active: false, email: '', apiKey: '', branchId: '', ...savedPayments.gocuotas }
        });
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
                variants: item.variants ? { ...item.variants } : { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
                colors: item.colors || []
            });
        } else {
            setEditingItem(null);
            setFormData({ name: '', price: 0, images: [], category: '', variants: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }, colors: [] });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        addLog('Iniciando guardado...');
        setIsSaving(true);
        try {
            if (editingItem) {
                addLog('Actualizando producto existente...');
                const updateData = {
                    name: formData.name,
                    price: formData.price,
                    images: formData.images,
                    image: formData.images[0] || '', // Maintain legacy field
                    category: formData.category,
                    variants: formData.variants,
                    colors: formData.colors || []
                };
                let { error } = await supabase.from('products').update(updateData).eq('id', editingItem.id);

                if (error && (error.message?.toLowerCase().includes('colors') || error.message?.includes("column 'colors' of relation 'products'") || error.message?.includes('column "colors"'))) {
                    console.warn('Colors column missing in products, retrying update without it...');
                    delete updateData.colors;
                    const retry = await supabase.from('products').update(updateData).eq('id', editingItem.id);
                    error = retry.error;
                    alert('⚠️ Guardado parcial: El producto se guardó con éxito, pero la base de datos no tiene la columna "colors". Para habilitar colores de prendas, ejecuta en el SQL Editor de tu panel de Supabase:\n\nALTER TABLE products ADD COLUMN colors jsonb DEFAULT \'[]\';');
                }

                if (error) throw error;
                addLog('Respuesta ok de Supabase (Update).');
            } else {
                addLog('Insertando nuevo producto...');
                try {
                    await addProduct(formData);
                } catch (err) {
                    if (err.message?.toLowerCase().includes('colors') || err.message?.includes("column 'colors' of relation 'products'") || err.message?.includes('column "colors"')) {
                        console.warn('Colors column missing in products, retrying insert without it...');
                        const { colors: _, ...formDataWithoutColors } = formData;
                        await addProduct(formDataWithoutColors);
                        alert('⚠️ Guardado parcial: El producto se guardó con éxito, pero la base de datos no tiene la columna "colors". Para habilitar colores de prendas, ejecuta en el SQL Editor de tu panel de Supabase:\n\nALTER TABLE products ADD COLUMN colors jsonb DEFAULT \'[]\';');
                    } else {
                        throw err;
                    }
                }
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

    const parseSaleMetadata = (notes) => {
        let source = 'Tienda Online'; // default if not specified
        let branch = null;
        let cleanNotes = notes || '';

        if (notes) {
            const sourceMatch = notes.match(/\[Origen: ([^\]]+)\]/);
            if (sourceMatch) {
                source = sourceMatch[1];
                cleanNotes = cleanNotes.replace(/\[Origen: [^\]]+\]\s*/, '');
            } else if (notes.includes('[Sucursal:')) {
                // If it has a branch but no origin, it's a physical POS sale
                source = 'Punto de Venta';
            }
            
            const branchMatch = notes.match(/\[Sucursal: ([^\]]+)\]/);
            if (branchMatch) {
                branch = branchMatch[1];
                cleanNotes = cleanNotes.replace(/\[Sucursal: [^\]]+\]\s*/, '');
            }
        }
        
        return { source, branch, cleanNotes };
    };

    const [openGroups, setOpenGroups] = useState({ gestion: true, canales: true });
    const toggleGroup = (g) => setOpenGroups(prev => ({ ...prev, [g]: !prev[g] }));

    const navGroups = [
        {
            id: 'top',
            items: [
                { id: 'home', icon: <Home size={16} />, label: 'Inicio' },
                { id: 'statistics', icon: <BarChart2 size={16} />, label: 'Estadísticas' },
            ]
        },
        {
            id: 'gestion',
            label: 'GESTIÓN',
            items: [
                { id: 'sales', icon: <ShoppingBag size={16} />, label: 'Ventas' },
                { id: 'products', icon: <Package size={16} />, label: 'Productos' },
                { id: 'customers', icon: <Users size={16} />, label: 'Clientes' },
                { id: 'discounts', icon: <Tag size={16} />, label: 'Descuentos', badge: 'Nuevo' },
                { id: 'shipping', icon: <Truck size={16} />, label: 'Envíos' },
                { id: 'payments', icon: <CreditCard size={16} />, label: 'Pagos' },
            ]
        },
        {
            id: 'canales',
            label: 'CANALES DE VENTA',
            items: [
                { id: 'pos', icon: <Scan size={16} />, label: 'Punto de Venta', badge: 'Nuevo' },
                { id: 'store', icon: <Monitor size={16} />, label: 'Tienda Online' },
            ]
        },
        {
            id: 'config',
            label: 'CONFIGURACIÓN',
            items: [
                { id: 'settings', icon: <Palette size={16} />, label: 'Personalizar Tienda' },
                { id: 'contact', icon: <Phone size={16} />, label: 'Datos de Contacto' },
            ]
        },
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

                {/* Sidebar Navigation — Grouped like Tiendanube */}
                <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflowY: 'auto' }}>
                    {navGroups.map(group => (
                        <div key={group.id}>
                            {/* Group Label */}
                            {group.label && (
                                <div style={{ padding: '12px 12px 4px', fontSize: '10px', fontWeight: '800', color: colors.textSecondary, letterSpacing: '0.08em' }}>
                                    {group.label}
                                </div>
                            )}
                            {group.items.map(tab => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            position: 'relative',
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            width: '100%', padding: '10px 12px',
                                            border: 'none', borderRadius: '8px',
                                            background: isActive ? colors.sidebarActive : 'transparent',
                                            color: isActive ? colors.primary : colors.textSecondary,
                                            fontWeight: isActive ? '700' : '500',
                                            fontSize: '13px', cursor: 'pointer',
                                            textAlign: 'left', transition: 'all 0.15s',
                                            fontFamily: "'Inter', sans-serif",
                                        }}
                                    >
                                        {isActive && <div style={{ width: '3px', height: '16px', background: colors.primary, borderRadius: '4px', position: 'absolute', left: '2px' }} />}
                                        {React.cloneElement(tab.icon, { color: isActive ? colors.primary : colors.textSecondary })}
                                        <span style={{ flex: 1 }}>{tab.label}</span>
                                        {tab.badge && (
                                            <span style={{ fontSize: '9px', fontWeight: '800', background: '#5c2e9120', color: colors.primary, padding: '2px 6px', borderRadius: '9999px' }}>
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                            {group.id !== 'config' && <div style={{ height: '8px' }} />}
                        </div>
                    ))}
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
                            {activeTab === 'statistics' && 'Estadísticas'}
                            {activeTab === 'products' && 'Catálogo de Productos'}
                            {activeTab === 'sales' && 'Gestión de Pedidos'}
                            {activeTab === 'customers' && 'Clientes'}
                            {activeTab === 'discounts' && 'Descuentos y Promociones'}
                            {activeTab === 'shipping' && 'Configuración de Envíos'}
                            {activeTab === 'payments' && 'Medios de Pago'}
                            {activeTab === 'pos' && 'Punto de Venta'}
                            {activeTab === 'store' && 'Tienda Online'}
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

                {/* ── ESTADÍSTICAS ── */}
                {activeTab === 'statistics' && <StatisticsModule />}

                {/* ── CLIENTES ── */}
                {activeTab === 'customers' && <CustomersModule />}

                {/* ── DESCUENTOS ── */}
                {activeTab === 'discounts' && <DiscountsModule />}

                {/* ── ENVÍOS ── */}
                {activeTab === 'shipping' && <ShippingModule />}

                {/* ── PUNTO DE VENTA ── */}
                {activeTab === 'pos' && <PosModule />}

                {/* ── PAGOS (configuración dinámica de medios de pago) ── */}
                {activeTab === 'payments' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0 0 24px 0' }}>
                            <div>
                                <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, margin: '0 0 6px 0' }}>Medios de Pago</h2>
                                <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0' }}>Habilitá y configurá las credenciales o datos necesarios de los métodos de pago aceptados en tu tienda</p>
                            </div>
                            
                            <button
                                onClick={handleSavePaymentsConfig}
                                style={{
                                    background: colors.primary, color: '#fff', border: 'none',
                                    padding: '10px 20px', borderRadius: '8px', fontSize: '12px',
                                    fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                    boxShadow: '0 2px 4px rgba(92, 46, 145, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = colors.primaryHover}
                                onMouseLeave={e => e.currentTarget.style.background = colors.primary}
                            >
                                💾 Guardar Cambios
                            </button>
                        </div>
                        
                        {/* Top Overview Cards Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                            {[
                                { id: 'mp', title: 'Mercado Pago', desc: 'Checkout Pro. Tarjetas de crédito/débito y saldo de cuenta.', color: '#00b1ea', iconKey: 'mp' },
                                { id: 'transfer', title: 'Transferencia Bancaria', desc: 'Alias o CBU/CVU. Cobros manuales verificados.', color: '#10b981', iconKey: 'transfer' },
                                { id: 'cash', title: 'Efectivo / Retiro', desc: 'Pago físico al retirar en sucursal o contra entrega.', color: '#f59e0b', iconKey: 'cash' },
                                { id: 'posnet', title: 'Posnet / Tarjeta', desc: 'Terminal física para tarjetas en punto de venta.', color: '#8b5cf6', iconKey: 'posnet' },
                                { id: 'modo', title: 'MODO', desc: 'Billetera argentina. Botón de pago y QR unificado.', color: '#ff003c', iconKey: 'modo' },
                                { id: 'gocuotas', title: 'Go Cuotas', desc: 'Financiación en cuotas con cualquier tarjeta de débito.', color: '#4ade80', iconKey: 'gocuotas' }
                            ].map(pm => {
                                const isActive = !!paymentsConfig[pm.id]?.active;
                                const isConfigured = isPaymentMethodConfigured(pm.id, paymentsConfig);
                                return (
                                    <div 
                                        key={pm.id} 
                                        style={{ 
                                            background: '#fff', 
                                            border: `1px solid ${colors.border}`, 
                                            borderRadius: '12px', 
                                            padding: '20px', 
                                            borderLeft: `5px solid ${pm.color}`, 
                                            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            justifyContent: 'space-between',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0px)';
                                            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.05)';
                                        }}
                                        onClick={() => {
                                            setActiveAccordion(pm.id);
                                            const element = document.getElementById(`accordion-${pm.id}`);
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <div>{PaymentIcons[pm.iconKey]}</div>
                                                
                                                {/* Modern Toggle Switch */}
                                                <div 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTogglePaymentMethod(pm.id);
                                                    }}
                                                    style={{
                                                        width: '44px',
                                                        height: '24px',
                                                        borderRadius: '12px',
                                                        background: isActive ? colors.success : '#cbd5e1',
                                                        padding: '2px',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        transition: 'background-color 0.2s',
                                                        boxSizing: 'border-box'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        background: '#ffffff',
                                                        transform: isActive ? 'translateX(20px)' : 'translateX(0px)',
                                                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                                                    }}/>
                                                </div>
                                            </div>
                                            
                                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: '0 0 4px 0' }}>{pm.title}</h3>
                                            <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '0 0 16px 0', lineHeight: '1.4' }}>{pm.desc}</p>
                                        </div>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: `1px solid ${colors.border}`, paddingTop: '12px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: isActive ? colors.success : colors.textSecondary }}>
                                                {isActive ? '● Activo' : '○ Inactivo'}
                                            </span>
                                            
                                            {isConfigured ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '800', color: '#15803d', background: '#dcfce7', padding: '3px 8px', borderRadius: '10px' }}>
                                                    ✓ Listo
                                                </span>
                                            ) : (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '800', color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '10px' }}>
                                                    ⚠️ Configurar
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Accordion Form List Section */}
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* MERCADO PAGO ACCORDION */}
                            <div 
                                id="accordion-mp"
                                style={{ 
                                    background: '#fff', 
                                    border: `1px solid ${activeAccordion === 'mp' ? colors.primary : colors.border}`, 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    boxShadow: activeAccordion === 'mp' ? '0 4px 20px -2px rgba(92, 46, 145, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div 
                                    onClick={() => setActiveAccordion(activeAccordion === 'mp' ? null : 'mp')}
                                    style={{ 
                                        padding: '18px 24px', 
                                        background: activeAccordion === 'mp' ? '#fbf8ff' : '#ffffff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        borderBottom: activeAccordion === 'mp' ? `1px solid ${colors.border}` : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        {PaymentIcons.mp}
                                        <div>
                                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: '0' }}>Mercado Pago</h3>
                                            <span style={{ fontSize: '12px', color: colors.textSecondary }}>Habilitar Checkout Pro para ventas automatizadas con tarjetas y dinero en cuenta.</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {isPaymentMethodConfigured('mp', paymentsConfig) ? (
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>Configurado ✓</span>
                                        ) : (
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: '12px' }}>Pendiente ⚠️</span>
                                        )}
                                        <span style={{ fontSize: '14px', color: colors.textSecondary, transition: 'transform 0.3s', transform: activeAccordion === 'mp' ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                    </div>
                                </div>
                                
                                {activeAccordion === 'mp' && (
                                    <div style={{ padding: '28px', background: '#ffffff' }}>
                                        
                                        {connectionStatus.mp && (
                                            <div style={{ 
                                                marginBottom: '20px', 
                                                padding: '12px 18px', 
                                                borderRadius: '8px', 
                                                background: connectionStatus.mp === 'success' ? '#dcfce7' : '#fee2e2',
                                                color: connectionStatus.mp === 'success' ? '#15803d' : '#b91c1c',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}>
                                                {connectionStatus.mp === 'success' ? '✓ Credenciales con formato válido. Guarde la configuración para confirmar la conexión comercial.' : '⚠️ Falta ingresar Public Key o Access Token.'}
                                            </div>
                                        )}
                                        
                                        {/* Step-by-Step Guide */}
                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px 24px', marginBottom: '24px' }}>
                                            <h4 style={{ fontSize: '13px', fontWeight: '800', color: colors.text, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📖 Guía de Integración Rápida</h4>
                                            <ol style={{ fontSize: '12.5px', color: colors.textSecondary, margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
                                                <li>Ingresá a <a href="https://www.mercadopago.com.ar/developers" target="_blank" rel="noreferrer" style={{ color: colors.primary, fontWeight: '700' }}>Mercado Pago Developers</a>.</li>
                                                <li>Iniciá sesión con tu cuenta vendedora habitual de Mercado Pago.</li>
                                                <li>Accedé a <strong>Tus Integraciones</strong> y creá una aplicación llamada por ejemplo "Olmoind E-commerce" (tipo de solución: "Pagos Online").</li>
                                                <li>En el panel lateral de tu aplicación, hacé click en <strong>Credenciales de Producción</strong>. Completá el formulario de onboarding de Mercado Pago para activarlas si aún no lo has hecho.</li>
                                                <li>Copiá la **Public Key** y el **Access Token** de producción y pegalos a continuación.</li>
                                                <li>Para recibir notificaciones instantáneas de compra, copiá la Webhook URL de abajo y agregala en la sección de notificaciones Webhook de Mercado Pago.</li>
                                            </ol>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Entorno de Cobro</label>
                                                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.text, cursor: 'pointer' }}>
                                                        <input 
                                                            type="radio" 
                                                            name="mp-env"
                                                            checked={(paymentsConfig.mp?.env || 'test') === 'prod'} 
                                                            onChange={() => handleUpdateConfig('mp', 'env', 'prod')}
                                                            style={{ accentColor: colors.primary }}
                                                        />
                                                        Producción (Dinero Real)
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.text, cursor: 'pointer' }}>
                                                        <input 
                                                            type="radio" 
                                                            name="mp-env"
                                                            checked={(paymentsConfig.mp?.env || 'test') === 'test'} 
                                                            onChange={() => handleUpdateConfig('mp', 'env', 'test')}
                                                            style={{ accentColor: colors.primary }}
                                                        />
                                                        Modo Prueba (Sandbox)
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Webhook URL (Notificaciones)</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        readOnly
                                                        value={window.location.origin + '/api/webhooks/mercadopago'}
                                                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.textSecondary, borderRadius: '8px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(window.location.origin + '/api/webhooks/mercadopago');
                                                            setCopiedMpWebhook(true);
                                                            setTimeout(() => setCopiedMpWebhook(false), 2000);
                                                        }}
                                                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: colors.text, cursor: 'pointer' }}
                                                    >
                                                        {copiedMpWebhook ? 'Copiado!' : 'Copiar'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Public Key</label>
                                                <input
                                                    value={paymentsConfig.mp?.publicKey || ''}
                                                    onChange={e => handleUpdateConfig('mp', 'publicKey', e.target.value)}
                                                    placeholder="Ej: APP_USR-876a3b..."
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', fontFamily: "'Inter', sans-serif", width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Access Token</label>
                                                <input
                                                    type="password"
                                                    value={paymentsConfig.mp?.accessToken || ''}
                                                    onChange={e => handleUpdateConfig('mp', 'accessToken', e.target.value)}
                                                    placeholder="Ej: APP_USR-78912..."
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', fontFamily: "'Inter', sans-serif", width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-start', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleTestConnection('mp')}
                                                style={{ background: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: colors.text, cursor: 'pointer' }}
                                            >
                                                🔌 Probar Credenciales
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* TRANSFERENCIA BANCARIA ACCORDION */}
                            <div 
                                id="accordion-transfer"
                                style={{ 
                                    background: '#fff', 
                                    border: `1px solid ${activeAccordion === 'transfer' ? colors.primary : colors.border}`, 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    boxShadow: activeAccordion === 'transfer' ? '0 4px 20px -2px rgba(92, 46, 145, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div 
                                    onClick={() => setActiveAccordion(activeAccordion === 'transfer' ? null : 'transfer')}
                                    style={{ 
                                        padding: '18px 24px', 
                                        background: activeAccordion === 'transfer' ? '#fbf8ff' : '#ffffff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        borderBottom: activeAccordion === 'transfer' ? `1px solid ${colors.border}` : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        {PaymentIcons.transfer}
                                        <div>
                                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: '0' }}>Transferencia Bancaria</h3>
                                            <span style={{ fontSize: '12px', color: colors.textSecondary }}>Configurar cuenta de banco o billetera virtual para recibir transferencias directas.</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {isPaymentMethodConfigured('transfer', paymentsConfig) ? (
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>Configurado ✓</span>
                                        ) : (
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: '12px' }}>Pendiente ⚠️</span>
                                        )}
                                        <span style={{ fontSize: '14px', color: colors.textSecondary, transition: 'transform 0.3s', transform: activeAccordion === 'transfer' ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                    </div>
                                </div>
                                
                                {activeAccordion === 'transfer' && (
                                    <div style={{ padding: '28px', background: '#ffffff' }}>
                                        
                                        {connectionStatus.transfer && (
                                            <div style={{ 
                                                marginBottom: '20px', 
                                                padding: '12px 18px', 
                                                borderRadius: '8px', 
                                                background: connectionStatus.transfer === 'success' ? '#dcfce7' : '#fee2e2',
                                                color: connectionStatus.transfer === 'success' ? '#15803d' : '#b91c1c',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                {connectionStatus.transfer === 'success' ? '✓ Datos completos. Se mostrarán al cliente al terminar el checkout.' : '⚠️ Falta ingresar Alias, CBU o Nombre de Titular.'}
                                            </div>
                                        )}

                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px 24px', marginBottom: '24px' }}>
                                            <h4 style={{ fontSize: '13px', fontWeight: '800', color: colors.text, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏦 Información de Cobro</h4>
                                            <p style={{ fontSize: '12.5px', color: colors.textSecondary, margin: '0', lineHeight: '1.6' }}>
                                                Al seleccionar Transferencia Bancaria, tu e-commerce le proporcionará estos datos al cliente para que realice el pago de forma manual. Una vez finalizada la transferencia, el cliente podrá enviar el comprobante de pago mediante WhatsApp o adjuntarlo en la web.
                                            </p>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre del Titular</label>
                                                <input
                                                    value={paymentsConfig.transfer?.titular || ''}
                                                    onChange={e => handleUpdateConfig('transfer', 'titular', e.target.value)}
                                                    placeholder="Ej: Olmo Indumentaria S.R.L."
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>CUIT/CUIL del Titular</label>
                                                <input
                                                    value={paymentsConfig.transfer?.cuit || ''}
                                                    onChange={e => handleUpdateConfig('transfer', 'cuit', e.target.value)}
                                                    placeholder="Ej: 30-71458921-9"
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Banco o Proveedor</label>
                                                <input
                                                    value={paymentsConfig.transfer?.banco || ''}
                                                    onChange={e => handleUpdateConfig('transfer', 'banco', e.target.value)}
                                                    placeholder="Ej: Banco Galicia o Mercado Pago"
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Alias CBU/CVU</label>
                                                <input
                                                    value={paymentsConfig.transfer?.alias || ''}
                                                    onChange={e => handleUpdateConfig('transfer', 'alias', e.target.value)}
                                                    placeholder="Ej: OLMO.VENTAS.MP"
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Nro de CBU o CVU</label>
                                                <input
                                                    value={paymentsConfig.transfer?.cbu || ''}
                                                    onChange={e => handleUpdateConfig('transfer', 'cbu', e.target.value)}
                                                    placeholder="22 dígitos numéricos"
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-start', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleTestConnection('transfer')}
                                                style={{ background: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: colors.text, cursor: 'pointer' }}
                                            >
                                                🔌 Validar Datos
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* MODO ACCORDION */}
                            <div 
                                id="accordion-modo"
                                style={{ 
                                    background: '#fff', 
                                    border: `1px solid ${activeAccordion === 'modo' ? colors.primary : colors.border}`, 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    boxShadow: activeAccordion === 'modo' ? '0 4px 20px -2px rgba(92, 46, 145, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div 
                                    onClick={() => setActiveAccordion(activeAccordion === 'modo' ? null : 'modo')}
                                    style={{ 
                                        padding: '18px 24px', 
                                        background: activeAccordion === 'modo' ? '#fbf8ff' : '#ffffff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        borderBottom: activeAccordion === 'modo' ? `1px solid ${colors.border}` : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        {PaymentIcons.modo}
                                        <div>
                                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: '0' }}>MODO</h3>
                                            <span style={{ fontSize: '12px', color: colors.textSecondary }}>Habilitar cobro directo MODO vía Decidir / Payway.</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {isPaymentMethodConfigured('modo', paymentsConfig) ? (
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>Configurado ✓</span>
                                        ) : (
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: '12px' }}>Pendiente ⚠️</span>
                                        )}
                                        <span style={{ fontSize: '14px', color: colors.textSecondary, transition: 'transform 0.3s', transform: activeAccordion === 'modo' ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                    </div>
                                </div>
                                
                                {activeAccordion === 'modo' && (
                                    <div style={{ padding: '28px', background: '#ffffff' }}>
                                        
                                        {connectionStatus.modo && (
                                            <div style={{ 
                                                marginBottom: '20px', 
                                                padding: '12px 18px', 
                                                borderRadius: '8px', 
                                                background: connectionStatus.modo === 'success' ? '#dcfce7' : '#fee2e2',
                                                color: connectionStatus.modo === 'success' ? '#15803d' : '#b91c1c',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                {connectionStatus.modo === 'success' ? '✓ Parámetros correctos. Asegure vincular con el alias de sucursal en Payway.' : '⚠️ Falta ingresar Store ID, API Key Pública o API Key Privada.'}
                                            </div>
                                        )}

                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px 24px', marginBottom: '24px' }}>
                                            <h4 style={{ fontSize: '13px', fontWeight: '800', color: colors.text, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📖 Guía para Habilitar MODO</h4>
                                            <ol style={{ fontSize: '12.5px', color: colors.textSecondary, margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
                                                <li>MODO opera mediante las credenciales de tu pasarela web <strong>Decidir de Payway</strong>.</li>
                                                <li>Iniciá sesión en el portal de <a href="https://mi.payway.com.ar" target="_blank" rel="noreferrer" style={{ color: colors.primary, fontWeight: '700' }}>Payway Comercios</a> con tus datos de establecimiento.</li>
                                                <li>En la pestaña de integraciones web, copiá tu **Nro de Establecimiento** (que será tu **Store ID** en Olmoind).</li>
                                                <li>Obtené tus **API Key Pública** y **API Key Privada** asignadas por Payway para transacciones seguras de MODO.</li>
                                                <li>Pegá las tres credenciales en sus respectivos casilleros a continuación.</li>
                                            </ol>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Store ID (Nº Sitio Payway)</label>
                                                <input
                                                    value={paymentsConfig.modo?.storeId || ''}
                                                    onChange={e => handleUpdateConfig('modo', 'storeId', e.target.value)}
                                                    placeholder="Ej: 10045612"
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>API Key Pública</label>
                                                <input
                                                    value={paymentsConfig.modo?.publicKey || ''}
                                                    onChange={e => handleUpdateConfig('modo', 'publicKey', e.target.value)}
                                                    placeholder="Ej: pk_decidir_..."
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>API Key Privada</label>
                                                <input
                                                    type="password"
                                                    value={paymentsConfig.modo?.privateKey || ''}
                                                    onChange={e => handleUpdateConfig('modo', 'privateKey', e.target.value)}
                                                    placeholder="Ej: sk_decidir_..."
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-start', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleTestConnection('modo')}
                                                style={{ background: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: colors.text, cursor: 'pointer' }}
                                            >
                                                🔌 Verificar Conexión
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* GO CUOTAS ACCORDION */}
                            <div 
                                id="accordion-gocuotas"
                                style={{ 
                                    background: '#fff', 
                                    border: `1px solid ${activeAccordion === 'gocuotas' ? colors.primary : colors.border}`, 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    boxShadow: activeAccordion === 'gocuotas' ? '0 4px 20px -2px rgba(92, 46, 145, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div 
                                    onClick={() => setActiveAccordion(activeAccordion === 'gocuotas' ? null : 'gocuotas')}
                                    style={{ 
                                        padding: '18px 24px', 
                                        background: activeAccordion === 'gocuotas' ? '#fbf8ff' : '#ffffff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        borderBottom: activeAccordion === 'gocuotas' ? `1px solid ${colors.border}` : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        {PaymentIcons.gocuotas}
                                        <div>
                                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: '0' }}>Go Cuotas</h3>
                                            <span style={{ fontSize: '12px', color: colors.textSecondary }}>Habilitar financiación con tarjetas de débito ordinarias.</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {isPaymentMethodConfigured('gocuotas', paymentsConfig) ? (
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>Configurado ✓</span>
                                        ) : (
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: '12px' }}>Pendiente ⚠️</span>
                                        )}
                                        <span style={{ fontSize: '14px', color: colors.textSecondary, transition: 'transform 0.3s', transform: activeAccordion === 'gocuotas' ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                    </div>
                                </div>
                                
                                {activeAccordion === 'gocuotas' && (
                                    <div style={{ padding: '28px', background: '#ffffff' }}>
                                        
                                        {connectionStatus.gocuotas && (
                                            <div style={{ 
                                                marginBottom: '20px', 
                                                padding: '12px 18px', 
                                                borderRadius: '8px', 
                                                background: connectionStatus.gocuotas === 'success' ? '#dcfce7' : '#fee2e2',
                                                color: connectionStatus.gocuotas === 'success' ? '#15803d' : '#b91c1c',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                {connectionStatus.gocuotas === 'success' ? '✓ Credenciales con formato válido para cobros con débito.' : '⚠️ Falta ingresar Email, Token (API Key) o ID de Sucursal.'}
                                            </div>
                                        )}

                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px 24px', marginBottom: '24px' }}>
                                            <h4 style={{ fontSize: '13px', fontWeight: '800', color: colors.text, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📖 Guía de Integración Go Cuotas</h4>
                                            <ol style={{ fontSize: '12.5px', color: colors.textSecondary, margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
                                                <li>Iniciá sesión en el panel comercial de <a href="https://www.gocuotas.com" target="_blank" rel="noreferrer" style={{ color: colors.primary, fontWeight: '700' }}>Go Cuotas Comercios</a>.</li>
                                                <li>Dirigite a la sección <strong>Sucursales</strong> y creá una sucursal para tu e-commerce.</li>
                                                <li>Copiá el **Email del comercio**, el **Token de comercio** (API Key) y el **ID de Sucursal** (Branch ID) que te asigna la plataforma.</li>
                                                <li>Pegalos a continuación para ofrecer pagos financiados en 2, 3 o 4 cuotas sin tarjeta de crédito.</li>
                                            </ol>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Email de Comercio</label>
                                                <input
                                                    value={paymentsConfig.gocuotas?.email || ''}
                                                    onChange={e => handleUpdateConfig('gocuotas', 'email', e.target.value)}
                                                    placeholder="Ej: olmocomercial@gmail.com"
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Token de Comercio (API Key)</label>
                                                <input
                                                    type="password"
                                                    value={paymentsConfig.gocuotas?.apiKey || ''}
                                                    onChange={e => handleUpdateConfig('gocuotas', 'apiKey', e.target.value)}
                                                    placeholder="Token de comercio Go Cuotas"
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>ID de Sucursal (Branch ID)</label>
                                                <input
                                                    value={paymentsConfig.gocuotas?.branchId || ''}
                                                    onChange={e => handleUpdateConfig('gocuotas', 'branchId', e.target.value)}
                                                    placeholder="Ej: 10452"
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-start', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleTestConnection('gocuotas')}
                                                style={{ background: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: colors.text, cursor: 'pointer' }}
                                            >
                                                🔌 Probar Conexión
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* EFECTIVO ACCORDION */}
                            <div 
                                id="accordion-cash"
                                style={{ 
                                    background: '#fff', 
                                    border: `1px solid ${activeAccordion === 'cash' ? colors.primary : colors.border}`, 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    boxShadow: activeAccordion === 'cash' ? '0 4px 20px -2px rgba(92, 46, 145, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div 
                                    onClick={() => setActiveAccordion(activeAccordion === 'cash' ? null : 'cash')}
                                    style={{ 
                                        padding: '18px 24px', 
                                        background: activeAccordion === 'cash' ? '#fbf8ff' : '#ffffff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        borderBottom: activeAccordion === 'cash' ? `1px solid ${colors.border}` : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        {PaymentIcons.cash}
                                        <div>
                                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: '0' }}>Efectivo / Retiro en Showroom</h3>
                                            <span style={{ fontSize: '12px', color: colors.textSecondary }}>Habilitar cobro presencial en billetes físicos al retirar.</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {isPaymentMethodConfigured('cash', paymentsConfig) ? (
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>Configurado ✓</span>
                                        ) : (
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: '12px' }}>Falta Texto ⚠️</span>
                                        )}
                                        <span style={{ fontSize: '14px', color: colors.textSecondary, transition: 'transform 0.3s', transform: activeAccordion === 'cash' ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                    </div>
                                </div>
                                
                                {activeAccordion === 'cash' && (
                                    <div style={{ padding: '28px', background: '#ffffff' }}>
                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px 24px', marginBottom: '24px' }}>
                                            <h4 style={{ fontSize: '13px', fontWeight: '800', color: colors.text, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💵 Configuración de Instrucciones</h4>
                                            <p style={{ fontSize: '12.5px', color: colors.textSecondary, margin: '0', lineHeight: '1.6' }}>
                                                Escribí indicaciones claras para que el cliente sepa la dirección del showroom, los horarios de retiro disponibles, y si cuenta con algún beneficio especial (como descuentos) al abonar en efectivo.
                                            </p>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Texto Explicativo para el Cliente</label>
                                            <textarea
                                                value={paymentsConfig.cash?.instructions || ''}
                                                onChange={e => handleUpdateConfig('cash', 'instructions', e.target.value)}
                                                placeholder="Ej: Retirá tu pedido en Cervantes 35 local A, Paraná. Horarios: Lunes a Sábado de 10:00 a 20:00 hs. ¡Abonando en efectivo obtenés un 10% de descuento en el total de tu compra!"
                                                rows={4}
                                                style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '12px 14px', color: colors.text, outline: 'none', borderRadius: '8px', fontSize: '14px', fontFamily: "'Inter', sans-serif", width: '100%', boxSizing: 'border-box', resize: 'vertical', lineHeight: '1.5' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* POSNET ACCORDION */}
                            <div 
                                id="accordion-posnet"
                                style={{ 
                                    background: '#fff', 
                                    border: `1px solid ${activeAccordion === 'posnet' ? colors.primary : colors.border}`, 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    boxShadow: activeAccordion === 'posnet' ? '0 4px 20px -2px rgba(92, 46, 145, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div 
                                    onClick={() => setActiveAccordion(activeAccordion === 'posnet' ? null : 'posnet')}
                                    style={{ 
                                        padding: '18px 24px', 
                                        background: activeAccordion === 'posnet' ? '#fbf8ff' : '#ffffff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        borderBottom: activeAccordion === 'posnet' ? `1px solid ${colors.border}` : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        {PaymentIcons.posnet}
                                        <div>
                                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: '0' }}>Posnet / Terminal de local</h3>
                                            <span style={{ fontSize: '12px', color: colors.textSecondary }}>Habilitar cobro con tarjeta física en punto de venta (POS).</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>Configurado ✓</span>
                                        <span style={{ fontSize: '14px', color: colors.textSecondary, transition: 'transform 0.3s', transform: activeAccordion === 'posnet' ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                    </div>
                                </div>
                                
                                {activeAccordion === 'posnet' && (
                                    <div style={{ padding: '28px', background: '#ffffff' }}>
                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px 24px' }}>
                                            <h4 style={{ fontSize: '13px', fontWeight: '800', color: colors.text, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔲 Canal Punto de Venta Físico</h4>
                                            <p style={{ fontSize: '12.5px', color: colors.textSecondary, margin: '0', lineHeight: '1.6' }}>
                                                Este método no requiere credenciales de API. Habilita a tus vendedores de local a poder registrar transacciones que se cobren físicamente usando el Posnet/Lapoint (tarjetas de crédito y débito). Al activarse en las Overview Cards superiores, aparecerá como método elegible en tu módulo POS.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Bottom Save Action Panel */}
                        <div style={{ 
                            marginTop: '28px', 
                            background: '#ffffff', 
                            border: `1px solid ${colors.border}`, 
                            borderRadius: '12px', 
                            padding: '16px 24px', 
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between' 
                        }}>
                            <span style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: '500' }}>
                                {savedMsg ? (
                                    <span style={{ color: colors.success, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        ✓ ¡Cambios guardados con éxito en la base de datos!
                                    </span>
                                ) : (
                                    'Asegurate de guardar antes de salir de esta pestaña'
                                )}
                            </span>
                            
                            <button
                                onClick={handleSavePaymentsConfig}
                                style={{
                                    background: colors.primary, color: '#fff', border: 'none',
                                    padding: '12px 28px', borderRadius: '8px', fontSize: '14px',
                                    fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                    boxShadow: '0 2px 4px rgba(92, 46, 145, 0.2)',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.95'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                )}

                {/* ── TIENDA ONLINE ── */}
                {activeTab === 'store' && (
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, margin: '0 0 8px 0' }}>Tienda Online</h2>
                        <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 24px 0' }}>Estado y acceso rápido a tu tienda pública</p>
                        <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '32px', textAlign: 'center', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛍️</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: colors.text, margin: '0 0 8px 0' }}>Tu tienda está en línea</h3>
                            <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 24px 0' }}>Olmo Indumentaria está publicada y activa en Vercel</p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <a href="/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: colors.primary, color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', fontFamily: "'Inter', sans-serif" }}>
                                    <ArrowUpRight size={16} /> Ver tienda
                                </a>
                                <button onClick={() => setActiveTab('settings')} style={{ background: '#f1f5f9', color: colors.text, border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                                    Personalizar diseño
                                </button>
                            </div>
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
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                            <span style={{ fontSize: '10px', color: colors.textSecondary, fontFamily: 'monospace' }}>ID: {item.id.slice(0, 8).toUpperCase()}</span>
                                                            {item.colors && item.colors.length > 0 && (
                                                                <div style={{ display: 'flex', gap: '3px', marginLeft: '6px' }}>
                                                                    {item.colors.map(col => (
                                                                        <span
                                                                            key={col.name}
                                                                            style={{
                                                                                width: '8px',
                                                                                height: '8px',
                                                                                borderRadius: '50%',
                                                                                background: col.hex,
                                                                                border: '1px solid #cbd5e1',
                                                                                display: 'inline-block'
                                                                            }}
                                                                            title={col.name}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
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
                {activeTab === 'sales' && (() => {
                    const filteredSales = localSales.filter(sale => {
                        const { source } = parseSaleMetadata(sale.notes);
                        if (salesFilter === 'online') {
                            return source === 'Tienda Online';
                        } else if (salesFilter === 'pos') {
                            return source === 'Punto de Venta';
                        }
                        return true;
                    });

                    return (
                        <div>
                            <div style={card}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                    <div>
                                        <h3 style={{ ...sectionTitle, marginBottom: '4px' }}>Lista de Ventas y Pedidos ({filteredSales.length})</h3>
                                        <p style={{ fontSize: '12px', color: colors.textSecondary, margin: 0 }}>
                                            Administra los estatus de entrega para cada pedido. Esto ayuda al comprador a tener seguimiento de su orden.
                                        </p>
                                    </div>
                                    
                                    {/* Selector de Origen / Canal */}
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {[
                                            { id: 'all', label: 'Todos' },
                                            { id: 'online', label: '🛒 Tienda Online' },
                                            { id: 'pos', label: '🏪 Punto de Venta' }
                                        ].map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => setSalesFilter(f.id)}
                                                style={{
                                                    padding: '8px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '11.5px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    fontFamily: "'Inter', sans-serif",
                                                    border: `1px solid ${salesFilter === f.id ? colors.primary : colors.border}`,
                                                    background: salesFilter === f.id ? colors.primary : '#f8fafc',
                                                    color: salesFilter === f.id ? '#ffffff' : colors.textSecondary,
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {filteredSales.map(sale => {
                                        const status = sale.status || 'Pendiente';
                                        const st = getStatusStyles(status);
                                        const { source, branch, cleanNotes } = parseSaleMetadata(sale.notes);

                                        return (
                                            <div key={sale.id} style={{
                                                border: `1px solid ${colors.border}`, borderRadius: '12px',
                                                background: '#ffffff', padding: '20px', display: 'flex', flexWrap: 'wrap',
                                                gap: '20px', alignItems: 'center', justifyContent: 'space-between',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                            }}>
                                                {/* Order code & Date */}
                                                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: '220px' }}>
                                                    <div style={{ width: '40px', height: '40px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                                                        <ShoppingBag size={18} color={colors.primary} />
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            <h4 style={{ fontSize: '13px', fontWeight: '850', color: colors.text, margin: 0 }}>ORDEN #{sale.id.slice(0, 6).toUpperCase()}</h4>
                                                            <span style={{
                                                                fontSize: '9px',
                                                                fontWeight: '800',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                textTransform: 'uppercase',
                                                                background: source === 'Tienda Online' ? '#f3e8ff' : '#dcfce7',
                                                                color: source === 'Tienda Online' ? '#6b21a8' : '#15803d',
                                                                border: `1px solid ${source === 'Tienda Online' ? '#e9d5ff' : '#bbf7d0'}`
                                                            }}>
                                                                {source === 'Tienda Online' ? '🛒 Online' : `🏪 POS${branch ? ` · ${branch}` : ''}`}
                                                            </span>
                                                        </div>
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
                                                    {cleanNotes && (
                                                        <p style={{ fontSize: '11px', color: colors.textSecondary, fontStyle: 'italic', marginTop: '6px', borderTop: `1px dashed ${colors.border}`, paddingTop: '4px' }}>
                                                            📝 {cleanNotes}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Price Total and Status Selector */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
                                    {filteredSales.length === 0 && (
                                        <p style={{ color: colors.textSecondary, textAlign: 'center', padding: '40px' }}>No se encontraron ventas con este filtro.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}

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
                                    { key: 'instagram', label: 'Nombre de usuario de Instagram (Sin @ ni URL)', placeholder: 'olmo.ind' },
                                    { key: 'email', label: 'Correo electrónico de consultas', placeholder: 'olmoshowroom@gmail.com' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label style={labelStyle}>{f.label}</label>
                                        <input
                                            type="text"
                                            value={contact[f.key] || ''}
                                            onChange={e => {
                                                let val = e.target.value;
                                                if (f.key === 'instagram') val = val.replace('@', '').replace('https://www.instagram.com/', '').replace('/', '');
                                                setContact({ ...contact, [f.key]: val });
                                            }}
                                            placeholder={f.placeholder}
                                            style={inputStyle}
                                        />
                                    </div>
                                ))}

                                {/* GESTIÓN DE LOCALES / SUCURSALES */}
                                <div style={{ marginTop: '16px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
                                    <label style={{ ...labelStyle, fontSize: '13px', color: colors.primary, marginBottom: '12px', display: 'block' }}>Locales / Sucursales</label>
                                    
                                    {(contact.addresses || []).map((addr, idx) => (
                                        <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: `1px solid ${colors.border}`, marginBottom: '12px', position: 'relative' }}>
                                            <button onClick={() => {
                                                const updated = (contact.addresses || []).filter((_, i) => i !== idx);
                                                setContact({ ...contact, addresses: updated });
                                            }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: colors.error, cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '24px' }}>
                                                <input type="text" placeholder="Nombre de Sucursal (Ej: Local Centro)" value={addr.name || ''} onChange={e => {
                                                    const updated = [...(contact.addresses || [])];
                                                    updated[idx].name = e.target.value;
                                                    setContact({ ...contact, addresses: updated });
                                                }} style={{ ...inputStyle, padding: '8px 12px' }} />
                                                <input type="text" placeholder="Dirección Física (Ej: Cervantes 35)" value={addr.address || ''} onChange={e => {
                                                    const updated = [...(contact.addresses || [])];
                                                    updated[idx].address = e.target.value;
                                                    setContact({ ...contact, addresses: updated });
                                                }} style={{ ...inputStyle, padding: '8px 12px' }} />
                                                <input type="text" placeholder="Enlace de Google Maps (Ej: https://maps.app.goo.gl/...)" value={addr.mapUrl || ''} onChange={e => {
                                                    const updated = [...(contact.addresses || [])];
                                                    updated[idx].mapUrl = e.target.value;
                                                    setContact({ ...contact, addresses: updated });
                                                }} style={{ ...inputStyle, padding: '8px 12px' }} />
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button onClick={() => {
                                        const updated = [...(contact.addresses || []), { name: '', address: '', mapUrl: '' }];
                                        setContact({ ...contact, addresses: updated });
                                    }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: `1px dashed ${colors.primary}`, color: colors.primary, padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                                        <Plus size={16} /> Agregar Nueva Sucursal
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                                    <button onClick={async () => { await updateSetting('contact', contact); showSaved(); }} style={{
                                        background: colors.primary, color: '#ffffff', border: 'none',
                                        padding: '14px 24px', borderRadius: '8px', fontSize: '13px',
                                        fontWeight: '700', cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        fontFamily: "'Inter', sans-serif"
                                    }}>
                                        Guardar Datos de Contacto
                                    </button>
                                    {savedMsg && <span style={{ color: colors.success, fontSize: '13px', fontWeight: 'bold' }}>{savedMsg}</span>}
                                </div>
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

                            {/* Colores de Prenda */}
                            <div>
                                <label style={labelStyle}>Colores Disponibles</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                                    {COLOR_PALETTE.map(c => {
                                        const isSelected = (formData.colors || []).some(item => item.name === c.name);
                                        const light = isLightColor(c.hex);
                                        return (
                                            <button
                                                key={c.name}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setFormData(prev => ({ ...prev, colors: (prev.colors || []).filter(item => item.name !== c.name) }));
                                                    } else {
                                                        setFormData(prev => ({ ...prev, colors: [...(prev.colors || []), { name: c.name, hex: c.hex }] }));
                                                    }
                                                }}
                                                style={{
                                                    position: 'relative',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    background: c.hex,
                                                    border: isSelected ? '2px solid #000' : `1px solid ${light ? '#cbd5e1' : 'transparent'}`,
                                                    cursor: 'pointer',
                                                    boxShadow: isSelected ? '0 0 0 2px #fff, 0 4px 6px -1px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: 0
                                                }}
                                                title={c.name}
                                            >
                                                {isSelected && (
                                                    <Check size={14} color={light ? '#000000' : '#ffffff'} strokeWidth={3} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom Color Inline Form */}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', minWidth: '70px' }}>Personalizado:</span>
                                    <input
                                        type="text"
                                        placeholder="Nombre (ej: Beige Claro)"
                                        value={customColorName}
                                        onChange={e => setCustomColorName(e.target.value)}
                                        style={{ ...inputStyle, padding: '6px 10px', fontSize: '12px', flex: 1 }}
                                    />
                                    <input
                                        type="color"
                                        value={customColorHex}
                                        onChange={e => setCustomColorHex(e.target.value)}
                                        style={{ width: '32px', height: '28px', border: `1px solid ${colors.border}`, borderRadius: '6px', cursor: 'pointer', padding: 0, background: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!customColorName.trim()) {
                                                alert('Por favor ingresa un nombre para el color personalizado.');
                                                return;
                                            }
                                            const newColor = { name: customColorName.trim(), hex: customColorHex };
                                            if ((formData.colors || []).some(item => item.name.toLowerCase() === newColor.name.toLowerCase())) {
                                                alert('Ya existe un color con ese nombre.');
                                                return;
                                            }
                                            setFormData(prev => ({ ...prev, colors: [...(prev.colors || []), newColor] }));
                                            setCustomColorName('');
                                        }}
                                        style={{
                                            background: 'rgba(92, 46, 145, 0.08)',
                                            color: colors.primary,
                                            border: `1px solid ${colors.primary}`,
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Agregar
                                    </button>
                                </div>

                                {/* Custom Selection Tags Preview */}
                                {(formData.colors || []).length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                        {formData.colors.map(col => {
                                            const light = isLightColor(col.hex);
                                            return (
                                                <div key={col.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${colors.border}` }}>
                                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.hex, border: light ? '1px solid #94a3b8' : 'none' }}></span>
                                                    <span style={{ fontSize: '11px', fontWeight: '600', color: colors.text }}>{col.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, colors: prev.colors.filter(item => item.name !== col.name) }))}
                                                        style={{ background: 'none', border: 'none', padding: 0, color: colors.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
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
