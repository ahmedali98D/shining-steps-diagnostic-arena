"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCheck, ClipboardList, LogOut, Mic, Plus, Users } from "lucide-react";
import { BigButton, Bar, Card, C, Chip, Mascot, SectionTitle, SkillChip, Spinner, api } from "./kit";
import { SKILL_META, Skill } from "@/lib/questions/types";
import { CRITERIA, CRITERIA_ANCHORS, cefrOfLevel, kitFor } from "@/lib/interviewKits";

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

interface SpeakingStudent {
  id: string;
  name: string;
  email: string;
  lastOverallLevel: number | null;
  speaking: {
    level: number;
    kitLevel: number;
    criteria: Record<string, number>;
    notes: string;
    teacher: string;
    createdAt: string;
  } | null;
}

export default function TeacherHome({ name, onSignOut, onOpenAttempt }: { name: string; onSignOut: () => void; onOpenAttempt: (id: string) => void }) {
  const [classes, setClasses] = useState<ClassData[] | null>(null);
  const [pending, setPending] = useState<PendingReview[] | null>(null);
  const [speakingStudents, setSpeakingStudents] = useState<SpeakingStudent[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<ClassData[]>("/api/teacher/classes", undefined, "GET").then((r) => setClasses(r.ok && r.data ? r.data : []));
    api<PendingReview[]>("/api/teacher/review", undefined, "GET").then((r) => setPending(r.ok && r.data ? r.data : []));
    api<SpeakingStudent[]>("/api/teacher/speaking", undefined, "GET").then((r) => setSpeakingStudents(r.ok && r.data ? r.data : []));
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

      {/* pending writing reviews */}
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

      {/* speaking interviews */}
      <Card className="mt-5 p-6">
        <div className="flex items-center gap-2">
          <Mic color={C.violet} />
          <SectionTitle kicker="The fourth pillar, assessed live" title="Speaking interviews" />
        </div>
        <p className="mb-3 text-sm font-bold" style={{ color: C.soft }}>
          Run a one-to-one interview with the adaptive kit, score the six criteria (0 to 4), and the platform computes the speaking level and finalizes the student's overall placement.
        </p>
        {!speakingStudents ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : (
          <SpeakingPanel students={speakingStudents} onDone={load} />
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
              <div key={cl.id} className="min-w-0 rounded-2xl p-4" style={{ background: "#FDF6EA", border: `1px solid ${C.line}` }}>
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

// ---------------- speaking interview panel ----------------
function SpeakingPanel({ students, onDone }: { students: SpeakingStudent[]; onDone: () => void }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const selected = students.find((s) => s.id === selectedId) || null;
  const [kitLevel, setKitLevel] = useState(3);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const pickStudent = (s: SpeakingStudent) => {
    setSelectedId(s.id);
    setKitLevel(s.lastOverallLevel !== null ? Math.max(0, Math.min(8, Math.round(s.lastOverallLevel))) : 3);
    setScores({});
    setNotes("");
    setSavedMsg("");
  };

  const kit = kitFor(kitLevel);
  const avg = CRITERIA.reduce((s, c) => s + (scores[c.key] ?? 0), 0) / CRITERIA.length;
  const computedLevel = Math.round(avg * 2 * 10) / 10;
  const allScored = CRITERIA.every((c) => scores[c.key] !== undefined);

  const save = async () => {
    if (!selected || !allScored || busy) return;
    setBusy(true);
    const res = await api<{ level: number }>("/api/teacher/speaking", {
      studentId: selected.id,
      kitLevel,
      criteria: scores,
      notes,
    });
    setBusy(false);
    if (res.ok) {
      setSavedMsg(`Saved - speaking level ${res.data?.level} recorded for ${selected.name}. Their overall placement is now finalized.`);
      onDone();
    } else setSavedMsg(res.error || "Could not save");
  };

  return (
    <div>
      {/* student chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {students.map((s) => {
          const done = Boolean(s.speaking);
          return (
            <button
              key={s.id}
              onClick={() => pickStudent(s)}
              className="rounded-xl border-2 px-3 py-2 text-sm font-extrabold transition-all hover:scale-105"
              style={{
                borderColor: selectedId === s.id ? C.violet : C.line,
                background: selectedId === s.id ? "#EFE9F7" : "#fff",
                color: C.ink,
              }}
            >
              {s.name}
              {done ? <Chip color={C.teal}> L{s.speaking!.level}</Chip> : <Chip color={C.coral}> pending</Chip>}
            </button>
          );
        })}
        {students.length === 0 && <p className="font-bold" style={{ color: C.soft }}>No students yet.</p>}
      </div>

      {selected && (
        <div className="rounded-2xl border-2 p-4" style={{ borderColor: C.violet, background: "#FCFAFF" }}>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="font-black" style={{ color: C.ink }}>Interview kit level:</span>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((lv) => (
              <button
                key={lv}
                onClick={() => setKitLevel(lv)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-extrabold"
                style={{
                  background: kitLevel === lv ? C.violet : "#fff",
                  color: kitLevel === lv ? "#fff" : C.soft,
                  border: `1px solid ${kitLevel === lv ? C.violet : C.line}`,
                }}
              >
                L{lv}
              </button>
            ))}
            <Chip color={C.violet}>CEFR {kit.cefr}</Chip>
          </div>

          {/* the kit */}
          <div className="rounded-xl p-3 text-sm font-semibold" style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.ink }}>
            <div className="font-black" style={{ color: C.violet }}>{kit.title}</div>
            <div className="mt-1"><b>Warm-up:</b> {kit.warmup}</div>
            <div className="mt-2 grid gap-1.5">
              {kit.prompts.map((p, i) => (
                <div key={i} className="rounded-lg p-2" style={{ background: "#FDF6EA" }}>
                  <b>{i + 1}. {p.prompt}</b>
                  <div className="text-xs font-bold" style={{ color: C.soft }}>From: {p.from}</div>
                  <div className="text-xs font-bold" style={{ color: C.violet }}>Listen for: {p.listenFor}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs font-extrabold" style={{ color: C.teal }}>Move up: {kit.upCue}</div>
            <div className="mt-1 text-xs font-extrabold" style={{ color: C.coral }}>Move down: {kit.downCue}</div>
          </div>

          {/* rubric */}
          <div className="mt-3 grid gap-2">
            {CRITERIA.map((c) => (
              <div key={c.key} className="flex flex-wrap items-center gap-2">
                <span className="w-40 text-sm font-extrabold" style={{ color: C.ink }}>
                  {c.label} <span className="text-[10px] font-bold" style={{ color: C.soft }}>({c.hint})</span>
                </span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((v) => (
                    <button
                      key={v}
                      title={CRITERIA_ANCHORS[v]}
                      onClick={() => setScores((s) => ({ ...s, [c.key]: v }))}
                      className="h-8 w-8 rounded-lg text-xs font-black"
                      style={{
                        background: (scores[c.key] ?? -1) === v ? C.violet : "#fff",
                        color: (scores[c.key] ?? -1) === v ? "#fff" : C.soft,
                        border: `1.5px solid ${(scores[c.key] ?? -1) === v ? C.violet : C.line}`,
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] font-bold" style={{ color: C.soft }}>
            Anchors: {CRITERIA_ANCHORS.join(" | ")}
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Your notes for the student and the next teacher..."
            className="mt-3 w-full rounded-xl border-2 p-3 text-sm font-semibold outline-none"
            style={{ borderColor: C.line, color: C.ink }}
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="rounded-xl px-4 py-2 font-black" style={{ background: "#EFE9F7", color: C.violet }}>
              Speaking level: {allScored ? computedLevel : "score all six to compute"}
            </div>
            <BigButton onClick={save} disabled={!allScored || busy} color={C.violet}>
              {busy ? "Saving..." : "Save speaking assessment"} <CheckCheck size={18} />
            </BigButton>
            {savedMsg && <span className="text-sm font-bold" style={{ color: C.teal }}>{savedMsg}</span>}
          </div>
        </div>
      )}

      {/* existing assessments */}
      <div className="mt-4 grid gap-2">
        {students.filter((s) => s.speaking).map((s) => (
          <div key={s.id} className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-2" style={{ border: `1px solid ${C.line}` }}>
            <span className="text-sm font-extrabold" style={{ color: C.ink }}>{s.name}</span>
            <Chip color={C.teal}>L{s.speaking!.level} ({cefrOfLevel(s.speaking!.level)})</Chip>
            <SkillChip skill={"speaking" as Skill} />
            <span className="text-xs font-bold" style={{ color: C.soft }}>
              by {s.speaking!.teacher} - kit L{s.speaking!.kitLevel} - {new Date(s.speaking!.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
            <div className="ml-auto flex gap-1">
              {CRITERIA.map((c) => (
                <span key={c.key} className="rounded-md px-1.5 py-0.5 text-[10px] font-black" style={{ background: SKILL_META.speaking.soft, color: C.violet }}>
                  {s.speaking!.criteria[c.key]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- pending writing review row ----------------
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
