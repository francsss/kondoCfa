import { describe, expect, it } from "vitest";
import {
  canLoginThroughPortal,
  getLoginPortalError
} from "@/lib/login-policy";

describe("login portal policy", () => {
  it("sender login rejects ADMIN and SUPER_ADMIN accounts", () => {
    expect(canLoginThroughPortal("ADMIN", "SENDER")).toBe(false);
    expect(canLoginThroughPortal("SUPER_ADMIN", "SENDER")).toBe(false);
    expect(getLoginPortalError("ADMIN", "SENDER")).toBe(
      "Ce compte est un compte administrateur. Veuillez utiliser l’accès administrateur."
    );
  });

  it("admin login rejects SENDER accounts", () => {
    expect(canLoginThroughPortal("SENDER", "ADMIN")).toBe(false);
    expect(getLoginPortalError("SENDER", "ADMIN")).toBe(
      "Ce compte est un compte utilisateur. Veuillez utiliser la connexion client."
    );
  });

  it("accepts the expected roles for each portal", () => {
    expect(canLoginThroughPortal("SENDER", "SENDER")).toBe(true);
    expect(canLoginThroughPortal("ADMIN", "ADMIN")).toBe(true);
    expect(canLoginThroughPortal("SUPER_ADMIN", "ADMIN")).toBe(true);
  });
});
