import { useGameStore } from "../store/useGameStore";
import { PixelDog } from "../components/PixelDog";
import { SpeechBubble } from "../components/SpeechBubble";
import type { AnyQuestion } from "../types";

export function MistakeBook() {
  const { mistakes, goHome, clearMistakes, removeMistake } = useGameStore();

  return (
    <div className="min-h-screen px-3 sm:px-4 py-4 pb-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3 gap-2">
        <button
          onClick={goHome}
          className="pixel-btn pixel-border bg-white text-ink text-xs px-3 py-2 shadow-pixelSm btn-compact shrink-0"
        >
          ← 戻る
        </button>
        <h2 className="font-display text-xs sm:text-sm text-ink">間違いノート</h2>
        <button
          onClick={() => {
            if (confirm("本当に全て削除する？")) clearMistakes();
          }}
          disabled={mistakes.length === 0}
          className="pixel-btn pixel-border bg-white text-danger text-xs px-3 py-2 shadow-pixelSm btn-compact disabled:opacity-40 shrink-0"
        >
          クリア
        </button>
      </div>

      {mistakes.length === 0 ? (
        <section className="flex flex-col items-center justify-center mt-12">
          <PixelDog mood="sleepy" size={110} />
          <SpeechBubble className="mt-4">
            <div className="text-sm">まだ間違いがないよ。えらい！</div>
          </SpeechBubble>
        </section>
      ) : (
        <>
          <section className="flex items-end gap-2 mb-3">
            <PixelDog mood="thinking" size={70} className="shrink-0" />
            <SpeechBubble className="flex-1 mb-2 min-w-0">
              <div className="text-xs">
                {mistakes.length} 題あるよ。一緒に見直そう！
              </div>
            </SpeechBubble>
          </section>

          <ul className="space-y-3">
            {mistakes.map((m, i) => (
              <li
                key={m.question.id + i}
                className="pixel-border bg-white shadow-pixel p-4 relative"
              >
                <button
                  onClick={() => removeMistake(m.question.id)}
                  className="absolute top-2 right-2 text-ink/50 hover:text-danger text-xs"
                  aria-label="刪除"
                >
                  ✕
                </button>
                <MistakeContent q={m.question} userAnswer={m.userAnswer} />
                <div className="text-[10px] text-ink/40 mt-2 font-display">
                  {new Date(m.timestamp).toLocaleString("ja-JP")}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function MistakeContent({
  q,
  userAnswer,
}: {
  q: AnyQuestion;
  userAnswer: string;
}) {
  if (q.type === "vocabulary") {
    return (
      <div>
        <div className="text-xs text-ink/60 font-display mb-1">単語</div>
        <div className="text-base text-ink font-pixel mb-2">{q.question}</div>
        <div className="text-sm">
          <span className="text-danger">你的答案：{userAnswer}</span>
          <span className="mx-2">/</span>
          <span className="text-success">正解：{q.options[q.answer]}</span>
        </div>
        {q.explanation && (
          <div className="text-xs text-ink/70 mt-2 bg-cream p-2 pixel-border">
            💡 {q.explanation}
          </div>
        )}
      </div>
    );
  }

  if (q.type === "grammar") {
    return (
      <div>
        <div className="text-xs text-ink/60 font-display mb-1">文法</div>
        <div className="text-base text-ink font-pixel mb-1">
          {q.sentence.replace("___", "_ _ _")}
        </div>
        <div className="text-xs text-ink/60 mb-2">中: {q.translation}</div>
        <div className="text-sm">
          <span className="text-danger">你的答案：{userAnswer}</span>
          <span className="mx-2">/</span>
          <span className="text-success">正解：{q.options[q.answer]}</span>
        </div>
        {q.explanation && (
          <div className="text-xs text-ink/70 mt-2 bg-cream p-2 pixel-border">
            💡 {q.explanation}
          </div>
        )}
      </div>
    );
  }

  if (q.type === "sentence") {
    return (
      <div>
        <div className="text-xs text-ink/60 font-display mb-1">文型</div>
        <div className="text-sm text-ink font-pixel mb-2">{q.prompt}</div>
        <div className="text-xs text-danger mb-2">{userAnswer}</div>
        <div className="text-xs text-ink/70 bg-cream p-2 pixel-border space-y-1">
          {q.translations.map((t, i) => (
            <div key={i}>・{t}</div>
          ))}
        </div>
      </div>
    );
  }

  if (q.type === "flashcard") {
    return (
      <div>
        <div className="text-xs text-ink/60 font-display mb-1">単語カード</div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-2xl font-pixel text-ink">{q.front}</span>
          {q.reading && (
            <span className="text-sm text-ink/70">{q.reading}</span>
          )}
        </div>
        <div className="text-sm text-success mb-1">意味：{q.back}</div>
        {q.example && (
          <div className="text-xs text-ink/70 bg-cream p-2 pixel-border">
            {q.example}
          </div>
        )}
      </div>
    );
  }

  return null;
}
