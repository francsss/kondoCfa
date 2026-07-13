import { describe, expect, it } from "vitest";
import { TRANSFER_STATUS_LABELS, TRANSFER_STATUSES } from "@/lib/status";

describe("simple transfer statuses", () => {
  it("only exposes the four V1 statuses", () => {
    expect(TRANSFER_STATUSES).toEqual([
      "CREATED",
      "IN_PROGRESS",
      "CANCELLED",
      "SUCCESS"
    ]);
  });

  it("uses French labels", () => {
    expect(TRANSFER_STATUS_LABELS).toEqual({
      CREATED: "Créé",
      IN_PROGRESS: "En cours",
      CANCELLED: "Annulé",
      SUCCESS: "Réussi"
    });
  });
});
