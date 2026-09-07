"use client";
import { useState, useEffect, useRef } from "react";
import { Zap } from "lucide-react";
import ProductSkeleton from "../ui/ProductSkeleton";
import Link from "next/link";
import { useStoreSettings } from "@/store/useStoreSettings";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

export default function FlashSale({
  products,
  isLoading,
}: {
  products: any;
  isLoading: boolean;
}) {
  const { currencySymbol } = useStoreSettings();
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30,
  });
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { addToWishlist, wishlistItems, removeFromWishlist } =
    useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = async (product: any) => {
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1);
      setAddingId(null);
      setAddedId(product.id);
      setTimeout(() => {
        setAddedId(null);
      }, 2000);
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

  const validProducts = Array.isArray(products)
    ? products
    : products?.results || products?.data || [];

  return (
    <section className="my-8 md:my-12 mx-3 sm:mx-0 bg-card rounded-[2rem] md:rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden relative border border-card-border group font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] h-28 bg-primary/5 blur-[90px] pointer-events-none"></div>

      {/* Header Section */}
      <div className="px-4 sm:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between text-foreground relative z-10 gap-3 lg:gap-6">
        <div className="flex-1 w-full mb-1 lg:mb-0">
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-green-700 tracking-tight whitespace-nowrap">
              Flash Sale
            </h2>
            <Zap
              size={20}
              className="text-green-700/80 fill-green-500/80 shrink-0 md:w-7 md:h-7"
            />
          </div>

          <p className="text-slate-500 text-[11px] sm:text-base font-medium mt-1 md:mt-2">
            Limited time offers on handpicked premium choices
          </p>
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-6 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-1.5 sm:gap-3 bg-card-border/30 border border-card-border px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shrink-0">
            <span className="font-bold text-[9px] sm:text-[11px] text-muted uppercase tracking-widest hidden sm:inline-block">
              Ends in
            </span>
            <span className="font-bold text-[9px] text-muted uppercase tracking-widest sm:hidden">
              Ends
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1.5 text-foreground font-black text-[10px] sm:text-sm">
              <div className="bg-card px-1 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-md min-w-[20px] sm:min-w-[32px] text-center border border-card-border">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <span className="text-primary font-bold">:</span>
              <div className="bg-card px-1 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-md min-w-[20px] sm:min-w-[32px] text-center border border-card-border">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <span className="text-primary font-bold">:</span>
              <div className="bg-primary text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-md min-w-[20px] sm:min-w-[32px] text-center">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
            </div>
          </div>

          <Link
            href="/products"
            className="flex lg:hidden xl:flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-primary hover:text-primary-hover transition-all group/link whitespace-nowrap"
          >
            <span>View All</span>
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover/link:translate-x-1 transition-transform"
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
      </div>

      <div className="px-3 sm:px-8 pb-5 sm:pb-8 pt-1 relative z-10">
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-card/90 backdrop-blur-md border border-card-border rounded-full items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
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
          className="flex overflow-x-auto gap-3 sm:gap-5 pb-3 sm:pb-4 snap-x snap-mandatory custom-scrollbar scroll-smooth hide-scroll-bar"
        >
          {isLoading
            ? Array(5)
                .fill(0)
                .map((_, i) => <ProductSkeleton key={i} />)
            : validProducts?.slice(0, 10).map((product: any) => {
                const currentPrice = Math.round(Number(product.unit_price));
                const originalPrice = Math.round(
                  Number(product.unit_price) * 2,
                );
                const isWishlisted = wishlistItems.some(
                  (item: any) => item.id === product.id,
                );
                const isThisAdding = addingId === product.id;
                const isThisAdded = addedId === product.id;

                return (
                  <div
                    key={product.id}
                    className="snap-start group/card relative bg-card rounded-2xl sm:rounded-[1.75rem] border border-card-border hover:border-card-hoverBorder shadow-2xs hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full min-w-[145px] max-w-[145px] sm:min-w-[220px] sm:max-w-[235px] shrink-0"
                  >
                    <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between z-20">
                      <span className="bg-badge-red text-white text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full tracking-wider shadow-sm uppercase">
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
                      {/* 🟢 Dynamic Image Rendering Fix */}
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
                            ? `${product.inventory * 15} sold`
                            : "Hot Deal"}
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

                        <button
                          disabled={isThisAdding || isThisAdded}
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className={`w-full py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[9px] sm:text-xs shadow-sm transition-all duration-300 md:hover:scale-[1.02] active:scale-95 text-center cursor-pointer tracking-wide flex items-center justify-center gap-1 sm:gap-1.5 ${
                            isThisAdded
                              ? "bg-emerald-500 text-white"
                              : "bg-primary text-white md:hover:bg-primary-hover"
                          }`}
                        >
                          {isThisAdding ? (
                            <>
                              <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Adding...
                            </>
                          ) : isThisAdded ? (
                            <>
                              <svg
                                className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
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
                              Added!
                            </>
                          ) : (
                            "Add to Cart"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-card/90 backdrop-blur-md border border-card-border rounded-full items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
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