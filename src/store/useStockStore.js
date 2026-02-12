import { create } from 'zustand';

export const useStockStore = create((set) => ({
    stock: [
        {
            id: 1,
            name: 'Remera Olmo Oversize',
            price: 25000,
            image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
            variants: { XS: 0, S: 10, M: 15, L: 5, XL: 2, XXL: 0 }
        },
        {
            id: 2,
            name: 'Pantalón Cargo Grey',
            price: 45000,
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800',
            variants: { XS: 2, S: 5, M: 8, L: 0, XL: 0, XXL: 0 }
        },
        {
            id: 3,
            name: 'Buzo Hoodie Noir',
            price: 55000,
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
            variants: { XS: 0, S: 0, M: 5, L: 5, XL: 5, XXL: 2 }
        },
    ],
    sales: [],

    updateStock: (id, newProductData) => set((state) => ({
        stock: state.stock.map(item => item.id === id ? { ...item, ...newProductData } : item)
    })),

    addStockItem: (item) => set((state) => ({
        stock: [...state.stock, { ...item, id: Date.now() }]
    })),

    deleteStockItem: (id) => set((state) => ({
        stock: state.stock.filter(item => item.id !== id)
    })),

    registerSale: (cart) => set((state) => {
        const newSales = [...state.sales, { id: Date.now(), items: cart, date: new Date().toISOString() }];
        // Cart items now must have { ..., size: 'M' }
        const newStock = state.stock.map(product => {
            const cartItemsForProduct = cart.filter(c => c.id === product.id);

            if (cartItemsForProduct.length > 0) {
                let updatedVariants = { ...product.variants };
                cartItemsForProduct.forEach(cartItem => {
                    if (updatedVariants[cartItem.size] !== undefined) {
                        updatedVariants[cartItem.size] = Math.max(0, updatedVariants[cartItem.size] - cartItem.quantity);
                    }
                });
                return { ...product, variants: updatedVariants };
            }
            return product;
        });
        return { stock: newStock, sales: newSales };
    })
}));
