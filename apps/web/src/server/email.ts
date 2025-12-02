// apps/web/src/server/email.ts
import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST ?? "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT ?? "587");
const smtpSecure = process.env.SMTP_SECURE === "true";

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const emailFrom =
  process.env.EMAIL_FROM ??
  (smtpUser ? `"Job Fair Match" <${smtpUser}>` : "no-reply@example.com");

// Only create a transporter if we have credentials
const transporter =
  smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure, // false for STARTTLS on port 587
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    : null;

/**
 * Send an email verification message with a link.
 */
export async function sendVerificationEmail(to: string, verifyUrl: string) {
  if (!transporter) {
    console.warn(
      "[email] SMTP credentials missing; skipping real email send. verifyUrl:",
      verifyUrl,
    );
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject: "Verify your email",
      text: [
        "Welcome to Job Matching Platform!",
        "",
        "Click the link below to verify your email address:",
        verifyUrl,
        "",
        "If you did not create this account, you can ignore this email.",
      ].join("\n"),
      html: `
        <p>Welcome to <strong>Job Matching Platform</strong>!</p>
        <p>Click the button below to verify your email address:</p>
        <p>
          <a href="${verifyUrl}" style="
            display:inline-block;
            padding:10px 16px;
            border-radius:999px;
            background:#111827;
            color:#ffffff;
            text-decoration:none;
            font-weight:600;
          ">
            Verify my email
          </a>
        </p>
        <p>If that button doesn’t work, paste this link into your browser:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      `,
    });

    console.log("[email] Verification email sent:", info.messageId);
  } catch (err) {
    console.error("[email] Failed to send verification email:", err);
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!transporter) {
    console.warn(
      "[email] SMTP credentials missing; skipping real reset email. resetUrl:",
      resetUrl,
    );
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject: "Reset your Job Matching Platform password",
      text: [
        "You requested a password reset for your Job Matching Platform account.",
        "",
        "Click the link below to choose a new password:",
        resetUrl,
        "",
        "If you didn't request this, you can safely ignore this email.",
      ].join("\n"),
      html: `
        <p>You requested a password reset for your <strong>Job Matching Platform</strong> account.</p>
        <p>Click the button below to choose a new password:</p>
        <p>
          <a href="${resetUrl}" style="
            display:inline-block;
            padding:10px 16px;
            border-radius:999px;
            background:#111827;
            color:#ffffff;
            text-decoration:none;
            font-weight:600;
          ">
            Reset my password
          </a>
        </p>
        <p>If that button doesn’t work, paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    console.log("[email] Password reset email sent:", info.messageId);
  } catch (err) {
    console.error("[email] Failed to send password reset email:", err);
  }
}
