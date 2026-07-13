import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { canLoginThroughPortal, getLoginPortalError } from "@/lib/login-policy";
import { prisma } from "@/lib/prisma";
import { getRequestMeta, jsonError } from "@/lib/request";
import { toSafeUser } from "@/lib/serializers";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Email ou mot de passe incorrect.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  const passwordOk = user
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !passwordOk || user.status !== "ACTIVE") {
    if (process.env.NODE_ENV === "development") {
      console.warn(`LOGIN_FAILED for ${parsed.data.email}`);
    }
    await writeAuditLog({
      action: "LOGIN_FAILED",
      entityType: "User",
      entityId: parsed.data.email,
      newValue: { email: parsed.data.email },
      ...getRequestMeta(request)
    });
    return jsonError("Email ou mot de passe incorrect.", 401);
  }

  if (
    parsed.data.loginPortal &&
    !canLoginThroughPortal(user.role, parsed.data.loginPortal)
  ) {
    await writeAuditLog({
      actorId: user.id,
      action: "LOGIN_PORTAL_REJECTED",
      entityType: "User",
      entityId: user.id,
      newValue: { email: user.email, role: user.role, portal: parsed.data.loginPortal },
      ...getRequestMeta(request)
    });
    return jsonError(getLoginPortalError(user.role, parsed.data.loginPortal), 403);
  }

  await writeAuditLog({
    actorId: user.id,
    action: "LOGIN_SUCCESS",
    entityType: "User",
    entityId: user.id,
    ...getRequestMeta(request)
  });

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    role: user.role
  });
  const response = NextResponse.json({ user: toSafeUser(user) });
  setSessionCookie(response, token);
  return response;
}
