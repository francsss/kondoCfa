import { NextRequest } from "next/server";
import { isValidMockPaymentWebhookSecret } from "@/config/payments";
import { writeAuditLog } from "@/lib/audit";
import { applyMockPaymentWebhook } from "@/lib/payment-attempts";
import { getRequestMeta, jsonError } from "@/lib/request";
import { toPaymentAttemptDto, toTransferDto } from "@/lib/serializers";
import { mockPaymentWebhookSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const meta = getRequestMeta(request);

  if (!isValidMockPaymentWebhookSecret(request.headers.get("x-kondo-mock-secret"))) {
    await writeAuditLog({
      action: "PAYMENT_WEBHOOK_INVALID",
      entityType: "PaymentAttempt",
      entityId:
        payload && typeof payload === "object" && "providerRequestId" in payload
          ? String(payload.providerRequestId)
          : "unknown",
      newValue: {
        provider: "ORANGE_MONEY",
        reason: "Secret webhook invalide.",
        timestamp: new Date().toISOString()
      },
      ...meta
    });
    return jsonError("Secret webhook invalide.", 401);
  }

  const parsed = mockPaymentWebhookSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Payload webhook invalide.");

  const result = await applyMockPaymentWebhook({
    expectedProvider: "ORANGE_MONEY",
    payload: parsed.data,
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
