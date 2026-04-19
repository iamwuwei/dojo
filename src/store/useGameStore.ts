import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabaseClient";
import type { QuizType, GameMode, MistakeEntry, AnyQuestion } from "../types";
import type { VocabLevel } from "../data/vocabulary";

export type Screen = "home" | "playing" | "result" | "mistakes" | "vocabLevel";

// "all" means no level filter; otherwise a specific JLPT tier.
export type VocabLevelChoice = "all" | VocabLevel;

export interface AuthUser {
  id: string;
  email: string;
}

// Mastery is tracked per game mode so finishing one mode doesn't drain
// the other. Each mode has its own questionId → consecutive-ish correct count.
export type MasteryByMode = Record<GameMode, Record<string, number>>;

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

  // Per-mode mastery: count >= MASTERY_THRESHOLD means the question stops
  // appearing IN THAT MODE. A wrong answer decrements by 1 (floor 0), so
  // one slip doesn't undo it.
  correctCounts: MasteryByMode;

  // User's last picked vocabulary level (persisted so it sticks across visits).
  vocabLevel: VocabLevelChoice;

  // Auth state
  user: AuthUser | null;
  authLoading: boolean;

  // Actions
  goHome: () => void;
  startQuiz: (type: QuizType, mode: GameMode) => void;
  endQuiz: () => void;
  openMistakes: () => void;
  openVocabLevelPicker: () => void;
  setVocabLevel: (level: VocabLevelChoice) => void;

  addCorrect: (points: number, questionId?: string) => void;
  addWrong: (question: AnyQuestion, userAnswer: string) => Promise<void>;

  clearMistakes: () => Promise<void>;
  removeMistake: (id: string) => Promise<void>;

  isMastered: (questionId: string) => boolean;
  resetMastery: () => Promise<void>;

  signUp: (email: string, password: string) => Promise<string | undefined>;
  signIn: (email: string, password: string) => Promise<string | undefined>;
  signOut: () => Promise<string | undefined>;
  loadUser: () => Promise<void>;
  loadMistakesRemote: () => Promise<void>;
  saveMistakesRemote: () => Promise<void>;
  loadMasteryRemote: () => Promise<void>;
  saveMasteryRemote: () => Promise<void>;
}

export const MASTERY_THRESHOLD = 3;

const EMPTY_MASTERY: MasteryByMode = { combo: {}, timed: {} };

// Accept either the legacy flat shape ({ id: count }) or the new
// per-mode shape ({ combo: { id: count }, timed: { id: count } }).
// Legacy flat data is treated as combo-mode progress.
function normalizeMastery(raw: unknown): MasteryByMode {
  if (!raw || typeof raw !== "object") return { combo: {}, timed: {} };
  const obj = raw as Record<string, unknown>;
  const values = Object.values(obj);
  const isFlat = values.length > 0 && values.every((v) => typeof v === "number");
  if (isFlat) {
    return { combo: obj as Record<string, number>, timed: {} };
  }
  return {
    combo: (obj.combo as Record<string, number>) ?? {},
    timed: (obj.timed as Record<string, number>) ?? {},
  };
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
      correctCounts: EMPTY_MASTERY,
      vocabLevel: "all",
      user: null,
      authLoading: true,

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

      openVocabLevelPicker: () => set({ screen: "vocabLevel" }),

      setVocabLevel: (level) => set({ vocabLevel: level }),

      addCorrect: (points, questionId) => {
        const newCombo = get().combo + 1;
        const updates: Partial<GameState> = {
          score: get().score + points,
          combo: newCombo,
          maxCombo: Math.max(get().maxCombo, newCombo),
          correct: get().correct + 1,
        };
        if (questionId) {
          const mode: GameMode = get().mode ?? "combo";
          const modeCounts = get().correctCounts[mode];
          updates.correctCounts = {
            ...get().correctCounts,
            [mode]: {
              ...modeCounts,
              [questionId]: (modeCounts[questionId] ?? 0) + 1,
            },
          };
        }
        set(updates);
        if (questionId) {
          void get().saveMasteryRemote();
        }
      },

      addWrong: async (question, userAnswer) => {
        const existing = get().mistakes.find((m) => m.question.id === question.id);
        const mode: GameMode = get().mode ?? "combo";
        const modeCounts = get().correctCounts[mode];
        const prevCount = modeCounts[question.id] ?? 0;
        const nextModeCounts = { ...modeCounts };
        if (prevCount > 0) {
          nextModeCounts[question.id] = prevCount - 1;
        }
        set({
          combo: 0,
          wrong: get().wrong + 1,
          correctCounts: {
            ...get().correctCounts,
            [mode]: nextModeCounts,
          },
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
        await get().saveMistakesRemote();
        if (prevCount > 0) {
          await get().saveMasteryRemote();
        }
      },

      isMastered: (questionId) => {
        const mode: GameMode = get().mode ?? "combo";
        return (get().correctCounts[mode][questionId] ?? 0) >= MASTERY_THRESHOLD;
      },

      resetMastery: async () => {
        set({ correctCounts: { combo: {}, timed: {} } });
        await get().saveMasteryRemote();
      },

      clearMistakes: async () => {
        set({ mistakes: [] });
        await get().saveMistakesRemote();
      },

      removeMistake: async (id) => {
        set({ mistakes: get().mistakes.filter((m) => m.question.id !== id) });
        await get().saveMistakesRemote();
      },

      signUp: async (email, password) => {
        set({ authLoading: true });
        const { data, error } = await supabase.auth.signUp({ email, password });
        set({ authLoading: false });
        if (error) return error.message;

        if (data?.user) {
          set({ user: { id: data.user.id, email: data.user.email ?? "" } });
          await Promise.all([
            get().loadMistakesRemote(),
            get().loadMasteryRemote(),
          ]);
        }

        return undefined;
      },

      signIn: async (email, password) => {
        set({ authLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        set({ authLoading: false });
        if (error) return error.message;

        if (data?.user) {
          set({ user: { id: data.user.id, email: data.user.email ?? "" } });
          await Promise.all([
            get().loadMistakesRemote(),
            get().loadMasteryRemote(),
          ]);
        }

        return undefined;
      },

      signOut: async () => {
        set({ authLoading: true });
        const { error } = await supabase.auth.signOut();
        set({ authLoading: false, user: null });
        if (error) return error.message;
        return undefined;
      },

      loadUser: async () => {
        set({ authLoading: true });
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session?.user) {
          set({ authLoading: false, user: null });
          return;
        }

        const user = data.session.user;
        set({ user: { id: user.id, email: user.email ?? "" }, authLoading: false });
        await Promise.all([
          get().loadMistakesRemote(),
          get().loadMasteryRemote(),
        ]);
      },

      loadMistakesRemote: async () => {
        const user = get().user;
        if (!user) return;

        const { data, error } = await supabase
          .from("user_mistakes")
          .select("mistakes")
          .eq("user_id", user.id)
          .single();

        if (!error && data?.mistakes) {
          set({ mistakes: data.mistakes });
          return;
        }

        if (get().mistakes.length > 0) {
          await get().saveMistakesRemote();
        }
      },

      saveMistakesRemote: async () => {
        const user = get().user;
        if (!user) return;

        const { error } = await supabase.from("user_mistakes").upsert({
          user_id: user.id,
          mistakes: get().mistakes,
        });

        if (error) {
          console.warn("Supabase mistake sync failed:", error.message);
        }
      },

      loadMasteryRemote: async () => {
        const user = get().user;
        if (!user) return;

        const { data, error } = await supabase
          .from("user_mastery")
          .select("mastery")
          .eq("user_id", user.id)
          .single();

        if (!error && data?.mastery) {
          set({ correctCounts: normalizeMastery(data.mastery) });
          return;
        }

        const local = get().correctCounts;
        if (
          Object.keys(local.combo).length > 0 ||
          Object.keys(local.timed).length > 0
        ) {
          await get().saveMasteryRemote();
        }
      },

      saveMasteryRemote: async () => {
        const user = get().user;
        if (!user) return;

        const { error } = await supabase.from("user_mastery").upsert({
          user_id: user.id,
          mastery: get().correctCounts,
        });

        if (error) {
          console.warn("Supabase mastery sync failed:", error.message);
        }
      },
    }),
    {
      name: "n3-dojo-storage",
      partialize: (state) => ({
        mistakes: state.mistakes,
        correctCounts: state.correctCounts,
        vocabLevel: state.vocabLevel,
      }),
      // Migrate legacy flat correctCounts shape rehydrated from localStorage.
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.correctCounts = normalizeMastery(state.correctCounts);
        }
      },
    }
  )
);
