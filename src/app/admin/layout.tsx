import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { canAccessAdmin } from "@/lib/authorization";
import { getCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !canAccessAdmin(user.role)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <AdminSidebar role={user.role} />
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-sm font-semibold text-slate-500">Espace admin</div>
            <div className="font-black text-kondo-navy">
              {user.firstName} {user.lastName} · {user.role}
            </div>
          </div>
          <LogoutButton />
        </header>
        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
