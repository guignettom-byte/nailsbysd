import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";

export const revalidate = 60;

async function getServices() {
  try {
    return await prisma.service.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const services = await getServices();

  const defaultServices = [
    { id: "pose", name: "Pose de prothèses", duration: 90, price: 90, description: "Pose complète en gel ou acrylique", active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: "retouche", name: "Remplissage / Retouche", duration: 60, price: 65, description: "Retouche de la repousse", active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: "nailart", name: "Nail Art", duration: 120, price: 110, description: "Création artistique personnalisée", active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: "depose", name: "Dépose", duration: 30, price: 30, description: "Dépose soigneuse de vos prothèses", active: true, createdAt: new Date(), updatedAt: new Date() },
  ];

  const displayServices = services.length > 0 ? services : defaultServices;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection services={displayServices} />
        <BookingSection services={displayServices} />
      </main>
      <Footer />
    </div>
  );
}
