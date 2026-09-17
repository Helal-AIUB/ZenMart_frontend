"use client";

import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useStoreSettings } from "@/store/useStoreSettings";
import toast from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ProductReviews from "@/components/product/ProductReviews";
import { sendGAEvent } from '@next/third-parties/google';

export default function ProductDetailsClient({ 
  product, 
  relatedProducts 
}: { 
  product: any;
  relatedProducts: any[];
}) {
  const t = useTranslations("ProductDetails");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { currencySymbol } = useStoreSettings();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { addToCart } = useCartStore();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center font-sans">
        <div className="bg-card border border-card-border p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm max-w-md mx-auto">
          <p className="text-sm font-bold text-rose-500 mb-2">{t("productNotFound")}</p>
          <Link href="/" className="text-xs text-primary font-bold hover:underline">{t("backToHome")}</Link>
        </div>
      </div>
    );
  }

  const inventory = Number(product.inventory) || 0;
  const currentPrice = Math.round(Number(product.unit_price));
  const originalPrice = Math.round(Number(product.unit_price) * 1.35);

  const isWishlisted = wishlistItems.some((item: any) => String(item.id) === String(product.id));

  const handleIncrement = () => {
    if (quantity < inventory) setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    if (inventory === 0) return;
    setIsAdded(true);

    //  GA4 'add_to_cart' Event Tracking added here
    sendGAEvent({
      event: 'add_to_cart',
      value: Number(product.unit_price) * quantity,
      currency: 'BDT',
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          price: Number(product.unit_price),
          quantity: quantity
        }
      ]
    });
    
    toast.success(`${quantity}x ${product.title} ${t("addedToCartToast")}`, {
      style: { borderRadius: "12px", background: "var(--foreground)", color: "var(--card-bg)", fontSize: "13px", fontWeight: "500" },
      iconTheme: { primary: "var(--primary)", secondary: "var(--card-bg)" },
    });

    setTimeout(() => { setIsAdded(false); setQuantity(1); }, 2000);

    addToCart(product, quantity).catch(() => {
      toast.error(t("errorToast"), {
        style: { fontSize: "13px", borderRadius: "12px", background: "var(--card-bg)", color: "var(--foreground)" },
      });
    });
  };

  const similarItems = Array.isArray(relatedProducts)
    ? relatedProducts.filter((p: any) => String(p.id) !== String(product.id)).slice(0, 4)
    : [];

  const handleNextImage = () => {
    if (product?.images && product.images.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const handlePrevImage = () => {
    if (product?.images && product.images.length > 0) {
      setActiveImageIndex((prev) => prev === 0 ? product.images.length - 1 : prev - 1);
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 min-h-screen font-sans">
      <div className="mb-4 md:mb-6 text-[10px] md:text-xs font-semibold text-muted flex items-center gap-1.5 md:gap-2 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">{t("home")}</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary transition-colors">{t("shop")}</Link>
        <span>/</span>
        <span className="text-primary font-bold truncate max-w-[150px] sm:max-w-none">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* 🟢 Main Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8 relative z-10">
          
          <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-card-border p-5 sm:p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 relative overflow-hidden">
            
            {/* Product Image Gallery */}
            <div className="md:col-span-6 flex flex-col gap-3 md:gap-4 relative z-10">
              <div className="bg-[#f8f9fa] rounded-3xl md:rounded-[2rem] h-64 sm:h-[300px] md:h-[360px] flex items-center justify-center text-6xl md:text-7xl border border-card-border relative overflow-hidden group">
                <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-badge-red text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm z-10">
                  -27% {t("offBadge")}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isWishlisted) removeFromWishlist(product.id);
                    else addToWishlist(product);
                  }}
                  className={`absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-9 md:h-9 rounded-full backdrop-blur-md border border-card-border flex items-center justify-center transition-all shadow-xs cursor-pointer z-20 ${
                    isWishlisted ? "bg-badge-red text-white border-badge-red" : "bg-white text-muted hover:text-badge-red hover:scale-110"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 pointer-events-none" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                {product.images && product.images.length > 0 ? (
                  <img src={product.images[activeImageIndex].image} alt={product.title} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 z-0" />
                ) : (
                  <span className="transform transition-transform duration-700 group-hover:scale-110 z-0">📦</span>
                )}

                {product.images && product.images.length > 1 && (
                  <>
                    <button type="button" onClick={(e) => { e.preventDefault(); handlePrevImage(); }} className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 border border-card-border flex items-center justify-center text-[10px] md:text-xs shadow-md hover:bg-primary hover:text-white transition-all cursor-pointer z-20">❮</button>
                    <button type="button" onClick={(e) => { e.preventDefault(); handleNextImage(); }} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 border border-card-border flex items-center justify-center text-[10px] md:text-xs shadow-md hover:bg-primary hover:text-white transition-all cursor-pointer z-20">❯</button>
                  </>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {product.images && product.images.length > 0 ? (
                  product.images.map((imgObj: any, index: number) => (
                    <button type="button" key={imgObj.id} onClick={(e) => { e.preventDefault(); setActiveImageIndex(index); }} className={`h-16 sm:h-20 bg-[#f8f9fa] rounded-xl sm:rounded-2xl border-2 overflow-hidden flex items-center justify-center cursor-pointer shadow-2xs transition-all relative z-10 ${activeImageIndex === index ? "border-primary" : "border-transparent hover:border-card-border"}`}>
                      <img src={imgObj.image} alt={`${product.title} Thumbnail`} className="w-full h-full object-cover pointer-events-none" />
                    </button>
                  ))
                ) : (
                  [1, 2, 3].map((_, i) => <div key={i} className="h-16 sm:h-20 bg-[#f8f9fa] rounded-xl sm:rounded-2xl border-2 border-transparent opacity-50 flex items-center justify-center text-xl sm:text-2xl shadow-2xs">📦</div>)
                )}
                {product.images && product.images.length > 4 && (
                  <div className="h-16 sm:h-20 bg-[#f8f9fa] rounded-xl sm:rounded-2xl border border-dashed border-card-border flex items-center justify-center text-[10px] md:text-xs font-bold text-muted cursor-pointer hover:border-primary transition-colors">
                    +{product.images.length - 4}
                  </div>
                )}
              </div>
            </div>

            {/* Product Details Area */}
            <div className="md:col-span-6 flex flex-col justify-between relative z-10">
              <div>
                <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.15em] bg-primary-light px-2.5 py-1 rounded-md inline-block mb-2 md:mb-3">
                  {t("productId")}: #{product.id}
                </span>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary mb-2 md:mb-3 leading-tight tracking-tight">
                  {product.title}
                </h1>

                <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4 text-[10px] md:text-xs">
                  <div className="flex items-center text-yellow-400 gap-0.5">
                    {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                  </div>
                  <span className="text-muted font-medium hover:text-primary transition-colors cursor-pointer">
                    (24 {t("reviews")})
                  </span>
                </div>

                <div className="flex items-baseline gap-2 md:gap-3 mb-4">
                  <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                    {currencySymbol}{currentPrice}
                  </span>
                  <span className="text-xs md:text-sm text-muted line-through font-medium">
                    {currencySymbol}{originalPrice}
                  </span>
                  {inventory > 0 ? (
                    <span className="ml-2 md:ml-auto text-emerald-600 font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg text-[9px] md:text-[11px] bg-emerald-50 border border-emerald-100">
                      {t("inStock")} ({inventory})
                    </span>
                  ) : (
                    <span className="ml-2 md:ml-auto text-rose-500 font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg text-[9px] md:text-[11px] bg-rose-50 border border-rose-100">
                      {t("outOfStock")}
                    </span>
                  )}
                </div>

                {/* 🟢 MOBILE ONLY ACTION BLOCK (Hidden on Desktop) */}
                <div className="flex lg:hidden flex-col gap-3.5 mb-6 bg-white border border-card-border p-4 sm:p-5 rounded-2xl shadow-sm relative z-20">
                  <div className="flex items-center justify-between bg-[#f8f9fa] border border-card-border rounded-xl p-1.5 shadow-2xs">
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider ml-3">{t("quantity")}</span>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={(e) => { e.preventDefault(); handleDecrement(); }} disabled={quantity <= 1 || isAdded} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-xl font-bold text-primary shadow-sm hover:bg-primary hover:text-white disabled:opacity-40 transition-all cursor-pointer relative z-30">−</button>
                      <span className="text-center font-black text-primary text-base w-8">{quantity}</span>
                      <button type="button" onClick={(e) => { e.preventDefault(); handleIncrement(); }} disabled={inventory === 0 || quantity >= inventory || isAdded} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-xl font-bold text-primary shadow-sm hover:bg-primary hover:text-white disabled:opacity-40 transition-all cursor-pointer relative z-30">+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 border border-card-border">
                    <span className="text-[11px] text-muted font-bold uppercase tracking-wider">{t("totalPrice")}</span>
                    <span className="text-lg font-black text-primary">{currencySymbol}{currentPrice * quantity}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button type="button" disabled={inventory === 0 || isAdded} onClick={(e) => { e.preventDefault(); handleAddToCart(); }} className={`flex-1 py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer relative z-30 ${isAdded ? "bg-emerald-500 text-white shadow-emerald-500/30" : inventory > 0 ? "bg-primary text-white hover:bg-primary-hover active:scale-95" : "bg-primary-light text-primary cursor-not-allowed shadow-none"}`}>
                      {isAdded ? (<><svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>{t("added")}</>) : (<><svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>{inventory > 0 ? t("addToCart") : t("outOfStock")}</>)}
                    </button>
                    <button type="button" className="flex-1 py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wide bg-primary-light/50 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer relative z-30">
                      ⚡ {t("buyNow")}
                    </button>
                  </div>
                </div>

                <p className="text-muted text-[11px] sm:text-sm mb-4 md:mb-6 leading-relaxed line-clamp-4 sm:line-clamp-none">
                  {product.description ? product.description : t("fallbackDescription")}
                </p>

                <div className="grid grid-cols-3 gap-1.5 md:gap-2 p-2 md:p-3 rounded-xl md:rounded-2xl bg-primary-light/40 border border-card-border mb-4 md:mb-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[10px] font-extrabold text-primary">{t("freeShipping")}</span>
                    <span className="text-[7px] md:text-[9px] text-muted">{t("ordersOver")}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[10px] font-extrabold text-primary">{t("daysReturns")}</span>
                    <span className="text-[7px] md:text-[9px] text-muted">{t("hassleFree")}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[10px] font-extrabold text-primary">{t("securePayment")}</span>
                    <span className="text-[7px] md:text-[9px] text-muted">{t("secureCheckout")}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 md:gap-2 hidden sm:flex">
                  <h4 className="text-[10px] md:text-xs font-black uppercase text-primary tracking-wider mb-0.5 md:mb-1">
                    {t("keyFeatures")}
                  </h4>
                  {[t("feat1"), t("feat2"), t("feat3"), t("feat4")].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted font-medium">
                      <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ProductReviews productId={product.id} />

          {/* Similar Products */}
          <div className="bg-card rounded-[2rem] md:rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-card-border p-5 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b border-card-border">
              <h3 className="text-sm md:text-base font-black text-primary uppercase tracking-wider">
                {t("similarProducts")}
              </h3>
              {product.collection && (
                <Link href={`/products?collection_id=${product.collection}`} className="text-[10px] md:text-xs font-bold text-primary hover:underline relative z-20">
                  {t("viewAll")}
                </Link>
              )}
            </div>

            {similarItems && similarItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {similarItems.map((item: any) => {
                  const itemPrice = Math.round(Number(item.unit_price));
                  const itemOriginal = Math.round(itemPrice * 1.35);
                  return (
                    <Link href={`/products/${item.id}`} key={item.id} className="flex flex-col gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-2xl bg-[#f8f9fa] hover:bg-primary-light/40 border border-card-border transition-all group relative z-10">
                      <div className="w-full h-24 sm:h-32 bg-white rounded-xl flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-105 transition-transform border border-card-border overflow-hidden">
                        {item.images && item.images.length > 0 ? <img src={item.images[0].image} alt={item.title} className="w-full h-full object-cover" /> : <span>📦</span>}
                      </div>
                      <div className="flex flex-col flex-1 justify-between">
                        <h4 className="text-[10px] sm:text-xs font-bold text-primary line-clamp-1 group-hover:text-primary-hover transition-colors mb-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center text-yellow-400 text-[8px] sm:text-[10px] gap-0.5 mb-1.5 sm:mb-2">
                          {[...Array(5)].map((_, idx) => <span key={idx}>★</span>)}
                          <span className="text-muted ml-0.5 font-medium hidden sm:inline-block">(18)</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-primary font-black text-[11px] sm:text-sm">{currencySymbol}{itemPrice}</span>
                          <span className="text-[9px] sm:text-xs text-muted line-through">{currencySymbol}{itemOriginal}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] md:text-xs text-muted py-4 md:py-6 text-center font-medium">{t("noSimilarProducts")}</p>
            )}
          </div>
        </div>

        {/* 🟢 DESKTOP ONLY ACTION BLOCK (Hidden on mobile) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 md:gap-6 relative z-10">
          {/* z-20 ensures it stays under the Cart Modal (which is usually z-40/z-50) */}
          <div className="bg-card rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-card-border p-6 sticky top-28 relative z-20">
            <h3 className="text-sm font-black text-primary mb-4 pb-3 border-b border-card-border uppercase tracking-wider">
              {t("purchaseOptions")}
            </h3>

            <div className="flex flex-col gap-2 mb-5">
              <span className="text-xs font-black text-muted uppercase tracking-wider">{t("quantity")}</span>
              <div className="flex items-center justify-between bg-[#f8f9fa] border border-card-border rounded-2xl p-1.5 shadow-sm relative z-30">
                <button type="button" onClick={(e) => { e.preventDefault(); handleDecrement(); }} disabled={quantity <= 1 || isAdded} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-2xl font-bold text-primary shadow-sm hover:bg-primary hover:text-white disabled:opacity-40 transition-all cursor-pointer">
                  −
                </button>
                <span className="text-center font-black text-primary text-lg w-12">{quantity}</span>
                <button type="button" onClick={(e) => { e.preventDefault(); handleIncrement(); }} disabled={inventory === 0 || quantity >= inventory || isAdded} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-2xl font-bold text-primary shadow-sm hover:bg-primary hover:text-white disabled:opacity-40 transition-all cursor-pointer">
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 p-3.5 rounded-2xl bg-gray-50 border border-card-border relative z-30">
              <span className="text-xs text-muted font-bold uppercase tracking-wider">{t("totalPrice")}</span>
              <span className="text-xl font-black text-primary">{currencySymbol}{currentPrice * quantity}</span>
            </div>

            <div className="flex flex-col gap-3 relative z-30">
              <button 
                type="button" 
                disabled={inventory === 0 || isAdded} 
                onClick={(e) => { e.preventDefault(); handleAddToCart(); }} 
                className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  isAdded ? "bg-emerald-500 text-white shadow-emerald-500/30" : inventory > 0 ? "bg-primary text-white hover:bg-primary-hover hover:-translate-y-1" : "bg-primary-light text-primary cursor-not-allowed shadow-none"
                }`}
              >
                {isAdded ? (
                  <><svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>{t("added")}</>
                ) : (
                  <><svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>{inventory > 0 ? t("addToCart") : t("outOfStock")}</>
                )}
              </button>
              <button type="button" className="w-full py-4 rounded-2xl font-black text-sm tracking-wide bg-primary-light/50 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer">
                ⚡ {t("buyNow")}
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}