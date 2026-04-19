import { useMemo, useRef, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { PixelDog } from "../components/PixelDog";
import { SpeechBubble } from "../components/SpeechBubble";
import { ScoreBar } from "../components/ScoreBar";
import { AllMasteredScreen } from "../components/ChoiceQuiz";
import { MasteryBadge } from "../components/MasteryBadge";
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
import { sentenceQuestions } from "../data/sentence";
import type { DogMood, SentenceMatchQuestion } from "../types";

type RoundPhase = "intro" | "playing" | "cleared" | "failed" | "champion";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SentenceMatch() {
  const mode = useGameStore((s) => s.mode) ?? "combo";
  const isTimed = mode === "timed";
  const config = ROUND_CONFIGS.sentence;

  const { score, combo, correct, wrong, addCorrect, addWrong, endQuiz, goHome } =
    useGameStore();
  const isMastered = useGameStore((s) => s.isMastered);
  const correctCounts = useGameStore((s) => s.correctCounts);

  const [pool] = useState(() =>
    shuffle(sentenceQuestions.filter((q) => !isMastered(q.id)))
  );

  const [phase, setPhase] = useState<RoundPhase>(isTimed ? "intro" : "playing");
  const [roundIdx, setRoundIdx] = useState(0);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [roundAnswered, setRoundAnswered] = useState(0);
  const roundCorrectRef = useRef(0);
  const roundAnsweredRef = useRef(0);

  const [idx, setIdx] = useState(0);
  const [pairs, setPairs] = useState<Record<number, number>>({});
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [flash, setFlash] = useState<"success" | "danger" | null>(null);
  const [dogMood, setDogMood] = useState<DogMood>("thinking");

  const queue = useMemo(
    () => (isTimed ? sliceRoundQueue(pool, config, roundIdx) : pool),
    [isTimed, pool, config, roundIdx]
  );

  const usedRights = useMemo(() => new Set(Object.values(pairs)), [pairs]);

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
    return <AllMasteredScreen title="文型マッチ" onHome={goHome} />;
  }

  const q = queue[idx];
  const isLastInRound = idx >= queue.length - 1;
  const correctMap = new Map<number, number>(q.pairs);
  const allMatched =
    Object.keys(pairs).length === q.lefts.length && !checked;

  // ---- Round transitions ----

  function startRound() {
    setIdx(0);
    setPairs({});
    setSelectedLeft(null);
    setChecked(false);
    setRoundCorrect(0);
    setRoundAnswered(0);
    roundCorrectRef.current = 0;
    roundAnsweredRef.current = 0;
    setDogMood("thinking");
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

  // ---- Pairing UI handlers ----

  function handleLeftClick(i: number) {
    if (checked) return;
    if (pairs[i] !== undefined) {
      const next = { ...pairs };
      delete next[i];
      setPairs(next);
      setSelectedLeft(null);
      return;
    }
    setSelectedLeft(i);
  }

  function handleRightClick(ri: number) {
    if (checked) return;
    if (usedRights.has(ri)) {
      const leftEntry = Object.entries(pairs).find(([, v]) => v === ri);
      if (leftEntry) {
        const next = { ...pairs };
        delete next[Number(leftEntry[0])];
        setPairs(next);
      }
      return;
    }
    if (selectedLeft === null) return;
    setPairs({ ...pairs, [selectedLeft]: ri });
    setSelectedLeft(null);
  }

  function check() {
    setChecked(true);
    let correctCount = 0;
    Object.entries(pairs).forEach(([l, r]) => {
      if (correctMap.get(Number(l)) === r) correctCount++;
    });
    const allRight = correctCount === q.lefts.length;
    if (allRight) {
      const points = 400 + combo * 20;
      addCorrect(points, q.id);
      setFlash("success");
      setDogMood("excited");
      if (isTimed) {
        roundCorrectRef.current += 1;
        setRoundCorrect(roundCorrectRef.current);
      }
    } else {
      addWrong(q as SentenceMatchQuestion, `配對錯誤 ${q.lefts.length - correctCount} 處`);
      setFlash("danger");
      setDogMood("sad");
    }
    if (isTimed) {
      roundAnsweredRef.current += 1;
      setRoundAnswered(roundAnsweredRef.current);
    }
    setTimeout(() => setFlash(null), 400);
  }

  function next() {
    if (isLastInRound) {
      if (isTimed) {
        finishRound(roundCorrectRef.current, roundAnsweredRef.current);
      } else {
        endQuiz();
      }
      return;
    }
    setIdx(idx + 1);
    setPairs({});
    setSelectedLeft(null);
    setChecked(false);
    setDogMood("thinking");
  }

  function rightStateClass(ri: number): string {
    if (!checked) {
      if (usedRights.has(ri)) return "bg-mint text-ink";
      return "bg-white hover:bg-cream text-ink";
    }
    const matchedLeft = Object.entries(pairs).find(([, v]) => v === ri);
    if (!matchedLeft) return "bg-white/50 text-ink/40";
    const li = Number(matchedLeft[0]);
    if (correctMap.get(li) === ri) return "bg-success text-white";
    return "bg-danger text-white";
  }

  function leftStateClass(i: number): string {
    if (!checked) {
      if (pairs[i] !== undefined) return "bg-mint text-ink";
      if (selectedLeft === i) return "bg-cream text-ink ring-4 ring-beret";
      return "bg-white hover:bg-cream text-ink";
    }
    if (pairs[i] === undefined) return "bg-white/50 text-ink/40";
    if (correctMap.get(i) === pairs[i]) return "bg-success text-white";
    return "bg-danger text-white";
  }

  return (
    <div
      className={`min-h-screen px-3 sm:px-4 py-4 pb-8 max-w-3xl mx-auto ${
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
          文型マッチ
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
        timerRunning={phase === "playing" && !checked}
      />

      <div className="flex items-end gap-2 mb-3">
        <PixelDog mood={dogMood} size={70} className="shrink-0" />
        <SpeechBubble className="flex-1 mb-2 min-w-0">
          <div className="text-xs">
            {!checked
              ? "左右を順番にタップしてペアを作ってね。"
              : Object.values(pairs).every(
                    (r, i) => correctMap.get(Number(Object.keys(pairs)[i])) === r
                  )
                ? "全部正解！すごい！"
                : "おしい！下の解説を見てね。"}
          </div>
        </SpeechBubble>
      </div>

      <div className="pixel-border bg-white shadow-pixel p-3 sm:p-4 mb-4">
        <div className="text-xs text-ink/60 mb-2 font-display">{q.prompt}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-[10px] font-display text-ink/50 sm:hidden">
              【前半】を選んで…
            </div>
            {q.lefts.map((l, i) => (
              <button
                key={i}
                disabled={checked}
                onClick={() => handleLeftClick(i)}
                className={`pixel-btn pixel-border shadow-pixelSm w-full p-2.5 sm:p-3 text-left text-sm font-pixel transition-colors ${leftStateClass(
                  i
                )}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="leading-snug break-words">{l}</span>
                  {pairs[i] !== undefined && (
                    <span className="font-display text-xs shrink-0">
                      → {String.fromCharCode(65 + pairs[i])}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-display text-ink/50 sm:hidden">
              …【後半】とペアに
            </div>
            {q.rights.map((r, i) => (
              <button
                key={i}
                disabled={checked}
                onClick={() => handleRightClick(i)}
                className={`pixel-btn pixel-border shadow-pixelSm w-full p-2.5 sm:p-3 text-left text-sm font-pixel transition-colors ${rightStateClass(
                  i
                )}`}
              >
                <span className="font-display text-xs mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="leading-snug break-words">{r}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {checked && (
        <div className="pixel-border bg-cream shadow-pixel p-4 mb-4 animate-pop">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="font-display text-xs text-ink">正解と訳：</div>
            <MasteryBadge
              count={correctCounts[isTimed ? "timed" : "combo"][q.id] ?? 0}
            />
          </div>
          <ul className="space-y-1 text-sm text-ink/90">
            {q.translations.map((t, i) => (
              <li key={i} className="leading-relaxed">
                ・{t}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-2">
        {!checked ? (
          <button
            onClick={check}
            disabled={!allMatched}
            className="pixel-btn pixel-border bg-beret text-white shadow-pixel px-6 py-3 font-display text-sm"
          >
            答え合わせ
          </button>
        ) : (
          <button
            onClick={next}
            className="pixel-btn pixel-border bg-beret text-white shadow-pixel px-6 py-3 font-display text-sm animate-pop"
          >
            {isLastInRound
              ? isTimed
                ? "ラウンド終了 →"
                : "結果を見る →"
              : "次へ →"}
          </button>
        )}
      </div>
    </div>
  );
}
