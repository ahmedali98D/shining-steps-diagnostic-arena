// Shared types for the Shining Steps question bank.
// Every question is anchored to a real unit and lesson of the Shining Steps books (L0-L8).

export type Skill = "listening" | "speaking" | "reading" | "writing";

export type QType = "mcq" | "multi" | "fill" | "order" | "truefalse" | "open";

export type Bloom = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
export type Solo = "Unistructural" | "Multistructural" | "Relational" | "Extended Abstract";
export type Marzano = "Retrieval" | "Comprehension" | "Analysis" | "Knowledge Utilization";
export type UbdFacet = "Explain" | "Interpret" | "Apply" | "Perspective" | "Empathize" | "Self-Knowledge";
export type Udl = "Representation" | "Action and Expression" | "Engagement";

export interface SpeakerLine {
  speaker: string;
  line: string;
}

// UDL representation layer: the picture shown next to a question so students
// can listen AND look. Two render paths:
//  - svg: fully vector visuals (town maps, maze, clock, night-sky star count,
//    frequency calendars) drawn in code so geometry stays exact.
//  - structured data (src / tiles / items): illustrated assets rendered by the
//    runner as responsive HTML (scenes, picture strips, menu and price cards,
//    shop shelves).
export interface QTile {
  src?: string; // illustration image
  label?: string;
  glyph?: "apple" | "book" | "cat" | "egg" | "ball" | "note" | "palette" | "snow";
}

export interface QCardRow {
  group?: string; // section header, e.g. STARTERS
  name?: string;
  price?: string;
  src?: string;
  badge?: string; // e.g. SALE
}

export interface QVisual {
  kind: "map" | "maze" | "scene" | "strip" | "clock" | "card" | "shelf" | "sky" | "chart";
  alt: string;
  svg?: string;
  src?: string; // scene image
  ar?: number; // aspect ratio (w/h) for scene images
  title?: string; // card / shelf title
  tiles?: QTile[]; // picture strip tiles
  items?: QCardRow[]; // card rows / shelf products
}

export interface Question {
  id: string;
  skill: Skill;
  level: number; // 0..8
  unit: number; // 1-based unit number in the book
  unitTitle: string;
  lesson: number; // lesson number inside that unit
  lessonTitle: string;
  topic: string;
  type: QType;
  prompt: string;
  passage?: string;
  visual?: QVisual;
  audioText?: string; // single-voice listening script (spoken via TTS)
  speakerLines?: SpeakerLine[]; // multi-voice listening script
  options?: string[];
  answer: string; // mcq/truefalse: the correct option; multi: ";;"-joined; fill: canonical; order: ";;"-joined tokens
  accepted?: string[]; // fill: alternative accepted answers
  orderTokens?: string[]; // order: display order (shuffled)
  explain: string; // why the correct answer is right
  wrongNotes?: Record<string, string>; // why a given wrong option fails
  bloom: Bloom;
  dok: 1 | 2 | 3 | 4;
  solo: Solo;
  marzano: Marzano;
  ubd: UbdFacet;
  udl: Udl;
  diff: 1 | 2 | 3;
}

export interface LevelBook {
  level: number;
  name: string;
  cefr: string;
  bookTitle: string;
  units: { n: number; title: string }[];
  questions: Question[];
}

export const SKILLS: Skill[] = ["reading", "listening", "writing", "speaking"];

export const SKILL_META: Record<Skill, { label: string; color: string; soft: string; icon: string; blurb: string }> = {
  reading: { label: "Reading", color: "#15857A", soft: "#E4F2EE", icon: "menu_book", blurb: "Texts, stories and real-life documents" },
  listening: { label: "Listening", color: "#E8A200", soft: "#FFF3D6", icon: "headphones", blurb: "Voices, dialogues and announcements" },
  writing: { label: "Writing", color: "#FF6A3B", soft: "#FFEAE2", icon: "edit_note", blurb: "Sentences, emails and stories" },
  speaking: { label: "Speaking", color: "#6B4FA0", soft: "#EFE9F7", icon: "record_voice_over", blurb: "Talks, replies and conversations" },
};

export const LEVEL_META: Record<number, { cefr: string; name: string; bookTitle: string }> = {
  0: { cefr: "Pre-A1", name: "Level 0 - Starter", bookTitle: "My First English Book" },
  1: { cefr: "A1", name: "Level 1 - Elementary I", bookTitle: "My Days, My Home, My Food" },
  2: { cefr: "A1+", name: "Level 2 - Elementary II", bookTitle: "My Town, My Shopping, My Week" },
  3: { cefr: "A2", name: "Level 3 - Pre-Intermediate", bookTitle: "My Life, My Town, My Work" },
  4: { cefr: "A2+", name: "Level 4 - Pre-Intermediate II", bookTitle: "My Past, My Trips, My Plans" },
  5: { cefr: "B1", name: "Level 5 - Intermediate", bookTitle: "My Stories, My Voice, My World" },
  6: { cefr: "B1+", name: "Level 6 - Intermediate II", bookTitle: "My Case, My News, My Community" },
  7: { cefr: "B2", name: "Level 7 - Upper-Intermediate", bookTitle: "My View, My Evidence, My World" },
  8: { cefr: "B2+", name: "Level 8 - Upper-Intermediate II", bookTitle: "My Voice, My Craft, My Future" },
};
