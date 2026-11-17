// Speaking placement helpers: rubric scoring + merging the teacher's live interview
// result into digital attempts (the fourth pillar completes the overall placement).

import { AttemptResult, SkillResult } from "./diagnostic";
import { CRITERIA } from "./interviewKits";

export interface CriteriaScores {
  fluency: number;
  pronunciation: number;
  vocabulary: number;
  grammarAccuracy: number;
  comprehension: number;
  conversation: number;
}

export interface SpeakingRecord {
  level: number;
  kitLevel: number;
  criteria: CriteriaScores;
  notes: string;
  teacherName: string;
  createdAt: string;
}

export function clampCriterion(n: number): number {
  return Math.max(0, Math.min(4, Math.round(n)));
}

/** The rubric maps the six criteria (0-4) onto the 0-8 ladder: average x 2. */
export function deriveSpeakingLevel(criteria: CriteriaScores): number {
  const sum = CRITERIA.reduce((s, c) => s + clampCriterion(criteria[c.key]), 0);
  const avg = sum / CRITERIA.length;
  return Math.round(avg * 2 * 10) / 10; // 0..8, one decimal
}

export function speakingLevelToPlacement(level: number): number {
  return Math.max(0, Math.min(8, Math.round(level)));
}

/** Merge a live speaking assessment into a stored attempt result and recompute the overall picture. */
export function applySpeaking(result: AttemptResult | null, speaking: SpeakingRecord | null): AttemptResult | null {
  if (!result) return null;
  const skills: SkillResult[] = [...result.skills];

  if (speaking) {
    const idx = skills.findIndex((s) => s.skill === "speaking");
    const merged: SkillResult = {
      skill: "speaking",
      correct: 0,
      asked: 0,
      accuracy: speaking.level / 8,
      placement: speakingLevelToPlacement(speaking.level),
      continuous: speaking.level,
      confidence: "high",
      levelsChart: [],
      source: "teacher",
      criteria: speaking.criteria as unknown as Record<string, number>,
      assessedBy: speaking.teacherName,
      assessedAt: speaking.createdAt,
    };
    if (idx >= 0) skills[idx] = merged;
    else skills.push(merged);

    const overallLevel =
      Math.round((skills.reduce((s, r) => s + r.continuous, 0) / skills.length) * 10) / 10;
    return {
      ...result,
      skills,
      overallLevel,
      overallRounded: Math.round(overallLevel),
      fluencyPct: Math.round(overallLevel * 10),
      provisional: false,
    };
  }

  // No live assessment yet: mark speaking explicitly pending and keep the overall provisional.
  const idx = skills.findIndex((s) => s.skill === "speaking");
  const pending: SkillResult = {
    skill: "speaking",
    correct: 0,
    asked: 0,
    accuracy: 0,
    placement: 0,
    continuous: 0,
    confidence: "low",
    levelsChart: [],
    source: "teacher",
  };
  if (idx >= 0) skills[idx] = pending;
  return { ...result, skills, provisional: true };
}
