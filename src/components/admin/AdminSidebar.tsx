import { KondoLogo } from "@/components/KondoLogo";
import { isSuperAdminRole, type AppRole } from "@/lib/authorization";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/transfers", label: "Transferts" },
  { href: "/admin/operations", label: "Opérations" },
  { href: "/admin/settings", label: "Paramètres" },
  { href: "/admin/audit", label: "Audit logs" }
];

export function AdminSidebar({ role }: { role: AppRole | string }) {
  const visibleItems = isSuperAdminRole(role)
    ? [...items, { href: "/admin/admins", label: "Gestion des administrateurs" }]
    : items;

  return (
    <aside className="border-b border-slate-100 bg-white p-4 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <KondoLogo size="sm" variant="wordmark" />
      <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col">
        {visibleItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold text-kondo-navy hover:bg-kondo-sky"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
