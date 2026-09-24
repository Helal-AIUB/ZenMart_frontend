import TopReviewsMarquee from "./TopReviewsMarquee";

export default async function TopReviewsSection() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    
    // Fetching real reviews from your database
    const res = await fetch(`${apiUrl}/store/reviews/?ordering=-rating&limit=10`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const reviews = data?.results || data || [];

    if (!reviews || reviews.length === 0) return null;

    return (
      <section className="pt-10 pb-20 md:pt-12 md:pb-28 bg-background overflow-hidden font-sans">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 md:mb-14 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-4 tracking-tight">
            Loved by Pet Parents Across BD
          </h2>
          <p className="text-sm md:text-base text-text-gray max-w-2xl mx-auto font-medium">
            Don't just take our word for it. See what our amazing community has to say about their experience with Petora BD.
          </p>
        </div>

        {/* Passing real reviews to the marquee */}
        <TopReviewsMarquee reviews={reviews} />
      </section>
    );
  } catch (error) {
    console.error("Failed to fetch top reviews:", error);
    return null;
  }
}