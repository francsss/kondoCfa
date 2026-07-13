import { NextRequest } from "next/server";
import { buildAdminCancelTransferUpdate } from "@/lib/admin-transfer-actions";
import { canAccessAdmin } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getRequestMeta, jsonError } from "@/lib/request";
import { toTransferDto } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import { cancelTransferSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);
  if (!canAccessAdmin(user.role)) return jsonError("Accès refusé.", 403);

  const payload = await request.json().catch(() => null);
  const parsed = cancelTransferSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Un motif est requis.");

  const existing = await prisma.transfer.findUnique({ where: { id: params.id } });
  if (!existing) return jsonError("Transfert introuvable.", 404);

  const transfer = await prisma.transfer.update({
    where: { id: existing.id },
    data: buildAdminCancelTransferUpdate({
      adminId: user.id,
      reason: parsed.data.reason,
      keepConfirmedPayment: existing.paymentProviderStatus === "CONFIRMED"
    })
  });

  await writeAuditLog({
    actorId: user.id,
    action: "TRANSFER_CANCELLED_BY_ADMIN",
    entityType: "Transfer",
    entityId: transfer.id,
    oldValue: { status: existing.status },
    newValue: {
      status: transfer.status,
      reason: parsed.data.reason,
      cancelledById: user.id,
      cancelledAt: transfer.cancelledAt
    },
    ...getRequestMeta(request)
  });

  return Response.json({ transfer: toTransferDto(transfer) });
}
