import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  wishlistItems: any[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: number) => void;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      wishlistItems: [],
      isWishlistOpen: false,
      openWishlist: () => set({ isWishlistOpen: true }),
      closeWishlist: () => set({ isWishlistOpen: false }),
      addToWishlist: (product) =>
        set((state) => {
          const exists = state.wishlistItems.find((item) => item.id === product.id);
          if (exists) return state;
          return { wishlistItems: [...state.wishlistItems, product] };
        }),
      removeFromWishlist: (productId) =>
        set((state) => ({
          wishlistItems: state.wishlistItems.filter((item) => item.id !== productId),
        })),
    }),
    { name: 'zenmart-wishlist' }
  )
);