export const ROLES = ["SUPER_ADMIN", "ADMIN", "SENDER"] as const;

export type AppRole = (typeof ROLES)[number];

export function isAdminRole(role: AppRole | string | null | undefined) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdminRole(role: AppRole | string | null | undefined) {
  return role === "SUPER_ADMIN";
}

export function hasRole(
  role: AppRole | string | null | undefined,
  allowedRoles: readonly AppRole[]
) {
  return Boolean(role && allowedRoles.includes(role as AppRole));
}

export function canAccessAdmin(role: AppRole | string | null | undefined) {
  return isAdminRole(role);
}

export function canManageAdmins(role: AppRole | string | null | undefined) {
  return isSuperAdminRole(role);
}

export function canCreateAdminAccount(
  role: AppRole | string | null | undefined
) {
  return isSuperAdminRole(role);
}

export function canChangeAdminStatus(args: {
  actorRole: AppRole | string | null | undefined;
  targetRole: AppRole | string | null | undefined;
}) {
  return isSuperAdminRole(args.actorRole) && args.targetRole === "ADMIN";
}

export function canAccessOwnTransfer(args: {
  role: AppRole | string | null | undefined;
  userId: string;
  ownerId: string;
}) {
  return isAdminRole(args.role) || args.userId === args.ownerId;
}
