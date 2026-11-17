import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ok, fail, handleError } from "@/lib/api";
import { buildResult, scoreAttempt } from "@/lib/diagnostic";
import { computeBadges, nextStreak } from "@/lib/gamification";

interface WrappedState {
  engine: ReturnType<typeof import("@/lib/diagnostic").initEngineState>;
  log: { qid: string; correct: boolean; awardedXp: number; answer: string; openText?: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const attemptId = String(body.attemptId || "");

    const attempt = await db.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.studentId !== user.id) return fail("Attempt not found", 404);
    if (attempt.status === "COMPLETED") return ok({ attemptId: attempt.id, alreadyDone: true });

    const wrapped = JSON.parse(attempt.state || "{}") as WrappedState;
    const s = scoreAttempt(wrapped.engine, wrapped.log);
    const accuracyPct = s.totalCount > 0 ? Math.round((s.correctCount / s.totalCount) * 100) : 0;

    // Previous completed attempt of the same mode, for progress comparison
    const previous = await db.attempt.findFirst({
      where: { studentId: user.id, status: "COMPLETED", mode: attempt.mode, finishedAt: { lt: new Date() }, id: { not: attempt.id } },
      orderBy: { finishedAt: "desc" },
    });
    let previousFluencyPct: number | undefined;
    let previousOverallLevel: number | undefined;
    if (previous?.resultJson) {
      try {
        const prevResult = JSON.parse(previous.resultJson);
        previousFluencyPct = prevResult.fluencyPct;
        previousOverallLevel = prevResult.overallLevel;
      } catch {
        /* ignore */
      }
    }

    // Streak + badges
    const today = new Date().toISOString().slice(0, 10);
    const allAttempts = await db.attempt.count({ where: { studentId: user.id, status: "COMPLETED" } });
    const badges = computeBadges({
      completedAttempts: allAttempts + 1,
      skillResults: s.skills.map((sk) => ({ skill: sk.skill, accuracy: sk.accuracy, placement: sk.placement })),
      fluencyPct: s.fluencyPct,
      previousFluencyPct,
      mode: attempt.mode,
    });

    const provisional = buildResult(wrapped.engine, wrapped.log, badges);
    const result = {
      ...provisional,
      previous: previousFluencyPct !== undefined
        ? { fluencyPct: previousFluencyPct, overallLevel: previousOverallLevel, finishedAt: previous?.finishedAt }
        : null,
      progressPct: previousFluencyPct !== undefined ? s.fluencyPct - previousFluencyPct : null,
    };

    // Update user: xp, streak, badges
    const lastActiveDay = (await db.user.findUnique({ where: { id: user.id } }))?.lastActiveDay;
    const newStreak = nextStreak(lastActiveDay, user.streak, today);
    const badgeCodes = (await db.badgeAward.findMany({ where: { userId: user.id } })).map((b) => b.code);
    const newBadges = badges.filter((b) => !badgeCodes.includes(b));

    await db.$transaction([
      db.attempt.update({
        where: { id: attempt.id },
        data: {
          status: "COMPLETED",
          state: JSON.stringify({ engine: wrapped.engine, log: wrapped.log }),
          overallLevel: s.overallLevel,
          fluencyPct: s.fluencyPct,
          bandCode: provisional.band.code,
          startRef: provisional.startRef,
          resultJson: JSON.stringify(result),
          xpEarned: s.xpEarned,
          correctCount: s.correctCount,
          totalCount: s.totalCount,
          finishedAt: new Date(),
        },
      }),
      db.user.update({
        where: { id: user.id },
        data: { xp: { increment: s.xpEarned }, streak: newStreak, lastActiveDay: today },
      }),
      ...newBadges.map((code) => db.badgeAward.create({ data: { userId: user.id, code } })),
    ]);

    return ok({
      attemptId: attempt.id,
      badgesEarned: newBadges,
      xpEarned: s.xpEarned,
      streak: newStreak,
    });
  } catch (err) {
    return handleError(err);
  }
}
