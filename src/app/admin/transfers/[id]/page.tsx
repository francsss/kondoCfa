import { notFound } from "next/navigation";
import { AdminTransferActions } from "@/components/admin/AdminTransferActions";
import { isMockPaymentMode } from "@/config/payments";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";
import { formatCnyFromFen, formatXaf } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { toTransferDto } from "@/lib/serializers";
import { requireAdmin } from "@/lib/server-auth";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_PROVIDER_STATUS_LABELS,
  TRANSFER_STATUS_LABELS
} from "@/lib/status";

function formatActor(
  actor: { firstName: string; lastName: string; email: string } | null
) {
  if (!actor) return "Non confirmé";
  return `${actor.firstName} ${actor.lastName} (${actor.email})`;
}

export const dynamic = "force-dynamic";

export default async function AdminTransferDetailPage({
  params
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const transfer = await prisma.transfer.findUnique({
    where: { id: params.id },
    include: {
      sender: {
        select: { id: true, email: true, firstName: true, lastName: true }
      },
      paymentConfirmedBy: {
        select: { firstName: true, lastName: true, email: true }
      },
      alipayPayoutCompletedBy: {
        select: { firstName: true, lastName: true, email: true }
      },
      cancelledBy: {
        select: { firstName: true, lastName: true, email: true }
      },
      paymentAttempts: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!transfer) notFound();
  const latestPaymentAttempt = transfer.paymentAttempts[0] ?? null;

  const rows = [
    ["Référence", transfer.refCode],
    ["Expéditeur", `${transfer.sender.firstName} ${transfer.sender.lastName}`],
    ["Email expéditeur", transfer.sender.email],
    ["Montant FCFA", formatXaf(transfer.amountXaf)],
    ["Frais", formatXaf(transfer.feeXaf)],
    ["Total FCFA", formatXaf(transfer.totalXaf)],
    ["Taux", transfer.exchangeRate.toString()],
    ["CNY à envoyer", `${formatCnyFromFen(transfer.payoutAmountCnyFen)} CNY`],
    ["Méthode paiement", PAYMENT_METHOD_LABELS[transfer.paymentMethod]],
    ["Opérateur Mobile Money", transfer.payerOperator ?? "Non renseigné"],
    ["Numéro Mobile Money à débiter", transfer.payerPhoneE164 ?? "Non renseigné"],
    ["Statut provider", PAYMENT_PROVIDER_STATUS_LABELS[transfer.paymentProviderStatus]],
    ["Nom bénéficiaire", transfer.beneficiaryName],
    ["Alipay ID", transfer.beneficiaryAlipayId],
    ["Téléphone bénéficiaire", transfer.beneficiaryPhone ?? "N/A"],
    ["Objet", transfer.purpose ?? "N/A"],
    ["Référence provider", transfer.paymentProviderReference ?? "N/A"],
    ["Statut tentative paiement", latestPaymentAttempt?.status ?? "Aucune"],
    ["Référence payout Alipay", transfer.alipayPayoutReference ?? "N/A"],
    ["Créé le", formatDateTime(transfer.createdAt)]
  ];

  const traceabilityRows = [
    [
      "Paiement Cameroun confirmé par",
      formatActor(transfer.paymentConfirmedBy)
    ],
    [
      "Date confirmation paiement",
      transfer.paymentConfirmedAt
        ? formatDateTime(transfer.paymentConfirmedAt)
        : "En attente"
    ],
    [
      "Paiement Alipay terminé par",
      transfer.alipayPayoutCompletedBy
        ? formatActor(transfer.alipayPayoutCompletedBy)
        : "En attente"
    ],
    [
      "Date paiement Alipay",
      transfer.alipayPayoutCompletedAt
        ? formatDateTime(transfer.alipayPayoutCompletedAt)
        : "En attente"
    ],
    ["Référence Alipay", transfer.alipayPayoutReference ?? "Non renseigné"],
    [
      "Annulé par",
      transfer.cancelledBy ? formatActor(transfer.cancelledBy) : "Non renseigné"
    ],
    ["Motif d’annulation", transfer.cancelReason ?? "Non renseigné"],
    [
      "Date annulation",
      transfer.cancelledAt ? formatDateTime(transfer.cancelledAt) : "Non renseigné"
    ]
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-kondo-navy">
            {transfer.refCode}
          </h1>
          <p className="mt-2 text-slate-600">Détail opérationnel du transfert.</p>
        </div>
        <Badge status={transfer.status}>{TRANSFER_STATUS_LABELS[transfer.status]}</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
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
        <AdminTransferActions
          initialTransfer={toTransferDto(transfer)}
          mockPaymentMode={isMockPaymentMode()}
        />
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-black text-kondo-navy">
          Traçabilité administrative
        </h2>
        <div className="mt-4 divide-y divide-slate-100">
          {traceabilityRows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-slate-500">{label}</span>
              <strong className="text-right text-kondo-navy">{value}</strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
