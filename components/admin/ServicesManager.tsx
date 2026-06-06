"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string | null;
  active: boolean;
}

export default function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", duration: 60, price: 0, description: "" });
  const [loading, setLoading] = useState(false);

  function startEdit(service: Service) {
    setEditing(service.id);
    setForm({
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description || "",
    });
  }

  async function saveEdit(id: string) {
    setLoading(true);
    const res = await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setServices((prev) => prev.map((s) => (s.id === id ? data.service : s)));
    setEditing(null);
    setLoading(false);
  }

  async function deleteService(id: string) {
    if (!confirm("Désactiver cette prestation ?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: false } : s)));
  }

  async function createService() {
    setLoading(true);
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setServices((prev) => [...prev, data.service]);
    setCreating(false);
    setForm({ name: "", duration: 60, price: 0, description: "" });
    setLoading(false);
  }

  return (
    <div>
      <div className="bg-white border border-gray-100 mb-6">
        <div className="divide-y divide-gray-50">
          {services.map((service) => (
            <div key={service.id} className={`px-6 py-4 ${!service.active ? "opacity-40" : ""}`}>
              {editing === service.id ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <Input label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <Input label="Durée (min)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
                  <Input label="Prix (CHF)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(service.id)} disabled={loading}>
                      <Check size={14} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[#2a2018]">{service.name}</p>
                    <p className="text-xs text-gray-400">{formatDuration(service.duration)} · {formatPrice(service.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!service.active && <span className="text-xs text-red-400">Inactif</span>}
                    <button onClick={() => startEdit(service)} className="p-2 text-gray-400 hover:text-[#78716c]">
                      <Pencil size={16} />
                    </button>
                    {service.active && (
                      <button onClick={() => deleteService(service.id)} className="p-2 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {creating ? (
        <div className="bg-white border border-[#78716c] p-6">
          <h3 className="font-display text-xl text-[#2a2018] mb-4">Nouvelle prestation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Input label="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Manucure" />
            <Input label="Durée (min) *" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
            <Input label="Prix CHF *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description courte..." />
          <div className="flex gap-3 mt-4">
            <Button onClick={createService} disabled={loading || !form.name}>
              Créer
            </Button>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => { setCreating(true); setForm({ name: "", duration: 60, price: 0, description: "" }); }} variant="outline">
          <Plus size={16} className="mr-2" /> Ajouter une prestation
        </Button>
      )}
    </div>
  );
}
