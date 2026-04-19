import { useState } from "react";
import { useGameStore, MASTERY_THRESHOLD } from "../store/useGameStore";
import { PixelDog } from "../components/PixelDog";
import { SpeechBubble } from "../components/SpeechBubble";
import {
  vocabularyQuestions,
  vocabularyByLevel,
  VOCAB_LEVELS,
} from "../data/vocabulary";
import { grammarQuestions } from "../data/grammar";
import { sentenceQuestions } from "../data/sentence";
import { flashcards } from "../data/flashcards";
import {
  daysSinceLast,
  last7Dates,
  liveCurrentStreak,
  streakGreeting,
  streakMood,
  todayISO,
} from "../lib/streak";
import type { GameMode, QuizType } from "../types";

const TOTAL_QUESTIONS =
  vocabularyQuestions.length +
  grammarQuestions.length +
  sentenceQuestions.length +
  flashcards.length;

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

export function HomeScreen() {
  const startQuiz = useGameStore((s) => s.startQuiz);
  const openMistakes = useGameStore((s) => s.openMistakes);
  const openVocabLevelPicker = useGameStore((s) => s.openVocabLevelPicker);
  const mistakes = useGameStore((s) => s.mistakes);
  const correctCounts = useGameStore((s) => s.correctCounts);
  const streak = useGameStore((s) => s.streak);
  const records = useGameStore((s) => s.records);
  const user = useGameStore((s) => s.user);
  const signOut = useGameStore((s) => s.signOut);

  const masteredCombo = Object.values(correctCounts.combo).filter(
    (n) => n >= MASTERY_THRESHOLD
  ).length;
  const masteredTimed = Object.values(correctCounts.timed).filter(
    (n) => n >= MASTERY_THRESHOLD
  ).length;

  const vocabLevelStats = VOCAB_LEVELS.map((level) => {
    const ids = new Set(vocabularyByLevel[level].map((q) => q.id));
    const combo = Object.entries(correctCounts.combo).filter(
      ([id, n]) => n >= MASTERY_THRESHOLD && ids.has(id)
    ).length;
    const timed = Object.entries(correctCounts.timed).filter(
      ([id, n]) => n >= MASTERY_THRESHOLD && ids.has(id)
    ).length;
    return { level, total: ids.size, combo, timed };
  });

  const today = todayISO();
  const liveStreak = liveCurrentStreak(streak, today);
  const recent7 = last7Dates(today);
  const practiceSet = new Set(streak.last30);
  const sinceLast = daysSinceLast(streak.lastDate, today);

  const [selectedMode, setSelectedMode] = useState<GameMode>("combo");
  const greeting = streakGreeting(liveStreak, sinceLast);
  const dogMood = streakMood(liveStreak, sinceLast);

  return (
    <div className="min-h-screen px-4 sm:px-5 py-5 pb-10 max-w-3xl mx-auto">
      {/* 標題區 */}
      <header className="text-center mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-ink tracking-tight">
              N3 修行道場
            </h1>
            <p className="text-xs sm:text-sm text-ink/70 mt-2 font-pixel">
              JLPT N3 複習・毎日ちょっとずつ
            </p>
          </div>
          {user ? (
            <button
              onClick={async () => await signOut()}
              className="pixel-btn pixel-border bg-white text-ink text-xs px-3 py-2 shadow-pixelSm btn-compact"
            >
              登出 {user.email}
            </button>
          ) : null}
        </div>
      </header>

      {/* 狗狗歡迎區 */}
      <section className="flex items-end justify-center gap-2 sm:gap-3 mb-5 sm:mb-6">
        <PixelDog mood={dogMood} size={110} className="shrink-0" />
        <SpeechBubble className="mb-4 sm:mb-6 max-w-[220px] sm:max-w-none">
          <span className="text-sm sm:text-base">{greeting}</span>
        </SpeechBubble>
      </section>

      {/* 每日打卡 + 累計分數 */}
      <section className="mb-6">
        <div className="pixel-border bg-cream/60 shadow-pixel p-4">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div className="font-display text-sm text-ink">
              🔥 連続 <span className="text-base">{liveStreak}</span> 日
              <span className="text-ink/60 text-xs ml-2">
                最長 {streak.longest} ／ 累計 {streak.totalDays}
              </span>
            </div>
            <div className="font-display text-xs text-ink">
              累計スコア{" "}
              <span className="text-base text-beret">
                {records.lifetimeScore.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {recent7
              .slice()
              .reverse()
              .map((d) => {
                const isToday = d === today;
                const did = practiceSet.has(d);
                const dayLabel = d.slice(8); // DD
                return (
                  <div
                    key={d}
                    className={`text-center pixel-border py-1.5 ${
                      did
                        ? "bg-mintDark text-white"
                        : isToday
                        ? "bg-white text-ink/70"
                        : "bg-white/60 text-ink/40"
                    }`}
                  >
                    <div className="text-[9px] leading-none font-display">
                      {dayLabel}
                    </div>
                    <div className="text-[10px] mt-0.5">
                      {did ? "✓" : isToday ? "·" : "·"}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* マスター進捗 — 兩個模式分開計算 */}
      <section className="mb-6">
        <div className="pixel-border bg-mint/40 shadow-pixel p-4">
          <div className="font-display text-sm text-ink mb-3">
            🏅 マスター進捗
          </div>
          <div className="space-y-3">
            <MasteryRow
              label="🔥 コンボ"
              done={masteredCombo}
              total={TOTAL_QUESTIONS}
            />
            <MasteryRow
              label="⏱ タイムアタック"
              done={masteredTimed}
              total={TOTAL_QUESTIONS}
            />
          </div>

          {/* 単語のレベル別細分 */}
          <div className="mt-4 pt-3 border-t-2 border-ink/10">
            <div className="font-display text-xs text-ink/70 mb-2">
              📚 単語（レベル別）
            </div>
            <div className="space-y-2">
              {vocabLevelStats.map((s) => (
                <div
                  key={s.level}
                  className="grid grid-cols-[40px_1fr_1fr] gap-2 items-center text-[11px]"
                >
                  <span className="font-display text-ink">{s.level}</span>
                  <MasteryMini label="🔥" done={s.combo} total={s.total} />
                  <MasteryMini label="⏱" done={s.timed} total={s.total} />
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-ink/60 mt-3 leading-snug">
            兩個模式各自獨立。連續答對 {MASTERY_THRESHOLD} 次的題目就會在「該模式」收起來不再出現，答錯一次扣 1 次。
          </p>
        </div>
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
            sub="3 回合制"
            desc="3 ラウンド・時間越來越短，沒過就 GAME OVER"
            icon="⏱"
          />
        </div>
      </section>

      {/* 題型選擇 */}
      <section className="mb-6">
        <h2 className="font-display text-sm text-ink mb-2">練習内容</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUIZ_TYPES.map((q) => {
            const handleClick =
              q.key === "vocabulary"
                ? openVocabLevelPicker
                : () => startQuiz(q.key, selectedMode);
            const best = records.byQuiz[q.key]?.[selectedMode];
            return (
              <button
                key={q.key}
                onClick={handleClick}
                className="pixel-btn pixel-border bg-white hover:bg-cream shadow-pixel p-4 text-left transition-colors"
              >
                <div className="text-2xl mb-1">{q.emoji}</div>
                <div className="font-display text-sm text-ink">{q.label}</div>
                <div className="text-xs text-ink/70 mt-1">{q.sub}</div>
                {best && (best.bestCombo > 0 || best.bestScore > 0) && (
                  <div className="text-[10px] text-ink/60 mt-2 font-display">
                    Best ⚡{best.bestCombo} ／ {best.bestScore.toLocaleString()}
                  </div>
                )}
              </button>
            );
          })}
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

function MasteryRow({
  label,
  done,
  total,
}: {
  label: string;
  done: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-ink mb-1">
        <span className="font-display">{label}</span>
        <span>
          {done}{" "}
          <span className="text-ink/60">/ {total}</span>
        </span>
      </div>
      <div className="h-2.5 bg-white pixel-border overflow-hidden">
        <div
          className="h-full bg-mintDark transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MasteryMini({
  label,
  done,
  total,
}: {
  label: string;
  done: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="shrink-0">{label}</span>
      <div className="h-1.5 bg-white pixel-border flex-1 overflow-hidden">
        <div
          className="h-full bg-mintDark transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-ink/70 tabular-nums">
        {done}/{total}
      </span>
    </div>
  );
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
