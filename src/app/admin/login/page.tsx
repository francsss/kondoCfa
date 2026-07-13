import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { canAccessAdmin } from "@/lib/authorization";
import { getCurrentUser } from "@/lib/server-auth";

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user && canAccessAdmin(user.role)) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-kondo-navy px-4 py-10">
      <LoginForm
        portal="ADMIN"
        title="Accès administrateur Kondo"
        submitLabel="Se connecter à l’admin"
        redirectTo="/admin"
        alternateText="Compte client ?"
        alternateHref="/login"
        alternateLabel="Connexion client"
        cardClassName="border-blue-100"
      />
    </main>
  );
}
