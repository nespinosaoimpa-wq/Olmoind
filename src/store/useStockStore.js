import { create } from 'zustand';

export const useStockStore = create((set) => ({
    stock: [
        { id: 1, name: 'Remera Olmo Oversize', size: 'L', count: 15, price: 25000, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800' },
        { id: 2, name: 'Pantalón Cargo Grey', size: 'M', count: 8, price: 45000, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800' },
        { id: 3, name: 'Buzo Hoodie Noir', size: 'XL', count: 5, price: 55000, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800' },
    ],
    sales: [],

    updateStock: (id, newStock) => set((state) => ({
        stock: state.stock.map(item => item.id === id ? { ...item, ...newStock } : item)
    })),

    addStockItem: (item) => set((state) => ({
        stock: [...state.stock, { ...item, id: Date.now() }]
    })),

    deleteStockItem: (id) => set((state) => ({
        stock: state.stock.filter(item => item.id !== id)
    })),

    registerSale: (cart) => set((state) => {
        const newSales = [...state.sales, { id: Date.now(), items: cart, date: new Date().toISOString() }];
        const newStock = state.stock.map(item => {
            const soldItem = cart.find(c => c.id === item.id);
            if (soldItem) {
                return { ...item, count: Math.max(0, item.count - soldItem.quantity) };
            }
            return item;
        });
        return { stock: newStock, sales: newSales };
    })
}));
