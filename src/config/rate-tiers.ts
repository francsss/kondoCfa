export type RateTier = {
  minXaf: number;
  maxXaf: number | null;
  rateMicros: number;
  label: string;
};

export type TransferPricingConfig = {
  minimumAmountXaf: number;
  maximumAmountXaf: number;
  feeBps: number;
  fixedFeeXaf: number;
  rateTiers: RateTier[];
};

export const DEFAULT_TRANSFER_CONFIG: TransferPricingConfig = {
  minimumAmountXaf: 5_000,
  maximumAmountXaf: 2_000_000,
  feeBps: 250,
  fixedFeeXaf: 500,
  rateTiers: [
    {
      minXaf: 5_000,
      maxXaf: 49_999,
      rateMicros: 12_000,
      label: "5 000 - 49 999 XAF"
    },
    {
      minXaf: 50_000,
      maxXaf: 199_999,
      rateMicros: 12_500,
      label: "50 000 - 199 999 XAF"
    },
    {
      minXaf: 200_000,
      maxXaf: 999_999,
      rateMicros: 12_800,
      label: "200 000 - 999 999 XAF"
    },
    {
      minXaf: 1_000_000,
      maxXaf: null,
      rateMicros: 13_000,
      label: "1 000 000+ XAF"
    }
  ]
};

export const PAYMENT_RECEIVER_DEFAULTS = {
  orangeMoneyReceiverNumber: "+237 690 000 000",
  mtnMomoReceiverNumber: "+237 670 000 000"
};
