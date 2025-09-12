'use client';

import { useMemo, useState } from 'react';
import JobCard, { type Job } from '@/components/JobCard';
import EmployerCard, { type Employer } from '@/components/EmployerCard';
import SwipeDeck, { type SwipeDirection } from '@/components/SwipeDeck';
import { sampleJobs, sampleEmployers } from '@/data/sample';

export default function HomePage() {
  const [tab, setTab] = useState<'jobs' | 'employers'>('jobs');
  const [lastAction, setLastAction] = useState<string | null>(null);

  const items = useMemo(() => (tab === 'jobs' ? sampleJobs : sampleEmployers), [tab]);

  const onSwipe = (dir: SwipeDirection, item: Job | Employer) => {
    const label = 'title' in item ? item.title : item.name;
    setLastAction(`${dir === 'right' ? 'Liked' : 'Dismissed'}: ${label}`);
    // later: call API to persist preference
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
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

      <div className="mt-8 flex justify-center">
        <SwipeDeck
          items={items}
          onSwipe={onSwipe}
          getId={(it) => ('id' in it ? it.id : Math.random().toString(36))}
          renderItem={(it) =>
            tab === 'jobs' ? (
              <div className="m-auto h-[400px] w-[360px]">
                <JobCard job={it as Job} />
              </div>
            ) : (
              <div className="m-auto h-[400px] w-[360px]">
                <EmployerCard employer={it as Employer} />
              </div>
            )
          }
          emptyState={<div className="p-6">You’re all caught up. 🎉</div>}
        />
      </div>

      {lastAction && (
        <p className="mt-4 text-center text-sm text-gray-600" aria-live="polite">
          {lastAction}
        </p>
      )}
    </main>
  );
}
