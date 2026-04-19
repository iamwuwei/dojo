import { useGameStore, MASTERY_THRESHOLD } from "../store/useGameStore";
import type { VocabLevelChoice } from "../store/useGameStore";
import { PixelDog } from "../components/PixelDog";
import {
  vocabularyByLevel,
  vocabularyQuestions,
  VOCAB_LEVELS,
  levelOfVocabId,
} from "../data/vocabulary";
import type { GameMode } from "../types";

interface LevelStats {
  total: number;
  masteredCombo: number;
  masteredTimed: number;
}

export function VocabLevelPicker() {
  const goHome = useGameStore((s) => s.goHome);
  const startQuiz = useGameStore((s) => s.startQuiz);
  const setVocabLevel = useGameStore((s) => s.setVocabLevel);
  const mode = useGameStore((s) => s.mode) ?? "combo";
  const correctCounts = useGameStore((s) => s.correctCounts);

  function pickAndStart(level: VocabLevelChoice) {
    setVocabLevel(level);
    startQuiz("vocabulary", mode as GameMode);
  }

  function statsFor(level: "all" | (typeof VOCAB_LEVELS)[number]): LevelStats {
    const ids =
      level === "all"
        ? vocabularyQuestions.map((q) => q.id)
        : vocabularyByLevel[level].map((q) => q.id);
    const idSet = new Set(ids);
    const masteredCombo = Object.entries(correctCounts.combo).filter(
      ([id, n]) => n >= MASTERY_THRESHOLD && idSet.has(id)
    ).length;
    const masteredTimed = Object.entries(correctCounts.timed).filter(
      ([id, n]) => n >= MASTERY_THRESHOLD && idSet.has(id)
    ).length;
    return { total: ids.length, masteredCombo, masteredTimed };
  }

  return (
    <div className="min-h-screen px-4 sm:px-5 py-5 pb-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-2">
        <button
          onClick={goHome}
          className="pixel-btn pixel-border bg-white text-ink text-xs px-3 py-2 shadow-pixelSm btn-compact"
        >
          ← 戻る
        </button>
        <h2 className="font-display text-sm text-ink">単語レベル選択</h2>
        <div className="w-[60px]" />
      </div>

      <div className="flex items-end gap-2 mb-5">
        <PixelDog mood="thinking" size={90} className="shrink-0" />
        <div className="pixel-border bg-white px-3 py-2 shadow-pixelSm text-xs text-ink/80">
          どのレベルの単語を練習する？
        </div>
      </div>

      <div className="grid gap-3">
        {VOCAB_LEVELS.map((level) => {
          const stats = statsFor(level);
          return (
            <LevelButton
              key={level}
              label={level}
              sub={`JLPT ${level}`}
              stats={stats}
              onClick={() => pickAndStart(level)}
            />
          );
        })}
        <LevelButton
          label="全部"
          sub="N5 + N4 + N3 全レベル"
          stats={statsFor("all")}
          onClick={() => pickAndStart("all")}
          highlight
        />
      </div>
    </div>
  );
}

function LevelButton({
  label,
  sub,
  stats,
  onClick,
  highlight,
}: {
  label: string;
  sub: string;
  stats: LevelStats;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`pixel-btn pixel-border shadow-pixel p-4 text-left transition-colors ${
        highlight ? "bg-mint hover:bg-mint/80" : "bg-white hover:bg-cream"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-display text-base text-ink">{label}</div>
          <div className="text-xs text-ink/60 mt-0.5">{sub}</div>
        </div>
        <div className="text-right text-[11px] text-ink/70 shrink-0 leading-tight">
          <div>
            🔥 {stats.masteredCombo}/{stats.total}
          </div>
          <div>
            ⏱ {stats.masteredTimed}/{stats.total}
          </div>
        </div>
      </div>
    </button>
  );
}
