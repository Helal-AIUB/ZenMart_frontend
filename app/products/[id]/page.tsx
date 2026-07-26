// frontend/src/app/products/[id]/page.tsx
'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { Product } from '@/types/product';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id;

  // 1. Fetch Main Product
  const { data: product, isLoading: loadingProduct, error } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => apiClient.get(`/products/${productId}/`).then((res) => res.data),
  });

  // 2. Fetch Related Products (Dependent Query based on product's collection ID)
  const { data: relatedProducts, isLoading: loadingRelated } = useQuery<Product[]>({
    queryKey: ['related_products', product?.collection],
    queryFn: () => apiClient.get(`/products/?collection_id=${product?.collection}`).then((res) => res.data),
    enabled: !!product?.collection,
  });

  // Filter out the current product from the related list and grab top 5
  const similarItems = relatedProducts?.filter(p => String(p.id) !== String(productId)).slice(0, 5);

  if (loadingProduct) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted font-medium tracking-wide">Loading product details...</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="bg-card border border-card-border p-8 rounded-[2rem] shadow-sm max-w-md mx-auto">
        <p className="text-sm font-bold text-rose-500 mb-2">Product not found.</p>
        <Link href="/" className="text-xs text-primary font-bold hover:underline">Back to Home</Link>
      </div>
    </div>
  );

  const currentPrice = Math.round(Number(product.unit_price));
  const originalPrice = Math.round(Number(product.unit_price) * 1.35);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      
      {/* Breadcrumb Navigation */}
      <div className="mb-6 text-xs font-semibold text-muted flex items-center gap-2">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
        <span>/</span>
        <span className="text-foreground font-bold">{product.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Main Product Details (75% width on large screens) */}
        <div className="lg:w-3/4">
          <div className="bg-card rounded-[2.5rem] shadow-sm border border-card-border p-6 md:p-10 flex flex-col md:flex-row gap-10">
            
            {/* Product Image Area */}
            <div className="md:w-5/12 bg-[#f8f9fa] rounded-[2rem] min-h-[380px] flex items-center justify-center text-8xl border border-card-border relative overflow-hidden group">
              <span className="transform transition-transform duration-700 group-hover:scale-110">📦</span>
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
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <span className="text-primary font-bold hover:underline cursor-pointer">(24 Reviews)</span>
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
                  {product.description ? product.description : "Experience premium quality with this exclusive item. Designed carefully to elevate your daily lifestyle with top-notch durability and exceptional craftsmanship."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-auto">
                <button 
                  disabled={product.inventory === 0}
                  onClick={() => console.log(`Added ${product.title} to cart`)}
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md ${
                    product.inventory > 0 
                      ? 'bg-primary text-white hover:bg-primary-hover hover:shadow-xl hover:scale-[1.01] active:scale-95' 
                      : 'bg-card-border text-muted cursor-not-allowed'
                  }`}
                >
                  Add to Cart
                </button>
                <button className="w-12 h-12 rounded-2xl bg-card border border-card-border flex items-center justify-center text-muted hover:text-rose-500 hover:bg-rose-50 transition-all shadow-xs">
                  ❤️
                </button>
              </div>
            </div>
            
          </div>
        </div>

        {/* RIGHT COLUMN: Similar Products (25% width on large screens) */}
        <div className="lg:w-1/4">
          <div className="bg-card rounded-[2rem] shadow-sm border border-card-border p-5 sticky top-28">
            <h3 className="text-sm font-black text-foreground mb-4 pb-3 border-b border-card-border uppercase tracking-wider">
              Similar Products
            </h3>
            
            {loadingRelated ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
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
                      {/* Small thumbnail */}
                      <div className="w-14 h-14 bg-[#f8f9fa] rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform border border-card-border">
                        📦
                      </div>
                      {/* Mini details */}
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
              <p className="text-xs text-muted py-6 text-center font-medium">No similar products found.</p>
            )}
            
            {/* View More button at the bottom of sidebar */}
            {similarItems && similarItems.length > 0 && product.collection && (
              <div className="mt-5 pt-3 border-t border-card-border">
                <Link href={`/collections/${product.collection}`} className="block text-center text-xs font-bold text-primary hover:opacity-85 transition-opacity">
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