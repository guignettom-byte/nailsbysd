import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

export default async function AdminDashboard() {
  await requireAdmin();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekEnd = addDays(now, 7);

  const [todayAppts, upcomingAppts, totalThisMonth, pendingCount] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELLED" } },
      include: { service: true, client: true },
      orderBy: { date: "asc" },
    }),
    prisma.appointment.findMany({
      where: { date: { gte: now, lte: weekEnd }, status: { not: "CANCELLED" } },
      include: { service: true, client: true },
      orderBy: { date: "asc" },
      take: 10,
    }),
    prisma.appointment.count({
      where: {
        date: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-[#2a2018] mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {format(now, "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={Calendar} label="Aujourd'hui" value={todayAppts.length} color="gold" />
        <StatCard icon={Clock} label="Cette semaine" value={upcomingAppts.length} color="nude" />
        <StatCard icon={CheckCircle} label="Ce mois-ci" value={totalThisMonth} color="green" />
        <StatCard icon={XCircle} label="En attente" value={pendingCount} color="orange" />
      </div>

      {/* Today's appointments */}
      <div className="bg-white border border-gray-100 mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-display text-2xl text-[#2a2018]">Aujourd'hui</h2>
          <Link href="/admin/appointments" className="text-xs text-[#b8975a] uppercase tracking-widest">
            Tous les RDV →
          </Link>
        </div>
        {todayAppts.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            Aucun rendez-vous aujourd'hui
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayAppts.map((appt) => (
              <AppointmentRow key={appt.id} appt={appt} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div className="bg-white border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-display text-2xl text-[#2a2018]">7 prochains jours</h2>
        </div>
        {upcomingAppts.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            Aucun rendez-vous à venir
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcomingAppts.map((appt) => (
              <AppointmentRow key={appt.id} appt={appt} showDate />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    gold: "text-[#b8975a] bg-[#faf6f1]",
    nude: "text-[#2a2018] bg-[#e8d5c4]",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-500 bg-orange-50",
  };

  return (
    <div className="bg-white p-6 border border-gray-100">
      <div className={`inline-flex p-3 rounded-full mb-4 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-3xl font-display text-[#2a2018] mb-1">{value}</p>
      <p className="text-xs text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function AppointmentRow({
  appt,
  showDate = false,
}: {
  appt: { id: string; date: Date; status: string; client: { id: string; firstName: string; lastName: string; phone: string }; service: { name: string } };
  showDate?: boolean;
}) {
  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-orange-100 text-orange-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <a href={`/admin/clients/${appt.client.id}`} className="font-medium text-[#2a2018] truncate hover:text-[#b8975a] transition-colors block">
          {appt.client.firstName} {appt.client.lastName}
        </a>
        <p className="text-sm text-gray-500">{appt.service.name}</p>
      </div>
      <div className="text-right shrink-0">
        {showDate && (
          <p className="text-xs text-gray-400">
            {format(new Date(appt.date), "EEE d MMM", { locale: fr })}
          </p>
        )}
        <p className="text-sm font-medium text-[#2a2018]">
          {format(new Date(appt.date), "HH:mm")}
        </p>
        <p className="text-xs text-gray-400">{appt.client.phone}</p>
      </div>
      <span className={`text-xs px-2 py-1 ${statusColors[appt.status] || "bg-gray-100 text-gray-500"}`}>
        {appt.status === "CONFIRMED" ? "Confirmé" : appt.status === "PENDING" ? "En attente" : "Annulé"}
      </span>
    </div>
  );
}
