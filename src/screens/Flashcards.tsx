import { useMemo, useRef, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { PixelDog } from "../components/PixelDog";
import { SpeechBubble } from "../components/SpeechBubble";
import { ScoreBar } from "../components/ScoreBar";
import { AllMasteredScreen } from "../components/ChoiceQuiz";
import {
  RoundIntro,
  RoundCleared,
  RoundChampion,
  RoundFailed,
  NotEnoughQuestions,
} from "../components/RoundOverlay";
import {
  ROUND_CONFIGS,
  TOTAL_ROUNDS,
  durationFor,
  minPoolSize,
  passed,
  sliceRoundQueue,
} from "../lib/rounds";
import { flashcards } from "../data/flashcards";
import type { DogMood } from "../types";

type RoundPhase = "intro" | "playing" | "cleared" | "failed" | "champion";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Flashcards() {
  const mode = useGameStore((s) => s.mode) ?? "combo";
  const isTimed = mode === "timed";
  const config = ROUND_CONFIGS.flashcard;

  const { score, combo, correct, wrong, addCorrect, addWrong, endQuiz, goHome } =
    useGameStore();
  const isMastered = useGameStore((s) => s.isMastered);

  const [pool] = useState(() =>
    shuffle(flashcards.filter((c) => !isMastered(c.id)))
  );

  const [phase, setPhase] = useState<RoundPhase>(isTimed ? "intro" : "playing");
  const [roundIdx, setRoundIdx] = useState(0);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [roundAnswered, setRoundAnswered] = useState(0);
  const roundCorrectRef = useRef(0);
  const roundAnsweredRef = useRef(0);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dogMood, setDogMood] = useState<DogMood>("idle");
  const [flash, setFlash] = useState<"success" | "danger" | null>(null);

  const queue = useMemo(
    () => (isTimed ? sliceRoundQueue(pool, config, roundIdx) : pool),
    [isTimed, pool, config, roundIdx]
  );

  if (isTimed && pool.length < minPoolSize(config)) {
    return (
      <NotEnoughQuestions
        needed={minPoolSize(config)}
        have={pool.length}
        onHome={goHome}
      />
    );
  }

  if (queue.length === 0) {
    return <AllMasteredScreen title="フラッシュカード" onHome={goHome} />;
  }

  const card = queue[idx];
  const isLastInRound = idx >= queue.length - 1;

  function startRound() {
    setIdx(0);
    setFlipped(false);
    setRoundCorrect(0);
    setRoundAnswered(0);
    roundCorrectRef.current = 0;
    roundAnsweredRef.current = 0;
    setDogMood("idle");
    setPhase("playing");
  }

  function finishRound(c: number, total: number) {
    if (!passed(config, c, total)) {
      setPhase("failed");
      return;
    }
    if (roundIdx + 1 >= TOTAL_ROUNDS) {
      setPhase("champion");
      return;
    }
    setPhase("cleared");
  }

  function continueToNextRound() {
    setRoundIdx((r) => r + 1);
    setPhase("intro");
  }

  function handleRoundTimeUp() {
    if (phase !== "playing") return;
    finishRound(roundCorrectRef.current, roundAnsweredRef.current);
  }

  if (isTimed && phase === "intro") {
    return (
      <RoundIntro
        roundIdx={roundIdx}
        duration={durationFor(config, roundIdx)}
        questionsPerRound={config.questionsPerRound}
        passRatio={config.passRatio}
        onStart={startRound}
      />
    );
  }

  if (isTimed && phase === "cleared") {
    return (
      <RoundCleared
        roundIdx={roundIdx}
        correct={roundCorrect}
        total={roundAnswered}
        passNeeded={Math.ceil(config.questionsPerRound * config.passRatio)}
        onContinue={continueToNextRound}
      />
    );
  }

  if (isTimed && phase === "failed") {
    return (
      <RoundFailed
        roundIdx={roundIdx}
        correct={roundCorrect}
        total={roundAnswered}
        passNeeded={Math.ceil(config.questionsPerRound * config.passRatio)}
        onFinish={endQuiz}
      />
    );
  }

  if (isTimed && phase === "champion") {
    return (
      <RoundChampion
        totalCorrect={correct}
        totalQuestions={correct + wrong}
        onFinish={endQuiz}
      />
    );
  }

  function handleKnow() {
    addCorrect(80 + combo * 8, card.id);
    setDogMood(combo + 1 >= 3 ? "excited" : "happy");
    setFlash("success");
    setTimeout(() => setFlash(null), 300);
    if (isTimed) {
      roundCorrectRef.current += 1;
      setRoundCorrect(roundCorrectRef.current);
      roundAnsweredRef.current += 1;
      setRoundAnswered(roundAnsweredRef.current);
    }
    goNext();
  }

  function handleDontKnow() {
    addWrong(card, "不知道");
    setDogMood("sad");
    setFlash("danger");
    setTimeout(() => setFlash(null), 300);
    if (isTimed) {
      roundAnsweredRef.current += 1;
      setRoundAnswered(roundAnsweredRef.current);
    }
    goNext();
  }

  function goNext() {
    if (isLastInRound) {
      if (isTimed) {
        setTimeout(
          () => finishRound(roundCorrectRef.current, roundAnsweredRef.current),
          350
        );
      } else {
        setTimeout(() => endQuiz(), 350);
      }
      return;
    }
    setTimeout(() => {
      setIdx(idx + 1);
      setFlipped(false);
      setDogMood("idle");
    }, 350);
  }

  return (
    <div
      className={`min-h-screen px-3 sm:px-4 py-4 pb-8 max-w-2xl mx-auto ${
        flash === "success" ? "flash-success" : ""
      } ${flash === "danger" ? "flash-danger" : ""}`}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <button
          onClick={goHome}
          className="pixel-btn pixel-border bg-white text-ink text-xs px-3 py-2 shadow-pixelSm btn-compact"
        >
          ← 戻る
        </button>
        <h2 className="font-display text-xs sm:text-sm text-ink">
          フラッシュカード
          {isTimed && (
            <span className="ml-2 text-ink/60">
              R{roundIdx + 1}/{TOTAL_ROUNDS}
            </span>
          )}
        </h2>
        <div className="w-[60px] sm:w-[70px]" />
      </div>

      <ScoreBar
        score={score}
        combo={combo}
        current={idx + 1}
        total={queue.length}
        timerSeconds={isTimed ? durationFor(config, roundIdx) : undefined}
        onTimeUp={handleRoundTimeUp}
        timerRunning={phase === "playing"}
      />

      <div className="flex items-end gap-2 mb-3">
        <PixelDog mood={dogMood} size={70} className="shrink-0" />
        <SpeechBubble className="flex-1 mb-2 min-w-0">
          <div className="text-xs">
            {flipped ? "覚えてた？正直にね！" : "カードをタップして答え合わせ！"}
          </div>
        </SpeechBubble>
      </div>

      <div
        className="flip-card w-full mb-4"
        style={{ minHeight: 200 }}
        onClick={() => !flipped && setFlipped(true)}
      >
        <div
          className={`flip-inner w-full h-full ${flipped ? "flipped" : ""}`}
          style={{ minHeight: 200 }}
        >
          <div
            className="flip-face pixel-border bg-white shadow-pixelLg p-5 sm:p-6 flex flex-col items-center justify-center cursor-pointer no-select"
            style={{ minHeight: 200 }}
          >
            <div className="text-[11px] text-ink/50 font-display mb-2">
              表 / front
            </div>
            <div className="font-pixel text-4xl sm:text-5xl text-ink mb-2 text-center break-words max-w-full">
              {card.front}
            </div>
            {card.reading && (
              <div className="text-sm text-ink/70">{card.reading}</div>
            )}
            <div className="text-[11px] text-ink/40 font-display mt-5 sm:mt-6">
              ▼ タップして裏返す
            </div>
          </div>
          <div
            className="flip-face flip-back pixel-border bg-cream shadow-pixelLg p-5 sm:p-6 flex flex-col items-center justify-center"
            style={{ minHeight: 200 }}
          >
            <div className="text-[11px] text-ink/50 font-display mb-2">
              裏 / back
            </div>
            <div className="font-pixel text-3xl sm:text-4xl text-ink mb-3 text-center break-words max-w-full">
              {card.back}
            </div>
            {card.example && (
              <div className="text-xs text-ink/70 text-center max-w-sm leading-relaxed px-2">
                {card.example}
              </div>
            )}
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 animate-pop">
          <button
            onClick={handleDontKnow}
            className="pixel-btn pixel-border bg-danger text-white shadow-pixel p-3 font-display text-xs sm:text-sm"
          >
            ❌ 忘了
          </button>
          <button
            onClick={handleKnow}
            className="pixel-btn pixel-border bg-success text-white shadow-pixel p-3 font-display text-xs sm:text-sm"
          >
            ✅ 記得
          </button>
        </div>
      ) : (
        <div className="text-center text-xs text-ink/60">
          點擊卡片查看答案
        </div>
      )}
    </div>
  );
}
