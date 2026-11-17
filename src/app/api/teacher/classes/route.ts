import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ok, fail, handleError } from "@/lib/api";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode(): string {
  let out = "";
  for (let i = 0; i < 6; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
}

export async function GET() {
  try {
    const user = await requireRole("TEACHER", "ADMIN");
    const isTeacher = user.role === "TEACHER";
    const classes = await db.class.findMany({
      where: isTeacher ? { teacherId: user.id } : {},
      include: {
        teacher: { select: { name: true } },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                xp: true,
                streak: true,
                attempts: {
                  where: { status: "COMPLETED" },
                  orderBy: { finishedAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    return ok(
      classes.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        teacher: c.teacher.name,
        students: c.enrollments.map((e) => {
          const last = e.student.attempts[0];
          return {
            id: e.student.id,
            name: e.student.name,
            email: e.student.email,
            xp: e.student.xp,
            streak: e.student.streak,
            lastAttempt: last
              ? {
                  id: last.id,
                  mode: last.mode,
                  fluencyPct: last.fluencyPct,
                  overallLevel: last.overallLevel,
                  bandCode: last.bandCode,
                  finishedAt: last.finishedAt,
                }
              : null,
          };
        }),
      }))
    );
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("TEACHER", "ADMIN");
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    if (name.length < 2) return fail("Give the class a name");

    let code = makeCode();
    for (let i = 0; i < 5; i++) {
      const exists = await db.class.findUnique({ where: { code } });
      if (!exists) break;
      code = makeCode();
    }

    const cls = await db.class.create({ data: { name, code, teacherId: user.id } });
    return ok({ id: cls.id, name: cls.name, code: cls.code });
  } catch (err) {
    return handleError(err);
  }
}
