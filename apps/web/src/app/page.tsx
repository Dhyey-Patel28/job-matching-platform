'use client';
import { useState } from 'react';
import JobCard from '@/components/JobCard';
import EmployerCard from '@/components/EmployerCard';
import { sampleJobs, sampleEmployers } from '@/data/sample';

export default function HomePage() {
  const [tab, setTab] = useState<'jobs' | 'employers'>('jobs');

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Job Matching Platform</h1>

      <div className="mt-6 inline-flex rounded-xl border p-1 bg-white">
        <button
          className={`px-4 py-2 rounded-lg text-sm ${tab === 'jobs' ? 'bg-gray-900 text-white' : ''}`}
          onClick={() => setTab('jobs')}
        >
          Jobs
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm ${tab === 'employers' ? 'bg-gray-900 text-white' : ''}`}
          onClick={() => setTab('employers')}
        >
          Employers
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tab === 'jobs'
          ? sampleJobs.map(j => <JobCard key={j.id} job={j} />)
          : sampleEmployers.map(e => <EmployerCard key={e.id} employer={e} />)}
      </div>
    </main>
  );
}
