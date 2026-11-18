import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ok, fail, handleError } from "@/lib/api";
import { openTaskFor, openTaskCount } from "@/lib/questions";

/**
 * Submit the Big Task writing piece attached to an attempt.
 * The level comes from the exam flow (the level the writing ladder awarded),
 * and `taskId` must belong to that level so variants cannot be mixed up.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (user.role !== "STUDENT") return fail("Only students submit open tasks", 403);
    const body = await req.json();
    const attemptId = String(body.attemptId || "");
    const text = String(body.text || "").trim();
    if (text.length < 10) return fail("Write a little more so your teacher can assess it (at least 10 characters)");

    const attempt = await db.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.studentId !== user.id) return fail("Attempt not found", 404);

    const result = attempt.resultJson ? JSON.parse(attempt.resultJson) : null;
    const level = Math.max(
      0,
      Math.min(8, Number(body.level ?? result?.overallRounded ?? result?.skills?.find((s: { skill: string }) => s.skill === "writing")?.placement ?? 0))
    );
    const variant = Math.max(0, Number(body.variant ?? 0) || 0);
    const count = openTaskCount(level);
    if (count === 0) return fail("No open task found for this level");

    // If the client names a task, honor it when it belongs to this level.
    const wantedId = String(body.taskId || "");
    let task = openTaskFor(level, variant);
    if (wantedId) {
      const match = Array.from({ length: count }, (_, i) => openTaskFor(level, i)).find((t) => t && t.id === wantedId);
      if (match) task = match;
    }
    if (!task) return fail("No open task found for this level");

    const already = await db.response.findFirst({
      where: { attemptId, questionId: task.id },
    });
    if (already) return fail("You already submitted this open task");

    await db.response.create({
      data: {
        attemptId,
        questionId: task.id,
        skill: "writing",
        level: task.level,
        unit: task.unit,
        answerText: "",
        correct: false,
        awardedXp: 20,
        openText: text.slice(0, 4000),
      },
    });

    await db.user.update({ where: { id: user.id }, data: { xp: { increment: 20 } } });

    return ok({ submitted: true, task: { id: task.id, prompt: task.prompt, lessonTitle: task.lessonTitle } });
  } catch (err) {
    return handleError(err);
  }
}
