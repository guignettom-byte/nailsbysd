import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import ServicesManager from "@/components/admin/ServicesManager";

export default async function AdminServicesPage() {
  await requireAdmin();

  const services = await prisma.service.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-[#2a2018] mb-1">Prestations</h1>
        <p className="text-sm text-gray-500">Gérer les services proposés</p>
      </div>
      <ServicesManager initialServices={services} />
    </div>
  );
}
