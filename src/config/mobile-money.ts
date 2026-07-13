export const CAMEROON_MOBILE_MONEY_COUNTRY_CODE = "+237";

export const MOBILE_MONEY_OPERATORS = {
  MTN_MOMO: "MTN",
  ORANGE_MONEY: "ORANGE"
} as const;

export type MobileMoneyOperator =
  (typeof MOBILE_MONEY_OPERATORS)[keyof typeof MOBILE_MONEY_OPERATORS];

export type MobileMoneyPaymentMethod = keyof typeof MOBILE_MONEY_OPERATORS;

const CAMEROON_MOBILE_NATIONAL_REGEX = /^6\d{8}$/;

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function getPayerOperatorForPaymentMethod(
  paymentMethod: MobileMoneyPaymentMethod
) {
  return MOBILE_MONEY_OPERATORS[paymentMethod];
}

export function normalizeCameroonPayerPhone(input: {
  payerCountryCode?: string;
  payerPhoneNational: string;
  paymentMethod: MobileMoneyPaymentMethod;
  payerOperator?: string;
}) {
  const payerCountryCode =
    input.payerCountryCode?.trim() || CAMEROON_MOBILE_MONEY_COUNTRY_CODE;
  const payerPhoneNational = digitsOnly(input.payerPhoneNational);
  const payerOperator = input.payerOperator ?? getPayerOperatorForPaymentMethod(input.paymentMethod);

  return {
    payerCountryCode,
    payerPhoneNational,
    payerPhoneE164: `${payerCountryCode}${payerPhoneNational}`,
    payerOperator
  };
}

export function validateCameroonPayerPhone(input: {
  payerCountryCode?: string;
  payerPhoneNational: string;
  paymentMethod: MobileMoneyPaymentMethod;
  payerOperator?: string;
}) {
  if (/[^\d\s]/.test(input.payerPhoneNational)) {
    return {
      valid: false as const,
      error: "Le numéro Mobile Money doit contenir uniquement des chiffres."
    };
  }

  const normalized = normalizeCameroonPayerPhone(input);
  const expectedOperator = getPayerOperatorForPaymentMethod(input.paymentMethod);

  if (normalized.payerCountryCode !== CAMEROON_MOBILE_MONEY_COUNTRY_CODE) {
    return {
      valid: false as const,
      error: "Le numéro Mobile Money doit utiliser l'indicatif +237."
    };
  }

  if (!CAMEROON_MOBILE_NATIONAL_REGEX.test(normalized.payerPhoneNational)) {
    return {
      valid: false as const,
      error:
        "Entrez un numéro mobile camerounais valide à 9 chiffres, par exemple 670000000."
    };
  }

  if (normalized.payerOperator !== expectedOperator) {
    return {
      valid: false as const,
      error: "L'opérateur du numéro doit correspondre à la méthode de paiement."
    };
  }

  return {
    valid: true as const,
    ...normalized
  };
}
