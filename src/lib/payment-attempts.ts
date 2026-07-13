import { Prisma } from "@prisma/client";
import type { MobileMoneyPaymentMethod } from "@/config/mobile-money";
import { getMobileMoneyProvider } from "@/services/payments/mock-providers";
import type { PaymentAttemptStatus } from "@/services/payments/types";
import { writeAuditLog } from "@/lib/audit";
import {
  buildCreatedPaymentAttemptData,
  buildFailedPaymentWebhookUpdates,
  buildPendingPaymentAttemptUpdate,
  buildSuccessfulPaymentWebhookUpdates,
  isTerminalPaymentAttemptStatus
} from "@/lib/payment-flow";
import { prisma } from "@/lib/prisma";

type RequestMeta = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

type TransferForPayment = {
  id: string;
  refCode: string;
  senderId: string;
  status: string;
  totalXaf: number;
  paymentMethod: MobileMoneyPaymentMethod;
  payerCountryCode: string | null;
  payerPhoneNational: string | null;
  payerPhoneE164: string | null;
  payerOperator: string | null;
};

type MockWebhookPayload = {
  providerRequestId: string;
  status: "SUCCESS" | "FAILED";
  amountXaf?: number;
  currency?: "XAF";
  failureReason?: string;
};

function asJson(value: Record<string, unknown>) {
  return value as Prisma.InputJsonValue;
}

function paymentAuditValue(args: {
  transferId: string;
  paymentAttemptId: string;
  providerRequestId?: string | null;
  userId?: string | null;
  adminId?: string | null;
  status?: string;
  extra?: Record<string, unknown>;
}) {
  return {
    transferId: args.transferId,
    paymentAttemptId: args.paymentAttemptId,
    providerRequestId: args.providerRequestId ?? null,
    userId: args.userId ?? null,
    adminId: args.adminId ?? null,
    status: args.status,
    timestamp: new Date().toISOString(),
    ...(args.extra ?? {})
  };
}

export async function createAndRequestPaymentAttempt(args: {
  transfer: TransferForPayment;
  userId: string;
  meta?: RequestMeta;
}) {
  const existingPending = await prisma.paymentAttempt.findFirst({
    where: {
      transferId: args.transfer.id,
      status: "PENDING"
    },
    orderBy: { createdAt: "desc" }
  });

  if (existingPending) {
    return {
      transfer: args.transfer,
      paymentAttempt: existingPending,
      reusedPendingAttempt: true
    };
  }

  if (
    !args.transfer.payerCountryCode ||
    !args.transfer.payerPhoneNational ||
    !args.transfer.payerPhoneE164 ||
    !args.transfer.payerOperator
  ) {
    throw new Error("Informations Mobile Money manquantes.");
  }

  const paymentAttempt = await prisma.paymentAttempt.create({
    data: buildCreatedPaymentAttemptData({
      transferId: args.transfer.id,
      provider: args.transfer.paymentMethod,
      payerOperator: args.transfer.payerOperator as "MTN" | "ORANGE",
      payerCountryCode: args.transfer.payerCountryCode,
      payerPhoneNational: args.transfer.payerPhoneNational,
      payerPhoneE164: args.transfer.payerPhoneE164,
      amountXaf: args.transfer.totalXaf
    })
  });

  await writeAuditLog({
    actorId: args.userId,
    action: "PAYMENT_ATTEMPT_CREATED",
    entityType: "PaymentAttempt",
    entityId: paymentAttempt.id,
    newValue: paymentAuditValue({
      transferId: args.transfer.id,
      paymentAttemptId: paymentAttempt.id,
      userId: args.userId,
      status: "CREATED"
    }),
    ...args.meta
  });

  const provider = getMobileMoneyProvider(args.transfer.paymentMethod);
  const providerResponse = await provider.requestToPay({
    transferRef: args.transfer.refCode,
    amountXaf: args.transfer.totalXaf,
    currency: "XAF",
    provider: args.transfer.paymentMethod,
    payerOperator: args.transfer.payerOperator as "MTN" | "ORANGE",
    payerPhoneE164: args.transfer.payerPhoneE164
  });

  await writeAuditLog({
    actorId: args.userId,
    action: "PAYMENT_REQUEST_INITIATED",
    entityType: "PaymentAttempt",
    entityId: paymentAttempt.id,
    newValue: paymentAuditValue({
      transferId: args.transfer.id,
      paymentAttemptId: paymentAttempt.id,
      providerRequestId: providerResponse.providerRequestId,
      userId: args.userId,
      status: providerResponse.status
    }),
    ...args.meta
  });

  const pendingUpdate = buildPendingPaymentAttemptUpdate({
    providerRequestId: providerResponse.providerRequestId,
    providerReference: providerResponse.providerReference,
    rawProviderResponse: providerResponse.rawResponse
  });

  const [updatedAttempt, updatedTransfer] = await prisma.$transaction([
    prisma.paymentAttempt.update({
      where: { id: paymentAttempt.id },
      data: {
        ...pendingUpdate,
        rawProviderResponse: asJson(pendingUpdate.rawProviderResponse)
      }
    }),
    prisma.transfer.update({
      where: { id: args.transfer.id },
      data: {
        paymentProviderStatus: "PENDING",
        paymentProviderRequestId: providerResponse.providerRequestId,
        paymentProviderReference:
          providerResponse.providerReference ?? providerResponse.providerRequestId,
        paymentInitiatedAt: pendingUpdate.initiatedAt,
        paymentFailureReason: null
      }
    })
  ]);

  await writeAuditLog({
    actorId: args.userId,
    action: "PAYMENT_PROVIDER_PENDING",
    entityType: "PaymentAttempt",
    entityId: updatedAttempt.id,
    newValue: paymentAuditValue({
      transferId: updatedTransfer.id,
      paymentAttemptId: updatedAttempt.id,
      providerRequestId: updatedAttempt.providerRequestId,
      userId: args.userId,
      status: updatedAttempt.status
    }),
    ...args.meta
  });

  return {
    transfer: updatedTransfer,
    paymentAttempt: updatedAttempt,
    reusedPendingAttempt: false
  };
}

export async function applyMockPaymentWebhook(args: {
  expectedProvider: MobileMoneyPaymentMethod;
  payload: MockWebhookPayload;
  meta?: RequestMeta;
  adminId?: string | null;
}) {
  const paymentAttempt = await prisma.paymentAttempt.findUnique({
    where: { providerRequestId: args.payload.providerRequestId },
    include: { transfer: true }
  });

  if (!paymentAttempt || paymentAttempt.provider !== args.expectedProvider) {
    await writeAuditLog({
      action: "PAYMENT_WEBHOOK_INVALID",
      entityType: "PaymentAttempt",
      entityId: args.payload.providerRequestId,
      newValue: {
        providerRequestId: args.payload.providerRequestId,
        expectedProvider: args.expectedProvider,
        timestamp: new Date().toISOString()
      },
      ...args.meta
    });

    return {
      ok: false as const,
      status: 404,
      error: "Tentative de paiement introuvable."
    };
  }

  if (
    args.payload.status === "SUCCESS" &&
    args.payload.amountXaf !== paymentAttempt.amountXaf
  ) {
    await writeAuditLog({
      action: "PAYMENT_WEBHOOK_INVALID",
      entityType: "PaymentAttempt",
      entityId: paymentAttempt.id,
      newValue: paymentAuditValue({
        transferId: paymentAttempt.transferId,
        paymentAttemptId: paymentAttempt.id,
        providerRequestId: paymentAttempt.providerRequestId,
        adminId: args.adminId,
        status: paymentAttempt.status,
        extra: {
          reason: "Montant webhook invalide.",
          expectedAmountXaf: paymentAttempt.amountXaf,
          receivedAmountXaf: args.payload.amountXaf
        }
      }),
      ...args.meta
    });

    return {
      ok: false as const,
      status: 400,
      error: "Montant webhook invalide."
    };
  }

  if (isTerminalPaymentAttemptStatus(paymentAttempt.status as PaymentAttemptStatus)) {
    await writeAuditLog({
      actorId: args.adminId ?? null,
      action: "PAYMENT_WEBHOOK_DUPLICATE",
      entityType: "PaymentAttempt",
      entityId: paymentAttempt.id,
      newValue: paymentAuditValue({
        transferId: paymentAttempt.transferId,
        paymentAttemptId: paymentAttempt.id,
        providerRequestId: paymentAttempt.providerRequestId,
        adminId: args.adminId,
        status: paymentAttempt.status
      }),
      ...args.meta
    });

    return {
      ok: true as const,
      duplicate: true,
      paymentAttempt,
      transfer: paymentAttempt.transfer
    };
  }

  if (args.payload.status === "SUCCESS") {
    const updates = buildSuccessfulPaymentWebhookUpdates({
      rawWebhookPayload: args.payload
    });

    const [updatedAttempt, updatedTransfer] = await prisma.$transaction([
      prisma.paymentAttempt.update({
        where: { id: paymentAttempt.id },
        data: {
          ...updates.paymentAttempt,
          rawWebhookPayload: asJson(args.payload)
        }
      }),
      prisma.transfer.update({
        where: { id: paymentAttempt.transferId },
        data: {
          ...updates.transfer,
          paymentProviderRequestId: paymentAttempt.providerRequestId,
          paymentProviderReference:
            paymentAttempt.providerReference ?? paymentAttempt.providerRequestId
        }
      })
    ]);

    await writeAuditLog({
      actorId: args.adminId ?? null,
      action: "PAYMENT_PROVIDER_SUCCESS",
      entityType: "PaymentAttempt",
      entityId: updatedAttempt.id,
      newValue: paymentAuditValue({
        transferId: updatedTransfer.id,
        paymentAttemptId: updatedAttempt.id,
        providerRequestId: updatedAttempt.providerRequestId,
        adminId: args.adminId,
        status: updatedAttempt.status
      }),
      ...args.meta
    });

    return {
      ok: true as const,
      duplicate: false,
      paymentAttempt: updatedAttempt,
      transfer: updatedTransfer
    };
  }

  const failureReason = args.payload.failureReason ?? "Paiement Mobile Money échoué.";
  const updates = buildFailedPaymentWebhookUpdates({
    failureReason,
    rawWebhookPayload: args.payload
  });

  const [updatedAttempt, updatedTransfer] = await prisma.$transaction([
    prisma.paymentAttempt.update({
      where: { id: paymentAttempt.id },
      data: {
        ...updates.paymentAttempt,
        rawWebhookPayload: asJson(args.payload)
      }
    }),
    prisma.transfer.update({
      where: { id: paymentAttempt.transferId },
      data: updates.transfer
    })
  ]);

  await writeAuditLog({
    actorId: args.adminId ?? null,
    action: "PAYMENT_PROVIDER_FAILED",
    entityType: "PaymentAttempt",
    entityId: updatedAttempt.id,
    newValue: paymentAuditValue({
      transferId: updatedTransfer.id,
      paymentAttemptId: updatedAttempt.id,
      providerRequestId: updatedAttempt.providerRequestId,
      adminId: args.adminId,
      status: updatedAttempt.status,
      extra: { failureReason }
    }),
    ...args.meta
  });

  return {
    ok: true as const,
    duplicate: false,
    paymentAttempt: updatedAttempt,
    transfer: updatedTransfer
  };
}
