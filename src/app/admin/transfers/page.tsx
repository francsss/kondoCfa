import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";
import { formatCnyFromFen, formatXaf } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_PROVIDER_STATUS_LABELS,
  TRANSFER_STATUS_LABELS
} from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function AdminTransfersPage() {
  await requireAdmin();

  const transfers = await prisma.transfer.findMany({
    include: { sender: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-kondo-navy">Tous les transferts</h1>
      <Card className="mt-6 p-0">
        <div className="table-scroll">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Expéditeur</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Frais</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Taux</th>
                <th className="px-4 py-3">CNY</th>
                <th className="px-4 py-3">Méthode</th>
                <th className="px-4 py-3">Paiement</th>
                <th className="px-4 py-3">Bénéficiaire</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Créé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td className="px-4 py-3 font-bold text-kondo-blue">
                    <Link href={`/admin/transfers/${transfer.id}`}>
                      {transfer.refCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {transfer.sender.firstName} {transfer.sender.lastName}
                    <div className="text-xs text-slate-500">{transfer.sender.email}</div>
                  </td>
                  <td className="px-4 py-3">{formatXaf(transfer.amountXaf)}</td>
                  <td className="px-4 py-3">{formatXaf(transfer.feeXaf)}</td>
                  <td className="px-4 py-3">{formatXaf(transfer.totalXaf)}</td>
                  <td className="px-4 py-3">{transfer.exchangeRate.toString()}</td>
                  <td className="px-4 py-3">
                    {formatCnyFromFen(transfer.payoutAmountCnyFen)} CNY
                  </td>
                  <td className="px-4 py-3">
                    {PAYMENT_METHOD_LABELS[transfer.paymentMethod]}
                  </td>
                  <td className="px-4 py-3">
                    {PAYMENT_PROVIDER_STATUS_LABELS[transfer.paymentProviderStatus]}
                  </td>
                  <td className="px-4 py-3">
                    {transfer.beneficiaryName}
                    <div className="text-xs text-slate-500">
                      {transfer.beneficiaryAlipayId}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={transfer.status}>
                      {TRANSFER_STATUS_LABELS[transfer.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDateTime(transfer.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
