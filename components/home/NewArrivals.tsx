// frontend/src/components/home/NewArrivals.tsx
"use client";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import ProductSkeleton from "../ui/ProductSkeleton";
import Link from "next/link";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

export default function NewArrivals() {
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all",
  );
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { addToWishlist, wishlistItems, removeFromWishlist } =
    useWishlistStore();
  const { addToCart } = useCartStore();

  // Fetch Categories/Collections for Tabs
  const { data: collections = [] } = useQuery({
    queryKey: ["home_collections"],
    queryFn: async () => {
      const res = await apiClient.get("/collections/");
      return res.data.results || res.data;
    },
  });

  // Fetch Products dynamically based on selected collection
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["filtered_products", selectedCategory],
    queryFn: async () => {
      const endpoint =
        selectedCategory === "all"
          ? "/products/"
          : `/products/?collection_id=${selectedCategory}`;
      const res = await apiClient.get(endpoint);
      return res.data;
    },
  });

  const validProducts = Array.isArray(productsData)
    ? productsData
    : productsData?.results || productsData?.data || [];

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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="my-14 bg-card rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden relative border border-card-border group font-sans p-8">
      <div className="absolute top-0 right-1/4 w-[60%] h-28 bg-primary/5 blur-[90px] pointer-events-none"></div>

      {/* Header & View All */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            New Arrivals
          </h2>
          <p className="text-muted text-xs sm:text-sm font-normal tracking-wide mt-0.5">
            Explore the latest products just for you
          </p>
        </div>

        <Link
          href={
            selectedCategory === "all"
              ? "/products"
              : `/collections/${selectedCategory}`
          }
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-all group/link cursor-pointer"
        >
          <span>View All</span>
          <svg
            className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform"
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

      {/* Category Filter Pills / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar hide-scroll-bar relative z-10">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
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
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === col.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-card-border/40 text-muted hover:text-foreground border border-card-border"
              }`}
            >
              {col.title}
            </button>
          ))}
      </div>

      {/* Products Slider / Container */}
      <div className="relative z-10">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-card/90 backdrop-blur-md border border-card-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
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
          className="flex overflow-x-auto gap-5 pb-4 snap-x custom-scrollbar scroll-smooth hide-scroll-bar"
        >
          {isLoading ? (
            Array(5)
              .fill(0)
              .map((_, i) => <ProductSkeleton key={i} />)
          ) : validProducts.length === 0 ? (
            <div className="w-full text-center py-12 text-muted text-sm">
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
              const isThisAdding = addingId === product.id;
              const isThisAdded = addedId === product.id;

              return (
                <div
                  key={product.id}
                  className="group/card relative bg-card rounded-[1.75rem] border border-card-border hover:border-card-hoverBorder shadow-2xs hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full min-w-[220px] max-w-[235px] shrink-0"
                >
                  {/* Wishlist Button */}
                  <div className="absolute top-3.5 right-3.5 z-20">
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
                        isWishlisted
                          ? "bg-badge-red text-white border-badge-red"
                          : "bg-white/90 text-muted hover:text-badge-red hover:scale-110"
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
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

                  {/* Product Image Link */}
                  <Link
                    href={`/products/${product.id}`}
                    className="w-full h-44 bg-[#fafbfc] flex items-center justify-center text-5xl relative overflow-hidden transition-all duration-500 group-hover/card:bg-primary-light/60 block"
                  >
                    <span className="transform transition-transform duration-700 group-hover/card:scale-110 group-hover/card:-translate-y-2">
                      📦
                    </span>
                  </Link>

                  {/* Product Details */}
                  <div className="p-4 flex flex-col flex-grow bg-card z-0">
                    <Link
                      href={`/products/${product.id}`}
                      className="block mb-2"
                    >
                      <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed tracking-tight group-hover/card:text-primary transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center text-yellow-400 text-[10px] gap-0.5">
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                      </div>
                      <span className="text-[10px] font-medium text-muted tracking-tight">
                        {product.inventory > 0
                          ? `${product.inventory} left`
                          : "In Stock"}
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
                            ? "bg-emerald-500 text-white"
                            : "bg-primary text-white hover:bg-primary-hover"
                        }`}
                      >
                        {isThisAdding ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Adding...
                          </>
                        ) : isThisAdded ? (
                          <>
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Product Added!
                          </>
                        ) : (
                          "Add to Cart"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-card/90 backdrop-blur-md border border-card-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
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