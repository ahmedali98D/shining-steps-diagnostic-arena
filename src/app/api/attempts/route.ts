import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ok, handleError } from "@/lib/api";
import { applySpeaking, SpeakingRecord } from "@/lib/speaking";

/** Attempts list - students see their own; teachers see their class students; admin sees all.
    The live speaking assessment (fourth pillar) is merged into every full diagnostic summary. */
export async function GET() {
  try {
    const user = await requireUser();

    let attempts;
    const speakingMap = new Map<string, SpeakingRecord>();

    if (user.role === "STUDENT") {
      attempts = await db.attempt.findMany({
        where: { studentId: user.id, status: "COMPLETED" },
        orderBy: { finishedAt: "desc" },
        take: 50,
      });
      fillSpeakingMap(speakingMap, [user.id], await db.speakingAssessment.findMany({
        where: { studentId: user.id },
        orderBy: { createdAt: "desc" },
        include: { teacher: { select: { name: true } } },
      }));
    } else {
      let studentIds: string[] | undefined;
      if (user.role === "TEACHER") {
        const classes = await db.class.findMany({ where: { teacherId: user.id } });
        const classIds = classes.map((c) => c.id);
        const enrollments = await db.enrollment.findMany({ where: { classId: { in: classIds } } });
        studentIds = enrollments.map((e) => e.studentId);
      }
      attempts = await db.attempt.findMany({
        where: { status: "COMPLETED", studentId: studentIds ? { in: studentIds } : undefined },
        orderBy: { finishedAt: "desc" },
        take: 200,
        include: { student: { select: { name: true } } },
      });
      fillSpeakingMap(speakingMap, attempts.map((a) => a.studentId), await db.speakingAssessment.findMany({
        where: studentIds ? { studentId: { in: studentIds } } : {},
        orderBy: { createdAt: "desc" },
        include: { teacher: { select: { name: true } } },
      }));
    }

    return ok(
      attempts.map((a) => {
        const base = summarize(a);
        const sp = speakingMap.get(a.studentId);
        if (a.mode === "FULL" && a.resultJson) {
          try {
            const merged = applySpeaking(JSON.parse(a.resultJson), sp || null);
            if (merged) {
              base.fluencyPct = merged.fluencyPct;
              base.overallLevel = merged.overallLevel;
              base.skills = merged.skills.map((s) => ({ skill: s.skill, continuous: s.continuous, accuracy: s.accuracy, source: s.source }));
              base.provisional = merged.provisional;
              base.speakingLevel = sp ? sp.level : null;
              base.speakingTeacher = sp ? sp.teacherName : null;
            }
          } catch {
            /* keep base */
          }
        }
        return base;
      })
    );
  } catch (err) {
    return handleError(err);
  }
}

function fillSpeakingMap(map: Map<string, SpeakingRecord>, studentIds: string[], rows: { studentId: string; level: number; kitLevel: number; fluency: number; pronunciation: number; vocabulary: number; grammarAccuracy: number; comprehension: number; conversation: number; notes: string; createdAt: Date; teacher: { name: string } }[]) {
  void studentIds;
  for (const r of rows) {
    if (!map.has(r.studentId)) {
      map.set(r.studentId, {
        level: r.level,
        kitLevel: r.kitLevel,
        criteria: {
          fluency: r.fluency,
          pronunciation: r.pronunciation,
          vocabulary: r.vocabulary,
          grammarAccuracy: r.grammarAccuracy,
          comprehension: r.comprehension,
          conversation: r.conversation,
        },
        notes: r.notes,
        teacherName: r.teacher.name,
        createdAt: r.createdAt.toISOString(),
      });
    }
  }
}

function summarize(a: {
  id: string;
  mode: string;
  status: string;
  overallLevel: number | null;
  fluencyPct: number | null;
  bandCode: string | null;
  startRef: string | null;
  xpEarned: number;
  correctCount: number;
  totalCount: number;
  startedAt: Date;
  finishedAt: Date | null;
  resultJson?: string | null;
  studentId: string;
}) {
  const base = {
    id: a.id,
    mode: a.mode,
    status: a.status,
    overallLevel: a.overallLevel,
    fluencyPct: a.fluencyPct,
    bandCode: a.bandCode,
    startRef: a.startRef,
    xpEarned: a.xpEarned,
    correctCount: a.correctCount,
    totalCount: a.totalCount,
    accuracyPct: a.totalCount > 0 ? Math.round((a.correctCount / a.totalCount) * 100) : 0,
    finishedAt: a.finishedAt,
    provisional: false,
    speakingLevel: null as number | null,
    speakingTeacher: null as string | null,
    skills: undefined as { skill: string; continuous: number; accuracy: number; source?: string }[] | undefined,
    progressPct: null as number | null,
  };
  if (a.resultJson) {
    try {
      const r = JSON.parse(a.resultJson);
      base.skills = r.skills?.map((s: { skill: string; continuous: number; accuracy: number; source?: string }) => ({
        skill: s.skill,
        continuous: s.continuous,
        accuracy: s.accuracy,
        source: s.source,
      }));
      base.progressPct = r.progressPct ?? null;
    } catch {
      /* ignore */
    }
  }
  return base;
}
