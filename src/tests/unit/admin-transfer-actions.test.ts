import { describe, expect, it } from "vitest";
import {
  buildAdminCancelTransferUpdate,
  buildPaymentReceivedUpdate,
  buildPayoutCompletedUpdate
} from "@/lib/admin-transfer-actions";

describe("admin transfer action traceability", () => {
  it("paymentConfirmedById is saved when admin marks payment received", () => {
    const now = new Date("2026-07-06T12:00:00.000Z");
    const data = buildPaymentReceivedUpdate("admin-1", now);

    expect(data.status).toBe("IN_PROGRESS");
    expect(data.paymentProviderStatus).toBe("CONFIRMED");
    expect(data.paymentConfirmedById).toBe("admin-1");
    expect(data.paymentConfirmedAt).toBe(now);
  });

  it("alipayPayoutCompletedById is saved when admin completes payout", () => {
    const now = new Date("2026-07-06T12:05:00.000Z");
    const data = buildPayoutCompletedUpdate({
      adminId: "admin-2",
      alipayPayoutReference: "ALIPAY-123",
      now
    });

    expect(data.status).toBe("SUCCESS");
    expect(data.alipayPayoutReference).toBe("ALIPAY-123");
    expect(data.alipayPayoutCompletedById).toBe("admin-2");
    expect(data.alipayPayoutCompletedAt).toBe(now);
  });

  it("cancelledById is saved when admin cancels transfer", () => {
    const now = new Date("2026-07-06T12:10:00.000Z");
    const data = buildAdminCancelTransferUpdate({
      adminId: "admin-3",
      reason: "Erreur de paiement",
      keepConfirmedPayment: false,
      now
    });

    expect(data.status).toBe("CANCELLED");
    expect(data.paymentProviderStatus).toBe("CANCELLED");
    expect(data.cancelledById).toBe("admin-3");
    expect(data.cancelReason).toBe("Erreur de paiement");
    expect(data.cancelledAt).toBe(now);
  });
});
