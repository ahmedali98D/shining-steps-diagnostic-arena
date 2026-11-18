import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ok, fail, handleError } from "@/lib/api";
import { initEngineState, publicQuestion, Mode, TARGET_MINUTES, CAP_MINUTES, TARGET_QUESTIONS } from "@/lib/diagnostic";
import { SKILLS } from "@/lib/questions";

interface WrappedState {
  engine: ReturnType<typeof initEngineState>;
  log: { qid: string; correct: boolean; awardedXp: number; answer: string; openText?: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (user.role !== "STUDENT") return fail("Only students take assessments", 403);

    const body = await req.json().catch(() => ({}));
    const raw = String(body.mode || "FULL");
    const lower = raw.toLowerCase();
    // Accept any letter case; canonical modes are "FULL" and the lowercase skills.
    const mode: Mode = lower === "full" ? "FULL" : SKILLS.includes(lower as never) ? (lower as Mode) : "FULL";

    // Resume an in-progress attempt of the same mode if one exists
    const existing = await db.attempt.findFirst({
      where: { studentId: user.id, mode, status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
    });
    if (existing) {
      const wrapped = JSON.parse(existing.state || "{}") as WrappedState;
      const qid = wrapped.engine.currentQuestionId;
      const completedCount = await db.attempt.count({ where: { studentId: user.id, status: "COMPLETED" } });
      return ok({
        attemptId: existing.id,
        resumed: true,
        question: qid ? publicQuestion(qid) : null,
        skill: wrapped.engine.order[wrapped.engine.activeIdx],
        sectionIndex: wrapped.engine.activeIdx,
        sectionCount: wrapped.engine.order.length,
        answered: wrapped.log.length,
        startedAt: existing.startedAt,
        targetMinutes: TARGET_MINUTES[mode],
        capMinutes: CAP_MINUTES[mode],
        targetQuestions: TARGET_QUESTIONS[mode],
        bigTaskVariant: completedCount,
      });
    }

    // Last placements per skill (from most recent completed FULL attempt)
    const lastFull = await db.attempt.findFirst({
      where: { studentId: user.id, status: "COMPLETED", mode: "FULL" },
      orderBy: { finishedAt: "desc" },
    });
    let lastPlacements: Partial<Record<string, number>> | undefined;
    if (lastFull?.resultJson) {
      try {
        const result = JSON.parse(lastFull.resultJson);
        lastPlacements = Object.fromEntries(result.skills.map((s: { skill: string; placement: number }) => [s.skill, s.placement]));
      } catch {
        lastPlacements = undefined;
      }
    }

    // Anti-repeat memory: every question served across the student's recent
    // completed attempts. The engine avoids these while fresh items remain.
    const recentAttempts = await db.attempt.findMany({
      where: { studentId: user.id, status: "COMPLETED" },
      orderBy: { finishedAt: "desc" },
      take: 6,
      select: { resultJson: true },
    });
    const recentIds: string[] = [];
    for (const ra of recentAttempts) {
      try {
        const result = JSON.parse(ra.resultJson || "{}");
        for (const pq of result.perQuestion || []) recentIds.push(pq.qid);
      } catch {
        /* ignore malformed rows */
      }
    }

    const engine = initEngineState(mode, lastPlacements, Array.from(new Set(recentIds)));
    const completedCount = await db.attempt.count({ where: { studentId: user.id, status: "COMPLETED" } });
    const wrapped: WrappedState = { engine, log: [] };
    const attempt = await db.attempt.create({
      data: {
        studentId: user.id,
        mode,
        status: "IN_PROGRESS",
        state: JSON.stringify(wrapped),
      },
    });

    return ok({
      attemptId: attempt.id,
      resumed: false,
      question: publicQuestion(engine.currentQuestionId!),
      skill: engine.order[engine.activeIdx],
      sectionIndex: engine.activeIdx,
      sectionCount: engine.order.length,
      answered: 0,
      startedAt: attempt.startedAt,
      targetMinutes: TARGET_MINUTES[mode],
      capMinutes: CAP_MINUTES[mode],
      targetQuestions: TARGET_QUESTIONS[mode],
      bigTaskVariant: completedCount,
    });
  } catch (err) {
    return handleError(err);
  }
}
