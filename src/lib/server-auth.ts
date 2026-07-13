import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      country: true,
      role: true,
      status: true,
      createdAt: true
    }
  });

  if (!user || user.status !== "ACTIVE") return null;
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!canAccessAdmin(user.role)) redirect("/dashboard");
  return user;
}

export async function requireSender() {
  const user = await requireUser();
  if (user.role !== "SENDER") redirect("/admin");
  return user;
}
