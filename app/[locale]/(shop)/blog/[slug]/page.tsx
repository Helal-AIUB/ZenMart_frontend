import { Metadata } from "next";
import ArticleDetailsClient from "./ArticleDetailsClient";
// 🟢 Import server-side translation hook
import { getTranslations } from "next-intl/server";
// 🟢 Import GA4 analytics function
import { getPageViews } from "@/services/analytics";

type Props = {
  // 🟢 Include locale in params
  params: Promise<{ slug: string; locale: string }>;
};

// Unified fetcher for metadata and page content
async function getArticle(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const res = await fetch(`${apiUrl}/store/articles/?slug=${slug}`, {
      next: { revalidate: 600 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0] || data?.[0] || null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.slug);
  
  // 🟢 Fetch translations for metadata
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: "ArticleDetails" });
    
  if (!article) return { title: `${t("articleNotFoundTitle")} | PetoraBD` };

  const cleanDescription = article.content 
    ? article.content.replace(/<[^>]+>/g, '').substring(0, 150) + "..."
    : t("readOnPetora", { title: article.title });
      
  const imageUrl = article.image || "/og-image.jpg";

  return {
    title: `${article.title} | PetoraBD ${t("blogSuffix")}`,
    description: cleanDescription,
    openGraph: {
      title: article.title,
      description: cleanDescription,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
      type: "article",
      publishedTime: article.created_at,
      authors: ["PetoraBD"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: cleanDescription,
      images: [imageUrl],
    }
  };
}

export default async function ArticleDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.slug);
  
  // 🟢 Google Analytics theke data fetch kore article object e add kora holo
  if (article) {
    const pagePath = `/${resolvedParams.locale}/blog/${resolvedParams.slug}`;
    const ga4Views = await getPageViews(pagePath);
    article.ga4_views = ga4Views;
  }
  
  // Pass the fully fetched article to the client component
  return <ArticleDetailsClient article={article} />;
}