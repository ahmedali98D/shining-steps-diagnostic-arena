"use client";

import { useCallback, useEffect, useState } from "react";
import { Flame, History, LogOut, Mic, Play, RefreshCcw, Rocket, Star, Trophy } from "lucide-react";
import { BigButton, Bar, Card, C, Chip, Ladder, Mascot, Ring, SectionTitle, SkillChip, Spinner, api } from "./kit";
import { SKILLS, SKILL_META, Skill } from "@/lib/questions/types";
import { BADGES, RANKS, badgeDef, rankFor } from "@/lib/gamification";

const SYSTEM_SKILLS: Skill[] = ["reading", "listening", "writing"];

interface AttemptSummary {
  id: string;
  mode: string;
  overallLevel: number | null;
  fluencyPct: number | null;
  bandCode: string | null;
  startRef: string | null;
  xpEarned: number;
  correctCount: number;
  totalCount: number;
  accuracyPct: number;
  finishedAt: string | null;
  progressPct: number | null;
  skills?: { skill: Skill; continuous: number; accuracy: number; source?: string; assessedBy?: string }[];
  provisional?: boolean;
}

interface Me {
  user: { id: string; name: string; role: string; xp: number; streak: number };
  badges: string[];
  classes: { id: string; name: string; code: string; teacher: string }[];
}

export default function StudentHome({
  me,
  onStart,
  onOpenAttempt,
  onSignOut,
}: {
  me: Me;
  onStart: (mode: "FULL" | Skill) => void;
  onOpenAttempt: (id: string) => void;
  onSignOut: () => void;
}) {
  const [attempts, setAttempts] = useState<AttemptSummary[] | null>(null);
  const [view, setView] = useState<"home" | "history">("home");

  const load = useCallback(() => {
    api<AttemptSummary[]>("/api/attempts", undefined, "GET").then((res) => {
      if (res.ok && res.data) setAttempts(res.data);
      else setAttempts([]);
    });
  }, []);

  useEffect(load, [load]);

  const user = me.user;
  const rank = rankFor(user.xp);
  const lastFull = attempts?.find((a) => a.mode === "FULL");
  const fluency = lastFull?.fluencyPct ?? null;
  const overall = lastFull?.overallLevel ?? null;

  const skillOf = (s: Skill) => lastFull?.skills?.find((x) => x.skill === s);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Mascot size={54} />
          <div>
            <div className="text-lg font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>
              Hi {user.name.split(" ")[0]}!
            </div>
            <div className="flex items-center gap-2 text-xs font-extrabold" style={{ color: C.soft }}>
              <Star size={13} color={C.amber} /> {rank.current.name} - {user.xp} XP
              {rank.next && <span style={{ color: C.coral }}> (next: {rank.next.name} at {rank.next.min} XP)</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Chip color={C.coral}><Flame size={13} /> {user.streak} day streak</Chip>
          <button onClick={() => setView(view === "home" ? "history" : "home")} className="rounded-xl px-3 py-2 text-sm font-extrabold" style={{ background: "#EFE3D3", color: C.ink }}>
            <History size={15} className="mr-1 inline" />
            {view === "home" ? "My history" : "Dashboard"}
          </button>
          <button onClick={onSignOut} className="rounded-xl px-3 py-2 text-sm font-extrabold" style={{ background: "#FFEAE2", color: C.coral }}>
            <LogOut size={15} className="mr-1 inline" /> Sign out
          </button>
        </div>
      </div>

      {view === "home" ? (
        <>
          {/* hero row */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6 text-center md:col-span-1">
              <Ring
                pct={fluency ?? 0}
                color={fluency !== null ? "#15857A" : "#B9A98F"}
                sub={fluency !== null ? "of fluent English" : "take your first diagnostic"}
              />
              <div className="mt-1 font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>
                {fluency !== null ? `Level ${overall} climber` : "Ready for takeoff"}
              </div>
              {lastFull && <div className="text-xs font-bold" style={{ color: C.soft }}>{lastFull.bandCode?.replace("_", " ").toLowerCase()} last run</div>}
            </Card>

            <Card className="p-6 md:col-span-2">
              <SectionTitle kicker="Your mission" title="Climb the Fluency Ladder" />
              <Ladder current={overall ?? 0} compact />
              <div className="mt-3 flex flex-wrap gap-3">
                <BigButton onClick={() => onStart("FULL")} color={C.coral}>
                  <Rocket size={20} /> {fluency === null ? "Start my first full diagnostic" : "New full diagnostic"}
                </BigButton>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {SYSTEM_SKILLS.map((s) => (
                  <button
                    key={s}
                    onClick={() => onStart(s)}
                    className="rounded-xl border-2 px-3 py-2 text-sm font-extrabold transition-all hover:scale-105"
                    style={{ borderColor: SKILL_META[s].color, color: SKILL_META[s].color, background: `${SKILL_META[s].color}0F` }}
                  >
                    <Play size={13} className="mr-1 inline" /> Quick {SKILL_META[s].label} check
                  </button>
                ))}
                <span
                  className="rounded-xl border-2 border-dashed px-3 py-2 text-sm font-extrabold"
                  style={{ borderColor: SKILL_META.speaking.color, color: SKILL_META.speaking.color }}
                  title="Speaking is assessed live by your teacher-examiner"
                >
                  <Mic size={13} className="mr-1 inline" /> Speaking: live interview with your teacher
                </span>
              </div>
            </Card>
          </div>

          {/* skill cards */}
          <Card className="mt-5 p-6">
            <SectionTitle kicker="Pillar by pillar" title="Your four skills" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SKILLS.map((s) => {
                const m = SKILL_META[s];
                const sk = skillOf(s);
                const isTeacherAssessed = sk?.source === "teacher" && sk.continuous > 0;
                const isPending = s === "speaking" && !isTeacherAssessed;
                return (
                  <div key={s} className="min-w-0 rounded-2xl p-4" style={{ background: m.soft, border: `1px solid ${C.line}` }}>
                    <div className="flex items-center justify-between">
                      <SkillChip skill={s} />
                      <span className="text-sm font-black" style={{ color: m.color }}>
                        {isTeacherAssessed ? `L${sk!.continuous}` : sk ? `L${sk.continuous}` : s === "speaking" ? "live" : "-"}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Bar pct={sk && !(s === "speaking" && !isTeacherAssessed) ? Math.round(sk.accuracy * 100) : 0} color={m.color} />
                    </div>
                    <div className="mt-1 text-[11px] font-bold" style={{ color: C.soft }}>
                      {isPending ? "Book your live interview - your teacher scores fluency, pronunciation, vocabulary, grammar, comprehension and conversation" : m.blurb}
                    </div>
                    {isTeacherAssessed && sk?.assessedBy && (
                      <div className="mt-1 text-[10px] font-extrabold" style={{ color: m.color }}>
                        Live interview by {sk.assessedBy}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {lastFull && lastFull.provisional && (
              <div className="mt-4 rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: "#FFF3D6", color: "#B25E02" }}>
                Your placement is provisional: three pillars are measured digitally. After your live speaking interview, your overall level and fluency percent finalize automatically.
              </div>
            )}
          </Card>

          {/* badges */}
          <Card className="mt-5 p-6">
            <SectionTitle kicker="Your collection" title="Badges" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {BADGES.map((b) => {
                const owned = me.badges.includes(b.code);
                return (
                  <div
                    key={b.code}
                    className="rounded-2xl p-3 text-center transition-transform"
                    style={{ background: owned ? "#FFF3D6" : "#F5EFE6", border: `1px solid ${C.line}`, opacity: owned ? 1 : 0.55 }}
                    title={b.desc}
                  >
                    <Trophy size={22} className="mx-auto" color={owned ? "#E8A200" : "#B9A98F"} />
                    <div className="mt-1 text-xs font-black" style={{ color: C.ink }}>{b.name}</div>
                    <div className="text-[10px] font-bold" style={{ color: C.soft }}>{b.desc}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* latest attempt */}
          {attempts && attempts.length > 0 && (
            <Card className="mt-5 p-6">
              <SectionTitle kicker="Latest" title="Your most recent result" />
              <button onClick={() => onOpenAttempt(attempts[0].id)} className="flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all hover:scale-[1.01]" style={{ background: "#FDF6EA", border: `1px solid ${C.line}` }}>
                <Mascot size={44} />
                <div className="flex-1">
                  <div className="font-extrabold" style={{ color: C.ink }}>
                    {attempts[0].mode === "FULL" ? "Full diagnostic" : `${attempts[0].mode} quick check`} - {attempts[0].accuracyPct}% accuracy
                  </div>
                  <div className="text-xs font-bold" style={{ color: C.soft }}>
                    {attempts[0].fluencyPct !== null ? `${attempts[0].fluencyPct}% of fluent English` : ""} {attempts[0].progressPct !== null ? `- ${attempts[0].progressPct >= 0 ? "+" : ""}${attempts[0].progressPct} vs previous` : ""}
                  </div>
                </div>
                <Chip color={C.teal}>+{attempts[0].xpEarned} XP</Chip>
              </button>
            </Card>
          )}

          {/* rank ladder */}
          <Card className="mt-5 p-6">
            <SectionTitle kicker="XP ranks" title={`You are a ${rank.current.name}`} />
            <div className="flex flex-wrap gap-2">
              {RANKS.map((rk) => (
                <Chip key={rk.name} color={user.xp >= rk.min ? C.teal : "#B9A98F"}>{rk.name} ({rk.min})</Chip>
              ))}
            </div>
          </Card>
        </>
      ) : (
        /* history */
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <SectionTitle kicker="Progress over time" title="My history" />
            <button onClick={load} className="rounded-xl px-3 py-2 text-sm font-extrabold" style={{ background: "#EFE3D3", color: C.ink }}>
              <RefreshCcw size={14} className="mr-1 inline" /> Refresh
            </button>
          </div>
          {!attempts ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : attempts.length === 0 ? (
            <div className="py-8 text-center">
              <Mascot size={90} mood="think" />
              <p className="mt-2 font-bold" style={{ color: C.soft }}>No results yet - your first ladder report is waiting for you!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {attempts.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => onOpenAttempt(a.id)}
                  className="flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all hover:scale-[1.01]"
                  style={{ borderColor: C.line, background: i === 0 ? "#FDF6EA" : "#fff" }}
                >
                  <span className="font-black text-lg" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: a.mode === "FULL" ? C.teal : C.violet }}>
                    {a.mode === "FULL" ? `L${a.overallLevel ?? "-"}` : a.mode.slice(0, 4).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold" style={{ color: C.ink }}>
                      {a.mode === "FULL" ? "Full diagnostic" : `${a.mode} quick check`} - {a.accuracyPct}% accuracy
                      {a.progressPct !== null && (
                        <span style={{ color: a.progressPct >= 0 ? C.teal : C.coral }}>
                          {" "}({a.progressPct >= 0 ? "+" : ""}{a.progressPct} pts)
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs font-bold" style={{ color: C.soft }}>
                      {a.startRef || ""}
                    </div>
                  </div>
                  <Chip color={C.coral}>+{a.xpEarned} XP</Chip>
                  <span className="text-xs font-bold" style={{ color: C.soft }}>
                    {a.finishedAt ? new Date(a.finishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

void badgeDef;
