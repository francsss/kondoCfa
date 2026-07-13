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
import type { LoginPortal } from "@/lib/login-policy";

type LoginFormProps = {
  portal: LoginPortal;
  title: string;
  submitLabel: string;
  redirectTo: string;
  alternateHref: string;
  alternateText: string;
  alternateLabel: string;
  cardClassName?: string;
};

export function LoginForm({
  portal,
  title,
  submitLabel,
  redirectTo,
  alternateHref,
  alternateText,
  alternateLabel,
  cardClassName = ""
}: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        loginPortal: portal
      })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Connexion impossible.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card className={["w-full max-w-md", cardClassName].join(" ")}>
      <KondoLogo size="md" variant="wordmark" />
      <h1 className="mt-8 text-2xl font-black text-kondo-navy">{title}</h1>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <Input label="Email" name="email" type="email" required autoComplete="email" />
        <Input
          label="Mot de passe"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <span className="text-sm font-semibold text-kondo-blue">
            Mot de passe oublié ?
          </span>
        </div>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        {loading ? <Loader label="Connexion..." /> : null}
        <Button type="submit" fullWidth disabled={loading}>
          {submitLabel}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        {alternateText}{" "}
        <Link className="font-bold text-kondo-blue" href={alternateHref}>
          {alternateLabel}
        </Link>
      </p>
    </Card>
  );
}
