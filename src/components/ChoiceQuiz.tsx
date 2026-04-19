import { useMemo, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { PixelDog } from "./PixelDog";
import { SpeechBubble } from "./SpeechBubble";
import { ScoreBar } from "./ScoreBar";
import type { AnyQuestion, DogMood, GameMode } from "../types";

interface ChoiceQuestionLike {
  id: string;
  prompt: string; // 題目主文
  subPrompt?: string; // 副標（例如：翻譯）
  options: string[];
  answer: number;
  explanation?: string;
  raw: AnyQuestion; // 原始題目（給錯題本）
}

interface ChoiceQuizProps {
  title: string;
  questions: ChoiceQuestionLike[];
  mode: GameMode;
  timedSeconds?: number; // 計時模式的秒數，預設 60
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ChoiceQuiz({
  title,
  questions,
  mode,
  timedSeconds = 60,
}: ChoiceQuizProps) {
  // 打亂題目順序（已掌握的題目在 caller 已被過濾掉）
  const [queue] = useState(() => shuffle(questions));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [flash, setFlash] = useState<"success" | "danger" | null>(null);
  const [dogMood, setDogMood] = useState<DogMood>("idle");

  const { score, combo, addCorrect, addWrong, endQuiz, goHome } = useGameStore();

  const currentQ = queue[idx];
  const isLast = idx >= queue.length - 1;
  const done = idx >= queue.length;

  const currentPoints = useMemo(() => {
    // combo 加成：每 combo 增加 10 分
    return 100 + combo * 10;
  }, [combo]);

  function handlePick(optIdx: number) {
    if (selected !== null) return; // 已選過
    setSelected(optIdx);
    const correct = optIdx === currentQ.answer;
    if (correct) {
      addCorrect(currentPoints, currentQ.id);
      setFlash("success");
      setDogMood(combo + 1 >= 3 ? "excited" : "happy");
    } else {
      addWrong(currentQ.raw, currentQ.options[optIdx]);
      setFlash("danger");
      setDogMood("sad");
    }
    setShowExplain(true);
    setTimeout(() => setFlash(null), 400);
  }

  function handleNext() {
    if (isLast) {
      endQuiz();
      return;
    }
    setSelected(null);
    setShowExplain(false);
    setDogMood("idle");
    setIdx((i) => i + 1);
  }

  function handleTimeUp() {
    endQuiz();
  }

  if (queue.length === 0) {
    return <AllMasteredScreen title={title} onHome={goHome} />;
  }

  if (done) {
    endQuiz();
    return null;
  }

  return (
    <div
      className={`min-h-screen px-3 sm:px-4 py-4 pb-8 max-w-2xl mx-auto ${
        flash === "success" ? "flash-success" : ""
      } ${flash === "danger" ? "flash-danger" : ""}`}
    >
      {/* 頂 bar */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <button
          onClick={goHome}
          className="pixel-btn pixel-border bg-white text-ink text-xs px-3 py-2 shadow-pixelSm btn-compact"
        >
          ← 戻る
        </button>
        <h2 className="font-display text-xs sm:text-sm text-ink">{title}</h2>
        <div className="w-[60px] sm:w-[70px]" />
      </div>

      <ScoreBar
        score={score}
        combo={combo}
        current={idx + 1}
        total={queue.length}
        timerSeconds={mode === "timed" ? timedSeconds : undefined}
        onTimeUp={handleTimeUp}
        timerRunning={!showExplain || mode !== "timed" ? true : true}
      />

      {/* 狗狗＋提示 */}
      <div className="flex items-end gap-2 mb-3">
        <PixelDog mood={dogMood} size={70} className="shrink-0" />
        {showExplain && currentQ.explanation && (
          <SpeechBubble className="flex-1 mb-2 min-w-0">
            <div className="text-xs leading-relaxed">{currentQ.explanation}</div>
          </SpeechBubble>
        )}
      </div>

      {/* 題目卡 */}
      <div className="pixel-border bg-white shadow-pixel p-4 sm:p-5 mb-4">
        <div className="text-base sm:text-lg md:text-xl text-ink leading-relaxed font-pixel mb-2 break-words">
          {currentQ.prompt}
        </div>
        {currentQ.subPrompt && (
          <div className="text-xs text-ink/60 mt-1">{currentQ.subPrompt}</div>
        )}
      </div>

      {/* 選項 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-4">
        {currentQ.options.map((opt, i) => {
          const isAnswer = i === currentQ.answer;
          const isPicked = i === selected;
          const showState = selected !== null;

          let cls = "bg-white hover:bg-cream text-ink";
          if (showState && isAnswer) cls = "bg-success text-white";
          else if (showState && isPicked && !isAnswer)
            cls = "bg-danger text-white";
          else if (showState) cls = "bg-white/60 text-ink/50";

          return (
            <button
              key={i}
              disabled={selected !== null}
              onClick={() => handlePick(i)}
              className={`pixel-btn pixel-border shadow-pixel p-3 text-left transition-colors ${cls}`}
            >
              <span className="font-display text-xs mr-2">
                {String.fromCharCode(65 + i)}.
              </span>
              <span className="font-pixel text-sm sm:text-base break-words">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* 下一題按鈕 */}
      {selected !== null && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="pixel-btn pixel-border bg-beret text-white shadow-pixel px-5 sm:px-6 py-3 font-display text-xs sm:text-sm animate-pop"
          >
            {isLast ? "結果を見る →" : "次へ →"}
          </button>
        </div>
      )}
    </div>
  );
}

export function AllMasteredScreen({
  title,
  onHome,
}: {
  title: string;
  onHome: () => void;
}) {
  return (
    <div className="min-h-screen px-4 py-8 max-w-xl mx-auto flex flex-col items-center justify-center">
      <div className="pixel-border bg-white shadow-pixel p-6 text-center">
        <PixelDog mood="proud" size={120} className="mx-auto mb-3" />
        <h2 className="font-display text-base text-ink mb-2">{title}</h2>
        <p className="text-sm text-ink/80 mb-1">全部の問題をマスター！🎉</p>
        <p className="text-xs text-ink/60 mb-4">
          這個題型的題目你都已經連續答對 3 次了。<br />
          答錯一次會把分數扣回 2 次，題目就會再出現。
        </p>
        <button
          onClick={onHome}
          className="pixel-btn pixel-border bg-beret text-white shadow-pixel px-5 py-3 font-display text-sm"
        >
          ← 戻る
        </button>
      </div>
    </div>
  );
}
