import { quotePreviewSchema } from "@/lib/validation";
import { calculateQuote } from "@/lib/money";
import { getTransferConfig } from "@/lib/settings";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = quotePreviewSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json({
      valid: false,
      error: "Le montant doit être un nombre entier en FCFA."
    });
  }

  const config = await getTransferConfig();
  return Response.json(calculateQuote(parsed.data.amountXaf, config));
}
