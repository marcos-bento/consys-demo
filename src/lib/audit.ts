import { prisma } from "@/lib/prisma";

type AuditPayload = {
  userId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  url?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export async function writeAuditLog(payload: AuditPayload) {
  try {
    const metadata = payload.metadata ? { ...payload.metadata } : {};
    if (payload.url) {
      metadata.url = payload.url;
    }
    await prisma.auditLog.create({
      data: {
        userId: payload.userId ?? null,
        entityType: payload.entityType,
        entityId: payload.entityId ?? null,
        action: payload.action,
        message: payload.message ?? null,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        ip: payload.ip ?? null,
        userAgent: payload.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error("[AUDIT_LOG_WRITE]", error);
  }
}
