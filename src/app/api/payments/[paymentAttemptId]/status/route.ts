import { canAccessAdmin, canAccessOwnTransfer } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/request";
import { toPaymentAttemptDto, toTransferDto } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";

export async function GET(
  _request: Request,
  { params }: { params: { paymentAttemptId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);

  const paymentAttempt = await prisma.paymentAttempt.findUnique({
    where: { id: params.paymentAttemptId },
    include: {
      transfer: {
        include: {
          paymentAttempts: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }
    }
  });

  if (!paymentAttempt) return jsonError("Paiement introuvable.", 404);

  const allowed =
    canAccessAdmin(user.role) ||
    canAccessOwnTransfer({
      role: user.role,
      userId: user.id,
      ownerId: paymentAttempt.transfer.senderId
    });

  if (!allowed) return jsonError("Accès refusé.", 403);

  return Response.json({
    paymentAttempt: toPaymentAttemptDto(paymentAttempt),
    transfer: toTransferDto(paymentAttempt.transfer)
  });
}
