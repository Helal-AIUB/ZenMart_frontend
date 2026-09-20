import AnalyticsDashboardClient from "./AnalyticsDashboardClient";

async function getAnalyticsData() {
  try {
    const res = await fetch("http://127.0.0.1:8000/store/analytics/ga4/", {
      next: { revalidate: 60 }, 
    });
    
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
  }
  return null;
}

export default async function AnalyticsPage() {
  const gaData = await getAnalyticsData();

  return <AnalyticsDashboardClient initialData={gaData} />;
}