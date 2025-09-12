'use client';
import Card from './Card';

function initials(name: string) {
  return name.split(/\s+/).map(s => s[0]).join('').slice(0,2).toUpperCase();
}

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  tags?: string[];
  postedAt?: string;
  summary?: string;
  experienceLevel?: 'Intern' | 'Junior' | 'Mid' | 'Senior' | 'Lead';
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
};

export default function JobCard({ job }: { job: Job }) {
  return (
    <Card className="flex h-full flex-col p-5">
      {/* Header */}
      <div className="flex items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-sm font-semibold shadow-sm ring-1 ring-gray-200">
            {initials(job.company)}
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight">{job.title}</h3>
            <p className="text-xs text-gray-600">{job.company} · {job.location}</p>
          </div>
        </div>
        {job.salary && (
          <span className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-medium">
            {job.salary}
          </span>
        )}
      </div>

      <div className="h-px w-full bg-gradient-to-r from-gray-200/70 to-transparent" />

      {/* Meta chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600">
        {job.experienceLevel && (
          <span className="rounded-full border border-gray-200 bg-white/70 px-2 py-1">
            {job.experienceLevel}
          </span>
        )}
        {job.employmentType && (
          <span className="rounded-full border border-gray-200 bg-white/70 px-2 py-1">
            {job.employmentType}
          </span>
        )}
      </div>

      {/* Summary */}
      {job.summary && (
        <p className="mt-3 text-sm text-gray-700">
          {job.summary}
        </p>
      )}

      {/* Tech tags */}
      {job.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {job.tags.map(t => (
            <span
              key={t}
              className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-4">
        {job.postedAt ? (
          <p className="text-xs text-gray-500">Posted {job.postedAt}</p>
        ) : <span />}

        <div className="flex gap-2">
          <button
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:shadow-sm active:translate-y-px"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => console.log('Save clicked', job.id)}
          >
            ☆ Save
          </button>
          <button
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white hover:shadow-sm active:translate-y-px"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => console.log('View details', job.id)}
          >
            View details
          </button>
        </div>
      </div>
    </Card>
  );
}
