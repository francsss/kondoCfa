import { canAccessAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/request";
import { toTransferDto } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);
  if (!canAccessAdmin(user.role)) return jsonError("Accès refusé.", 403);

  const transfers = await prisma.transfer.findMany({
    include: {
      sender: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return Response.json({ transfers: transfers.map(toTransferDto) });
}
