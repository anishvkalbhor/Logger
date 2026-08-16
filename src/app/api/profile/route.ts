import { NextRequest, NextResponse } from "next/server";

import { badRequest, requireUserId, unauthorized } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { profileInputSchema } from "@/lib/validations/profile";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const profile = await prisma.profile.findUnique({ where: { userId } });

  return NextResponse.json(
    profile ?? {
      id: null,
      userId,
      name: null,
      experience: null,
      location: null,
      skills: [],
      bio: null,
      githubUrl: null,
      linkedinUrl: null,
      websiteUrl: null,
      resumeUrl: null,
      resumeName: null,
    },
  );
}

export async function PATCH(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = profileInputSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten());

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json(profile);
}
