import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function requireUserId() {
  const { userId } = await auth();
  return userId;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function badRequest(details: unknown) {
  return NextResponse.json(
    { error: "Invalid request", details },
    { status: 400 },
  );
}
