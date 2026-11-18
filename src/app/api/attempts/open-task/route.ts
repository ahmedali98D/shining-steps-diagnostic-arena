import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api";
import { openTaskFor, openTaskCount } from "@/lib/questions";

/**
 * Public-ish: returns the open Big Task for a level - prompt, visual and
 * metadata only, never the grading rubric internals. `n` cycles through the
 * level's Big Task variants so retakes see a different task.
 */
export async function GET(req: NextRequest) {
  try {
    const level = Math.max(0, Math.min(8, Number(req.nextUrl.searchParams.get("level") || 0)));
    const n = Math.max(0, Number(req.nextUrl.searchParams.get("n") || 0) || 0);
    const task = openTaskFor(level, n);
    if (!task) {
      return ok({ prompt: "Write three sentences using what you learned at this level.", count: 0 });
    }
    return ok({
      id: task.id,
      prompt: task.prompt,
      topic: task.topic,
      lessonTitle: task.lessonTitle,
      unitTitle: task.unitTitle,
      level: task.level,
      visual: task.visual || null,
      count: openTaskCount(level),
    });
  } catch (err) {
    return handleError(err);
  }
}
