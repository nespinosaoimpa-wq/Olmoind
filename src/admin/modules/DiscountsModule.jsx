import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Tag, Percent, DollarSign, Package } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const colors = {
    primary: '#5c2e91', bg: '#f8fafc', text: '#1e293b',
    textSecondary: '#64748b', border: '#e2e8f0', cardBg: '#ffffff',
    success: '#10b981', warning: '#f59e0b', error: '#ef4444',
};

const card = {
    background: colors.cardBg, border: `1px solid ${colors.border}`,
    borderRadius: '12px', padding: '24px', marginBottom: '20px',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
};

const inputStyle = {
    background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px',
    color: colors.text, outline: 'none', borderRadius: '8px',
    fontSize: '14px', fontFamily: "'Inter', sans-serif",
    width: '100%', boxSizing: 'border-box',
};

const DEFAULT_FORM = {
    name: '', type: 'percentage', value: 10, code: '',
    min_quantity: 1, active: true, applies_to: 'all',
};

const DiscountsModule = () => {
    const [discounts, setDiscounts] = useState([]);
    const [form, setForm] = useState(DEFAULT_FORM);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetchDiscounts(); }, []);

    const fetchDiscounts = async () => {
        try {
            const { data } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
            if (data) setDiscounts(data);
        } catch (e) { console.warn('discounts table not ready yet:', e.message); }
    };

    const handleSave = async () => {
        if (!form.name) return alert('Ponele un nombre al descuento.');
        setSaving(true);
        try {
            const { error } = await supabase.from('discounts').insert([{
                name: form.name, type: form.type, value: Number(form.value),
                code: form.code?.toUpperCase() || null,
                min_quantity: Number(form.min_quantity) || 1,
                active: form.active, applies_to: form.applies_to,
            }]);
            if (error) throw error;
            setMsg('¡Descuento creado!');
            setForm(DEFAULT_FORM);
            setShowForm(false);
            fetchDiscounts();
            setTimeout(() => setMsg(''), 2500);
        } catch (e) {
            alert('Error: ' + e.message);
        } finally { setSaving(false); }
    };

    const toggleActive = async (id, current) => {
        await supabase.from('discounts').update({ active: !current }).eq('id', id);
        fetchDiscounts();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este descuento?')) return;
        await supabase.from('discounts').delete().eq('id', id);
        fetchDiscounts();
    };

    const typeLabels = {
        percentage: { label: '% Porcentaje', icon: <Percent size={14} />, color: '#8b5cf6' },
        fixed: { label: '$ Monto fijo', icon: <DollarSign size={14} />, color: colors.success },
        transfer: { label: '🏦 Desc. Transferencia', icon: <DollarSign size={14} />, color: '#0ea5e9' },
        quantity: { label: '📦 Desc. por Cantidad', icon: <Package size={14} />, color: colors.warning },
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, margin: 0 }}>Descuentos y Promociones</h2>
                    <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '4px 0 0 0' }}>
                        Cupones, descuentos por transferencia y por cantidad
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: colors.primary, color: '#fff', border: 'none',
                    padding: '12px 20px', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif"
                }}>
                    <Plus size={16} /> Nuevo Descuento
                </button>
            </div>

            {msg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} /> {msg}</div>}

            {/* Quick Config Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {Object.entries(typeLabels).map(([type, info]) => (
                    <div key={type} onClick={() => { setForm({ ...DEFAULT_FORM, type }); setShowForm(true); }} style={{
                        ...card, marginBottom: 0, cursor: 'pointer',
                        borderLeft: `4px solid ${info.color}`, transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '22px', marginBottom: '8px' }}>{info.icon}</div>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: colors.text, margin: 0 }}>{info.label}</p>
                        <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '4px 0 0 0' }}>Click para crear</p>
                    </div>
                ))}
            </div>

            {/* New Discount Form */}
            {showForm && (
                <div style={card}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.text, marginBottom: '20px' }}>Crear nuevo descuento</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Promo Transferencia 10%" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Tipo</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                                <option value="percentage">% Porcentaje general</option>
                                <option value="fixed">$ Monto fijo</option>
                                <option value="transfer">🏦 Descuento por transferencia</option>
                                <option value="quantity">📦 Descuento por cantidad</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                                {form.type === 'fixed' ? 'Monto ($)' : 'Porcentaje (%)'}
                            </label>
                            <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} style={inputStyle} min="0" max="100" />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Código de cupón (opcional)</label>
                            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Ej: OLMO10" style={inputStyle} />
                        </div>
                        {form.type === 'quantity' && (
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Cantidad mínima de prendas</label>
                                <input type="number" value={form.min_quantity} onChange={e => setForm({ ...form, min_quantity: e.target.value })} style={inputStyle} min="2" />
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button onClick={handleSave} disabled={saving} style={{
                            background: colors.primary, color: '#fff', border: 'none',
                            padding: '12px 24px', borderRadius: '8px', fontSize: '13px',
                            fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif"
                        }}>
                            {saving ? 'Guardando...' : 'Guardar Descuento'}
                        </button>
                        <button onClick={() => setShowForm(false)} style={{
                            background: '#f1f5f9', color: colors.text, border: 'none',
                            padding: '12px 24px', borderRadius: '8px', fontSize: '13px',
                            fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif"
                        }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Discounts Table */}
            <div style={card}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: colors.text, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                    Descuentos activos ({discounts.length})
                </h3>
                {discounts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: colors.textSecondary }}>
                        <Tag size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                        <p style={{ fontSize: '14px', fontWeight: '600' }}>No hay descuentos configurados.</p>
                        <p style={{ fontSize: '12px', marginTop: '4px' }}>Creá tu primer descuento usando el botón de arriba.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                                {['Nombre', 'Tipo', 'Valor', 'Código', 'Estado', 'Acciones'].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', fontSize: '11px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map(d => {
                                const info = typeLabels[d.type] || typeLabels.percentage;
                                return (
                                    <tr key={d.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                        <td style={{ padding: '14px 12px', fontSize: '13px', fontWeight: '700', color: colors.text }}>{d.name}</td>
                                        <td style={{ padding: '14px 12px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '700', background: `${info.color}20`, color: info.color, padding: '3px 8px', borderRadius: '9999px' }}>
                                                {info.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: '800', color: colors.text }}>
                                            {d.type === 'fixed' ? `$${d.value}` : `${d.value}%`}
                                        </td>
                                        <td style={{ padding: '14px 12px', fontSize: '13px', fontFamily: 'monospace', fontWeight: '700', color: colors.primary }}>
                                            {d.code || <span style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Sin código</span>}
                                        </td>
                                        <td style={{ padding: '14px 12px' }}>
                                            <button onClick={() => toggleActive(d.id, d.active)} style={{
                                                fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px', cursor: 'pointer', border: 'none',
                                                background: d.active ? '#d1fae5' : '#fee2e2',
                                                color: d.active ? '#065f46' : '#991b1b',
                                            }}>
                                                {d.active ? '● Activo' : '○ Inactivo'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '14px 12px' }}>
                                            <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.error }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DiscountsModule;
