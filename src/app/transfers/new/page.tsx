import { Navbar } from "@/components/Navbar";
import { NewTransferClient } from "@/components/transfer/NewTransferClient";
import { requireSender } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function NewTransferPage() {
  const user = await requireSender();

  return (
    <>
      <Navbar user={user} />
      <NewTransferClient />
    </>
  );
}
