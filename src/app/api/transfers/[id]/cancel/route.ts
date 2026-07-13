import { NextRequest } from "next/server";
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

  const payload = await request.json().catch(() => null);
  const parsed = cancelTransferSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Un motif est requis.");

  const existing = await prisma.transfer.findUnique({ where: { id: params.id } });
  if (!existing) return jsonError("Transfert introuvable.", 404);
  if (existing.senderId !== user.id) return jsonError("Accès refusé.", 403);
  if (existing.status === "SUCCESS") {
    return jsonError("Un transfert réussi ne peut plus être annulé.");
  }

  const transfer = await prisma.transfer.update({
    where: { id: existing.id },
    data: {
      status: "CANCELLED",
      paymentProviderStatus: "CANCELLED",
      cancelReason: parsed.data.reason,
      cancelledAt: new Date(),
      cancelledById: user.id
    }
  });

  await writeAuditLog({
    actorId: user.id,
    action: "TRANSFER_CANCELLED",
    entityType: "Transfer",
    entityId: transfer.id,
    oldValue: { status: existing.status },
    newValue: { status: transfer.status, reason: parsed.data.reason },
    ...getRequestMeta(request)
  });

  return Response.json({ transfer: toTransferDto(transfer) });
}
