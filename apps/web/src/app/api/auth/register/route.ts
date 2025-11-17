// apps/web/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";

type RegisterBody = {
  email?: string;
  password?: string;
  profileMode?: "candidate" | "employer" | "both";
};

export async function POST(req: Request) {
  let body: RegisterBody;

  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const profileMode = body.profileMode ?? "candidate";

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (!["candidate", "employer", "both"].includes(profileMode)) {
    return NextResponse.json(
      { ok: false, error: "Invalid profile mode." },
      { status: 400 },
    );
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const role = profileMode === "candidate" ? "candidate" : "recruiter";

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        profileMode,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Registration successful. You can now sign in.",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Error during registration:", err);

    // Don’t depend on PrismaClientKnownRequestError type – just
    // check the error code in a type-safe-ish way.
    const maybePrismaError = err as { code?: string };

    if (maybePrismaError && maybePrismaError.code === "P2002") {
      return NextResponse.json(
        {
          ok: false,
          error: "An account with that email already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to register. Please try again later." },
      { status: 500 },
    );
  }
}
