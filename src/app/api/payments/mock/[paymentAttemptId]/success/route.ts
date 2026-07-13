import { NextRequest } from "next/server";
import { isMockPaymentMode } from "@/config/payments";
import { canAccessAdmin } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { applyMockPaymentWebhook } from "@/lib/payment-attempts";
import { prisma } from "@/lib/prisma";
import { getRequestMeta, jsonError } from "@/lib/request";
import { toPaymentAttemptDto, toTransferDto } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { paymentAttemptId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);
  if (!canAccessAdmin(user.role)) return jsonError("Accès refusé.", 403);
  if (!isMockPaymentMode()) return jsonError("Simulation désactivée.", 403);

  const paymentAttempt = await prisma.paymentAttempt.findUnique({
    where: { id: params.paymentAttemptId }
  });
  if (!paymentAttempt) return jsonError("Paiement introuvable.", 404);

  const meta = getRequestMeta(request);
  await writeAuditLog({
    actorId: user.id,
    action: "PAYMENT_SIMULATED_SUCCESS",
    entityType: "PaymentAttempt",
    entityId: paymentAttempt.id,
    newValue: {
      transferId: paymentAttempt.transferId,
      paymentAttemptId: paymentAttempt.id,
      providerRequestId: paymentAttempt.providerRequestId,
      adminId: user.id,
      timestamp: new Date().toISOString()
    },
    ...meta
  });

  const result = await applyMockPaymentWebhook({
    expectedProvider: paymentAttempt.provider,
    payload: {
      providerRequestId: paymentAttempt.providerRequestId ?? "",
      status: "SUCCESS",
      amountXaf: paymentAttempt.amountXaf,
      currency: "XAF"
    },
    adminId: user.id,
    meta
  });

  if (!result.ok) return jsonError(result.error, result.status);

  return Response.json({
    ok: true,
    duplicate: result.duplicate,
    paymentAttempt: toPaymentAttemptDto(result.paymentAttempt),
    transfer: toTransferDto(result.transfer)
  });
}
