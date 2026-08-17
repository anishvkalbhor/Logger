import type { EntryType } from "@/lib/types";

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  FEATURE: "Feature",
  BUG_FIX: "Bug Fix",
  IMPROVEMENT: "Improvement",
  TECH_DEBT: "Tech Debt",
  OTHER: "Other",
};

// Fixed categorical hues (validated for CVD-safety and contrast — see
// dataviz palette method). Soft tint background + a darkened/lightened
// same-hue text color, so identity is legible without relying on a raw
// saturated fill. OTHER stays neutral (falls back to the badge's default
// "secondary" styling) since it's a catch-all, not a category worth
// standing out.
export const ENTRY_TYPE_BADGE_CLASSES: Record<EntryType, string> = {
  FEATURE: "bg-[#2a78d6]/10 text-[#1c5cab] dark:bg-[#3987e5]/15 dark:text-[#5598e7]",
  BUG_FIX: "bg-[#eb6834]/10 text-[#a8421a] dark:bg-[#d95926]/15 dark:text-[#e87a4a]",
  IMPROVEMENT: "bg-[#1baf7a]/10 text-[#0a7550] dark:bg-[#199e70]/15 dark:text-[#22b884]",
  TECH_DEBT: "bg-[#eda100]/10 text-[#9c6900] dark:bg-[#c98500]/15 dark:text-[#eda100]",
  OTHER: "",
};
