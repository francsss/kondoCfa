import Link from "next/link";
import { KondoLogo } from "@/components/KondoLogo";
import { HeroSlider } from "@/components/landing/HeroSlider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatXaf } from "@/lib/money";

export default function LandingPage() {
  return (
    <main className="bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <KondoLogo size="sm" variant="wordmark" />
          <div className="flex shrink-0 items-center gap-3">
            <Link className="hidden text-sm font-bold text-kondo-navy lg:inline" href="/login">
              Se connecter
            </Link>
            <Link href="/register">
              <Button type="button" className="whitespace-nowrap px-3 sm:px-4">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section
        className="relative overflow-hidden bg-kondo-navy text-white"
        style={{
          backgroundImage:
            "linear-gradient(110deg, rgba(6, 27, 87, 0.94), rgba(8, 102, 255, 0.66)), url('/kondo-hero-bg.jpg'), radial-gradient(circle at 78% 18%, rgba(34, 184, 255, 0.45), transparent 30%), radial-gradient(circle at 18% 82%, rgba(255, 255, 255, 0.18), transparent 24%)",
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      >
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-kondo-cyan/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0_1px,transparent_1px_22px)] lg:block" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
              Prototype MVP V1
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-6xl">
              Transferts FCFA vers CNY, simples et suivis.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-50">
              Kondo aide les expéditeurs au Cameroun à préparer un transfert vers
              la Chine, payer par Orange Money ou MTN Mobile Money, puis suivre le
              traitement manuel du payout Alipay.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button type="button">Créer un compte</Button>
              </Link>
              <Link href="/login">
                <Button type="button" variant="secondary" className="bg-white">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
          <div className="self-center">
            <HeroSlider />
            <Card className="mt-5 border-white/15 bg-white/95 p-6">
              <KondoLogo size="lg" variant="full" />
              <div className="mt-8 rounded-lg bg-kondo-navy p-5 text-white">
                <div className="text-sm text-blue-100">Exemple de transfert</div>
                <div className="mt-2 text-4xl font-black">
                  {formatXaf(50_000)}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-white/10 p-3">
                    <div className="text-blue-100">Frais</div>
                    <strong>{formatXaf(1_750)}</strong>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3">
                    <div className="text-blue-100">Reçu en Chine</div>
                    <strong>625.00 CNY</strong>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Calcul en direct", "Le montant CNY, les frais et le total se mettent à jour pendant la saisie."],
            ["Statuts simples", "Créé, En cours, Annulé, Réussi. Rien de plus pour la V1."],
            ["Opérations admin", "L'équipe confirme le paiement reçu et marque le payout Alipay comme réussi."]
          ].map(([title, description]) => (
            <Card key={title}>
              <h2 className="text-xl font-black text-kondo-navy">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-black text-kondo-navy">Comment ça marche</h2>
            <div className="mt-6 space-y-4">
              {[
                "Créez un compte expéditeur.",
                "Saisissez le montant FCFA et choisissez Orange Money ou MTN Mobile Money.",
                "Confirmez le paiement mock en mode démo.",
                "L'admin effectue le payout Alipay hors plateforme et marque le transfert réussi."
              ].map((item, index) => (
                <div key={item} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kondo-blue text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-kondo-navy">Pourquoi Kondo</h2>
            <p className="mt-5 leading-7 text-slate-600">
              La V1 privilégie la clarté opérationnelle: devis lisible, paiement
              côté Cameroun, file admin, journal d'audit, et suivi automatique du
              statut pour l'expéditeur.
            </p>
            <div className="mt-6 rounded-lg border border-blue-100 bg-white p-5">
              <h3 className="font-black text-kondo-navy">FAQ sécurité et conformité</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Kondo V1 est un prototype/demo MVP. Un lancement réel nécessite
                une revue juridique, des contrats fournisseurs, une évaluation
                réglementaire, des contrôles KYC/AML et des intégrations paiement
                homologuées.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
          <KondoLogo size="sm" variant="full" />
          <p>© 2026 Kondo. Prototype web de transfert Cameroun Chine.</p>
        </div>
      </footer>
    </main>
  );
}
