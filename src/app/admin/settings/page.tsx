import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { requireAdmin } from "@/lib/server-auth";
import { getEditableSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settings = await getEditableSettings();

  return (
    <div>
      <h1 className="text-3xl font-black text-kondo-navy">Paramètres</h1>
      <p className="mt-2 text-slate-600">
        Gérez les taux par tiers, les frais et les numéros de réception paiement.
      </p>
      <div className="mt-6">
        <AdminSettingsForm settings={settings} />
      </div>
    </div>
  );
}
