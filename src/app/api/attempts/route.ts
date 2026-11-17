import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ok, handleError } from "@/lib/api";

/** Attempts list - students see their own; teachers see their class students; admin sees all. */
export async function GET() {
  try {
    const user = await requireUser();

    if (user.role === "STUDENT") {
      const attempts = await db.attempt.findMany({
        where: { studentId: user.id, status: "COMPLETED" },
        orderBy: { finishedAt: "desc" },
        take: 50,
      });
      return ok(attempts.map(summarize));
    }

    if (user.role === "TEACHER") {
      const classes = await db.class.findMany({ where: { teacherId: user.id } });
      const classIds = classes.map((c) => c.id);
      const enrollments = await db.enrollment.findMany({ where: { classId: { in: classIds } } });
      const studentIds = enrollments.map((e) => e.studentId);
      const attempts = await db.attempt.findMany({
        where: { studentId: { in: studentIds }, status: "COMPLETED" },
        orderBy: { finishedAt: "desc" },
        take: 200,
        include: { student: { select: { name: true } } },
      });
      return ok(attempts.map((a) => ({ ...summarize(a), studentName: a.student.name })));
    }

    // ADMIN
    const attempts = await db.attempt.findMany({
      where: { status: "COMPLETED" },
      orderBy: { finishedAt: "desc" },
      take: 200,
      include: { student: { select: { name: true } } },
    });
    return ok(attempts.map((a) => ({ ...summarize(a), studentName: a.student.name })));
  } catch (err) {
    return handleError(err);
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
  let skills: { skill: string; continuous: number; accuracy: number }[] | undefined;
  let progressPct: number | null = null;
  if (a.resultJson) {
    try {
      const r = JSON.parse(a.resultJson);
      skills = r.skills?.map((s: { skill: string; continuous: number; accuracy: number }) => ({
        skill: s.skill,
        continuous: s.continuous,
        accuracy: s.accuracy,
      }));
      progressPct = r.progressPct ?? null;
    } catch {
      /* ignore */
    }
  }
  return {
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
    skills,
    progressPct,
  };
}
