import { randomUUID } from "crypto";
import type { MobileMoneyPaymentMethod } from "@/config/mobile-money";
import type {
  MobileMoneyProvider,
  MobileMoneyRequestToPayInput,
  MobileMoneyStatusResponse
} from "@/services/payments/types";

function createMockRequestId(prefix: "MOCK-MTN" | "MOCK-ORANGE") {
  return `${prefix}-${randomUUID()}`;
}

class BaseMockMobileMoneyProvider implements MobileMoneyProvider {
  constructor(
    private readonly prefix: "MOCK-MTN" | "MOCK-ORANGE",
    private readonly displayName: string
  ) {}

  async requestToPay(input: MobileMoneyRequestToPayInput) {
    const providerRequestId = createMockRequestId(this.prefix);

    return {
      providerRequestId,
      providerReference: providerRequestId,
      status: "PENDING" as const,
      rawResponse: {
        mode: "mock",
        provider: input.provider,
        providerRequestId,
        transferRef: input.transferRef,
        amountXaf: input.amountXaf,
        currency: input.currency,
        payerOperator: input.payerOperator,
        payerPhoneE164: input.payerPhoneE164,
        message: `Demande de paiement ${this.displayName} envoyée.`
      }
    };
  }

  async checkStatus(providerRequestId: string): Promise<MobileMoneyStatusResponse> {
    return {
      providerRequestId,
      status: "PENDING",
      rawResponse: {
        mode: "mock",
        providerRequestId,
        message: "Statut mock en attente."
      }
    };
  }

  async handleWebhook(payload: unknown): Promise<MobileMoneyStatusResponse> {
    const body = payload && typeof payload === "object" ? payload : {};
    const providerRequestId =
      "providerRequestId" in body ? String(body.providerRequestId) : "";
    const status =
      "status" in body && body.status === "SUCCESS" ? "SUCCESS" : "FAILED";

    return {
      providerRequestId,
      status,
      rawResponse: {
        mode: "mock",
        ...body
      }
    };
  }
}

export class MockMtnMomoProvider extends BaseMockMobileMoneyProvider {
  constructor() {
    super("MOCK-MTN", "MTN Mobile Money");
  }
}

export class MockOrangeMoneyProvider extends BaseMockMobileMoneyProvider {
  constructor() {
    super("MOCK-ORANGE", "Orange Money");
  }
}

export function getMobileMoneyProvider(
  paymentMethod: MobileMoneyPaymentMethod
): MobileMoneyProvider {
  if (paymentMethod === "MTN_MOMO") return new MockMtnMomoProvider();
  return new MockOrangeMoneyProvider();
}
