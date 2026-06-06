import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryGrid from "@/components/GalleryGrid";

export const revalidate = 60;

export default async function GaleriePage() {
  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
  });

  const categories = ["Tous", ...Array.from(new Set(photos.map((p) => p.category)))];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        {/* Header */}
        <section className="py-16 px-6 text-center bg-white">
          <p className="text-xs tracking-[0.4em] uppercase text-[#78716c] mb-4 font-body">Créations</p>
          <h1 className="font-display text-5xl md:text-6xl text-[#2a2018] mb-6">Galerie & Inspiration</h1>
          <div className="h-px w-16 bg-[#78716c] mx-auto mb-6" />
          <p className="text-[#2a2018]/60 font-body max-w-xl mx-auto">
            Découvrez mes réalisations — chaque paire de mains est unique, chaque création est sur-mesure.
          </p>
        </section>

        {/* Gallery */}
        <section className="py-12 px-6 bg-[#faf6f1]">
          <div className="max-w-6xl mx-auto">
            {photos.length === 0 ? (
              <div className="text-center py-20 text-[#2a2018]/40">
                <p className="font-display text-3xl mb-3">Bientôt disponible</p>
                <p className="text-sm">La galerie sera alimentée prochainement.</p>
              </div>
            ) : (
              <GalleryGrid photos={photos} categories={categories} />
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-[#2a2018] text-center">
          <h2 className="font-display text-3xl text-white mb-4">
            Vous avez un projet en tête ?
          </h2>
          <p className="text-white/60 mb-8 font-body">Réservez votre rendez-vous en quelques clics.</p>
          <a href="/#reservation"
            className="inline-flex items-center justify-center px-10 py-4 bg-[#78716c] text-white text-xs tracking-widest uppercase font-body hover:bg-white hover:text-[#2a2018] transition-colors duration-300">
            Réserver maintenant
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
