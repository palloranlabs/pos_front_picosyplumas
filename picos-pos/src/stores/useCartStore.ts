import { create } from 'zustand';
import type { Product } from '../types/models.types';
import { parseDecimal } from '../utils/currency';

interface CartItem {
    product: Product;
    quantity: string;
    discount_percent: string;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: string) => void;
    updateDiscount: (productId: number, discount: string) => void;
    setMasterPassword: (password: string) => void; // Store temporarily for API call
    clearCart: () => void;

    // State
    masterPassword?: string;

    // Computed (Calculated on the fly in components or here if we cache)
    // We'll provide helpers
    getMetaData: () => { subtotal: number; tax: number; total: number };
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    masterPassword: undefined,

    addItem: (product) => set((state) => {
        const existing = state.items.find(i => i.product.id === product.id);
        if (existing) {
            // Increment quantity by 1
            const newQty = (parseDecimal(existing.quantity) + 1).toString();
            return {
                items: state.items.map(i => i.product.id === product.id ? { ...i, quantity: newQty } : i)
            };
        }
        return { items: [...state.items, { product, quantity: "1", discount_percent: "0" }] };
    }),

    removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.product.id !== productId)
    })),

    updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(i => i.product.id === productId ? { ...i, quantity } : i)
    })),

    updateDiscount: (productId, discount) => set((state) => ({
        items: state.items.map(i => i.product.id === productId ? { ...i, discount_percent: discount } : i)
    })),

    setMasterPassword: (password) => set({ masterPassword: password }),

    clearCart: () => set({ items: [], masterPassword: undefined }),

    getMetaData: () => {
        const { items } = get();
        let subtotal = 0;

        items.forEach(item => {
            const price = parseDecimal(item.product.base_price);
            const qty = parseDecimal(item.quantity);
            const discount = parseDecimal(item.discount_percent);

            const itemTotal = price * qty * (1 - discount / 100);
            subtotal += itemTotal;
        });

        // Tax Logic (0%)
        const tax = 0;
        const total = subtotal + tax;

        return { subtotal, tax, total };
    }
}));
