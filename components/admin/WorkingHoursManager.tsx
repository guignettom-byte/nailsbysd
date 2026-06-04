"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface WorkingHour {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const DEFAULT_HOURS = { startTime: "09:00", endTime: "18:00" };

const DEFAULT_WORKING_HOURS: WorkingHour[] = [1, 2, 3, 4, 5, 6].map((d) => ({
  id: "",
  dayOfWeek: d,
  ...DEFAULT_HOURS,
  active: d !== 0,
}));

export default function WorkingHoursManager({
  initialHours,
}: {
  initialHours: WorkingHour[];
}) {
  const mergedHours = DAYS.map((_, i) => {
    const existing = initialHours.find((h) => h.dayOfWeek === i);
    return existing || { id: "", dayOfWeek: i, ...DEFAULT_HOURS, active: false };
  });

  const [hours, setHours] = useState(mergedHours);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateDay(dayOfWeek: number, field: keyof WorkingHour, value: string | boolean) {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
    );
  }

  async function save() {
    setSaving(true);
    for (const hour of hours) {
      if (hour.id) {
        await fetch(`/api/working-hours/${hour.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startTime: hour.startTime, endTime: hour.endTime, active: hour.active }),
        });
      } else if (hour.active) {
        const res = await fetch("/api/working-hours", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dayOfWeek: hour.dayOfWeek, startTime: hour.startTime, endTime: hour.endTime, active: true }),
        });
        const data = await res.json();
        if (data.workingHour) {
          setHours((prev) =>
            prev.map((h) => (h.dayOfWeek === hour.dayOfWeek ? { ...h, id: data.workingHour.id } : h))
          );
        }
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white border border-gray-100 max-w-2xl">
      <div className="divide-y divide-gray-50">
        {hours.map((hour) => (
          <div key={hour.dayOfWeek} className="px-6 py-5 flex items-center gap-4">
            <div className="w-28 shrink-0">
              <span className={`text-sm font-medium ${hour.active ? "text-[#2a2018]" : "text-gray-300"}`}>
                {DAYS[hour.dayOfWeek]}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hour.active}
                onChange={(e) => updateDay(hour.dayOfWeek, "active", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-[#b8975a] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
            {hour.active ? (
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="time"
                  value={hour.startTime}
                  onChange={(e) => updateDay(hour.dayOfWeek, "startTime", e.target.value)}
                  className="border-b border-gray-200 py-1 text-sm focus:outline-none focus:border-[#b8975a] w-24"
                />
                <span className="text-gray-300 text-sm">–</span>
                <input
                  type="time"
                  value={hour.endTime}
                  onChange={(e) => updateDay(hour.dayOfWeek, "endTime", e.target.value)}
                  className="border-b border-gray-200 py-1 text-sm focus:outline-none focus:border-[#b8975a] w-24"
                />
              </div>
            ) : (
              <span className="text-sm text-gray-300 flex-1">Fermé</span>
            )}
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-gray-100">
        <Button onClick={save} disabled={saving}>
          {saving ? "Enregistrement…" : saved ? "✓ Enregistré" : "Enregistrer les horaires"}
        </Button>
      </div>
    </div>
  );
}
