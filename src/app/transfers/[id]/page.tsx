import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { TransferDetailClient } from "@/components/transfer/TransferDetailClient";
import { canAccessOwnTransfer } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { toTransferDto } from "@/lib/serializers";
import { requireSender } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function TransferDetailPage({
  params
}: {
  params: { id: string };
}) {
  const user = await requireSender();
  const transfer = await prisma.transfer.findUnique({
    where: { id: params.id },
    include: {
      sender: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    }
  });

  if (!transfer) notFound();
  if (
    !canAccessOwnTransfer({
      role: user.role,
      userId: user.id,
      ownerId: transfer.senderId
    })
  ) {
    redirect("/dashboard");
  }

  return (
    <>
      <Navbar user={user} />
      <TransferDetailClient initialTransfer={toTransferDto(transfer)} />
    </>
  );
}
