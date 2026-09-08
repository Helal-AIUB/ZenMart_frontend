"use client";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import ProductSkeleton from "../ui/ProductSkeleton";
import Link from "next/link";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useStoreSettings } from "@/store/useStoreSettings";
import { PawPrint } from "lucide-react";
import AddToCartButton from "@/components/ui/AddToCartButton";

export default function NewArrivals() {
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all",
  );
  const { currencySymbol } = useStoreSettings();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { addToWishlist, wishlistItems, removeFromWishlist } =
    useWishlistStore();

  const { data: collections = [] } = useQuery({
    queryKey: ["home_collections"],
    queryFn: async () => {
      const res = await apiClient.get("/store/collections/");
      return res.data.results || res.data;
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["filtered_products", selectedCategory],
    queryFn: async () => {
      const endpoint =
        selectedCategory === "all"
          ? "store/products/"
          : `store/products/?collection_id=${selectedCategory}`;
      const res = await apiClient.get(endpoint);
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  const validProducts = Array.isArray(productsData)
    ? productsData
    : productsData?.results || productsData?.data || [];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="my-8 md:my-14 mx-3 sm:mx-0 bg-card rounded-[2rem] md:rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden relative border border-card-border group font-sans p-5 sm:p-8">
      <div className="absolute top-0 right-1/4 w-[90%] md:w-[60%] h-28 bg-primary/5 blur-[90px] pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 relative z-10 w-full">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-700 tracking-tight whitespace-nowrap">
              New Arrivals
            </h2>
            <PawPrint className="w-5 h-5 md:w-7 md:h-7 text-green-500/80 fill-green-500/20 shrink-0" />
          </div>
          
          <p className="text-slate-500 text-[11px] sm:text-base font-medium mt-1 md:mt-2">
            Explore the latest products just for you
          </p>
        </div>

        <Link
          href={
            selectedCategory === "all"
              ? "/products"
              : `/collections/${selectedCategory}`
          }
          className="group flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-bold text-green-700 bg-green-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-green-600 hover:text-white transition-all duration-300 shrink-0"
        >
          <span>View All</span>
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-3 sm:pb-4 mb-4 sm:mb-6 custom-scrollbar hide-scroll-bar relative z-10">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategory === "all"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "bg-card-border/40 text-muted hover:text-foreground border border-card-border"
          }`}
        >
          All
        </button>
        {Array.isArray(collections) &&
          collections.map((col: any) => (
            <button
              key={col.id}
              onClick={() => setSelectedCategory(col.id)}
              className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === col.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-card-border/40 text-muted hover:text-foreground border border-card-border"
              }`}
            >
              {col.title}
            </button>
          ))}
      </div>

      <div className="relative z-10">
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-card/90 backdrop-blur-md border border-card-border rounded-full items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 sm:gap-5 pb-4 snap-x snap-mandatory custom-scrollbar scroll-smooth hide-scroll-bar"
        >
          {isLoading && validProducts.length === 0 ? (
            Array(5)
              .fill(0)
              .map((_, i) => <ProductSkeleton key={i} />)
          ) : validProducts.length === 0 ? (
            <div className="w-full text-center py-12 text-muted text-xs sm:text-sm">
              No products found in this category.
            </div>
          ) : (
            validProducts.map((product: any) => {
              const currentPrice = Math.round(Number(product.unit_price));
              const originalPrice = Math.round(
                Number(product.unit_price) * 1.35,
              );
              const isWishlisted = wishlistItems.some(
                (item: any) => item.id === product.id,
              );

              return (
                <div
                  key={product.id}
                  className="snap-start group/card relative bg-card rounded-2xl sm:rounded-[1.75rem] border border-card-border hover:border-card-hoverBorder shadow-2xs hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full min-w-[145px] max-w-[145px] sm:min-w-[220px] sm:max-w-[235px] shrink-0"
                >
                  <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 z-20">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (isWishlisted) {
                          removeFromWishlist(product.id);
                        } else {
                          addToWishlist(product);
                        }
                      }}
                      className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full backdrop-blur-md border border-card-border flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                        isWishlisted
                          ? "bg-badge-red text-white border-badge-red"
                          : "bg-white/90 text-muted hover:text-badge-red md:hover:scale-110"
                      }`}
                    >
                      <svg
                        className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
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
                    className="w-full h-28 sm:h-44 bg-[#fafbfc] flex items-center justify-center text-3xl sm:text-5xl relative overflow-hidden transition-all duration-500 md:group-hover/card:bg-primary-light/60 block"
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

                  <div className="p-2.5 sm:p-4 flex flex-col flex-grow bg-card z-0">
                    <Link
                      href={`/products/${product.id}`}
                      className="block mb-1 sm:mb-2"
                    >
                      <h3 className="text-[10px] sm:text-xs font-semibold text-foreground line-clamp-2 leading-tight sm:leading-relaxed tracking-tight group-hover/card:text-primary transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mb-2 sm:mb-3.5">
                      <div className="flex items-center text-yellow-400 text-[7px] sm:text-[10px] gap-0.5">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                      <span className="text-[8px] sm:text-[10px] font-medium text-muted tracking-tight">
                        {product.inventory > 0
                          ? `${product.inventory} left`
                          : "In Stock"}
                      </span>
                    </div>

                    <div className="mt-auto flex flex-col gap-2 sm:gap-3 pt-1.5 sm:pt-2.5 border-t border-card-border/60">
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-xs sm:text-base font-extrabold text-primary tracking-tight">
                          {currencySymbol}{currentPrice}
                        </span>
                        <span className="text-[9px] sm:text-xs text-muted line-through font-normal">
                          {currencySymbol}{originalPrice}
                        </span>
                      </div>

                      <AddToCartButton 
                        product={product} 
                        className="!py-1.5 sm:!py-2.5 !text-[9px] sm:!text-xs" 
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-card/90 backdrop-blur-md border border-card-border rounded-full items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}