import { prisma } from "@/lib/prisma";

type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function writeAuditLog(input: AuditInput) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValue: input.oldValue ?? undefined,
      newValue: input.newValue ?? undefined,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null
    }
  });
}
