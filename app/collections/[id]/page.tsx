// frontend/src/app/collections/[id]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { Product } from "@/types/product";
import Link from "next/link";

export default function CollectionProductsPage() {
  const params = useParams();
  const collectionId = params.id;

  const {
    data: products,
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["products", collectionId],
    queryFn: () =>
      apiClient
        .get(`/products/?collection_id=${collectionId}`)
        .then((res) => res.data),
  });

  if (isLoading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted font-medium tracking-wide">
            Loading collection items...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-card border border-card-border p-8 rounded-[2rem] shadow-sm max-w-md mx-auto">
          <p className="text-sm font-bold text-rose-500 mb-2">
            Failed to load products.
          </p>
          <p className="text-xs text-muted">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 border-b border-card-border pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase font-black text-primary tracking-[0.2em] bg-primary-light px-3 py-1 rounded-md mb-2 inline-block">
            Collection Showcase
          </span>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Explore Collection Items
          </h1>
        </div>
        <div className="bg-card border border-card-border px-4 py-2 rounded-xl shadow-xs">
          <p className="text-xs font-bold text-muted">
            {products?.length || 0} items available
          </p>
        </div>
      </div>

      {products?.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-[2rem] border border-card-border shadow-sm">
          <div className="w-16 h-16 bg-primary-light text-primary rounded-2xl flex items-center justify-center mx-auto text-2xl mb-4">
            📦
          </div>
          <p className="text-base font-bold text-foreground">
            No products found in this category.
          </p>
          <p className="text-xs text-muted mt-1">
            Check back later for exciting new additions!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products?.map((product) => {
            const currentPrice = Math.round(Number(product.unit_price));
            const originalPrice = Math.round(Number(product.unit_price) * 1.35);

            return (
              <div
                key={product.id}
                className="group relative bg-card rounded-[1.5rem] border border-card-border hover:border-card-hoverBorder shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.15)] transition-all duration-500 overflow-hidden flex flex-col h-full"
              >
                {/* Top Discount Badge & Wishlist */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider shadow-md shadow-rose-500/20">
                    -27%
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Wishlist clicked");
                    }}
                    className="w-7 h-7 rounded-full bg-card/80 backdrop-blur-md border border-card-border flex items-center justify-center text-muted hover:text-rose-500 hover:scale-110 transition-all shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* Product Image Area with Link */}
                <Link href={`/products/${product.id}`} className="w-full h-44 bg-[#f8f9fa] flex items-center justify-center text-5xl relative overflow-hidden transition-all duration-500 group-hover:bg-primary-light block">
                  <span className="transform transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-2">
                    📦
                  </span>
                </Link>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-grow bg-card z-0">
                  <Link href={`/products/${product.id}`} className="block mb-1.5">
                    <h2 className="text-xs font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {product.title}
                    </h2>
                  </Link>

                  {/* Rating & Stock Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-yellow-400 text-[10px] gap-0.5">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-md">
                      Stock: {product.inventory}
                    </span>
                  </div>

                  {/* Price & Add to Cart Button */}
                  <div className="mt-auto flex flex-col gap-2.5 pt-2 border-t border-card-border/60">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-primary tracking-tight">
                        ${currentPrice}
                      </span>
                      <span className="text-xs text-muted line-through font-medium">
                        ${originalPrice}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log(`Added ${product.title} to cart!`);
                      }}
                      className="w-full bg-primary text-white py-2 rounded-xl font-bold text-xs shadow-md hover:bg-primary-hover transition-transform hover:scale-[1.02] active:scale-95 text-center"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}