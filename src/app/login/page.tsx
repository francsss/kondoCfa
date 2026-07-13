import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-kondo-sky px-4 py-10">
      <LoginForm
        portal="SENDER"
        title="Connexion client"
        submitLabel="Se connecter"
        redirectTo="/dashboard"
        alternateText="Pas encore de compte ?"
        alternateHref="/register"
        alternateLabel="Créer un compte"
      />
    </main>
  );
}
