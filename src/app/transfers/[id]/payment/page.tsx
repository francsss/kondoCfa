import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { PaymentStatusClient } from "@/components/transfer/PaymentStatusClient";
import { prisma } from "@/lib/prisma";
import { toPaymentAttemptDto, toTransferDto } from "@/lib/serializers";
import { requireSender } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function TransferPaymentPage({
  params
}: {
  params: { id: string };
}) {
  const user = await requireSender();
  const transfer = await prisma.transfer.findUnique({
    where: { id: params.id },
    include: {
      paymentAttempts: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!transfer) notFound();
  if (transfer.senderId !== user.id) redirect("/dashboard");

  const latestPaymentAttempt = transfer.paymentAttempts[0] ?? null;

  return (
    <>
      <Navbar user={user} />
      <PaymentStatusClient
        initialTransfer={toTransferDto(transfer)}
        initialPaymentAttempt={
          latestPaymentAttempt ? toPaymentAttemptDto(latestPaymentAttempt) : null
        }
      />
    </>
  );
}
