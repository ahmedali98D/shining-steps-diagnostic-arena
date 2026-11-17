"use client";

import { useEffect, useMemo, useState } from "react";
import { SKILL_META, Skill } from "@/lib/questions/types";

// ---------------- palette (matches the Shining Steps books) ----------------
export const C = {
  bg: "#FFF9F0",
  ink: "#0B3B36",
  teal: "#15857A",
  coral: "#FF6A3B",
  amber: "#FFC53D",
  violet: "#6B4FA0",
  line: "#EAD9C9",
  soft: "#4A605C",
};

export const SKILL_COLORS: Record<Skill, string> = {
  reading: C.teal,
  listening: C.amber,
  writing: C.coral,
  speaking: C.violet,
};

// ---------------- tiny hooks ----------------
export function useHashRoute(): [string, (h: string) => void] {
  const [hash, setHash] = useState<string>(typeof window !== "undefined" ? window.location.hash.replace(/^#\/?/, "") || "" : "");
  useEffect(() => {
    const on = () => setHash(window.location.hash.replace(/^#\/?/, "") || "");
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const go = (h: string) => {
    window.location.hash = h ? `#/${h}` : "#/";
    setHash(h);
  };
  return [hash, go];
}

// ---------------- primitives ----------------
export function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-3xl border bg-white/90 backdrop-blur-sm shadow-[0_10px_40px_-12px_rgba(11,59,54,0.18)] ${className}`}
      style={{ borderColor: C.line, ...style }}
    >
      {children}
    </div>
  );
}

export function BigButton({
  children,
  onClick,
  color = C.teal,
  disabled,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-white font-extrabold text-lg transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      style={{ background: color, boxShadow: `0 8px 20px -8px ${color}88` }}
    >
      {children}
    </button>
  );
}

export function Chip({ children, color, soft }: { children: React.ReactNode; color: string; soft?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold"
      style={{ background: soft || `${color}1A`, color }}
    >
      {children}
    </span>
  );
}

export function SkillChip({ skill }: { skill: Skill }) {
  const m = SKILL_META[skill];
  return (
    <Chip color={m.color} soft={m.soft}>
      {m.label}
    </Chip>
  );
}

export const FRAMEWORK_LABELS: Record<string, string> = {
  bloom: "Bloom's",
  dok: "DOK",
  solo: "SOLO",
  marzano: "Marzano",
  ubd: "UbD",
  udl: "UDL",
};

export function FrameworkChips({ q }: { q: { bloom: string; dok: number; solo: string; marzano: string; ubd: string; udl: string } }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Chip color={C.teal}>Bloom&apos;s: {q.bloom}</Chip>
      <Chip color={C.coral}>DOK {q.dok}</Chip>
      <Chip color={C.violet}>SOLO: {q.solo}</Chip>
      <Chip color="#B25E02" soft="#FFF3D6">Marzano: {q.marzano}</Chip>
      <Chip color="#2B6CB0" soft="#E8F1FB">UbD: {q.ubd}</Chip>
      <Chip color="#0F766E" soft="#E4F2EE">UDL: {q.udl}</Chip>
    </div>
  );
}

// ---------------- progress ring ----------------
export function Ring({
  pct,
  size = 160,
  stroke = 14,
  color = C.teal,
  label,
  sub,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: React.ReactNode;
  sub?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnim(clamped), 80);
    return () => clearTimeout(t);
  }, [clamped]);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.line} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (circ * anim) / 100}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", fontSize: size / 4.2, color: C.ink }}>
          {label ?? `${clamped}%`}
        </div>
        {sub && <div className="text-xs font-bold" style={{ color: C.soft }}>{sub}</div>}
      </div>
    </div>
  );
}

// ---------------- fluency ladder ----------------
export function Ladder({ current, compact }: { current: number; compact?: boolean }) {
  // L0..L10 steps (the series tops at L10), highlight the current rung
  const rungs = useMemo(() => Array.from({ length: 11 }, (_, i) => i), []);
  const cur = Math.max(0, Math.min(10, Math.round(current)));
  const stepW = compact ? 7.2 : 8.4;
  const h = compact ? 120 : 170;
  return (
    <svg viewBox={`0 0 110 ${h}`} style={{ width: "100%", maxWidth: compact ? 300 : 420 }}>
      {rungs.map((i) => {
        const y = h - 14 - (i * (h - 30)) / 10;
        const x0 = 12 + (i * stepW) / 1.6;
        const reached = i <= cur;
        const isCur = i === cur;
        return (
          <g key={i}>
            <rect
              x={x0}
              y={y}
              width={stepW * 9.2}
              height={10}
              rx={5}
              fill={reached ? (isCur ? C.amber : C.teal) : "#EFE3D3"}
              opacity={reached ? 1 : 0.55}
            />
            <text x={x0 - 4} y={y + 8.5} fontSize={8} fontWeight="800" fill={reached ? C.ink : "#B9A98F"} textAnchor="end">
              L{i}
            </text>
          </g>
        );
      })}
      {/* mascot star on the current rung */}
      <g>
        <circle cx={12 + (cur * stepW) / 1.6 + stepW * 9.2 + 8} cy={h - 9 - (cur * (h - 30)) / 10} r={7.5} fill={C.coral} />
        <circle cx={12 + (cur * stepW) / 1.6 + stepW * 9.2 + 5.6} cy={h - 11 - (cur * (h - 30)) / 10} r={1.1} fill="#fff" />
        <circle cx={12 + (cur * stepW) / 1.6 + stepW * 9.2 + 10.4} cy={h - 11 - (cur * (h - 30)) / 10} r={1.1} fill="#fff" />
        <path d={`M ${12 + (cur * stepW) / 1.6 + stepW * 9.2 + 5.4} ${h - 6.5 - (cur * (h - 30)) / 10} q 2.6 2.4 5.2 0`} stroke="#fff" strokeWidth={1.1} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ---------------- mascot ----------------
export function Mascot({ size = 84, mood = "happy", color = C.coral }: { size?: number; mood?: "happy" | "cheer" | "think"; color?: string }) {
  const bounce = mood === "cheer" ? "ss-bounce" : "";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={bounce} aria-label="Shining Steps star mascot">
      <path
        d="M50 6 L60 36 L92 36 L66 55 L76 86 L50 67 L24 86 L34 55 L8 36 L40 36 Z"
        fill={color}
        stroke="#0B3B36"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="42" cy="44" r="3.4" fill="#fff" />
      <circle cx="58" cy="44" r="3.4" fill="#fff" />
      <circle cx="43" cy="45" r="1.6" fill="#0B3B36" />
      <circle cx="59" cy="45" r="1.6" fill="#0B3B36" />
      {mood === "think" ? (
        <circle cx="50" cy="56" r="4" fill="none" stroke="#fff" strokeWidth="2" />
      ) : (
        <path d="M42 53 Q50 62 58 53" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {mood === "cheer" && (
        <>
          <text x="70" y="24" fontSize="14">✦</text>
          <text x="14" y="30" fontSize="11">✦</text>
        </>
      )}
    </svg>
  );
}

// ---------------- confetti ----------------
const CONFETTI_COLORS = ["#15857A", "#FF6A3B", "#FFC53D", "#6B4FA0", "#2B6CB0"];
export function Confetti({ fire }: { fire: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; delay: number; color: string; size: number; dur: number; rot: number }[]>([]);
  useEffect(() => {
    if (!fire) return;
    const arr = Array.from({ length: 70 }, (_, id) => ({
      id,
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 7 + Math.random() * 8,
      dur: 2.6 + Math.random() * 2,
      rot: Math.random() * 360,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- confetti is pure decoration
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 6000);
    return () => clearTimeout(t);
  }, [fire]);
  if (pieces.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 60 }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="ss-confetti"
          style={{
            left: `${p.left}%`,
            top: "-3%",
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ---------------- spinner ----------------
export function Spinner({ color = C.teal }: { color?: string }) {
  return (
    <div className="inline-block h-7 w-7 animate-spin rounded-full border-[3px] border-transparent" style={{ borderTopColor: color, borderRightColor: color }} />
  );
}

export function Bar({ pct, color = C.teal, height = 10 }: { pct: number; color?: string; height?: number }) {
  return (
    <div className="w-full rounded-full" style={{ background: "#EFE3D3", height }}>
      <div className="rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color, height }} />
    </div>
  );
}

export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-2">
      <div className="text-xs font-extrabold uppercase tracking-widest" style={{ color: C.coral }}>
        {kicker}
      </div>
      <h2 className="text-2xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>
        {title}
      </h2>
    </div>
  );
}

// ---------------- fetch helper ----------------
export async function api<T = unknown>(path: string, body?: unknown, method = "POST"): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const j = await res.json();
    return j;
  } catch {
    return { ok: false, error: "Network error - please try again" };
  }
}
