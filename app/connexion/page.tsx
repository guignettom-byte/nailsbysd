"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/#reservation";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("client-credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-4xl text-[#2a2018]">Nailsbysd</Link>
          <p className="text-xs tracking-[0.3em] uppercase text-[#78716c] mt-1">Mon espace client</p>
        </div>

        <div className="bg-white p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input id="email" label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sophie@exemple.com" required />
            <Input id="password" label="Mot de passe" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required />
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-[#2a2018]/50">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-[#78716c] hover:underline">
            Créer mon compte
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

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}
