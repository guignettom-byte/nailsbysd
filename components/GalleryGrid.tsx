"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  title: string | null;
  category: string;
}

interface GalleryGridProps {
  photos: Photo[];
  categories: string[];
}

export default function GalleryGrid({ photos, categories }: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  const filtered = activeCategory === "Tous"
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-xs uppercase tracking-widest font-body transition-colors ${
              activeCategory === cat
                ? "bg-[#78716c] text-white"
                : "border border-[#78716c]/30 text-[#78716c] hover:bg-[#78716c] hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        {filtered.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden"
            onClick={() => setLightbox(photo)}
          >
            <div className="relative aspect-square overflow-hidden bg-[#e8e8e6]">
              <Image
                src={photo.url}
                alt={photo.title || photo.category}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-[#2a2018]/0 group-hover:bg-[#2a2018]/30 transition-all duration-300 flex items-end">
                <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3 w-full bg-gradient-to-t from-[#2a2018]/80 to-transparent">
                  {photo.title && (
                    <p className="text-white text-xs font-body truncate">{photo.title}</p>
                  )}
                  <p className="text-white/60 text-xs">{photo.category}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#2a2018]/40">
          Aucune photo dans cette catégorie.
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <X size={28} />
          </button>
          <div className="relative max-w-2xl w-full max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="relative" style={{ aspectRatio: "1" }}>
              <Image
                src={lightbox.url}
                alt={lightbox.title || lightbox.category}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
            {(lightbox.title || lightbox.category) && (
              <div className="mt-3 text-center">
                {lightbox.title && <p className="text-white font-body">{lightbox.title}</p>}
                <p className="text-white/50 text-sm">{lightbox.category}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
