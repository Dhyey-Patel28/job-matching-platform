New-Item -ItemType Directory -Force -Path scripts | Out-Null
@'
param()

$ErrorActionPreference = "Stop"

# 1) basic folders
New-Item -ItemType Directory -Force -Path apps,backend,infra | Out-Null
Set-Location (Get-Location)

# 2) scaffold Next.js app (PowerShell: keep on one line)
if (-not (Test-Path "apps/web/package.json")) {
  npx create-next-app@latest apps/web --ts --eslint --tailwind --src-dir --app --import-alias "@/*" --use-npm
}

# 3) remove app-local node_modules/lockfile; we want a SINGLE root lockfile
if (Test-Path "apps/web/node_modules") { Remove-Item -Recurse -Force "apps/web/node_modules" }
if (Test-Path "apps/web/package-lock.json") { Remove-Item -Force "apps/web/package-lock.json" }

# 4) root package.json (workspaces) – teammates run from root
$rootPkg = @'
{
  "name": "job-matching-platform",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "npm run dev -w apps/web",
    "build": "npm run build -w apps/web",
    "start": "npm run start -w apps/web",
    "lint": "npm run lint -w apps/web",
    "typecheck": "npm run typecheck -w apps/web"
  },
  "engines": { "node": ">=18.18.0" }
}
'@
Set-Content -Path "package.json" -Encoding UTF8 -Value $rootPkg

# 5) root .gitignore
$gitignore = @'
node_modules
.next
.env*
apps/web/.next
apps/web/out
apps/web/.vercel
.DS_Store
'@
Set-Content -Path ".gitignore" -Encoding UTF8 -Value $gitignore

# 6) backend/infra placeholders
Set-Content -Path "backend/README.md" -Encoding UTF8 -Value "# Backend (placeholder)"
Set-Content -Path "infra/README.md"   -Encoding UTF8 -Value "# Infra (placeholder)"

# 7) CI script that really builds
New-Item -ItemType Directory -Force -Path scripts | Out-Null
$ci = @'
#!/usr/bin/env bash
set -euo pipefail

echo "== CI: build frontend =="
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="${WEB_DIR:-apps/web}"

cd "$ROOT_DIR/$WEB_DIR"
npm ci
npm run typecheck --if-present
npm run lint --if-present
npm run build
echo "== CI ok =="
'@
Set-Content -Path "scripts/ci.sh" -Encoding UTF8 -Value $ci

# 8) card templates (components + data + homepage)
New-Item -ItemType Directory -Force -Path "apps/web/src/components" | Out-Null
New-Item -ItemType Directory -Force -Path "apps/web/src/data" | Out-Null

$card = @'
"use client";
import React from "react";
export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border p-4 shadow-sm hover:shadow-md transition-shadow bg-white">{children}</div>;
}
'@
Set-Content -Path "apps/web/src/components/Card.tsx" -Encoding UTF8 -Value $card

$jobCard = @'
"use client";
import Card from "./Card";
export type Job = { id: string; title: string; company: string; location: string; salary?: string; tags?: string[]; postedAt?: string; };
export default function JobCard({ job }: { job: Job }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company} · {job.location}</p>
        </div>
        {job.salary && <span className="text-sm font-medium">{job.salary}</span>}
      </div>
      {job.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {job.tags.map(t => <span key={t} className="text-xs px-2 py-1 rounded-full border bg-gray-50">{t}</span>)}
        </div>
      ) : null}
      {job.postedAt && <p className="mt-3 text-xs text-gray-500">Posted {job.postedAt}</p>}
    </Card>
  );
}
'@
Set-Content -Path "apps/web/src/components/JobCard.tsx" -Encoding UTF8 -Value $jobCard

$empCard = @'
"use client";
import Card from "./Card";
export type Employer = { id: string; name: string; industry: string; openRoles: number; rating?: number; location?: string; };
export default function EmployerCard({ employer }: { employer: Employer }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{employer.name}</h3>
          <p className="text-sm text-gray-600">
            {employer.industry}{employer.location ? ` · ${employer.location}` : ""}
          </p>
        </div>
        <span className="text-sm font-medium">{employer.openRoles} open</span>
      </div>
      {typeof employer.rating === "number" && (
        <p className="mt-3 text-xs text-gray-600">Rating: {employer.rating.toFixed(1)}/5</p>
      )}
    </Card>
  );
}
'@
Set-Content -Path "apps/web/src/components/EmployerCard.tsx" -Encoding UTF8 -Value $empCard

$sample = @'
import type { Job } from "@/components/JobCard";
import type { Employer } from "@/components/EmployerCard";

export const sampleJobs: Job[] = [
  { id: "j1", title: "Frontend Engineer", company: "Acme", location: "Remote", salary: "$120k–$150k", tags: ["Next.js","TypeScript","Tailwind"], postedAt: "2d ago" },
  { id: "j2", title: "Fullstack Dev", company: "Globex", location: "NYC, NY", tags: ["Node.js","Postgres"], postedAt: "1w ago" }
];

export const sampleEmployers: Employer[] = [
  { id: "e1", name: "Wayfinder Labs", industry: "Internet", openRoles: 4, rating: 4.5, location: "Remote" },
  { id: "e2", name: "Nimbus Health", industry: "Healthcare", openRoles: 2, rating: 4.1, location: "Austin, TX" }
];
'@
Set-Content -Path "apps/web/src/data/sample.ts" -Encoding UTF8 -Value $sample

$page = @'
"use client";
import { useState } from "react";
import JobCard from "@/components/JobCard";
import EmployerCard from "@/components/EmployerCard";
import { sampleJobs, sampleEmployers } from "@/data/sample";

export default function HomePage() {
  const [tab, setTab] = useState<"jobs" | "employers">("jobs");
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Job Matching Platform</h1>
      <div className="mt-6 inline-flex rounded-xl border p-1 bg-white">
        <button className={`px-4 py-2 rounded-lg text-sm ${tab === "jobs" ? "bg-gray-900 text-white" : ""}`} onClick={() => setTab("jobs")}>Jobs</button>
        <button className={`px-4 py-2 rounded-lg text-sm ${tab === "employers" ? "bg-gray-900 text-white" : ""}`} onClick={() => setTab("employers")}>Employers</button>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tab === "jobs" ? sampleJobs.map(j => <JobCard key={j.id} job={j} />) : sampleEmployers.map(e => <EmployerCard key={e.id} employer={e} />)}
      </div>
    </main>
  );
}
'@
Set-Content -Path "apps/web/src/app/page.tsx" -Encoding UTF8 -Value $page

# 9) repo README
$readme = @'
# Job Matching Platform

Frontend only (for now).

## Quick Start
```bash
npm install
npm run dev
