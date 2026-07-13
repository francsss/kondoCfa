import { getCurrentUser } from "@/lib/server-auth";
import { jsonError } from "@/lib/request";
import { toSafeUser } from "@/lib/serializers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);
  return Response.json({ user: toSafeUser(user) });
}
