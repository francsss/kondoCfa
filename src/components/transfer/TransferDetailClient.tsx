"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Timeline } from "@/components/transfer/Timeline";
import { formatDateTime } from "@/lib/format";
import { formatXaf } from "@/lib/money";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_PROVIDER_STATUS_LABELS,
  TRANSFER_STATUS_HELP,
  TRANSFER_STATUS_LABELS
} from "@/lib/status";
import type { TransferDto } from "@/types/api";

export function TransferDetailClient({
  initialTransfer
}: {
  initialTransfer: TransferDto;
}) {
  const [transfer, setTransfer] = useState(initialTransfer);
  const [dialog, setDialog] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/transfers/${initialTransfer.id}`);
      if (!response.ok) return;
      const data = await response.json();
      const nextTransfer = data.transfer as TransferDto;

      if (transfer.status !== nextTransfer.status) {
        if (nextTransfer.status === "SUCCESS") {
          setDialog("Réussi");
        }
        if (nextTransfer.status === "CANCELLED") {
          setDialog("Annulé");
        }
      }

      setTransfer(nextTransfer);
    }, 5_000);

    return () => window.clearInterval(timer);
  }, [initialTransfer.id, transfer.status]);

  async function cancelTransfer() {
    setCancelError("");
    const response = await fetch(`/api/transfers/${transfer.id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: cancelReason })
    });
    const data = await response.json();
    if (!response.ok) {
      setCancelError(data.error ?? "Annulation impossible.");
      return;
    }
    setTransfer(data.transfer);
    setDialog("Annulé");
  }

  const rows = [
    ["Référence", transfer.refCode],
    ["Statut", TRANSFER_STATUS_LABELS[transfer.status]],
    ["Montant", formatXaf(transfer.amountXaf)],
    ["Frais", formatXaf(transfer.feeXaf)],
    ["Total", formatXaf(transfer.totalXaf)],
    ["Montant CNY", `${transfer.payoutAmountCny} CNY`],
    ["Méthode", PAYMENT_METHOD_LABELS[transfer.paymentMethod]],
    ["Paiement", PAYMENT_PROVIDER_STATUS_LABELS[transfer.paymentProviderStatus]],
    ["Bénéficiaire", transfer.beneficiaryName],
    ["Alipay ID", transfer.beneficiaryAlipayId],
    ["Créé le", formatDateTime(transfer.createdAt)]
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-kondo-navy">
            Transfert {transfer.refCode}
          </h1>
          <p className="mt-2 text-slate-600">{TRANSFER_STATUS_HELP[transfer.status]}</p>
        </div>
        <Badge status={transfer.status} />
      </div>

      <Timeline status={transfer.status} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="divide-y divide-slate-100">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3 text-sm">
                <span className="text-slate-500">{label}</span>
                <strong className="text-right text-kondo-navy">{value}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-black text-kondo-navy">Aide</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {transfer.status === "IN_PROGRESS"
              ? "L'équipe Kondo traite le payout Alipay manuellement. Cette page se met à jour toutes les 5 secondes."
              : TRANSFER_STATUS_HELP[transfer.status]}
          </p>
          {transfer.status !== "SUCCESS" && transfer.status !== "CANCELLED" ? (
            <div className="mt-5 space-y-3">
              <Input
                label="Motif d'annulation"
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
              />
              {cancelError ? (
                <p className="text-sm font-semibold text-red-600">{cancelError}</p>
              ) : null}
              <Button
                type="button"
                variant="danger"
                fullWidth
                onClick={cancelTransfer}
                disabled={cancelReason.trim().length < 3}
              >
                Annuler le transfert
              </Button>
            </div>
          ) : null}
        </Card>
      </div>

      <Modal
        open={Boolean(dialog)}
        title={dialog === "Réussi" ? "Transfert réussi" : "Transfert annulé"}
        onClose={() => setDialog("")}
      >
        {dialog === "Réussi"
          ? "Réussi. Le payout Alipay a été marqué comme complété."
          : "Paiement échoué ou annulé."}
      </Modal>
    </div>
  );
}
