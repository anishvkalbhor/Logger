import { NextRequest, NextResponse } from "next/server";

import { badRequest, notFound, requireUserId, unauthorized } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { updateEntrySchema } from "@/lib/validations/entry";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const entry = await prisma.entry.findFirst({ where: { id, userId } });
  if (!entry) return notFound();

  return NextResponse.json(entry);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const existing = await prisma.entry.findFirst({ where: { id, userId } });
  if (!existing) return notFound();

  const body = await request.json().catch(() => null);
  const parsed = updateEntrySchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten());

  const entry = await prisma.entry.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(entry);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const existing = await prisma.entry.findFirst({ where: { id, userId } });
  if (!existing) return notFound();

  await prisma.entry.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
