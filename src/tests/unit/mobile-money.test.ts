import { describe, expect, it } from "vitest";
import {
  normalizeCameroonPayerPhone,
  validateCameroonPayerPhone
} from "@/config/mobile-money";
import { createTransferSchema } from "@/lib/validation";

const validTransferPayload = {
  amountXaf: 50_000,
  beneficiaryName: "Li Wei",
  beneficiaryAlipayId: "liwei-alipay",
  beneficiaryPhone: "",
  purpose: ""
};

describe("mobile money payer phone validation", () => {
  it("payment step requires payer phone number", () => {
    const parsed = createTransferSchema.safeParse({
      ...validTransferPayload,
      paymentMethod: "MTN_MOMO",
      payerCountryCode: "+237",
      payerOperator: "MTN"
    });

    expect(parsed.success).toBe(false);
  });

  it("MTN payment requires MTN payer operator value", () => {
    const parsed = createTransferSchema.safeParse({
      ...validTransferPayload,
      paymentMethod: "MTN_MOMO",
      payerCountryCode: "+237",
      payerPhoneNational: "670000000",
      payerOperator: "ORANGE"
    });

    expect(parsed.success).toBe(false);
  });

  it("Orange payment requires Orange payer operator value", () => {
    const parsed = createTransferSchema.safeParse({
      ...validTransferPayload,
      paymentMethod: "ORANGE_MONEY",
      payerCountryCode: "+237",
      payerPhoneNational: "690000000",
      payerOperator: "MTN"
    });

    expect(parsed.success).toBe(false);
  });

  it("backend rejects letters in payer phone number", () => {
    const result = validateCameroonPayerPhone({
      paymentMethod: "MTN_MOMO",
      payerCountryCode: "+237",
      payerPhoneNational: "67ABC0000",
      payerOperator: "MTN"
    });

    expect(result.valid).toBe(false);
  });

  it("backend normalizes payer phone to +237 format", () => {
    const result = normalizeCameroonPayerPhone({
      paymentMethod: "ORANGE_MONEY",
      payerCountryCode: "+237",
      payerPhoneNational: "690 000 000",
      payerOperator: "ORANGE"
    });

    expect(result).toEqual({
      payerCountryCode: "+237",
      payerPhoneNational: "690000000",
      payerPhoneE164: "+237690000000",
      payerOperator: "ORANGE"
    });
  });
});
