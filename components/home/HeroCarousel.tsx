"use client";

import Image from "next/image";
import Link from "next/link";

export default function HeroCarousel() {
  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 mt-40 md:mt-44 mb-12 font-sans">
      <Link 
        href="/products" 
        className="block relative w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-md border border-card-border group hover:shadow-lg transition-shadow"
      >
        <Image
          src="/pictures/petora1.png"
          alt="Petora BD Premium Pet Care"
          width={1920}
          height={900}
          priority
          className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-700"
        />
      </Link>
    </div>
  );
}