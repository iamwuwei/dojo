import { parse } from "yaml";
import type { VocabularyQuestion } from "../types";

interface YamlEntry {
  word: string;
  reading: string;
  meaning: string;
  level?: string;
}

// Build VocabularyQuestion[] from a raw YAML file.
// Each word becomes a single "meaning" quiz with 3 distractor meanings
// drawn from the same level pool.
export function buildVocabFromYaml(
  rawYaml: string,
  idPrefix: string
): VocabularyQuestion[] {
  const parsed = parse(rawYaml) as { vocabulary?: YamlEntry[] };
  const entries = parsed.vocabulary ?? [];

  // Deduped meaning pool for distractor selection.
  const meaningPool = Array.from(new Set(entries.map((e) => e.meaning)));

  return entries.map((e, idx) => {
    const id = `${idPrefix}${String(idx + 1).padStart(3, "0")}`;
    const distractors = pickDistractors(meaningPool, e.meaning, 3);
    const answerPos = Math.floor(Math.random() * 4);
    const options = [...distractors];
    options.splice(answerPos, 0, e.meaning);

    return {
      id,
      type: "vocabulary" as const,
      word: e.word,
      reading: e.reading,
      question: `「${e.word}」の意味は？`,
      options,
      answer: answerPos,
      explanation: `「${e.word}」（${e.reading}）：${e.meaning}`,
    };
  });
}

function pickDistractors(
  pool: string[],
  exclude: string,
  count: number
): string[] {
  const candidates = pool.filter((m) => m !== exclude);
  const picked: string[] = [];
  while (picked.length < count && picked.length < candidates.length) {
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    if (!picked.includes(choice)) picked.push(choice);
  }
  // Pad with placeholders if the pool is somehow too small (shouldn't
  // happen with 500+ words, but keeps the type guarantee of 4 options).
  while (picked.length < count) picked.push("—");
  return picked;
}
