// frontend/src/components/home/TrustBadges.tsx
export default function TrustBadges() {
  const badges = [
    {
      icon: "🚚",
      title: "Free Delivery",
      description: "Orders over ৳5000",
      borderColor: "hover:border-card-hoverBorder",
      iconBg: "bg-primary-light text-primary",
    },
    {
      icon: "🔒",
      title: "Secure Payment",
      description: "100% safe checkout",
      borderColor: "hover:border-accent-cyan",
      iconBg: "bg-cyan-50 text-accent-cyan",
    },
    {
      icon: "🔄",
      title: "Easy Returns",
      description: "7 days return policy",
      borderColor: "hover:border-card-hoverBorder",
      iconBg: "bg-primary-light text-primary",
    },
    {
      icon: "🎧",
      title: "24/7 Support",
      description: "Dedicated support",
      borderColor: "hover:border-accent-indigo",
      iconBg: "bg-indigo-50 text-accent-indigo",
    },
  ];

  return (
    <section className="my-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((badge, index) => (
          <div 
            key={index} 
            className={`group bg-card rounded-[2.5rem] p-6 border border-card-border ${badge.borderColor} shadow-[0_10px_30px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.15)] transition-all duration-500 flex items-center gap-5 relative overflow-hidden`}
          >
            {/* Background Glow on Hover */}
            <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

            {/* Icon Box */}
            <div className={`w-14 h-14 rounded-2xl ${badge.iconBg} flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              {badge.icon}
            </div>

            {/* Text Content */}
            <div className="flex flex-col z-10">
              <h4 className="text-base font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                {badge.title}
              </h4>
              <p className="text-xs font-medium text-muted mt-0.5">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}