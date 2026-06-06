"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import { format, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import "react-day-picker/dist/style.css";

interface BlockedDay {
  id: string;
  date: Date;
  reason: string | null;
  label: string | null;
}

const REASONS = [
  { value: "CONGE", label: "Congé" },
  { value: "FORMATION", label: "Formation" },
  { value: "FERIE", label: "Jour férié" },
  { value: "AUTRE", label: "Autre" },
];

export default function BlockedDaysManager({
  initialBlockedDays,
}: {
  initialBlockedDays: BlockedDay[];
}) {
  const [blockedDays, setBlockedDays] = useState(initialBlockedDays);
  const [selected, setSelected] = useState<Date | undefined>();
  const [reason, setReason] = useState("CONGE");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const blockedDates = blockedDays.map((b) => new Date(b.date));

  async function addBlockedDay() {
    if (!selected) return;
    setLoading(true);
    const res = await fetch("/api/blocked-days", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: startOfDay(selected).toISOString(),
        reason,
        label: label || REASONS.find((r) => r.value === reason)?.label,
      }),
    });
    const data = await res.json();
    setBlockedDays((prev) => {
      const existing = prev.findIndex(
        (b) => format(new Date(b.date), "yyyy-MM-dd") === format(selected, "yyyy-MM-dd")
      );
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = data.blockedDay;
        return updated;
      }
      return [...prev, data.blockedDay];
    });
    setSelected(undefined);
    setLabel("");
    setLoading(false);
  }

  async function removeBlockedDay(dateStr: string) {
    await fetch(`/api/blocked-days?date=${dateStr}`, { method: "DELETE" });
    setBlockedDays((prev) =>
      prev.filter(
        (b) => format(new Date(b.date), "yyyy-MM-dd") !== format(new Date(dateStr), "yyyy-MM-dd")
      )
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Calendar picker */}
      <div className="bg-white border border-gray-100 p-6">
        <h2 className="font-display text-xl text-[#2a2018] mb-4">Sélectionner un jour</h2>
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={setSelected}
          locale={fr}
          modifiers={{ blocked: blockedDates }}
          modifiersStyles={{
            blocked: { backgroundColor: "#fde8e8", color: "#c53030", textDecoration: "line-through" },
          }}
          className="!font-body"
        />
        {selected && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-[#2a2018]">
              {format(selected, "EEEE d MMMM yyyy", { locale: fr })}
            </p>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Raison</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#78716c]"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Note (optionnel)</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Formation nail art avancé"
                className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#78716c]"
              />
            </div>
            <Button onClick={addBlockedDay} disabled={loading} className="w-full">
              Bloquer ce jour
            </Button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-display text-xl text-[#2a2018]">
            Jours bloqués ({blockedDays.length})
          </h2>
        </div>
        {blockedDays.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            Aucun jour bloqué
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {[...blockedDays]
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((day) => (
                <div key={day.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#2a2018] text-sm">
                      {format(new Date(day.date), "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {REASONS.find((r) => r.value === day.reason)?.label || day.reason}
                      {day.label && ` · ${day.label}`}
                    </p>
                  </div>
                  <button
                    onClick={() => removeBlockedDay(format(new Date(day.date), "yyyy-MM-dd"))}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
