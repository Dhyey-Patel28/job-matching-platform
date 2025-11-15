// apps/web/src/app/api/employers/route.ts
import { NextResponse } from "next/server";
import { sampleEmployers } from "@/data/sample";

export async function GET() {
  // Later: replace sampleEmployers with a DB call
  return NextResponse.json({ employers: sampleEmployers });
}