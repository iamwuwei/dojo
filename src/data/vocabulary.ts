import type { VocabularyQuestion } from "../types";
import { n5VocabularyQuestions } from "./n5-vocabulary-questions";
import { n4VocabularyQuestions } from "./n4-vocabulary-questions";
import { n3VocabularyQuestions } from "./n3-vocabulary-questions";

// Finer-grained than JlptLevel used by grammar/sentence (which still bundles
// N5+N4). Vocabulary gets its own level bucket per JLPT tier.
export type VocabLevel = "N5" | "N4" | "N3";

export const VOCAB_LEVELS: VocabLevel[] = ["N5", "N4", "N3"];

// Each question id is prefixed (n5-v-###, n4-v-###, n3-v-###) so mastery
// progress can be bucketed by level via id inspection without a lookup.
export const vocabularyByLevel: Record<VocabLevel, VocabularyQuestion[]> = {
  N5: n5VocabularyQuestions,
  N4: n4VocabularyQuestions,
  N3: n3VocabularyQuestions,
};

export const vocabularyQuestions: VocabularyQuestion[] = Object.values(
  vocabularyByLevel
).flat();

// Match by level prefix only — N3 has multiple sub-prefixes (n3-v-,
// n3-vv-, n3-vn-) for handcrafted / verbs / nouns batches.
export function levelOfVocabId(id: string): VocabLevel | null {
  if (id.startsWith("n5-")) return "N5";
  if (id.startsWith("n4-")) return "N4";
  if (id.startsWith("n3-")) return "N3";
  return null;
}
