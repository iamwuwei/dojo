import { ComboMeter } from "./ComboMeter";
import { Timer } from "./Timer";
import { ProgressBar } from "./ProgressBar";

interface ScoreBarProps {
  score: number;
  combo: number;
  current: number;
  total: number;
  timerSeconds?: number;
  onTimeUp?: () => void;
  timerRunning?: boolean;
}

export function ScoreBar({
  score,
  combo,
  current,
  total,
  timerSeconds,
  onTimeUp,
  timerRunning = true,
}: ScoreBarProps) {
  return (
    <div className="w-full space-y-3 mb-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          <div className="font-display text-xs sm:text-sm bg-white pixel-border px-2 sm:px-3 py-1.5 sm:py-2 shadow-pixelSm btn-compact flex items-center">
            スコア {score}
          </div>
          <ComboMeter combo={combo} />
        </div>
        {timerSeconds !== undefined && onTimeUp && (
          <div className="shrink-0">
            <Timer
              seconds={timerSeconds}
              onTimeUp={onTimeUp}
              running={timerRunning}
            />
          </div>
        )}
      </div>
      <ProgressBar current={current} total={total} label="進度" />
    </div>
  );
}
