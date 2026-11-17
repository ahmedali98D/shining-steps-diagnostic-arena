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
  const msg = err instanceof Error ? err.message : "";
  if (msg.startsWith("SETUP_REQUIRED")) {
    return NextResponse.json(
      {
        ok: false,
        error: "The database is not connected yet. Attach Neon in the Vercel dashboard (Storage - Neon - Connect) or set DATABASE_URL - see the README deploy section.",
        setup: true,
      },
      { status: 503 }
    );
  }
  console.error("[api]", err);
  return fail("Something went wrong on the server", 500);
}
