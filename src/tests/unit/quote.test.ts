import { describe, expect, it } from "vitest";
import { DEFAULT_TRANSFER_CONFIG } from "@/config/rate-tiers";
import {
  calculateFeeXaf,
  calculatePayoutFen,
  calculateQuote,
  getTierForAmount
} from "@/lib/money";

describe("quote calculation", () => {
  it("selects the correct tier for 50,000 XAF", () => {
    const tier = getTierForAmount(50_000, DEFAULT_TRANSFER_CONFIG);
    expect(tier?.label).toBe("50 000 - 199 999 XAF");
    expect(tier?.rateMicros).toBe(12_500);
  });

  it("rejects amounts below the minimum", () => {
    const quote = calculateQuote(4_999);
    expect(quote.valid).toBe(false);
    if (!quote.valid) {
      expect(quote.error).toBe("Le montant minimum est 5 000 FCFA.");
    }
  });

  it("calculates the fixed plus percentage fee", () => {
    expect(calculateFeeXaf(50_000)).toBe(1_750);
  });

  it("calculates CNY payout using fen internally", () => {
    const tier = getTierForAmount(50_000);
    expect(tier).not.toBeNull();
    expect(calculatePayoutFen(50_000, tier!)).toBe(62_500);
  });

  it("calculates the full total and preview payload", () => {
    const quote = calculateQuote(50_000);
    expect(quote.valid).toBe(true);
    if (quote.valid) {
      expect(quote.exchangeRate).toBe("0.0125");
      expect(quote.feeXaf).toBe(1_750);
      expect(quote.totalXaf).toBe(51_750);
      expect(quote.payoutAmountCny).toBe("625.00");
      expect(quote.appliedTier).toBe("50 000 - 199 999 XAF");
    }
  });
});
