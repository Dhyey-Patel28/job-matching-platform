// apps/web/src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "password123";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { username, password, role, remember } = body as {
    username?: string;
    password?: string;
    role?: "candidate" | "recruiter";
    remember?: boolean;
  };

  if (!username || !password || !role) {
    return NextResponse.json(
      { error: "username, password, and role are required." },
      { status: 400 },
    );
  }

  if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
    );
  }

  // For now this is a stateless demo. Later you can return a signed JWT, set cookies, etc.
  return NextResponse.json({
    ok: true,
    user: {
      username,
      role,
    },
    remember: !!remember,
    token: "demo-token-not-secure", // <-- placeholder
  });
}
