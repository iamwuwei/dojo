import { useEffect, useRef, useState } from "react";

interface TimerProps {
  seconds: number;
  onTimeUp: () => void;
  running?: boolean;
}

export function Timer({ seconds, onTimeUp, running = true }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  // Reset remaining when the configured seconds changes (e.g. new round).
  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      onTimeUpRef.current();
      return;
    }
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const danger = remaining <= 10;

  return (
    <div
      className={`font-display text-sm px-3 py-2 pixel-border shadow-pixelSm ${
        danger ? "bg-danger/20 text-danger animate-shake" : "bg-white text-ink"
      }`}
    >
      ⏱ {mm}:{ss}
    </div>
  );
}
