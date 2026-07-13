import {
  DEFAULT_TRANSFER_CONFIG,
  type RateTier,
  type TransferPricingConfig
} from "@/config/rate-tiers";

export type QuotePreview =
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

export function getTierForAmount(
  amountXaf: number,
  config: TransferPricingConfig = DEFAULT_TRANSFER_CONFIG
): RateTier | null {
  return (
    config.rateTiers.find((tier) => {
      const belowMax = tier.maxXaf === null || amountXaf <= tier.maxXaf;
      return amountXaf >= tier.minXaf && belowMax;
    }) ?? null
  );
}

export function formatRateFromMicros(rateMicros: number) {
  const integer = Math.trunc(rateMicros / 1_000_000);
  const fractional = String(rateMicros % 1_000_000)
    .padStart(6, "0")
    .replace(/0+$/, "");
  return fractional ? `${integer}.${fractional}` : String(integer);
}

export function formatCnyFromFen(fen: number) {
  const sign = fen < 0 ? "-" : "";
  const abs = Math.abs(fen);
  const yuan = Math.trunc(abs / 100);
  const cents = String(abs % 100).padStart(2, "0");
  return `${sign}${yuan}.${cents}`;
}

export function calculateFeeXaf(
  amountXaf: number,
  config: TransferPricingConfig = DEFAULT_TRANSFER_CONFIG
) {
  const percentageFee = Math.ceil((amountXaf * config.feeBps) / 10_000);
  return percentageFee + config.fixedFeeXaf;
}

export function calculatePayoutFen(amountXaf: number, tier: RateTier) {
  const numerator =
    BigInt(amountXaf) * BigInt(tier.rateMicros) * BigInt(100);
  return Number((numerator + BigInt(500_000)) / BigInt(1_000_000));
}

export function calculateQuote(
  rawAmountXaf: number,
  config: TransferPricingConfig = DEFAULT_TRANSFER_CONFIG
): QuotePreview {
  const amountXaf = Math.trunc(rawAmountXaf);

  if (!Number.isFinite(rawAmountXaf) || amountXaf !== rawAmountXaf) {
    return { valid: false, error: "Le montant doit être un nombre entier en FCFA." };
  }

  if (amountXaf < config.minimumAmountXaf) {
    return {
      valid: false,
      error: `Le montant minimum est ${formatXaf(config.minimumAmountXaf)}.`
    };
  }

  if (amountXaf > config.maximumAmountXaf) {
    return {
      valid: false,
      error: `Le montant maximum est ${formatXaf(config.maximumAmountXaf)}.`
    };
  }

  const tier = getTierForAmount(amountXaf, config);

  if (!tier) {
    return {
      valid: false,
      error: "Aucun taux n'est disponible pour ce montant."
    };
  }

  const feeXaf = calculateFeeXaf(amountXaf, config);
  const totalXaf = amountXaf + feeXaf;
  const payoutAmountCnyFen = calculatePayoutFen(amountXaf, tier);

  return {
    valid: true,
    amountXaf,
    exchangeRate: formatRateFromMicros(tier.rateMicros),
    feeXaf,
    totalXaf,
    payoutAmountCny: formatCnyFromFen(payoutAmountCnyFen),
    payoutAmountCnyFen,
    appliedTier: tier.label
  };
}

export function formatXaf(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
}
