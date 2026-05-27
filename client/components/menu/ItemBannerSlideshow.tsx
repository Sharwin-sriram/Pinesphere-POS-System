"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const banners = [
  {
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop",
    label: "Item highlight banners",
    description: "Pair rich visuals with quick-read item details for a premium catalog.",
  },
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop",
    label: "Chef specials",
    description: "Showcase your top dishes with stunning food photography.",
  },
  {
    src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&auto=format&fit=crop",
    label: "Seasonal picks",
    description: "Highlight limited-time offerings to drive urgency and sales.",
  },
];

export default function ItemBannerSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-xl bg-gray-900">
      {/* Image */}
      <Image
        key={current}
        src={banners[current].src}
        alt={banners[current].label}
        fill
        className="object-cover opacity-70 transition-opacity duration-700"
        unoptimized
      />

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 p-5 z-10">
        <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-1">
          Highlights
        </p>
        <h2 className="text-white text-2xl font-bold">{banners[current].label}</h2>
        <p className="text-gray-300 text-sm mt-1">{banners[current].description}</p>
      </div>

      {/* Left arrow */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
      >
        ‹
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 right-5 flex gap-2 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-white w-4" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}