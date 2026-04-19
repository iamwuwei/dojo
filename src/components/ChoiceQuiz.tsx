import { useMemo, useRef, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { PixelDog } from "./PixelDog";
import { SpeechBubble } from "./SpeechBubble";
import { ScoreBar } from "./ScoreBar";
import { MasteryBadge } from "./MasteryBadge";
import {
  RoundIntro,
  RoundCleared,
  RoundChampion,
  RoundFailed,
  NotEnoughQuestions,
} from "./RoundOverlay";
import {
  ROUND_CONFIGS,
  TOTAL_ROUNDS,
  durationFor,
  minPoolSize,
  passed,
  sliceRoundQueue,
} from "../lib/rounds";
import type { AnyQuestion, DogMood, GameMode, QuizType } from "../types";

interface ChoiceQuestionLike {
  id: string;
  prompt: string;
  subPrompt?: string;
  options: string[];
  answer: number;
  explanation?: string;
  raw: AnyQuestion;
}

interface ChoiceQuizProps {
  title: string;
  questions: ChoiceQuestionLike[];
  mode: GameMode;
  quizType: QuizType;
}

type RoundPhase = "intro" | "playing" | "cleared" | "failed" | "champion";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ChoiceQuiz({ title, questions, mode, quizType }: ChoiceQuizProps) {
  const isTimed = mode === "timed";
  const config = ROUND_CONFIGS[quizType];

  const [pool] = useState(() => shuffle(questions));

  // Round phase machine — only meaningful in timed mode.
  const [phase, setPhase] = useState<RoundPhase>(isTimed ? "intro" : "playing");
  const [roundIdx, setRoundIdx] = useState(0);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [roundAnswered, setRoundAnswered] = useState(0);
  // Refs mirror the round counters so async finalizers (timer onTimeUp,
  // immediate handleNext) read the latest values without React-state lag.
  const roundCorrectRef = useRef(0);
  const roundAnsweredRef = useRef(0);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [flash, setFlash] = useState<"success" | "danger" | null>(null);
  const [dogMood, setDogMood] = useState<DogMood>("idle");

  const { score, combo, correct, wrong, addCorrect, addWrong, endQuiz, goHome } =
    useGameStore();
  const correctCounts = useGameStore((s) => s.correctCounts);

  // Active queue for the current screen.
  // - Combo: the whole pool.
  // - Timed: a slice of `config.questionsPerRound` for the current round.
  const queue = useMemo(
    () => (isTimed ? sliceRoundQueue(pool, config, roundIdx) : pool),
    [isTimed, pool, config, roundIdx]
  );

  const currentQ = queue[idx];
  const isLastInRound = idx >= queue.length - 1;

  const currentPoints = useMemo(() => 100 + combo * 10, [combo]);

  // ---- Timed-mode pre-checks ----
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
    return <AllMasteredScreen title={title} onHome={goHome} />;
  }

  // ---- Round transitions ----

  function startRound() {
    setIdx(0);
    setSelected(null);
    setShowExplain(false);
    setRoundCorrect(0);
    setRoundAnswered(0);
    roundCorrectRef.current = 0;
    roundAnsweredRef.current = 0;
    setDogMood("idle");
    setPhase("playing");
  }

  function finishRound(finalCorrect: number, finalAnswered: number) {
    const cleared = passed(config, finalCorrect, finalAnswered);
    if (!cleared) {
      setPhase("failed");
      return;
    }
    if (roundIdx + 1 >= TOTAL_ROUNDS) {
      setPhase("champion");
      return;
    }
    setPhase("cleared");
  }

  function handleRoundTimeUp() {
    if (phase !== "playing") return;
    finishRound(roundCorrectRef.current, roundAnsweredRef.current);
  }

  function continueToNextRound() {
    setRoundIdx((r) => r + 1);
    setPhase("intro");
  }

  // ---- Intro / result overlays for timed mode ----

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

  // ---- Combo + Timed playing UI (shared) ----

  function handlePick(optIdx: number) {
    if (selected !== null) return;
    setSelected(optIdx);
    const correct = optIdx === currentQ.answer;
    if (correct) {
      addCorrect(currentPoints, currentQ.id);
      setFlash("success");
      setDogMood(combo + 1 >= 3 ? "excited" : "happy");
      if (isTimed) {
        roundCorrectRef.current += 1;
        setRoundCorrect(roundCorrectRef.current);
      }
    } else {
      addWrong(currentQ.raw, currentQ.options[optIdx]);
      setFlash("danger");
      setDogMood("sad");
    }
    if (isTimed) {
      roundAnsweredRef.current += 1;
      setRoundAnswered(roundAnsweredRef.current);
    }
    setShowExplain(true);
    setTimeout(() => setFlash(null), 400);
  }

  function handleNext() {
    if (isLastInRound) {
      if (isTimed) {
        finishRound(roundCorrectRef.current, roundAnsweredRef.current);
      } else {
        endQuiz();
      }
      return;
    }
    setSelected(null);
    setShowExplain(false);
    setDogMood("idle");
    setIdx((i) => i + 1);
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
          {title}
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
        {showExplain && (
          <SpeechBubble className="flex-1 mb-2 min-w-0">
            {currentQ.explanation && (
              <div className="text-xs leading-relaxed mb-1">
                {currentQ.explanation}
              </div>
            )}
            <MasteryBadge
              count={
                correctCounts[isTimed ? "timed" : "combo"][currentQ.id] ?? 0
              }
            />
          </SpeechBubble>
        )}
      </div>

      <div className="pixel-border bg-white shadow-pixel p-4 sm:p-5 mb-4">
        <div className="text-base sm:text-lg md:text-xl text-ink leading-relaxed font-pixel mb-2 break-words">
          {currentQ.prompt}
        </div>
        {currentQ.subPrompt && (
          <div className="text-xs text-ink/60 mt-1">{currentQ.subPrompt}</div>
        )}
      </div>

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

      {selected !== null && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="pixel-btn pixel-border bg-beret text-white shadow-pixel px-5 sm:px-6 py-3 font-display text-xs sm:text-sm animate-pop"
          >
            {isLastInRound
              ? isTimed
                ? "ラウンド終了 →"
                : "結果を見る →"
              : "次へ →"}
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
