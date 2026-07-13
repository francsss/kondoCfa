import { NextRequest } from "next/server";
import { buildPaymentReceivedUpdate } from "@/lib/admin-transfer-actions";
import { canAccessAdmin } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getRequestMeta, jsonError } from "@/lib/request";
import { toTransferDto } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);
  if (!canAccessAdmin(user.role)) return jsonError("Accès refusé.", 403);

  const existing = await prisma.transfer.findUnique({ where: { id: params.id } });
  if (!existing) return jsonError("Transfert introuvable.", 404);

  const transfer = await prisma.transfer.update({
    where: { id: existing.id },
    data: buildPaymentReceivedUpdate(user.id)
  });

  await writeAuditLog({
    actorId: user.id,
    action: "ADMIN_PAYMENT_MARKED_RECEIVED",
    entityType: "Transfer",
    entityId: transfer.id,
    oldValue: { status: existing.status, paymentProviderStatus: existing.paymentProviderStatus },
    newValue: {
      status: transfer.status,
      paymentProviderStatus: transfer.paymentProviderStatus,
      paymentConfirmedById: user.id,
      paymentConfirmedAt: transfer.paymentConfirmedAt
    },
    ...getRequestMeta(request)
  });

  return Response.json({ transfer: toTransferDto(transfer) });
}
