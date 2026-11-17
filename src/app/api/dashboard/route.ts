import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { ok, handleError } from "@/lib/api";
import { bankStats } from "@/lib/questions";

/** Public platform snapshot for the landing page (no auth needed). */
export async function GET() {
  try {
    const me = await currentUser();
    const stats = bankStats();
    const [studentCount, attemptCount] = await Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.attempt.count({ where: { status: "COMPLETED" } }),
    ]);
    return ok({
      me,
      bank: { levels: stats.levels, questions: stats.total, perSkill: stats.perSkill },
      students: studentCount,
      attempts: attemptCount,
    });
  } catch (err) {
    return handleError(err);
  }
}
