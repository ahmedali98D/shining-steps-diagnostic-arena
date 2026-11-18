import { Question, LevelBook, Skill, SKILLS } from "./types";
import { visualFor, extraQuestionsForLevel } from "./visual_map";
import L0 from "./level_0";
import L1 from "./level_1";
import L2 from "./level_2";
import L3 from "./level_3";
import L4 from "./level_4";
import L5 from "./level_5";
import L6 from "./level_6";
import L7 from "./level_7";
import L8 from "./level_8";
import XA from "./expansion_a";
import XB from "./expansion_b";
import XC from "./expansion_c";
import XD from "./expansion_d";
import XE from "./expansion_e";
import XF from "./expansion_f";

export * from "./types";

export const BOOKS: LevelBook[] = [L0, L1, L2, L3, L4, L5, L6, L7, L8];

// Expansion items join their level book so every pool, tally and result view
// sees one merged bank per level.
const EXPANSION: Question[] = [...XA, ...XB, ...XC, ...XD, ...XE, ...XF];
for (const q of EXPANSION) {
  const book = BOOKS[Math.max(0, Math.min(8, q.level))];
  book.questions.push(q);
}

// Enrich the bank before indexing: attach UDL visuals to existing items and
// merge the multimodal audio+picture questions into their level books.
for (const book of BOOKS) {
  for (const q of book.questions) {
    const v = visualFor(q.id);
    if (v && !q.visual) q.visual = v;
  }
  for (const q of extraQuestionsForLevel(book.level)) {
    book.questions.push(q);
  }
}

const byId = new Map<string, Question>();
const poolByLevelSkill = new Map<string, Question[]>();

for (const book of BOOKS) {
  for (const q of book.questions) {
    byId.set(q.id, q);
    const key = `${q.level}:${q.skill}`;
    const arr = poolByLevelSkill.get(key) || [];
    arr.push(q);
    poolByLevelSkill.set(key, arr);
  }
}

export function getQuestion(id: string): Question | undefined {
  return byId.get(id);
}

export function poolFor(level: number, skill: Skill): Question[] {
  return poolByLevelSkill.get(`${level}:${skill}`) || [];
}

/** Auto-gradable pool (open tasks are never part of the adaptive walk). */
export function gradablePoolFor(level: number, skill: Skill): Question[] {
  return poolFor(level, skill).filter((q) => q.type !== "open");
}

export function openTaskFor(level: number, variant = 0): Question | undefined {
  const tasks = poolFor(level, "writing").filter((q) => q.type === "open");
  if (tasks.length === 0) return undefined;
  // Chart, diagram and map tasks lead, so the exam ladder visibly ends with
  // data writing at the upper levels; the cycling keeps retakes varied.
  const ordered = [...tasks.filter((t) => t.visual), ...tasks.filter((t) => !t.visual)];
  return ordered[((variant % ordered.length) + ordered.length) % ordered.length];
}

export function openTaskCount(level: number): number {
  return poolFor(level, "writing").filter((q) => q.type === "open").length;
}

export function allQuestions(): Question[] {
  return Array.from(byId.values());
}

export function bankStats() {
  const total = byId.size;
  const perSkill: Record<Skill, number> = { reading: 0, listening: 0, writing: 0, speaking: 0 };
  let auto = 0;
  let open = 0;
  for (const q of byId.values()) {
    perSkill[q.skill] += 1;
    if (q.type === "open") open += 1;
    else auto += 1;
  }
  return { total, auto, open, perSkill, levels: BOOKS.length };
}

export { SKILLS };
