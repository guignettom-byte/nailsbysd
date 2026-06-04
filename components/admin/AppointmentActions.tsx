"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentActions({
  apptId,
  currentStatus,
}: {
  apptId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/appointments/${apptId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function cancel() {
    if (!confirm("Confirmer l'annulation de ce rendez-vous ?")) return;
    await updateStatus("CANCELLED");
  }

  if (currentStatus === "CANCELLED") {
    return <span className="text-xs text-gray-300">—</span>;
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {currentStatus === "PENDING" && (
        <button
          onClick={() => updateStatus("CONFIRMED")}
          disabled={loading}
          className="text-xs px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
        >
          Confirmer
        </button>
      )}
      <button
        onClick={cancel}
        disabled={loading}
        className="text-xs px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        Annuler
      </button>
    </div>
  );
}
