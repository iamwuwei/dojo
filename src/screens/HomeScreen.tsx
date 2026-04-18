import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { PixelDog } from "../components/PixelDog";
import { SpeechBubble } from "../components/SpeechBubble";
import type { GameMode, QuizType } from "../types";

const QUIZ_TYPES: Array<{
  key: QuizType;
  label: string;
  sub: string;
  emoji: string;
}> = [
  { key: "vocabulary", label: "単語クイズ", sub: "單字選擇題", emoji: "📚" },
  { key: "grammar", label: "文法穴埋め", sub: "文法填空", emoji: "✏️" },
  { key: "sentence", label: "文型マッチ", sub: "句型配對", emoji: "🧩" },
  { key: "flashcard", label: "フラッシュ", sub: "閃卡翻面", emoji: "🎴" },
];

const GREETINGS = [
  "今日も一緒にがんばろうね！",
  "合格まであと少し、ファイト！",
  "今日はどの修行にする？",
  "わんわん！練習の時間だよ！",
];

export function HomeScreen() {
  const startQuiz = useGameStore((s) => s.startQuiz);
  const openMistakes = useGameStore((s) => s.openMistakes);
  const mistakes = useGameStore((s) => s.mistakes);

  const [selectedMode, setSelectedMode] = useState<GameMode>("combo");
  const [greeting] = useState(
    () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
  );

  return (
    <div className="min-h-screen px-4 sm:px-5 py-5 pb-10 max-w-3xl mx-auto">
      {/* 標題區 */}
      <header className="text-center mb-5 sm:mb-6">
        <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-ink tracking-tight">
          N3 修行道場
        </h1>
        <p className="text-xs sm:text-sm text-ink/70 mt-2 font-pixel">
          JLPT N3 複習・毎日ちょっとずつ
        </p>
      </header>

      {/* 狗狗歡迎區 */}
      <section className="flex items-end justify-center gap-2 sm:gap-3 mb-5 sm:mb-6">
        <PixelDog mood="happy" size={110} className="shrink-0" />
        <SpeechBubble className="mb-4 sm:mb-6 max-w-[220px] sm:max-w-none">
          <span className="text-sm sm:text-base">{greeting}</span>
        </SpeechBubble>
      </section>

      {/* 模式選擇 */}
      <section className="mb-6">
        <h2 className="font-display text-sm text-ink mb-2">モード選択</h2>
        <div className="grid grid-cols-2 gap-3">
          <ModeCard
            active={selectedMode === "combo"}
            onClick={() => setSelectedMode("combo")}
            title="コンボモード"
            sub="計分＋連擊"
            desc="連答越多分越高，錯一題歸零"
            icon="🔥"
          />
          <ModeCard
            active={selectedMode === "timed"}
            onClick={() => setSelectedMode("timed")}
            title="タイムアタック"
            sub="計時挑戰"
            desc="60 秒內答越多越好"
            icon="⏱"
          />
        </div>
      </section>

      {/* 題型選擇 */}
      <section className="mb-6">
        <h2 className="font-display text-sm text-ink mb-2">練習内容</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUIZ_TYPES.map((q) => (
            <button
              key={q.key}
              onClick={() => startQuiz(q.key, selectedMode)}
              className="pixel-btn pixel-border bg-white hover:bg-cream shadow-pixel p-4 text-left transition-colors"
            >
              <div className="text-2xl mb-1">{q.emoji}</div>
              <div className="font-display text-sm text-ink">{q.label}</div>
              <div className="text-xs text-ink/70 mt-1">{q.sub}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 錯題本入口 */}
      <section>
        <button
          onClick={openMistakes}
          className="pixel-btn pixel-border bg-beret text-white shadow-pixel w-full p-3 font-display text-sm flex items-center justify-between"
        >
          <span>📝 間違いノート</span>
          <span className="bg-white text-beret px-2 py-1 text-xs">
            {mistakes.length} 題
          </span>
        </button>
      </section>

      <footer className="mt-8 text-center text-xs text-ink/50">
        7月のN3合格へ・一歩ずつ
      </footer>
    </div>
  );
}

interface ModeCardProps {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  desc: string;
  icon: string;
}

function ModeCard({ active, onClick, title, sub, desc, icon }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`pixel-btn pixel-border p-3 text-left transition-colors shadow-pixel ${
        active
          ? "bg-mint text-ink shadow-pixelSm translate-x-[2px] translate-y-[2px]"
          : "bg-white hover:bg-cream"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className="font-display text-[13px] sm:text-sm leading-tight">{title}</span>
      </div>
      <div className="text-xs text-ink/80">{sub}</div>
      <div className="text-[10px] sm:text-[11px] text-ink/60 mt-1 leading-tight">{desc}</div>
    </button>
  );
}
