import { MASTERY_THRESHOLD } from "../store/useGameStore";

interface Props {
  count: number;
  className?: string;
}

// Shows the per-question mastery progress as filled/empty dots, e.g. ●●○.
// When the user just hit MASTERY_THRESHOLD it celebrates instead.
export function MasteryBadge({ count, className = "" }: Props) {
  const dots = Array.from({ length: MASTERY_THRESHOLD }, (_, i) =>
    i < count ? "●" : "○"
  ).join(" ");

  if (count >= MASTERY_THRESHOLD) {
    return (
      <div
        className={`text-[11px] font-display text-success animate-pop ${className}`}
      >
        🏅 マスター！ {dots}
      </div>
    );
  }

  const remaining = MASTERY_THRESHOLD - count;
  return (
    <div className={`text-[11px] text-ink/70 font-display ${className}`}>
      進度 <span className="text-mintDark text-sm">{dots}</span>{" "}
      <span className="text-ink/50">あと {remaining}</span>
    </div>
  );
}
