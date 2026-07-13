import type {
  MobileMoneyOperator,
  MobileMoneyPaymentMethod
} from "@/config/mobile-money";

export const PAYMENT_ATTEMPT_STATUSES = [
  "CREATED",
  "PENDING",
  "SUCCESS",
  "FAILED"
] as const;

export type PaymentAttemptStatus = (typeof PAYMENT_ATTEMPT_STATUSES)[number];

export type MobileMoneyRequestToPayInput = {
  transferRef: string;
  amountXaf: number;
  currency: "XAF";
  provider: MobileMoneyPaymentMethod;
  payerOperator: MobileMoneyOperator;
  payerPhoneE164: string;
};

export type MobileMoneyProviderResponse = {
  providerRequestId: string;
  providerReference?: string;
  status: "PENDING";
  rawResponse: Record<string, unknown>;
};

export type MobileMoneyStatusResponse = {
  providerRequestId: string;
  status: PaymentAttemptStatus;
  rawResponse: Record<string, unknown>;
};

export interface MobileMoneyProvider {
  requestToPay(
    input: MobileMoneyRequestToPayInput
  ): Promise<MobileMoneyProviderResponse>;
  checkStatus(providerRequestId: string): Promise<MobileMoneyStatusResponse>;
  handleWebhook(payload: unknown): Promise<MobileMoneyStatusResponse>;
}
