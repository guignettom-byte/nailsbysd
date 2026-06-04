import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ClientSessionProvider from "@/components/ClientSessionProvider";

export const metadata: Metadata = {
  title: "Nailsbysd — Prothésiste Ongulaire | Cheseaux-sur-Lausanne",
  description: "Pose de prothèses ongulaires, remplissage, nail art à Cheseaux-sur-Lausanne. Réservez votre rendez-vous en ligne.",
  openGraph: {
    title: "Nailsbysd — Prothésiste Ongulaire",
    description: "Pose de prothèses ongulaires, remplissage, nail art à Cheseaux-sur-Lausanne.",
    locale: "fr_CH",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="fr" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col antialiased">
        <ClientSessionProvider session={session}>
          {children}
        </ClientSessionProvider>
      </body>
    </html>
  );
}
