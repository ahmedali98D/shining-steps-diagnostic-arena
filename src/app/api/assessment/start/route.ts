import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ok, fail, handleError } from "@/lib/api";
import { initEngineState, publicQuestion, Mode } from "@/lib/diagnostic";
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
    const modeRaw = String(body.mode || "FULL").toUpperCase() as Mode;
    const mode: Mode = modeRaw === "FULL" || SKILLS.includes(modeRaw as never) ? modeRaw : "FULL";

    // Resume an in-progress attempt of the same mode if one exists
    const existing = await db.attempt.findFirst({
      where: { studentId: user.id, mode, status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
    });
    if (existing) {
      const wrapped = JSON.parse(existing.state || "{}") as WrappedState;
      const qid = wrapped.engine.currentQuestionId;
      return ok({
        attemptId: existing.id,
        resumed: true,
        question: qid ? publicQuestion(qid) : null,
        skill: wrapped.engine.order[wrapped.engine.activeIdx],
        sectionIndex: wrapped.engine.activeIdx,
        sectionCount: wrapped.engine.order.length,
        answered: wrapped.log.length,
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

    const engine = initEngineState(mode, lastPlacements);
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
    });
  } catch (err) {
    return handleError(err);
  }
}
