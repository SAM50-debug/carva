import { NextRequest, NextResponse } from "next/server";
import { SessionPayload } from "../db/models/types";

/** Read the decoded JWT payload forwarded by middleware */
export function getSession(req: NextRequest): SessionPayload | null {
  const raw = req.headers.get("x-user-payload");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

/** Require auth — returns session or 401 response */
export function requireAuth(
  req: NextRequest
): { session: SessionPayload; error: null } | { session: null; error: NextResponse } {
  const session = getSession(req);
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

/** Require super_admin role */
export function requireSuperAdmin(
  req: NextRequest
): { session: SessionPayload; error: null } | { session: null; error: NextResponse } {
  const { session, error } = requireAuth(req);
  if (error) return { session: null, error };
  if (session.role !== "super_admin") {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, error: null };
}

/** Standard API error response */
export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Standard API success response */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
