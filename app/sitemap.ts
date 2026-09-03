import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 1. static page list
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0, // Homepage most important
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    // 2. backend product fetch
    const res = await fetch(`${apiUrl}/store/products/`, {
      next: { revalidate: 3600 }, // cache update every 1 hour
    });
    
    if (!res.ok) return staticRoutes;
    
    const data = await res.json();
    const products = data.results || data || [];

    // making dynamic url for every products
    const dynamicRoutes: MetadataRoute.Sitemap = products.map((product: any) => ({
      url: `${siteUrl}/products/${product.id}`,
      lastModified: new Date(product.last_update || new Date()), 
      changeFrequency: "weekly",
      priority: 0.8, 
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    return staticRoutes;
  }
}