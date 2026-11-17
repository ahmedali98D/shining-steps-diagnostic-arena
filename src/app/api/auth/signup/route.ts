import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/session";
import { ok, fail, handleError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = body.role === "TEACHER" ? "TEACHER" : "STUDENT";
    const classCode = String(body.classCode || "").trim().toUpperCase();

    if (name.length < 2) return fail("Please enter your full name");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Please enter a valid email address");
    if (password.length < 6) return fail("Password must be at least 6 characters");

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return fail("An account with this email already exists - try signing in");

    const user = await db.user.create({
      data: { name, email, passwordHash: hashPassword(password), role },
    });

    if (role === "STUDENT" && classCode) {
      const cls = await db.class.findUnique({ where: { code: classCode } });
      if (cls) {
        await db.enrollment.create({ data: { classId: cls.id, studentId: user.id } });
      }
    }

    await setSessionCookie(user.id, role);
    return ok({ id: user.id, name: user.name, email: user.email, role: user.role, xp: 0, streak: 0 });
  } catch (err) {
    return handleError(err);
  }
}
