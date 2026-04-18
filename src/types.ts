export type QuizType = "vocabulary" | "grammar" | "sentence" | "flashcard";
export type GameMode = "combo" | "timed";
export type DogMood =
  | "idle"
  | "happy"
  | "sad"
  | "excited"
  | "sleepy"
  | "thinking"
  | "proud"
  | "shy";

export interface VocabularyQuestion {
  id: string;
  type: "vocabulary";
  word: string;
  reading: string;
  question: string; // e.g. "「旅行」の読み方は？"
  options: string[];
  answer: number; // index of correct option
  explanation?: string;
}

export interface GrammarQuestion {
  id: string;
  type: "grammar";
  sentence: string; // with "___" placeholder
  options: string[];
  answer: number;
  translation: string;
  explanation?: string;
}

export interface SentenceMatchQuestion {
  id: string;
  type: "sentence";
  prompt: string; // 句型提示，例：「〜ようとする」
  lefts: string[]; // 左側：句子前半段
  rights: string[]; // 右側：句子後半段（打亂順序）
  pairs: Array<[number, number]>; // 正確配對：[left_index, right_index_in_rights_array]
  translations: string[]; // 完整句子翻譯
}

export interface FlashcardItem {
  id: string;
  type: "flashcard";
  front: string; // 日文（漢字或假名）
  reading?: string; // 讀音
  back: string; // 中文意思
  example?: string;
}

export type AnyQuestion =
  | VocabularyQuestion
  | GrammarQuestion
  | SentenceMatchQuestion
  | FlashcardItem;

export interface MistakeEntry {
  question: AnyQuestion;
  userAnswer: string;
  timestamp: number;
}
