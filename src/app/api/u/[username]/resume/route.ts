import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

import { notFound } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ username: string }> };

// Intentionally public: this is the resume for a user who has opted into a
// public profile by setting a username. No auth check by design.
export async function GET(_request: Request, { params }: RouteContext) {
  const { username } = await params;

  const profile = await prisma.profile.findUnique({ where: { username } });
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
