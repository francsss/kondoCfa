import { formatCnyFromFen } from "@/lib/money";
import type { PaymentAttemptDto, TransferDto } from "@/types/api";

type DateLike = Date | string | null;

function toIso(value: DateLike) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function decimalToString(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "toString" in value) {
    return value.toString();
  }
  return "0";
}

export function toSafeUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  country?: string | null;
  role: string;
  status: string;
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    country: user.country,
    role: user.role,
    status: user.status,
    fullName: `${user.firstName} ${user.lastName}`
  };
}

export function toPaymentAttemptDto(paymentAttempt: {
  id: string;
  transferId: string;
  provider: string;
  payerOperator: string;
  payerCountryCode: string;
  payerPhoneNational: string;
  payerPhoneE164: string;
  amountXaf: number;
  currency: string;
  status: string;
  providerRequestId?: string | null;
  providerReference?: string | null;
  failureReason?: string | null;
  initiatedAt?: DateLike;
  succeededAt?: DateLike;
  failedAt?: DateLike;
  createdAt: DateLike;
  updatedAt: DateLike;
}): PaymentAttemptDto {
  return {
    id: paymentAttempt.id,
    transferId: paymentAttempt.transferId,
    provider: paymentAttempt.provider as PaymentAttemptDto["provider"],
    payerOperator:
      paymentAttempt.payerOperator as PaymentAttemptDto["payerOperator"],
    payerCountryCode: paymentAttempt.payerCountryCode,
    payerPhoneNational: paymentAttempt.payerPhoneNational,
    payerPhoneE164: paymentAttempt.payerPhoneE164,
    amountXaf: paymentAttempt.amountXaf,
    currency: paymentAttempt.currency as "XAF",
    status: paymentAttempt.status as PaymentAttemptDto["status"],
    providerRequestId: paymentAttempt.providerRequestId,
    providerReference: paymentAttempt.providerReference,
    failureReason: paymentAttempt.failureReason,
    initiatedAt: toIso(paymentAttempt.initiatedAt ?? null),
    succeededAt: toIso(paymentAttempt.succeededAt ?? null),
    failedAt: toIso(paymentAttempt.failedAt ?? null),
    createdAt: toIso(paymentAttempt.createdAt) ?? "",
    updatedAt: toIso(paymentAttempt.updatedAt) ?? ""
  };
}

export function toTransferDto(transfer: {
  id: string;
  refCode: string;
  senderId: string;
  status: string;
  amountXaf: number;
  exchangeRate: unknown;
  feeXaf: number;
  totalXaf: number;
  payoutAmountCnyFen: number;
  paymentMethod: string;
  payerCountryCode?: string | null;
  payerPhoneNational?: string | null;
  payerPhoneE164?: string | null;
  payerOperator?: string | null;
  paymentProviderStatus: string;
  paymentProviderRequestId?: string | null;
  paymentProviderReference?: string | null;
  paymentInitiatedAt?: DateLike;
  paymentConfirmedAt?: DateLike;
  paymentFailureReason?: string | null;
  paymentAttempts?: Array<{
    id: string;
    transferId: string;
    provider: string;
    payerOperator: string;
    payerCountryCode: string;
    payerPhoneNational: string;
    payerPhoneE164: string;
    amountXaf: number;
    currency: string;
    status: string;
    providerRequestId?: string | null;
    providerReference?: string | null;
    failureReason?: string | null;
    initiatedAt?: DateLike;
    succeededAt?: DateLike;
    failedAt?: DateLike;
    createdAt: DateLike;
    updatedAt: DateLike;
  }>;
  beneficiaryName: string;
  beneficiaryAlipayId: string;
  beneficiaryPhone?: string | null;
  purpose?: string | null;
  alipayPayoutReference?: string | null;
  alipayPayoutCompletedAt?: DateLike;
  cancelReason?: string | null;
  cancelledAt?: DateLike;
  createdAt: DateLike;
  updatedAt: DateLike;
  sender?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}): TransferDto {
  return {
    id: transfer.id,
    refCode: transfer.refCode,
    senderId: transfer.senderId,
    sender: transfer.sender
      ? {
          id: transfer.sender.id,
          email: transfer.sender.email,
          firstName: transfer.sender.firstName,
          lastName: transfer.sender.lastName,
          fullName: `${transfer.sender.firstName} ${transfer.sender.lastName}`
        }
      : null,
    status: transfer.status as TransferDto["status"],
    amountXaf: transfer.amountXaf,
    exchangeRate: decimalToString(transfer.exchangeRate),
    feeXaf: transfer.feeXaf,
    totalXaf: transfer.totalXaf,
    payoutAmountCnyFen: transfer.payoutAmountCnyFen,
    payoutAmountCny: formatCnyFromFen(transfer.payoutAmountCnyFen),
    paymentMethod: transfer.paymentMethod as TransferDto["paymentMethod"],
    payerCountryCode: transfer.payerCountryCode,
    payerPhoneNational: transfer.payerPhoneNational,
    payerPhoneE164: transfer.payerPhoneE164,
    payerOperator: transfer.payerOperator,
    paymentProviderStatus:
      transfer.paymentProviderStatus as TransferDto["paymentProviderStatus"],
    paymentProviderRequestId: transfer.paymentProviderRequestId,
    paymentProviderReference: transfer.paymentProviderReference,
    paymentInitiatedAt: toIso(transfer.paymentInitiatedAt ?? null),
    paymentConfirmedAt: toIso(transfer.paymentConfirmedAt ?? null),
    paymentFailureReason: transfer.paymentFailureReason,
    latestPaymentAttempt: transfer.paymentAttempts?.[0]
      ? toPaymentAttemptDto(transfer.paymentAttempts[0])
      : null,
    beneficiaryName: transfer.beneficiaryName,
    beneficiaryAlipayId: transfer.beneficiaryAlipayId,
    beneficiaryPhone: transfer.beneficiaryPhone,
    purpose: transfer.purpose,
    alipayPayoutReference: transfer.alipayPayoutReference,
    alipayPayoutCompletedAt: toIso(transfer.alipayPayoutCompletedAt ?? null),
    cancelReason: transfer.cancelReason,
    cancelledAt: toIso(transfer.cancelledAt ?? null),
    createdAt: toIso(transfer.createdAt) ?? "",
    updatedAt: toIso(transfer.updatedAt) ?? ""
  };
}
