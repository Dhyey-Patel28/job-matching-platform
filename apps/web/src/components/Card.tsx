'use client';
import React from 'react';

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
      {children}
    </div>
  );
}
