import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";

/** Health check: database connectivity for deployment monitoring. */
export async function GET() {
  try {
    const url = process.env.DATABASE_URL || "";
    await db.$queryRaw`SELECT 1`;
    return ok({ db: true, time: new Date().toISOString() });
  } catch (err) {
    return ok({
      db: false,
      dbEnvSet: Boolean(process.env.DATABASE_URL),
      error: err instanceof Error ? err.message.slice(0, 200) : "unknown",
    });
  }
}
