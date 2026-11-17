"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCheck, ClipboardList, LogOut, Plus, Users } from "lucide-react";
import { BigButton, Bar, Card, C, Chip, Mascot, SectionTitle, SkillChip, Spinner, api } from "./kit";
import { SKILL_META, Skill } from "@/lib/questions/types";

interface ClassData {
  id: string;
  name: string;
  code: string;
  teacher: string;
  students: {
    id: string;
    name: string;
    email: string;
    xp: number;
    streak: number;
    lastAttempt: { id: string; mode: string; fluencyPct: number | null; overallLevel: number | null; bandCode: string | null; finishedAt: string | null } | null;
  }[];
}

interface PendingReview {
  id: string;
  attemptId: string;
  studentName: string;
  level: number;
  openText: string | null;
  createdAt: string;
}

export default function TeacherHome({ name, onSignOut, onOpenAttempt }: { name: string; onSignOut: () => void; onOpenAttempt: (id: string) => void }) {
  const [classes, setClasses] = useState<ClassData[] | null>(null);
  const [pending, setPending] = useState<PendingReview[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<ClassData[]>("/api/teacher/classes", undefined, "GET").then((r) => setClasses(r.ok && r.data ? r.data : []));
    api<PendingReview[]>("/api/teacher/review", undefined, "GET").then((r) => setPending(r.ok && r.data ? r.data : []));
  }, []);

  useEffect(load, [load]);

  const createClass = async () => {
    setError("");
    const res = await api<{ code: string }>("/api/teacher/classes", { name: newName });
    if (res.ok) {
      setNewName("");
      setCreating(false);
      load();
    } else setError(res.error || "Could not create the class");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mascot size={50} color={C.violet} />
          <div>
            <div className="text-lg font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>Teacher Desk</div>
            <div className="text-xs font-extrabold" style={{ color: C.soft }}>Welcome, {name}</div>
          </div>
        </div>
        <button onClick={onSignOut} className="rounded-xl px-3 py-2 text-sm font-extrabold" style={{ background: "#FFEAE2", color: C.coral }}>
          <LogOut size={15} className="mr-1 inline" /> Sign out
        </button>
      </div>

      {/* pending reviews */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <ClipboardList color={C.coral} />
          <SectionTitle kicker="Writing tasks waiting" title="Pending reviews" />
        </div>
        {!pending ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : pending.length === 0 ? (
          <p className="py-4 text-center font-bold" style={{ color: C.soft }}>Nothing waiting - every Big Task has been reviewed.</p>
        ) : (
          <div className="grid gap-3">
            {pending.map((p) => (
              <ReviewRow key={p.id} item={p} onDone={load} />
            ))}
          </div>
        )}
      </Card>

      {/* classes */}
      <Card className="mt-5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users color={C.teal} />
            <SectionTitle kicker="My groups" title="Classes" />
          </div>
          <button onClick={() => setCreating(!creating)} className="rounded-xl px-4 py-2 text-sm font-extrabold text-white" style={{ background: C.teal }}>
            <Plus size={15} className="mr-1 inline" /> New class
          </button>
        </div>

        {creating && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl p-3" style={{ background: "#FDF6EA" }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Class name, e.g. Evening B1 Group"
              className="rounded-xl border-2 px-4 py-2 font-bold outline-none"
              style={{ borderColor: C.line, color: C.ink }}
            />
            <BigButton onClick={createClass} color={C.teal}>Create</BigButton>
            {error && <span className="text-sm font-bold" style={{ color: C.coral }}>{error}</span>}
          </div>
        )}

        {!classes ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : classes.length === 0 ? (
          <p className="py-4 text-center font-bold" style={{ color: C.soft }}>
            No classes yet - create one and share the join code with your students.
          </p>
        ) : (
          <div className="grid gap-4">
            {classes.map((cl) => (
              <div key={cl.id} className="rounded-2xl p-4" style={{ background: "#FDF6EA", border: `1px solid ${C.line}` }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-black text-lg" style={{ color: C.ink }}>{cl.name}</div>
                  <Chip color={C.violet}>Join code: {cl.code}</Chip>
                </div>
                <div className="mt-3 grid gap-2">
                  {cl.students.length === 0 && <div className="text-sm font-bold" style={{ color: C.soft }}>No students joined yet.</div>}
                  {cl.students.map((st) => (
                    <div key={st.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-2.5" style={{ border: `1px solid ${C.line}` }}>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-extrabold" style={{ color: C.ink }}>{st.name}</div>
                        <div className="text-xs font-bold" style={{ color: C.soft }}>{st.email} - {st.xp} XP - {st.streak} day streak</div>
                      </div>
                      {st.lastAttempt ? (
                        <>
                          <Chip color={C.teal}>
                            L{st.lastAttempt.overallLevel ?? "-"} - {st.lastAttempt.fluencyPct ?? 0}% fluency
                          </Chip>
                          <Chip color={st.lastAttempt.bandCode === "EXCELLENT" ? C.teal : st.lastAttempt.bandCode === "REPEAT" ? C.coral : "#E8A200"}>
                            {st.lastAttempt.bandCode?.replace("_", " ").toLowerCase()}
                          </Chip>
                          <button onClick={() => onOpenAttempt(st.lastAttempt!.id)} className="rounded-lg px-3 py-1.5 text-xs font-extrabold text-white" style={{ background: C.teal }}>
                            Open report
                          </button>
                        </>
                      ) : (
                        <Chip color="#B9A98F">No diagnostic yet</Chip>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ReviewRow({ item, onDone }: { item: PendingReview; onDone: () => void }) {
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const res = await api("/api/teacher/review", { responseId: item.id, score: Number(score), comment });
    setBusy(false);
    if (res.ok) {
      setDone(true);
      onDone();
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-2xl px-4 py-3 font-extrabold" style={{ background: "#E4F2EE", color: C.teal }}>
        <CheckCheck size={18} /> Review saved for {item.studentName}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 p-4" style={{ borderColor: C.line, background: "#fff" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-extrabold" style={{ color: C.ink }}>
          {item.studentName} <span style={{ color: C.soft }}>- Level {item.level} Big Task</span>
        </div>
        <SkillChip skill={"writing" as Skill} />
      </div>
      <div className="mt-2 rounded-xl p-3 text-sm font-semibold" style={{ background: "#FFFDF8", color: C.ink, border: `1px solid ${C.line}` }}>
        {item.openText}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="0-100"
          className="w-28 rounded-xl border-2 px-3 py-2 font-extrabold outline-none"
          style={{ borderColor: C.line, color: C.ink }}
        />
        <Bar pct={Number(score) || 0} color={SKILL_META.writing.color} />
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Encouraging comment for the student..."
          className="min-w-[220px] flex-1 rounded-xl border-2 px-3 py-2 font-bold outline-none"
          style={{ borderColor: C.line, color: C.ink }}
        />
        <BigButton onClick={submit} disabled={!score || busy} color={C.teal}>{busy ? "Saving..." : "Save review"}</BigButton>
      </div>
    </div>
  );
}
