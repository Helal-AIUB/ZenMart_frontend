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
  addToCart: (
    productId: number,
    quantity: number,
    isRetry?: boolean
  ) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;

  // Added clearCart method
  clearCart: () => void;
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
          const res = await apiClient.get(`/store/carts/${cartId}/`);
          set({ cartItems: res.data.items || [] });
        } catch (error: any) {
          if (
            error.response?.status === 404 ||
            error.response?.status === 500
          ) {
            set({ cartId: null, cartItems: [] });
          }
        }
      },

      addToCart: async (
        productId: number,
        quantity: number,
        isRetry = false
      ) => {
        let { cartId } = get();

        try {
          if (!cartId) {
            const res = await apiClient.post('/store/carts/');
            cartId = res.data.id || res.data.cart_id;

            if (!cartId) {
              throw new Error('Cart ID is missing from API response!');
            }

            set({ cartId });
          }

          await apiClient.post(`/store/carts/${cartId}/items/`, {
            product_id: productId,
            quantity: quantity,
          });

          await get().fetchCart();
        } catch (error: any) {
          if (
            (error.response?.status === 404 ||
              error.response?.status === 500) &&
            !isRetry
          ) {
            set({ cartId: null, cartItems: [] });
            await get().addToCart(productId, quantity, true);
          } else {
            console.error(
              'Failed to add to cart:',
              error.response?.data || error.message
            );
            throw error;
          }
        }
      },

      updateQuantity: async (itemId: number, quantity: number) => {
        const { cartId, cartItems } = get();
        if (!cartId) return;

        const previousItems = [...cartItems];
        const optimisticItems = cartItems.map((item: any) =>
          item.id === itemId ? { ...item, quantity: quantity } : item
        );

        set({ cartItems: optimisticItems });

        try {
          await apiClient.patch(
            `/store/carts/${cartId}/items/${itemId}/`,
            { quantity }
          );
        } catch (error) {
          console.error('Failed to update quantity', error);
          set({ cartItems: previousItems });
        }
      },

      removeItem: async (itemId: number) => {
        const { cartId, cartItems } = get();
        if (!cartId) return;

        const previousItems = [...cartItems];
        const optimisticItems = cartItems.filter(
          (item: any) => item.id !== itemId
        );

        set({ cartItems: optimisticItems });

        try {
          await apiClient.delete(`/store/carts/${cartId}/items/${itemId}/`);
        } catch (error) {
          console.error('Failed to remove item', error);
          set({ cartItems: previousItems });
        }
      },

      // ✅ Clear the entire cart from frontend state
      clearCart: () => {
        set({
          cartId: null,
          cartItems: [],
        });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cartId: state.cartId }),
    }
  )
);