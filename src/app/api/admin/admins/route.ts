import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { canCreateAdminAccount, canManageAdmins } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getRequestMeta, jsonError } from "@/lib/request";
import { getCurrentUser } from "@/lib/server-auth";
import { createAdminSchema } from "@/lib/validation";

function toAdminDto(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  country: string | null;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    country: user.country,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return jsonError("Non authentifié.", 401);
  if (!canManageAdmins(currentUser.role)) return jsonError("Accès refusé.", 403);

  const admins = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
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

  return Response.json({ admins: admins.map(toAdminDto) });
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return jsonError("Non authentifié.", 401);
  if (!canCreateAdminAccount(currentUser.role)) {
    return jsonError("Seul un super administrateur peut créer un admin.", 403);
  }

  const payload = await request.json().catch(() => null);
  const parsed = createAdminSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("Veuillez vérifier les informations de l'admin.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });
  if (existing) return jsonError("Cet email est déjà utilisé.", 409);

  const passwordHash = await bcrypt.hash(parsed.data.temporaryPassword, 12);
  const admin = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
      country: parsed.data.country || null,
      role: "ADMIN",
      status: parsed.data.status
    },
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
    action: "ADMIN_CREATED_BY_SUPER_ADMIN",
    entityType: "User",
    entityId: admin.id,
    newValue: { email: admin.email, role: admin.role, status: admin.status },
    ...getRequestMeta(request)
  });

  return Response.json({ admin: toAdminDto(admin) }, { status: 201 });
}
