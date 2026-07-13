import { NextRequest } from "next/server";
import { canChangeAdminStatus } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getRequestMeta, jsonError } from "@/lib/request";
import { getCurrentUser } from "@/lib/server-auth";
import { updateAdminStatusSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return jsonError("Non authentifié.", 401);

  const payload = await request.json().catch(() => null);
  const parsed = updateAdminStatusSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Statut invalide.");

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true, status: true, email: true }
  });
  if (!target) return jsonError("Admin introuvable.", 404);

  if (
    !canChangeAdminStatus({
      actorRole: currentUser.role,
      targetRole: target.role
    })
  ) {
    return jsonError("Accès refusé.", 403);
  }

  const admin = await prisma.user.update({
    where: { id: target.id },
    data: { status: parsed.data.status },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      country: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });

  await writeAuditLog({
    actorId: currentUser.id,
    action:
      parsed.data.status === "ACTIVE"
        ? "ADMIN_REACTIVATED_BY_SUPER_ADMIN"
        : "ADMIN_SUSPENDED_BY_SUPER_ADMIN",
    entityType: "User",
    entityId: admin.id,
    oldValue: { status: target.status },
    newValue: { status: admin.status, email: admin.email },
    ...getRequestMeta(request)
  });

  return Response.json({
    admin: {
      ...admin,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString()
    }
  });
}
