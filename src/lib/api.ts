import { NextResponse } from "next/server";
import { AuthError } from "@/lib/session";

export function ok<T>(data: T) {
  return NextResponse.json({ ok: true, data });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function handleError(err: unknown) {
  if (err instanceof AuthError) return fail(err.message, err.status);
  console.error("[api]", err);
  return fail("Something went wrong on the server", 500);
}
