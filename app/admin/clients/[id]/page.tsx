import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { formatPrice, formatDuration } from "@/lib/utils";
import { ArrowLeft, Phone, Mail, Calendar } from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      appointments: {
        include: { service: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!client) notFound();

  const confirmed = client.appointments.filter((a) => a.status !== "CANCELLED");
  const totalSpent = confirmed.reduce((s, a) => s + a.price, 0);
  const lastVisit = confirmed.find((a) => new Date(a.date) < new Date());
  const upcoming = confirmed.find((a) => new Date(a.date) >= new Date());

  const STATUS_LABEL: Record<string, string> = { CONFIRMED: "Confirmé", PENDING: "En attente", CANCELLED: "Annulé" };
  const STATUS_COLOR: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-orange-100 text-orange-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <div className="p-8">
      {/* Back */}
      <Link href="/admin/clients" className="inline-flex items-center gap-2 text-xs text-[#b8975a] uppercase tracking-widest mb-8 hover:text-[#2a2018] transition-colors">
        <ArrowLeft size={14} /> Tous les clients
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Client card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Identity */}
          <div className="bg-white border border-gray-100 p-6">
            <div className="w-14 h-14 bg-[#faf6f1] flex items-center justify-center mb-4">
              <span className="font-display text-2xl text-[#b8975a]">
                {client.firstName[0]}{client.lastName[0]}
              </span>
            </div>
            <h1 className="font-display text-3xl text-[#2a2018]">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Cliente depuis {format(new Date(client.createdAt), "MMMM yyyy", { locale: fr })}
            </p>

            <div className="mt-5 space-y-3">
              <a href={`tel:${client.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#b8975a] transition-colors">
                <Phone size={15} className="text-[#b8975a]" /> {client.phone}
              </a>
              <a href={`mailto:${client.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#b8975a] transition-colors">
                <Mail size={15} className="text-[#b8975a]" /> {client.email}
              </a>
            </div>

            {client.notes && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Notes</p>
                <p className="text-sm text-gray-600">{client.notes}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white border border-gray-100 p-6 space-y-4">
            <StatRow label="Visites totales" value={String(confirmed.length)} />
            <StatRow label="Total dépensé" value={formatPrice(totalSpent)} gold />
            <StatRow
              label="Dernière visite"
              value={lastVisit ? format(new Date(lastVisit.date), "d MMM yyyy", { locale: fr }) : "—"}
            />
            {upcoming && (
              <StatRow
                label="Prochain RDV"
                value={format(new Date(upcoming.date), "d MMM yyyy à HH:mm", { locale: fr })}
              />
            )}
          </div>

          {/* Favourite service */}
          {confirmed.length > 0 && (() => {
            const counts: Record<string, number> = {};
            confirmed.forEach((a) => { counts[a.service.name] = (counts[a.service.name] || 0) + 1; });
            const fav = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
            return (
              <div className="bg-[#2a2018] p-6 text-white">
                <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Prestation favorite</p>
                <p className="font-display text-xl">{fav[0]}</p>
                <p className="text-xs text-white/40 mt-1">{fav[1]} fois</p>
              </div>
            );
          })()}
        </div>

        {/* Right: History */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-display text-2xl text-[#2a2018]">
                Historique des rendez-vous
              </h2>
            </div>

            {client.appointments.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">
                Aucun rendez-vous
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {client.appointments.map((appt) => (
                  <div key={appt.id} className="px-6 py-5 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#faf6f1] flex items-center justify-center shrink-0">
                        <Calendar size={16} className="text-[#b8975a]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#2a2018]">{appt.service.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(appt.date), "EEEE d MMMM yyyy", { locale: fr })} · {format(new Date(appt.date), "HH:mm")}
                          {" "}→ {format(new Date(appt.endTime), "HH:mm")}
                        </p>
                        <p className="text-xs text-gray-300 mt-0.5">
                          {formatDuration(appt.service.duration)}
                        </p>
                        {appt.comment && (
                          <p className="text-xs text-gray-400 italic mt-1">« {appt.comment} »</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="font-display text-xl text-[#b8975a]">{formatPrice(appt.price)}</p>
                      <span className={`text-xs px-2 py-0.5 ${STATUS_COLOR[appt.status] || "bg-gray-100 text-gray-500"}`}>
                        {STATUS_LABEL[appt.status] || appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={`font-medium ${gold ? "font-display text-lg text-[#b8975a]" : "text-[#2a2018]"}`}>
        {value}
      </span>
    </div>
  );
}
