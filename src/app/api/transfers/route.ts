import { NextRequest } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { generateTransferRef } from "@/lib/reference";
import { getRequestMeta, jsonError } from "@/lib/request";
import { toTransferDto } from "@/lib/serializers";
import { getCurrentUser } from "@/lib/server-auth";
import { getTransferConfig } from "@/lib/settings";
import { calculateQuote } from "@/lib/money";
import { createTransferSchema } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);

  const transfers = await prisma.transfer.findMany({
    where: { senderId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return Response.json({ transfers: transfers.map(toTransferDto) });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);
  if (user.role !== "SENDER") {
    return jsonError("Seuls les expéditeurs peuvent créer un transfert.", 403);
  }

  const payload = await request.json().catch(() => null);
  const parsed = createTransferSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Veuillez vérifier les informations du transfert.");
  }

  const config = await getTransferConfig();
  const quote = calculateQuote(parsed.data.amountXaf, config);
  if (!quote.valid) return Response.json(quote, { status: 400 });

  const refCode = generateTransferRef();

  const transfer = await prisma.transfer.create({
    data: {
      refCode,
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

  const meta = getRequestMeta(request);
  await writeAuditLog({
    actorId: user.id,
    action: "TRANSFER_CREATED",
    entityType: "Transfer",
    entityId: transfer.id,
    newValue: { refCode: transfer.refCode, status: transfer.status },
    ...meta
  });

  return Response.json({
    transfer: toTransferDto(transfer)
  });
}
