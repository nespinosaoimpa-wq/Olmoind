import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, Check, ToggleLeft, ToggleRight } from 'lucide-react';
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

const DEFAULT_METHOD = { name: '', type: 'local', price: 0, free_above: '', estimated_days: '2-5 días hábiles', active: true };

const ShippingModule = () => {
    const [methods, setMethods] = useState([]);
    const [form, setForm] = useState(DEFAULT_METHOD);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetchMethods(); }, []);

    const fetchMethods = async () => {
        try {
            const { data } = await supabase.from('shipping_methods').select('*').order('created_at');
            if (data) setMethods(data);
        } catch (e) { console.warn('shipping_methods not ready:', e.message); }
    };

    const handleSave = async () => {
        if (!form.name) return alert('Ingresá un nombre para el método.');
        setSaving(true);
        try {
            const { error } = await supabase.from('shipping_methods').insert([{
                name: form.name, type: form.type,
                price: Number(form.price) || 0,
                free_above: form.free_above ? Number(form.free_above) : null,
                estimated_days: form.estimated_days,
                active: form.active,
            }]);
            if (error) throw error;
            setMsg('¡Método de envío guardado!');
            setForm(DEFAULT_METHOD);
            setShowForm(false);
            fetchMethods();
            setTimeout(() => setMsg(''), 2500);
        } catch (e) { alert('Error: ' + e.message); }
        finally { setSaving(false); }
    };

    const toggleActive = async (id, current) => {
        await supabase.from('shipping_methods').update({ active: !current }).eq('id', id);
        fetchMethods();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este método?')) return;
        await supabase.from('shipping_methods').delete().eq('id', id);
        fetchMethods();
    };

    const typeIcons = { pickup: '🏬', local: '🛵', national: '📦' };
    const typeLabels = { pickup: 'Retiro en local', local: 'Envío local', national: 'Envío nacional (Correo Arg.)' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, margin: 0 }}>Configuración de Envíos</h2>
                    <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '4px 0 0 0' }}>
                        Retiro en local, envío a domicilio y Correo Argentino
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: colors.primary, color: '#fff', border: 'none',
                    padding: '12px 20px', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif"
                }}>
                    <Plus size={16} /> Nuevo Método
                </button>
            </div>

            {msg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16}/>{msg}</div>}

            {/* Preset shortcuts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { type: 'pickup', title: '🏬 Retiro en local', desc: 'El cliente retira en tu local. Sin costo de envío.', price: 0 },
                    { type: 'local', title: '🛵 Envío a domicilio', desc: 'Entregas dentro de la ciudad. Precio fijo.', price: 800 },
                    { type: 'national', title: '📦 Correo Argentino', desc: 'Envíos a todo el país. Precio según destino.', price: 3500 },
                ].map(p => (
                    <div key={p.type} onClick={() => { setForm({ ...DEFAULT_METHOD, type: p.type, name: p.title.replace(/^.+ /, ''), price: p.price }); setShowForm(true); }} style={{
                        ...card, marginBottom: 0, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <p style={{ fontSize: '15px', fontWeight: '700', color: colors.text, margin: '0 0 6px 0' }}>{p.title}</p>
                        <p style={{ fontSize: '12px', color: colors.textSecondary, margin: 0 }}>{p.desc}</p>
                    </div>
                ))}
            </div>

            {/* Form */}
            {showForm && (
                <div style={card}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.text, marginBottom: '20px' }}>Configurar método de envío</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Correo Argentino" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Tipo</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                                <option value="pickup">🏬 Retiro en local (gratis)</option>
                                <option value="local">🛵 Envío local</option>
                                <option value="national">📦 Nacional (Correo Argentino)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Precio base ($)</label>
                            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} min="0" />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Envío gratis a partir de ($) — opcional</label>
                            <input type="number" value={form.free_above} onChange={e => setForm({ ...form, free_above: e.target.value })} placeholder="Ej: 50000" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Tiempo estimado</label>
                            <input value={form.estimated_days} onChange={e => setForm({ ...form, estimated_days: e.target.value })} placeholder="Ej: 3-7 días hábiles" style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '24px' }}>
                            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} id="active-ship" />
                            <label htmlFor="active-ship" style={{ fontSize: '13px', fontWeight: '600', color: colors.text, cursor: 'pointer' }}>Método activo (visible en el checkout)</label>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button onClick={handleSave} disabled={saving} style={{ background: colors.primary, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                            {saving ? 'Guardando...' : 'Guardar Método'}
                        </button>
                        <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: colors.text, border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Methods list */}
            <div style={card}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: colors.text, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                    Métodos configurados ({methods.length})
                </h3>
                {methods.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: colors.textSecondary }}>
                        <Truck size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                        <p style={{ fontSize: '14px', fontWeight: '600' }}>No hay métodos de envío configurados.</p>
                    </div>
                ) : methods.map(m => (
                    <div key={m.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px', borderRadius: '8px', border: `1px solid ${colors.border}`,
                        background: m.active ? '#fff' : '#f8fafc', marginBottom: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '22px' }}>{typeIcons[m.type] || '📦'}</span>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '700', color: colors.text, margin: 0 }}>{m.name}</p>
                                <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '2px 0 0 0' }}>
                                    {typeLabels[m.type]} • {m.estimated_days}
                                    {m.free_above && ` • Gratis desde $${Number(m.free_above).toLocaleString()}`}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: m.price === 0 ? colors.success : colors.text }}>
                                {m.price === 0 ? 'Gratis' : `$${Number(m.price).toLocaleString()}`}
                            </span>
                            <button onClick={() => toggleActive(m.id, m.active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: m.active ? colors.success : '#cbd5e1' }}>
                                {m.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                            </button>
                            <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.error }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShippingModule;
