import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import WorkingHoursManager from "@/components/admin/WorkingHoursManager";

export default async function WorkingHoursPage() {
  await requireAdmin();

  const workingHours = await prisma.workingHours.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-[#2a2018] mb-1">Horaires de travail</h1>
        <p className="text-sm text-gray-500">Définissez vos horaires d'ouverture pour chaque jour</p>
      </div>
      <WorkingHoursManager initialHours={workingHours} />
    </div>
  );
}
