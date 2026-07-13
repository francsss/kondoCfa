import { NextRequest } from "next/server";
import { buildPayoutCompletedUpdate } from "@/lib/admin-transfer-actions";
import { canAccessAdmin } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getRequestMeta, jsonError } from "@/lib/request";
import { toTransferDto } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import { completePayoutSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);
  if (!canAccessAdmin(user.role)) return jsonError("Accès refusé.", 403);

  const payload = await request.json().catch(() => null);
  const parsed = completePayoutSchema.safeParse(payload);
  if (!parsed.success) return jsonError("La référence Alipay est requise.");

  const existing = await prisma.transfer.findUnique({ where: { id: params.id } });
  if (!existing) return jsonError("Transfert introuvable.", 404);

  const transfer = await prisma.transfer.update({
    where: { id: existing.id },
    data: buildPayoutCompletedUpdate({
      adminId: user.id,
      alipayPayoutReference: parsed.data.alipayPayoutReference
    })
  });

  await writeAuditLog({
    actorId: user.id,
    action: "ADMIN_PAYOUT_COMPLETED",
    entityType: "Transfer",
    entityId: transfer.id,
    oldValue: { status: existing.status },
    newValue: {
      status: transfer.status,
      alipayPayoutReference: transfer.alipayPayoutReference,
      alipayPayoutCompletedById: user.id,
      alipayPayoutCompletedAt: transfer.alipayPayoutCompletedAt
    },
    ...getRequestMeta(request)
  });

  return Response.json({ transfer: toTransferDto(transfer) });
}
