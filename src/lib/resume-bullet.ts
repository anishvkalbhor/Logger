import type { EntryType } from "@/generated/prisma/client";
import { stripMarkdown } from "@/lib/markdown";

const ACTION_VERBS: Record<EntryType, string> = {
  FEATURE: "Built",
  BUG_FIX: "Fixed",
  IMPROVEMENT: "Improved",
  TECH_DEBT: "Refactored",
  OTHER: "Delivered",
};

export type BulletSource = {
  title: string;
  type: EntryType;
  whatIDid: string;
  techTags: string[];
  impact?: string | null;
};

export function buildResumeBullet(entry: BulletSource) {
  const verb = ACTION_VERBS[entry.type];
  const tech = entry.techTags.length
    ? ` using ${entry.techTags.join(", ")}`
    : "";
  const impactText = stripMarkdown(entry.impact?.trim() ?? "");
  const impact = impactText ? `, resulting in ${impactText}` : "";
  const whatIDid = stripMarkdown(entry.whatIDid.trim());

  return `${verb} ${entry.title.trim()} — ${whatIDid}${tech}${impact}.`;
}
