import CollectionProductsClient from "./CollectionProductsClient";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

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
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  // 🟢 Next.js 15+ promise resolution for params and searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const collectionId = resolvedParams.id;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const locale = resolvedParams.locale;

  const data = await getCollectionProducts(collectionId, currentPage);
  
  // 🟢 Fetch messages for the current locale to pass to the client provider
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CollectionProductsClient 
        initialData={data} 
        collectionId={collectionId} 
        currentPage={currentPage} 
      />
    </NextIntlClientProvider>
  );
}