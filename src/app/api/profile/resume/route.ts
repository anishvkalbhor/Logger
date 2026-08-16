import { NextRequest, NextResponse } from "next/server";
import { del, get, put } from "@vercel/blob";

import { badRequest, notFound, requireUserId, unauthorized } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile?.resumeUrl) return notFound();

  const result = await get(profile.resumeUrl, { access: "private" });
  if (!result || result.statusCode !== 200) return notFound();

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Content-Disposition": `inline; filename="${profile.resumeName ?? "resume"}"`,
    },
  });
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return badRequest("Missing file.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return badRequest("Resume must be a PDF or Word document.");
  }
  if (file.size > MAX_SIZE) {
    return badRequest("Resume must be under 5MB.");
  }

  const existing = await prisma.profile.findUnique({ where: { userId } });

  const blob = await put(`resumes/${userId}/${file.name}`, file, {
    access: "private",
    addRandomSuffix: true,
  });

  if (existing?.resumeUrl) {
    await del(existing.resumeUrl).catch(() => {});
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, resumeUrl: blob.url, resumeName: file.name },
    update: { resumeUrl: blob.url, resumeName: file.name },
  });

  return NextResponse.json(profile);
}

export async function DELETE() {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (existing?.resumeUrl) {
    await del(existing.resumeUrl).catch(() => {});
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId },
    update: { resumeUrl: null, resumeName: null },
  });

  return NextResponse.json(profile);
}
