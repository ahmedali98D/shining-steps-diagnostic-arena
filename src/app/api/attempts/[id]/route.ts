import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser, SessionUser } from "@/lib/session";
import { ok, fail, handleError } from "@/lib/api";
import { getQuestion } from "@/lib/questions";
import { applySpeaking } from "@/lib/speaking";

/** Attempt detail: full result snapshot + per-question feedback (with explanations).
    Access: the student who owns it, a teacher of their class, or an admin. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user: SessionUser = await requireUser();
    const { id } = await ctx.params;

    const attempt = await db.attempt.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        responses: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!attempt) return fail("Attempt not found", 404);

    let allowed = attempt.studentId === user.id || user.role === "ADMIN";
    if (!allowed && user.role === "TEACHER") {
      const myClasses = await db.class.findMany({ where: { teacherId: user.id } });
      const classIds = myClasses.map((c) => c.id);
      const enrollment = await db.enrollment.findFirst({
        where: { classId: { in: classIds }, studentId: attempt.studentId },
      });
      allowed = Boolean(enrollment);
    }
    if (!allowed) return fail("You do not have access to this attempt", 403);

    const result = attempt.resultJson ? JSON.parse(attempt.resultJson) : null;

    // Merge the live speaking assessment (fourth pillar) into the result.
    const spRow = await db.speakingAssessment.findFirst({
      where: { studentId: attempt.studentId },
      orderBy: { createdAt: "desc" },
      include: { teacher: { select: { name: true } } },
    });
    const merged = result
      ? applySpeaking(result, spRow
          ? {
              level: spRow.level,
              kitLevel: spRow.kitLevel,
              criteria: {
                fluency: spRow.fluency,
                pronunciation: spRow.pronunciation,
                vocabulary: spRow.vocabulary,
                grammarAccuracy: spRow.grammarAccuracy,
                comprehension: spRow.comprehension,
                conversation: spRow.conversation,
              },
              notes: spRow.notes,
              teacherName: spRow.teacher.name,
              createdAt: spRow.createdAt.toISOString(),
            }
          : null)
      : null;

    const feedback = attempt.responses.map((r) => {
      const q = getQuestion(r.questionId);
      return {
        id: r.id,
        questionId: r.questionId,
        answerText: r.answerText,
        correct: r.correct,
        awardedXp: r.awardedXp,
        openText: r.openText,
        reviewScore: r.reviewScore,
        reviewComment: r.reviewComment,
        reviewedAt: r.reviewedAt,
        question: q
          ? {
              id: q.id,
              skill: q.skill,
              level: q.level,
              unit: q.unit,
              unitTitle: q.unitTitle,
              lesson: q.lesson,
              lessonTitle: q.lessonTitle,
              topic: q.topic,
              type: q.type,
              prompt: q.prompt,
              passage: q.passage,
              options: q.options,
              answer: q.type === "order" ? q.answer.split(";;") : q.answer,
              accepted: q.accepted,
              explain: q.explain,
              wrongNotes: q.wrongNotes,
              audioText: q.audioText,
              speakerLines: q.speakerLines,
              bloom: q.bloom,
              dok: q.dok,
              solo: q.solo,
              marzano: q.marzano,
              ubd: q.ubd,
              udl: q.udl,
              diff: q.diff,
            }
          : null,
      };
    });

    return ok({
      attempt: {
        id: attempt.id,
        mode: attempt.mode,
        status: attempt.status,
        overallLevel: merged ? merged.overallLevel : attempt.overallLevel,
        fluencyPct: merged ? merged.fluencyPct : attempt.fluencyPct,
        bandCode: attempt.bandCode,
        startRef: attempt.startRef,
        xpEarned: attempt.xpEarned,
        correctCount: attempt.correctCount,
        totalCount: attempt.totalCount,
        finishedAt: attempt.finishedAt,
        startedAt: attempt.startedAt,
      },
      student: attempt.student,
      result: merged,
      speaking: spRow
        ? {
            level: spRow.level,
            kitLevel: spRow.kitLevel,
            criteria: {
              fluency: spRow.fluency,
              pronunciation: spRow.pronunciation,
              vocabulary: spRow.vocabulary,
              grammarAccuracy: spRow.grammarAccuracy,
              comprehension: spRow.comprehension,
              conversation: spRow.conversation,
            },
            notes: spRow.notes,
            teacher: spRow.teacher.name,
            createdAt: spRow.createdAt.toISOString(),
          }
        : null,
      feedback,
    });
  } catch (err) {
    return handleError(err);
  }
}
