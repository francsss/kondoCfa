import type { AppRole } from "@/lib/authorization";

export const PUBLIC_REGISTER_ROLE: AppRole = "SENDER";

export function getPublicRegisterRole(): AppRole {
  return PUBLIC_REGISTER_ROLE;
}
