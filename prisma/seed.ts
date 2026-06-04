import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash("nailsbysd2024!", 10);
  await prisma.user.upsert({
    where: { email: "admin@nailsbysd.ch" },
    update: {},
    create: {
      email: "admin@nailsbysd.ch",
      password: hashedPassword,
      name: "Admin Nailsbysd",
    },
  });

  // Services
  const services = [
    { name: "Pose de prothèses ongulaires", duration: 90, price: 90, description: "Pose complète de prothèses ongulaires en gel ou acrylique. Forme et longueur au choix." },
    { name: "Remplissage / Retouche", duration: 60, price: 65, description: "Retouche de la repousse pour conserver un résultat impeccable entre deux poses." },
    { name: "Nail Art", duration: 120, price: 110, description: "Création artistique personnalisée : dégradés, motifs, pierres, foils et bien plus." },
    { name: "Dépose", duration: 30, price: 30, description: "Dépose soigneuse de vos prothèses existantes, respect de l'ongle naturel." },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({ where: { name: service.name } });
    if (!existing) {
      await prisma.service.create({ data: service });
    }
  }

  // Working hours (Monday–Friday 9h–18h, Saturday 9h–14h)
  const workingHours = [
    { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", active: true },
    { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", active: true },
    { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", active: true },
    { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", active: true },
    { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", active: true },
    { dayOfWeek: 6, startTime: "09:00", endTime: "14:00", active: true },
  ];

  for (const wh of workingHours) {
    const existing = await prisma.workingHours.findFirst({ where: { dayOfWeek: wh.dayOfWeek } });
    if (!existing) {
      await prisma.workingHours.create({ data: wh });
    }
  }

  console.log("✓ Seed completed");
  console.log("  Admin: admin@nailsbysd.ch / nailsbysd2024!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
