import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import {
  startOfMonth, endOfMonth, startOfYear, endOfYear,
  subMonths, format, getMonth, getYear,
} from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default async function ComptabilitePage() {
  await requireAdmin();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  // Requêtes en parallèle
  const [
    thisMonthAppts,
    prevMonthAppts,
    thisYearAppts,
    allAppts,
    byService,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { status: "CONFIRMED", date: { gte: monthStart, lte: monthEnd } },
      select: { price: true, date: true },
    }),
    prisma.appointment.findMany({
      where: { status: "CONFIRMED", date: { gte: prevMonthStart, lte: prevMonthEnd } },
      select: { price: true },
    }),
    prisma.appointment.findMany({
      where: { status: "CONFIRMED", date: { gte: yearStart, lte: yearEnd } },
      select: { price: true },
    }),
    // 12 derniers mois pour le graphique
    prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        date: { gte: startOfMonth(subMonths(now, 11)), lte: monthEnd },
      },
      select: { price: true, date: true },
    }),
    // Par prestation (année en cours)
    prisma.appointment.groupBy({
      by: ["serviceId"],
      where: { status: "CONFIRMED", date: { gte: yearStart, lte: yearEnd } },
      _sum: { price: true },
      _count: { id: true },
    }),
  ]);

  // Calculs
  const caThisMois = thisMonthAppts.reduce((s, a) => s + a.price, 0);
  const caPrevMois = prevMonthAppts.reduce((s, a) => s + a.price, 0);
  const caAnnee = thisYearAppts.reduce((s, a) => s + a.price, 0);
  const rdvThisMois = thisMonthAppts.length;
  const panierMoyen = rdvThisMois > 0 ? caThisMois / rdvThisMois : 0;
  const evolution = caPrevMois > 0 ? ((caThisMois - caPrevMois) / caPrevMois) * 100 : null;

  // Graphique 12 mois
  const months12 = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i);
    return { month: d, label: format(d, "MMM", { locale: fr }), ca: 0, rdv: 0 };
  });
  for (const a of allAppts) {
    const apptDate = new Date(a.date);
    const idx = months12.findIndex(
      (m) => getMonth(m.month) === getMonth(apptDate) && getYear(m.month) === getYear(apptDate)
    );
    if (idx >= 0) { months12[idx].ca += a.price; months12[idx].rdv += 1; }
  }
  const maxCa = Math.max(...months12.map((m) => m.ca), 1);

  // Par prestation avec nom
  const serviceIds = byService.map((s) => s.serviceId);
  const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } });
  const byServiceEnriched = byService
    .map((s) => ({
      name: services.find((sv) => sv.id === s.serviceId)?.name ?? "—",
      total: s._sum.price ?? 0,
      count: s._count.id,
    }))
    .sort((a, b) => b.total - a.total);

  const currentMonthLabel = format(now, "MMMM yyyy", { locale: fr });
  const prevMonthLabel = format(subMonths(now, 1), "MMMM", { locale: fr });

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-[#2a2018] mb-1">Comptabilité</h1>
        <p className="text-sm text-gray-500 capitalize">{currentMonthLabel}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard
          label={`CA ${format(now, "MMMM", { locale: fr })}`}
          value={formatPrice(caThisMois)}
          sub={evolution !== null ? (
            <span className={`flex items-center gap-1 text-xs ${evolution > 0 ? "text-green-600" : evolution < 0 ? "text-red-500" : "text-gray-400"}`}>
              {evolution > 0 ? <TrendingUp size={12} /> : evolution < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
              {evolution > 0 ? "+" : ""}{evolution.toFixed(1)}% vs {prevMonthLabel}
            </span>
          ) : null}
          gold
        />
        <KpiCard label={`CA ${getYear(now)}`} value={formatPrice(caAnnee)} sub={<span className="text-xs text-gray-400">{thisYearAppts.length} RDV</span>} />
        <KpiCard label="RDV ce mois" value={String(rdvThisMois)} sub={<span className="text-xs text-gray-400">Confirmés</span>} />
        <KpiCard label="Panier moyen" value={formatPrice(panierMoyen)} sub={<span className="text-xs text-gray-400">Par RDV ce mois</span>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Graphique 12 mois */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6">
          <h2 className="font-display text-2xl text-[#2a2018] mb-6">Chiffre d'affaires — 12 mois</h2>
          <div className="flex items-end gap-2 h-40">
            {months12.map((m, i) => {
              const height = maxCa > 0 ? Math.max((m.ca / maxCa) * 100, m.ca > 0 ? 4 : 0) : 0;
              const isCurrent = i === 11;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
                    <div className="bg-[#2a2018] text-white text-xs px-2 py-1 whitespace-nowrap">
                      {formatPrice(m.ca)}<br />{m.rdv} RDV
                    </div>
                    <div className="w-2 h-2 bg-[#2a2018] rotate-45 -mt-1" />
                  </div>
                  <div
                    className={`w-full transition-all ${isCurrent ? "bg-[#b8975a]" : "bg-[#e8d5c4] group-hover:bg-[#b8975a]/60"}`}
                    style={{ height: `${height}%`, minHeight: m.ca > 0 ? "4px" : "0" }}
                  />
                  <span className={`text-xs capitalize ${isCurrent ? "text-[#b8975a] font-medium" : "text-gray-400"}`}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Par prestation */}
        <div className="bg-white border border-gray-100 p-6">
          <h2 className="font-display text-2xl text-[#2a2018] mb-6">Par prestation</h2>
          {byServiceEnriched.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune donnée</p>
          ) : (
            <div className="space-y-4">
              {byServiceEnriched.map((s) => {
                const pct = caAnnee > 0 ? (s.total / caAnnee) * 100 : 0;
                return (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#2a2018] truncate pr-2">{s.name}</span>
                      <span className="text-[#b8975a] font-display shrink-0">{formatPrice(s.total)}</span>
                    </div>
                    <div className="h-1.5 bg-[#f0e6d8] rounded-full overflow-hidden">
                      <div className="h-full bg-[#b8975a] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{s.count} RDV · {pct.toFixed(0)}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tableau mensuel année en cours */}
      <div className="bg-white border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-display text-2xl text-[#2a2018]">Détail mensuel {getYear(now)}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Mois", "RDV", "CA", "Panier moyen"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {months12.slice().reverse().map((m, i) => {
                const pm = m.ca > 0 && m.rdv > 0 ? m.ca / m.rdv : 0;
                const isCurrent = i === 0;
                return (
                  <tr key={i} className={isCurrent ? "bg-[#faf6f1]" : "hover:bg-gray-50"}>
                    <td className="px-6 py-3 capitalize font-medium text-[#2a2018]">
                      {format(m.month, "MMMM yyyy", { locale: fr })}
                      {isCurrent && <span className="ml-2 text-xs bg-[#b8975a] text-white px-1.5 py-0.5">En cours</span>}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{m.rdv}</td>
                    <td className="px-6 py-3 font-display text-lg text-[#b8975a]">{formatPrice(m.ca)}</td>
                    <td className="px-6 py-3 text-gray-600">{pm > 0 ? formatPrice(pm) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, gold }: {
  label: string; value: string; sub?: React.ReactNode; gold?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-100 p-5">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`font-display text-3xl mb-1 ${gold ? "text-[#b8975a]" : "text-[#2a2018]"}`}>{value}</p>
      {sub}
    </div>
  );
}
