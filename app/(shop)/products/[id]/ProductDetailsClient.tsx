"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useStoreSettings } from "@/store/useStoreSettings";
import toast from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";

export default function ProductDetailsClient({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { currencySymbol } = useStoreSettings();
  
  // State for image gallery
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { addToCart } = useCartStore();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();

  const isWishlisted = wishlistItems.some(
    (item: any) => String(item.id) === String(productId)
  );

  const handleIncrement = () => {
    if (product && quantity < product.inventory) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);

    try {
      await addToCart(Number(productId), quantity);

      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
        setQuantity(1);
      }, 2000);

      toast.success(`${quantity}x ${product.title} added to cart`, {
        style: {
          borderRadius: "12px",
          background: "var(--foreground)",
          color: "var(--card-bg)",
          fontSize: "13px",
          fontWeight: "500",
        },
        iconTheme: { primary: "var(--primary)", secondary: "var(--card-bg)" },
      });
    } catch (error) {
      toast.error("Something went wrong! Please try again.", {
        style: {
          fontSize: "13px",
          borderRadius: "12px",
          background: "var(--card-bg)",
          color: "var(--foreground)",
        },
      });
    } finally {
      setIsAdding(false);
    }
  };

  const {
    data: product,
    isLoading: loadingProduct,
    error,
  } = useQuery<Product | any>({
    queryKey: ["product", productId],
    queryFn: () =>
      apiClient.get(`/store/products/${productId}/`).then((res) => res.data),
  });

  const { data: relatedProducts, isLoading: loadingRelated } = useQuery<Product[]>({
    queryKey: ["related_products", product?.collection],
    queryFn: () =>
      apiClient
        .get(`/store/products/?collection_id=${product?.collection}`)
        .then((res) => {
          if (res.data && res.data.results) {
            return res.data.results;
          }
          if (Array.isArray(res.data)) {
            return res.data;
          }
          return [];
        }),
    enabled: !!product?.collection,
  });

  const similarItems = Array.isArray(relatedProducts)
    ? relatedProducts.filter((p: Product) => String(p.id) !== String(productId)).slice(0, 4)
    : [];

  // Handlers for Next/Prev Image Buttons
  const handleNextImage = () => {
    if (product?.images && product.images.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const handlePrevImage = () => {
    if (product?.images && product.images.length > 0) {
      setActiveImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loadingProduct)
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted font-medium tracking-wide">
            Loading product details...
          </p>
        </div>
      </div>
    );

  if (error || !product)
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center font-sans">
        <div className="bg-card border border-card-border p-8 rounded-[2rem] shadow-sm max-w-md mx-auto">
          <p className="text-sm font-bold text-rose-500 mb-2">
            Product not found.
          </p>
          <Link
            href="/"
            className="text-xs text-primary font-bold hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );

  const currentPrice = Math.round(Number(product.unit_price));
  const originalPrice = Math.round(Number(product.unit_price) * 1.35);

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-28 min-h-screen font-sans">
      <div className="mb-6 text-xs font-semibold text-muted flex items-center gap-2">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary transition-colors">
          Shop
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-card rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-card-border p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 relative overflow-hidden">
            
            <div className="md:col-span-6 flex flex-col gap-4">
              <div className="bg-[#f8f9fa] rounded-[2rem] h-[360px] flex items-center justify-center text-7xl border border-card-border relative overflow-hidden group">
                <span className="absolute top-4 left-4 bg-badge-red text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm z-10">
                  -27% OFF
                </span>

                <button
                  onClick={() => {
                    if (isWishlisted) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist(product);
                    }
                  }}
                  className={`absolute top-4 right-4 w-9 h-9 rounded-full backdrop-blur-md border border-card-border flex items-center justify-center transition-all shadow-xs cursor-pointer z-20 ${
                    isWishlisted
                      ? "bg-badge-red text-white border-badge-red"
                      : "bg-white text-muted hover:text-badge-red hover:scale-110"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
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

                {/* Main Product Image */}
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[activeImageIndex].image}
                    alt={product.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 z-0"
                  />
                ) : (
                  <span className="transform transition-transform duration-700 group-hover:scale-110 z-0">
                    📦
                  </span>
                )}

                {/* Prev & Next Buttons */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border border-card-border flex items-center justify-center text-xs shadow-xs hover:bg-primary hover:text-white transition-all cursor-pointer z-20"
                    >
                      ❮
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border border-card-border flex items-center justify-center text-xs shadow-xs hover:bg-primary hover:text-white transition-all cursor-pointer z-20"
                    >
                      ❯
                    </button>
                  </>
                )}
              </div>

              {/* Dynamic Image Thumbnails */}
              <div className="grid grid-cols-4 gap-3">
                {product.images && product.images.length > 0 ? (
                  product.images.map((imgObj: any, index: number) => (
                    <button
                      key={imgObj.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={`h-20 bg-[#f8f9fa] rounded-2xl border-2 overflow-hidden flex items-center justify-center cursor-pointer shadow-2xs transition-all ${
                        activeImageIndex === index 
                          ? "border-primary" 
                          : "border-transparent hover:border-card-border"
                      }`}
                    >
                      <img 
                        src={imgObj.image} 
                        alt={`${product.title} Thumbnail`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))
                ) : (
                  [1, 2, 3].map((_, i) => (
                    <div key={i} className="h-20 bg-[#f8f9fa] rounded-2xl border-2 border-transparent opacity-50 flex items-center justify-center text-2xl shadow-2xs">
                      📦
                    </div>
                  ))
                )}
                
                {/* Optional: Show remaining count if more than 3/4 images */}
                {product.images && product.images.length > 4 && (
                  <div className="h-20 bg-[#f8f9fa] rounded-2xl border border-dashed border-card-border flex items-center justify-center text-xs font-bold text-muted cursor-pointer hover:border-primary transition-colors">
                    +{product.images.length - 4}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em] bg-primary-light px-3 py-1 rounded-md inline-block mb-3">
                  PRODUCT ID: #{product.id}
                </span>

                <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3 leading-tight tracking-tight">
                  {product.title}
                </h1>

                <div className="flex items-center gap-2 mb-4 text-xs">
                  <div className="flex items-center text-yellow-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-muted font-medium hover:text-primary transition-colors cursor-pointer">
                    (24 Reviews)
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-card-border/60">
                  <span className="text-3xl font-black text-primary tracking-tight">
                    {currencySymbol}{currentPrice}
                  </span>
                  <span className="text-sm text-muted line-through font-medium">
                    {currencySymbol}{originalPrice}
                  </span>
                  {product.inventory > 0 ? (
                    <span className="ml-auto text-emerald-600 font-bold px-2.5 py-1 rounded-lg text-[11px] bg-emerald-50 border border-emerald-100">
                      In Stock ({product.inventory})
                    </span>
                  ) : (
                    <span className="ml-auto text-rose-500 font-bold px-2.5 py-1 rounded-lg text-[11px] bg-rose-50 border border-rose-100">
                      Out of Stock
                    </span>
                  )}
                </div>

                <p className="text-muted text-xs sm:text-sm mb-6 leading-relaxed">
                  {product.description
                    ? product.description
                    : "volutpat in congue etiam justo etiam pretium iaculis justo in hac habitasse platea dictumst etiam faucibus."}
                </p>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-primary-light/40 border border-card-border mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-foreground">Free Shipping</span>
                    <span className="text-[9px] text-muted">Orders over $50</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-foreground">30 Days Returns</span>
                    <span className="text-[9px] text-muted">Hassle free returns</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-foreground">Secure Payment</span>
                    <span className="text-[9px] text-muted">100% secure checkout</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-black uppercase text-foreground tracking-wider mb-1">
                    Key Features
                  </h4>
                  {["High quality product", "Durable and reliable", "Premium materials", "1 Year warranty"].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted font-medium">
                      <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <div className="bg-card rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-card-border p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-card-border">
              <h3 className="text-base font-black text-foreground uppercase tracking-wider">
                Similar Products
              </h3>
              {product.collection && (
                <Link
                  href={`/products?collection_id=${product.collection}`}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View all
                </Link>
              )}
            </div>

            {loadingRelated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3 animate-pulse p-4 bg-gray-50 rounded-2xl">
                    <div className="h-32 bg-card-border/40 rounded-xl"></div>
                    <div className="h-3 bg-card-border/40 rounded w-full"></div>
                    <div className="h-3 bg-card-border/40 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : similarItems && similarItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {similarItems.map((item) => {
                  const itemPrice = Math.round(Number(item.unit_price));
                  const itemOriginal = Math.round(itemPrice * 1.35);
                  return (
                    <Link
                      href={`/products/${item.id}`}
                      key={item.id}
                      className="flex flex-col gap-3 p-4 rounded-2xl bg-[#f8f9fa] hover:bg-primary-light/40 border border-card-border transition-all group"
                    >
                      <div className="w-full h-32 bg-white rounded-xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform border border-card-border overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                           <img src={item.images[0].image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                           <span>📦</span>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 justify-between">
                        <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center text-yellow-400 text-[10px] gap-0.5 mb-2">
                          {[...Array(5)].map((_, idx) => (
                            <span key={idx}>★</span>
                          ))}
                          <span className="text-muted ml-1 font-medium">(18)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-black text-sm">
                            ${itemPrice}
                          </span>
                          <span className="text-xs text-muted line-through">
                            ${itemOriginal}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted py-6 text-center font-medium">
                No similar products found.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-card-border p-6 sticky top-28">
            <h3 className="text-sm font-black text-foreground mb-4 pb-3 border-b border-card-border uppercase tracking-wider">
              Purchase Options
            </h3>

            <div className="flex flex-col gap-2 mb-4">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Quantity
              </span>
              <div className="flex items-center justify-between bg-[#f8f9fa] border border-card-border rounded-2xl p-1 shadow-2xs">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isAdding}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-lg font-bold text-foreground hover:bg-white hover:shadow-xs disabled:opacity-40 transition-all cursor-pointer"
                >
                  −
                </button>
                <span className="text-center font-black text-foreground text-base">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={
                    product.inventory === 0 ||
                    quantity >= product.inventory ||
                    isAdding
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-lg font-bold text-foreground hover:bg-white hover:shadow-xs disabled:opacity-40 transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 p-3 rounded-2xl bg-gray-50 border border-card-border">
              <span className="text-xs text-muted font-bold uppercase tracking-wider">
                Total Price
              </span>
              <span className="text-xl font-black text-foreground">
                ${currentPrice * quantity}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                disabled={product.inventory === 0 || isAdding || isAdded}
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-2xl font-black text-xs tracking-wide transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  isAdded
                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                    : product.inventory > 0 && !isAdding
                    ? "bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:-translate-y-0.5"
                    : "bg-primary-light text-primary cursor-not-allowed shadow-none"
                }`}
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding to Cart...
                  </>
                ) : isAdded ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Product Added!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {product.inventory > 0 ? "Add to Cart" : "Out of Stock"}
                  </>
                )}
              </button>

              <button className="w-full py-3.5 rounded-2xl font-black text-xs tracking-wide bg-card border border-card-border text-foreground hover:bg-primary-light hover:text-primary transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer">
                ⚡ Buy Now
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}