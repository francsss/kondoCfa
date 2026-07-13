import { canAccessAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/request";
import { getCurrentUser } from "@/lib/server-auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);
  if (!canAccessAdmin(user.role)) return jsonError("Accès refusé.", 403);

  const logs = await prisma.auditLog.findMany({
    include: {
      actor: {
        select: { email: true, firstName: true, lastName: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return Response.json({
    logs: logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString()
    }))
  });
}
