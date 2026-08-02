// frontend/src/components/home/TrustBadges.tsx
export default function TrustBadges() {
  const badges = [
    {
      title: "Free Delivery",
      description: "On all orders above $50",
      subBadge: "Fast & Reliable",
      borderColor: "hover:border-primary/40",
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
    {
      title: "Secure Payment",
      description: "100% secure & protected",
      subBadge: "SSL Encrypted",
      borderColor: "hover:border-primary/40",
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Easy Returns",
      description: "7 days easy return policy",
      subBadge: "Hassle Free",
      borderColor: "hover:border-primary/40",
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      title: "24/7 Support",
      description: "We're here to help anytime",
      subBadge: "Live Chat & Email",
      borderColor: "hover:border-primary/40",
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="my-16 font-sans">
      <div className="bg-card rounded-[2.5rem] border border-card-border p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative overflow-hidden">
        {/* Background Subtle Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 divide-y sm:divide-y-0 sm:divide-x divide-card-border/60">
          {badges.map((badge, index) => (
            <div 
              key={index} 
              className="group flex flex-col items-center text-center sm:px-4 first:pl-0 last:pr-0 pt-6 sm:pt-0"
            >
              {/* Icon Container with Soft Glow */}
              <div className="w-16 h-16 rounded-full bg-primary-light/80 border border-card-border flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 [&>svg]:group-hover:text-white">
                {badge.icon}
              </div>

              {/* Title & Description */}
              <h4 className="text-base font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
                {badge.title}
              </h4>
              <p className="text-xs font-normal text-muted mt-1 tracking-wide">
                {badge.description}
              </p>

              {/* Sub-badge Pill */}
              <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-primary-light text-primary border border-primary/20 shadow-2xs">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                {badge.subBadge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}