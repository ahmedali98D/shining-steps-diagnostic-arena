import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ok, fail, handleError } from "@/lib/api";
import { gradeAndAdvance, publicQuestion, scoreAttempt, CAP_MINUTES } from "@/lib/diagnostic";
import { getQuestion } from "@/lib/questions";

interface WrappedState {
  engine: ReturnType<typeof import("@/lib/diagnostic").initEngineState>;
  log: { qid: string; correct: boolean; awardedXp: number; answer: string; openText?: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const attemptId = String(body.attemptId || "");
    const answer = String(body.answer ?? "");

    const attempt = await db.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.studentId !== user.id) return fail("Attempt not found", 404);
    if (attempt.status !== "IN_PROGRESS") return fail("This attempt is already finished");

    const wrapped = JSON.parse(attempt.state || "{}") as WrappedState;
    const qid = wrapped.engine.currentQuestionId;
    const q = qid ? getQuestion(qid) : undefined;
    if (!q) return fail("No active question");

    // Open tasks are handled on their own endpoint
    if (q.type === "open") return fail("This question goes to your teacher - use the open task endpoint");

    const outcome = gradeAndAdvance(wrapped.engine, answer);
    wrapped.log.push({ qid: q.id, correct: outcome.correct, awardedXp: outcome.awardedXp, answer });

    await db.response.create({
      data: {
        attemptId: attempt.id,
        questionId: q.id,
        skill: q.skill,
        level: q.level,
        unit: q.unit,
        answerText: answer.slice(0, 500),
        correct: outcome.correct,
        awardedXp: outcome.awardedXp,
      },
    });

    await db.attempt.update({
      where: { id: attempt.id },
      data: { state: JSON.stringify(wrapped) },
    });

    const nextQ = outcome.nextQuestionId ? publicQuestion(outcome.nextQuestionId) : null;

    // When the writing walk finishes, report the level the ladder awarded for
    // writing, so the exam can close with the Big Task at exactly that level.
    let writingPlacement: number | null = null;
    if (outcome.sectionDone === "writing") {
      const partial = scoreAttempt(wrapped.engine, wrapped.log);
      const w = partial.skills.find((s) => s.skill === "writing");
      writingPlacement = w ? w.placement : null;
    }

    // Time management: past the cap, wrap the exam up with the evidence collected so far.
    const elapsedMs = Date.now() - new Date(attempt.startedAt).getTime();
    const capMs = (CAP_MINUTES[attempt.mode as "FULL" | "reading" | "listening" | "writing" | "speaking"] || 35) * 60000;
    const outOfTime = elapsedMs > capMs && !outcome.finished;

    return ok({
      correct: outcome.correct,
      awardedXp: outcome.awardedXp,
      answer,
      nextQuestion: outOfTime ? null : nextQ,
      sectionDone: outcome.sectionDone || null,
      finished: outcome.finished || outOfTime,
      autoFinished: outOfTime,
      writingPlacement,
      skill: wrapped.engine.order[wrapped.engine.activeIdx],
      sectionIndex: wrapped.engine.activeIdx,
      answered: wrapped.log.length,
    });
  } catch (err) {
    return handleError(err);
  }
}

