import { describe, expect, it } from "vitest";
import {
  canChangeAdminStatus,
  canCreateAdminAccount,
  canManageAdmins
} from "@/lib/authorization";
import { getPublicRegisterRole } from "@/lib/register-policy";
import { registerSchema } from "@/lib/validation";

describe("admin management rules", () => {
  it("public registration always resolves to SENDER", () => {
    expect(getPublicRegisterRole()).toBe("SENDER");
  });

  it("public register schema ignores client role escalation", () => {
    const parsed = registerSchema.safeParse({
      firstName: "Amina",
      lastName: "Mballa",
      email: "amina@example.com",
      phone: "+237690111222",
      country: "CM",
      password: "ChangeMe123!",
      confirmPassword: "ChangeMe123!",
      acceptedTerms: true,
      temporaryPassword: "ChangeMe123!",
      role: "SUPER_ADMIN"
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect("role" in parsed.data).toBe(false);
    }
  });

  it("ADMIN cannot create ADMIN accounts", () => {
    expect(canCreateAdminAccount("ADMIN")).toBe(false);
  });

  it("SUPER_ADMIN can create ADMIN accounts", () => {
    expect(canCreateAdminAccount("SUPER_ADMIN")).toBe(true);
  });

  it("SENDER cannot access admin management", () => {
    expect(canManageAdmins("SENDER")).toBe(false);
  });

  it("SUPER_ADMIN can suspend/reactivate ADMIN but not SUPER_ADMIN", () => {
    expect(
      canChangeAdminStatus({
        actorRole: "SUPER_ADMIN",
        targetRole: "ADMIN"
      })
    ).toBe(true);
    expect(
      canChangeAdminStatus({
        actorRole: "SUPER_ADMIN",
        targetRole: "SUPER_ADMIN"
      })
    ).toBe(false);
  });
});
