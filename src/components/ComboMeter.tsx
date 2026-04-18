interface ComboMeterProps {
  combo: number;
}

export function ComboMeter({ combo }: ComboMeterProps) {
  if (combo < 2) {
    return (
      <div className="flex items-center gap-1 text-ink/50 text-sm">
        <FlameIcon size={18} dim />
        <span>COMBO 0</span>
      </div>
    );
  }

  const intensity = Math.min(combo, 10);

  return (
    <div
      key={combo}
      className="flex items-center gap-1 font-display text-sm animate-pop"
    >
      <FlameIcon size={20 + intensity} />
      <span
        className="combo-flame"
        style={{
          color: intensity >= 5 ? "#e8745d" : "#f5a623",
          fontSize: `${14 + intensity * 0.4}px`,
        }}
      >
        COMBO ×{combo}
      </span>
    </div>
  );
}

function FlameIcon({ size = 20, dim = false }: { size?: number; dim?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    >
      {/* 像素火焰 */}
      <rect x="4" y="1" width="2" height="1" fill={dim ? "#b5b5b5" : "#f5a623"} />
      <rect x="3" y="2" width="4" height="1" fill={dim ? "#b5b5b5" : "#f5a623"} />
      <rect x="2" y="3" width="6" height="1" fill={dim ? "#b5b5b5" : "#e8745d"} />
      <rect x="1" y="4" width="8" height="2" fill={dim ? "#b5b5b5" : "#e8745d"} />
      <rect x="2" y="6" width="6" height="1" fill={dim ? "#a0a0a0" : "#b85238"} />
      <rect x="3" y="7" width="4" height="1" fill={dim ? "#a0a0a0" : "#b85238"} />
      <rect x="4" y="4" width="2" height="3" fill={dim ? "#d5d5d5" : "#f5dfa8"} />
    </svg>
  );
}
