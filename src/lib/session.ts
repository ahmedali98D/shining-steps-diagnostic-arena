// Session auth: scrypt password hashing + HMAC-signed cookie tokens.
// No external dependencies - runs on Node runtime (default in Next.js 16 route handlers).

import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { hashPassword as hashPw, verifyPassword as verifyPw } from "@/lib/hash";

const COOKIE = "ss_session";
const SECRET = process.env.SESSION_SECRET || "shining-steps-dev-secret-change-in-production";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export function hashPassword(password: string): string {
  return hashPw(password);
}

export function verifyPassword(password: string, stored: string): boolean {
  return verifyPw(password, stored);
}

function sign(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createToken(userId: string, role: Role): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, role, exp: Date.now() + MAX_AGE * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readToken(token: string | undefined): { uid: string; role: Role } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.uid || Date.now() > data.exp) return null;
    return { uid: data.uid, role: data.role };
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string, role: Role) {
  const jar = await cookies();
  jar.set(COOKIE, createToken(userId, role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  xp: number;
  streak: number;
}

export async function currentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const parsed = readToken(token);
  if (!parsed) return null;
  const user = await db.user.findUnique({
    where: { id: parsed.uid },
    select: { id: true, name: true, email: true, role: true, xp: true, streak: true },
  });
  if (!user) return null;
  return { ...user, role: user.role as Role };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new AuthError("Not signed in", 401);
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new AuthError("Not allowed", 403);
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}
