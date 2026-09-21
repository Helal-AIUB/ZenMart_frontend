import { Metadata } from "next";
import ProductDetailsClient from "./ProductDetailsClient";
// Import server-side translation hook
import { getTranslations } from "next-intl/server";

// Updated Props to include locale in params
type Props = {
  params: Promise<{ id: string; locale: string }>;
};

// Shared fetcher for deduplication and ISR
async function getProduct(id: string) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const res = await fetch(`${apiUrl}/store/products/${id}/`, {
      next: { revalidate: 600 }, // 10 minutes ISR cache
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

// Fetch related products on the server
async function getRelatedProducts(collectionId: string | number) {
  if (!collectionId) return [];
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const res = await fetch(
      `${apiUrl}/store/products/?collection_id=${collectionId}`,
      {
        next: { revalidate: 600 },
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.results || data?.data || data || [];
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  
  // 🟢 Fetch translations for metadata
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "ProductDetails" });

  if (!product) return { title: `${t("productNotFoundTitle")} | PetoraBD` };

  const imageUrl = product.images?.[0]?.image || "/og-image.jpg";

  return {
    title: `${product.title} | PetoraBD`,
    description:
      product.description?.substring(0, 160) ||
      t("buyAtPetora", { title: product.title }),
    openGraph: {
      title: product.title,
      description: product.description?.substring(0, 160),
      images: [{ url: imageUrl, width: 800, height: 800, alt: product.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  // Fetch related products if the main product exists
  const relatedProducts = product?.collection
    ? await getRelatedProducts(product.collection)
    : [];

  return (
    <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
  );
}