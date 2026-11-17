"use client";

import { useState } from "react";
import { GraduationCap, KeyRound, UserPlus } from "lucide-react";
import { BigButton, Card, C, Chip, Mascot, api } from "./kit";

export default function AuthView({ onAuthed, goHome }: { onAuthed: () => void; goHome: () => void }) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [classCode, setClassCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    const res =
      tab === "login"
        ? await api<{ role: string }>("/api/auth/login", { email, password })
        : await api<{ role: string }>("/api/auth/signup", { name, email, password, role, classCode });
    setBusy(false);
    if (res.ok && res.data) {
      const r = res.data.role;
      onAuthed();
      window.location.hash = r === "TEACHER" ? "#/teacher" : r === "ADMIN" ? "#/center" : "#/student";
    } else setError(res.error || "Something went wrong");
  };

  const fillDemo = (who: "student" | "teacher" | "admin") => {
    setTab("login");
    setEmail(`${who}@shiningsteps.app`);
    setPassword(who === "student" ? "Student2026!" : who === "teacher" ? "Teacher2026!" : "Center2026!");
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-6 text-center">
        <Mascot size={92} mood="cheer" />
        <h1 className="mt-2 text-3xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>
          {tab === "login" ? "Welcome back, climber!" : "Join the Shining Steps ladder!"}
        </h1>
        <p className="mt-1 font-bold" style={{ color: C.soft }}>
          {tab === "login" ? "Sign in and keep climbing." : "Create your account and find your level in minutes."}
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl p-1" style={{ background: "#F5EFE6" }}>
          <button onClick={() => setTab("login")} className="rounded-xl py-2 font-extrabold transition-all" style={{ background: tab === "login" ? "#fff" : "transparent", color: C.ink, boxShadow: tab === "login" ? "0 2px 10px rgba(0,0,0,0.08)" : "none" }}>
            Sign in
          </button>
          <button onClick={() => setTab("signup")} className="rounded-xl py-2 font-extrabold transition-all" style={{ background: tab === "signup" ? "#fff" : "transparent", color: C.ink, boxShadow: tab === "signup" ? "0 2px 10px rgba(0,0,0,0.08)" : "none" }}>
            New account
          </button>
        </div>

        <div className="grid gap-3">
          {tab === "signup" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-2xl border-2 px-4 py-3 font-bold outline-none" style={{ borderColor: C.line, color: C.ink }} />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="rounded-2xl border-2 px-4 py-3 font-bold outline-none" style={{ borderColor: C.line, color: C.ink }} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="rounded-2xl border-2 px-4 py-3 font-bold outline-none" style={{ borderColor: C.line, color: C.ink }} onKeyDown={(e) => e.key === "Enter" && submit()} />

          {tab === "signup" && (
            <>
              <div className="flex gap-2">
                <button onClick={() => setRole("STUDENT")} className="flex-1 rounded-2xl border-2 py-3 font-extrabold transition-all" style={{ borderColor: role === "STUDENT" ? C.teal : C.line, background: role === "STUDENT" ? "#E4F2EE" : "#fff", color: role === "STUDENT" ? C.teal : C.soft }}>
                  <GraduationCap size={18} className="mr-1 inline" /> I am a student
                </button>
                <button onClick={() => setRole("TEACHER")} className="flex-1 rounded-2xl border-2 py-3 font-extrabold transition-all" style={{ borderColor: role === "TEACHER" ? C.violet : C.line, background: role === "TEACHER" ? "#EFE9F7" : "#fff", color: role === "TEACHER" ? C.violet : C.soft }}>
                  <UserPlus size={18} className="mr-1 inline" /> I am a teacher
                </button>
              </div>
              {role === "STUDENT" && (
                <input value={classCode} onChange={(e) => setClassCode(e.target.value.toUpperCase())} placeholder="Class join code (optional)" className="rounded-2xl border-2 px-4 py-3 font-bold outline-none" style={{ borderColor: C.line, color: C.ink }} />
              )}
            </>
          )}

          {error && <p className="rounded-xl px-3 py-2 text-sm font-bold" style={{ background: "#FFEAE2", color: C.coral }}>{error}</p>}

          <BigButton onClick={submit} disabled={busy} color={C.teal}>
            <KeyRound size={20} /> {busy ? "One moment..." : tab === "login" ? "Sign in" : "Create my account"}
          </BigButton>
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <div className="text-center text-xs font-extrabold" style={{ color: C.soft }}>Explore instantly with a demo account:</div>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button onClick={() => fillDemo("student")} className="rounded-xl px-3 py-2 text-xs font-extrabold" style={{ background: "#E4F2EE", color: C.teal }}>Demo student</button>
          <button onClick={() => fillDemo("teacher")} className="rounded-xl px-3 py-2 text-xs font-extrabold" style={{ background: "#EFE9F7", color: C.violet }}>Demo teacher</button>
          <button onClick={() => fillDemo("admin")} className="rounded-xl px-3 py-2 text-xs font-extrabold" style={{ background: "#FFF3D6", color: "#B25E02" }}>Demo center admin</button>
        </div>
        <div className="mt-2 text-center">
          <Chip color={C.coral}>Passwords: Student2026! / Teacher2026! / Center2026!</Chip>
        </div>
      </Card>

      <div className="mt-4 text-center">
        <button onClick={goHome} className="text-sm font-extrabold underline" style={{ color: C.soft }}>Back to home</button>
      </div>
    </div>
  );
}
