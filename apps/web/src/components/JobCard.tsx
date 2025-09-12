'use client';
import Card from './Card';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  tags?: string[];
  postedAt?: string;
};

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
          {job.tags.map(t => (
            <span key={t} className="text-xs px-2 py-1 rounded-full border bg-gray-50">{t}</span>
          ))}
        </div>
      ) : null}
      {job.postedAt && <p className="mt-3 text-xs text-gray-500">Posted {job.postedAt}</p>}
    </Card>
  );
}
