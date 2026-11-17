import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ok, fail, handleError } from "@/lib/api";

/** Teacher grades an open writing/speaking submission. */
export async function POST(req: NextRequest) {
  try {
    const teacher = await requireRole("TEACHER", "ADMIN");
    const body = await req.json();
    const responseId = String(body.responseId || "");
    const score = Math.max(0, Math.min(100, Number(body.score)));
    const comment = String(body.comment || "").slice(0, 1000);

    const response = await db.response.findUnique({
      where: { id: responseId },
      include: { attempt: { include: { student: { select: { id: true } } } } },
    });
    if (!response) return fail("Response not found", 404);
    if (teacher.role === "TEACHER") {
      const myClasses = await db.class.findMany({ where: { teacherId: teacher.id } });
      const classIds = myClasses.map((c) => c.id);
      const enrollment = await db.enrollment.findFirst({
        where: { classId: { in: classIds }, studentId: response.attempt.studentId },
      });
      if (!enrollment) return fail("This student is not in your classes", 403);
    }

    await db.response.update({
      where: { id: responseId },
      data: {
        reviewScore: score,
        reviewComment: comment,
        reviewedBy: teacher.name,
        reviewedAt: new Date(),
        correct: score >= 60,
      },
    });

    return ok({ reviewed: true, score, comment });
  } catch (err) {
    return handleError(err);
  }
}

/** List pending open submissions across the teacher's classes. */
export async function GET() {
  try {
    const teacher = await requireRole("TEACHER", "ADMIN");
    let studentIds: string[] | undefined = undefined;
    if (teacher.role === "TEACHER") {
      const myClasses = await db.class.findMany({ where: { teacherId: teacher.id } });
      const classIds = myClasses.map((c) => c.id);
      const enrollments = await db.enrollment.findMany({ where: { classId: { in: classIds } } });
      studentIds = enrollments.map((e) => e.studentId);
    }
    const responses = await db.response.findMany({
      where: {
        openText: { not: null },
        reviewedScore: null,
        attempt: studentIds ? { studentId: { in: studentIds } } : undefined,
      },
      include: {
        attempt: { include: { student: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok(
      responses.map((r) => ({
        id: r.id,
        attemptId: r.attemptId,
        studentName: r.attempt.student.name,
        level: r.level,
        openText: r.openText,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    return handleError(err);
  }
}
