// apps/web/src/server/auth.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import type { ProfileMode, Role } from "@prisma/client";

// JWT_SECRET is required in every environment. There is no fallback:
// without it, sessions can be neither issued nor accepted (fail closed).
function getJwtSecret(): string | null {
  return process.env.JWT_SECRET || null;
}

export type SessionPayload = {
  sub: string; // userId
  email: string;
  role: Role;
  profileMode: ProfileMode;
  emailVerified: boolean;
  twoFactorPassed?: boolean;
};

export function signSession(payload: SessionPayload): string {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error("JWT_SECRET is not configured; refusing to sign session.");
  }
  return jwt.sign(payload, secret, { algorithm: "HS256", expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  const secret = getJwtSecret();
  if (!secret) {
    console.error("[auth] JWT_SECRET is not configured; rejecting session.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as
      | JwtPayload
      | string;
    if (typeof decoded !== "object" || typeof decoded.sub !== "string") {
      return null;
    }
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
