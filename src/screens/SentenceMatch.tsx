import { useMemo, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { PixelDog } from "../components/PixelDog";
import { SpeechBubble } from "../components/SpeechBubble";
import { ScoreBar } from "../components/ScoreBar";
import { sentenceQuestions } from "../data/sentence";
import type { DogMood, SentenceMatchQuestion } from "../types";

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
  const { score, combo, addCorrect, addWrong, endQuiz, goHome } = useGameStore();

  const [queue] = useState(() => shuffle(sentenceQuestions));
  const [idx, setIdx] = useState(0);
  const q = queue[idx];

  // 當前配對：pairs[leftIdx] = rightIdx (在 rights 陣列裡的 index)
  const [pairs, setPairs] = useState<Record<number, number>>({});
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [flash, setFlash] = useState<"success" | "danger" | null>(null);
  const [dogMood, setDogMood] = useState<DogMood>("thinking");

  // 右邊是否已被配對
  const usedRights = useMemo(
    () => new Set(Object.values(pairs)),
    [pairs]
  );

  const allMatched =
    Object.keys(pairs).length === q.lefts.length && !checked;

  function handleLeftClick(i: number) {
    if (checked) return;
    // 如果已配對，取消配對
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
      // 找到是哪個 left 用了這個 right，取消
      const leftEntry = Object.entries(pairs).find(
        ([, v]) => v === ri
      );
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
    // 比對答案
    const correctMap = new Map<number, number>(q.pairs); // leftIdx → rightIdx
    let correctCount = 0;
    const wrongPairs: Array<[number, number]> = [];
    Object.entries(pairs).forEach(([l, r]) => {
      const li = Number(l);
      if (correctMap.get(li) === r) correctCount++;
      else wrongPairs.push([li, r]);
    });
    const allRight = correctCount === q.lefts.length;
    if (allRight) {
      const points = 400 + combo * 20;
      addCorrect(points);
      setFlash("success");
      setDogMood("excited");
    } else {
      addWrong(q as SentenceMatchQuestion, `配對錯誤 ${wrongPairs.length} 處`);
      setFlash("danger");
      setDogMood("sad");
    }
    setTimeout(() => setFlash(null), 400);
  }

  function next() {
    if (idx >= queue.length - 1) {
      endQuiz();
      return;
    }
    setIdx(idx + 1);
    setPairs({});
    setSelectedLeft(null);
    setChecked(false);
    setDogMood("thinking");
  }

  const correctMap = new Map<number, number>(q.pairs);

  function rightStateClass(ri: number): string {
    if (!checked) {
      if (usedRights.has(ri)) return "bg-mint text-ink";
      return "bg-white hover:bg-cream text-ink";
    }
    // checked 狀態
    const matchedLeft = Object.entries(pairs).find(
      ([, v]) => v === ri
    );
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
        <h2 className="font-display text-xs sm:text-sm text-ink">文型マッチ</h2>
        <div className="w-[60px] sm:w-[70px]" />
      </div>

      <ScoreBar
        score={score}
        combo={combo}
        current={idx + 1}
        total={queue.length}
        timerSeconds={mode === "timed" ? 120 : undefined}
        onTimeUp={endQuiz}
        timerRunning={!checked}
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
        <div className="text-xs text-ink/60 mb-2 font-display">
          {q.prompt}
        </div>

        {/* 手機：上下堆疊；桌面：左右並排 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 左側：句子前半 */}
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
          {/* 右側：句子後半 */}
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

      {/* 解答／翻譯 */}
      {checked && (
        <div className="pixel-border bg-cream shadow-pixel p-4 mb-4 animate-pop">
          <div className="font-display text-xs text-ink mb-2">正解と訳：</div>
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
            {idx >= queue.length - 1 ? "結果を見る →" : "次へ →"}
          </button>
        )}
      </div>
    </div>
  );
}
