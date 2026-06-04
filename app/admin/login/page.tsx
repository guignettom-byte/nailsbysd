"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-[#2a2018] mb-1">Nailsbysd</h1>
          <p className="text-xs tracking-[0.3em] uppercase text-[#b8975a]">Espace Administration</p>
        </div>

        <div className="bg-white p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input id="email" label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nailsbysd.ch" required />
            <Input id="password" label="Mot de passe" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required />
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-xs text-[#2a2018]/40 hover:text-[#b8975a] uppercase tracking-widest">
            ← Retour au site
          </a>
        </p>
      </div>
    </div>
  );
}
