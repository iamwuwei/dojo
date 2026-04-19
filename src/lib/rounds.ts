import type { QuizType } from "../types";

export const TOTAL_ROUNDS = 3;

export interface RoundConfig {
  questionsPerRound: number;
  // Index = round number - 1 (so [R1, R2, R3]). Seconds.
  durations: [number, number, number];
  // Fraction of correct answers required to clear the round.
  passRatio: number;
}

export const ROUND_CONFIGS: Record<QuizType, RoundConfig> = {
  vocabulary: {
    questionsPerRound: 10,
    durations: [45, 35, 25],
    passRatio: 0.7,
  },
  grammar: {
    questionsPerRound: 10,
    durations: [45, 35, 25],
    passRatio: 0.7,
  },
  flashcard: {
    questionsPerRound: 10,
    durations: [30, 22, 15],
    passRatio: 0.7,
  },
  sentence: {
    questionsPerRound: 3,
    durations: [60, 45, 30],
    passRatio: 0.66, // 2 of 3
  },
};

export function durationFor(config: RoundConfig, roundIdx: number): number {
  return config.durations[Math.min(roundIdx, config.durations.length - 1)];
}

// Returns true when the user has cleared the round given the round config.
export function passed(config: RoundConfig, correct: number, total: number): boolean {
  if (total === 0) return false;
  return correct / total >= config.passRatio;
}

// Returns the minimum question pool size needed to run all rounds without
// repeating a question. Caller should bail out (or warn) if their filtered
// pool is smaller than this.
export function minPoolSize(config: RoundConfig): number {
  return config.questionsPerRound * TOTAL_ROUNDS;
}

// Slice the shuffled pool into per-round queues.
// pool[0..n-1] = round 1, pool[n..2n-1] = round 2, etc.
export function sliceRoundQueue<T>(
  pool: T[],
  config: RoundConfig,
  roundIdx: number
): T[] {
  const start = roundIdx * config.questionsPerRound;
  return pool.slice(start, start + config.questionsPerRound);
}
