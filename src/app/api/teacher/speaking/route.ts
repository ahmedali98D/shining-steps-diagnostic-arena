import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ok, fail, handleError } from "@/lib/api";
import { clampCriterion, deriveSpeakingLevel, CriteriaScores } from "@/lib/speaking";
import { CRITERIA } from "@/lib/interviewKits";

/** GET: the teacher's students and their speaking-assessment status (pending first). */
export async function GET() {
  try {
    const teacher = await requireRole("TEACHER", "ADMIN");
    let studentIds: string[] | undefined;
    if (teacher.role === "TEACHER") {
      const myClasses = await db.class.findMany({ where: { teacherId: teacher.id } });
      const classIds = myClasses.map((c) => c.id);
      const enrollments = await db.enrollment.findMany({ where: { classId: { in: classIds } } });
      studentIds = enrollments.map((e) => e.studentId);
    }
    const students = await db.user.findMany({
      where: { role: "STUDENT", id: studentIds ? { in: studentIds } : undefined },
      select: { id: true, name: true, email: true, attempts: { where: { status: "COMPLETED", mode: "FULL" }, orderBy: { finishedAt: "desc" }, take: 1 } },
      orderBy: { name: "asc" },
    });
    const speaking = await db.speakingAssessment.findMany({
      where: { studentId: studentIds ? { in: studentIds } : undefined },
      orderBy: { createdAt: "desc" },
      include: { teacher: { select: { name: true } } },
    });
    const latestByStudent = new Map<string, (typeof speaking)[number]>();
    for (const s of speaking) if (!latestByStudent.has(s.studentId)) latestByStudent.set(s.studentId, s);

    return ok(
      students.map((st) => {
        const sp = latestByStudent.get(st.id);
        return {
          id: st.id,
          name: st.name,
          email: st.email,
          lastOverallLevel: st.attempts[0]?.overallLevel ?? null,
          speaking: sp
            ? {
                level: sp.level,
                kitLevel: sp.kitLevel,
                criteria: {
                  fluency: sp.fluency,
                  pronunciation: sp.pronunciation,
                  vocabulary: sp.vocabulary,
                  grammarAccuracy: sp.grammarAccuracy,
                  comprehension: sp.comprehension,
                  conversation: sp.conversation,
                },
                notes: sp.notes,
                teacher: sp.teacher.name,
                createdAt: sp.createdAt,
              }
            : null,
        };
      })
    );
  } catch (err) {
    return handleError(err);
  }
}

/** POST: save a live speaking interview with the six-criterion rubric. */
export async function POST(req: NextRequest) {
  try {
    const teacher = await requireRole("TEACHER", "ADMIN");
    const body = await req.json();
    const studentId = String(body.studentId || "");
    const kitLevel = Math.max(0, Math.min(8, Number(body.kitLevel ?? 3)));
    const notes = String(body.notes || "").slice(0, 2000);
    const levelOverride = body.levelOverride === undefined || body.levelOverride === null ? null : Math.max(0, Math.min(8, Number(body.levelOverride)));

    if (teacher.role === "TEACHER") {
      const myClasses = await db.class.findMany({ where: { teacherId: teacher.id } });
      const classIds = myClasses.map((c) => c.id);
      const enrollment = await db.enrollment.findFirst({
        where: { classId: { in: classIds }, studentId },
      });
      if (!enrollment) return fail("This student is not in your classes", 403);
    }

    const raw = (body.criteria || {}) as Record<string, unknown>;
    const criteria = {} as CriteriaScores;
    for (const c of CRITERIA) {
      criteria[c.key] = clampCriterion(Number(raw[c.key] ?? 0));
    }
    const derived = deriveSpeakingLevel(criteria);
    const level = levelOverride === null ? derived : levelOverride;

    const saved = await db.speakingAssessment.create({
      data: {
        studentId,
        teacherId: teacher.id,
        kitLevel,
        fluency: criteria.fluency,
        pronunciation: criteria.pronunciation,
        vocabulary: criteria.vocabulary,
        grammarAccuracy: criteria.grammarAccuracy,
        comprehension: criteria.comprehension,
        conversation: criteria.conversation,
        level,
        notes,
      },
      include: { teacher: { select: { name: true } } },
    });

    // Gamification: a strong live interview earns the speaking badge.
    if (level >= 6) {
      await db.badgeAward.upsert({
        where: { userId_code: { userId: studentId, code: "smooth-speaker" } },
        update: {},
        create: { userId: studentId, code: "smooth-speaker" },
      });
    }

    return ok({
      saved: true,
      level,
      derived,
      criteria,
      teacher: saved.teacher.name,
      createdAt: saved.createdAt,
    });
  } catch (err) {
    return handleError(err);
  }
}
