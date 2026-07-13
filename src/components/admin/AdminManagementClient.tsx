"use client";

import { FormEvent, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Select } from "@/components/ui/Select";
import { formatDateTime } from "@/lib/format";

type AdminDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  country: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export function AdminManagementClient({
  initialAdmins
}: {
  initialAdmins: AdminDto[];
}) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function createAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading("create");
    setMessage("");
    setError("");

    const formData = new FormData(form);
    const response = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        country: formData.get("country"),
        temporaryPassword: formData.get("temporaryPassword"),
        confirmTemporaryPassword: formData.get("confirmTemporaryPassword"),
        status: formData.get("status")
      })
    });
    const data = await response.json();
    setLoading("");

    if (!response.ok) {
      setError(data.error ?? "Création impossible.");
      return;
    }

    setAdmins((current) => [data.admin, ...current]);
    setMessage("Admin créé avec succès.");
    form.reset();
  }

  async function updateStatus(adminId: string, status: "ACTIVE" | "SUSPENDED") {
    setLoading(adminId);
    setMessage("");
    setError("");

    const response = await fetch(`/api/admin/admins/${adminId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    setLoading("");

    if (!response.ok) {
      setError(data.error ?? "Mise à jour impossible.");
      return;
    }

    setAdmins((current) =>
      current.map((admin) => (admin.id === adminId ? data.admin : admin))
    );
    setMessage(
      status === "ACTIVE" ? "Admin réactivé." : "Admin suspendu."
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="p-0">
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-black text-kondo-navy">Liste des administrateurs</h2>
        </div>
        <div className="table-scroll">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Créé</th>
                <th className="px-4 py-3">Mis à jour</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-4 py-3 font-bold text-kondo-navy">
                    {admin.firstName} {admin.lastName}
                  </td>
                  <td className="px-4 py-3">{admin.email}</td>
                  <td className="px-4 py-3">{admin.phone || "Non renseigné"}</td>
                  <td className="px-4 py-3">{admin.role}</td>
                  <td className="px-4 py-3">
                    <Badge>{admin.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDateTime(admin.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDateTime(admin.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    {admin.role === "ADMIN" ? (
                      admin.status === "ACTIVE" ? (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={loading === admin.id}
                          onClick={() => updateStatus(admin.id, "SUSPENDED")}
                        >
                          Suspendre
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={loading === admin.id}
                          onClick={() => updateStatus(admin.id, "ACTIVE")}
                        >
                          Réactiver
                        </Button>
                      )
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">
                        Protégé
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-black text-kondo-navy">Créer un admin</h2>
        <form className="mt-5 space-y-4" onSubmit={createAdmin}>
          <Input label="Prénom" name="firstName" required />
          <Input label="Nom" name="lastName" required />
          <Input label="Email" name="email" type="email" required />
          <Input label="Téléphone" name="phone" />
          <Input label="Pays" name="country" />
          <Input
            label="Mot de passe temporaire"
            name="temporaryPassword"
            type="password"
            required
          />
          <Input
            label="Confirmer le mot de passe temporaire"
            name="confirmTemporaryPassword"
            type="password"
            required
          />
          <Select
            label="Statut"
            name="status"
            defaultValue="ACTIVE"
            options={[
              { value: "ACTIVE", label: "ACTIVE" },
              { value: "SUSPENDED", label: "SUSPENDED" }
            ]}
          />
          {loading === "create" ? <Loader label="Création..." /> : null}
          {message ? <Alert tone="success">{message}</Alert> : null}
          {error ? <Alert tone="danger">{error}</Alert> : null}
          <Button type="submit" fullWidth disabled={Boolean(loading)}>
            Créer admin
          </Button>
        </form>
      </Card>
    </div>
  );
}
