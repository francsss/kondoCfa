"use client";

import { FormEvent, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import type { EditableSettings } from "@/lib/settings";

export function AdminSettingsForm({
  settings
}: {
  settings: EditableSettings;
}) {
  const [minimumAmountXaf, setMinimumAmountXaf] = useState(
    String(settings.minimumAmountXaf)
  );
  const [maximumAmountXaf, setMaximumAmountXaf] = useState(
    String(settings.maximumAmountXaf)
  );
  const [feeBps, setFeeBps] = useState(String(settings.feeBps));
  const [fixedFeeXaf, setFixedFeeXaf] = useState(String(settings.fixedFeeXaf));
  const [orangeMoneyReceiverNumber, setOrangeMoneyReceiverNumber] = useState(
    settings.orangeMoneyReceiverNumber
  );
  const [mtnMomoReceiverNumber, setMtnMomoReceiverNumber] = useState(
    settings.mtnMomoReceiverNumber
  );
  const [rateTiers, setRateTiers] = useState(
    JSON.stringify(settings.rateTiers, null, 2)
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    let parsedTiers: unknown;
    try {
      parsedTiers = JSON.parse(rateTiers);
    } catch {
      setLoading(false);
      setError("Le JSON des taux est invalide.");
      return;
    }

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        minimumAmountXaf: Number(minimumAmountXaf),
        maximumAmountXaf: Number(maximumAmountXaf),
        feeBps: Number(feeBps),
        fixedFeeXaf: Number(fixedFeeXaf),
        rateTiers: parsedTiers,
        orangeMoneyReceiverNumber,
        mtnMomoReceiverNumber
      })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Mise à jour impossible.");
      return;
    }

    setMessage("Paramètres mis à jour.");
  }

  return (
    <Card>
      <form className="grid gap-4 lg:grid-cols-2" onSubmit={submit}>
        <Input
          label="Montant minimum XAF"
          type="number"
          value={minimumAmountXaf}
          onChange={(event) => setMinimumAmountXaf(event.target.value)}
        />
        <Input
          label="Montant maximum XAF"
          type="number"
          value={maximumAmountXaf}
          onChange={(event) => setMaximumAmountXaf(event.target.value)}
        />
        <Input
          label="Frais en basis points"
          type="number"
          value={feeBps}
          onChange={(event) => setFeeBps(event.target.value)}
        />
        <Input
          label="Frais fixes XAF"
          type="number"
          value={fixedFeeXaf}
          onChange={(event) => setFixedFeeXaf(event.target.value)}
        />
        <Input
          label="Numéro récepteur Orange Money"
          value={orangeMoneyReceiverNumber}
          onChange={(event) => setOrangeMoneyReceiverNumber(event.target.value)}
        />
        <Input
          label="Numéro récepteur MTN MoMo"
          value={mtnMomoReceiverNumber}
          onChange={(event) => setMtnMomoReceiverNumber(event.target.value)}
        />
        <label className="block lg:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-kondo-ink">
            Tiers de taux JSON
          </span>
          <textarea
            className="min-h-64 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm outline-none transition focus:border-kondo-blue focus:ring-2 focus:ring-blue-100"
            value={rateTiers}
            onChange={(event) => setRateTiers(event.target.value)}
          />
        </label>
        {error ? (
          <div className="lg:col-span-2">
            <Alert tone="danger">{error}</Alert>
          </div>
        ) : null}
        {message ? (
          <div className="lg:col-span-2">
            <Alert tone="success">{message}</Alert>
          </div>
        ) : null}
        {loading ? (
          <div className="lg:col-span-2">
            <Loader label="Sauvegarde..." />
          </div>
        ) : null}
        <div className="lg:col-span-2">
          <Button type="submit" disabled={loading}>
            Enregistrer les paramètres
          </Button>
        </div>
      </form>
    </Card>
  );
}
