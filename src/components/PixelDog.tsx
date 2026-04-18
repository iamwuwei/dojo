import type { DogMood } from "../types";

const PALETTE: Record<string, string> = {
  ".": "transparent",
  K: "#000000",
  D: "#3a3a3a",
  G: "#5a5a5a",
  W: "#e8dcc4",
  B: "#000000",
  P: "#f2a18a",
  E: "#ffffff",
};

const BASE_PIXELS = [
  "................KK..............",
  "............KKKKKKKKKK..........",
  "...KKKK....KGGWWWWWWGGK...KKKK..",
  "..KGGGGK..KGGWWWWWWGGGGK.KGGGGK.",
  ".KGGWWGGK.KGGWWWWWWGGGGKKKGGWGGK",
  ".KGGWWGGKKGGGGWWWWGGGGGGGGGGWGGK",
  "KGGWWWGGGGGGGGWWWWGGGGGGGGGGWWGK",
  "KGGWWWGGGGGGGGWWWWGGGGGGGGGGWWGK",
  "KGGWWWGGGGGGGGWWWWGGGGGGGGGGWWGK",
  "KGGWWWGGGGGGGGWWWWGGGGGGGGGGWWGK",
  ".KGGWWGGGGGGGGWWWWGGGGGGGGGGWGGK",
  ".KGGWWGGGGGGGGWWWWGGGGGGGGGGWGGK",
  "..KGGGGGGGGGGGGWWWWGGGGGGGGGGGGK",
  "...KGGGGGGGGGGGWWWWGGGGGGGGGGGK.",
  "....KGGGGGGGGGGWWWWGGGGGGGGGGK..",
  ".....KGGGGGGGGGWWWWGGGGGGGGGK...",
  ".....KGGGGGGGGWWWWWWGGGGGGGGK...",
  "....KGGWWWWWWWWWWWWWWWWWWGGGGK...",
  "...KGGWWWWWWWWWWWWWWWWWWWWGGGK...",
  "...KGGWWWWWWWWWWWWWWWWWWWWGGGK...",
  "....KGGGGGGGGGGGGGGGGGGGGGGGK...",
  "....KGGGGGGGGGGGGGGGGGGGGGGGK...",
  ".....KGGWWWWWWWWWWWWWWWWGGK....",
  ".....KGGWWWWWWWWWWWWWWWWGGK....",
  ".....KGGWWWWWWWWWWWWWWWWGGK....",
  "......KGGWWWWWWWWWWWWWWGK......",
  "......KGGWWWWWWWWWWWWWWGK......",
  ".......KGGGGGGGGGGGGGGGK.......",
  ".......KGGGGGGGGGGGGGGGK.......",
  "......KGGWWGKKGWWGGWWGK........",
  "......KGGWWGKKGWWGGWWGK........",
  ".......KGGGGKKGGGGGGGGK........",
];

type PixelGrid = string[];

function applyOverlay(base: PixelGrid, overlay: Record<string, string>): PixelGrid {
  return base.map((row, y) =>
    row
      .split("")
      .map((char, x) => overlay[`${y},${x}`] ?? char)
      .join("")
  );
}

function idleFace(): PixelGrid {
  return applyOverlay(BASE_PIXELS, {
    "4,13": "E",
    "4,18": "E",
    "5,13": "B",
    "5,18": "B",
    "8,15": "B",
    "8,16": "B",
    "9,14": "B",
    "9,17": "B",
    "10,14": "B",
    "10,17": "B",
    "11,13": "B",
    "11,14": "B",
    "11,17": "B",
    "11,18": "B",
  });
}

function happyFace(): PixelGrid {
  return applyOverlay(BASE_PIXELS, {
    "4,13": "E",
    "4,18": "E",
    "5,13": "B",
    "5,18": "B",
    "8,15": "B",
    "8,16": "B",
    "9,14": "B",
    "9,17": "B",
    "10,14": "B",
    "10,17": "B",
    "11,12": "B",
    "11,13": "B",
    "11,14": "B",
    "11,17": "B",
    "11,18": "B",
    "11,19": "B",
    "6,8": "P",
    "6,24": "P",
  });
}

function sadFace(): PixelGrid {
  return applyOverlay(BASE_PIXELS, {
    "4,13": "E",
    "4,18": "E",
    "5,12": "B",
    "5,13": "B",
    "5,18": "B",
    "5,19": "B",
    "8,15": "B",
    "8,16": "B",
    "9,14": "B",
    "9,17": "B",
    "10,14": "B",
    "10,17": "B",
    "11,14": "B",
    "11,17": "B",
    "12,13": "E",
    "12,18": "E",
  });
}

function excitedFace(): PixelGrid {
  return applyOverlay(BASE_PIXELS, {
    "3,13": "E",
    "3,18": "E",
    "4,13": "E",
    "4,18": "E",
    "5,13": "B",
    "5,18": "B",
    "8,15": "B",
    "8,16": "B",
    "9,14": "B",
    "9,17": "B",
    "10,14": "B",
    "10,17": "B",
    "11,12": "B",
    "11,13": "B",
    "11,14": "B",
    "11,17": "B",
    "11,18": "B",
    "11,19": "B",
    "6,7": "P",
    "6,25": "P",
    "7,7": "P",
    "7,25": "P",
  });
}

function sleepyFace(): PixelGrid {
  return applyOverlay(BASE_PIXELS, {
    "4,12": "B",
    "4,13": "B",
    "4,14": "B",
    "4,17": "B",
    "4,18": "B",
    "4,19": "B",
    "5,13": "B",
    "5,18": "B",
    "8,15": "B",
    "8,16": "B",
    "9,14": "B",
    "9,17": "B",
    "10,14": "B",
    "10,17": "B",
    "11,14": "B",
    "11,17": "B",
  });
}

function thinkingFace(): PixelGrid {
  return applyOverlay(BASE_PIXELS, {
    "4,13": "E",
    "4,18": "E",
    "5,13": "B",
    "5,18": "B",
    "8,15": "B",
    "8,16": "B",
    "9,14": "B",
    "9,17": "B",
    "10,14": "B",
    "10,17": "B",
    "11,15": "B",
    "11,16": "B",
    "2,2": "B",
    "3,1": "B",
    "4,0": "B",
  });
}

function shyFace(): PixelGrid {
  return applyOverlay(BASE_PIXELS, {
    "4,13": "E",
    "4,18": "E",
    "5,12": "B",
    "5,13": "B",
    "5,18": "B",
    "5,19": "B",
    "8,15": "B",
    "8,16": "B",
    "9,14": "B",
    "9,17": "B",
    "10,14": "B",
    "10,17": "B",
    "11,13": "B",
    "11,14": "B",
    "11,17": "B",
    "11,18": "B",
    "6,8": "P",
    "6,24": "P",
  });
}

function proudFace(): PixelGrid {
  return applyOverlay(BASE_PIXELS, {
    "4,13": "E",
    "4,18": "E",
    "5,13": "B",
    "5,18": "B",
    "8,15": "B",
    "8,16": "B",
    "9,14": "B",
    "9,17": "B",
    "10,14": "B",
    "10,17": "B",
    "11,12": "B",
    "11,13": "B",
    "11,14": "B",
    "11,17": "B",
    "11,18": "B",
    "11,19": "B",
    "6,8": "P",
    "6,24": "P",
    "7,8": "P",
    "7,24": "P",
  });
}

const MOODS: Record<DogMood, () => PixelGrid> = {
  idle: idleFace,
  happy: happyFace,
  sad: sadFace,
  excited: excitedFace,
  sleepy: sleepyFace,
  thinking: thinkingFace,
  shy: shyFace,
  proud: proudFace,
};

interface PixelDogProps {
  mood?: DogMood;
  size?: number;
  className?: string;
  animated?: boolean;
}

export function PixelDog({
  mood = "idle",
  size = 160,
  className = "",
  animated = true,
}: PixelDogProps) {
  const grid = MOODS[mood]();
  const animClass = animated
    ? mood === "excited"
      ? "animate-bounceSoft"
      : mood === "sad"
      ? "animate-shake"
      : "animate-floatY"
    : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`${animClass} ${className}`}
      style={{ imageRendering: "pixelated" }}
      aria-label={`像素狗 - ${mood}`}
      role="img"
    >
      {grid.map((row, y) =>
        row.split("").map((char, x) =>
          char !== "." ? (
            <rect
              key={`${y}-${x}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={PALETTE[char]}
            />
          ) : null
        )
      )}
    </svg>
  );
}
