import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/services/apiClient";

interface CartStore {
  cartId: string | null;
  cartItems: any[];
  isCartOpen: boolean;

  // 🟢 Coupon States
  appliedCoupon: string | null;
  discountAmount: number;

  pendingDeletes: number[];

  openCart: () => void;
  closeCart: () => void;
  fetchCart: () => Promise<void>;

  // 🟢 Modified: Changed productId to productOrId to accept the full object for optimistic UI
  addToCart: (
    productOrId: any,
    quantity: number,
    isRetry?: boolean,
  ) => Promise<void>;

  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;

  // 🟢 Coupon Actions
  applyCoupon: (code: string, amount: number) => void;
  removeCoupon: () => void;

  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartId: null,
      cartItems: [],
      isCartOpen: false,
      pendingDeletes: [],

      appliedCoupon: null,
      discountAmount: 0,

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
            set({
              cartId: null,
              cartItems: [],
              appliedCoupon: null,
              discountAmount: 0,
            });
          }
        }
      },

      addToCart: async (
        productOrId: any,
        quantity: number,
        isRetry = false,
      ) => {
        let { cartId, cartItems } = get();
        const previousCart = [...cartItems]; 

        const isProductObject =
          typeof productOrId === "object" && productOrId !== null;
        const productId = isProductObject ? productOrId.id : productOrId;

        // 🟢 INSTANT UI UPDATE (Optimistic Logic)
        if (isProductObject) {
          const existingItem = cartItems.find(
            (item: any) => item.product?.id === productId,
          );

          if (existingItem) {
            set({
              cartItems: cartItems.map((item: any) =>
                item.product?.id === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            });
          } else {
            const tempItem = {
              id: `temp_${Date.now()}`,
              product: productOrId,
              quantity: quantity,
              total_price: (productOrId.unit_price || 0) * quantity,
            };
            set({ cartItems: [...cartItems, tempItem] });
          }
        }

        try {
          if (!cartId) {
            const res = await apiClient.post("/store/carts/");
            cartId = res.data.id || res.data.cart_id;
            if (!cartId)
              throw new Error("Cart ID is missing from API response!");
            set({ cartId });
          }

          await apiClient.post(`/store/carts/${cartId}/items/`, {
            product_id: productId,
            quantity: quantity,
          });

          await get().fetchCart();

          const { pendingDeletes } = get();
          if (pendingDeletes.includes(productId)) {
            set({
              pendingDeletes: pendingDeletes.filter((id) => id !== productId),
            });

            const newlyAddedRealItem = get().cartItems.find(
              (item: any) => item.product?.id === productId,
            );
            if (newlyAddedRealItem) {
              await get().removeItem(newlyAddedRealItem.id);
            }
          }
        } catch (error: any) {
          if (isProductObject) {
            set({ cartItems: previousCart });
          }

          if (
            (error.response?.status === 404 ||
              error.response?.status === 500) &&
            !isRetry
          ) {
            set({
              cartId: null,
              cartItems: [],
              appliedCoupon: null,
              discountAmount: 0,
            });
            await get().addToCart(productOrId, quantity, true);
          } else {
            console.error(
              "Failed to add to cart:",
              error.response?.data || error.message,
            );
            throw error;
          }
        }
      },

      updateQuantity: async (itemId: number | string, quantity: number) => {
        const { cartId, cartItems } = get();
        if (!cartId) return;

        const previousItems = [...cartItems];

        const optimisticItems = cartItems.map((item: any) =>
          item.id === itemId ? { ...item, quantity: quantity } : item,
        );
        set({ cartItems: optimisticItems });

        if (typeof itemId === "string" && itemId.startsWith("temp_")) {
          return;
        }

        try {
          await apiClient.patch(`/store/carts/${cartId}/items/${itemId}/`, {
            quantity,
          });
        } catch (error) {
          console.error("Failed to update quantity", error);
          set({ cartItems: previousItems });
        }
      },

      removeItem: async (itemId: number | string) => {
        const { cartId, cartItems, pendingDeletes } = get();
        if (!cartId) return;

        const itemToDelete = cartItems.find((item: any) => item.id === itemId);
        if (!itemToDelete) return;

        const previousItems = [...cartItems];

        const optimisticItems = cartItems.filter(
          (item: any) => item.id !== itemId,
        );
        set({ cartItems: optimisticItems });

        if (typeof itemId === "string" && itemId.startsWith("temp_")) {
          const productId = itemToDelete.product?.id;
          if (productId) {
            set({ pendingDeletes: [...pendingDeletes, productId] });
          }
          return;
        }

        try {
          await apiClient.delete(`/store/carts/${cartId}/items/${itemId}/`);
        } catch (error) {
          console.error("Failed to remove item", error);
          set({ cartItems: previousItems });
        }
      },

      // 🟢 Actions for Coupon (Untouched)
      applyCoupon: (code: string, amount: number) => {
        set({ appliedCoupon: code, discountAmount: amount });
      },

      removeCoupon: () => {
        set({ appliedCoupon: null, discountAmount: 0 });
      },

      clearCart: () => {
        set({
          cartId: null,
          cartItems: [],
          appliedCoupon: null,
          discountAmount: 0,
        });
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        cartId: state.cartId,
        appliedCoupon: state.appliedCoupon,
        discountAmount: state.discountAmount,
      }),
    },
  ),
);
