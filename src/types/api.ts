import type { SimpleTransferStatus } from "@/lib/status";

export type PaymentAttemptDto = {
  id: string;
  transferId: string;
  provider: "ORANGE_MONEY" | "MTN_MOMO";
  payerOperator: "MTN" | "ORANGE";
  payerCountryCode: string;
  payerPhoneNational: string;
  payerPhoneE164: string;
  amountXaf: number;
  currency: "XAF";
  status: "CREATED" | "PENDING" | "SUCCESS" | "FAILED";
  providerRequestId?: string | null;
  providerReference?: string | null;
  failureReason?: string | null;
  initiatedAt?: string | null;
  succeededAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TransferDto = {
  id: string;
  refCode: string;
  senderId: string;
  sender?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
  } | null;
  status: SimpleTransferStatus;
  amountXaf: number;
  exchangeRate: string;
  feeXaf: number;
  totalXaf: number;
  payoutAmountCnyFen: number;
  payoutAmountCny: string;
  paymentMethod: "ORANGE_MONEY" | "MTN_MOMO";
  payerCountryCode?: string | null;
  payerPhoneNational?: string | null;
  payerPhoneE164?: string | null;
  payerOperator?: string | null;
  paymentProviderStatus: "PENDING" | "CONFIRMED" | "FAILED" | "CANCELLED";
  paymentProviderRequestId?: string | null;
  paymentProviderReference?: string | null;
  paymentInitiatedAt?: string | null;
  paymentConfirmedAt?: string | null;
  paymentFailureReason?: string | null;
  latestPaymentAttempt?: PaymentAttemptDto | null;
  beneficiaryName: string;
  beneficiaryAlipayId: string;
  beneficiaryPhone?: string | null;
  purpose?: string | null;
  alipayPayoutReference?: string | null;
  alipayPayoutCompletedAt?: string | null;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QuoteDto =
  | {
      valid: true;
      amountXaf: number;
      exchangeRate: string;
      feeXaf: number;
      totalXaf: number;
      payoutAmountCny: string;
      payoutAmountCnyFen: number;
      appliedTier: string;
    }
  | {
      valid: false;
      error: string;
    };
