import type { NextRequest } from "next/server";

export function getRequestMeta(request: NextRequest) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: request.headers.get("user-agent")
  };
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
