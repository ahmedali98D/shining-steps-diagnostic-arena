import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { ok, handleError } from "@/lib/api";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return ok(null);
    const badges = await db.badgeAward.findMany({ where: { userId: user.id }, orderBy: { awardedAt: "desc" } });
    const enrollments = await db.enrollment.findMany({
      where: { studentId: user.id },
      include: { class: { include: { teacher: { select: { name: true } } } } },
    });
    return ok({
      user,
      badges: badges.map((b) => b.code),
      classes: enrollments.map((e) => ({ id: e.class.id, name: e.class.name, code: e.class.code, teacher: e.class.teacher.name })),
    });
  } catch (err) {
    return handleError(err);
  }
}
