import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

const optionalUrl = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
      message: "Must be a valid http(s) URL",
    })
    .transform((value) => (value ? value : undefined));

const skillsSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(30)
  .default([])
  .transform((skills) => Array.from(new Set(skills)));

export const profileInputSchema = z.object({
  name: optionalText(120),
  experience: optionalText(120),
  location: optionalText(120),
  skills: skillsSchema,
  bio: optionalText(1000),
  githubUrl: optionalUrl(),
  linkedinUrl: optionalUrl(),
  websiteUrl: optionalUrl(),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
