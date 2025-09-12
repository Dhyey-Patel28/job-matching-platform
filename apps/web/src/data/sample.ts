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
