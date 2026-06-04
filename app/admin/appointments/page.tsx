import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import AppointmentActions from "@/components/admin/AppointmentActions";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { status, view } = await searchParams;

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(status && status !== "all" ? { status } : {}),
      date: { gte: new Date() },
    },
    include: { service: true, client: true },
    orderBy: { date: "asc" },
  });

  const statusLabel: Record<string, string> = {
    CONFIRMED: "Confirmé",
    PENDING: "En attente",
    CANCELLED: "Annulé",
  };

  const statusColor: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-orange-100 text-orange-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-[#2a2018] mb-1">Rendez-vous</h1>
          <p className="text-sm text-gray-500">{appointments.length} RDV à venir</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {["all", "CONFIRMED", "PENDING", "CANCELLED"].map((s) => (
            <a
              key={s}
              href={`/admin/appointments?status=${s}`}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                (status || "all") === s
                  ? "bg-[#b8975a] text-white border-[#b8975a]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#b8975a]"
              }`}
            >
              {s === "all" ? "Tous" : statusLabel[s]}
            </a>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 overflow-hidden">
        {appointments.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            Aucun rendez-vous trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Date & Heure", "Client", "Prestation", "Téléphone", "Statut", "Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-[#2a2018]">
                        {format(new Date(appt.date), "EEE d MMM", { locale: fr })}
                      </p>
                      <p className="text-gray-400 text-xs">{format(new Date(appt.date), "HH:mm")} – {format(new Date(appt.endTime), "HH:mm")}</p>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/admin/clients/${appt.client.id}`} className="font-medium text-[#2a2018] hover:text-[#b8975a] transition-colors">
                        {appt.client.firstName} {appt.client.lastName}
                      </a>
                      <p className="text-gray-400 text-xs">{appt.client.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[#2a2018]">{appt.service.name}</p>
                      <p className="text-gray-400 text-xs">{appt.service.duration} min</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{appt.client.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 ${statusColor[appt.status] || "bg-gray-100 text-gray-500"}`}>
                        {statusLabel[appt.status] || appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AppointmentActions apptId={appt.id} currentStatus={appt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
