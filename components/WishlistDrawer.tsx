'use client';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';

export default function WishlistDrawer() {
  const { wishlistItems, isWishlistOpen, closeWishlist, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={closeWishlist}></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card shadow-2xl flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-card-border">
            <h2 className="text-lg font-black text-foreground">My Wishlist ({wishlistItems.length})</h2>
            <button onClick={closeWishlist} className="text-muted hover:text-foreground text-xl font-bold cursor-pointer">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted text-sm font-medium">Your wishlist is currently empty.</p>
              </div>
            ) : (
              wishlistItems.map((item: any) => {
                const itemPrice = Math.round(Number(item.unit_price));
                return (
                  <div key={item.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-card-border bg-card shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-card-border shrink-0">
                        📦
                      </div>
                      <div>
                        <Link href={`/products/${item.id}`} onClick={closeWishlist} className="text-xs font-bold text-foreground line-clamp-1 hover:text-primary transition-colors">
                          {item.title}
                        </Link>
                        <p className="text-primary font-black text-sm mt-1">${itemPrice}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button 
                        onClick={() => {
                          addToCart(item.id, 1);
                          removeFromWishlist(item.id);
                        }}
                        className="bg-primary text-white px-3 py-1.5 rounded-xl text-[11px] font-bold hover:bg-primary-hover transition-all cursor-pointer"
                      >
                        Add to Cart
                      </button>
                      <button onClick={() => removeFromWishlist(item.id)} className="text-muted hover:text-badge-red text-[10px] font-semibold text-center cursor-pointer">
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}