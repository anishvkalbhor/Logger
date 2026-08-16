import type { EntryType } from "@/generated/prisma/client";

export type { EntryType };

/** Shape of an Entry as it comes back from the API (dates as ISO strings). */
export type EntryDTO = {
  id: string;
  userId: string;
  title: string;
  type: EntryType;
  date: string;
  problemContext: string | null;
  whatIDid: string;
  techTags: string[];
  impact: string | null;
  challenges: string | null;
  referenceLink: string | null;
  isPublic: boolean;
  publicSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileDTO = {
  id: string | null;
  userId: string;
  username: string | null;
  name: string | null;
  experience: string | null;
  location: string | null;
  skills: string[];
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  resumeUrl: string | null;
  resumeName: string | null;
};
