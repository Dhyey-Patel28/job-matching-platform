'use client';
import Card from './Card';

export type Employer = {
  id: string;
  name: string;
  industry: string;
  openRoles: number;
  rating?: number;
  location?: string;
};

export default function EmployerCard({ employer }: { employer: Employer }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{employer.name}</h3>
          <p className="text-sm text-gray-600">
            {employer.industry}{employer.location ? ` · ${employer.location}` : ''}
          </p>
        </div>
        <span className="text-sm font-medium">{employer.openRoles} open</span>
      </div>
      {typeof employer.rating === 'number' && (
        <p className="mt-3 text-xs text-gray-600">Rating: {employer.rating.toFixed(1)}/5</p>
      )}
    </Card>
  );
}
