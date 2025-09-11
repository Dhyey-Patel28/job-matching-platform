'use client';

import SwipeDeck from '@/components/SwipeDeck';

type Candidate = { id: number; name: string; role: string; skills: string[] };

const data: Candidate[] = [
  { id: 1, name: 'Ava Patel', role: 'Frontend Engineer', skills: ['React', 'TypeScript', 'Tailwind'] },
  { id: 2, name: 'Leo Kim', role: 'Backend Engineer', skills: ['Node', 'Postgres', 'Prisma'] },
  { id: 3, name: 'Mina Ali', role: 'Data Scientist', skills: ['Python', 'Pandas', 'XGBoost'] },
];

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Swipe Deck Demo</h1>
      <SwipeDeck
        items={data}
        onSwipe={(item, dir) => console.log('swiped', dir, item)}
        renderItem={(c) => (
          <div className="flex h-full flex-col">
            <div className="flex-1">
              <h2 className="text-xl font-bold">{c.name}</h2>
              <p className="text-gray-600">{c.role}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {c.skills.map((s) => (
                  <li key={s} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      />
    </main>
  );
}
