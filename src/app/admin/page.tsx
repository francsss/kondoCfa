import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { formatDateTime } from "@/lib/format";
import { formatCnyFromFen, formatXaf } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { PAYMENT_METHOD_LABELS, TRANSFER_STATUS_LABELS } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    total,
    created,
    inProgress,
    cancelled,
    success,
    totalFcfaReceived,
    totalCnyToPayout,
    recent,
    queue
  ] = await Promise.all([
    prisma.transfer.count(),
    prisma.transfer.count({ where: { status: "CREATED" } }),
    prisma.transfer.count({ where: { status: "IN_PROGRESS" } }),
    prisma.transfer.count({ where: { status: "CANCELLED" } }),
    prisma.transfer.count({ where: { status: "SUCCESS" } }),
    prisma.transfer.aggregate({
      where: { paymentProviderStatus: "CONFIRMED" },
      _sum: { totalXaf: true }
    }),
    prisma.transfer.aggregate({
      where: { status: "IN_PROGRESS" },
      _sum: { payoutAmountCnyFen: true }
    }),
    prisma.transfer.findMany({
      include: { sender: true },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.transfer.findMany({
      where: { status: { in: ["CREATED", "IN_PROGRESS"] } },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
      take: 6
    })
  ]);

  return (
    <div>
      <h1 className="text-3xl font-black text-kondo-navy">Dashboard admin</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total transferts" value={total} />
        <StatCard label="Créés" value={created} />
        <StatCard label="En cours" value={inProgress} />
        <StatCard label="Annulés" value={cancelled} />
        <StatCard label="Réussis" value={success} />
        <StatCard
          label="FCFA reçus"
          value={formatXaf(totalFcfaReceived._sum.totalXaf ?? 0)}
        />
        <StatCard
          label="CNY à payer"
          value={`${formatCnyFromFen(totalCnyToPayout._sum.payoutAmountCnyFen ?? 0)} CNY`}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card className="p-0">
          <div className="border-b border-slate-100 p-4">
            <h2 className="font-black text-kondo-navy">Transferts récents</h2>
          </div>
          <div className="table-scroll">
            <table className="w-full min-w-[720px] text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                {recent.map((transfer) => (
                  <tr key={transfer.id}>
                    <td className="px-4 py-3 font-bold text-kondo-blue">
                      <Link href={`/admin/transfers/${transfer.id}`}>
                        {transfer.refCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {transfer.sender.firstName} {transfer.sender.lastName}
                    </td>
                    <td className="px-4 py-3">{formatXaf(transfer.totalXaf)}</td>
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

        <Card className="p-0">
          <div className="border-b border-slate-100 p-4">
            <h2 className="font-black text-kondo-navy">File opérations manuelles</h2>
          </div>
          <div className="table-scroll">
            <table className="w-full min-w-[720px] text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                {queue.map((transfer) => (
                  <tr key={transfer.id}>
                    <td className="px-4 py-3 font-bold text-kondo-blue">
                      <Link href={`/admin/transfers/${transfer.id}`}>
                        {transfer.refCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {PAYMENT_METHOD_LABELS[transfer.paymentMethod]}
                    </td>
                    <td className="px-4 py-3">
                      {formatCnyFromFen(transfer.payoutAmountCnyFen)} CNY
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={transfer.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
