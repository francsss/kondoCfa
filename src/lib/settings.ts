import { z } from "zod";
import {
  DEFAULT_TRANSFER_CONFIG,
  PAYMENT_RECEIVER_DEFAULTS,
  type TransferPricingConfig
} from "@/config/rate-tiers";
import { prisma } from "@/lib/prisma";

const rateTierSchema = z.object({
  minXaf: z.number().int().nonnegative(),
  maxXaf: z.number().int().positive().nullable(),
  rateMicros: z.number().int().positive(),
  label: z.string().min(1)
});

export const transferConfigSchema = z.object({
  minimumAmountXaf: z.number().int().positive(),
  maximumAmountXaf: z.number().int().positive(),
  feeBps: z.number().int().min(0).max(10_000),
  fixedFeeXaf: z.number().int().min(0),
  rateTiers: z.array(rateTierSchema).min(1)
});

export type EditableSettings = TransferPricingConfig & {
  orangeMoneyReceiverNumber: string;
  mtnMomoReceiverNumber: string;
};

export async function getTransferConfig(): Promise<TransferPricingConfig> {
  const setting = await prisma.appSetting.findUnique({
    where: { key: "transfer_config" }
  });
  const parsed = transferConfigSchema.safeParse(setting?.value);
  return parsed.success ? parsed.data : DEFAULT_TRANSFER_CONFIG;
}

export async function getEditableSettings(): Promise<EditableSettings> {
  const [config, orange, mtn] = await Promise.all([
    getTransferConfig(),
    prisma.appSetting.findUnique({
      where: { key: "orange_money_receiver_number" }
    }),
    prisma.appSetting.findUnique({ where: { key: "mtn_momo_receiver_number" } })
  ]);

  return {
    ...config,
    orangeMoneyReceiverNumber:
      typeof orange?.value === "string"
        ? orange.value
        : PAYMENT_RECEIVER_DEFAULTS.orangeMoneyReceiverNumber,
    mtnMomoReceiverNumber:
      typeof mtn?.value === "string"
        ? mtn.value
        : PAYMENT_RECEIVER_DEFAULTS.mtnMomoReceiverNumber
  };
}
