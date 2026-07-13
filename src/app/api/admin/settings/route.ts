import { NextRequest } from "next/server";
import { canAccessAdmin } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getRequestMeta, jsonError } from "@/lib/request";
import { getCurrentUser } from "@/lib/server-auth";
import { getEditableSettings } from "@/lib/settings";
import { updateSettingsSchema } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);
  if (!canAccessAdmin(user.role)) return jsonError("Accès refusé.", 403);

  return Response.json({ settings: await getEditableSettings() });
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Non authentifié.", 401);
  if (!canAccessAdmin(user.role)) return jsonError("Accès refusé.", 403);

  const payload = await request.json().catch(() => null);
  const parsed = updateSettingsSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Paramètres invalides.");

  const {
    orangeMoneyReceiverNumber,
    mtnMomoReceiverNumber,
    ...transferConfig
  } = parsed.data;

  await prisma.$transaction([
    prisma.appSetting.upsert({
      where: { key: "transfer_config" },
      update: { value: transferConfig },
      create: { key: "transfer_config", value: transferConfig }
    }),
    prisma.appSetting.upsert({
      where: { key: "orange_money_receiver_number" },
      update: { value: orangeMoneyReceiverNumber },
      create: {
        key: "orange_money_receiver_number",
        value: orangeMoneyReceiverNumber
      }
    }),
    prisma.appSetting.upsert({
      where: { key: "mtn_momo_receiver_number" },
      update: { value: mtnMomoReceiverNumber },
      create: {
        key: "mtn_momo_receiver_number",
        value: mtnMomoReceiverNumber
      }
    })
  ]);

  await writeAuditLog({
    actorId: user.id,
    action: "SETTINGS_UPDATED",
    entityType: "AppSetting",
    entityId: "transfer_config",
    newValue: parsed.data,
    ...getRequestMeta(request)
  });

  return Response.json({ settings: await getEditableSettings() });
}
