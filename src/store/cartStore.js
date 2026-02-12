import { create } from 'zustand';

export const useCartStore = create((set) => ({
    cart: [],
    addItem: (product) => set((state) => {
        const existing = state.cart.find(item => item.id === product.id);
        if (existing) {
            return {
                cart: state.cart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
    }),
    removeItem: (id) => set((state) => ({
        cart: state.cart.filter(item => item.id !== id)
    })),
    clearCart: () => set({ cart: [] }),
    getTotal: () => set((state) => state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0))
}));
