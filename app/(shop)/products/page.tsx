"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useStoreSettings } from "@/store/useStoreSettings";
import AddToCartButton from "@/components/ui/AddToCartButton";

export default function ProductsPage() {
  const { currencySymbol } = useStoreSettings();
  const [page, setPage] = useState(1);

  const { addToWishlist, wishlistItems, removeFromWishlist } =
    useWishlistStore();

  const { data, isLoading } = useQuery({
    queryKey: ["all_products_page", page],
    queryFn: async () => {
      const res = await apiClient.get(`/store/products/?page=${page}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = Array.isArray(data) ? data : data?.results || [];
  const totalCount = data?.count || 0;
  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 min-h-screen font-sans">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        {/* <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">All Products</h1> */}
        {/* <span className="text-[10px] sm:text-xs font-bold text-muted bg-card-border/40 px-3 py-1.5 rounded-xl border border-card-border whitespace-nowrap"> */}
        {/* Total: {totalCount} */}
        {/* </span> */}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 md:gap-6">
        {products.map((product: any) => {
          const currentPrice = Math.round(Number(product.unit_price));
          const originalPrice = Math.round(Number(product.unit_price) * 1.35);
          const isWishlisted = wishlistItems.some(
            (item: any) => item.id === product.id,
          );

          return (
            <div
              key={product.id}
              className="group/card relative bg-card rounded-2xl sm:rounded-[1.75rem] border border-card-border hover:border-card-hoverBorder shadow-2xs hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 right-2.5 sm:right-3.5 flex items-center justify-between z-20">
                <span className="bg-badge-red text-white text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full tracking-wider shadow-sm uppercase">
                  -35%
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
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full backdrop-blur-md border border-card-border flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                    isWishlisted
                      ? "bg-badge-red text-white border-badge-red"
                      : "bg-white/90 text-muted hover:text-badge-red md:hover:scale-110"
                  }`}
                >
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                    fill={isWishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <Link
                href={`/products/${product.id}`}
                className="w-full h-28 sm:h-44 bg-[#fafbfc] flex items-center justify-center text-4xl sm:text-5xl relative overflow-hidden transition-all duration-500 md:group-hover/card:bg-primary-light/60 block"
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].image}
                    alt={product.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 md:group-hover/card:scale-110"
                  />
                ) : (
                  <span className="transform transition-transform duration-700 md:group-hover/card:scale-110 md:group-hover/card:-translate-y-2">
                    📦
                  </span>
                )}
              </Link>

              <div className="p-3 sm:p-4 flex flex-col flex-grow bg-card z-0">
                <Link
                  href={`/products/${product.id}`}
                  className="block mb-1.5 sm:mb-2"
                >
                  <h3 className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-2 leading-tight sm:leading-relaxed tracking-tight group-hover/card:text-primary transition-colors">
                    {product.title}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
                  <div className="flex items-center text-yellow-400 text-[8px] sm:text-[10px] gap-0.5">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-medium text-muted tracking-tight">
                    {product.inventory > 0
                      ? `${product.inventory * 15} sold`
                      : "Hot Deal"}
                  </span>
                </div>

                <div className="mt-auto flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-2.5 border-t border-card-border/60">
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <span className="text-sm sm:text-base font-extrabold text-primary tracking-tight">
                      {currencySymbol}
                      {currentPrice}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted line-through font-normal">
                      {currencySymbol}
                      {originalPrice}
                    </span>
                  </div>

                  <AddToCartButton product={product} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 sm:mt-12">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs bg-card border border-card-border text-foreground md:hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
        >
          Previous
        </button>

        <span className="text-[10px] sm:text-xs font-bold text-muted px-2 sm:px-4">
          Page <span className="text-primary">{page}</span> of {totalPages || 1}
        </span>

        <button
          onClick={() => setPage((prev) => (data?.next ? prev + 1 : prev))}
          disabled={!data?.next}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs bg-primary text-white md:hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
        >
          Next
        </button>
      </div>
    </main>
  );
}
