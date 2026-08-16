import { z } from "zod";

export const ENTRY_TYPES = [
  "FEATURE",
  "BUG_FIX",
  "IMPROVEMENT",
  "TECH_DEBT",
  "OTHER",
] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

const techTagsSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(20)
  .default([])
  .transform((tags) => Array.from(new Set(tags)));

const referenceLinkSchema = z
  .string()
  .trim()
  .max(500)
  .optional()
  .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
    message: "Must be a valid http(s) URL",
  })
  .transform((value) => (value ? value : undefined));

export const entryInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  type: z.enum(ENTRY_TYPES),
  date: z.coerce.date(),
  problemContext: optionalText(5000),
  whatIDid: z.string().trim().min(1, "This field is required").max(5000),
  techTags: techTagsSchema,
  impact: optionalText(2000),
  challenges: optionalText(5000),
  referenceLink: referenceLinkSchema,
});

export const updateEntrySchema = entryInputSchema.partial();

export const entryListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.enum(ENTRY_TYPES).optional(),
  tech: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export type EntryInput = z.infer<typeof entryInputSchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type EntryListQuery = z.infer<typeof entryListQuerySchema>;
