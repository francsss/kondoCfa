"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";
import { formatXaf } from "@/lib/money";
import {
  PAYMENT_ATTEMPT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS
} from "@/lib/status";
import type { PaymentAttemptDto, TransferDto } from "@/types/api";

function statusClass(status: PaymentAttemptDto["status"]) {
  if (status === "SUCCESS") return "bg-emerald-50 text-emerald-700";
  if (status === "FAILED") return "bg-red-50 text-red-700";
  return "bg-blue-50 text-kondo-blue";
}

export function PaymentStatusClient({
  initialTransfer,
  initialPaymentAttempt
}: {
  initialTransfer: TransferDto;
  initialPaymentAttempt: PaymentAttemptDto | null;
}) {
  const [transfer, setTransfer] = useState(initialTransfer);
  const [paymentAttempt, setPaymentAttempt] = useState(initialPaymentAttempt);

  useEffect(() => {
    if (!paymentAttempt || paymentAttempt.status !== "PENDING") return;

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/payments/${paymentAttempt.id}/status`);
      if (!response.ok) return;
      const data = await response.json();
      setPaymentAttempt(data.paymentAttempt);
      setTransfer(data.transfer);
    }, 4_000);

    return () => window.clearInterval(timer);
  }, [paymentAttempt]);

  const providerSentence = useMemo(() => {
    const phone =
      paymentAttempt?.payerPhoneE164 ??
      transfer.payerPhoneE164 ??
      "le numéro Mobile Money";

    if (transfer.paymentMethod === "MTN_MOMO") {
      return `Une demande de paiement MTN Mobile Money a été envoyée au numéro ${phone}.`;
    }

    return `Une demande de paiement Orange Money a été envoyée au numéro ${phone}.`;
  }, [paymentAttempt, transfer.payerPhoneE164, transfer.paymentMethod]);

  const status = paymentAttempt?.status ?? "CREATED";
  const helpText =
    status === "SUCCESS"
      ? "Paiement reçu. Votre transfert est maintenant en cours de traitement."
      : status === "FAILED"
        ? "Le paiement a échoué. Vous pouvez réessayer ou choisir une autre méthode."
        : "Veuillez confirmer le paiement sur votre téléphone.";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-kondo-navy">
          Paiement Mobile Money en attente
        </h1>
        <p className="mt-2 text-slate-600">{providerSentence}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-500">
                Statut paiement
              </div>
              <div className="mt-1 text-2xl font-black text-kondo-navy">
                {PAYMENT_ATTEMPT_STATUS_LABELS[status]}
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-black ${statusClass(
                status
              )}`}
            >
              {PAYMENT_ATTEMPT_STATUS_LABELS[status]}
            </span>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {[
              ["Référence transfert", transfer.refCode],
              ["Provider", PAYMENT_METHOD_LABELS[transfer.paymentMethod]],
              [
                "Numéro à débiter",
                paymentAttempt?.payerPhoneE164 ?? transfer.payerPhoneE164 ?? "N/A"
              ],
              [
                "Montant à payer",
                formatXaf(paymentAttempt?.amountXaf ?? transfer.totalXaf)
              ],
              [
                "Référence provider",
                paymentAttempt?.providerRequestId ?? "En cours de création"
              ],
              [
                "Dernière mise à jour",
                paymentAttempt?.updatedAt
                  ? formatDateTime(paymentAttempt.updatedAt)
                  : formatDateTime(transfer.updatedAt)
              ]
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3 text-sm">
                <span className="text-slate-500">{label}</span>
                <strong className="text-right text-kondo-navy">{value}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-black text-kondo-navy">Aide</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{helpText}</p>
          {status === "PENDING" ? (
            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-kondo-blue">
              Vous allez recevoir une demande de confirmation sur votre téléphone.
            </p>
          ) : null}
          {status === "FAILED" && paymentAttempt?.failureReason ? (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
              Motif : {paymentAttempt.failureReason}
            </p>
          ) : null}
          <div className="mt-5">
            <Link href={`/transfers/${transfer.id}`}>
              <Button type="button" fullWidth>
                Voir le transfert
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
