import { z } from "zod";
import { BENEFICIARY_COUNTRIES } from "@/config/beneficiary-countries";
import {
  CAMEROON_MOBILE_MONEY_COUNTRY_CODE,
  normalizeCameroonPayerPhone,
  validateCameroonPayerPhone
} from "@/config/mobile-money";
import { transferConfigSchema } from "@/lib/settings";

const beneficiaryCountryValues = BENEFICIARY_COUNTRIES.map(
  (country) => country.value
) as [string, ...string[]];

const beneficiaryNameRegex = /^(?![\d\s]+$)[\p{L}\p{M}'’ -]{2,}$/u;

function sanitizeLooseText(value: string) {
  return value.replace(/[<>{}[\]\\]/g, "").replace(/\s+/g, " ").trim();
}

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    email: z.string().trim().email().toLowerCase(),
    phone: z.string().trim().min(6).optional().or(z.literal("")),
    country: z.string().trim().min(2),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    acceptedTerms: z.boolean()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"]
  })
  .refine((data) => data.acceptedTerms, {
    message: "Vous devez accepter les conditions.",
    path: ["acceptedTerms"]
  });

export const createAdminSchema = z
  .object({
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    email: z.string().trim().email().toLowerCase(),
    phone: z.string().trim().optional().or(z.literal("")),
    country: z.string().trim().optional().or(z.literal("")),
    temporaryPassword: z.string().min(8),
    confirmTemporaryPassword: z.string().min(8),
    status: z.enum(["ACTIVE", "SUSPENDED"]).default("ACTIVE")
  })
  .refine((data) => data.temporaryPassword === data.confirmTemporaryPassword, {
    message: "Les mots de passe temporaires ne correspondent pas.",
    path: ["confirmTemporaryPassword"]
  });

export const updateAdminStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"])
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
  loginPortal: z.enum(["SENDER", "ADMIN"]).optional()
});

export const quotePreviewSchema = z.object({
  amountXaf: z.coerce.number().int().positive()
});

export const createTransferSchema = z
  .object({
    amountXaf: z.coerce.number().int().positive(),
    paymentMethod: z.enum(["ORANGE_MONEY", "MTN_MOMO"]),
    payerCountryCode: z
      .literal(CAMEROON_MOBILE_MONEY_COUNTRY_CODE)
      .default(CAMEROON_MOBILE_MONEY_COUNTRY_CODE),
    payerPhoneNational: z.string().trim().min(1),
    payerOperator: z.enum(["MTN", "ORANGE"]),
    beneficiaryName: z
      .string()
      .transform(sanitizeLooseText)
      .refine((value) => beneficiaryNameRegex.test(value), {
        message:
          "Le nom doit contenir au moins 2 lettres et peut inclure espaces, apostrophes ou tirets."
      }),
    beneficiaryCountry: z.enum(beneficiaryCountryValues).default("CN"),
    beneficiaryAlipayId: z
      .string()
      .transform(sanitizeLooseText)
      .refine((value) => value.length >= 4, {
        message: "L'identifiant Alipay doit contenir au moins 4 caractères."
      }),
    beneficiaryPhone: z
      .string()
      .trim()
      .regex(/^\+?\d{6,18}$/, "Le téléphone doit contenir uniquement des chiffres.")
      .optional()
      .or(z.literal("")),
    purpose: z
      .string()
      .transform(sanitizeLooseText)
      .refine((value) => value.length <= 140, {
        message: "La référence ne doit pas dépasser 140 caractères."
      })
      .optional()
      .or(z.literal(""))
  })
  .superRefine((data, ctx) => {
    const result = validateCameroonPayerPhone({
      paymentMethod: data.paymentMethod,
      payerCountryCode: data.payerCountryCode,
      payerPhoneNational: data.payerPhoneNational,
      payerOperator: data.payerOperator
    });

    if (!result.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payerPhoneNational"],
        message: result.error
      });
    }
  })
  .transform((data) => ({
    ...data,
    ...normalizeCameroonPayerPhone({
      paymentMethod: data.paymentMethod,
      payerCountryCode: data.payerCountryCode,
      payerPhoneNational: data.payerPhoneNational,
      payerOperator: data.payerOperator
    })
  }));

export const cancelTransferSchema = z.object({
  reason: z.string().trim().min(3)
});

export const initiateExistingTransferPaymentSchema = z.object({
  transferId: z.string().min(1),
  amountXaf: z.coerce.number().int().positive().optional(),
  currency: z.literal("XAF").default("XAF")
});

export const mockPaymentWebhookSchema = z.object({
  providerRequestId: z.string().trim().min(1),
  status: z.enum(["SUCCESS", "FAILED"]),
  amountXaf: z.coerce.number().int().positive().optional(),
  currency: z.literal("XAF").optional(),
  failureReason: z.string().trim().max(240).optional()
});

export const completePayoutSchema = z.object({
  alipayPayoutReference: z.string().trim().min(3)
});

export const updateSettingsSchema = transferConfigSchema.extend({
  orangeMoneyReceiverNumber: z.string().trim().min(3),
  mtnMomoReceiverNumber: z.string().trim().min(3)
});
