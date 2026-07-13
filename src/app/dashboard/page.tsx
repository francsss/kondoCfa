import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { formatDateTime } from "@/lib/format";
import { formatXaf } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { requireSender } from "@/lib/server-auth";
import { TRANSFER_STATUS_LABELS } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireSender();
  const transfers = await prisma.transfer.findMany({
    where: { senderId: user.id },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  const totalSent = transfers
    .filter((transfer) => transfer.status !== "CANCELLED")
    .reduce((sum, transfer) => sum + transfer.totalXaf, 0);
  const inProgress = transfers.filter(
    (transfer) => transfer.status === "IN_PROGRESS"
  ).length;
  const success = transfers.filter((transfer) => transfer.status === "SUCCESS").length;

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black text-kondo-navy">
              Bonjour, {user.firstName}
            </h1>
            <p className="mt-2 text-slate-600">
              Statut du compte: <strong>{user.status}</strong>
            </p>
          </div>
          <Link href="/transfers/new">
            <Button type="button">Nouveau transfert</Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Total envoyé" value={formatXaf(totalSent)} />
          <StatCard label="En cours" value={inProgress} />
          <StatCard label="Réussis" value={success} />
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-black text-kondo-navy">Transferts récents</h2>
          {transfers.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Aucun transfert"
                description="Créez votre premier transfert vers la Chine en quelques étapes."
                action={
                  <Link href="/transfers/new">
                    <Button type="button">Nouveau transfert</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <Card className="mt-4 p-0">
              <div className="table-scroll">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Référence</th>
                      <th className="px-4 py-3">Montant</th>
                      <th className="px-4 py-3">CNY</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transfers.map((transfer) => (
                      <tr key={transfer.id}>
                        <td className="px-4 py-3 font-bold text-kondo-blue">
                          <Link href={`/transfers/${transfer.id}`}>
                            {transfer.refCode}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{formatXaf(transfer.amountXaf)}</td>
                        <td className="px-4 py-3">
                          {(transfer.payoutAmountCnyFen / 100).toFixed(2)} CNY
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
          )}
        </section>
      </main>
    </>
  );
}
