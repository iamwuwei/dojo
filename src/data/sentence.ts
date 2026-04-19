import type { SentenceMatchQuestion } from "../types";
import { n4n5SentenceQuestions } from "./n4n5-sentence-questions";
import type { JlptLevel } from "./grammar";

// Add new levels by dropping a new file (e.g. n3-sentence-questions.ts)
// and wiring it in here.
export const sentenceByLevel: Record<JlptLevel, SentenceMatchQuestion[]> = {
  "N5-N4": n4n5SentenceQuestions,
  N3: [],
  N2: [],
  N1: [],
};

export const sentenceQuestions: SentenceMatchQuestion[] = Object.values(
  sentenceByLevel
).flat();
