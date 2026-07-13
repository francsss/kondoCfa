import { canAccessOwnTransfer } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/request";
import { toTransferDto } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);

  const transfer = await prisma.transfer.findUnique({
    where: { id: params.id },
    include: {
      sender: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    }
  });

  if (!transfer) return jsonError("Transfert introuvable.", 404);
  if (
    !canAccessOwnTransfer({
      role: user.role,
      userId: user.id,
      ownerId: transfer.senderId
    })
  ) {
    return jsonError("Accès refusé.", 403);
  }

  return Response.json({ transfer: toTransferDto(transfer) });
}
