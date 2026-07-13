"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { KondoLogo } from "@/components/KondoLogo";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        country: formData.get("country"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        acceptedTerms: formData.get("acceptedTerms") === "on"
      })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Inscription impossible.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-kondo-sky px-4 py-10">
      <Card className="w-full max-w-2xl">
        <KondoLogo size="md" variant="wordmark" />
        <h1 className="mt-8 text-2xl font-black text-kondo-navy">Créer un compte</h1>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <Input label="Prénom" name="firstName" required />
          <Input label="Nom" name="lastName" required />
          <Input label="Email" name="email" type="email" required />
          <Input label="Téléphone" name="phone" required />
          <Input label="Pays" name="country" defaultValue="CM" required />
          <Input label="Mot de passe" name="password" type="password" required />
          <Input
            label="Confirmer le mot de passe"
            name="confirmPassword"
            type="password"
            required
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
            <input name="acceptedTerms" type="checkbox" required />
            J'accepte les conditions d'utilisation de la démo.
          </label>
          {error ? (
            <div className="sm:col-span-2">
              <Alert tone="danger">{error}</Alert>
            </div>
          ) : null}
          {loading ? (
            <div className="sm:col-span-2">
              <Loader label="Création du compte..." />
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit" fullWidth disabled={loading}>
              Créer mon compte
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà inscrit ?{" "}
          <Link className="font-bold text-kondo-blue" href="/login">
            Se connecter
          </Link>
        </p>
      </Card>
    </main>
  );
}
