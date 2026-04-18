import type { GrammarQuestion } from "../types";
import { n4n5GrammarQuestions } from "./n4n5-grammar-questions";

export type JlptLevel = "N5-N4" | "N3" | "N2" | "N1";

// Add new levels by dropping a new file (e.g. n3-grammar-questions.ts)
// and wiring it in here.
export const grammarByLevel: Record<JlptLevel, GrammarQuestion[]> = {
  "N5-N4": n4n5GrammarQuestions,
  N3: [],
  N2: [],
  N1: [],
};

export const grammarQuestions: GrammarQuestion[] = Object.values(
  grammarByLevel
).flat();
