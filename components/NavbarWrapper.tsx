import Navbar from "./Navbar";

async function getCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const res = await fetch(`${apiUrl}/store/collections/`, {
      next: { revalidate: 600 }, // 10 minutes cache
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.results || data?.data || data || [];
  } catch (error) {
    return [];
  }
}

async function getSettings() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const res = await fetch(`${apiUrl}/store/settings/`, {
      next: { revalidate: 3600 }, // 1 hour cache
    });
    if (!res.ok) return {};
    const data = await res.json();
    return Array.isArray(data) ? data[0] : (data?.results?.[0] || data || {});
  } catch (error) {
    return {};
  }
}

export default async function NavbarWrapper() {
  // 🟢 Parallel Data Fetching on the Server
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSettings(),
  ]);

  return <Navbar initialCategories={categories} initialSettings={settings} />;
}