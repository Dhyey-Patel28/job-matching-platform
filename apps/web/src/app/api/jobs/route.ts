// apps/web/src/app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { sampleJobs } from "@/data/sample";

export async function GET() {
  // Later: replace sampleJobs with a DB call
  return NextResponse.json({ jobs: sampleJobs });
}