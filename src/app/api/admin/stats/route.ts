import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ok, handleError } from "@/lib/api";
import { applySpeaking } from "@/lib/speaking";

/** Center-wide statistics for the admin dashboard. */
export async function GET() {
  try {
    await requireRole("ADMIN");

    const [students, teachers, classes, completed] = await Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "TEACHER" } }),
      db.class.count(),
      db.attempt.findMany({ where: { status: "COMPLETED" }, orderBy: { finishedAt: "desc" }, take: 300 }),
    ]);

    const fullAttempts = completed.filter((a) => a.mode === "FULL" && a.fluencyPct !== null);
    const avgFluency =
      fullAttempts.length > 0
        ? Math.round(fullAttempts.reduce((s, a) => s + (a.fluencyPct || 0), 0) / fullAttempts.length)
        : 0;

    const skillSums: Record<string, { total: number; count: number }> = {};
    const levelDist: Record<string, number> = {};
    const bandDist: Record<string, number> = {};
    // Latest live speaking assessment per student - merges the fourth pillar in.
    const spRows = await db.speakingAssessment.findMany({
      orderBy: { createdAt: "desc" },
      include: { teacher: { select: { name: true } } },
    });
    const spByStudent = new Map<string, (typeof spRows)[number]>();
    for (const r of spRows) if (!spByStudent.has(r.studentId)) spByStudent.set(r.studentId, r);

    for (const a of fullAttempts) {
      if (a.bandCode) bandDist[a.bandCode] = (bandDist[a.bandCode] || 0) + 1;
      const key = Math.round(a.overallLevel || 0);
      levelDist[key] = (levelDist[key] || 0) + 1;
      try {
        const r = JSON.parse(a.resultJson || "{}");
        const sp = spByStudent.get(a.studentId);
        const merged = sp
          ? applySpeaking(r, {
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
              teacherName: sp.teacher.name,
              createdAt: sp.createdAt.toISOString(),
            })
          : r;
        for (const sk of merged?.skills || []) {
          if (sk.skill === "speaking" && sk.source === "teacher" && sk.continuous === 0) continue; // pending
          skillSums[sk.skill] = skillSums[sk.skill] || { total: 0, count: 0 };
          skillSums[sk.skill].total += sk.continuous;
          skillSums[sk.skill].count += 1;
        }
      } catch {
        /* ignore */
      }
    }

    const skillAverages = Object.entries(skillSums).map(([skill, v]) => ({
      skill,
      avgContinuous: Math.round((v.total / v.count) * 10) / 10,
      count: v.count,
    }));

    const recent = completed.slice(0, 12).map((a) => ({
      id: a.id,
      mode: a.mode,
      fluencyPct: a.fluencyPct,
      overallLevel: a.overallLevel,
      bandCode: a.bandCode,
      finishedAt: a.finishedAt,
      studentId: a.studentId,
    }));

    return ok({
      students,
      teachers,
      classes,
      attemptCount: completed.length,
      fullDiagnosticCount: fullAttempts.length,
      avgFluency,
      skillAverages,
      levelDist,
      bandDist,
      recent,
    });
  } catch (err) {
    return handleError(err);
  }
}
