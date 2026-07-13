import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  DEFAULT_TRANSFER_CONFIG,
  PAYMENT_RECEIVER_DEFAULTS
} from "../src/config/rate-tiers";
import { calculateQuote } from "../src/lib/money";

const prisma = new PrismaClient();
const password = "ChangeMe123!";

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.auditLog.deleteMany();
  await prisma.paymentAttempt.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.recipient.deleteMany();
  await prisma.appSetting.deleteMany();
  await prisma.user.deleteMany();

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@example.com",
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      phone: "+237 690 000 001",
      country: "CM",
      role: "SUPER_ADMIN"
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash,
      firstName: "Kondo",
      lastName: "Ops",
      phone: "+237 690 000 002",
      country: "CM",
      role: "ADMIN"
    }
  });

  const sender = await prisma.user.create({
    data: {
      email: "sender@example.com",
      passwordHash,
      firstName: "Amina",
      lastName: "Mballa",
      phone: "+237 690 111 222",
      country: "CM",
      role: "SENDER"
    }
  });

  const sender2 = await prisma.user.create({
    data: {
      email: "sender2@example.com",
      passwordHash,
      firstName: "Eric",
      lastName: "Nkomo",
      phone: "+237 675 333 444",
      country: "CM",
      role: "SENDER"
    }
  });

  await prisma.appSetting.createMany({
    data: [
      {
        key: "transfer_config",
        value: DEFAULT_TRANSFER_CONFIG
      },
      {
        key: "minimum_amount_xaf",
        value: DEFAULT_TRANSFER_CONFIG.minimumAmountXaf
      },
      {
        key: "maximum_amount_xaf",
        value: DEFAULT_TRANSFER_CONFIG.maximumAmountXaf
      },
      {
        key: "fee_bps",
        value: DEFAULT_TRANSFER_CONFIG.feeBps
      },
      {
        key: "fixed_fee_xaf",
        value: DEFAULT_TRANSFER_CONFIG.fixedFeeXaf
      },
      {
        key: "tiered_exchange_rates",
        value: DEFAULT_TRANSFER_CONFIG.rateTiers
      },
      {
        key: "orange_money_receiver_number",
        value: PAYMENT_RECEIVER_DEFAULTS.orangeMoneyReceiverNumber
      },
      {
        key: "mtn_momo_receiver_number",
        value: PAYMENT_RECEIVER_DEFAULTS.mtnMomoReceiverNumber
      }
    ]
  });

  await prisma.recipient.createMany({
    data: [
      {
        userId: sender.id,
        fullName: "Li Wei",
        alipayId: "liwei-alipay",
        phone: "+86 138 0000 0001"
      },
      {
        userId: sender2.id,
        fullName: "Chen Yu",
        alipayId: "chenyu-alipay",
        phone: "+86 139 0000 0002"
      }
    ]
  });

  const demoTransfers = [
    {
      refCode: "KONDO-DEMO-CREATED",
      senderId: sender.id,
      amountXaf: 25_000,
      status: "CREATED" as const,
      paymentProviderStatus: "PENDING" as const,
      paymentMethod: "ORANGE_MONEY" as const,
      payerCountryCode: "+237",
      payerPhoneNational: "690000000",
      payerPhoneE164: "+237690000000",
      payerOperator: "ORANGE",
      paymentProviderRequestId: "MOCK-ORANGE-DEMO-CREATED",
      paymentProviderReference: "MOCK-ORANGE-DEMO-CREATED",
      paymentInitiatedAt: new Date(),
      beneficiaryName: "Li Wei",
      beneficiaryAlipayId: "liwei-alipay",
      paymentAttemptStatus: "PENDING" as const
    },
    {
      refCode: "KONDO-DEMO-PROGRESS",
      senderId: sender.id,
      amountXaf: 80_000,
      status: "IN_PROGRESS" as const,
      paymentProviderStatus: "CONFIRMED" as const,
      paymentMethod: "MTN_MOMO" as const,
      payerCountryCode: "+237",
      payerPhoneNational: "670000000",
      payerPhoneE164: "+237670000000",
      payerOperator: "MTN",
      beneficiaryName: "Zhang Min",
      beneficiaryAlipayId: "zhangmin-alipay",
      paymentProviderRequestId: "MOCK-MTN-DEMO-PROGRESS",
      paymentProviderReference: "MTN-DEMO-0001",
      paymentInitiatedAt: new Date(),
      paymentConfirmedById: admin.id,
      paymentConfirmedAt: new Date(),
      paymentAttemptStatus: "SUCCESS" as const
    },
    {
      refCode: "KONDO-DEMO-CANCELLED",
      senderId: sender2.id,
      amountXaf: 150_000,
      status: "CANCELLED" as const,
      paymentProviderStatus: "FAILED" as const,
      paymentMethod: "ORANGE_MONEY" as const,
      payerCountryCode: "+237",
      payerPhoneNational: "690111111",
      payerPhoneE164: "+237690111111",
      payerOperator: "ORANGE",
      beneficiaryName: "Chen Yu",
      beneficiaryAlipayId: "chenyu-alipay",
      paymentProviderRequestId: "MOCK-ORANGE-DEMO-CANCELLED",
      paymentProviderReference: "MOCK-ORANGE-DEMO-CANCELLED",
      paymentInitiatedAt: new Date(),
      paymentFailureReason: "Paiement non confirmé en mode démo.",
      cancelReason: "Paiement non confirmé en mode démo.",
      cancelledAt: new Date(),
      cancelledById: admin.id,
      paymentAttemptStatus: "FAILED" as const,
      failureReason: "Paiement non confirmé en mode démo."
    },
    {
      refCode: "KONDO-DEMO-SUCCESS",
      senderId: sender.id,
      amountXaf: 320_000,
      status: "SUCCESS" as const,
      paymentProviderStatus: "CONFIRMED" as const,
      paymentMethod: "ORANGE_MONEY" as const,
      payerCountryCode: "+237",
      payerPhoneNational: "690222222",
      payerPhoneE164: "+237690222222",
      payerOperator: "ORANGE",
      beneficiaryName: "Wang Fang",
      beneficiaryAlipayId: "wangfang-alipay",
      paymentProviderRequestId: "MOCK-ORANGE-DEMO-SUCCESS",
      paymentProviderReference: "OM-DEMO-0002",
      paymentInitiatedAt: new Date(),
      paymentConfirmedById: admin.id,
      paymentConfirmedAt: new Date(),
      alipayPayoutReference: "ALIPAY-DEMO-8888",
      alipayPayoutCompletedAt: new Date(),
      alipayPayoutCompletedById: superAdmin.id,
      paymentAttemptStatus: "SUCCESS" as const
    }
  ];

  for (const demoTransfer of demoTransfers) {
    const { paymentAttemptStatus, failureReason, ...transferData } = demoTransfer;
    const quote = calculateQuote(demoTransfer.amountXaf);
    if (!quote.valid) {
      throw new Error(quote.error);
    }

    const transfer = await prisma.transfer.create({
      data: {
        ...transferData,
        exchangeRate: new Prisma.Decimal(quote.exchangeRate),
        feeXaf: quote.feeXaf,
        totalXaf: quote.totalXaf,
        payoutAmountCnyFen: quote.payoutAmountCnyFen
      }
    });

    await prisma.paymentAttempt.create({
      data: {
        transferId: transfer.id,
        provider: transfer.paymentMethod,
        payerOperator: transfer.payerOperator ?? "ORANGE",
        payerCountryCode: transfer.payerCountryCode ?? "+237",
        payerPhoneNational: transfer.payerPhoneNational ?? "690000000",
        payerPhoneE164: transfer.payerPhoneE164 ?? "+237690000000",
        amountXaf: transfer.totalXaf,
        currency: "XAF",
        status: paymentAttemptStatus,
        providerRequestId: transfer.paymentProviderRequestId,
        providerReference: transfer.paymentProviderReference,
        failureReason,
        initiatedAt: transfer.paymentInitiatedAt,
        succeededAt:
          paymentAttemptStatus === "SUCCESS" ? transfer.paymentConfirmedAt : null,
        failedAt: paymentAttemptStatus === "FAILED" ? transfer.cancelledAt : null,
        rawProviderResponse: {
          mode: "mock",
          providerRequestId: transfer.paymentProviderRequestId,
          status:
            paymentAttemptStatus === "PENDING"
              ? "PENDING"
              : paymentAttemptStatus === "SUCCESS"
                ? "SUCCESS"
                : "FAILED"
        },
        rawWebhookPayload:
          paymentAttemptStatus === "PENDING"
            ? undefined
            : {
                providerRequestId: transfer.paymentProviderRequestId,
                status: paymentAttemptStatus,
                amountXaf: transfer.totalXaf,
                currency: "XAF",
                failureReason
              }
      }
    });
  }

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: superAdmin.id,
        action: "SETTINGS_UPDATED",
        entityType: "AppSetting",
        entityId: "transfer_config",
        newValue: DEFAULT_TRANSFER_CONFIG
      },
      {
        actorId: admin.id,
        action: "ADMIN_PAYOUT_COMPLETED",
        entityType: "Transfer",
        entityId: "KONDO-DEMO-SUCCESS",
        newValue: { status: "SUCCESS" }
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
