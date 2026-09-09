import CollectionProductsClient from "./CollectionProductsClient";

// 🟢 Server-side data fetching with ISR
async function getCollectionProducts(collectionId: string, page: number) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const res = await fetch(
      `${apiUrl}/store/products/?collection_id=${collectionId}&page=${page}`,
      {
        next: { revalidate: 600 }, // 10 minutes cache
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching collection products:", error);
    return null;
  }
}

export default async function CollectionProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  // 🟢 Next.js 15+ promise resolution for params and searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const collectionId = resolvedParams.id;
  const currentPage = Number(resolvedSearchParams.page) || 1;

  const data = await getCollectionProducts(collectionId, currentPage);

  return (
    <CollectionProductsClient 
      initialData={data} 
      collectionId={collectionId} 
      currentPage={currentPage} 
    />
  );
}