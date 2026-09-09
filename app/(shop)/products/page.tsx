import ProductsClient from "./ProductsClient";

// 🟢 Server-side data fetching with ISR
async function getProducts(page: number) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const res = await fetch(`${apiUrl}/store/products/?page=${page}`, {
      next: { revalidate: 600 }, // 10 minutes ISR cache per page
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // 🟢 Next.js 15+ searchParams handling
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  
  const data = await getProducts(currentPage);

  return <ProductsClient initialData={data} currentPage={currentPage} />;
}