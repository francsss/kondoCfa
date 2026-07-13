import { describe, expect, it } from "vitest";
import {
  MockMtnMomoProvider,
  MockOrangeMoneyProvider,
  getMobileMoneyProvider
} from "@/services/payments/mock-providers";

const baseInput = {
  transferRef: "KONDO-TEST",
  amountXaf: 51_750,
  currency: "XAF" as const,
  payerPhoneE164: "+237690000000"
};

describe("mock mobile money providers", () => {
  it("creates a pending MTN request with a MOCK-MTN id", async () => {
    const provider = new MockMtnMomoProvider();
    const result = await provider.requestToPay({
      ...baseInput,
      provider: "MTN_MOMO",
      payerOperator: "MTN"
    });

    expect(result.status).toBe("PENDING");
    expect(result.providerRequestId).toMatch(/^MOCK-MTN-/);
  });

  it("creates a pending Orange request with a MOCK-ORANGE id", async () => {
    const provider = new MockOrangeMoneyProvider();
    const result = await provider.requestToPay({
      ...baseInput,
      provider: "ORANGE_MONEY",
      payerOperator: "ORANGE"
    });

    expect(result.status).toBe("PENDING");
    expect(result.providerRequestId).toMatch(/^MOCK-ORANGE-/);
  });

  it("returns providers by payment method", async () => {
    const provider = getMobileMoneyProvider("MTN_MOMO");
    const result = await provider.requestToPay({
      ...baseInput,
      provider: "MTN_MOMO",
      payerOperator: "MTN"
    });

    expect(result.providerRequestId).toMatch(/^MOCK-MTN-/);
  });
});
