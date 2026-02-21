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
        }
    },

    // Register a sale (deduct stock)
    registerSale: async (cartItems) => {
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
            await supabase.from('sales').insert([{
                items: cartItems,
                total: total,
            }]);

            // 3. Refresh local state
            get().fetchProducts();

        } catch (error) {
            console.error('Error registering sale:', error);
            alert('Error en la venta: ' + error.message);
        }
    },

    // Create new product (Admin)
    addProduct: async (productData) => {
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select();

        if (error) throw error;

        if (data) {
            set((state) => ({ stock: [...data, ...state.stock] }));
        }
    },

    // Delete product
    deleteProduct: async (id) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        set((state) => ({ stock: state.stock.filter(p => p.id !== id) }));
    }
}));
