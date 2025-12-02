// apps/web/src/app/verify-email/page.tsx
import Link from "next/link";
import { prisma } from "@/server/db";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams; // ✅ await the promise

  let status:
    | "missing"
    | "invalid"
    | "expired"
    | "used"
    | "success" = "missing";

  if (!token) {
    status = "missing";
  } else {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      status = "invalid";
    } else if (record.used) {
      status = "used";
    } else if (record.expiresAt < new Date()) {
      status = "expired";
    } else {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: record.userId },
          data: { emailVerified: true },
        }),
        prisma.emailVerificationToken.update({
          where: { id: record.id },
          data: { used: true },
        }),
      ]);

      status = "success";
    }
  }

  const title =
    status === "success"
      ? "Email verified!"
      : status === "used"
      ? "Link already used"
      : status === "expired"
      ? "Verification link expired"
      : status === "invalid"
      ? "Invalid verification link"
      : "Missing verification token";

  const message =
    status === "success"
      ? "Your email address has been verified. You can now sign in with your account."
      : status === "used"
      ? "This verification link has already been used. If you still can't sign in, try requesting a new verification email."
      : status === "expired"
      ? "This verification link has expired. Please request a new verification email."
      : status === "invalid"
      ? "We couldn't find a verification record for this link. Double-check the URL or request a new email."
      : "No verification token was provided. Please use the link from your email or request a new one.";

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4">
      <div className="relative w-[min(480px,92vw)]">
        <div className="absolute -inset-2 rounded-3xl bg-emerald-400/20 blur-2xl" />
        <div className="relative rounded-3xl bg-slate-900/90 p-8 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-xl font-black text-gray-900 shadow-sm">
              J
            </div>
            <div className="text-sm font-medium text-white/90">
              Job Matching Platform
            </div>
          </div>

          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <p className="mt-2 text-sm text-white/80">{message}</p>

          <div className="mt-6 flex flex-col gap-2 text-sm">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:shadow-md active:translate-y-px"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
