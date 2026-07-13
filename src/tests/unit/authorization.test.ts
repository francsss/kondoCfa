import { describe, expect, it } from "vitest";
import {
  canAccessAdmin,
  canAccessOwnTransfer,
  hasRole,
  isAdminRole
} from "@/lib/authorization";

describe("role authorization helpers", () => {
  it("allows admin and super admin into admin routes", () => {
    expect(canAccessAdmin("ADMIN")).toBe(true);
    expect(canAccessAdmin("SUPER_ADMIN")).toBe(true);
    expect(canAccessAdmin("SENDER")).toBe(false);
  });

  it("checks explicit roles", () => {
    expect(hasRole("SENDER", ["SENDER"])).toBe(true);
    expect(hasRole("ADMIN", ["SENDER"])).toBe(false);
    expect(isAdminRole("SUPER_ADMIN")).toBe(true);
  });

  it("lets senders access only their own transfers", () => {
    expect(
      canAccessOwnTransfer({ role: "SENDER", userId: "u1", ownerId: "u1" })
    ).toBe(true);
    expect(
      canAccessOwnTransfer({ role: "SENDER", userId: "u1", ownerId: "u2" })
    ).toBe(false);
    expect(
      canAccessOwnTransfer({ role: "ADMIN", userId: "u1", ownerId: "u2" })
    ).toBe(true);
  });
});
