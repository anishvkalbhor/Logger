import { NextResponse } from "next/server";

import { requireUserId, unauthorized } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const [total, byTypeRaw, entriesWithTags] = await Promise.all([
    prisma.entry.count({ where: { userId } }),
    prisma.entry.groupBy({
      by: ["type"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.entry.findMany({ where: { userId }, select: { techTags: true } }),
  ]);

  const byType = byTypeRaw.map((row) => ({
    type: row.type,
    count: row._count._all,
  }));

  const tagCounts = new Map<string, number>();
  for (const entry of entriesWithTags) {
    for (const tag of entry.techTags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const topTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json({ total, byType, topTags });
}
