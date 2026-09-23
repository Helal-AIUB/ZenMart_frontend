import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zenmart-ecommerce1.vercel.app";
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0, 
    },
    {
      url: `${siteUrl}/en/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const res = await fetch(`${apiUrl}/store/products/`, {
      next: { revalidate: 3600 }, 
    });
    
    if (!res.ok) return staticRoutes;
    
    const data = await res.json();
    const products = data.results || data || [];

    const dynamicRoutes: MetadataRoute.Sitemap = products.map((product: any) => ({
      url: `${siteUrl}/en/products/${product.id}`,
      lastModified: new Date(product.last_update || new Date()), 
      changeFrequency: "weekly",
      priority: 0.8, 
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    return staticRoutes;
  }
}