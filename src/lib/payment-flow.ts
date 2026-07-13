import type {
  MobileMoneyOperator,
  MobileMoneyPaymentMethod
} from "@/config/mobile-money";
import type { PaymentAttemptStatus } from "@/services/payments/types";

export const FINAL_PAYMENT_CONFIRMATION_STEP = 5;

export function shouldInitiatePaymentForStep(step: number) {
  return step === FINAL_PAYMENT_CONFIRMATION_STEP;
}

export function isTerminalPaymentAttemptStatus(status: PaymentAttemptStatus) {
  return status === "SUCCESS" || status === "FAILED";
}

export function canSenderInitiateTransferPayment(args: {
  senderId: string;
  transferSenderId: string;
}) {
  return args.senderId === args.transferSenderId;
}

export function buildCreatedPaymentAttemptData(args: {
  transferId: string;
  provider: MobileMoneyPaymentMethod;
  payerOperator: MobileMoneyOperator;
  payerCountryCode: string;
  payerPhoneNational: string;
  payerPhoneE164: string;
  amountXaf: number;
}) {
  return {
    transferId: args.transferId,
    provider: args.provider,
    payerOperator: args.payerOperator,
    payerCountryCode: args.payerCountryCode,
    payerPhoneNational: args.payerPhoneNational,
    payerPhoneE164: args.payerPhoneE164,
    amountXaf: args.amountXaf,
    currency: "XAF" as const,
    status: "CREATED" as const
  };
}

export function buildPendingPaymentAttemptUpdate(args: {
  providerRequestId: string;
  providerReference?: string;
  rawProviderResponse: Record<string, unknown>;
  now?: Date;
}) {
  return {
    status: "PENDING" as const,
    providerRequestId: args.providerRequestId,
    providerReference: args.providerReference ?? args.providerRequestId,
    rawProviderResponse: args.rawProviderResponse,
    initiatedAt: args.now ?? new Date()
  };
}

export function buildSuccessfulPaymentWebhookUpdates(args: {
  rawWebhookPayload: Record<string, unknown>;
  now?: Date;
}) {
  const now = args.now ?? new Date();

  return {
    paymentAttempt: {
      status: "SUCCESS" as const,
      succeededAt: now,
      rawWebhookPayload: args.rawWebhookPayload
    },
    transfer: {
      status: "IN_PROGRESS" as const,
      paymentProviderStatus: "CONFIRMED" as const,
      paymentConfirmedAt: now,
      paymentFailureReason: null
    }
  };
}

export function buildFailedPaymentWebhookUpdates(args: {
  failureReason: string;
  rawWebhookPayload: Record<string, unknown>;
  now?: Date;
}) {
  const now = args.now ?? new Date();

  return {
    paymentAttempt: {
      status: "FAILED" as const,
      failedAt: now,
      failureReason: args.failureReason,
      rawWebhookPayload: args.rawWebhookPayload
    },
    transfer: {
      paymentProviderStatus: "FAILED" as const,
      paymentFailureReason: args.failureReason
    }
  };
}
