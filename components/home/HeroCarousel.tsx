"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    badge: "✦ SUMMER SALE 2026 ✦",
    titleStart: "Elevate Your Lifestyle",
    titleEnd: "Choices",
    subtitle:
      "Discover top brands, unbeatable deals and a shopping experience you'll love.",
    bg: "bg-gradient-to-r from-secondary to-white",
    image: "/pictures/banner-1.png",
    discountBadge: "UP TO 60% OFF",
  },
  {
    id: 2,
    badge: "✦ NEW ARRIVALS ✦",
    titleStart: "Upgrade To",
    titleEnd: "Trends",
    subtitle:
      "Explore the latest fashion and gadgets tailored exclusively for you.",
    bg: "bg-gradient-to-r from-[#F3F4F6] to-white",
    image: "/pictures/banner-2.png",
    discountBadge: "FLAT 40% OFF",
  },
  {
    id: 3,
    badge: "✦ FLASH DEAL ✦",
    titleStart: "Grab The Most",
    titleEnd: "Gadgets",
    subtitle: "Limited time offer on all premium electronics. Don't miss out!",
    bg: "bg-gradient-to-r from-primary-light to-white",
    image: "/pictures/banner-3.png",
    discountBadge: "EXTRA 20% OFF",
  },
];

const dynamicWords = ["Premium", "Smart", "Gorgeous"];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Slide rotation (every 5 seconds)
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  // Dynamic Word rotation (every 3 seconds)
  useEffect(() => {
    const wordTimer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % dynamicWords.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);
    return () => clearInterval(wordTimer);
  }, []);

  return (
    <div className="w-full">
      {/* 100% Bulletproof Spacer for Fixed Navbar - Increased height to prevent overlap */}
      <div className="w-full h-[110px] lg:h-[150px] pointer-events-none"></div>

      {/* Hero Carousel Container */}
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-sm mb-12 h-[520px] lg:h-[580px] border border-card-border bg-white group">
        {/* Carousel Track */}
        <div
          className="flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`min-w-full relative flex items-center ${slide.bg} overflow-hidden`}
            >
              {/* Soft background glow circles */}
              <div className="absolute left-[10%] top-[10%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
              <div className="absolute right-[5%] bottom-[10%] w-[400px] h-[400px] rounded-full bg-accent-cyan/5 blur-3xl pointer-events-none"></div>

              {/* Added pt-8 lg:pt-0 for perfect vertical alignment */}
              <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between px-8 md:px-16 lg:px-20 pt-8 lg:pt-0 relative z-10 gap-10">
                {/* Left Content */}
                <div className="w-full lg:w-[55%] flex flex-col justify-center text-left">
                  <div className="mb-4 inline-block">
                    <span className="text-[11px] font-black tracking-[0.2em] uppercase text-primary bg-primary-light px-3.5 py-1.5 rounded-lg border border-primary/20 shadow-xs inline-block leading-relaxed">
                      {slide.badge}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-5 tracking-tight text-text-dark leading-[1.1]">
                    {slide.titleStart} <br className="hidden md:block" />
                    With{" "}
                    <span className="relative inline-block w-[220px] md:w-[280px]">
                      <span
                        className={`absolute left-0 top-0 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-cyan transition-all duration-500 transform ${
                          isAnimating
                            ? "opacity-0 translate-y-4"
                            : "opacity-100 translate-y-0"
                        }`}
                      >
                        {dynamicWords[wordIndex]}
                      </span>
                      {/* Invisible placeholder to maintain width and layout */}
                      <span className="opacity-0 pointer-events-none">
                        Gorgeous
                      </span>
                    </span>{" "}
                    <br className="hidden md:block" />
                    {slide.titleEnd}
                  </h1>

                  <p className="text-sm md:text-base mb-8 max-w-md font-medium text-text-gray">
                    {slide.subtitle}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 mb-10">
                    <Link
                      href="/products"
                      className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                    >
                      Shop Now
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="/offers"
                      className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-text-dark bg-white border border-border-color hover:border-primary hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                        <svg
                          className="w-2.5 h-2.5 ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      Explore Deals
                    </Link>
                  </div>

                  {/* Service Features Bar */}
                  <div className="hidden md:flex items-center gap-8 border-t border-border-color pt-6 mt-auto">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      <div>
                        <h4 className="text-[11px] font-bold text-text-dark">
                          Free Delivery
                        </h4>
                        <p className="text-[10px] text-text-light">
                          On orders over ৳5000
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-[11px] font-bold text-text-dark">
                          Secure Payment
                        </h4>
                        <p className="text-[10px] text-text-light">
                          100% Protected
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-[11px] font-bold text-text-dark">
                          Easy Returns
                        </h4>
                        <p className="text-[10px] text-text-light">
                          7 Days Return Policy
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-[11px] font-bold text-text-dark">
                          24/7 Support
                        </h4>
                        <p className="text-[10px] text-text-light">
                          We are here to help
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Image Area */}
                <div className="hidden lg:flex w-[45%] h-full items-center justify-center relative">
                  <img
                    src={slide.image}
                    alt={slide.titleStart}
                    className="object-contain max-h-[90%] w-auto z-20 drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                  />

                  {/* Floating Discount Badge */}
                  <div className="absolute top-[15%] right-[5%] z-30 bg-primary w-28 h-28 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-primary/30 border-4 border-white animate-pulse">
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-90">
                      Up To
                    </span>
                    <span className="text-2xl font-black leading-none my-0.5">
                      {slide.discountBadge.match(/\d+%/)?.[0]}
                    </span>
                    <span className="text-xs font-bold tracking-wider">
                      OFF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-500 border border-border-color/50 ${
                currentSlide === index
                  ? "bg-primary w-12"
                  : "bg-white hover:bg-card-border w-2.5"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
