import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export const useStockStore = create((set, get) => ({
    stock: [],
    loading: false,
    error: null,

    // Fetch products from Supabase
    fetchProducts: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ stock: data, loading: false });
        } catch (error) {
            console.error('Error fetching products:', error);
            set({ error: error.message, loading: false });
        }
    },

    // Update product stock (for Admin)
    updateStock: async (id, newVariants) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ variants: newVariants })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            set((state) => ({
                stock: state.stock.map((p) =>
                    p.id === id ? { ...p, variants: newVariants } : p
                ),
            }));
        } catch (error) {
            console.error('Error updating stock:', error);
            throw error;
        }
    },

    // Register a sale (deduct stock)
    registerSale: async (cartItems, paymentData = {}) => {
        try {
            // 1. Deduct stock for each item
            for (const item of cartItems) {
                // Fetch current product to get latest stock
                const { data: product } = await supabase
                    .from('products')
                    .select('variants')
                    .eq('id', item.id)
                    .single();

                if (product) {
                    const currentVariants = product.variants;
                    const newStock = (currentVariants[item.size] || 0) - item.quantity;

                    if (newStock < 0) throw new Error(`Not enough stock for ${item.name}`);

                    const newVariants = { ...currentVariants, [item.size]: newStock };

                    await supabase
                        .from('products')
                        .update({ variants: newVariants })
                        .eq('id', item.id);
                }
            }

            // 2. Record the sale
            const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
            
            const branchText = paymentData.branch ? `[Sucursal: ${paymentData.branch}] ` : '';
            const sourceText = paymentData.source ? `[Origen: ${paymentData.source}] ` : '';
            const finalNotes = sourceText + branchText + (paymentData.notes || '');
            const ticketNumber = paymentData.ticketNumber || `OLMO-${Date.now()}`;

            const customerMetadata = {
                method: paymentData.method || 'cash',
                notes: finalNotes,
                branch: paymentData.branch || 'Central',
                source: paymentData.source || 'Punto de Venta',
                ticket_number: ticketNumber,
                paymentNotes: paymentData.notes || '',
                amountTendered: paymentData.amountTendered || '',
                creditPlan: paymentData.creditPlan || null
            };

            // Attempt inserts with progressive fallbacks for schema flexibility
            const saleRecord = {
                items: cartItems,
                total: total,
                payment_method: paymentData.method || 'cash',
                notes: finalNotes,
                status: paymentData.status || 'Completada',
                customer_info: customerMetadata
            };

            let insertOk = false;
            
            // Attempt 1: Full insert with all columns
            const { error: err1 } = await supabase.from('sales').insert([saleRecord]);
            if (!err1) {
                insertOk = true;
            } else {
                console.warn('Sale insert attempt 1 failed:', err1.message);
                // Attempt 2: Without payment_method and notes columns
                const { error: err2 } = await supabase.from('sales').insert([{
                    items: cartItems,
                    total: total,
                    status: paymentData.status || 'Completada',
                    customer_info: customerMetadata
                }]);
                if (!err2) {
                    insertOk = true;
                } else {
                    console.warn('Sale insert attempt 2 failed:', err2.message);
                    // Attempt 3: Minimal insert
                    const { error: err3 } = await supabase.from('sales').insert([{
                        items: cartItems,
                        total: total,
                        customer_info: customerMetadata
                    }]);
                    if (!err3) {
                        insertOk = true;
                    } else {
                        throw err3;
                    }
                }
            }

            if (!insertOk) {
                throw new Error('No se pudo registrar la venta después de múltiples intentos.');
            }

            // 2.5. Enviar Notificación Push (Telegram)
            try {
                const itemsList = cartItems.map(i => `• ${i.name} (${i.size}${i.color ? ` - ${i.color}` : ''}) x${i.quantity}`).join('\n');
                fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemsList, total })
                });
            } catch (e) {
                console.error('Error enviando push notification:', e);
            }

            // 3. Refresh local state
            get().fetchProducts();

        } catch (error) {
            console.error('Error registering sale:', error);
            alert('Error en la venta: ' + error.message);
        }
    },

    // Create new product (Admin)
    addProduct: async (productData) => {
        // Separate colors from the rest of the data to avoid schema cache errors
        const { colors: productColors, ...safeData } = productData;

        // Ensure both 'images' array and legacy 'image' string are set
        const finalData = {
            ...safeData,
            image: (safeData.images && safeData.images[0]) || safeData.image || '',
            images: safeData.images || (safeData.image ? [safeData.image] : [])
        };

        const { data, error } = await supabase
            .from('products')
            .insert([finalData])
            .select();

        if (error) throw error;

        // Try to add colors separately (silently fails if column doesn't exist)
        if (data && data[0] && productColors && productColors.length > 0) {
            try {
                await supabase.from('products').update({ colors: productColors }).eq('id', data[0].id);
            } catch (e) {
                console.warn('Colors column not available, skipping color save:', e);
            }
        }

        if (data) {
            // Merge colors back into local state regardless
            const enrichedData = data.map(d => ({ ...d, colors: productColors || [] }));
            set((state) => ({ stock: [...enrichedData, ...state.stock] }));
        }
    },

    // Delete product
    deleteProduct: async (id) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        set((state) => ({ stock: state.stock.filter(p => p.id !== id) }));
    }
}));
