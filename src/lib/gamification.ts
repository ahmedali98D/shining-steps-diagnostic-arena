// Gamification: XP ranks, badges and streaks for the Shining Steps platform.

export const RANKS = [
  { min: 0, name: "Seed", icon: "sparkle" },
  { min: 150, name: "Sprout", icon: "leaf" },
  { min: 400, name: "Climber", icon: "footprints" },
  { min: 800, name: "Explorer", icon: "compass" },
  { min: 1400, name: "Pathfinder", icon: "map" },
  { min: 2200, name: "Star Bearer", icon: "star" },
  { min: 3200, name: "Fluency Legend", icon: "crown" },
];

export function rankFor(xp: number) {
  let current = RANKS[0];
  let next: (typeof RANKS)[number] | undefined;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) {
      current = RANKS[i];
      next = RANKS[i + 1];
    }
  }
  const progress = next ? Math.round(((xp - current.min) / (next.min - current.min)) * 100) : 100;
  return { current, next, progress };
}

export interface BadgeDef {
  code: string;
  name: string;
  desc: string;
  icon: string;
}

export const BADGES: BadgeDef[] = [
  { code: "first-steps", name: "First Steps", desc: "Complete your first diagnostic", icon: "rocket" },
  { code: "perfect-skill", name: "Perfect Skill", desc: "Score 100 percent in one skill section", icon: "medal" },
  { code: "flawless", name: "Flawless", desc: "Answer every question correctly in a full diagnostic", icon: "gem" },
  { code: "sharp-ear", name: "Sharp Ear", desc: "Reach Level 6 or above in Listening", icon: "headphones" },
  { code: "reading-ranger", name: "Reading Ranger", desc: "Reach Level 6 or above in Reading", icon: "book_open" },
  { code: "word-weaver", name: "Word Weaver", desc: "Reach Level 6 or above in Writing", icon: "pen_tool" },
  { code: "smooth-speaker", name: "Smooth Speaker", desc: "Reach Level 6 or above in Speaking", icon: "mic" },
  { code: "sky-climber", name: "Sky Climber", desc: "Improve your fluency by 5 points or more", icon: "trending_up" },
  { code: "hat-trick", name: "Hat Trick", desc: "Complete three diagnostics", icon: "three_stars" },
  { code: "summit-eye", name: "Summit Eye", desc: "Reach 70 percent fluency or above", icon: "mountain" },
];

export function badgeDef(code: string): BadgeDef | undefined {
  return BADGES.find((b) => b.code === code);
}

export function computeBadges(args: {
  completedAttempts: number;
  skillResults: { skill: string; accuracy: number; placement: number }[];
  fluencyPct: number;
  previousFluencyPct?: number;
  mode: string;
}): string[] {
  const out: string[] = [];
  out.push("first-steps");
  for (const s of args.skillResults) {
    if (s.accuracy >= 1) out.push("perfect-skill");
  }
  if (args.mode === "FULL" && args.skillResults.length >= 4 && args.skillResults.every((s) => s.accuracy >= 1)) {
    out.push("flawless");
  }
  for (const s of args.skillResults) {
    if (s.placement >= 6) {
      if (s.skill === "listening") out.push("sharp-ear");
      if (s.skill === "reading") out.push("reading-ranger");
      if (s.skill === "writing") out.push("word-weaver");
      if (s.skill === "speaking") out.push("smooth-speaker");
    }
  }
  if (args.previousFluencyPct !== undefined && args.fluencyPct - args.previousFluencyPct >= 5) out.push("sky-climber");
  if (args.completedAttempts >= 3) out.push("hat-trick");
  if (args.fluencyPct >= 70 && args.mode === "FULL") out.push("summit-eye");
  return Array.from(new Set(out));
}

export function nextStreak(lastActiveDay: string | undefined, streak: number, today: string): number {
  if (!lastActiveDay) return 1;
  if (lastActiveDay === today) return Math.max(1, streak);
  const yesterday = new Date(today + "T00:00:00Z");
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const y = yesterday.toISOString().slice(0, 10);
  if (lastActiveDay === y) return streak + 1;
  return 1;
}
