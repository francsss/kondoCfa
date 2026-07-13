import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getPublicRegisterRole } from "@/lib/register-policy";
import { getRequestMeta, jsonError } from "@/lib/request";
import { toSafeUser } from "@/lib/serializers";
import { registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Veuillez vérifier les informations saisies.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (existing) {
    return jsonError("Impossible de créer ce compte.", 409);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
      country: parsed.data.country,
      role: getPublicRegisterRole()
    }
  });

  await writeAuditLog({
    actorId: user.id,
    action: "USER_REGISTERED",
    entityType: "User",
    entityId: user.id,
    newValue: { email: user.email, role: user.role },
    ...getRequestMeta(request)
  });

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    role: user.role
  });
  const response = NextResponse.json({ user: toSafeUser(user) }, { status: 201 });
  setSessionCookie(response, token);
  return response;
}
