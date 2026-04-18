import { useGameStore } from "../store/useGameStore";
import { PixelDog } from "../components/PixelDog";
import { SpeechBubble } from "../components/SpeechBubble";
import type { DogMood } from "../types";

export function ResultScreen() {
  const { score, maxCombo, correct, wrong, goHome, startQuiz, quizType, mode } =
    useGameStore();

  const total = correct + wrong;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  let mood: DogMood = "happy";
  let message = "よくやった！";
  let rank = "C";

  if (accuracy === 100) {
    mood = "excited";
    message = "満点！完璧すぎる〜！";
    rank = "S";
  } else if (accuracy >= 80) {
    mood = "excited";
    message = "すごい！この調子！";
    rank = "A";
  } else if (accuracy >= 60) {
    mood = "happy";
    message = "合格ライン！もう少し復習しよう";
    rank = "B";
  } else if (accuracy >= 40) {
    mood = "thinking";
    message = "まだまだ！間違えた問題を見直そう";
    rank = "C";
  } else {
    mood = "sad";
    message = "大丈夫、また挑戦しよう！";
    rank = "D";
  }

  function playAgain() {
    if (quizType && mode) {
      startQuiz(quizType, mode);
    } else {
      goHome();
    }
  }

  return (
    <div className="min-h-screen px-4 sm:px-5 py-5 pb-8 max-w-xl mx-auto flex flex-col justify-center">
      <header className="text-center mb-4">
        <h1 className="font-display text-lg sm:text-xl text-ink">結果発表！</h1>
      </header>

      <section className="flex items-end justify-center gap-2 sm:gap-3 mb-5">
        <PixelDog mood={mood} size={110} className="shrink-0" />
        <SpeechBubble className="mb-4 sm:mb-6 max-w-[220px] sm:max-w-none">
          <span className="text-sm sm:text-base">{message}</span>
        </SpeechBubble>
      </section>

      {/* 大獎章 rank */}
      <div className="flex justify-center mb-5">
        <div
          className={`pixel-border-thick shadow-pixelLg bg-cream w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center animate-pop ${
            rank === "S" ? "bg-combo" : ""
          }`}
        >
          <div className="text-center">
            <div className="text-[10px] font-display text-ink/60">RANK</div>
            <div className="font-display text-5xl sm:text-6xl text-ink leading-none">
              {rank}
            </div>
          </div>
        </div>
      </div>

      {/* 統計 */}
      <div className="pixel-border bg-white shadow-pixel p-4 mb-5 space-y-3">
        <Stat label="スコア" value={`${score}`} accent />
        <Stat label="最高コンボ" value={`×${maxCombo}`} />
        <Stat label="正解 / 合計" value={`${correct} / ${total}`} />
        <Stat label="正答率" value={`${accuracy}%`} />
      </div>

      {/* 按鈕 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          onClick={goHome}
          className="pixel-btn pixel-border bg-white text-ink shadow-pixel p-3 font-display text-xs sm:text-sm"
        >
          🏠 トップへ
        </button>
        <button
          onClick={playAgain}
          className="pixel-btn pixel-border bg-beret text-white shadow-pixel p-3 font-display text-xs sm:text-sm"
        >
          🔄 もう一回
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink/70 font-display">{label}</span>
      <span
        className={`font-display ${accent ? "text-2xl text-beret" : "text-base text-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}
