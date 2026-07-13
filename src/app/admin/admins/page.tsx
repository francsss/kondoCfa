import { redirect } from "next/navigation";
import { AdminManagementClient } from "@/components/admin/AdminManagementClient";
import { isSuperAdminRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const currentUser = await requireAdmin();
  if (!isSuperAdminRole(currentUser.role)) redirect("/admin");

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

  return (
    <div>
      <h1 className="text-3xl font-black text-kondo-navy">
        Gestion des administrateurs
      </h1>
      <p className="mt-2 text-slate-600">
        Seul un SUPER_ADMIN peut créer, suspendre ou réactiver des comptes ADMIN.
      </p>
      <div className="mt-6">
        <AdminManagementClient
          initialAdmins={admins.map((admin) => ({
            ...admin,
            createdAt: admin.createdAt.toISOString(),
            updatedAt: admin.updatedAt.toISOString()
          }))}
        />
      </div>
    </div>
  );
}
