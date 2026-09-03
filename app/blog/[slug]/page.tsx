import { Metadata } from "next";
import ArticleDetailsClient from "./ArticleDetailsClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    // Artical fetch
    const res = await fetch(`${apiUrl}/store/articles/?slug=${resolvedParams.slug}`);
    
    if (!res.ok) return { title: "Article Not Found" };
    
    const data = await res.json();
    const article = data.results?.[0] || data?.[0]; 
    
    if (!article) return { title: "Article Not Found" };

    const cleanDescription = article.content 
      ? article.content.replace(/<[^>]+>/g, '').substring(0, 150) + "..."
      : `Read ${article.title} on PetoraBD Blog.`;
      
    const imageUrl = article.image || "/og-image.jpg";

    return {
      title: `${article.title} | PetoraBD Blog`,
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
  } catch (error) {
    return { title: "PetoraBD Blog" };
  }
}

export default async function ArticleDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  
  return <ArticleDetailsClient slug={resolvedParams.slug} />;
}