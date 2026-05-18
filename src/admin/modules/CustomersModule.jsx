import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const colors = {
    primary: '#5c2e91', bg: '#f8fafc', text: '#1e293b',
    textSecondary: '#64748b', border: '#e2e8f0', cardBg: '#ffffff',
    success: '#10b981',
};
const card = {
    background: colors.cardBg, border: `1px solid ${colors.border}`,
    borderRadius: '12px', padding: '24px', marginBottom: '20px',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
};

const CustomersModule = () => {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            // Customers are extracted from the sales table (name, phone, email stored in each sale)
            const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
            if (!data) return;

            // Deduplicate by phone or email
            const map = new Map();
            data.forEach(sale => {
                const key = sale.customer_phone || sale.customer_email || sale.customer_name || sale.id;
                if (!map.has(key)) {
                    map.set(key, {
                        id: key,
                        name: sale.customer_name || 'Cliente',
                        email: sale.customer_email || '',
                        phone: sale.customer_phone || '',
                        address: sale.customer_address || '',
                        city: sale.customer_city || '',
                        orders: [],
                        total_spent: 0,
                    });
                }
                const c = map.get(key);
                c.orders.push(sale);
                c.total_spent += sale.total || 0;
            });

            setCustomers([...map.values()]);
        } catch (e) { console.warn('customers fetch error:', e.message); }
    };

    const handleSelect = (customer) => {
        setSelected(customer);
        setOrders(customer.orders || []);
    };

    const filtered = customers.filter(c => {
        const q = search.toLowerCase();
        return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q);
    });

    return (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '24px' }}>
            {/* Left: Customer List */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, margin: 0 }}>Clientes</h2>
                        <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '4px 0 0 0' }}>
                            Datos guardados automáticamente al finalizar la compra
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', boxSizing: 'border-box',
                            background: '#fff', border: `1px solid ${colors.border}`,
                            borderRadius: '8px', padding: '10px 14px 10px 38px',
                            fontSize: '14px', fontFamily: "'Inter', sans-serif",
                            color: colors.text, outline: 'none',
                        }}
                    />
                </div>

                <div style={card}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: colors.text, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                        {filtered.length} clientes
                    </h3>

                    {customers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: colors.textSecondary }}>
                            <Users size={40} style={{ marginBottom: '12px', opacity: 0.2 }} />
                            <p style={{ fontSize: '14px', fontWeight: '600' }}>Aún no hay clientes registrados.</p>
                            <p style={{ fontSize: '12px', marginTop: '4px' }}>
                                Los datos de clientes se guardan automáticamente cuando completan una compra.
                            </p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                                    {['Cliente', 'Contacto', 'Pedidos', 'Total gastado', ''].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', fontSize: '11px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.id} style={{ borderBottom: `1px solid ${colors.border}`, background: selected?.id === c.id ? '#f3e8ff' : 'transparent' }}>
                                        <td style={{ padding: '14px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: colors.primary, flexShrink: 0 }}>
                                                    {c.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>{c.name || 'Sin nombre'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 12px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                {c.phone && <span style={{ fontSize: '12px', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={11} /> {c.phone}</span>}
                                                {c.email && <span style={{ fontSize: '12px', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={11} /> {c.email}</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: colors.text }}>
                                            {c.orders.length}
                                        </td>
                                        <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: '800', color: colors.success }}>
                                            ${c.total_spent.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 12px' }}>
                                            <button onClick={() => handleSelect(c)} style={{ background: 'none', border: `1px solid ${colors.border}`, borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: colors.primary, display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Inter', sans-serif" }}>
                                                <Eye size={13} /> Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Right: Customer Detail */}
            {selected && (
                <div>
                    <div style={{ ...card, position: 'sticky', top: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: colors.primary }}>
                                    {selected.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text, margin: 0 }}>{selected.name}</h3>
                                    <span style={{ fontSize: '11px', color: colors.success, fontWeight: '700' }}>Cliente activo</span>
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}>✕</button>
                        </div>

                        {/* Contact Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                            {selected.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.text }}><Phone size={14} color={colors.primary} /> {selected.phone}</div>}
                            {selected.email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.text }}><Mail size={14} color={colors.primary} /> {selected.email}</div>}
                            {selected.address && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.text }}><MapPin size={14} color={colors.primary} /> {selected.address}</div>}
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                                <p style={{ fontSize: '22px', fontWeight: '800', color: colors.primary, margin: 0 }}>{selected.orders.length}</p>
                                <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '4px 0 0 0', fontWeight: '600' }}>PEDIDOS</p>
                            </div>
                            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                                <p style={{ fontSize: '18px', fontWeight: '800', color: colors.success, margin: 0 }}>${selected.total_spent.toLocaleString()}</p>
                                <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '4px 0 0 0', fontWeight: '600' }}>GASTADO</p>
                            </div>
                        </div>

                        {/* Orders */}
                        <h4 style={{ fontSize: '12px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: '12px' }}>Historial de pedidos</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                            {orders.map(o => (
                                <div key={o.id} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: `1px solid ${colors.border}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', color: colors.textSecondary, fontFamily: 'monospace' }}>#{o.id?.slice(0, 8).toUpperCase()}</span>
                                        <span style={{ fontSize: '13px', fontWeight: '800', color: colors.primary }}>${(o.total || 0).toLocaleString()}</span>
                                    </div>
                                    <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '4px 0 0 0' }}>
                                        {new Date(o.created_at).toLocaleDateString('es-AR')} • {(o.items || []).length} item(s)
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersModule;
