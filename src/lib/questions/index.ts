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

export * from "./types";

export const BOOKS: LevelBook[] = [L0, L1, L2, L3, L4, L5, L6, L7, L8];

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

export function openTaskFor(level: number): Question | undefined {
  return poolFor(level, "writing").find((q) => q.type === "open");
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
