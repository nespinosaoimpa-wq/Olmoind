import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, ShoppingBag, Package, DollarSign } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const colors = {
    primary: '#5c2e91', text: '#1e293b', textSecondary: '#64748b',
    border: '#e2e8f0', cardBg: '#ffffff', success: '#10b981',
    warning: '#f59e0b', error: '#ef4444', info: '#3b82f6',
};
const card = {
    background: colors.cardBg, border: `1px solid ${colors.border}`,
    borderRadius: '12px', padding: '24px', marginBottom: '20px',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
};

const StatCard = ({ label, value, desc, color, icon }) => (
    <div style={{ ...card, marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <span style={{ fontSize: '10px', color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
                <h4 style={{ fontSize: '28px', fontWeight: '800', color: color || colors.text, margin: '8px 0 2px 0', letterSpacing: '-0.5px' }}>{value}</h4>
                <span style={{ fontSize: '10px', color: colors.textSecondary }}>{desc}</span>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color || colors.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement(icon, { size: 20, color: color || colors.primary })}
            </div>
        </div>
    </div>
);

// Simple bar chart using divs
const BarChart = ({ data, color }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', padding: '0 4px' }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: colors.textSecondary, fontWeight: '600' }}>${d.value > 0 ? (d.value / 1000).toFixed(0) + 'k' : '0'}</span>
                    <div style={{
                        width: '100%', background: `${color}20`, borderRadius: '6px 6px 0 0',
                        height: `${Math.round((d.value / max) * 120)}px`, minHeight: '4px',
                        position: 'relative', overflow: 'hidden', transition: 'height 0.5s ease',
                    }}>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: color, borderRadius: '6px 6px 0 0', height: '100%', opacity: 0.85 }} />
                    </div>
                    <span style={{ fontSize: '9px', color: colors.textSecondary, fontWeight: '600' }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};

const StatisticsModule = () => {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [range, setRange] = useState('week');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [{ data: salesData }, { data: productsData }] = await Promise.all([
                supabase.from('sales').select('*').order('created_at', { ascending: false }),
                supabase.from('products').select('*'),
            ]);
            if (salesData) setSales(salesData);
            if (productsData) setProducts(productsData);
            setLoading(false);
        };
        fetchData();
    }, []);

    // Build chart data - last 7 days or 4 weeks
    const buildChartData = () => {
        const now = new Date();
        if (range === 'week') {
            return Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(now);
                d.setDate(d.getDate() - (6 - i));
                const dayStr = d.toISOString().split('T')[0];
                const total = sales.filter(s => s.created_at?.startsWith(dayStr)).reduce((a, s) => a + (s.total || 0), 0);
                return { label: d.toLocaleDateString('es-AR', { weekday: 'short' }), value: total };
            });
        } else {
            return Array.from({ length: 4 }).map((_, i) => {
                const weekStart = new Date(now);
                weekStart.setDate(weekStart.getDate() - (3 - i) * 7);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 7);
                const total = sales.filter(s => {
                    const d = new Date(s.created_at);
                    return d >= weekStart && d < weekEnd;
                }).reduce((a, s) => a + (s.total || 0), 0);
                return { label: `Sem ${i + 1}`, value: total };
            });
        }
    };

    // KPIs
    const totalRevenue = sales.reduce((a, s) => a + (s.total || 0), 0);
    const totalOrders = sales.length;
    const avgTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const totalUnits = sales.reduce((a, s) => a + (s.items || []).reduce((b, i) => b + (i.quantity || 0), 0), 0);

    // Top products
    const productSales = {};
    sales.forEach(s => {
        (s.items || []).forEach(item => {
            if (!productSales[item.name]) productSales[item.name] = { name: item.name, units: 0, revenue: 0 };
            productSales[item.name].units += item.quantity || 0;
            productSales[item.name].revenue += (item.price || 0) * (item.quantity || 0);
        });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.units - a.units).slice(0, 5);

    // Low stock
    const lowStock = products.filter(p => {
        const total = Object.values(p.variants || {}).reduce((a, b) => a + b, 0);
        return total < 10;
    });

    const chartData = buildChartData();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, margin: 0 }}>Estadísticas</h2>
                    <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '4px 0 0 0' }}>
                        Visión general del rendimiento de tu tienda
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[{ id: 'week', label: 'Esta semana' }, { id: 'month', label: 'Este mes' }].map(r => (
                        <button key={r.id} onClick={() => setRange(r.id)} style={{
                            padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif", border: 'none',
                            background: range === r.id ? colors.primary : '#f1f5f9',
                            color: range === r.id ? '#fff' : colors.textSecondary,
                        }}>
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <StatCard label="Facturación Total" value={`$${totalRevenue.toLocaleString()}`} desc="Acumulado histórico" color={colors.success} icon={<DollarSign />} />
                <StatCard label="Pedidos Totales" value={totalOrders} desc="Órdenes registradas" color={colors.info} icon={<ShoppingBag />} />
                <StatCard label="Ticket Promedio" value={`$${avgTicket.toLocaleString()}`} desc="Por pedido" color={colors.primary} icon={<TrendingUp />} />
                <StatCard label="Unidades Vendidas" value={totalUnits} desc="Prendas entregadas" color={colors.warning} icon={<Package />} />
            </div>

            {/* Sales Chart + Top Products */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, margin: 0 }}>Ventas por período</h3>
                    </div>
                    {loading ? (
                        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary }}>Cargando datos...</div>
                    ) : (
                        <BarChart data={chartData} color={colors.primary} />
                    )}
                </div>

                <div style={card}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: colors.text, marginBottom: '16px' }}>Productos más vendidos</h3>
                    {topProducts.length === 0 ? (
                        <p style={{ fontSize: '13px', color: colors.textSecondary, textAlign: 'center', padding: '24px' }}>Sin datos de ventas aún.</p>
                    ) : topProducts.map((p, i) => (
                        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < topProducts.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                            <span style={{ fontSize: '16px', fontWeight: '900', color: colors.primary, minWidth: '20px' }}>#{i + 1}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '12px', fontWeight: '700', color: colors.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                                <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '2px 0 0 0' }}>{p.units} unidades</p>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: colors.success }}>${p.revenue.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
                <div style={{ ...card, borderLeft: `4px solid ${colors.warning}`, background: '#fffbeb' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#92400e', marginBottom: '12px' }}>
                        ⚠️ Stock bajo — {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con poco stock
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {lowStock.map(p => {
                            const total = Object.values(p.variants || {}).reduce((a, b) => a + b, 0);
                            return (
                                <span key={p.id} style={{ fontSize: '12px', fontWeight: '700', background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '9999px', border: '1px solid #fde68a' }}>
                                    {p.name} ({total} u.)
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatisticsModule;
