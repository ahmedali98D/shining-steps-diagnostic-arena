import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/session";
import { ok, fail, handleError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return fail("Wrong email or password", 401);
    }

    await setSessionCookie(user.id, user.role as "STUDENT" | "TEACHER" | "ADMIN");
    return ok({ id: user.id, name: user.name, email: user.email, role: user.role, xp: user.xp, streak: user.streak });
  } catch (err) {
    return handleError(err);
  }
}
