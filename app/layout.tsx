import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nailsbysd — Prothésiste Ongulaire | Cheseaux-sur-Lausanne",
  description:
    "Pose de prothèses ongulaires, remplissage, nail art à Cheseaux-sur-Lausanne. Réservez votre rendez-vous en ligne.",
  openGraph: {
    title: "Nailsbysd — Prothésiste Ongulaire",
    description: "Pose de prothèses ongulaires, remplissage, nail art à Cheseaux-sur-Lausanne.",
    locale: "fr_CH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
