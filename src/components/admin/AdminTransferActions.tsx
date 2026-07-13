"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { TRANSFER_STATUS_LABELS } from "@/lib/status";
import type { TransferDto } from "@/types/api";

export function AdminTransferActions({
  initialTransfer,
  mockPaymentMode
}: {
  initialTransfer: TransferDto;
  mockPaymentMode: boolean;
}) {
  const [transfer, setTransfer] = useState(initialTransfer);
  const [alipayPayoutReference, setAlipayPayoutReference] = useState(
    initialTransfer.alipayPayoutReference ?? ""
  );
  const [cancelReason, setCancelReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  async function postAction(path: string, body?: unknown) {
    setLoading(path);
    setMessage("");
    setError("");
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();
    setLoading("");

    if (!response.ok) {
      setError(data.error ?? "Action impossible.");
      return;
    }

    setTransfer({
      ...data.transfer,
      latestPaymentAttempt:
        data.paymentAttempt ?? data.transfer.latestPaymentAttempt ?? null
    });
    setMessage("Action enregistrée avec succès.");
  }

  const latestPaymentAttempt = transfer.latestPaymentAttempt;
  const canSimulatePayment =
    mockPaymentMode &&
    transfer.status === "CREATED" &&
    latestPaymentAttempt?.status === "PENDING";

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-kondo-navy">Actions admin</h2>
        <Badge status={transfer.status}>{TRANSFER_STATUS_LABELS[transfer.status]}</Badge>
      </div>

      <div className="mt-5 space-y-4">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          disabled={Boolean(loading) || transfer.status === "SUCCESS"}
          onClick={() =>
            postAction(`/api/admin/transfers/${transfer.id}/mark-payment-received`)
          }
        >
          Marquer paiement reçu
        </Button>

        {canSimulatePayment ? (
          <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <div>
              <div className="text-sm font-black text-kondo-navy">
                Simulation Mobile Money
              </div>
              <p className="mt-1 text-xs font-semibold text-kondo-blue">
                Mode simulation : aucun vrai paiement ne sera effectué.
              </p>
            </div>
            <Button
              type="button"
              fullWidth
              disabled={Boolean(loading)}
              onClick={() =>
                postAction(
                  `/api/payments/mock/${latestPaymentAttempt.id}/success`
                )
              }
            >
              Simuler paiement MTN/Orange réussi
            </Button>
            <Button
              type="button"
              variant="danger"
              fullWidth
              disabled={Boolean(loading)}
              onClick={() =>
                postAction(`/api/payments/mock/${latestPaymentAttempt.id}/fail`, {
                  failureReason: "User cancelled payment"
                })
              }
            >
              Simuler paiement MTN/Orange échoué
            </Button>
          </div>
        ) : null}

        <div className="space-y-3 rounded-lg border border-slate-100 p-3">
          <Input
            label="Référence Alipay"
            value={alipayPayoutReference}
            onChange={(event) => setAlipayPayoutReference(event.target.value)}
          />
          <Button
            type="button"
            fullWidth
            disabled={
              Boolean(loading) ||
              alipayPayoutReference.trim().length < 3 ||
              transfer.status === "SUCCESS"
            }
            onClick={() =>
              postAction(`/api/admin/transfers/${transfer.id}/complete-payout`, {
                alipayPayoutReference
              })
            }
          >
            Marquer comme réussi
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-red-100 p-3">
          <Input
            label="Motif d'annulation"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
          />
          <Button
            type="button"
            variant="danger"
            fullWidth
            disabled={
              Boolean(loading) ||
              cancelReason.trim().length < 3 ||
              transfer.status === "SUCCESS" ||
              transfer.status === "CANCELLED"
            }
            onClick={() =>
              postAction(`/api/admin/transfers/${transfer.id}/cancel`, {
                reason: cancelReason
              })
            }
          >
            Annuler le transfert
          </Button>
        </div>

        {loading ? <Loader label="Traitement de l'action..." /> : null}
        {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      </div>
    </Card>
  );
}
