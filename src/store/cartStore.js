import { create } from 'zustand';

export const useCartStore = create((set) => ({
    cart: [],
    addItem: (product) => set((state) => {
        const itemKey = `${product.id}-${product.size || ''}-${product.color || ''}`;
        const existing = state.cart.find(item => item.key === itemKey);
        if (existing) {
            return {
                cart: state.cart.map(item =>
                    item.key === itemKey ? { ...item, quantity: item.quantity + (product.quantity || 1) } : item
                )
            };
        }
        return { cart: [...state.cart, { ...product, key: itemKey, quantity: product.quantity || 1 }] };
    }),
    removeItem: (key) => set((state) => ({
        cart: state.cart.filter(item => item.key !== key)
    })),
    clearCart: () => set({ cart: [] }),
    getTotal: () => set((state) => state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0))
}));

