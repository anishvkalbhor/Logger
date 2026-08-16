import { NextRequest, NextResponse } from "next/server";

import { badRequest, requireUserId, unauthorized } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { entryInputSchema, entryListQuerySchema } from "@/lib/validations/entry";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const parsed = entryListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) return badRequest(parsed.error.flatten());
  const { cursor, limit, type, tech, q, sort } = parsed.data;

  const where: Prisma.EntryWhereInput = {
    userId,
    ...(type ? { type } : {}),
    ...(tech ? { techTags: { has: tech } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { whatIDid: { contains: q, mode: "insensitive" } },
            { problemContext: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const entries = await prisma.entry.findMany({
    where,
    orderBy: [{ date: sort }, { id: sort }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = entries.length > limit;
  const items = hasMore ? entries.slice(0, limit) : entries;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor });
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = entryInputSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten());

  const entry = await prisma.entry.create({
    data: { ...parsed.data, userId },
  });

  return NextResponse.json(entry, { status: 201 });
}
