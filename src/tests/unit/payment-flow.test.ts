import { describe, expect, it } from "vitest";
import { isValidMockPaymentWebhookSecret } from "@/config/payments";
import {
  buildCreatedPaymentAttemptData,
  buildFailedPaymentWebhookUpdates,
  buildPendingPaymentAttemptUpdate,
  buildSuccessfulPaymentWebhookUpdates,
  canSenderInitiateTransferPayment,
  isTerminalPaymentAttemptStatus,
  shouldInitiatePaymentForStep
} from "@/lib/payment-flow";

describe("mobile money payment flow", () => {
  it("does not initiate payment before final confirmation", () => {
    expect(shouldInitiatePaymentForStep(1)).toBe(false);
    expect(shouldInitiatePaymentForStep(2)).toBe(false);
    expect(shouldInitiatePaymentForStep(3)).toBe(false);
    expect(shouldInitiatePaymentForStep(4)).toBe(false);
    expect(shouldInitiatePaymentForStep(5)).toBe(true);
  });

  it("final confirmation creates a CREATED attempt then PENDING provider update", () => {
    const created = buildCreatedPaymentAttemptData({
      transferId: "transfer-1",
      provider: "MTN_MOMO",
      payerOperator: "MTN",
      payerCountryCode: "+237",
      payerPhoneNational: "670000000",
      payerPhoneE164: "+237670000000",
      amountXaf: 51_750
    });

    const pending = buildPendingPaymentAttemptUpdate({
      providerRequestId: "MOCK-MTN-123",
      rawProviderResponse: { status: "PENDING" }
    });

    expect(created.status).toBe("CREATED");
    expect(created.amountXaf).toBe(51_750);
    expect(pending.status).toBe("PENDING");
    expect(pending.providerRequestId).toBe("MOCK-MTN-123");
  });

  it("SUCCESS webhook changes attempt to SUCCESS and transfer to IN_PROGRESS", () => {
    const now = new Date("2026-07-06T12:00:00.000Z");
    const updates = buildSuccessfulPaymentWebhookUpdates({
      rawWebhookPayload: {
        providerRequestId: "MOCK-MTN-123",
        status: "SUCCESS"
      },
      now
    });

    expect(updates.paymentAttempt.status).toBe("SUCCESS");
    expect(updates.paymentAttempt.succeededAt).toBe(now);
    expect(updates.transfer.status).toBe("IN_PROGRESS");
    expect(updates.transfer.paymentProviderStatus).toBe("CONFIRMED");
  });

  it("FAILED webhook changes attempt to FAILED and never marks transfer SUCCESS", () => {
    const now = new Date("2026-07-06T12:05:00.000Z");
    const updates = buildFailedPaymentWebhookUpdates({
      failureReason: "User cancelled payment",
      rawWebhookPayload: {
        providerRequestId: "MOCK-ORANGE-123",
        status: "FAILED"
      },
      now
    });

    expect(updates.paymentAttempt.status).toBe("FAILED");
    expect(updates.paymentAttempt.failedAt).toBe(now);
    expect(updates.transfer.paymentProviderStatus).toBe("FAILED");
    expect("status" in updates.transfer).toBe(false);
  });

  it("treats SUCCESS and FAILED webhooks as terminal for idempotency", () => {
    expect(isTerminalPaymentAttemptStatus("SUCCESS")).toBe(true);
    expect(isTerminalPaymentAttemptStatus("FAILED")).toBe(true);
    expect(isTerminalPaymentAttemptStatus("PENDING")).toBe(false);
  });

  it("rejects invalid mock webhook secrets", () => {
    expect(
      isValidMockPaymentWebhookSecret(
        process.env.MOCK_PAYMENT_WEBHOOK_SECRET ?? "dev_mock_secret"
      )
    ).toBe(true);
    expect(isValidMockPaymentWebhookSecret("definitely_not_secret")).toBe(false);
  });

  it("prevents a sender from initiating payment for another sender transfer", () => {
    expect(
      canSenderInitiateTransferPayment({
        senderId: "sender-1",
        transferSenderId: "sender-1"
      })
    ).toBe(true);
    expect(
      canSenderInitiateTransferPayment({
        senderId: "sender-1",
        transferSenderId: "sender-2"
      })
    ).toBe(false);
  });
});
