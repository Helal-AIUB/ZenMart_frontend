'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import Link from 'next/link';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);

  const { addToWishlist, wishlistItems, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  // Fetch products based on current page
  const { data, isLoading } = useQuery({
    queryKey: ['all_products_page', page],
    queryFn: async () => {
      const res = await apiClient.get(`/store/products/?page=${page}`);
      return res.data;
    },
  });

  const products = Array.isArray(data) ? data : data?.results || [];
  const totalCount = data?.count || 0;
  const pageSize = 10; 
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleAddToCart = async (product: any) => {
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1);
      setAddingId(null);
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 2000);
    } catch (error) {
      setAddingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-28 min-h-screen font-sans">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-foreground">All Products</h1>
        <span className="text-xs font-bold text-muted bg-card-border/40 px-3 py-1.5 rounded-xl border border-card-border">
          Total Products: {totalCount}
        </span>
      </div>

      {/* Product Grid - Keeping exact same design as Flash Sale card */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products.map((product: any) => {
          const currentPrice = Math.round(Number(product.unit_price));
          const originalPrice = Math.round(Number(product.unit_price) * 2);
          const isWishlisted = wishlistItems.some((item: any) => item.id === product.id);
          const isThisAdding = addingId === product.id;
          const isThisAdded = addedId === product.id;

          return (
            <div 
              key={product.id} 
              className="group/card relative bg-card rounded-[1.75rem] border border-card-border hover:border-card-hoverBorder shadow-2xs hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full"
            >
              {/* Badge & Wishlist */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20">
                <span className="bg-badge-red text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider shadow-sm uppercase">
                  -50%
                </span>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (isWishlisted) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist(product);
                    }
                  }}
                  className={`w-7 h-7 rounded-full backdrop-blur-md border border-card-border flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                    isWishlisted ? 'bg-badge-red text-white border-badge-red' : 'bg-white/90 text-muted hover:text-badge-red hover:scale-110'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Product Image Area */}
              <Link href={`/products/${product.id}`} className="w-full h-44 bg-[#fafbfc] flex items-center justify-center text-5xl relative overflow-hidden transition-all duration-500 group-hover/card:bg-primary-light/60 block">
                <span className="transform transition-transform duration-700 group-hover/card:scale-110 group-hover/card:-translate-y-2">📦</span>
              </Link>

              {/* Product Info */}
              <div className="p-4 flex flex-col flex-grow bg-card z-0">
                <Link href={`/products/${product.id}`} className="block mb-2">
                  <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed tracking-tight group-hover/card:text-primary transition-colors">
                    {product.title}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center text-yellow-400 text-[10px] gap-0.5">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <span className="text-[10px] font-medium text-muted tracking-tight">
                    {product.inventory > 0 ? `${product.inventory * 15} sold` : 'Hot Deal'}
                  </span>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-2.5 border-t border-card-border/60">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-primary tracking-tight">
                      ${currentPrice}
                    </span>
                    <span className="text-xs text-muted line-through font-normal">
                      ${originalPrice}
                    </span>
                  </div>

                  <button 
                    disabled={isThisAdding || isThisAdded}
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(product);
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 text-center cursor-pointer tracking-wide flex items-center justify-center gap-1.5 ${
                      isThisAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-primary text-white hover:bg-primary-hover'
                    }`}
                  >
                    {isThisAdding ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : isThisAdded ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Product Added!
                      </>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-3 mt-12">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-card border border-card-border text-foreground hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
        >
          Previous
        </button>

        <span className="text-xs font-bold text-muted px-4">
          Page <span className="text-primary">{page}</span> of {totalPages || 1}
        </span>

        <button
          onClick={() => setPage((prev) => (data?.next ? prev + 1 : prev))}
          disabled={!data?.next}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
        >
          Next
        </button>
      </div>
    </main>
  );
}