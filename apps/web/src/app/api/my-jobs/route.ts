// apps/web/src/app/api/my-jobs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import type { Job as JobRow, EmployerProfile } from "@prisma/client";
import type { Job as JobCard } from "@/components/JobCard";
import { getSessionUser } from "@/server/auth";
import { JobStatus } from "@prisma/client";

// Map Prisma Job + EmployerProfile -> JobCard used by the frontend
function mapJobToCard(
  row: JobRow & { employer: EmployerProfile | null },
): JobCard {
  const employer = row.employer;

  // Make sure employmentType matches JobCard union
  const allowedEmploymentTypes: JobCard["employmentType"][] = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
  ];
  const employmentType = allowedEmploymentTypes.find(
    (t) => t === row.employmentType,
  );

  return {
    id: row.id,
    title: row.title,
    company: employer?.companyName || "Unknown company",
    location: row.location || employer?.location || "Remote / flexible",
    tags: row.tags ?? [],
    summary: row.description || undefined,
    employmentType,
    status: row.status,
    isPublic: row.isPublic,

    // Not stored yet in DB:
    salary: undefined,
    postedAt: undefined,
    experienceLevel: undefined,
  };
}

// GET /api/my-jobs
// Returns jobs created by the logged-in employer user.
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated." },
      { status: 401 },
    );
  }

  if (
    session.role !== "recruiter" ||
    (session.profileMode !== "employer" && session.profileMode !== "both")
  ) {
    return NextResponse.json(
      { ok: false, error: "Only employers can manage jobs." },
      { status: 403 },
    );
  }

  const userId = session.sub;

  try {
    const rows = await prisma.job.findMany({
      where: { employerUserId: userId },
      include: { employer: true },
      orderBy: { createdAt: "desc" },
    });

    const jobs: JobCard[] = rows.map(mapJobToCard);

    return NextResponse.json({ ok: true, jobs });
  } catch (error) {
    console.error("Error fetching my jobs:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load jobs" },
      { status: 500 },
    );
  }
}

// POST /api/my-jobs
// Creates a new job for this employer.
export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated." },
      { status: 401 },
    );
  }

  if (
    session.role !== "recruiter" ||
    (session.profileMode !== "employer" && session.profileMode !== "both")
  ) {
    return NextResponse.json(
      { ok: false, error: "Only employers can create jobs." },
      { status: 403 },
    );
  }

  const userId = session.sub;

  try {
    const body = await req.json();

    const title = (body.title as string | undefined)?.trim();
    const description = (body.description as string | undefined) ?? "";
    const location = (body.location as string | undefined) ?? "";
    const employmentType = (body.employmentType as string | undefined) ?? null;
    const remoteType = (body.remoteType as string | undefined) ?? null;
    const isPublic =
      typeof body.isPublic === "boolean" ? body.isPublic : true;
    const rawStatus = (body.status as string | undefined) ?? "open";
    const rawTags = (body.tags as string | string[] | undefined) ?? [];

    if (!title) {
      return NextResponse.json(
        { ok: false, error: "Job title is required" },
        { status: 400 },
      );
    }

    // Normalize tags: accept array or comma-separated string
    let tags: string[] = [];
    if (Array.isArray(rawTags)) {
      tags = rawTags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof rawTags === "string") {
      tags = rawTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    // Ensure this user actually has an employer profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employerProfile) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "You need an employer profile before you can post jobs. Fill in your employer profile first.",
        },
        { status: 400 },
      );
    }

    const status: JobStatus =
      rawStatus === "draft" ? "draft" : "open";

    const job = await prisma.job.create({
      data: {
        employerUserId: userId,
        title,
        description,
        location,
        employmentType,
        remoteType,
        isPublic,
        status,
        tags,
      },
      include: { employer: true },
    });

    const card = mapJobToCard(job);

    return NextResponse.json(
      { ok: true, job: card, message: "Job created." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create job" },
      { status: 500 },
    );
  }
}

// PATCH /api/my-jobs
// Simple update endpoint to toggle status / visibility or edit text.
// Expects { jobId, ...fieldsToUpdate } (user derived from session).
export async function PATCH(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated." },
      { status: 401 },
    );
  }

  if (
    session.role !== "recruiter" ||
    (session.profileMode !== "employer" && session.profileMode !== "both")
  ) {
    return NextResponse.json(
      { ok: false, error: "Only employers can update jobs." },
      { status: 403 },
    );
  }

  const userId = session.sub;

  try {
    const body = await req.json();

    const jobId = body.jobId as string | undefined;

    if (!jobId) {
      return NextResponse.json(
        { ok: false, error: "Missing jobId" },
        { status: 400 },
      );
    }

    // Only allow updating jobs that belong to this employer
    const existing = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existing || existing.employerUserId !== userId) {
      return NextResponse.json(
        { ok: false, error: "Job not found for this employer" },
        { status: 404 },
      );
    }

    const data: Partial<JobRow> = {};

    if (typeof body.title === "string") data.title = body.title.trim();
    if (typeof body.description === "string")
      data.description = body.description;
    if (typeof body.location === "string") data.location = body.location;
    if (typeof body.employmentType === "string")
      data.employmentType = body.employmentType;
    if (typeof body.remoteType === "string")
      data.remoteType = body.remoteType;
    if (typeof body.isPublic === "boolean") data.isPublic = body.isPublic;
    if (typeof body.status === "string") {
      if (["draft", "open", "closed"].includes(body.status)) {
        data.status = body.status as JobStatus;
      }
    }

    const tagsFromBody = body.tags as unknown;

    if (Array.isArray(tagsFromBody)) {
      data.tags = tagsFromBody
        .map((t) => String(t).trim())
        .filter(Boolean);
    } else if (typeof tagsFromBody === "string") {
      data.tags = tagsFromBody
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data,
      include: { employer: true },
    });

    const card = mapJobToCard(updated);

    return NextResponse.json(
      { ok: true, job: card, message: "Job updated." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update job" },
      { status: 500 },
    );
  }
}
