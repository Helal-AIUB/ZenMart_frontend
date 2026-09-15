import BlogListClient from "./BlogListClient";

async function getArticles() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const res = await fetch(`${apiUrl}/store/articles/?status=Published`, {
      next: { revalidate: 600 }, // 10 minutes ISR cache
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.results || data?.data || data || [];
  } catch (error) {
    return [];
  }
}

async function getCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const res = await fetch(`${apiUrl}/store/article-categories/`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.results || data?.data || data || [];
  } catch (error) {
    return [];
  }
}

export default async function PublicBlogPage() {
  const [articles, categories] = await Promise.all([
    getArticles(),
    getCategories()
  ]);

  return <BlogListClient initialArticles={articles} initialCategories={categories} />;
}