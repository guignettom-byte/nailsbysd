import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import AdminGallery from "@/components/admin/AdminGallery";

export default async function AdminGaleriePage() {
  await requireAdmin();

  const [photos, services] = await Promise.all([
    prisma.photo.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-[#2a2018] mb-1">Galerie</h1>
        <p className="text-sm text-gray-500">Gérer les photos de créations</p>
      </div>
      <AdminGallery initialPhotos={photos} services={services} />
    </div>
  );
}
