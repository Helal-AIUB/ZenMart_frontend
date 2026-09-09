import HeroCarousel from '@/components/home/HeroCarousel';
import TrustBadges from '@/components/home/TrustBadges';
import FlashSale from '@/components/home/FlashSale';
import NewArrivals from '@/components/home/NewArrivals';
import BlogSection from '@/components/home/BlogSection';
import { Product } from '@/types/product';

// Modified to accept optional collectionId
async function getProducts(collectionId?: string | number): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'; 
    const endpoint = collectionId 
      ? `${apiUrl}/store/products/?collection_id=${collectionId}` 
      : `${apiUrl}/store/products/`;

    const res = await fetch(endpoint, {
      next: { revalidate: 600 }, // 10 minutes ISR cache
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data?.results || data?.data || data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getCollections() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'; 
    const res = await fetch(`${apiUrl}/store/collections/`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.results || data?.data || data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export default async function Home() {
  const [allProducts, collections] = await Promise.all([
    getProducts(),
    getCollections()
  ]);

  const groupedProducts: Record<string, any[]> = {
    "all": allProducts
  };

  if (collections && collections.length > 0) {
    const collectionPromises = collections.map((col: any) => getProducts(col.id));
    const collectionsData = await Promise.all(collectionPromises);

    collections.forEach((col: any, index: number) => {
      groupedProducts[col.id.toString()] = collectionsData[index];
    });
  }

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 min-h-screen font-sans">
      
      <HeroCarousel />

      <section className="w-full mt-6">
        <FlashSale products={allProducts} isLoading={false} />
        
        {/* 🟢 Pass the fully hydrated grouped dictionary to NewArrivals */}
        <NewArrivals 
          initialCollections={collections} 
          groupedProducts={groupedProducts} 
        />
      </section>

      <BlogSection />
      <TrustBadges />

    </main>
  );
}