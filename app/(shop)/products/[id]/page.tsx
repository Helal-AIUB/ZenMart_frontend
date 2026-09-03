import { Metadata } from "next";
import ProductDetailsClient from "./ProductDetailsClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/store/products/${resolvedParams.id}/`);
    
    if (!res.ok) return { title: "Product Not Found" };
    
    const product = await res.json();
    const imageUrl = product.images?.[0]?.image || "/og-image.jpg";

    return {
      title: `${product.title} | PetoraBD`,
      description: product.description?.substring(0, 160) || `Buy ${product.title} at PetoraBD.`,
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
      }
    };
  } catch (error) {
    return { title: "PetoraBD Product" };
  }
}

export default async function ProductDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  
  return <ProductDetailsClient productId={resolvedParams.id} />;
}