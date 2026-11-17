import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api";
import { openTaskFor } from "@/lib/questions";

/** Public-ish: returns the open Big Task prompt for a level (prompt only, no answer). */
export async function GET(req: NextRequest) {
  try {
    const level = Math.max(0, Math.min(8, Number(req.nextUrl.searchParams.get("level") || 0)));
    const task = openTaskFor(level);
    return ok(
      task
        ? { id: task.id, prompt: task.prompt, lessonTitle: task.lessonTitle, unitTitle: task.unitTitle }
        : { prompt: "Write three sentences using what you learned at this level." }
    );
  } catch (err) {
    return handleError(err);
  }
}
