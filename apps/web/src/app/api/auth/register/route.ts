// apps/web/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";

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

  const { email, password } = body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required." },
      { status: 400 },
    );
  }

  // Demo only: nothing is persisted.
  return NextResponse.json({
    ok: true,
    message:
      "Registration accepted in demo mode. In a real backend, this would create a user in your database.",
  });
}
