// Adaptive diagnostic engine for the Shining Steps Fluency Ladder (L0-L8).
//
// Methodology (CEFR-informed adaptive placement):
// - Starts near the student's initial proficiency level (previous placement or mid-ladder).
// - Walks in blocks: pass a block, climb; fail a block, drop; borderline, extend and re-decide.
// - Moves BOTH ways - never a one-way staircase. A failed level leads downward with a
//   confirmation block at the more appropriate level (standard adaptive placement practice).
// - A level is visited at most twice (initial block + confirmation block) to keep the exam short.
// - Stops on: placement confidence (level seen twice), question budget, or ladder boundary.
// - The system assesses Reading, Listening and Writing digitally; Speaking is assessed live
//   by a teacher-examiner (see src/lib/interviewKits.ts) and merged into the final placement.

import {
  Question,
  Skill,
  gradablePoolFor,
  getQuestion,
  LEVEL_META,
} from "./questions";

export type Mode = "FULL" | Skill;

export interface LevelTally {
  level: number;
  asked: number;
  correct: number;
  units: number[]; // units from which questions were drawn
  wrongUnits: number[];
  firstWrongLesson?: { unit: number; lesson: number; lessonTitle: string; unitTitle: string };
}

export interface SkillSectionState {
  skill: Skill;
  currentLevel: number;
  visits: Record<number, number>; // blocks started per level (1 = initial, 2 = confirmation)
  askedIds: string[];
  askedAtLevel: number; // questions asked at the current level in this visit
  tallies: Record<number, LevelTally>;
  lastResults: boolean[]; // results of the current block
  done: boolean;
  recentIds?: string[]; // questions served in the student's recent attempts - avoided while fresh items remain
  servedAt?: Record<string, number>; // qid -> serving sequence, for least-recently-served rotation
  servedCounter?: number;
}

export interface EngineState {
  mode: Mode;
  sections: Record<Skill, SkillSectionState>;
  order: Skill[]; // FULL = reading, listening, writing (speaking is teacher-conducted)
  activeIdx: number;
  phase: "asking" | "finished";
  currentQuestionId?: string;
}

export type Confidence = "high" | "medium" | "low";

export interface SkillResult {
  skill: Skill;
  correct: number;
  asked: number;
  accuracy: number; // weighted 0..1
  placement: number; // highest level with >= 70 percent mastery
  continuous: number; // placement + fraction, e.g. 5.6
  confidence: Confidence;
  levelsChart: { level: number; asked: number; correct: number; pct: number }[];
  strongTopic?: string;
  weakTopic?: string;
  source?: "system" | "teacher"; // teacher = live interview result merged in
  criteria?: Record<string, number>;
  assessedBy?: string;
  assessedAt?: string;
}

export interface AttemptResult {
  mode: Mode;
  skills: SkillResult[];
  overallLevel: number;
  overallRounded: number;
  fluencyPct: number;
  provisional: boolean; // true while the live speaking interview is missing
  band: { code: string; label: string; message: string };
  startRef: string;
  startUnit: { level: number; unit: number; unitTitle: string; lesson: number; lessonTitle: string } | null;
  xpEarned: number;
  correctCount: number;
  totalCount: number;
  perQuestion: {
    qid: string;
    skill: Skill;
    level: number;
    unit: number;
    unitTitle: string;
    lesson: number;
    lessonTitle: string;
    topic: string;
    correct: boolean;
    awardedXp: number;
    bloom: string;
    dok: number;
    solo: string;
    marzano: string;
    ubd: string;
    udl: string;
    type: string;
    open: boolean;
  }[];
  badges: string[];
}

// The digital exam covers the three system-assessed pillars.
export const SYSTEM_SKILLS: Skill[] = ["reading", "listening", "writing"];
export const SECTION_ORDER: Skill[] = SYSTEM_SKILLS;

export const SECTION_LABELS: Record<Skill, string> = {
  reading: "Reading",
  listening: "Listening",
  writing: "Writing",
  speaking: "Speaking (live interview)",
};

// Time management: short enough to stay engaging, long enough to stay reliable.
// Single-skill quick checks run a shorter budget than the full diagnostic.
export const BUDGET_PER_SKILL = 10; // hard cap per pillar
export const TARGET_MINUTES: Record<Mode, number> = { FULL: 22, reading: 9, listening: 9, writing: 9, speaking: 9 };
export const CAP_MINUTES: Record<Mode, number> = { FULL: 35, reading: 15, listening: 15, writing: 15, speaking: 15 };
export const TARGET_QUESTIONS: Record<Mode, number> = { FULL: 28, reading: 10, listening: 10, writing: 10, speaking: 10 };

const BLOCK = 2; // questions per visit block at a level

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startLevelFor(skill: Skill, lastPlacement?: number): number {
  if (lastPlacement === undefined || lastPlacement === null) return 3; // mid of the 0-8 ladder
  // Begin at the student's initial proficiency level, then let the walk move freely.
  return Math.max(0, Math.min(8, lastPlacement));
}

export function initEngineState(
  mode: Mode,
  lastPlacements?: Partial<Record<Skill, number>>,
  recentIds: string[] = []
): EngineState {
  const sections = {} as Record<Skill, SkillSectionState>;
  for (const skill of SYSTEM_SKILLS) {
    const start = startLevelFor(skill, lastPlacements?.[skill]);
    sections[skill] = {
      skill,
      currentLevel: start,
      visits: { [start]: 1 },
      askedIds: [],
      askedAtLevel: 0,
      tallies: {},
      lastResults: [],
      done: false,
      recentIds: recentIds.slice(0, 400),
    };
  }
  const order: Skill[] = mode === "FULL" ? [...SECTION_ORDER] : [mode];
  const first = sections[order[0]];
  const state: EngineState = {
    mode,
    sections,
    order,
    activeIdx: 0,
    phase: "asking",
  };
  state.currentQuestionId = pickNext(first).id;
  return state;
}

function pickNext(section: SkillSectionState): Question {
  const pool = gradablePoolFor(section.currentLevel, section.skill);
  const recent = section.recentIds || [];
  const seq = section.servedAt || (section.servedAt = {});
  const servedAge = (q: Question) => seq[q.id] ?? -1;
  // First choice: never seen, never served in the student's recent attempts.
  const fresh = pool.filter((q) => !section.askedIds.includes(q.id) && !recent.includes(q.id));
  // Second choice: not asked in this attempt (recent items allowed back as a last resort).
  const notAsked = pool.filter((q) => !section.askedIds.includes(q.id));
  const tier = fresh.length > 0 ? fresh : notAsked.length > 0 ? notAsked : pool;
  const usedUnits = new Set(section.tallies[section.currentLevel]?.units || []);
  // Prefer a question from a unit not yet used at this level - variety, not repetition.
  const fromNewUnit = tier.filter((q) => !usedUnits.has(q.unit));
  const candidates = fromNewUnit.length > 0 ? fromNewUnit : tier;
  // Within the tier, rotate: items served longest ago come first, so a small
  // pool still spreads its items evenly across consecutive attempts.
  const shuffled = shuffle(candidates).sort((a, b) => servedAge(a) - servedAge(b));
  const picked = shuffled[0];
  if (!picked) {
    // Fallback: any gradable question at a nearby level (should be rare).
    for (let d = 1; d <= 8; d++) {
      for (const lv of [section.currentLevel - d, section.currentLevel + d]) {
        if (lv < 0 || lv > 8) continue;
        const p2 = gradablePoolFor(lv, section.skill).filter((q) => !section.askedIds.includes(q.id) && !recent.includes(q.id));
        if (p2.length > 0) return shuffle(p2)[0];
      }
    }
    for (let d = 1; d <= 8; d++) {
      for (const lv of [section.currentLevel - d, section.currentLevel + d]) {
        if (lv < 0 || lv > 8) continue;
        const p2 = gradablePoolFor(lv, section.skill).filter((q) => !section.askedIds.includes(q.id));
        if (p2.length > 0) return shuffle(p2)[0];
      }
    }
    return pool[0];
  }
  section.servedCounter = (section.servedCounter || 0) + 1;
  seq[picked.id] = section.servedCounter;
  return picked;
}

function tallyFor(section: SkillSectionState, level: number): LevelTally {
  if (!section.tallies[level]) {
    section.tallies[level] = { level, asked: 0, correct: 0, units: [], wrongUnits: [] };
  }
  return section.tallies[level];
}

export interface AnswerOutcome {
  correct: boolean;
  awardedXp: number;
  nextQuestionId?: string;
  sectionDone?: Skill;
  finished?: boolean;
}

/** Grade an answer against the current question and advance the engine. */
export function gradeAndAdvance(state: EngineState, answer: string): AnswerOutcome {
  const section = state.sections[state.order[state.activeIdx]];
  const q = state.currentQuestionId ? getQuestion(state.currentQuestionId) : undefined;
  if (!q) return { correct: false, awardedXp: 0 };

  const correct = gradeAnswer(q, answer);
  const awardedXp = correct ? xpFor(q) : 0;

  const tally = tallyFor(section, q.level);
  tally.asked += 1;
  tally.units.push(q.unit);
  if (correct) {
    tally.correct += 1;
    section.lastResults.push(true);
  } else {
    tally.wrongUnits.push(q.unit);
    if (!tally.firstWrongLesson) {
      tally.firstWrongLesson = {
        unit: q.unit,
        lesson: q.lesson,
        lessonTitle: q.lessonTitle,
        unitTitle: q.unitTitle,
      };
    }
    section.lastResults.push(false);
  }
  section.askedIds.push(q.id);
  section.askedAtLevel += 1;

  const nextLevel = (lv: number): string | undefined => {
    // Move the walk to another level - or stop if that level already had two blocks.
    if (lv < 0 || lv > 8 || (section.visits[lv] || 0) >= 2) {
      return undefined; // signals section done
    }
    section.currentLevel = lv;
    section.visits[lv] = (section.visits[lv] || 0) + 1;
    section.askedAtLevel = 0;
    section.lastResults = [];
    return pickNext(section).id;
  };

  let nextQuestionId: string | undefined;
  let sectionDone = false;

  const atLevel = tally.asked;
  const budgetReached = section.askedIds.length >= BUDGET_PER_SKILL;
  const blockComplete = atLevel % BLOCK === 0 || atLevel >= 3;

  if (budgetReached) {
    sectionDone = true;
  } else if (blockComplete) {
    const blockResults = section.lastResults.slice(-Math.min(atLevel, 3));
    const correctCount = blockResults.filter(Boolean).length;
    const total = blockResults.length;
    const ratio = total > 0 ? correctCount / total : 0;

    if (total >= 2 && ratio === 1) {
      // Demonstrated mastery - climb and test a higher level.
      nextQuestionId = nextLevel(section.currentLevel + 1);
    } else if (total >= 2 && ratio === 0) {
      // Not yet - drop and reassess at a more appropriate level.
      nextQuestionId = nextLevel(section.currentLevel - 1);
    } else if (atLevel < 3) {
      // Borderline block - one tiebreaker question at the same level.
      nextQuestionId = pickNext(section).id;
    } else {
      // After the tiebreaker the majority decides.
      if (ratio >= 0.5) nextQuestionId = nextLevel(section.currentLevel + 1);
      else nextQuestionId = nextLevel(section.currentLevel - 1);
    }
    sectionDone = nextQuestionId === undefined;
  } else {
    nextQuestionId = pickNext(section).id;
  }

  if (!sectionDone) {
    sectionDone = section.askedIds.length >= BUDGET_PER_SKILL;
  }

  if (sectionDone) {
    section.done = true;
    if (state.mode !== "FULL") {
      state.phase = "finished";
      state.currentQuestionId = undefined;
      return { correct, awardedXp, sectionDone: section.skill, finished: true };
    }
    if (state.activeIdx + 1 < state.order.length) {
      state.activeIdx += 1;
      const next = state.sections[state.order[state.activeIdx]];
      if (!(next.visits[next.currentLevel] || 0)) next.visits[next.currentLevel] = 1;
      state.phase = "asking";
      state.currentQuestionId = pickNext(next).id;
      return { correct, awardedXp, sectionDone: section.skill, nextQuestionId: state.currentQuestionId };
    }
    state.phase = "finished";
    state.currentQuestionId = undefined;
    return { correct, awardedXp, sectionDone: section.skill, finished: true };
  }

  state.currentQuestionId = nextQuestionId;
  state.phase = "asking";
  return { correct, awardedXp, nextQuestionId };
}

// ------------------ grading ------------------

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:"']/g, "")
    .replace(/\s+/g, " ");
}

export function gradeAnswer(q: Question, answer: string): boolean {
  if (q.type === "open") return false; // open tasks go to teacher review
  if (q.type === "mcq" || q.type === "truefalse") {
    // The student taps one exact option, so compare exact strings. A
    // case-insensitive compare would make capitalization items self-grading.
    return answer.trim() === q.answer.trim();
  }
  if (q.type === "fill") {
    const candidates = [q.answer, ...(q.accepted || [])].map(normalizeText);
    return candidates.includes(normalizeText(answer));
  }
  if (q.type === "multi") {
    const want = q.answer.split(";;").map((s) => s.trim()).sort().join("|");
    const got = answer.split(";;").map((s) => s.trim()).sort().join("|");
    return want === got;
  }
  if (q.type === "order") {
    const want = q.answer.split(";;").map((s) => s.trim()).join("|");
    const got = answer.split(";;").map((s) => s.trim()).join("|");
    return want === got;
  }
  return false;
}

export function xpFor(q: Question): number {
  return Math.round(q.diff * 10 + (q.dok - 1) * 4);
}

export function xpForOpen(): number {
  return 20;
}

// ------------------ results ------------------

function weightedAccuracy(section: SkillSectionState, isCorrect: (qid: string) => boolean): number {
  let weight = 0;
  let correctWeight = 0;
  for (const id of section.askedIds) {
    const q = getQuestion(id);
    if (!q) continue;
    weight += q.diff;
    if (isCorrect(id)) correctWeight += q.diff;
  }
  return weight > 0 ? correctWeight / weight : 0;
}

export interface OutcomeLog {
  qid: string;
  correct: boolean;
  awardedXp: number;
  answer: string;
  openText?: string;
}

export function scoreAttempt(
  state: EngineState,
  log: OutcomeLog[]
): { skills: SkillResult[]; overallLevel: number; overallRounded: number; fluencyPct: number; xpEarned: number; correctCount: number; totalCount: number } {
  const correctMap = new Map<string, boolean>();
  for (const o of log) correctMap.set(o.qid, o.correct);
  const isCorrect = (qid: string) => correctMap.get(qid) === true;

  const skills: SkillResult[] = [];
  for (const skill of state.order) {
    const section = state.sections[skill];
    const asked = section.askedIds.length;
    let correct = 0;
    for (const id of section.askedIds) {
      if (isCorrect(id)) correct += 1;
    }
    const levelsChart: SkillResult["levelsChart"] = [];
    for (const key of Object.keys(section.tallies).map(Number).sort((a, b) => a - b)) {
      const t = section.tallies[key];
      levelsChart.push({
        level: t.level,
        asked: t.asked,
        correct: t.correct,
        pct: t.asked > 0 ? Math.round((t.correct / t.asked) * 100) : 0,
      });
    }

    // Placement: the highest level demonstrated with >= 70 percent mastery (>= 2 questions).
    let placement = 0;
    for (const lv of levelsChart.map((l) => l.level).sort((a, b) => a - b)) {
      const t = section.tallies[lv];
      if (t.asked >= 2 && t.correct / t.asked >= 0.7) placement = Math.max(placement, lv);
    }
    if (levelsChart.length > 0 && placement === 0) {
      // No level reached 70 percent: place at the best partially-mastered level.
      const best = levelsChart.reduce((a, b) => (b.correct / b.asked >= a.correct / a.asked ? b : a));
      placement = best.pct >= 40 ? best.level : Math.max(0, best.level - 1);
    }

    const acc = weightedAccuracy(section, isCorrect);
    const fraction = Math.max(0, Math.min(0.99, (acc - 0.4) / 0.6)) * 0.9;
    const continuous = Math.min(8, placement + fraction);

    // Confidence: how much evidence backs this placement.
    const placedTally = section.tallies[placement];
    const placedPct = placedTally && placedTally.asked > 0 ? placedTally.correct / placedTally.asked : 0;
    const confidence: Confidence =
      asked >= 6 && placedPct >= 0.5 ? "high" : asked >= 4 ? "medium" : "low";

    // Strong / weak topic
    const topics: { topic: string; ok: boolean }[] = [];
    for (const id of section.askedIds) {
      const q = getQuestion(id);
      if (!q) continue;
      topics.push({ topic: `${q.topic} (L${q.level} U${q.unit})`, ok: isCorrect(id) });
    }
    const strongTopic = topics.find((t) => t.ok)?.topic;
    const weakTopic = topics.find((t) => !t.ok)?.topic;

    skills.push({
      skill,
      correct,
      asked,
      accuracy: Math.round(acc * 100) / 100,
      placement,
      continuous: Math.round(continuous * 10) / 10,
      confidence,
      levelsChart,
      strongTopic,
      weakTopic,
      source: "system",
    });
  }

  const overallLevel =
    skills.length > 1
      ? Math.round((skills.reduce((s, r) => s + r.continuous, 0) / skills.length) * 10) / 10
      : skills[0]?.continuous || 0;
  const overallRounded = Math.round(overallLevel);
  const fluencyPct = Math.round(overallLevel * 10);
  const xpEarned = log.reduce((s, o) => s + o.awardedXp, 0);
  const correctCount = log.filter((o) => o.correct).length;
  const totalCount = log.length;

  return { skills, overallLevel, overallRounded, fluencyPct, xpEarned, correctCount, totalCount };
}

const BANDS = [
  { code: "EXCELLENT", min: 90, label: "Excellent", message: "Outstanding work! You have mastered this range. Talk to your teacher about moving up to the next level - you are ready." },
  { code: "VERY_GOOD", min: 80, label: "Very Good", message: "Very strong result! Polish the one or two flagged topics and you will move up at full strength." },
  { code: "GOOD", min: 70, label: "Good", message: "A solid pass. Revise the recommended lessons below, then take the next step with confidence." },
  { code: "REVISE", min: 60, label: "Needs Revision", message: "You are close. Revise the recommended unit and lessons, then retake this diagnostic to confirm your level." },
  { code: "REPEAT", min: 0, label: "Repeat the Level", message: "Every hero retries the quest! Repeat this level's key units with your teacher, then retake the diagnostic. You will get there." },
];

export function bandFor(accuracyPct: number) {
  return BANDS.find((b) => accuracyPct >= b.min) || BANDS[BANDS.length - 1];
}

export function buildResult(
  state: EngineState,
  log: OutcomeLog[],
  badges: string[] = []
): AttemptResult {
  const s = scoreAttempt(state, log);
  const accuracyPct = s.totalCount > 0 ? Math.round((s.correctCount / s.totalCount) * 100) : 0;
  const band = bandFor(accuracyPct);

  // Start point: weakest pillar's placement level, first unit with an error.
  const primary =
    s.skills.length > 1
      ? [...s.skills].sort((a, b) => a.continuous - b.continuous)[0]
      : s.skills[0];
  let startUnit: AttemptResult["startUnit"] = null;
  if (primary) {
    const section = state.sections[primary.skill];
    const targetLevel = primary.placement;
    const tally = section.tallies[targetLevel];
    if (tally && tally.firstWrongLesson) {
      startUnit = {
        level: targetLevel,
        unit: tally.firstWrongLesson.unit,
        unitTitle: tally.firstWrongLesson.unitTitle,
        lesson: tally.firstWrongLesson.lesson,
        lessonTitle: tally.firstWrongLesson.lessonTitle,
      };
    } else if (tally && tally.units.length > 0) {
      const pool = gradablePoolFor(targetLevel, primary.skill);
      const firstQ = pool.find((p) => p.unit === tally.units[0]);
      startUnit = {
        level: targetLevel,
        unit: tally.units[0],
        unitTitle: firstQ?.unitTitle || "",
        lesson: firstQ?.lesson || 1,
        lessonTitle: firstQ?.lessonTitle || "",
      };
    }
  }

  const startMeta = LEVEL_META[Math.min(8, Math.max(0, startUnit ? startUnit.level : Math.round(s.overallLevel)))];
  const startRef = startUnit
    ? `${startMeta.name} - Unit ${startUnit.unit}: ${startUnit.unitTitle} - start from Lesson ${startUnit.lesson}: ${startUnit.lessonTitle}`
    : `${startMeta.name} - start from the beginning of the level`;

  const perQuestion = log.map((o) => {
    const q = getQuestion(o.qid)!;
    return {
      qid: o.qid,
      skill: q.skill,
      level: q.level,
      unit: q.unit,
      unitTitle: q.unitTitle,
      lesson: q.lesson,
      lessonTitle: q.lessonTitle,
      topic: q.topic,
      correct: o.correct,
      awardedXp: o.awardedXp,
      bloom: q.bloom,
      dok: q.dok,
      solo: q.solo,
      marzano: q.marzano,
      ubd: q.ubd,
      udl: q.udl,
      type: q.type,
      open: q.type === "open",
    };
  });

  return {
    mode: state.mode,
    skills: s.skills,
    overallLevel: s.overallLevel,
    overallRounded: s.overallRounded,
    fluencyPct: s.fluencyPct,
    provisional: true, // until the live speaking interview is merged in
    band,
    startRef,
    startUnit,
    xpEarned: s.xpEarned,
    correctCount: s.correctCount,
    totalCount: s.totalCount,
    perQuestion,
    badges,
  };
}

/** Public (safe) question shape for the client - never leaks the answer. */
export function publicQuestion(qid: string) {
  const q = getQuestion(qid);
  if (!q) return null;
  return {
    id: q.id,
    skill: q.skill,
    level: q.level,
    unit: q.unit,
    unitTitle: q.unitTitle,
    lesson: q.lesson,
    lessonTitle: q.lessonTitle,
    topic: q.topic,
    type: q.type,
    prompt: q.prompt,
    passage: q.passage,
    visual: q.visual,
    audioText: q.audioText,
    speakerLines: q.speakerLines,
    options: q.options,
    orderTokens: q.orderTokens,
    open: q.type === "open",
  };
}

export { SECTION_LABELS as SKILL_SECTION_LABELS };
