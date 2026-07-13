import { isAdminRole, type AppRole } from "@/lib/authorization";

export type LoginPortal = "SENDER" | "ADMIN";

export function canLoginThroughPortal(role: AppRole | string, portal: LoginPortal) {
  if (portal === "SENDER") return role === "SENDER";
  return isAdminRole(role);
}

export function getLoginPortalError(role: AppRole | string, portal: LoginPortal) {
  if (portal === "SENDER" && isAdminRole(role)) {
    return "Ce compte est un compte administrateur. Veuillez utiliser l’accès administrateur.";
  }

  if (portal === "ADMIN" && role === "SENDER") {
    return "Ce compte est un compte utilisateur. Veuillez utiliser la connexion client.";
  }

  return "Accès refusé pour ce portail de connexion.";
}
