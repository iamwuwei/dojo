import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuizType, GameMode, MistakeEntry, AnyQuestion } from "../types";

export type Screen =
  | "home"
  | "playing"
  | "result"
  | "mistakes";

interface GameState {
  // Navigation
  screen: Screen;
  quizType: QuizType | null;
  mode: GameMode | null;

  // In-game stats
  score: number;
  combo: number;
  maxCombo: number;
  correct: number;
  wrong: number;

  // Mistake book (persisted)
  mistakes: MistakeEntry[];

  // Actions
  goHome: () => void;
  startQuiz: (type: QuizType, mode: GameMode) => void;
  endQuiz: () => void;
  openMistakes: () => void;

  addCorrect: (points: number) => void;
  addWrong: (question: AnyQuestion, userAnswer: string) => void;

  clearMistakes: () => void;
  removeMistake: (id: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: "home",
      quizType: null,
      mode: null,
      score: 0,
      combo: 0,
      maxCombo: 0,
      correct: 0,
      wrong: 0,
      mistakes: [],

      goHome: () =>
        set({
          screen: "home",
          quizType: null,
          mode: null,
          score: 0,
          combo: 0,
          maxCombo: 0,
          correct: 0,
          wrong: 0,
        }),

      startQuiz: (type, mode) =>
        set({
          screen: "playing",
          quizType: type,
          mode,
          score: 0,
          combo: 0,
          maxCombo: 0,
          correct: 0,
          wrong: 0,
        }),

      endQuiz: () => set({ screen: "result" }),

      openMistakes: () => set({ screen: "mistakes" }),

      addCorrect: (points) => {
        const newCombo = get().combo + 1;
        set({
          score: get().score + points,
          combo: newCombo,
          maxCombo: Math.max(get().maxCombo, newCombo),
          correct: get().correct + 1,
        });
      },

      addWrong: (question, userAnswer) => {
        const existing = get().mistakes.find((m) => m.question.id === question.id);
        set({
          combo: 0,
          wrong: get().wrong + 1,
          mistakes: existing
            ? get().mistakes.map((m) =>
                m.question.id === question.id
                  ? { ...m, userAnswer, timestamp: Date.now() }
                  : m
              )
            : [
                ...get().mistakes,
                { question, userAnswer, timestamp: Date.now() },
              ],
        });
      },

      clearMistakes: () => set({ mistakes: [] }),
      removeMistake: (id) =>
        set({ mistakes: get().mistakes.filter((m) => m.question.id !== id) }),
    }),
    {
      name: "n3-dojo-storage",
      partialize: (state) => ({ mistakes: state.mistakes }),
    }
  )
);
