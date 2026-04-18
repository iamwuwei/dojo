interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.min(100, (current / total) * 100);
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-ink/70 mb-1 font-display">
          <span>{label}</span>
          <span>
            {current} / {total}
          </span>
        </div>
      )}
      <div className="h-5 pixel-border bg-paperDark relative overflow-hidden">
        <div
          className="h-full bg-mintDark transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
        {/* 像素顆粒感 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(45,62,52,0.18) 0, rgba(45,62,52,0.18) 2px, transparent 2px, transparent 8px)",
          }}
        />
      </div>
    </div>
  );
}
