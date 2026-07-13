import { NextRequest } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { calculateQuote } from "@/lib/money";
import { createAndRequestPaymentAttempt } from "@/lib/payment-attempts";
import { canSenderInitiateTransferPayment } from "@/lib/payment-flow";
import { prisma } from "@/lib/prisma";
import { generateTransferRef } from "@/lib/reference";
import { getRequestMeta, jsonError } from "@/lib/request";
import { toPaymentAttemptDto, toTransferDto } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import { getTransferConfig } from "@/lib/settings";
import {
  createTransferSchema,
  initiateExistingTransferPaymentSchema
} from "@/lib/validation";

async function loadTransferWithLatestPaymentAttempt(id: string) {
  return prisma.transfer.findUnique({
    where: { id },
    include: {
      paymentAttempts: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);
  if (user.role !== "SENDER") {
    return jsonError("Seuls les expéditeurs peuvent lancer un paiement.", 403);
  }

  const payload = await request.json().catch(() => null);
  const meta = getRequestMeta(request);
  const existingTransferRequest =
    payload && typeof payload === "object" && "transferId" in payload;

  if (existingTransferRequest) {
    const parsed = initiateExistingTransferPaymentSchema.safeParse(payload);
    if (!parsed.success) return jsonError("Demande de paiement invalide.");

    const transfer = await prisma.transfer.findUnique({
      where: { id: parsed.data.transferId }
    });

    if (!transfer) return jsonError("Transfert introuvable.", 404);
    if (
      !canSenderInitiateTransferPayment({
        senderId: user.id,
        transferSenderId: transfer.senderId
      })
    ) {
      return jsonError("Accès refusé.", 403);
    }

    if (transfer.status === "SUCCESS" || transfer.status === "CANCELLED") {
      return jsonError("Ce transfert ne peut plus recevoir de paiement.");
    }

    if (parsed.data.amountXaf && parsed.data.amountXaf !== transfer.totalXaf) {
      return jsonError("Le montant du paiement ne correspond pas au transfert.");
    }

    const initiated = await createAndRequestPaymentAttempt({
      transfer,
      userId: user.id,
      meta
    }).catch((error) => {
      console.error(error);
      return null;
    });

    if (!initiated) return jsonError("Paiement impossible.", 500);

    const fullTransfer = await loadTransferWithLatestPaymentAttempt(transfer.id);
    if (!fullTransfer) return jsonError("Transfert introuvable.", 404);

    return Response.json(
      {
        transfer: toTransferDto(fullTransfer),
        paymentAttempt: toPaymentAttemptDto(initiated.paymentAttempt),
        redirectUrl: `/transfers/${transfer.id}/payment`
      },
      { status: initiated.reusedPendingAttempt ? 200 : 201 }
    );
  }

  const parsed = createTransferSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("Veuillez vérifier les informations du transfert.");
  }

  const config = await getTransferConfig();
  const quote = calculateQuote(parsed.data.amountXaf, config);
  if (!quote.valid) return Response.json(quote, { status: 400 });

  const transfer = await prisma.transfer.create({
    data: {
      refCode: generateTransferRef(),
      senderId: user.id,
      status: "CREATED",
      amountXaf: quote.amountXaf,
      exchangeRate: quote.exchangeRate,
      feeXaf: quote.feeXaf,
      totalXaf: quote.totalXaf,
      payoutAmountCnyFen: quote.payoutAmountCnyFen,
      paymentMethod: parsed.data.paymentMethod,
      payerCountryCode: parsed.data.payerCountryCode,
      payerPhoneNational: parsed.data.payerPhoneNational,
      payerPhoneE164: parsed.data.payerPhoneE164,
      payerOperator: parsed.data.payerOperator,
      paymentProviderStatus: "PENDING",
      beneficiaryName: parsed.data.beneficiaryName,
      beneficiaryAlipayId: parsed.data.beneficiaryAlipayId,
      beneficiaryPhone: parsed.data.beneficiaryPhone || null,
      purpose: parsed.data.purpose || null
    }
  });

  await writeAuditLog({
    actorId: user.id,
    action: "TRANSFER_CREATED",
    entityType: "Transfer",
    entityId: transfer.id,
    newValue: { refCode: transfer.refCode, status: transfer.status },
    ...meta
  });

  const initiated = await createAndRequestPaymentAttempt({
    transfer,
    userId: user.id,
    meta
  }).catch((error) => {
    console.error(error);
    return null;
  });

  if (!initiated) return jsonError("Paiement impossible.", 500);

  const fullTransfer = await loadTransferWithLatestPaymentAttempt(transfer.id);
  if (!fullTransfer) return jsonError("Transfert introuvable.", 404);

  return Response.json(
    {
      transfer: toTransferDto(fullTransfer),
      paymentAttempt: toPaymentAttemptDto(initiated.paymentAttempt),
      redirectUrl: `/transfers/${transfer.id}/payment`
    },
    { status: 201 }
  );
}
