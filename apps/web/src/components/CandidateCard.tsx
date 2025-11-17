// src/components/CandidateCard.tsx
"use client";

import Link from "next/link";
import Card from "./Card";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export type Candidate = {
  id: string;
  name: string;
  headline?: string;
  location?: string;
  interests?: string;
  resumeUrl?: string;
};

export default function CandidateCard({ candidate }: { candidate: Candidate }) {
  const hasResume = Boolean(candidate.resumeUrl);

  return (
    <Card className="flex h-full flex-col p-4 md:p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
          {initials(candidate.name || "Candidate")}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {candidate.name || "Anonymous candidate"}
          </h3>
          {candidate.headline && (
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
              {candidate.headline}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 space-y-3 text-xs text-gray-700">
        {candidate.location && (
          <p className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-gray-800">Location:</span>{" "}
            <span className="text-gray-700">{candidate.location}</span>
          </p>
        )}

        {candidate.interests && (
          <p className="text-[11px] leading-snug text-gray-600">
            <span className="font-medium text-gray-800">Interests:</span>{" "}
            {candidate.interests}
          </p>
        )}

        {!candidate.headline && !candidate.interests && (
          <p className="text-[11px] leading-snug text-gray-500">
            This candidate hasn&apos;t added much detail yet, but you can still
            save or reach out after they complete their profile.
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-xs text-gray-400">Candidate profile</span>
        <div className="flex gap-2">
          {hasResume && candidate.resumeUrl ? (
            <Link
              href={candidate.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:shadow-sm active:translate-y-px"
              onClick={(e) => e.stopPropagation()}
            >
              View résumé
            </Link>
          ) : (
            <span className="rounded-lg border border-dashed border-gray-200 px-3 py-1.5 text-[11px] text-gray-400">
              Résumé not uploaded
            </span>
          )}
          <button
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:shadow-sm active:translate-y-px"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => console.log("Save candidate", candidate.id)}
          >
            Save
          </button>
        </div>
      </div>
    </Card>
  );
}
