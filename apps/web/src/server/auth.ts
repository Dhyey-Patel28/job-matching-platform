// apps/web/src/server/auth.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import type { ProfileMode, Role } from "@prisma/client";

// In dev we can fall back to a default secret if env is missing.
// In prod you MUST set JWT_SECRET in your environment.
const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-do-not-use-in-prod";

export type SessionPayload = {
  sub: string; // userId
  email: string;
  role: Role;
  profileMode: ProfileMode;
  emailVerified: boolean;
  twoFactorPassed?: boolean;
};

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload | string;
    return decoded as SessionPayload;
  } catch {
    return null;
  }
}

/** Read the session from the `session` cookie inside a route handler. */
export async function getSessionUser(): Promise<SessionPayload | null> {
  // TS thinks cookies() is async; await works even if it’s sync under the hood.
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session");
  if (!cookie?.value) return null;
  return verifySession(cookie.value);
}
