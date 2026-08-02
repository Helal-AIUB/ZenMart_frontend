"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id;
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false); 
  const [isAdded, setIsAdded] = useState(false);

  const { addToCart } = useCartStore();

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

  // 1. Fetch Main Product
  const {
    data: product,
    isLoading: loadingProduct,
    error,
  } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () =>
      apiClient.get(`/products/${productId}/`).then((res) => res.data),
  });

  // 2. Fetch Related Products (FIXED: Added safety checks to prevent undefined error)
  const { data: relatedProducts, isLoading: loadingRelated } = useQuery<Product[]>({
    queryKey: ["related_products", product?.collection],
    queryFn: () =>
      apiClient
        .get(`/products/?collection_id=${product?.collection}`)
        .then((res) => {
          // যদি পেজিনেটেড API হয়, তাহলে results রিটার্ন করবে
          if (res.data && res.data.results) {
            return res.data.results;
          }
          // যদি পেজিনেটেড না হয়ে সরাসরি অ্যারে আসে
          if (Array.isArray(res.data)) {
            return res.data;
          }
          // কোনো ডেটা না পেলে বা অন্য কোনো ফরম্যাট হলে ফাঁকা অ্যারে রিটার্ন করবে
          return [];
        }),
    enabled: !!product?.collection,
  });

  // Filter out the current product from the related list and grab top 5 (FIXED: Array check)
  const similarItems = Array.isArray(relatedProducts)
    ? relatedProducts.filter((p: Product) => String(p.id) !== String(productId)).slice(0, 5)
    : [];

  if (loadingProduct)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 text-xs font-semibold text-muted flex items-center gap-2">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold">{product.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN: Main Product Details */}
        <div className="lg:w-3/4">
          <div className="bg-card rounded-[2.5rem] shadow-sm border border-card-border p-6 md:p-10 flex flex-col md:flex-row gap-10">
            {/* Product Image Area */}
            <div className="md:w-5/12 bg-[#f8f9fa] rounded-[2rem] min-h-[380px] flex items-center justify-center text-8xl border border-card-border relative overflow-hidden group">
              <span className="transform transition-transform duration-700 group-hover:scale-110">
                📦
              </span>
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                -27% OFF
              </span>
            </div>

            {/* Product Info Area */}
            <div className="md:w-7/12 flex flex-col justify-between pt-2">
              <div>
                <div className="mb-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary-light px-3 py-1 rounded-md inline-block">
                  Product ID: #{product.id}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight tracking-tight">
                  {product.title}
                </h1>

                {/* Ratings & Reviews */}
                <div className="flex items-center gap-3 mb-6 text-xs">
                  <div className="flex items-center text-yellow-400 gap-0.5">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                  <span className="text-primary font-bold hover:underline cursor-pointer">
                    (24 Reviews)
                  </span>
                </div>

                <div className="w-full h-px bg-card-border mb-6"></div>

                {/* Price & Stock area */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-black text-primary tracking-tight">
                    ${currentPrice}
                  </span>
                  <span className="text-base text-muted line-through font-medium">
                    ${originalPrice}
                  </span>
                  {product.inventory > 0 ? (
                    <span className="text-teal-700 font-bold px-3 py-1 rounded-xl text-xs bg-primary-light border border-card-border">
                      In Stock ({product.inventory})
                    </span>
                  ) : (
                    <span className="text-rose-500 font-bold px-3 py-1 rounded-xl text-xs bg-rose-50 border border-rose-200">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-muted text-sm mb-8 leading-relaxed">
                  {product.description
                    ? product.description
                    : "Experience premium quality with this exclusive item. Designed carefully to elevate your daily lifestyle with top-notch durability and exceptional craftsmanship."}
                </p>
              </div>

              <div className="flex flex-col gap-6 mt-auto pt-6 border-t border-card-border">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-muted uppercase tracking-wider">
                    Quantity
                  </span>
                  <div className="flex items-center bg-[#f8f9fa] border border-card-border rounded-2xl p-1 shadow-sm">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1 || isAdding}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-lg font-medium text-foreground hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-black text-foreground text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={
                        product.inventory === 0 ||
                        quantity >= product.inventory ||
                        isAdding
                      }
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-lg font-medium text-foreground hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all"
                    >
                      +
                    </button>
                  </div>

                  {/* Total Price Preview */}
                  <div className="ml-auto text-right">
                    <span className="text-xs text-muted font-semibold block uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-xl font-black text-foreground">
                      ${currentPrice * quantity}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    disabled={product.inventory === 0 || isAdding || isAdded}
                    onClick={handleAddToCart}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm tracking-wide transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                      isAdded
                        ? "bg-emerald-500 text-white shadow-emerald-500/30"
                        : product.inventory > 0 && !isAdding
                          ? "bg-primary text-white hover:bg-primary-hover hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                          : "bg-primary-light text-primary cursor-not-allowed shadow-none"
                    }`}
                  >
                    {isAdding ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Adding to Cart...
                      </>
                    ) : isAdded ? (
                      <>
                        <svg
                          className="w-5 h-5"
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
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {product.inventory > 0 ? "Add to Cart" : "Out of Stock"}
                      </>
                    )}
                  </button>

                  <button className="w-14 h-14 shrink-0 rounded-2xl bg-card border-2 border-card-border flex items-center justify-center text-muted hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Similar Products */}
        <div className="lg:w-1/4">
          <div className="bg-card rounded-[2rem] shadow-sm border border-card-border p-5 sticky top-28">
            <h3 className="text-sm font-black text-foreground mb-4 pb-3 border-b border-card-border uppercase tracking-wider">
              Similar Products
            </h3>

            {loadingRelated ? (
              <div className="space-y-4">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-16 h-16 bg-card-border/40 rounded-xl"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-card-border/40 rounded w-full"></div>
                        <div className="h-3 bg-card-border/40 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : similarItems && similarItems.length > 0 ? (
              <div className="flex flex-col gap-3">
                {similarItems.map((item) => {
                  const itemPrice = Math.round(Number(item.unit_price));
                  return (
                    <Link
                      href={`/products/${item.id}`}
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-primary-light border border-transparent hover:border-card-hoverBorder transition-all group"
                    >
                      <div className="w-14 h-14 bg-[#f8f9fa] rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform border border-card-border">
                        📦
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-1">
                          {item.title}
                        </h4>
                        <span className="text-primary font-black text-xs">
                          ${itemPrice}
                        </span>
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

            {similarItems && similarItems.length > 0 && product.collection && (
              <div className="mt-5 pt-3 border-t border-card-border">
                <Link
                  href={`/collections/${product.collection}`}
                  className="block text-center text-xs font-bold text-primary hover:opacity-85 transition-opacity"
                >
                  View full collection &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}