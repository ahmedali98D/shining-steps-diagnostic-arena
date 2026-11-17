"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Check, ChevronLeft, Headphones, Timer, Volume2, X } from "lucide-react";
import { BigButton, Card, C, Chip, Mascot, SKILL_COLORS, Spinner, api } from "./kit";
import { SKILL_META, Skill } from "@/lib/questions/types";

export interface RunnerQuestion {
  id: string;
  skill: Skill;
  level: number;
  unit: number;
  unitTitle: string;
  lesson: number;
  lessonTitle: string;
  topic: string;
  type: "mcq" | "multi" | "fill" | "order" | "truefalse" | "open";
  prompt: string;
  passage?: string;
  visual?: { kind: string; alt: string; svg: string };
  audioText?: string;
  speakerLines?: { speaker: string; line: string }[];
  options?: string[];
  orderTokens?: string[];
}

interface Props {
  mode: "FULL" | Skill;
  onFinish: (attemptId: string) => void;
  onExit: () => void;
}

// The digital exam walks the three system-assessed pillars; speaking is assessed live by a teacher.
const SECTION_ORDER: Skill[] = ["reading", "listening", "writing"];

const SECTION_INTROS: Record<Skill, string> = {
  reading: "Read each text with care - the answers live on the page.",
  listening: "Listen first, answer second. Play each audio up to two times.",
  writing: "Choose the sentences that are built the right way.",
  speaking: "Your speaking pillar is assessed live by your teacher.",
};

export default function Runner({ mode, onFinish, onExit }: Props) {
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState("");
  const [question, setQuestion] = useState<RunnerQuestion | null>(null);
  const [skill, setSkill] = useState<Skill>("reading");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [sectionCount, setSectionCount] = useState(mode === "FULL" ? 3 : 1);
  const [answered, setAnswered] = useState(0);
  const [targetQuestions, setTargetQuestions] = useState(mode === "FULL" ? 28 : 10);
  const [lastOutcome, setLastOutcome] = useState<null | { correct: boolean; xp: number }>(null);
  const [sectionDone, setSectionDone] = useState<Skill | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [targetMinutes, setTargetMinutes] = useState(mode === "FULL" ? 22 : 9);
  const [capMinutes, setCapMinutes] = useState(mode === "FULL" ? 35 : 15);
  const [now, setNow] = useState(Date.now());
  const finishingRef = useRef(false);

  // answer state (one answer input per question type)
  const [selected, setSelected] = useState("");
  const [multi, setMulti] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [ordered, setOrdered] = useState<string[]>([]);

  const start = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await api<{
      attemptId: string;
      question: RunnerQuestion | null;
      skill: Skill;
      sectionIndex: number;
      sectionCount: number;
      answered: number;
      startedAt: string;
      targetMinutes: number;
      capMinutes: number;
      targetQuestions: number;
    }>("/api/assessment/start", { mode });
    if (!res.ok || !res.data) {
      setError(res.error || "Could not start the assessment");
      setLoading(false);
      return;
    }
    setAttemptId(res.data.attemptId);
    setQuestion(res.data.question);
    setSkill(res.data.skill);
    setSectionIndex(res.data.sectionIndex);
    setSectionCount(res.data.sectionCount);
    setAnswered(res.data.answered || 0);
    setTargetQuestions(res.data.targetQuestions || (mode === "FULL" ? 28 : 10));
    setStartedAt(new Date(res.data.startedAt).getTime());
    setTargetMinutes(res.data.targetMinutes || (mode === "FULL" ? 22 : 9));
    setCapMinutes(res.data.capMinutes || (mode === "FULL" ? 35 : 15));
    setSectionDone(null);
    setLastOutcome(null);
    setLoading(false);
  }, [mode]);

  useEffect(() => {
    start();
  }, [start]);

  // Gentle timer - the exam targets about 20 minutes for the full walk and wraps up at the cap.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsedMin = (now - startedAt) / 60000;
  const timePct = Math.min(100, (elapsedMin / capMinutes) * 100);
  const timeColor = timePct >= 85 ? C.coral : timePct >= 65 ? "#E8A200" : C.teal;

  const finishOnce = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    const fin = await api("/api/assessment/finish", { attemptId });
    if (fin.ok) onFinish(attemptId);
    else {
      setError(fin.error || "Could not compute your results");
      finishingRef.current = false;
    }
  }, [attemptId, onFinish]);

  // Auto-finish exactly at the cap with the evidence collected so far.
  useEffect(() => {
    if (!loading && !sectionDone && question && elapsedMin >= capMinutes) {
      void finishOnce();
    }
  }, [elapsedMin, capMinutes, loading, sectionDone, question, finishOnce]);

  const resetAnswerState = () => {
    setSelected("");
    setMulti([]);
    setText("");
    setOrdered([]);
  };

  const answerValue = (): string => {
    const q = question;
    if (!q) return "";
    if (q.type === "mcq" || q.type === "truefalse") return selected;
    if (q.type === "multi") return multi.join(";;");
    if (q.type === "fill") return text;
    if (q.type === "order") return ordered.join(";;");
    return "";
  };

  const canSubmit = (): boolean => {
    const q = question;
    if (!q) return false;
    if (q.type === "mcq" || q.type === "truefalse") return selected !== "";
    if (q.type === "multi") return multi.length > 0;
    if (q.type === "fill") return text.trim().length > 0;
    if (q.type === "order") return ordered.length === (q.orderTokens?.length || 0);
    return false;
  };

  const submit = async () => {
    if (!question || !canSubmit() || submitting) return;
    setSubmitting(true);
    const res = await api<{
      correct: boolean;
      awardedXp: number;
      nextQuestion: RunnerQuestion | null;
      sectionDone: Skill | null;
      finished: boolean;
      autoFinished?: boolean;
      skill: Skill;
      sectionIndex: number;
      answered: number;
    }>("/api/assessment/answer", { attemptId, answer: answerValue() });
    setSubmitting(false);
    if (!res.ok || !res.data) {
      setError(res.error || "Could not save your answer");
      return;
    }
    setLastOutcome({ correct: res.data.correct, xp: res.data.awardedXp });
    setAnswered(res.data.answered);
    if (res.data.finished) {
      await finishOnce();
      return;
    }
    // small delay so the player sees the correct/wrong pulse
    const data = res.data;
    setTimeout(() => {
      setLastOutcome(null);
      resetAnswerState();
      setQuestion(data.nextQuestion);
      setSkill(data.skill);
      setSectionIndex(data.sectionIndex);
    }, 650);
  };

  const continueSection = () => {
    resetAnswerState();
    setSectionDone(null);
    setLastOutcome(null);
    // The engine already prepared the next station - resume it.
    setLoading(true);
    api<{
      attemptId: string;
      question: RunnerQuestion | null;
      skill: Skill;
      sectionIndex: number;
      sectionCount: number;
      answered: number;
    }>("/api/assessment/start", { mode }).then((res) => {
      setLoading(false);
      if (res.ok && res.data) {
        setQuestion(res.data.question);
        setSkill(res.data.skill);
        setSectionIndex(res.data.sectionIndex);
        setSectionCount(res.data.sectionCount);
        setAnswered(res.data.answered || 0);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Mascot size={90} mood="think" />
        <Spinner />
        <p className="font-bold" style={{ color: C.soft }}>Preparing your ladder climb...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-lg">
        <Card className="p-6 text-center">
          <AlertCircle className="mx-auto mb-3" color={C.coral} />
          <p className="font-bold" style={{ color: C.ink }}>{error}</p>
          <div className="mt-4 flex justify-center gap-3">
            <BigButton onClick={start} color={C.teal}>Try again</BigButton>
            <BigButton onClick={onExit} color={C.soft}>Back</BigButton>
          </div>
        </Card>
      </div>
    );
  }

  // ------- section complete screen -------
  if (sectionDone) {
    const nextSkill = mode === "FULL" ? SECTION_ORDER[SECTION_ORDER.indexOf(sectionDone) + 1] : null;
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <Card className="relative overflow-hidden p-8 text-center">
          <div className="absolute inset-x-0 top-0 h-2" style={{ background: SKILL_COLORS[sectionDone] }} />
          <Mascot size={110} mood="cheer" color={SKILL_COLORS[sectionDone]} />
          <h2 className="mt-2 text-3xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>
            {SKILL_META[sectionDone].label} complete!
          </h2>
          <p className="mt-2 font-bold" style={{ color: C.soft }}>
            {nextSkill ? `Next station: ${SKILL_META[nextSkill].label}. Keep your energy up!` : "Wrapping up your ladder report..."}
          </p>
          {mode === "FULL" && !nextSkill && (
            <div className="mt-4 rounded-2xl p-4 text-sm font-extrabold" style={{ background: "#EFE9F7", color: C.ink }}>
              Please inform your teacher to schedule your speaking test - the live interview completes your report.
            </div>
          )}
          <div className="mt-6 flex justify-center">
            <BigButton onClick={continueSection} color={C.coral}>
              {nextSkill ? "Continue" : "See my results"} <ArrowRight size={20} />
            </BigButton>
          </div>
        </Card>
      </div>
    );
  }

  if (!question) return null;

  const q = question;
  const color = SKILL_COLORS[q.skill];
  const progressPct = Math.min(95, Math.round((answered / targetQuestions) * 100));
  const mm = Math.floor(elapsedMin);
  const ss = Math.floor((elapsedMin * 60) % 60);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-sm font-bold" style={{ color: C.soft }}>
          <ChevronLeft size={18} /> Save and exit
        </button>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold"
            style={{ background: `${timeColor}14`, color: timeColor }}
            title={`Target ${targetMinutes} minutes - the exam wraps up by itself at ${capMinutes}`}
          >
            <Timer size={14} /> {mm}:{String(ss).padStart(2, "0")} / {targetMinutes}:00
          </div>
          {mode === "FULL" &&
            SECTION_ORDER.map((s, i) => (
              <div
                key={s}
                title={SKILL_META[s].label}
                className="h-2.5 w-10 rounded-full transition-all"
                style={{
                  background: i < sectionIndex ? SKILL_COLORS[s] : i === sectionIndex ? SKILL_COLORS[s] : "#EFE3D3",
                  opacity: i <= sectionIndex ? 1 : 0.7,
                  transform: i === sectionIndex ? "scaleY(1.6)" : "none",
                }}
              />
            ))}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-sm font-bold" style={{ color: C.soft }}>
        <span>
          Station {sectionIndex + 1}/{sectionCount}: {SKILL_META[q.skill].label} - {SECTION_INTROS[q.skill]}
        </span>
        <span>{answered} answered</span>
      </div>
      <div className="mb-4 w-full rounded-full" style={{ background: "#EFE3D3", height: 8 }}>
        <div className="rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: color, height: 8 }} />
      </div>

      {/* question card */}
      <Card className="relative overflow-hidden">
        <div className="h-2 w-full" style={{ background: color }} />
        <div className="p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Chip color={color} soft={`${color}1A`}>Level {q.level}</Chip>
            <Chip color={color} soft={`${color}1A`}>Unit {q.unit}: {q.unitTitle}</Chip>
            <Chip color={color} soft={`${color}1A`}>Lesson {q.lesson}: {q.lessonTitle}</Chip>
          </div>

          {/* listening player - remounts per question, so the 2 plays reset every question */}
          {(q.audioText || q.speakerLines) && (
            <div className="mb-4">
              <ListeningPlayer key={q.id} q={q} color={color} />
            </div>
          )}

          {/* UDL visual: map, maze, scene, strip, clock or card */}
          {q.visual && (
            <figure
              className="mb-4 overflow-hidden rounded-2xl border bg-white p-2"
              style={{ borderColor: C.line }}
              role="img"
              aria-label={q.visual.alt}
            >
              <div dangerouslySetInnerHTML={{ __html: q.visual.svg }} />
            </figure>
          )}

          {/* stimulus card: every line of the text on its own row, headers bold */}
          {(() => {
            const promptLines = q.prompt.split("\n");
            const stimLines = (q.passage ? q.passage.split("\n") : promptLines.slice(1)).filter((l) => l.trim().length > 0);
            return (
              <>
                {stimLines.length > 0 && (
                  <div className="mb-4 rounded-2xl p-4" style={{ background: "#FDF6EA", border: `1px solid ${C.line}` }}>
                    {stimLines.map((line, i) => {
                      const headPart = line.split(":")[0] || "";
                      const isHeader = /[A-Z]/.test(headPart) && !/[a-z]/.test(headPart) && headPart.length <= 60;
                      return (
                        <p
                          key={i}
                          className={i > 0 ? "mt-2.5" : ""}
                          style={{
                            color: C.ink,
                            fontSize: 15,
                            lineHeight: 1.55,
                            fontWeight: isHeader ? 800 : 600,
                            letterSpacing: isHeader ? "0.02em" : undefined,
                          }}
                        >
                          {line}
                        </p>
                      );
                    })}
                  </div>
                )}
                <p className="mb-1 text-xs font-extrabold uppercase tracking-wide" style={{ color }}>
                  {q.topic}
                </p>
                <h3 className="mb-5 text-xl font-extrabold leading-snug" style={{ color: C.ink }}>
                  {promptLines[0]}
                </h3>
              </>
            );
          })()}

          {/* answer inputs */}
          {(q.type === "mcq" || q.type === "truefalse") && (
            <div className="grid gap-3">
              {(q.options || []).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelected(opt)}
                  className="rounded-2xl border-2 px-5 py-3.5 text-left font-bold transition-all hover:scale-[1.01]"
                  style={{
                    borderColor: selected === opt ? color : C.line,
                    background: selected === opt ? `${color}14` : "#fff",
                    color: C.ink,
                    minHeight: 48,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === "multi" && (
            <div className="grid gap-3">
              {(q.options || []).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setMulti((m) => (m.includes(opt) ? m.filter((x) => x !== opt) : [...m, opt]))}
                  className="flex items-center gap-3 rounded-2xl border-2 px-5 py-3.5 text-left font-bold transition-all"
                  style={{
                    borderColor: multi.includes(opt) ? color : C.line,
                    background: multi.includes(opt) ? `${color}14` : "#fff",
                    color: C.ink,
                    minHeight: 48,
                  }}
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md border-2"
                    style={{ borderColor: multi.includes(opt) ? color : "#CBBFA8", background: multi.includes(opt) ? color : "#fff" }}
                  >
                    {multi.includes(opt) && <Check size={16} color="#fff" />}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === "fill" && (
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Type your answer..."
              className="w-full rounded-2xl border-2 px-5 py-3.5 text-lg font-bold outline-none focus:ring-4"
              style={{ borderColor: C.line, color: C.ink }}
            />
          )}

          {q.type === "order" && (
            <div>
              <div className="mb-3 min-h-[56px] rounded-2xl border-2 border-dashed p-3" style={{ borderColor: color, background: `${color}0D` }}>
                <div className="flex flex-wrap gap-2">
                  {ordered.length === 0 && <span className="text-sm font-bold" style={{ color: C.soft }}>Tap the words below in the right order...</span>}
                  {ordered.map((t, i) => (
                    <button
                      key={`${t}-${i}`}
                      onClick={() => setOrdered((o) => o.filter((_, idx) => idx !== i))}
                      className="rounded-xl px-4 py-2 font-extrabold text-white"
                      style={{ background: color }}
                    >
                      {t} <X size={14} className="inline" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(q.orderTokens || [])
                  .filter((t) => ordered.filter((o) => o === t).length < (q.orderTokens || []).filter((x) => x === t).length)
                  .map((t, i) => (
                    <button
                      key={`${t}-pool-${i}`}
                      onClick={() => setOrdered((o) => [...o, t])}
                      className="rounded-xl border-2 px-4 py-2 font-extrabold transition-all hover:scale-105"
                      style={{ borderColor: C.line, background: "#fff", color: C.ink }}
                    >
                      {t}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* outcome pulse */}
          {lastOutcome && (
            <div
              className="mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 font-extrabold"
              style={{ background: lastOutcome.correct ? "#E4F2EE" : "#FFEAE2", color: lastOutcome.correct ? C.teal : C.coral }}
            >
              {lastOutcome.correct ? <Check size={20} /> : <X size={20} />}
              {lastOutcome.correct ? `Correct! +${lastOutcome.xp} XP - full feedback comes at the end` : "Not quite - keep climbing, feedback comes at the end"}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <BigButton onClick={submit} disabled={!canSubmit() || submitting} color={color}>
              {submitting ? "Checking..." : "Submit"} <ArrowRight size={20} />
            </BigButton>
          </div>
        </div>
      </Card>

      <p className="mt-3 text-center text-xs font-bold" style={{ color: C.soft }}>
        The ladder moves both ways - answer well and it climbs, stumble and it comes down to support you, then confirms your level.
      </p>
    </div>
  );
}

// ---------------- listening player (TTS) ----------------
// Two plays PER QUESTION - the component is keyed by question id, so state is
// always fresh when a new audio arrives. No transcripts during the exam: this
// is a listening test, and a script would turn it into reading.
function ListeningPlayer({ q, color }: { q: RunnerQuestion; color: string }) {
  const [plays, setPlays] = useState(0);
  const [playing, setPlaying] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const cancelled = useRef(false);

  useEffect(() => () => {
    cancelled.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const speak = () => {
    if (!supported || playing || plays >= 2) return;
    cancelled.current = false;
    const synth = window.speechSynthesis;
    synth.cancel();
    const lines = q.speakerLines ? q.speakerLines.map((l) => ({ text: `${l.speaker}: ${l.line}`, pitch: l.speaker.length % 2 === 0 ? 0.9 : 1.25 })) : [{ text: q.audioText || q.prompt, pitch: 1 }];
    setPlaying(true);
    setPlays((p) => p + 1);
    let idx = 0;
    const speakNext = () => {
      if (cancelled.current || idx >= lines.length) {
        setPlaying(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(lines[idx].text);
      u.rate = 0.92;
      u.pitch = lines[idx].pitch;
      u.onend = () => {
        idx += 1;
        setTimeout(speakNext, 350);
      };
      u.onerror = () => setPlaying(false);
      synth.speak(u);
    };
    speakNext();
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: "#FFF3D6", border: `1px solid ${C.line}` }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={speak}
            disabled={!supported || playing || plays >= 2}
            className="flex h-12 w-12 items-center justify-center rounded-full text-white transition-all hover:scale-105 disabled:opacity-40"
            style={{ background: color }}
            aria-label="Play the audio"
          >
            {playing ? <Headphones size={22} /> : <Volume2 size={24} />}
          </button>
          <div className="text-sm font-extrabold" style={{ color: "#B25E02" }}>
            {playing ? "Listening..." : plays === 0 ? "Tap to listen (2 plays for this question)" : `${Math.max(0, 2 - plays)} play${2 - plays === 1 ? "" : "s"} left for this question`}
          </div>
        </div>
        {!supported && (
          <div className="max-w-[200px] text-right text-[11px] font-extrabold leading-tight" style={{ color: C.coral }}>
            This browser cannot play audio. Please use Chrome, Edge or Safari.
          </div>
        )}
      </div>
    </div>
  );
}
