"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import { LogOut, Calendar, Clock, ChevronRight } from "lucide-react";

interface Appointment {
  id: string;
  date: string;
  endTime: string;
  price: number;
  status: string;
  comment: string | null;
  service: { name: string; duration: number };
}

interface ClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  appointments: Appointment[];
}

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmé",
  PENDING: "En attente",
  CANCELLED: "Annulé",
};
const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-orange-100 text-orange-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export default function MonComptePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion?callbackUrl=/mon-compte");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/clients/me")
        .then((r) => r.json())
        .then((d) => { setClient(d.client); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center">
        <p className="text-[#78716c] text-sm">Chargement…</p>
      </div>
    );
  }

  async function handleCancel(apptId: string) {
    if (!confirm("Annuler ce rendez-vous ? Cette action est irréversible.")) return;
    const res = await fetch(`/api/appointments/${apptId}/cancel`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setClient((prev) => prev ? {
        ...prev,
        appointments: prev.appointments.map((a) =>
          a.id === apptId ? { ...a, status: "CANCELLED" } : a
        ),
      } : prev);
    } else {
      alert(data.error || "Impossible d'annuler ce rendez-vous.");
    }
  }

  if (!client) return null;

  const upcoming = client.appointments.filter(
    (a) => new Date(a.date) >= new Date() && a.status !== "CANCELLED"
  );
  const past = client.appointments.filter(
    (a) => new Date(a.date) < new Date() && a.status !== "CANCELLED"
  );
  return (
    <div className="min-h-screen bg-[#faf6f1]">
      {/* Header */}
      <header className="bg-white border-b border-[#e8d5c4] px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-display text-2xl text-[#2a2018]">Nailsbysd</Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-xs text-[#2a2018]/50 hover:text-[#78716c] uppercase tracking-widest transition-colors"
        >
          <LogOut size={14} />
          Déconnexion
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-[#78716c] mb-2">Mon espace</p>
          <h1 className="font-display text-5xl text-[#2a2018]">
            Bonjour, {client.firstName} ✨
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white p-5 text-center">
            <p className="font-display text-3xl text-[#78716c]">{past.length}</p>
            <p className="text-xs text-[#2a2018]/50 uppercase tracking-widest mt-1">Visites</p>
          </div>
          <div className="bg-white p-5 text-center">
            <p className="font-display text-3xl text-[#78716c]">{upcoming.length}</p>
            <p className="text-xs text-[#2a2018]/50 uppercase tracking-widest mt-1">À venir</p>
          </div>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-2xl text-[#2a2018] mb-4">Prochain rendez-vous</h2>
            {upcoming.map((appt) => (
              <AppointmentCard key={appt.id} appt={appt} highlight onCancel={handleCancel} />
            ))}
          </div>
        )}

        {/* CTA book */}
        <div className="bg-[#2a2018] px-8 py-6 flex items-center justify-between mb-10">
          <div>
            <p className="font-display text-xl text-white">Prendre un nouveau rendez-vous</p>
            <p className="text-xs text-white/50 mt-1">Réservez en 3 étapes depuis l'accueil</p>
          </div>
          <Link
            href="/#reservation"
            className="flex items-center gap-2 px-6 py-3 bg-[#78716c] text-white text-xs uppercase tracking-widest hover:bg-white hover:text-[#2a2018] transition-colors"
          >
            Réserver <ChevronRight size={14} />
          </Link>
        </div>

        {/* History */}
        <div>
          <h2 className="font-display text-2xl text-[#2a2018] mb-4">Historique</h2>
          {past.length === 0 ? (
            <div className="bg-white p-8 text-center text-[#2a2018]/40 text-sm">
              Aucune visite passée pour le moment
            </div>
          ) : (
            <div className="space-y-3">
              {past.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} />
              ))}
            </div>
          )}
        </div>

        {/* Infos compte */}
        <div className="mt-10 bg-white p-6">
          <h3 className="font-display text-xl text-[#2a2018] mb-4">Mes informations</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#2a2018]/50">Nom</dt>
              <dd className="font-medium">{client.firstName} {client.lastName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#2a2018]/50">Email</dt>
              <dd className="font-medium">{client.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#2a2018]/50">Téléphone</dt>
              <dd className="font-medium">{client.phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#2a2018]/50">Membre depuis</dt>
              <dd className="font-medium">
                {format(new Date(client.createdAt), "MMMM yyyy", { locale: fr })}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appt, highlight = false, onCancel }: {
  appt: Appointment;
  highlight?: boolean;
  onCancel?: (id: string) => void;
}) {
  const isUpcoming = new Date(appt.date) >= new Date() && appt.status !== "CANCELLED";
  const hoursUntil = (new Date(appt.date).getTime() - Date.now()) / 3600000;
  const canCancel = isUpcoming && hoursUntil >= 24;

  return (
    <div className={`bg-white p-5 ${highlight ? "border-l-4 border-[#78716c]" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-display text-lg text-[#2a2018]">{appt.service.name}</p>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-[#2a2018]/50">
              <Calendar size={12} />
              {format(new Date(appt.date), "EEEE d MMMM yyyy", { locale: fr })}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#2a2018]/50">
              <Clock size={12} />
              {format(new Date(appt.date), "HH:mm")}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0 space-y-1">
          <p className="font-display text-lg text-[#78716c]">{formatPrice(appt.price)}</p>
          <span className={`text-xs px-2 py-0.5 ${STATUS_COLOR[appt.status] || "bg-gray-100 text-gray-500"}`}>
            {STATUS_LABEL[appt.status] || appt.status}
          </span>
        </div>
      </div>
      {onCancel && isUpcoming && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {canCancel ? (
            <button
              onClick={() => onCancel(appt.id)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
            >
              Annuler ce rendez-vous
            </button>
          ) : (
            <p className="text-xs text-gray-300">
              Annulation impossible — moins de 24h avant le RDV
            </p>
          )}
        </div>
      )}
    </div>
  );
}
