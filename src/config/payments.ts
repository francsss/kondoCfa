export function getPaymentMode() {
  return process.env.PAYMENT_MODE ?? "mock";
}

export function isMockPaymentMode() {
  return getPaymentMode() === "mock";
}

export function getMockPaymentWebhookSecret() {
  return process.env.MOCK_PAYMENT_WEBHOOK_SECRET ?? "dev_mock_secret";
}

export function isValidMockPaymentWebhookSecret(value: string | null) {
  return value === getMockPaymentWebhookSecret();
}
