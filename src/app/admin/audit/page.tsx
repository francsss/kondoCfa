import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAdmin();

  const logs = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-kondo-navy">Audit logs</h1>
      <Card className="mt-6 p-0">
        <div className="table-scroll">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Acteur</th>
                <th className="px-4 py-3">Entité</th>
                <th className="px-4 py-3">Données</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-bold text-kondo-navy">{log.action}</td>
                  <td className="px-4 py-3">
                    {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "Système"}
                  </td>
                  <td className="px-4 py-3">
                    {log.entityType}
                    <div className="text-xs text-slate-500">{log.entityId}</div>
                  </td>
                  <td className="max-w-sm px-4 py-3">
                    <pre className="whitespace-pre-wrap break-words rounded bg-slate-50 p-2 text-xs text-slate-600">
                      {JSON.stringify(log.newValue ?? log.oldValue ?? {}, null, 2)}
                    </pre>
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
