export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #faf6f1 0%, #f0e6d8 40%, #e8d5c4 100%)",
        }}
      />

      {/* Decorative circles */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-20"
           style={{ background: "radial-gradient(circle, #78716c, transparent)" }} />
      <div className="absolute bottom-1/3 left-1/5 w-96 h-96 rounded-full opacity-10"
           style={{ background: "radial-gradient(circle, #e8d5c4, transparent)" }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Eyebrow */}
        <p className="text-xs tracking-[0.4em] uppercase text-[#78716c] mb-6 font-body">
          Cheseaux-sur-Lausanne · Suisse
        </p>

        {/* Title */}
        <h1 className="font-display text-6xl md:text-8xl text-[#2a2018] leading-none mb-4">
          Nailsbysd
        </h1>

        {/* Subtitle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="h-px w-12 bg-[#78716c]" />
          <p className="text-xs tracking-[0.3em] uppercase text-[#2a2018]/60 font-body">
            Prothésiste Ongulaire
          </p>
          <span className="h-px w-12 bg-[#78716c]" />
        </div>

        {/* Description */}
        <p className="font-display text-xl md:text-2xl text-[#2a2018]/70 italic mb-12 leading-relaxed">
          L'art de sublimer vos mains avec délicatesse et savoir-faire
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#reservation"
            className="inline-flex items-center justify-center px-10 py-4 bg-[#78716c] text-white text-xs tracking-widest uppercase font-body hover:bg-[#2a2018] transition-colors duration-300"
          >
            Réserver un rendez-vous
          </a>
          <a
            href="#prestations"
            className="inline-flex items-center justify-center px-10 py-4 border border-[#78716c] text-[#78716c] text-xs tracking-widest uppercase font-body hover:bg-[#78716c] hover:text-white transition-colors duration-300"
          >
            Découvrir les prestations
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs tracking-widest uppercase text-[#2a2018]/30 font-body">Défiler</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#78716c] to-transparent" />
      </div>
    </section>
  );
}
