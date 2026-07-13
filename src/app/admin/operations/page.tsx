import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";
import { formatCnyFromFen, formatXaf } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_PROVIDER_STATUS_LABELS
} from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function AdminOperationsPage() {
  await requireAdmin();

  const transfers = await prisma.transfer.findMany({
    where: { status: { in: ["CREATED", "IN_PROGRESS"] } },
    include: { sender: true },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-kondo-navy">File opérations</h1>
      <p className="mt-2 text-slate-600">
        Confirmez les paiements Cameroun puis complétez les payouts Alipay hors
        plateforme.
      </p>
      <div className="mt-6 grid gap-4">
        {transfers.map((transfer) => (
          <Card key={transfer.id}>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    className="text-lg font-black text-kondo-blue"
                    href={`/admin/transfers/${transfer.id}`}
                  >
                    {transfer.refCode}
                  </Link>
                  <Badge status={transfer.status} />
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <strong className="text-kondo-navy">Expéditeur:</strong>{" "}
                    {transfer.sender.firstName} {transfer.sender.lastName}
                  </div>
                  <div>
                    <strong className="text-kondo-navy">Total FCFA:</strong>{" "}
                    {formatXaf(transfer.totalXaf)}
                  </div>
                  <div>
                    <strong className="text-kondo-navy">CNY:</strong>{" "}
                    {formatCnyFromFen(transfer.payoutAmountCnyFen)} CNY
                  </div>
                  <div>
                    <strong className="text-kondo-navy">Méthode:</strong>{" "}
                    {PAYMENT_METHOD_LABELS[transfer.paymentMethod]}
                  </div>
                  <div>
                    <strong className="text-kondo-navy">Paiement:</strong>{" "}
                    {PAYMENT_PROVIDER_STATUS_LABELS[transfer.paymentProviderStatus]}
                  </div>
                  <div>
                    <strong className="text-kondo-navy">Bénéficiaire:</strong>{" "}
                    {transfer.beneficiaryName}
                  </div>
                  <div>
                    <strong className="text-kondo-navy">Alipay:</strong>{" "}
                    {transfer.beneficiaryAlipayId}
                  </div>
                  <div>
                    <strong className="text-kondo-navy">Créé:</strong>{" "}
                    {formatDateTime(transfer.createdAt)}
                  </div>
                </div>
              </div>
              <Link
                className="rounded-lg bg-kondo-blue px-4 py-2.5 text-center text-sm font-bold text-white"
                href={`/admin/transfers/${transfer.id}`}
              >
                Ouvrir
              </Link>
            </div>
          </Card>
        ))}
        {transfers.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">Aucune opération en attente.</p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
