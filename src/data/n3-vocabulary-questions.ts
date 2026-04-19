import type { VocabularyQuestion } from "../types";
import { buildVocabFromYaml } from "./vocab-builder";
import verbsYaml from "./learning-n3-verbs.yml?raw";
import nounsYaml from "./learning-n3-nouns.yml?raw";
import othersYaml from "./learning-n3-others.yml?raw";

// Hand-crafted N3 questions kept verbatim so existing mastery progress
// (n3-v-001..n3-v-010) doesn't reset.
const handcrafted: VocabularyQuestion[] = [
  {
    id: "n3-v-001",
    type: "vocabulary",
    word: "経済",
    reading: "けいざい",
    question: "「経済」の正しい読み方はどれですか？",
    options: ["けいざい", "けいさい", "きょうざい", "きょうさい"],
    answer: 0,
    explanation: "「経済」意思是「經濟」，唸作 けいざい。",
  },
  {
    id: "n3-v-002",
    type: "vocabulary",
    word: "準備",
    reading: "じゅんび",
    question: "「出発の準備をする」の「準備」はどんな意味？",
    options: ["練習", "準備", "計畫", "檢查"],
    answer: 1,
    explanation: "「準備」就是中文的「準備」，為出發做好準備。",
  },
  {
    id: "n3-v-003",
    type: "vocabulary",
    word: "招待",
    reading: "しょうたい",
    question: "「友達を招待する」の「招待」の読み方は？",
    options: ["しょうだい", "しょうたい", "そうたい", "ちょうたい"],
    answer: 1,
    explanation: "「招待」＝邀請，讀作 しょうたい。",
  },
  {
    id: "n3-v-004",
    type: "vocabulary",
    word: "確認",
    reading: "かくにん",
    question: "「予約を（　　）する」に最もふさわしい語は？",
    options: ["確認", "確定", "決定", "予定"],
    answer: 0,
    explanation: "「予約を確認する」是固定搭配，意思是確認預約。",
  },
  {
    id: "n3-v-005",
    type: "vocabulary",
    word: "連絡",
    reading: "れんらく",
    question: "「明日までに（　　）してください」最適合填入的詞？",
    options: ["連続", "連絡", "連休", "連想"],
    answer: 1,
    explanation: "「連絡する」意思是「聯絡、通知」。",
  },
  {
    id: "n3-v-006",
    type: "vocabulary",
    word: "紹介",
    reading: "しょうかい",
    question: "「自己紹介」の「紹介」の意味は？",
    options: ["介紹", "介入", "評價", "推薦信"],
    answer: 0,
    explanation: "「紹介」＝介紹。「自己紹介」就是自我介紹。",
  },
  {
    id: "n3-v-007",
    type: "vocabulary",
    word: "解決",
    reading: "かいけつ",
    question: "「問題を（　　）する」に最もふさわしい語は？",
    options: ["解放", "解消", "解決", "解答"],
    answer: 2,
    explanation: "「問題を解決する」是解決問題的固定用法。",
  },
  {
    id: "n3-v-008",
    type: "vocabulary",
    word: "無理",
    reading: "むり",
    question: "「それは（　　）です」想表達「那是不可能的」，最合適的是？",
    options: ["無料", "無事", "無理", "無視"],
    answer: 2,
    explanation: "「無理」＝不可能、勉強。「無理です」＝辦不到。",
  },
  {
    id: "n3-v-009",
    type: "vocabulary",
    word: "偶然",
    reading: "ぐうぜん",
    question: "「駅で（　　）友達に会った」最適合填入？",
    options: ["突然", "偶然", "当然", "自然"],
    answer: 1,
    explanation: "「偶然」＝偶然、碰巧。「偶然会った」＝偶然遇到。",
  },
  {
    id: "n3-v-010",
    type: "vocabulary",
    word: "得意",
    reading: "とくい",
    question: "「料理が（　　）です」想表達「很拿手」，要填入？",
    options: ["上手", "得意", "好き", "便利"],
    answer: 1,
    explanation: "「得意」＝擅長、拿手；與「上手」意思相近但主觀自信更強。",
  },
];

// Distractors stay within their own POS pool so a verb question's wrong
// answers are also verbs (and same for nouns / adj-adv-katakana) — keeps
// the quiz tight.
const verbsFromYaml = buildVocabFromYaml(verbsYaml, "n3-vv-");
const nounsFromYaml = buildVocabFromYaml(nounsYaml, "n3-vn-");
const othersFromYaml = buildVocabFromYaml(othersYaml, "n3-vo-");

export const n3VocabularyQuestions: VocabularyQuestion[] = [
  ...handcrafted,
  ...verbsFromYaml,
  ...nounsFromYaml,
  ...othersFromYaml,
];
