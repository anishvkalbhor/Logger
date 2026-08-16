import { NextRequest, NextResponse } from "next/server";

import { badRequest, requireUserId, unauthorized } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { USERNAME_REGEX, USERNAME_FORMAT_MESSAGE } from "@/lib/validations/profile";

export async function GET(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const username = request.nextUrl.searchParams.get("username")?.trim().toLowerCase();
  if (!username) return badRequest("Missing username.");
  if (username.length < 3 || username.length > 30 || !USERNAME_REGEX.test(username)) {
    return NextResponse.json({ available: false, reason: USERNAME_FORMAT_MESSAGE });
  }

  const existing = await prisma.profile.findUnique({ where: { username } });
  const available = !existing || existing.userId === userId;

  return NextResponse.json({
    available,
    reason: available ? undefined : "That username is already taken.",
  });
}
