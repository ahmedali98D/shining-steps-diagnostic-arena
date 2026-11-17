"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Award, BookOpenCheck, ChevronDown, Flame, RefreshCcw,
  Sparkles, TrendingUp, Trophy, Volume2,
} from "lucide-react";
import { BigButton, Bar, Card, C, Chip, Confetti, FrameworkChips, Ladder, Mascot, Ring, SkillChip, Spinner, api } from "./kit";
import { SKILL_META, Skill } from "@/lib/questions/types";
import { cefrOfLevel } from "@/lib/interviewKits";

interface FeedbackItem {
  id: string;
  questionId: string;
  answerText: string;
  correct: boolean;
  awardedXp: number;
  openText?: string | null;
  reviewScore?: number | null;
  reviewComment?: string | null;
  question: {
    id: string; skill: Skill; level: number; unit: number; unitTitle: string; lesson: number; lessonTitle: string;
    topic: string; type: string; prompt: string; passage?: string; options?: string[];
    answer: string | string[]; accepted?: string[]; explain: string; wrongNotes?: Record<string, string>;
    audioText?: string; speakerLines?: { speaker: string; line: string }[];
    bloom: string; dok: number; solo: string; marzano: string; ubd: string; udl: string; diff: number;
  } | null;
}

interface DetailData {
  attempt: {
    id: string; mode: string; status: string; overallLevel: number | null; fluencyPct: number | null;
    bandCode: string | null; startRef: string | null; xpEarned: number; correctCount: number; totalCount: number; finishedAt: string | null;
  };
  student: { id: string; name: string };
  result: {
    skills: { skill: Skill; correct: number; asked: number; accuracy: number; placement: number; continuous: number; confidence?: string; levelsChart: { level: number; asked: number; correct: number; pct: number }[]; strongTopic?: string; weakTopic?: string; source?: string; criteria?: Record<string, number>; assessedBy?: string; assessedAt?: string }[];
    overallLevel: number; overallRounded: number; fluencyPct: number;
    provisional?: boolean;
    band: { code: string; label: string; message: string };
    startRef: string; startUnit: { level: number; unit: number; unitTitle: string; lesson: number; lessonTitle: string } | null;
    badges: string[];
    progressPct: number | null;
    previous?: { fluencyPct: number; overallLevel: number | null } | null;
  } | null;
  feedback: FeedbackItem[];
}

const BAND_COLORS: Record<string, string> = {
  EXCELLENT: "#15857A",
  VERY_GOOD: "#2B6CB0",
  GOOD: "#E8A200",
  REVISE: "#FF6A3B",
  REPEAT: "#C2410C",
};

const BAND_TIPS: Record<string, string> = {
  EXCELLENT: "This percentage means: excellent - you are ready to move up.",
  VERY_GOOD: "This percentage means: very good - one small polish and you advance.",
  GOOD: "This percentage means: good - revise the flagged lessons, then move up.",
  REVISE: "This percentage means: needs revision - revise the recommended unit and retake the exam.",
  REPEAT: "This percentage means: repeat the level again with your teacher, then retake. You can do this!",
};

export default function ResultsView({ attemptId, onGoHome, onRetake }: { attemptId: string; onGoHome: () => void; onRetake: (mode: "FULL") => void }) {
  const [data, setData] = useState<DetailData | null>(null);
  const [error, setError] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [openTask, setOpenTask] = useState("");
  const [taskSubmitted, setTaskSubmitted] = useState(false);
  const [taskMsg, setTaskMsg] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  useEffect(() => {
    api<DetailData>(`/api/attempts/${attemptId}`, undefined, "GET").then((res) => {
      if (res.ok && res.data) {
        setData(res.data);
        setTimeout(() => setConfetti(true), 300);
      } else setError(res.error || "Could not load your results");
    });
    return () => setConfetti(false);
  }, [attemptId]);

  const accuracyPct = useMemo(() => {
    if (!data) return 0;
    return data.attempt.totalCount > 0 ? Math.round((data.attempt.correctCount / data.attempt.totalCount) * 100) : 0;
  }, [data]);

  if (error) {
    return (
      <Card className="mx-auto mt-10 max-w-lg p-6 text-center">
        <p className="font-bold" style={{ color: C.ink }}>{error}</p>
        <div className="mt-4"><BigButton onClick={onGoHome} color={C.teal}>Back to my dashboard</BigButton></div>
      </Card>
    );
  }

  if (!data) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Spinner /></div>;
  }

  const r = data.result;
  const bandColor = BAND_COLORS[r?.band.code || "GOOD"] || C.teal;
  const isFull = data.attempt.mode === "FULL";

  const submitOpenTask = async () => {
    setSubmittingTask(true);
    setTaskMsg("");
    const res = await api("/api/assessment/open", { attemptId, text: openTask });
    setSubmittingTask(false);
    if (res.ok) {
      setTaskSubmitted(true);
      setTaskMsg("Sent to your teacher - well done for the extra effort!");
    } else setTaskMsg(res.error || "Could not submit");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Confetti fire={confetti} />

      {/* hero banner */}
      <Card className="relative overflow-hidden">
        <div className="h-2.5 w-full" style={{ background: bandColor }} />
        <div className="flex flex-col items-center gap-5 p-8 md:flex-row md:items-center md:gap-8">
          <Ring
            pct={isFull ? r?.fluencyPct || 0 : accuracyPct}
            size={190}
            color={bandColor}
            sub={isFull ? "of fluent English" : "accuracy this run"}
          />
          <div className="flex-1 text-center md:text-left">
            <div className="text-sm font-extrabold uppercase tracking-widest" style={{ color: C.soft }}>Where you stand today</div>
            <h1 className="mt-1 text-4xl font-black leading-tight" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>
              {isFull ? `Level ${r?.overallLevel} on the Fluency Ladder` : `${SKILL_META[data.result?.skills[0].skill || "reading"].label} check`}
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-white font-extrabold" style={{ background: bandColor }}>
                <Trophy size={18} /> {r?.band.label}: {accuracyPct}%
              </span>
              {isFull && <Chip color={C.violet}>CEFR {cefrOfLevel(r?.overallLevel || 0)}</Chip>}
              {r?.provisional && <Chip color="#E8A200" soft="#FFF3D6">Provisional - speaking interview pending</Chip>}
            </div>
            <p className="mt-3 font-semibold leading-relaxed" style={{ color: C.soft }}>
              {r?.band.message} <b style={{ color: bandColor }}>{BAND_TIPS[r?.band.code || "GOOD"]}</b>
            </p>
            {r?.startRef && (
              <div className="mt-3 rounded-2xl p-3 text-sm font-bold" style={{ background: "#FDF6EA", color: C.ink, border: `1px solid ${C.line}` }}>
                <b style={{ color: C.coral }}>Start from here:</b> {r.startRef}
              </div>
            )}
          </div>
        </div>
        {r?.progressPct !== null && r?.progressPct !== undefined && (
          <div className="mx-8 mb-6 flex items-center gap-2 rounded-2xl px-4 py-3 font-extrabold" style={{ background: r.progressPct >= 0 ? "#E4F2EE" : "#FFEAE2", color: r.progressPct >= 0 ? C.teal : C.coral }}>
            <TrendingUp size={20} />
            {r.progressPct >= 0
              ? `You grew ${r.progressPct} fluency points since your last full diagnostic (${r.previous?.fluencyPct}% to ${r.fluencyPct}%) - that is real progress!`
              : `${r.progressPct} points since last time - every climber slips sometimes. Revise the flagged lessons and climb again!`}
          </div>
        )}
      </Card>

      {/* ladder + skills */}
      {isFull && (
        <Card className="mt-6 p-6">
          <h2 className="mb-1 text-2xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>Your place on the ladder</h2>
          <p className="mb-3 text-sm font-bold" style={{ color: C.soft }}>
            The Shining Steps ladder runs from L0 (first words) to L10 (fluent voice). Your books cover L0 to L8 - you are standing at Level {r?.overallLevel}.
          </p>
          <Ladder current={r?.overallLevel || 0} />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(r?.skills || []).map((s) => {
              const m = SKILL_META[s.skill];
              const isTeacher = s.source === "teacher";
              const hasTeacherScore = isTeacher && s.continuous > 0;
              const isPending = isTeacher && !hasTeacherScore;
              const CRIT_LABELS: Record<string, string> = {
                fluency: "Fluency", pronunciation: "Pronunciation", vocabulary: "Vocabulary",
                grammarAccuracy: "Grammar", comprehension: "Comprehension", conversation: "Conversation",
              };
              return (
                <div key={s.skill} className="rounded-2xl p-4" style={{ background: m.soft, border: `1px solid ${C.line}` }}>
                  <div className="flex items-center justify-between">
                    <SkillChip skill={s.skill} />
                    <span className="text-sm font-black" style={{ color: m.color }}>
                      {isPending ? "live" : `Level ${s.continuous}`}
                    </span>
                  </div>
                  {!isPending ? (
                    <>
                      <div className="mt-2"><Bar pct={Math.round(s.accuracy * 100)} color={m.color} /></div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold" style={{ color: C.soft }}>
                        {isTeacher ? (
                          <>
                            <span>Live interview - assessed by {s.assessedBy}</span>
                            <Chip color={m.color}>CEFR {cefrOfLevel(s.continuous)}</Chip>
                          </>
                        ) : (
                          <>
                            <span>{Math.round(s.accuracy * 100)}% accuracy - placed at Level {s.placement} ({s.correct}/{s.asked} questions correct)</span>
                            {s.confidence && <Chip color={s.confidence === "high" ? C.teal : s.confidence === "medium" ? "#E8A200" : C.coral}>{s.confidence} confidence</Chip>}
                          </>
                        )}
                      </div>
                      {isTeacher && s.criteria && (
                        <div className="mt-2 grid gap-1">
                          {Object.entries(s.criteria).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2">
                              <span className="w-24 text-[10px] font-extrabold" style={{ color: C.soft }}>{CRIT_LABELS[k] || k}</span>
                              <div className="flex-1"><Bar pct={(v / 4) * 100} color={m.color} height={6} /></div>
                              <span className="text-[10px] font-black" style={{ color: m.color }}>{v}/4</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {!isTeacher && (
                        <div className="mt-1 text-xs font-bold" style={{ color: C.ink }}>
                          {s.weakTopic ? <span>Revise first: {s.weakTopic}</span> : <span>Strong across everything asked - brilliant!</span>}
                        </div>
                      )}
                      {!isTeacher && s.levelsChart.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {s.levelsChart.map((lc) => (
                            <div key={lc.level} className="flex-1 text-center">
                              <div className="rounded-t-md" style={{ height: 6 + lc.pct * 0.32, background: m.color, opacity: 0.85 }} title={`Level ${lc.level}: ${lc.pct}%`} />
                              <div className="text-[10px] font-extrabold" style={{ color: C.soft }}>L{lc.level}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mt-2 text-xs font-bold" style={{ color: C.ink }}>
                      Your speaking pillar comes from a live interview with your teacher-examiner (fluency, pronunciation, vocabulary, grammar, comprehension, conversation). Once it is done, your overall level and fluency percent finalize here automatically.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {!isFull && r && (
        <Card className="mt-6 p-6">
          <h2 className="mb-3 text-2xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>Skill analysis</h2>
          {(r.skills || []).map((s) => {
            const m = SKILL_META[s.skill];
            return (
              <div key={s.skill} className="mb-3 rounded-2xl p-4" style={{ background: m.soft }}>
                <div className="flex items-center justify-between">
                  <SkillChip skill={s.skill} />
                  <span className="font-black" style={{ color: m.color }}>Level {s.continuous}</span>
                </div>
                <div className="mt-2"><Bar pct={Math.round(s.accuracy * 100)} color={m.color} /></div>
                <div className="mt-2 text-xs font-bold" style={{ color: C.soft }}>{Math.round(s.accuracy * 100)}% accuracy - placed at Level {s.placement}</div>
              </div>
            );
          })}
        </Card>
      )}

      {/* badges earned */}
      {r && r.badges.length > 0 && (
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-2">
            <Award color={C.amber} />
            <h2 className="text-2xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>Badges earned now</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {r.badges.map((b) => (
              <Chip key={b} color={C.violet}><Sparkles size={13} /> {b.replace(/-/g, " ")}</Chip>
            ))}
          </div>
        </Card>
      )}

      {/* per-question feedback */}
      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2">
          <BookOpenCheck color={C.teal} />
          <h2 className="text-2xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>
            Every question, explained
          </h2>
        </div>
        <p className="mt-1 mb-4 text-sm font-bold" style={{ color: C.soft }}>
          Tap a question to see what the right answer was, why it is right, and why your answer worked or did not.
        </p>
        <div className="grid gap-2">
          {data.feedback.map((f, idx) => {
            const q = f.question;
            if (!q) return null;
            const isOpen = openItem === f.id;
            const correctColor = f.correct ? C.teal : C.coral;
            return (
              <div key={f.id} className="overflow-hidden rounded-2xl border-2" style={{ borderColor: isOpen ? correctColor : C.line }}>
                <button
                  onClick={() => setOpenItem(isOpen ? null : f.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-orange-50/50"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: correctColor }}
                  >
                    {f.correct ? <Trophy size={16} /> : <RefreshCcw size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold" style={{ color: C.ink }}>
                      {idx + 1}. {q.topic}
                    </div>
                    <div className="text-xs font-bold" style={{ color: C.soft }}>
                      <SkillChip skill={q.skill} /> Level {q.level} - Unit {q.unit} Lesson {q.lesson}
                      {q.type === "open" && " - teacher task"}
                    </div>
                  </div>
                  <span className="text-xs font-black" style={{ color: f.correct ? C.teal : C.coral }}>
                    {f.awardedXp > 0 ? `+${f.awardedXp} XP` : f.type === "open" ? (f.reviewScore != null ? `${f.reviewScore}/100` : "in review") : "0 XP"}
                  </span>
                  <ChevronDown size={18} style={{ color: C.soft, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </button>
                {isOpen && (
                  <div className="border-t px-5 py-4" style={{ borderColor: C.line, background: "#FFFDF8" }}>
                    <FrameworkChips q={q} />
                    <p className="mt-3 font-extrabold" style={{ color: C.ink }}>{q.prompt}</p>
                    {q.passage && <pre className="mt-2 whitespace-pre-wrap rounded-xl p-3 text-sm font-semibold" style={{ background: "#FDF6EA", color: C.ink }}>{q.passage}</pre>}
                    {(q.audioText || q.speakerLines) && (
                      <div className="mt-2 rounded-xl p-3 text-sm font-semibold" style={{ background: "#FFF3D6" }}>
                        <b style={{ color: "#B25E02" }}>What you heard:</b>
                        <div className="mt-1">
                          {q.speakerLines
                            ? q.speakerLines.map((l, i) => <div key={i}><b>{l.speaker}:</b> {l.line}</div>)
                            : q.audioText}
                        </div>
                      </div>
                    )}
                    <div className="mt-3 grid gap-2 text-sm">
                      <div className="rounded-xl px-4 py-2.5 font-bold" style={{ background: "#E4F2EE", color: C.ink }}>
                        <b style={{ color: C.teal }}>Correct answer:</b> {Array.isArray(q.answer) ? q.answer.join(" | ") : q.answer}
                        {q.accepted && q.accepted.length > 0 && ` (also accepted: ${q.accepted.slice(0, 3).join(", ")})`}
                      </div>
                      {q.type !== "open" && (
                        <div className="rounded-xl px-4 py-2.5 font-bold" style={{ background: "#FDF6EA", color: C.ink }}>
                          <b style={{ color: C.coral }}>Your answer:</b> {f.answerText || "(empty)"}
                        </div>
                      )}
                      {q.type === "open" && f.openText && (
                        <div className="rounded-xl px-4 py-2.5 font-bold" style={{ background: "#FDF6EA", color: C.ink }}>
                          <b style={{ color: C.coral }}>Your writing:</b> {f.openText}
                        </div>
                      )}
                      <div className="rounded-xl px-4 py-2.5 font-semibold" style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.ink }}>
                        <b style={{ color: C.teal }}>Why the right answer is right:</b> {q.explain}
                      </div>
                      {!f.correct && f.answerText && q.wrongNotes && q.wrongNotes[f.answerText.trim()] && (
                        <div className="rounded-xl px-4 py-2.5 font-semibold" style={{ background: "#FFEAE2", color: C.ink }}>
                          <b style={{ color: C.coral }}>Why your answer did not work:</b> {q.wrongNotes[f.answerText.trim()]}
                        </div>
                      )}
                      {!f.correct && !q.wrongNotes?.[f.answerText?.trim() || ""] && q.type !== "open" && (
                        <div className="rounded-xl px-4 py-2.5 font-semibold" style={{ background: "#FFEAE2", color: C.ink }}>
                          <b style={{ color: C.coral }}>Why your answer did not work:</b> Compare your choice with the correct answer above - the explanation shows the rule to follow next time.
                        </div>
                      )}
                      {q.type === "open" && (
                        <div className="rounded-xl px-4 py-2.5 font-semibold" style={{ background: "#EFE9F7", color: C.ink }}>
                          <b style={{ color: C.violet }}>Teacher review:</b>{" "}
                          {f.reviewScore != null ? `${f.reviewScore}/100 - ${f.reviewComment || ""}` : "Waiting for your teacher - it does not affect your automatic score."}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* bonus open task */}
      {isFull && !taskSubmitted && (
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-2">
            <Flame color={C.coral} />
            <h2 className="text-2xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>Bonus Big Task (+20 XP)</h2>
          </div>
          <p className="mt-1 text-sm font-bold" style={{ color: C.soft }}>
            A real writing task from Level {r?.overallRounded} of your Shining Steps book - your teacher will read it and score it.
          </p>
          <div className="mt-3 rounded-2xl p-4 text-sm font-bold" style={{ background: "#FFEAE2", color: C.ink }}>
            {(r?.overallRounded ?? 0) >= 0 && <OpenTaskPrompt level={r?.overallRounded || 0} />}
          </div>
          <textarea
            value={openTask}
            onChange={(e) => setOpenTask(e.target.value)}
            rows={6}
            placeholder="Write your answer here..."
            className="mt-3 w-full rounded-2xl border-2 p-4 font-semibold outline-none"
            style={{ borderColor: C.line, color: C.ink }}
          />
          <div className="mt-3 flex items-center gap-3">
            <BigButton onClick={submitOpenTask} disabled={openTask.trim().length < 10 || submittingTask} color={C.coral}>
              {submittingTask ? "Sending..." : "Send to my teacher"} <ArrowRight size={18} />
            </BigButton>
            {taskMsg && <span className="text-sm font-bold" style={{ color: C.soft }}>{taskMsg}</span>}
          </div>
        </Card>
      )}
      {taskSubmitted && (
        <Card className="mt-6 p-6 text-center">
          <Mascot size={80} mood="cheer" />
          <p className="mt-2 font-extrabold" style={{ color: C.teal }}>Bonus task sent! +20 XP - your teacher will review it soon.</p>
        </Card>
      )}

      {/* actions */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 pb-10">
        <BigButton onClick={onGoHome} color={C.teal}>Back to my dashboard</BigButton>
        <BigButton onClick={() => onRetake("FULL")} color={C.violet}>Climb again (new diagnostic)</BigButton>
      </div>
    </div>
  );
}

function OpenTaskPrompt({ level }: { level: number }) {
  const [prompt, setPrompt] = useState("Loading the Big Task for your level...");
  useEffect(() => {
    // fetch the task prompt via the attempts detail is not needed: we ask the server minimally
    fetch(`/api/attempts/open-task?level=${level}`)
      .then((x) => x.json())
      .then((j) => {
        if (j?.ok && j?.data?.prompt) setPrompt(j.data.prompt);
        else setPrompt("Write three sentences using what you learned at this level.");
      })
      .catch(() => setPrompt("Write three sentences using what you learned at this level."));
  }, [level]);
  return <span>{prompt}</span>;
}

void Volume2;
