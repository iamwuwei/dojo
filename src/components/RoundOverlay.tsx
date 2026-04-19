import { PixelDog } from "./PixelDog";
import { TOTAL_ROUNDS } from "../lib/rounds";

interface RoundIntroProps {
  roundIdx: number;
  duration: number;
  questionsPerRound: number;
  passRatio: number;
  onStart: () => void;
}

export function RoundIntro({
  roundIdx,
  duration,
  questionsPerRound,
  passRatio,
  onStart,
}: RoundIntroProps) {
  const passNeeded = Math.ceil(questionsPerRound * passRatio);
  return (
    <CenteredCard>
      <PixelDog mood="excited" size={120} className="mx-auto mb-3" />
      <div className="font-display text-xs text-ink/60 mb-1">
        Round {roundIdx + 1} / {TOTAL_ROUNDS}
      </div>
      <h2 className="font-display text-xl text-ink mb-2">
        ⏱ {duration}s で {questionsPerRound} 題
      </h2>
      <p className="text-sm text-ink/80 mb-4">
        過關條件：答對 <span className="font-display">{passNeeded} / {questionsPerRound}</span>
      </p>
      <button
        onClick={onStart}
        className="pixel-btn pixel-border bg-beret text-white shadow-pixel px-6 py-3 font-display text-sm"
      >
        スタート →
      </button>
    </CenteredCard>
  );
}

interface RoundClearedProps {
  roundIdx: number;
  correct: number;
  total: number;
  passNeeded: number;
  onContinue: () => void;
}

export function RoundCleared({
  roundIdx,
  correct,
  total,
  passNeeded,
  onContinue,
}: RoundClearedProps) {
  return (
    <CenteredCard>
      <PixelDog mood="proud" size={120} className="mx-auto mb-3" />
      <div className="font-display text-xs text-ink/60 mb-1">
        Round {roundIdx + 1} / {TOTAL_ROUNDS}
      </div>
      <h2 className="font-display text-xl text-success mb-2">クリア！🎉</h2>
      <p className="text-sm text-ink/80 mb-1">
        答對 <span className="font-display">{correct} / {total}</span>
        <span className="text-ink/50 text-xs ml-2">(需要 {passNeeded})</span>
      </p>
      <p className="text-xs text-ink/60 mb-4">下一回合時間更短，準備好了嗎？</p>
      <button
        onClick={onContinue}
        className="pixel-btn pixel-border bg-beret text-white shadow-pixel px-6 py-3 font-display text-sm"
      >
        次のラウンド →
      </button>
    </CenteredCard>
  );
}

interface RoundChampionProps {
  totalCorrect: number;
  totalQuestions: number;
  onFinish: () => void;
}

export function RoundChampion({
  totalCorrect,
  totalQuestions,
  onFinish,
}: RoundChampionProps) {
  return (
    <CenteredCard>
      <PixelDog mood="excited" size={140} className="mx-auto mb-3" />
      <h2 className="font-display text-2xl text-combo mb-2">🏆 Champion！</h2>
      <p className="text-sm text-ink/80 mb-1">
        全 {TOTAL_ROUNDS} ラウンド突破
      </p>
      <p className="text-sm text-ink/80 mb-4">
        トータル <span className="font-display">{totalCorrect} / {totalQuestions}</span>
      </p>
      <button
        onClick={onFinish}
        className="pixel-btn pixel-border bg-beret text-white shadow-pixel px-6 py-3 font-display text-sm"
      >
        結果を見る →
      </button>
    </CenteredCard>
  );
}

interface RoundFailedProps {
  roundIdx: number;
  correct: number;
  total: number;
  passNeeded: number;
  onFinish: () => void;
}

export function RoundFailed({
  roundIdx,
  correct,
  total,
  passNeeded,
  onFinish,
}: RoundFailedProps) {
  return (
    <CenteredCard>
      <PixelDog mood="sad" size={120} className="mx-auto mb-3" />
      <div className="font-display text-xs text-ink/60 mb-1">
        Round {roundIdx + 1} / {TOTAL_ROUNDS}
      </div>
      <h2 className="font-display text-xl text-danger mb-2">倒下した…💧</h2>
      <p className="text-sm text-ink/80 mb-1">
        答對 <span className="font-display">{correct} / {total}</span>
        <span className="text-ink/50 text-xs ml-2">(需要 {passNeeded})</span>
      </p>
      <p className="text-xs text-ink/60 mb-4">
        通關到 Round {roundIdx + 1}。再來一次！
      </p>
      <button
        onClick={onFinish}
        className="pixel-btn pixel-border bg-beret text-white shadow-pixel px-6 py-3 font-display text-sm"
      >
        結果を見る →
      </button>
    </CenteredCard>
  );
}

interface NotEnoughProps {
  needed: number;
  have: number;
  onHome: () => void;
}

export function NotEnoughQuestions({ needed, have, onHome }: NotEnoughProps) {
  return (
    <CenteredCard>
      <PixelDog mood="thinking" size={120} className="mx-auto mb-3" />
      <h2 className="font-display text-base text-ink mb-2">題目不夠跑 3 回合</h2>
      <p className="text-sm text-ink/80 mb-1">
        需要至少 <span className="font-display">{needed}</span> 題，現在剩{" "}
        <span className="font-display">{have}</span> 題
      </p>
      <p className="text-xs text-ink/60 mb-4">
        先去コンボ模式練一下，或讓已掌握的題目暫時放著。
      </p>
      <button
        onClick={onHome}
        className="pixel-btn pixel-border bg-beret text-white shadow-pixel px-6 py-3 font-display text-sm"
      >
        ← 戻る
      </button>
    </CenteredCard>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-4 py-8 max-w-xl mx-auto flex flex-col items-center justify-center">
      <div className="pixel-border bg-white shadow-pixel p-6 text-center w-full animate-pop">
        {children}
      </div>
    </div>
  );
}
