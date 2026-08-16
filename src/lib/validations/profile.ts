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

export const USERNAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const USERNAME_FORMAT_MESSAGE =
  "3-30 characters: lowercase letters, numbers, and single hyphens only";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(30)
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine(
    (value) => !value || (value.length >= 3 && USERNAME_REGEX.test(value)),
    { message: USERNAME_FORMAT_MESSAGE },
  );

export const profileInputSchema = z.object({
  name: optionalText(120),
  experience: optionalText(120),
  location: optionalText(120),
  skills: skillsSchema,
  bio: optionalText(1000),
  githubUrl: optionalUrl(),
  linkedinUrl: optionalUrl(),
  websiteUrl: optionalUrl(),
  username: usernameSchema,
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
