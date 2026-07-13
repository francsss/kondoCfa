"use client";

import { useRouter } from "next/navigation";
import { KondoLogo } from "@/components/KondoLogo";
import { Button } from "@/components/ui/Button";

type NavbarProps = {
  user?: {
    firstName: string;
    role: string;
  } | null;
};

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <KondoLogo size="sm" variant="wordmark" />
        <nav className="flex items-center gap-3">
          <a className="text-sm font-semibold text-kondo-navy" href="/dashboard">
            Tableau de bord
          </a>
          {user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
            <a className="text-sm font-semibold text-kondo-navy" href="/admin">
              Admin
            </a>
          ) : null}
          {user ? (
            <div className="hidden text-sm text-slate-600 sm:block">
              Bonjour, <strong>{user.firstName}</strong>
            </div>
          ) : null}
          {user ? (
            <Button type="button" variant="secondary" onClick={logout}>
              Déconnexion
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
