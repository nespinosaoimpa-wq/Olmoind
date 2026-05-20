import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign, Smartphone, Check, X, FileText } from 'lucide-react';
import { useStockStore } from '../../store/useStockStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { supabase } from '../../supabaseClient';

const colors = {
    primary: '#5c2e91', bg: '#f8fafc', text: '#1e293b',
    textSecondary: '#64748b', border: '#e2e8f0', cardBg: '#ffffff',
    success: '#10b981', warning: '#f59e0b', error: '#ef4444',
};

const PAYMENT_METHODS = [
    { id: 'cash', label: 'Efectivo', icon: <DollarSign size={18} />, color: colors.success },
    { id: 'transfer', label: 'Transferencia', icon: <CreditCard size={18} />, color: '#0ea5e9' },
    { id: 'card', label: 'Tarjeta', icon: <CreditCard size={18} />, color: '#8b5cf6' },
    { id: 'mp', label: 'Mercado Pago', icon: <Smartphone size={18} />, color: '#00b1ea' },
];

const PosModule = () => {
    const { stock, registerSale } = useStockStore();
    const { settings, fetchSettings } = useSettingsStore();
    const [query, setQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [saleComplete, setSaleComplete] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [amountTendered, setAmountTendered] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    
    // House credit states
    const [creditEntrega, setCreditEntrega] = useState('0');
    const [creditInteres, setCreditInteres] = useState('0');
    const [creditFrecuencia, setCreditFrecuencia] = useState('Libre');
    const [creditProximoPago, setCreditProximoPago] = useState('');

    const [lastSale, setLastSale] = useState(null);

    const generateTicketNumber = () => {
        const now = new Date();
        const y = now.getFullYear();
        const mo = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const h = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        return `OLMO-${y}${mo}${d}-${h}${mi}${s}`;
    };

    const printTicket = (sale) => {
        if (!sale || !sale.items || sale.items.length === 0) return;
        const now = new Date();
        const dateStr = now.toLocaleString('es-AR');
        const ticketNum = sale.ticketNumber || generateTicketNumber();

        const itemsHtml = sale.items.map(item => `
            <tr>
                <td style="padding: 6px 0; vertical-align: top; font-weight: bold; width: 30px; font-family: 'Courier New', monospace; font-size: 11px;">${item.quantity}</td>
                <td style="padding: 6px 0; vertical-align: top; font-family: 'Courier New', monospace; font-size: 11px;">
                    ${item.name}
                    ${(item.size || item.color) ? `<div style="font-size: 9px; color: #555; font-family: sans-serif; margin-top: 2px;">&nbsp;&nbsp;&nbsp;- Talle ${item.size || 'N/A'}${item.color ? ` / ${item.color}` : ''}</div>` : ''}
                </td>
                <td style="padding: 6px 0; text-align: right; vertical-align: top; font-weight: bold; white-space: nowrap; font-family: 'Courier New', monospace; font-size: 11px;">
                    $${(item.price * item.quantity).toLocaleString('es-AR')}
                </td>
            </tr>
        `).join('');

        let paymentDetailHtml = '';
        if (sale.paymentMethod === 'Efectivo' && sale.amountTendered) {
            const vuelto = parseFloat(sale.amountTendered) - sale.total;
            paymentDetailHtml = `
                <div class="pay-row"><span>PAGÓ CON:</span><span>$${parseFloat(sale.amountTendered).toLocaleString('es-AR')}</span></div>
                <div class="pay-row" style="font-size:12px;font-weight:900;"><span>VUELTO:</span><span>$${vuelto >= 0 ? vuelto.toLocaleString('es-AR') : '0'}</span></div>
            `;
        } else if (sale.paymentMethod === 'Crédito de la casa' && sale.creditPlan) {
            const plan = sale.creditPlan;
            paymentDetailHtml = `
                <div style="margin-top: 10px; padding: 10px; border: 1px dashed #000; border-radius: 6px; background: #fafafa; font-size: 10px; line-height: 1.6;">
                    <div style="font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 6px; border-bottom: 1px solid #000; padding-bottom: 4px; letter-spacing: 0.5px;">Planificación de Crédito</div>
                    <div class="pay-row"><span>ENTREGA INICIAL:</span><span>$${parseFloat(plan.entrega || 0).toLocaleString('es-AR')}</span></div>
                    <div class="pay-row"><span>% INTERÉS:</span><span>${plan.interes || 0}%</span></div>
                    <div class="pay-row"><span>FRECUENCIA:</span><span>${plan.frecuencia}</span></div>
                    ${plan.proximoPago ? `<div class="pay-row"><span>PRÓXIMO PAGO:</span><span>${new Date(plan.proximoPago + 'T00:00:00').toLocaleDateString('es-AR')}</span></div>` : ''}
                    <div class="pay-row" style="font-weight: bold; font-size: 11px; margin-top: 4px; border-top: 1px dashed #000; padding-top: 4px; color: #000;">
                        <span>SALDO A DEBER:</span>
                        <span>$${parseFloat(plan.saldo || 0).toLocaleString('es-AR')}</span>
                    </div>
                </div>
            `;
        }

        const win = window.open('', '_blank', 'width=380,height=600,scrollbars=no,menubar=no,toolbar=no');
        if (!win) {
            alert('El bloqueador de ventanas emergentes impidió abrir el ticket. Por favor, permití las ventanas emergentes en tu navegador.');
            return;
        }

        win.document.write(`
            <html>
            <head>
                <title>Ticket ${ticketNum}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        font-size: 11px;
                        color: #000;
                        padding: 12px;
                        width: 280px;
                        line-height: 1.4;
                    }
                    .thick-sep {
                        border: none;
                        border-top: 1px solid #000;
                        margin: 10px 0;
                    }
                    .thin-sep {
                        border: none;
                        border-top: 1px dashed #000;
                        margin: 8px 0;
                    }
                    .header {
                        text-align: center;
                        padding: 8px 0 4px;
                    }
                    .logo-text {
                        font-size: 26px;
                        font-weight: 900;
                        letter-spacing: 6px;
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        margin-bottom: 2px;
                    }
                    .logo-sub {
                        font-size: 9px;
                        font-weight: 600;
                        letter-spacing: 4px;
                        text-transform: uppercase;
                        color: #333;
                    }
                    .store-info {
                        text-align: center;
                        font-size: 10px;
                        color: #333;
                        line-height: 1.5;
                        margin: 6px 0;
                    }
                    .meta-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 10px;
                        margin-top: 4px;
                    }
                    .meta-row span:first-child { color: #555; font-weight: 700; }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 6px 0;
                    }
                    .items-table th {
                        font-size: 9px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: #000;
                        border-bottom: 1px solid #000;
                        padding: 6px 0;
                    }
                    .items-table td {
                        vertical-align: top;
                    }
                    .total-box {
                        display: flex;
                        justify-content: space-between;
                        font-size: 14px;
                        font-weight: 900;
                        margin: 12px 0;
                        border-top: 1px dashed #000;
                        border-bottom: 1px dashed #000;
                        padding: 8px 0;
                    }
                    .pay-section {
                        font-size: 11px;
                        margin: 8px 0;
                    }
                    .pay-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 3px 0;
                    }
                    .pay-row span:first-child { font-weight: 700; color: #000; }
                    .non-fiscal-box {
                        border: 1px solid #000;
                        padding: 6px;
                        margin: 12px 0;
                        text-align: center;
                    }
                    .non-fiscal-box .nf-title {
                        font-size: 9px;
                        font-weight: 900;
                        letter-spacing: 1px;
                        line-height: 1.4;
                    }
                    .non-fiscal-box .nf-sub {
                        font-size: 8px;
                        color: #333;
                        margin-top: 2px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 16px;
                        padding-top: 8px;
                    }
                    .footer .thanks {
                        font-size: 11px;
                        font-weight: 700;
                        margin-bottom: 4px;
                    }
                    .footer .social {
                        font-size: 9px;
                        color: #444;
                        letter-spacing: 0.5px;
                    }
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    @media print {
                        html, body {
                            width: 80mm !important;
                            max-width: 80mm !important;
                            padding: 2mm !important;
                            margin: 0 !important;
                            font-size: 10px !important;
                        }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <hr class="thick-sep" />
                <div class="header">
                    <div class="logo-text">OLMO</div>
                    <div class="logo-sub">indumentaria</div>
                </div>
                <hr class="thick-sep" />

                <div class="store-info">
                    Cervantes 35, Local A<br/>
                    Paraná, Entre Ríos<br/>
                    Tel: 343-4559599<br/>
                    <strong>@olmo.ind</strong>
                </div>
                <hr class="thin-sep" />

                <div style="font-size: 10px; line-height: 1.5; margin: 10px 0; font-family: 'Courier New', monospace;">
                    <strong>Ticket Interno Nº:</strong> ${ticketNum}<br/>
                    <span style="font-size: 8px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">Documento no válido como factura</span><br/>
                    <strong>Fecha:</strong> ${dateStr}<br/>
                    ${sale.paymentNotes ? `<strong>Cliente:</strong> ${sale.paymentNotes}<br/>` : ''}
                    <strong>Sucursal:</strong> ${sale.branch || 'Central'}<br/>
                </div>

                <hr class="thin-sep" />
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="text-align:left; width: 30px;">CANT</th>
                            <th style="text-align:left;">DESCRIPCIÓN</th>
                            <th style="text-align:right;">IMPORTE</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <hr class="thin-sep" />

                <div class="total-box">
                    <span>TOTAL:</span>
                    <span>$${sale.total.toLocaleString('es-AR')}</span>
                </div>

                <div class="pay-section">
                    <div class="pay-row"><span>MÉTODO DE PAGO:</span><span>${sale.paymentMethod.toUpperCase()}</span></div>
                    ${paymentDetailHtml}
                </div>

                <div class="non-fiscal-box">
                    <div class="nf-title">DOCUMENTO NO VÁLIDO COMO FACTURA</div>
                    <div class="nf-sub">Ticket de control interno</div>
                </div>

                <div class="footer">
                    <div class="thanks">¡Gracias por confiar en nosotros!</div>
                    <div style="font-size: 8px; margin-top: 4px; color: #555;">Los cambios se aceptan dentro de los 15 días con este comprobante.</div>
                    <div class="social" style="margin-top:8px;">olmoind.vercel.app · @olmo.ind</div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 1200);
                    }
                </script>
            </body>
            </html>
        `);
        win.document.close();
    };

    const handleReprint = () => {
        if (lastSale) {
            printTicket(lastSale);
        }
    };

    const handleResetPos = () => {
        setSaleComplete(false);
        setShowCheckout(false);
        setCart([]);
        setQuery('');
        setAmountTendered('');
        setPaymentNotes('');
        setCreditEntrega('0');
        setCreditInteres('0');
        setCreditFrecuencia('Libre');
        setCreditProximoPago('');
        setLastSale(null);
        if (searchRef.current) searchRef.current.focus();
    };
    
    // Caja & Sales History States
    const [showCaja, setShowCaja] = useState(false);
    const [dailySales, setDailySales] = useState([]);
    const [cajaLoading, setCajaLoading] = useState(false);
    
    // Filters and Date ranges
    const [historyStartDate, setHistoryStartDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [historyEndDate, setHistoryEndDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [historyMethod, setHistoryMethod] = useState('Todos');
    const [historyBranchFilter, setHistoryBranchFilter] = useState('Todos');
    const [selectedSaleDetail, setSelectedSaleDetail] = useState(null);
    const [cajaPage, setCajaPage] = useState(1);

    // Reset page to 1 when any filter is changed
    useEffect(() => {
        setCajaPage(1);
    }, [historyStartDate, historyEndDate, historyBranchFilter, historyMethod]);

    // Color picker pending state
    const [colorSelectionPending, setColorSelectionPending] = useState(null);
    
    // Multi-branch
    const branches = settings?.contact?.addresses?.map(a => a.name).filter(Boolean) || [];
    const [selectedBranch, setSelectedBranch] = useState('');

    const searchRef = useRef(null);

    // Focus search on mount & load settings
    useEffect(() => {
        fetchSettings();
        if (searchRef.current) searchRef.current.focus();
    }, []);

    // Set default branch when loaded
    useEffect(() => {
        if (branches.length > 0 && !selectedBranch) {
            setSelectedBranch(branches[0]);
        }
    }, [branches]);

    const filteredProducts = query.trim().length === 0 ? stock : stock.filter(p => {
        const q = query.toLowerCase();
        return (
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.id?.toLowerCase().startsWith(q)
        );
    });

    const addToCart = (product, size, selectedColor = null) => {
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            setColorSelectionPending({ product, size });
            return;
        }

        const colorName = selectedColor ? selectedColor.name : '';
        const key = `${product.id}-${size}-${colorName}`;
        
        // Use colorKey stock if color exists, otherwise fallback to size stock
        const colorKey = colorName ? `${size}-${colorName}` : size;
        const stock_for_size = (product.variants || {})[colorKey] ?? (product.variants || {})[size] ?? 0;

        setCart(prev => {
            const existing = prev.find(i => i.key === key);
            if (existing) {
                if (existing.quantity >= stock_for_size) return prev;
                return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { 
                key, 
                id: product.id, 
                name: product.name, 
                price: product.price, 
                size, 
                color: colorName, 
                quantity: 1, 
                maxStock: stock_for_size, 
                image: product.images?.[0] || product.image 
            }];
        });
        setQuery('');
        if (searchRef.current) searchRef.current.focus();
    };

    const updateQty = (key, delta) => {
        setCart(prev => prev.map(i => i.key === key ? { ...i, quantity: Math.max(1, Math.min(i.quantity + delta, i.maxStock)) } : i));
    };

    const removeItem = (key) => setCart(prev => prev.filter(i => i.key !== key));

    const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

    // Reactive calculations for house credit
    const entrega = parseFloat(creditEntrega) || 0;
    const pctInteres = parseFloat(creditInteres) || 0;
    const saldoBase = Math.max(0, total - entrega);
    const saldoDeber = saldoBase + (saldoBase * (pctInteres / 100));

    const handleSale = async () => {
        if (cart.length === 0) return;
        setProcessing(true);
        try {
            let finalNotes = paymentNotes;
            if (paymentMethod === 'Efectivo' && amountTendered) {
                const vuelto = parseFloat(amountTendered) - total;
                finalNotes = `Pagó con: $${amountTendered} | Vuelto: $${vuelto >= 0 ? vuelto : 0}`;
            }

            const isHouseCredit = paymentMethod === 'Crédito de la casa';
            const creditPlanData = isHouseCredit ? {
                entrega,
                interes: pctInteres,
                frecuencia: creditFrecuencia,
                proximoPago: creditProximoPago,
                saldo: saldoDeber
            } : null;

            if (isHouseCredit) {
                finalNotes = `Crédito de la casa - Cliente: ${paymentNotes} | Entrega: $${entrega} | Interés: ${pctInteres}% | Frecuencia: ${creditFrecuencia} | Próximo pago: ${creditProximoPago || 'N/A'} | Saldo: $${saldoDeber}`;
            }

            await registerSale(cart, {
                method: paymentMethod,
                notes: finalNotes,
                branch: selectedBranch || 'Central',
                source: 'Punto de Venta',
                status: 'Completada',
                creditPlan: creditPlanData
            });

            const ticketNum = generateTicketNumber();
            const saleData = {
                items: [...cart],
                total,
                branch: selectedBranch || 'Central',
                paymentMethod,
                amountTendered,
                paymentNotes,
                finalNotes,
                ticketNumber: ticketNum,
                creditPlan: creditPlanData
            };

            setLastSale(saleData);
            setSaleComplete(true);

            // Auto-trigger printing the non-fiscal ticket
            printTicket(saleData);
            
            // Refresh caja list
            fetchDailyCaja();
        } catch (e) {
            alert('Error al registrar la venta: ' + e.message);
        } finally {
            setProcessing(false);
        }
    };

    const fetchDailyCaja = async () => {
        setCajaLoading(true);
        try {
            // Parse YYYY-MM-DD manually to create timezone-safe local date bounds
            const [startY, startM, startD] = historyStartDate.split('-').map(Number);
            const start = new Date(startY, startM - 1, startD, 0, 0, 0, 0);

            const [endY, endM, endD] = historyEndDate.split('-').map(Number);
            const end = new Date(endY, endM - 1, endD, 23, 59, 59, 999);

            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDailySales(data || []);
        } catch (e) {
            console.error('Error fetching sales history:', e);
            alert('Error al cargar el historial de ventas: ' + e.message);
        } finally {
            setCajaLoading(false);
        }
    };

    const openCaja = () => {
        fetchDailyCaja();
        setShowCaja(true);
    };

    // ── Cierre de Caja Receipt Print ─────────────────────────
    const printCierreCaja = () => {
        const now = new Date();
        const dateStr = now.toLocaleString('es-AR');
        const startLabel = new Date(historyStartDate + 'T00:00:00').toLocaleDateString('es-AR');
        const endLabel = new Date(historyEndDate + 'T00:00:00').toLocaleDateString('es-AR');
        const isSameDay = historyStartDate === historyEndDate;
        const dateRange = isSameDay ? startLabel : `${startLabel} al ${endLabel}`;

        const methodRows = Object.entries(cajaSummary)
            .filter(([k]) => k !== 'total')
            .map(([method, amount]) => `
                <tr>
                    <td style="padding:4px 0; font-weight:600;">${method}</td>
                    <td style="padding:4px 0; text-align:right; font-weight:700;">$${amount.toLocaleString('es-AR')}</td>
                </tr>
            `).join('');

        // Top products calculation
        const productCounts = {};
        branchSales.forEach(sale => {
            (sale.items || []).forEach(item => {
                const key = item.name || 'Sin nombre';
                if (!productCounts[key]) productCounts[key] = { qty: 0, revenue: 0 };
                productCounts[key].qty += item.quantity || 1;
                productCounts[key].revenue += (item.price || 0) * (item.quantity || 1);
            });
        });
        const topProducts = Object.entries(productCounts)
            .sort((a, b) => b[1].qty - a[1].qty)
            .slice(0, 5)
            .map(([name, data]) => `
                <tr>
                    <td style="padding:3px 0; font-size:10px; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</td>
                    <td style="padding:3px 0; text-align:center; font-size:10px; font-weight:700;">${data.qty}</td>
                    <td style="padding:3px 0; text-align:right; font-size:10px;">$${data.revenue.toLocaleString('es-AR')}</td>
                </tr>
            `).join('');

        const win = window.open('', '_blank', 'width=380,height=600,scrollbars=no,menubar=no,toolbar=no');
        if (!win) { alert('Permití las ventanas emergentes para imprimir.'); return; }

        win.document.write(`
            <html>
            <head>
                <title>Cierre de Caja - ${dateRange}</title>
                <style>
                    @page { size: 80mm auto; margin: 0; }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #000; padding: 10px; width: 280px; line-height: 1.4; }
                    .sep { border: none; border-top: 1px dashed #000; margin: 8px 0; }
                    .sep-bold { border: none; border-top: 2px solid #000; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    @media print { html, body { width: 80mm !important; max-width: 80mm !important; padding: 2mm !important; margin: 0 !important; } }
                </style>
            </head>
            <body>
                <hr class="sep-bold" />
                <div style="text-align:center; padding:6px 0;">
                    <div style="font-size:22px; font-weight:900; letter-spacing:5px;">OLMO</div>
                    <div style="font-size:8px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#333;">indumentaria</div>
                </div>
                <hr class="sep-bold" />

                <div style="text-align:center; font-size:13px; font-weight:900; letter-spacing:1px; padding:8px 0; text-transform:uppercase;">CIERRE DE CAJA</div>

                <div style="font-size:10px; line-height:1.6; margin:6px 0;">
                    <strong>Período:</strong> ${dateRange}<br/>
                    <strong>Generado:</strong> ${dateStr}<br/>
                    ${historyBranchFilter !== 'Todos' ? `<strong>Sucursal:</strong> ${historyBranchFilter}<br/>` : ''}
                    ${historyMethod !== 'Todos' ? `<strong>Filtro pago:</strong> ${historyMethod}<br/>` : ''}
                </div>

                <hr class="sep" />
                <div style="font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">DESGLOSE POR MÉTODO DE PAGO</div>
                <table>
                    ${methodRows}
                    <tr style="border-top: 1px solid #000;">
                        <td style="padding:6px 0; font-weight:900; font-size:13px;">TOTAL</td>
                        <td style="padding:6px 0; text-align:right; font-weight:900; font-size:13px;">$${cajaSummary.total.toLocaleString('es-AR')}</td>
                    </tr>
                </table>

                <hr class="sep" />
                <div style="font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">RESUMEN</div>
                <table>
                    <tr><td style="padding:3px 0;">Cantidad de ventas:</td><td style="text-align:right; font-weight:700;">${branchSales.length}</td></tr>
                    <tr><td style="padding:3px 0;">Ticket promedio:</td><td style="text-align:right; font-weight:700;">$${branchSales.length > 0 ? Math.round(cajaSummary.total / branchSales.length).toLocaleString('es-AR') : '0'}</td></tr>
                    <tr><td style="padding:3px 0;">Prendas vendidas:</td><td style="text-align:right; font-weight:700;">${branchSales.reduce((acc, s) => acc + (s.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0), 0)}</td></tr>
                </table>

                ${topProducts ? `
                    <hr class="sep" />
                    <div style="font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">TOP 5 PRODUCTOS</div>
                    <table>
                        <tr style="border-bottom:1px solid #000;">
                            <th style="text-align:left; font-size:8px; padding:3px 0;">PRODUCTO</th>
                            <th style="text-align:center; font-size:8px; padding:3px 0;">CANT</th>
                            <th style="text-align:right; font-size:8px; padding:3px 0;">TOTAL</th>
                        </tr>
                        ${topProducts}
                    </table>
                ` : ''}

                <hr class="sep-bold" />
                <div style="text-align:center; padding:8px 0;">
                    <div style="font-size:8px; font-weight:700; letter-spacing:0.5px;">DOCUMENTO INTERNO - CIERRE DE CAJA</div>
                    <div style="font-size:8px; color:#555; margin-top:4px;">olmoind.vercel.app · @olmo.ind</div>
                </div>

                <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 1200); }</script>
            </body>
            </html>
        `);
        win.document.close();
    };

    // ── Export to CSV ────────────────────────────────────────
    const exportToCSV = () => {
        if (branchSales.length === 0) { alert('No hay ventas para exportar.'); return; }
        const headers = ['Fecha', 'Hora', 'Ticket', 'Sucursal', 'Método', 'Items', 'Total'];
        const rows = branchSales.map(sale => {
            const meta = sale.customer_info || {};
            const d = new Date(sale.created_at);
            return [
                d.toLocaleDateString('es-AR'),
                d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                meta.ticket_number || '-',
                meta.branch || 'Central',
                sale.payment_method || meta.method || 'Efectivo',
                (sale.items || []).map(i => `${i.name} x${i.quantity}`).join(' | '),
                sale.total || 0
            ];
        });
        const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ventas_olmo_${historyStartDate}_${historyEndDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const reprintSale = (sale) => {
        const meta = sale.customer_info || {};
        const saleData = {
            items: sale.items || [],
            total: sale.total,
            branch: meta.branch || (sale.notes?.includes('[Sucursal: ') ? sale.notes.split('[Sucursal: ')[1].split(']')[0] : 'Central'),
            paymentMethod: sale.payment_method || meta.method || 'cash',
            amountTendered: meta.amountTendered || '',
            paymentNotes: meta.paymentNotes || sale.notes || '',
            ticketNumber: meta.ticket_number || `OLMO-${new Date(sale.created_at).getTime()}`,
            creditPlan: meta.creditPlan || null
        };
        printTicket(saleData);
    };

    // Filter by branch, source and payment method
    const branchSales = dailySales.filter(sale => {
        const meta = sale.customer_info || {};
        const saleBranch = meta.branch || (sale.notes?.includes('[Sucursal: ') ? sale.notes.split('[Sucursal: ')[1].split(']')[0] : 'Central');
        const saleMethod = sale.payment_method || meta.method || 'cash';
        
        let methodLabel = 'Efectivo';
        const normMethod = String(saleMethod).toLowerCase();
        if (normMethod === 'transfer' || normMethod === 'transferencia') methodLabel = 'Transferencia';
        else if (normMethod === 'mp' || normMethod === 'mercado pago') methodLabel = 'Mercado Pago';
        else if (normMethod === 'card' || normMethod === 'tarjeta' || normMethod === 'débito' || normMethod === 'crédito') methodLabel = 'Tarjeta';
        else if (normMethod === 'mixto') methodLabel = 'Mixto';
        else if (normMethod === 'crédito de la casa') methodLabel = 'Crédito de la casa';

        // Branch filter
        if (historyBranchFilter !== 'Todos' && saleBranch !== historyBranchFilter) return false;

        // Payment method filter
        if (historyMethod !== 'Todos' && methodLabel !== historyMethod) return false;

        return true;
    });

    // Calculate Caja Totals
    const cajaSummary = branchSales.reduce((acc, sale) => {
        const meta = sale.customer_info || {};
        const saleMethod = sale.payment_method || meta.method || 'cash';
        
        let methodLabel = 'Efectivo';
        const normMethod = String(saleMethod).toLowerCase();
        if (normMethod === 'transfer' || normMethod === 'transferencia') methodLabel = 'Transferencia';
        else if (normMethod === 'mp' || normMethod === 'mercado pago') methodLabel = 'Mercado Pago';
        else if (normMethod === 'card' || normMethod === 'tarjeta' || normMethod === 'débito' || normMethod === 'crédito') methodLabel = 'Tarjeta';
        else if (normMethod === 'mixto') methodLabel = 'Mixto';
        else if (normMethod === 'crédito de la casa') methodLabel = 'Crédito de la casa';

        if (!acc[methodLabel]) acc[methodLabel] = 0;
        acc[methodLabel] += sale.total || 0;
        acc.total += sale.total || 0;
        return acc;
    }, { total: 0 });

    const itemsPerPage = 8;
    const totalPages = Math.ceil(branchSales.length / itemsPerPage);
    const paginatedSales = branchSales.slice((cajaPage - 1) * itemsPerPage, cajaPage * itemsPerPage);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', height: 'calc(100vh - 160px)' }}>
            {/* Left Panel: Product Search */}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.text, margin: '0 0 4px 0' }}>Punto de Venta</h2>
                            {branches.length > 0 && (
                                <select 
                                    value={selectedBranch} 
                                    onChange={e => setSelectedBranch(e.target.value)}
                                    style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '12px', fontWeight: '700', outline: 'none' }}
                                >
                                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            )}
                        </div>
                        <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0 }}>
                            Buscá por nombre, categoría, o escaneá el código de barras
                        </p>
                    </div>
                    <button onClick={openCaja} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px', background: '#fff', border: `1px solid ${colors.border}`,
                        borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: colors.text,
                        cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <FileText size={16} color={colors.primary} />
                        Ver Caja / Historial
                    </button>
                </div>

                {/* Barcode / Search Input */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="🔍 Escribí, escaneá código de barras o nombre del producto..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        style={{
                            width: '100%', boxSizing: 'border-box',
                            background: '#fff', border: `2px solid ${colors.primary}`,
                            borderRadius: '10px', padding: '14px 16px 14px 44px',
                            fontSize: '15px', fontFamily: "'Inter', sans-serif",
                            color: colors.text, outline: 'none',
                        }}
                        autoComplete="off"
                    />
                </div>

                {/* Product Grid */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', alignContent: 'start' }}>
                    {filteredProducts.map(product => {
                        const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
                        const totalStock = Object.entries(product.variants || {})
                            .filter(([key]) => SIZES.includes(key))
                            .reduce((acc, [, qty]) => acc + qty, 0);
                        const sizes = Object.entries(product.variants || {})
                            .filter(([key, qty]) => SIZES.includes(key) && qty > 0);
                        return (
                            <div key={product.id} style={{
                                background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '10px',
                                overflow: 'hidden', transition: 'all 0.2s',
                                opacity: totalStock === 0 ? 0.5 : 1,
                            }}>
                                <div style={{ height: '120px', background: '#f8fafc', overflow: 'hidden', position: 'relative' }}>
                                    {product.images?.[0] || product.image ? (
                                        <img src={product.images?.[0] || product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '32px' }}>👕</div>
                                    )}
                                    {totalStock === 0 && (
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>AGOTADO</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '10px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: '700', color: colors.text, margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                                    <p style={{ fontSize: '14px', fontWeight: '800', color: colors.primary, margin: '0 0 8px 0' }}>${product.price?.toLocaleString()}</p>
                                    {/* Size buttons */}
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {sizes.map(([size, qty]) => (
                                            <button key={size} onClick={() => addToCart(product, size)} style={{
                                                fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px',
                                                border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer',
                                                color: colors.text, fontFamily: "'Inter', sans-serif",
                                                transition: 'all 0.15s'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = `1px solid ${colors.primary}`; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = colors.text; e.currentTarget.style.border = `1px solid ${colors.border}`; }}
                                                title={`Stock: ${qty}`}
                                            >
                                                <span translate="no">{size}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredProducts.length === 0 && query && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: colors.textSecondary }}>
                            <p style={{ fontSize: '14px', fontWeight: '600' }}>No se encontraron productos para "{query}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Cart */}
            <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {/* Cart Header */}
                <div style={{ padding: '20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingCart size={20} color={colors.primary} />
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.text, margin: 0 }}>Carrito ({cart.length})</h3>
                </div>

                {/* Cart Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: colors.textSecondary }}>
                            <ShoppingCart size={40} style={{ marginBottom: '12px', opacity: 0.2 }} />
                            <p style={{ fontSize: '13px', fontWeight: '600' }}>El carrito está vacío</p>
                            <p style={{ fontSize: '12px', marginTop: '4px' }}>Buscá y seleccioná un talle para agregar</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
                            {item.image && <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '12px', fontWeight: '700', color: colors.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                                <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '2px 0 0 0' }}>
                                    <span translate="no">Talle {item.size}</span>{item.color ? ` • Color: ${item.color}` : ''} • ${item.price?.toLocaleString()}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                <button onClick={() => updateQty(item.key, -1)} style={{ width: '24px', height: '24px', border: `1px solid ${colors.border}`, borderRadius: '4px', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Minus size={12} />
                                </button>
                                <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                <button onClick={() => updateQty(item.key, 1)} style={{ width: '24px', height: '24px', border: `1px solid ${colors.border}`, borderRadius: '4px', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Plus size={12} />
                                </button>
                                <button onClick={() => removeItem(item.key)} style={{ width: '24px', height: '24px', border: 'none', borderRadius: '4px', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.error, marginLeft: '4px' }}>
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment and Total */}
                <div style={{ padding: '16px', borderTop: `1px solid ${colors.border}` }}>
                    {/* Payment Method */}
                    <p style={{ fontSize: '11px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: '10px' }}>Medio de Pago</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                        {PAYMENT_METHODS.map(pm => (
                            <button key={pm.id} onClick={() => setPaymentMethod(pm.id)} style={{
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 12px',
                                borderRadius: '8px', border: paymentMethod === pm.id ? `2px solid ${pm.color}` : `1px solid ${colors.border}`,
                                background: paymentMethod === pm.id ? `${pm.color}10` : '#fff',
                                cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                                color: paymentMethod === pm.id ? pm.color : colors.textSecondary,
                                fontFamily: "'Inter', sans-serif", transition: 'all 0.15s'
                            }}>
                                {pm.icon} {pm.label}
                            </button>
                        ))}
                    </div>

                    {/* Total */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: colors.text }}>TOTAL</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: colors.primary }}>${total.toLocaleString()}</span>
                    </div>

                    {/* Confirm Button */}
                    <button onClick={() => setShowCheckout(true)} disabled={cart.length === 0 || processing} style={{
                        width: '100%', padding: '16px', background: cart.length === 0 ? '#e2e8f0' : colors.primary,
                        color: cart.length === 0 ? '#94a3b8' : '#fff', border: 'none', borderRadius: '10px',
                        fontSize: '15px', fontWeight: '800', cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                        fontFamily: "'Inter', sans-serif", transition: 'all 0.2s'
                    }}>
                        Cobrar ${total.toLocaleString()}
                    </button>
                </div>
            </div>

            {/* Checkout Modal Overlay */}
            {showCheckout && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '16px', padding: '32px',
                        width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative'
                    }}>
                        {saleComplete ? (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <Check size={32} />
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', color: colors.text, margin: '0 0 8px 0' }}>¡Venta Registrada!</h3>
                                <p style={{ color: colors.textSecondary, marginBottom: '24px' }}>El historial de ventas y la caja se han actualizado.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button onClick={handleReprint} style={{
                                        width: '100%', padding: '14px', background: '#f1f5f9', color: '#334155',
                                        border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px',
                                        fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}>
                                        🖨️ Reimprimir Ticket No Fiscal
                                    </button>
                                    <button onClick={handleResetPos} style={{
                                        width: '100%', padding: '14px', background: colors.primary, color: '#fff',
                                        border: 'none', borderRadius: '8px', fontSize: '14px',
                                        fontWeight: '800', cursor: 'pointer', fontFamily: "'Inter', sans-serif"
                                    }}>
                                        Iniciar Nueva Venta
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => setShowCheckout(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}>
                                    <X size={20} />
                                </button>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text, marginBottom: '24px' }}>Detalles de Cobro</h2>

                                <div style={{ background: '#f8fafc', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '13px', fontWeight: '700', color: colors.textSecondary, margin: '0 0 4px 0', textTransform: 'uppercase' }}>Total a Pagar</p>
                                    <p style={{ fontSize: '36px', fontWeight: '900', color: colors.primary, margin: 0 }}>${total.toLocaleString()}</p>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Método de Pago</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {['Efectivo', 'Débito', 'Crédito', 'Transferencia', 'Mixto', 'Crédito de la casa'].map(method => (
                                            <button key={method} onClick={() => { setPaymentMethod(method); setPaymentNotes(''); setAmountTendered(''); }} style={{
                                                padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                                border: paymentMethod === method ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                                                background: paymentMethod === method ? `${colors.primary}10` : '#fff',
                                                color: paymentMethod === method ? colors.primary : colors.text,
                                                fontFamily: "'Inter', sans-serif"
                                            }}>
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {paymentMethod === 'Efectivo' && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>¿Con cuánto paga?</label>
                                        <div style={{ position: 'relative' }}>
                                            <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
                                            <input
                                                type="number"
                                                placeholder="Ej: 50000"
                                                value={amountTendered}
                                                onChange={e => setAmountTendered(e.target.value)}
                                                style={{
                                                    width: '100%', boxSizing: 'border-box', background: '#fff', border: `1px solid ${colors.border}`,
                                                    borderRadius: '8px', padding: '12px 16px 12px 36px', fontSize: '16px', fontWeight: '700',
                                                    color: colors.text, outline: 'none', fontFamily: "'Inter', sans-serif"
                                                }}
                                            />
                                        </div>
                                        {amountTendered && parseFloat(amountTendered) >= total && (
                                            <div style={{ marginTop: '12px', padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                                                <p style={{ fontSize: '13px', color: '#065f46', margin: 0, display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                                                    <span>VUELTO A ENTREGAR:</span>
                                                    <span style={{ fontSize: '16px' }}>${(parseFloat(amountTendered) - total).toLocaleString()}</span>
                                                </p>
                                            </div>
                                        )}
                                        {amountTendered && parseFloat(amountTendered) < total && (
                                            <p style={{ fontSize: '12px', color: colors.error, marginTop: '8px', fontWeight: '600' }}>El monto es menor al total.</p>
                                        )}
                                    </div>
                                )}

                                {paymentMethod === 'Mixto' && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                                            Detalle del pago (Ej: 10000 efvo, resto débito)
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentNotes}
                                            onChange={e => setPaymentNotes(e.target.value)}
                                            placeholder="Ingresá los detalles aquí..."
                                            style={{
                                                width: '100%', boxSizing: 'border-box', background: '#fff', border: `1px solid ${colors.border}`,
                                                borderRadius: '8px', padding: '12px 16px', fontSize: '14px',
                                                color: colors.text, outline: 'none', fontFamily: "'Inter', sans-serif"
                                            }}
                                        />
                                    </div>
                                )}

                                {paymentMethod === 'Crédito de la casa' && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                                            Nombre del cliente
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentNotes}
                                            onChange={e => setPaymentNotes(e.target.value)}
                                            placeholder="Ej: German / Nico / Cliente Frecuente"
                                            style={{
                                                width: '100%', boxSizing: 'border-box', background: '#fff', border: `1px solid ${colors.border}`,
                                                borderRadius: '8px', padding: '12px 16px', fontSize: '14px',
                                                color: colors.text, outline: 'none', fontFamily: "'Inter', sans-serif",
                                                marginBottom: '16px'
                                            }}
                                        />

                                        {/* Credit Planning Slate Container */}
                                        <div style={{
                                            background: '#0f172a',
                                            border: '1px solid #1e293b',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            color: '#f8fafc',
                                            fontFamily: "'Inter', sans-serif"
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '8px', 
                                                fontSize: '12px', 
                                                fontWeight: '800', 
                                                textTransform: 'uppercase', 
                                                color: '#38bdf8',
                                                letterSpacing: '0.05em',
                                                marginBottom: '16px',
                                                borderBottom: '1px solid #1e293b',
                                                paddingBottom: '8px'
                                            }}>
                                                📅 Planificación de Crédito
                                            </div>

                                            {/* Row 1: Entrega Inicial and % Interes */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                                <div>
                                                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                                                        Entrega Inicial ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={creditEntrega}
                                                        onChange={e => setCreditEntrega(e.target.value)}
                                                        style={{
                                                            width: '100%', boxSizing: 'border-box',
                                                            background: '#1e293b', border: '1px solid #334155',
                                                            borderRadius: '6px', padding: '10px 12px', fontSize: '14px', fontWeight: '600',
                                                            color: '#fff', outline: 'none'
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                                                        % Interés
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={creditInteres}
                                                        onChange={e => setCreditInteres(e.target.value)}
                                                        style={{
                                                            width: '100%', boxSizing: 'border-box',
                                                            background: '#1e293b', border: '1px solid #334155',
                                                            borderRadius: '6px', padding: '10px 12px', fontSize: '14px', fontWeight: '600',
                                                            color: '#fff', outline: 'none'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2: Frecuencia and Proximo Pago */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                                <div>
                                                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                                                        Frecuencia
                                                    </label>
                                                    <select
                                                        value={creditFrecuencia}
                                                        onChange={e => setCreditFrecuencia(e.target.value)}
                                                        style={{
                                                            width: '100%', boxSizing: 'border-box',
                                                            background: '#1e293b', border: '1px solid #334155',
                                                            borderRadius: '6px', padding: '10px 12px', fontSize: '13px', fontWeight: '600',
                                                            color: '#fff', outline: 'none', cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value="Libre">Libre</option>
                                                        <option value="Semanal">Semanal</option>
                                                        <option value="Quincenal">Quincenal</option>
                                                        <option value="Mensual">Mensual</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                                                        Próximo Pago
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={creditProximoPago}
                                                        onChange={e => setCreditProximoPago(e.target.value)}
                                                        style={{
                                                            width: '100%', boxSizing: 'border-box',
                                                            background: '#1e293b', border: '1px solid #334155',
                                                            borderRadius: '6px', padding: '8px 10px', fontSize: '13px', fontWeight: '600',
                                                            color: '#fff', outline: 'none'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Saldo a Deber Display */}
                                            <div style={{ 
                                                textAlign: 'right', 
                                                paddingTop: '10px', 
                                                borderTop: '1px solid #1e293b',
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ 
                                                    color: '#f43f5e',
                                                    fontWeight: '800', 
                                                    fontSize: '14px' 
                                                }}>
                                                    Saldo a Deber: ${saldoDeber.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button onClick={handleSale} disabled={processing || (paymentMethod === 'Efectivo' && amountTendered && parseFloat(amountTendered) < total)} style={{
                                    width: '100%', padding: '16px', background: colors.primary, color: '#fff',
                                    border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '800', cursor: processing ? 'not-allowed' : 'pointer',
                                    fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', opacity: processing ? 0.7 : 1
                                }}>
                                    {processing ? 'Confirmando...' : 'Confirmar Venta y Cerrar Caja'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Caja / Historial Modal */}
            {showCaja && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '16px', padding: '32px',
                        width: '95%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative'
                    }}>
                        <button onClick={() => setShowCaja(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}>
                            <X size={20} />
                        </button>
                        
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.text, marginBottom: '20px' }}>
                            Historial de Ventas / Cierre de Caja
                        </h2>

                        {/* Search and Filters Section */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ flex: '1 1 140px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Desde</label>
                                <input type="date" value={historyStartDate} onChange={e => setHistoryStartDate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '13px', color: colors.text, background: '#fff', outline: 'none' }} />
                            </div>
                            <div style={{ flex: '1 1 140px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Hasta</label>
                                <input type="date" value={historyEndDate} onChange={e => setHistoryEndDate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '13px', color: colors.text, background: '#fff', outline: 'none' }} />
                            </div>
                            <div style={{ flex: '1 1 140px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Sucursal</label>
                                <select value={historyBranchFilter} onChange={e => setHistoryBranchFilter(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '13px', color: colors.text, background: '#fff', outline: 'none', fontWeight: '600' }}>
                                    <option value="Todos">Todas las Sucursales</option>
                                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: '1 1 140px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: colors.textSecondary, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Medio de Pago</label>
                                <select value={historyMethod} onChange={e => setHistoryMethod(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '13px', color: colors.text, background: '#fff', outline: 'none', fontWeight: '600' }}>
                                    <option value="Todos">Todos los Métodos</option>
                                    {['Efectivo', 'Transferencia', 'Tarjeta', 'Mixto', 'Crédito de la casa'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <button onClick={fetchDailyCaja} style={{ alignSelf: 'flex-end', padding: '9px 18px', background: colors.primary, color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', height: '36px' }}>
                                Buscar 🔍
                            </button>
                        </div>

                        {cajaLoading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: colors.textSecondary }}>Cargando datos...</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                                {/* Resumen Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #5c2e91 0%, #3e1b68 100%)', padding: '14px 16px', borderRadius: '10px', color: '#fff' }}>
                                        <p style={{ fontSize: '10px', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase', margin: '0 0 2px 0' }}>Total Facturado</p>
                                        <p style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>${cajaSummary.total.toLocaleString()}</p>
                                        <p style={{ fontSize: '10px', opacity: 0.7, margin: '2px 0 0 0' }}>{branchSales.length} ventas · Prom: ${branchSales.length > 0 ? '$' + Math.round(cajaSummary.total / branchSales.length).toLocaleString() : '-'}</p>
                                    </div>
                                    {Object.entries(cajaSummary).filter(([k]) => k !== 'total').map(([method, amount]) => {
                                        const pct = cajaSummary.total > 0 ? Math.round((amount / cajaSummary.total) * 100) : 0;
                                        return (
                                            <div key={method} style={{ background: '#fff', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${colors.border}`, position: 'relative', overflow: 'hidden' }}>
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: `${pct}%`, height: '3px', background: colors.primary, borderRadius: '0 3px 0 0' }} />
                                                <p style={{ fontSize: '10px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', margin: '0 0 2px 0' }}>{method}</p>
                                                <p style={{ fontSize: '16px', fontWeight: '800', color: colors.text, margin: 0 }}>${amount.toLocaleString()}</p>
                                                <p style={{ fontSize: '9px', color: colors.textSecondary, margin: '2px 0 0 0' }}>{pct}% del total</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Strategic Analytics Row */}
                                {branchSales.length > 0 && (() => {
                                    // Top products
                                    const prodMap = {};
                                    branchSales.forEach(s => (s.items || []).forEach(i => {
                                        const k = i.name || '?';
                                        if (!prodMap[k]) prodMap[k] = { qty: 0, rev: 0 };
                                        prodMap[k].qty += i.quantity || 1;
                                        prodMap[k].rev += (i.price || 0) * (i.quantity || 1);
                                    }));
                                    const topProds = Object.entries(prodMap).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);

                                    // Sales by hour
                                    const hourMap = {};
                                    branchSales.forEach(s => {
                                        const h = new Date(s.created_at).getHours();
                                        hourMap[h] = (hourMap[h] || 0) + 1;
                                    });
                                    const peakHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];

                                    // Best selling day
                                    const dayMap = {};
                                    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                                    branchSales.forEach(s => {
                                        const d = dayNames[new Date(s.created_at).getDay()];
                                        if (!dayMap[d]) dayMap[d] = { count: 0, rev: 0 };
                                        dayMap[d].count++;
                                        dayMap[d].rev += s.total || 0;
                                    });
                                    const bestDay = Object.entries(dayMap).sort((a, b) => b[1].rev - a[1].rev)[0];

                                    // Total garments
                                    const totalGarments = branchSales.reduce((acc, s) => acc + (s.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0), 0);

                                    return (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                            {/* Top Products */}
                                            <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '14px 16px' }}>
                                                <p style={{ fontSize: '10px', fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>🏆 Top Productos</p>
                                                {topProds.map(([name, data], idx) => (
                                                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: idx < topProds.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                                                        <span style={{ fontSize: '12px', color: colors.text, fontWeight: '600', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{idx + 1}. {name}</span>
                                                        <span style={{ fontSize: '11px', color: colors.textSecondary }}>{data.qty}u · ${data.rev.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Quick Stats */}
                                            <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '14px 16px' }}>
                                                <p style={{ fontSize: '10px', fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>📊 Insights Estratégicos</p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                        <span style={{ color: colors.textSecondary }}>Prendas vendidas</span>
                                                        <strong style={{ color: colors.text }}>{totalGarments}</strong>
                                                    </div>
                                                    {peakHour && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                            <span style={{ color: colors.textSecondary }}>Horario pico</span>
                                                            <strong style={{ color: colors.text }}>{peakHour[0]}:00 hs ({peakHour[1]} ventas)</strong>
                                                        </div>
                                                    )}
                                                    {bestDay && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                            <span style={{ color: colors.textSecondary }}>Mejor día</span>
                                                            <strong style={{ color: colors.text }}>{bestDay[0]} (${bestDay[1].rev.toLocaleString()})</strong>
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                        <span style={{ color: colors.textSecondary }}>Venta más alta</span>
                                                        <strong style={{ color: colors.success }}>${Math.max(...branchSales.map(s => s.total || 0)).toLocaleString()}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Historial List */}
                                <div style={{ overflowY: 'auto', flex: 1, border: `1px solid ${colors.border}`, borderRadius: '12px', background: '#f8fafc' }}>
                                    {branchSales.length === 0 ? (
                                        <div style={{ padding: '32px', textAlign: 'center', color: colors.textSecondary, fontSize: '13px' }}>No hay ventas registradas que coincidan con los filtros.</div>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                            <thead style={{ background: '#fff', position: 'sticky', top: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', zIndex: 10 }}>
                                                <tr>
                                                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: '700' }}>Fecha/Hora</th>
                                                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: '700' }}>Ticket</th>
                                                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: '700' }}>Sucursal</th>
                                                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: '700' }}>Método</th>
                                                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: '700' }}>Total</th>
                                                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontWeight: '700', textAlign: 'right' }}>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedSales.map(sale => {
                                                    const meta = sale.customer_info || {};
                                                    const saleBranch = meta.branch || (sale.notes?.includes('[Sucursal: ') ? sale.notes.split('[Sucursal: ')[1].split(']')[0] : 'Central');
                                                    const ticketNum = meta.ticket_number || `OLMO-${new Date(sale.created_at).getTime()}`;
                                                    return (
                                                        <tr key={sale.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                                            <td style={{ padding: '10px 16px', color: colors.text }}>
                                                                {new Date(sale.created_at).toLocaleDateString('es-AR')} {new Date(sale.created_at).toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'})}
                                                            </td>
                                                            <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontWeight: '700', fontSize: '11px', color: colors.text }}>
                                                                {ticketNum}
                                                            </td>
                                                            <td style={{ padding: '10px 16px', color: colors.textSecondary }}>
                                                                {saleBranch}
                                                            </td>
                                                            <td style={{ padding: '10px 16px', fontWeight: '600' }}>
                                                                <span style={{ background: '#e2e8f0', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', color: colors.text }}>
                                                                    {sale.payment_method || meta.method || 'Efectivo'}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '10px 16px', fontWeight: '800', color: colors.primary }}>${sale.total?.toLocaleString()}</td>
                                                            <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                    <button onClick={() => setSelectedSaleDetail(sale)} style={{ padding: '5px 10px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        Ver Detalle 👁️
                                                                    </button>
                                                                    <button onClick={() => reprintSale(sale)} style={{ padding: '5px 10px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        Reimprimir 🖨️
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', background: '#fff', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                                        <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                                            Página <strong>{cajaPage}</strong> de {totalPages} ({branchSales.length} ventas en total)
                                        </span>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button 
                                                disabled={cajaPage === 1}
                                                onClick={() => setCajaPage(prev => Math.max(1, prev - 1))}
                                                style={{
                                                    padding: '5px 12px', background: cajaPage === 1 ? '#f1f5f9' : '#fff', 
                                                    border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '12px', 
                                                    cursor: cajaPage === 1 ? 'not-allowed' : 'pointer', color: cajaPage === 1 ? '#cbd5e1' : colors.text,
                                                    fontWeight: '600', transition: 'all 0.2s'
                                                }}
                                            >
                                                ◀ Anterior
                                            </button>
                                            <button 
                                                disabled={cajaPage === totalPages}
                                                onClick={() => setCajaPage(prev => Math.min(totalPages, prev + 1))}
                                                style={{
                                                    padding: '5px 12px', background: cajaPage === totalPages ? '#f1f5f9' : '#fff', 
                                                    border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '12px', 
                                                    cursor: cajaPage === totalPages ? 'not-allowed' : 'pointer', color: cajaPage === totalPages ? '#cbd5e1' : colors.text,
                                                    fontWeight: '600', transition: 'all 0.2s'
                                                }}
                                            >
                                                Siguiente ▶
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    <button onClick={exportToCSV} style={{
                                        padding: '10px 18px', background: '#f1f5f9', color: '#475569', border: `1px solid ${colors.border}`,
                                        borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        📥 Exportar CSV
                                    </button>
                                    <button onClick={printCierreCaja} style={{
                                        padding: '10px 18px', background: '#1e293b', color: '#fff', border: 'none',
                                        borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        🖨️ Imprimir Cierre de Caja
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sale Detail Modal Overlay */}
            {selectedSaleDetail && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '16px', padding: '32px',
                        width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative'
                    }}>
                        <button onClick={() => setSelectedSaleDetail(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}>
                            <X size={20} />
                        </button>
                        
                        <div style={{ textAlign: 'center', borderBottom: `1px solid ${colors.border}`, paddingBottom: '16px', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: colors.text, margin: '0 0 6px 0' }}>Detalle de Venta</h3>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: colors.primary, background: `${colors.primary}15`, padding: '4px 10px', borderRadius: '20px' }}>
                                {selectedSaleDetail.customer_info?.ticket_number || `OLMO-${new Date(selectedSaleDetail.created_at).getTime()}`}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px', fontSize: '13px' }}>
                            <div>
                                <span style={{ color: colors.textSecondary, display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Fecha/Hora</span>
                                <strong style={{ color: colors.text }}>{new Date(selectedSaleDetail.created_at).toLocaleString('es-AR')}</strong>
                            </div>
                            <div>
                                <span style={{ color: colors.textSecondary, display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Sucursal</span>
                                <strong style={{ color: colors.text }}>
                                    {selectedSaleDetail.customer_info?.branch || (selectedSaleDetail.notes?.includes('[Sucursal: ') ? selectedSaleDetail.notes.split('[Sucursal: ')[1].split(']')[0] : 'Central')}
                                </strong>
                            </div>
                            <div>
                                <span style={{ color: colors.textSecondary, display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Método de Pago</span>
                                <strong style={{ color: colors.text }}>{selectedSaleDetail.payment_method || selectedSaleDetail.customer_info?.method || 'N/A'}</strong>
                            </div>
                            <div>
                                <span style={{ color: colors.textSecondary, display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Canal</span>
                                <strong style={{ color: colors.text }}>{selectedSaleDetail.customer_info?.source || 'Tienda Online'}</strong>
                            </div>
                        </div>

                        <div style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '16px', background: '#f8fafc', marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: '800', color: colors.text, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Productos Vendidos</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(selectedSaleDetail.items || []).map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                        <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                                            <p style={{ margin: 0, fontWeight: '700', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: colors.textSecondary }}>
                                                Talle {item.size} {item.color ? `• Color: ${item.color}` : ''} x{item.quantity}
                                            </p>
                                        </div>
                                        <strong style={{ color: colors.text, flexShrink: 0 }}>
                                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                                        </strong>
                                    </div>
                                ))}
                            </div>
                            <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: '14px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '14px', color: colors.text }}>TOTAL</strong>
                                <strong style={{ fontSize: '18px', color: colors.primary }}>${selectedSaleDetail.total?.toLocaleString('es-AR')}</strong>
                            </div>
                        </div>

                        {selectedSaleDetail.customer_info?.creditPlan && (
                            <div style={{ marginBottom: '24px', fontSize: '13px', background: '#f8fafc', border: `1px solid ${colors.border}`, padding: '16px', borderRadius: '8px' }}>
                                <span style={{ color: colors.primary, display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '4px' }}>Planificación de Crédito</span>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                                    <div>
                                        <span style={{ fontSize: '10px', color: colors.textSecondary }}>Entrega Inicial:</span><br/>
                                        <strong>${parseFloat(selectedSaleDetail.customer_info.creditPlan.entrega || 0).toLocaleString('es-AR')}</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '10px', color: colors.textSecondary }}>Interés:</span><br/>
                                        <strong>{selectedSaleDetail.customer_info.creditPlan.interes || 0}%</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '10px', color: colors.textSecondary }}>Frecuencia:</span><br/>
                                        <strong>{selectedSaleDetail.customer_info.creditPlan.frecuencia}</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '10px', color: colors.textSecondary }}>Próximo Pago:</span><br/>
                                        <strong>{selectedSaleDetail.customer_info.creditPlan.proximoPago ? new Date(selectedSaleDetail.customer_info.creditPlan.proximoPago + 'T00:00:00').toLocaleDateString('es-AR') : 'Libre'}</strong>
                                    </div>
                                </div>
                                <div style={{ borderTop: `1px dashed ${colors.border}`, marginTop: '10px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: colors.textSecondary, fontWeight: '700' }}>SALDO A DEBER:</span>
                                    <strong style={{ color: '#ef4444', fontSize: '14px' }}>${parseFloat(selectedSaleDetail.customer_info.creditPlan.saldo || 0).toLocaleString('es-AR')}</strong>
                                </div>
                            </div>
                        )}

                        {selectedSaleDetail.notes && (
                            <div style={{ marginBottom: '24px', fontSize: '13px', background: '#fffbeb', border: '1px solid #fef3c7', padding: '12px', borderRadius: '8px' }}>
                                <span style={{ color: '#b45309', display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Notas de Pago / Detalles</span>
                                <span style={{ color: '#78350f', fontFamily: 'monospace' }}>{selectedSaleDetail.notes}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => reprintSale(selectedSaleDetail)} style={{
                                flex: 1, padding: '12px', background: '#1e293b', color: '#fff', border: 'none',
                                borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}>
                                🖨️ Reimprimir Ticket
                            </button>
                            <button onClick={() => setSelectedSaleDetail(null)} style={{
                                flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none',
                                borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
                            }}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Color Selector Modal Overlay */}
            {colorSelectionPending && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '16px', padding: '28px',
                        width: '90%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative', textAlign: 'center'
                    }}>
                        <button 
                            onClick={() => setColorSelectionPending(null)} 
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}
                        >
                            <X size={20} />
                        </button>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.text, marginBottom: '8px' }}>Seleccionar Color</h3>
                        <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '20px' }}>
                            Elegí el color para <strong>{colorSelectionPending.product.name}</strong> (Talle {colorSelectionPending.size}):
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
                            {colorSelectionPending.product.colors?.map((col, idx) => {
                                const isLight = col.hex === '#FFFFFF' || col.hex === '#ffffff' || col.hex === '#F5F0E1' || col.hex === '#f5f0e1';
                                const size = colorSelectionPending.size;
                                const colorStock = (colorSelectionPending.product.variants || {})[`${size}-${col.name}`] ?? 0;
                                const isOutOfStock = colorStock <= 0;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (isOutOfStock) return;
                                            addToCart(colorSelectionPending.product, size, col);
                                            setColorSelectionPending(null);
                                        }}
                                        disabled={isOutOfStock}
                                        style={{
                                            width: '44px', height: '44px', borderRadius: '50%', background: col.hex,
                                            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(0,0,0,0.15)',
                                            cursor: isOutOfStock ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'transform 0.2s',
                                            opacity: isOutOfStock ? 0.35 : 1,
                                        }}
                                        onMouseEnter={e => { if (!isOutOfStock) e.currentTarget.style.transform = 'scale(1.1)'; }}
                                        onMouseLeave={e => { if (!isOutOfStock) e.currentTarget.style.transform = 'scale(1)'; }}
                                        title={`${col.name} - Stock: ${colorStock}`}
                                    >
                                        <span style={{ 
                                            fontSize: '8px', color: isLight ? '#000' : '#fff', fontWeight: '700', marginTop: '2px',
                                            background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.4)', padding: '1px 3px',
                                            borderRadius: '3px', maxWidth: '38px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                        }}>{col.name} ({colorStock})</span>
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={() => setColorSelectionPending(null)} style={{ width: '100%', padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PosModule;
