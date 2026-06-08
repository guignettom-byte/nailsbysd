"use client";

import Image from "next/image";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Sparkles, RefreshCw, Palette, Scissors } from "lucide-react";

const DEFAULT_SERVICES = [
  {
    icon: Sparkles,
    name: "Pose de prothèses",
    description: "Pose complète de prothèses ongulaires en gel ou acrylique. Forme et longueur au choix.",
    duration: 90,
    price: 90,
  },
  {
    icon: RefreshCw,
    name: "Remplissage / Retouche",
    description: "Retouche de la repousse pour conserver un résultat impeccable entre deux poses.",
    duration: 60,
    price: 65,
  },
  {
    icon: Palette,
    name: "Nail Art",
    description: "Création artistique personnalisée : dégradés, motifs, pierres, foils et bien plus.",
    duration: 120,
    price: 110,
  },
  {
    icon: Scissors,
    name: "Dépose",
    description: "Dépose soigneuse de vos prothèses existantes, respect de l'ongle naturel.",
    duration: 30,
    price: 30,
  },
];

interface ServicesProps {
  services?: Array<{ id: string; name: string; duration: number; price: number; description?: string | null }>;
}

export default function ServicesSection({ services }: ServicesProps) {
  const displayServices = services && services.length > 0
    ? services.map((s, i) => ({
        icon: DEFAULT_SERVICES[i % DEFAULT_SERVICES.length].icon,
        ...s,
        description: s.description || DEFAULT_SERVICES[i % DEFAULT_SERVICES.length].description,
      }))
    : DEFAULT_SERVICES;

  return (
    <section id="prestations" className="relative py-24 px-6 bg-white overflow-hidden">
      {/* Photo de fond + layer */}
      <Image
        src="/backgrounds/salon-1.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-white/75" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] uppercase text-[#78716c] mb-4 font-body">Savoir-faire</p>
          <h2 className="font-display text-5xl md:text-6xl text-[#2a2018] mb-6">Nos Prestations</h2>
          <div className="h-px w-16 bg-[#78716c] mx-auto" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayServices.map((service, i) => {
            const Icon = service.icon;
            return (
              <div
                key={i}
                className="bg-white/45 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_8px_30px_rgba(42,32,24,0.08)] p-10 group hover:bg-white/60 transition-colors duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="w-10 h-10 flex items-center justify-center text-[#78716c] group-hover:scale-110 transition-transform shrink-0 mt-1">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl text-[#2a2018] mb-2">{service.name}</h3>
                    <p className="text-sm text-[#2a2018]/60 font-body mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs tracking-widest uppercase text-[#2a2018]/40 font-body">
                        {formatDuration(service.duration)}
                      </span>
                      <span className="font-display text-2xl text-[#78716c]">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-[#e8d5c4]">
                  <a
                    href="#reservation"
                    className="text-xs tracking-widest uppercase text-[#78716c] font-body hover:text-[#2a2018] transition-colors"
                  >
                    Réserver cette prestation →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
