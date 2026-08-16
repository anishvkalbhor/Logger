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
  createdAt: string;
  updatedAt: string;
};
