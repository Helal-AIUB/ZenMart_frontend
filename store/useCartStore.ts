// frontend/src/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/services/apiClient';

interface CartStore {
  cartId: string | null;
  cartItems: any[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number, isRetry?: boolean) => Promise<void>; // isRetry যুক্ত করা হয়েছে
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartId: null,
      cartItems: [],
      isCartOpen: false,
      
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      fetchCart: async () => {
        const { cartId } = get();
        if (!cartId) return;
        try {
          const res = await apiClient.get(`/carts/${cartId}/`);
          set({ cartItems: res.data.items || [] });
        } catch (error: any) {
          if (error.response?.status === 404 || error.response?.status === 500) {
            set({ cartId: null, cartItems: [] });
          }
        }
      },

      addToCart: async (productId: number, quantity: number, isRetry = false) => {
        let { cartId } = get();
        try {
          if (!cartId) {
            const res = await apiClient.post('/carts/');
            cartId = res.data.id || res.data.cart_id; 
            if (!cartId) throw new Error("Cart ID is missing from API response!");
            set({ cartId });
          }
          
          await apiClient.post(`/carts/${cartId}/items/`, {
            product_id: productId, 
            quantity: quantity
          });
          
          await get().fetchCart();
        } catch (error: any) {
          if ((error.response?.status === 404 || error.response?.status === 500) && !isRetry) {
            console.warn("Ghost cart detected. Healing cart and retrying...");
            set({ cartId: null, cartItems: [] });
            await get().addToCart(productId, quantity, true); 
          } else {
            console.error("Failed to add to cart. Backend Error:", error.response?.data || error.message);
            throw error; 
          }
        }
      },

      updateQuantity: async (itemId: number, quantity: number) => {
        const { cartId } = get();
        if (!cartId) return;
        try {
          await apiClient.patch(`/carts/${cartId}/items/${itemId}/`, { quantity });
          await get().fetchCart();
        } catch (error) {
          console.error("Failed to update quantity");
        }
      },

      removeItem: async (itemId: number) => {
        const { cartId } = get();
        if (!cartId) return;
        try {
          await apiClient.delete(`/carts/${cartId}/items/${itemId}/`);
          await get().fetchCart();
        } catch (error) {
          console.error("Failed to remove item");
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cartId: state.cartId }),
    }
  )
);