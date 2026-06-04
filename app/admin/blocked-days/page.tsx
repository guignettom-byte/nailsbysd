import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlockedDaysManager from "@/components/admin/BlockedDaysManager";

export default async function BlockedDaysPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const blockedDays = await prisma.blockedDay.findMany({
    orderBy: { date: "asc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-[#2a2018] mb-1">Jours bloqués</h1>
        <p className="text-sm text-gray-500">Congés, formations, jours fériés — bloquent automatiquement les réservations</p>
      </div>
      <BlockedDaysManager initialBlockedDays={blockedDays} />
    </div>
  );
}
