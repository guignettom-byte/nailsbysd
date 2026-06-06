"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/clients/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Une erreur s'est produite");
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    const signInRes = await signIn("client-credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
      callbackUrl: "/#reservation",
    });

    setLoading(false);
    if (signInRes?.ok) {
      router.push("/#reservation");
    } else {
      router.push("/connexion");
    }
  }

  return (
    <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-4xl text-[#2a2018]">Nailsbysd</Link>
          <p className="text-xs tracking-[0.3em] uppercase text-[#78716c] mt-1">Créer mon compte</p>
        </div>

        <div className="bg-white p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input id="firstName" label="Prénom *" value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="Sophie" required />
              <Input id="lastName" label="Nom *" value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Martin" required />
            </div>
            <Input id="email" label="Email *" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="sophie@exemple.com" required />
            <Input id="phone" label="Téléphone *" type="tel" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+41 79 000 00 00" required />
            <Input id="password" label="Mot de passe *" type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="8 caractères minimum" required />
            <Input id="confirm" label="Confirmer le mot de passe *" type="password" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="••••••••" required />

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Création du compte…" : "Créer mon compte"}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-[#2a2018]/50">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-[#78716c] hover:underline">
            Se connecter
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-xs text-[#2a2018]/30 hover:text-[#78716c] uppercase tracking-widest">
            ← Retour au site
          </Link>
        </p>
      </div>
    </div>
  );
}
