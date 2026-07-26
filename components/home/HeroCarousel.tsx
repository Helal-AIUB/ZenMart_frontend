// frontend/src/components/home/HeroCarousel.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    badge: "SUMMER 2026",
    title: "Family Shopping Festival",
    subtitle: "Premium lifestyle products for you and your loved ones.",
    bg: "bg-card",
    textColor: "text-foreground",
    buttonBg: "bg-foreground text-background hover:bg-primary hover:text-white",
    image: "/pictures/family_shopping.png",
    imageClass: "translate-y-3 md:translate-y-5",
  },
  {
    id: 2,
    badge: "NEW ARRIVALS",
    title: "Kids Collection 2026",
    subtitle: "Trendy and comfortable outfits for the little ones.",
    bg: "bg-primary-light",
    textColor: "text-foreground",
    buttonBg: "bg-primary text-white hover:bg-primary-hover",
    image: "/pictures/kids.png",
    imageClass: "translate-y-0 md:translate-y-0",
  },
  {
    id: 3,
    badge: "FLASH DEAL",
    title: "Mega Electronics Sale",
    subtitle: "Up to 50% Off on all premium lifestyle products.",
    bg: "bg-card",
    textColor: "text-foreground",
    buttonBg: "bg-accent-indigo text-white hover:opacity-90",
    image: "/pictures/electronic.png",
    imageClass: "translate-y-2 md:translate-y-3",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[2rem] shadow-sm mb-12 group h-[400px] md:h-[450px] border border-card-border bg-card">
      <div
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`min-w-full relative flex items-center ${slide.bg} overflow-hidden`}
          >
            {/* Background Decorative Glow */}
            <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

            <div className="w-full h-full flex flex-col md:flex-row items-center justify-between px-10 md:px-20 relative z-10 gap-8">
              {/* Left Text Side */}
              <div
                className={`w-full md:w-1/2 flex flex-col justify-center text-left ${slide.textColor}`}
              >
                <span className="text-xs font-black tracking-[0.25em] mb-4 uppercase text-primary bg-primary-light w-max px-3 py-1 rounded-md">
                  {slide.badge}
                </span>
                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                  {slide.title}
                </h1>
                <p className="text-sm md:text-base mb-8 max-w-lg font-medium text-muted">
                  {slide.subtitle}
                </p>
                <Link
                  href="/products"
                  className={`inline-block w-max px-10 py-4 rounded-xl font-bold text-xs transition-all shadow-lg hover:scale-105 ${slide.buttonBg}`}
                >
                  Explore Now
                </Link>
              </div>

              {/* Right Image Side */}
              <div className="hidden md:flex w-full md:w-1/2 h-full items-end justify-center pb-2 relative">
                <img
                  src={slide.image}
                  alt="Shopping Banner"
                  className={`object-contain max-h-[85%] drop-shadow-2xl z-20 transform transition-transform duration-700 hover:scale-105 ${slide.imageClass}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              currentSlide === index
                ? "bg-primary w-10"
                : "bg-card-border hover:bg-muted w-2.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}