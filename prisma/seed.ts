// Seed script: demo accounts, a class, and realistic sample attempts.
// Run with: bun prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/hash";
import { initEngineState, gradeAndAdvance, scoreAttempt, buildResult } from "../src/lib/diagnostic";
import { getQuestion } from "../src/lib/questions";
import { computeBadges } from "../src/lib/gamification";

const db = new PrismaClient();

// deterministic pseudo random
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ACC_BY_LEVEL: Record<number, number> = {
  0: 0.97, 1: 0.95, 2: 0.92, 3: 0.85, 4: 0.78, 5: 0.65, 6: 0.45, 7: 0.3, 8: 0.2,
};

function correctAnswerOf(qid: string): string | null {
  const q = getQuestion(qid);
  if (!q) return null;
  return q.answer;
}

function wrongAnswerOf(qid: string, seed: number): string {
  const q = getQuestion(qid);
  if (!q) return "";
  if (q.options && q.options.length > 1) {
    const wrong = q.options.filter((o) => o !== q.answer);
    return wrong[seed % wrong.length];
  }
  if (q.type === "fill") return "definitely not the answer";
  if (q.type === "order") return q.orderTokens ? [...(q.orderTokens || [])].reverse().join(";;") : "";
  return "";
}

async function runAttempt(studentId: string, seed: number, daysAgo: number) {
  const engine = initEngineState("FULL");
  const log: { qid: string; correct: boolean; awardedXp: number; answer: string }[] = [];
  const rand = mulberry32(seed);
  let guard = 0;
  while (guard < 80) {
    guard += 1;
    const qid = engine.currentQuestionId;
    if (!qid) break;
    const q = getQuestion(qid);
    if (!q || q.type === "open") break;
    const level = q.level;
    const acc = ACC_BY_LEVEL[Math.min(8, Math.max(0, level))] ?? 0.5;
    const willBeCorrect = rand() < acc;
    const answer = willBeCorrect ? correctAnswerOf(qid) || "" : wrongAnswerOf(qid, Math.floor(rand() * 7));
    const outcome = gradeAndAdvance(engine, answer);
    log.push({ qid, correct: outcome.correct, awardedXp: outcome.awardedXp, answer });
    if (outcome.finished) break;
  }

  const s = scoreAttempt(engine, log);
  const badges = computeBadges({
    completedAttempts: 1,
    skillResults: s.skills.map((sk) => ({ skill: sk.skill, accuracy: sk.accuracy, placement: sk.placement })),
    fluencyPct: s.fluencyPct,
    mode: "FULL",
  });
  const provisional = buildResult(engine, log, badges);
  const result = { ...provisional, previous: null, progressPct: null };

  const attempt = await db.attempt.create({
    data: {
      studentId,
      mode: "FULL",
      status: "COMPLETED",
      state: JSON.stringify({ engine, log }),
      overallLevel: s.overallLevel,
      fluencyPct: s.fluencyPct,
      bandCode: provisional.band.code,
      startRef: provisional.startRef,
      resultJson: JSON.stringify(result),
      xpEarned: s.xpEarned,
      correctCount: s.correctCount,
      totalCount: s.totalCount,
      startedAt: new Date(Date.now() - (daysAgo + 1) * 86400000),
      finishedAt: new Date(Date.now() - daysAgo * 86400000),
    },
  });

  for (const entry of log) {
    const q = getQuestion(entry.qid);
    if (!q) continue;
    await db.response.create({
      data: {
        attemptId: attempt.id,
        questionId: entry.qid,
        skill: q.skill,
        level: q.level,
        unit: q.unit,
        answerText: entry.answer.slice(0, 500),
        correct: entry.correct,
        awardedXp: entry.awardedXp,
      },
    });
  }

  await db.user.update({
    where: { id: studentId },
    data: { xp: { increment: s.xpEarned }, streak: 1, lastActiveDay: new Date().toISOString().slice(0, 10) },
  });
  for (const code of badges) {
    await db.badgeAward.upsert({
      where: { userId_code: { userId: studentId, code } },
      update: {},
      create: { userId: studentId, code },
    });
  }
  console.log(`  attempt for ${studentId}: Level ${s.overallLevel}, fluency ${s.fluencyPct}%, ${s.correctCount}/${s.totalCount}`);
}

async function main() {
  console.log("Seeding Shining Steps Diagnostic Arena...");

  const admin = await db.user.upsert({
    where: { email: "admin@shiningsteps.app" },
    update: {},
    create: {
      email: "admin@shiningsteps.app",
      name: "Ahmed Mahmoud Saeed Ahmed Ali",
      passwordHash: hashPassword("Center2026!"),
      role: "ADMIN",
    },
  });

  const teacher = await db.user.upsert({
    where: { email: "teacher@shiningsteps.app" },
    update: {},
    create: {
      email: "teacher@shiningsteps.app",
      name: "Ms Salma",
      passwordHash: hashPassword("Teacher2026!"),
      role: "TEACHER",
    },
  });

  const cls = await db.class.upsert({
    where: { code: "SHINE1" },
    update: {},
    create: { name: "Evening A2-B1 Group", code: "SHINE1", teacherId: teacher.id },
  });

  const demoSpecs = [
    { email: "student@shiningsteps.app", name: "Demo Student", seed: 11, days: 0 },
    { email: "yusuf@shiningsteps.app", name: "Yusuf Adel", seed: 22, days: 2 },
    { email: "lina@shiningsteps.app", name: "Lina Hany", seed: 33, days: 3 },
    { email: "omar@shiningsteps.app", name: "Omar Tarek", seed: 44, days: 5 },
  ];

  for (const spec of demoSpecs) {
    const student = await db.user.upsert({
      where: { email: spec.email },
      update: {},
      create: {
        email: spec.email,
        name: spec.name,
        passwordHash: hashPassword("Student2026!"),
        role: "STUDENT",
      },
    });
    await db.enrollment.upsert({
      where: { classId_studentId: { classId: cls.id, studentId: student.id } },
      update: {},
      create: { classId: cls.id, studentId: student.id },
    });
    const existing = await db.attempt.count({ where: { studentId: student.id, status: "COMPLETED" } });
    if (existing === 0) {
      await runAttempt(student.id, spec.seed, spec.days);
    }
  }

  console.log("Seed complete.");
  console.log("Admin:   admin@shiningsteps.app / Center2026!");
  console.log("Teacher: teacher@shiningsteps.app / Teacher2026!");
  console.log("Student: student@shiningsteps.app / Student2026! (class code SHINE1)");
  void admin;
  void teacher;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
