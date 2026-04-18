import type { DogMood } from "../types";

const PALETTE: Record<string, string> = {
  ".": "transparent",
  K: "#2b1e15", // outline (soft dark brown-black)
  O: "#d98845", // shiba orange (main)
  L: "#eab073", // orange highlight
  S: "#a8601f", // orange shadow
  W: "#f7e8c8", // cream (face mask / inner ear / chest)
  M: "#dcc9a0", // cream shadow
  B: "#1a1412", // eye pupil
  E: "#ffffff", // white highlight / tear
  P: "#f4a6a0", // blush pink
  T: "#e06560", // tongue red
  Y: "#f5c542", // sparkle yellow
  Z: "#7d7061", // sleep "Z" gray
  Q: "#6b5a4a", // thought mark brown-gray
  H: "#e8556b", // heart red (shy mood)
};

// 32×32 shiba inu portrait — rounded head with triangular ears,
// cream face mask, chest fluff. Face features (eyes / nose / mouth)
// are applied per-mood via overlays.
const BASE_PIXELS: string[] = [
  "................................", // 0
  "................................", // 1
  ".....KK..................KK.....", // 2  ear tips
  "....KOOK................KOOK....", // 3
  "...KOLLOK..............KOLLOK...", // 4
  "...KOWWOK..............KOWWOK...", // 5  inner ear cream
  "...KOWWOK..............KOWWOK...", // 6
  "...KOWWOK..............KOWWOK...", // 7
  "...KOOOOKKKKKKKKKKKKKKKKOOOOK...", // 8  ears merge with head top
  "..KOOOOOOOOOOOOOOOOOOOOOOOOOOK..", // 9  forehead
  "..KOLOOOOOOOOOOOOOOOOOOOOOOOLK..", // 10 forehead highlight on cheek side
  "..KOLOOOOOOOOOOOOOOOOOOOOOOOLK..", // 11
  "..KOOOOOOOOOOOOOOOOOOOOOOOOOOK..", // 12
  "..KOOOOOWWWWWWWWWWWWWWWWOOOOOK..", // 13 face mask starts
  "..KOOOOWWWWWWWWWWWWWWWWWWOOOOK..", // 14
  "..KOOOWWWWWWWWWWWWWWWWWWWWOOOK..", // 15
  "..KOOOWWWWWWWWWWWWWWWWWWWWOOOK..", // 16
  "..KOOOWWWWWWWWWWWWWWWWWWWWOOOK..", // 17
  "..KOOOWWWWWWWWWWWWWWWWWWWWOOOK..", // 18
  "..KOOOWWWWWWWWWWWWWWWWWWWWOOOK..", // 19
  "..KOOOOWWWWWWWWWWWWWWWWWWOOOOK..", // 20
  "..KOOOOOWWWWWWWWWWWWWWWWOOOOOK..", // 21
  "...KOOOOOWWWWWWWWWWWWWWOOOOOK...", // 22
  "....KKOOOOWWWWWWWWWWWWOOOOKK....", // 23 chin
  "........KKWWWWWWWWWWWWKK........", // 24 neck
  "...KWWWWWWWWWWWWWWWWWWWWWWWWK...", // 25 chest
  "...KWWMWWWWWWWWWWWWWWWWWWMWWK...", // 26
  "...KWWMWWWWWWWWWWWWWWWWWWMWWK...", // 27
  "...KWWWWWWWWWWWWWWWWWWWWWWWWK...", // 28
  "...KWWWWWWWWWWWWWWWWWWWWWWWWK...", // 29
  "....KKWWWWWWWWWWWWWWWWWWWWKK....", // 30
  "......KKKKKKKKKKKKKKKKKKKK......", // 31
];

type PixelGrid = string[];
type Overlay = Record<string, string>;

function applyOverlay(base: PixelGrid, overlay: Overlay): PixelGrid {
  return base.map((row, y) =>
    row
      .split("")
      .map((char, x) => overlay[`${y},${x}`] ?? char)
      .join("")
  );
}

// --- Face feature fragments (reused across moods) --- //

const NOSE: Overlay = {
  "16,15": "K",
  "16,16": "K",
  "17,15": "K",
  "17,16": "K",
};

// Open round eyes with a single white shine pixel
const EYES_OPEN: Overlay = {
  "14,10": "B",
  "14,11": "E",
  "15,10": "B",
  "15,11": "B",
  "14,20": "E",
  "14,21": "B",
  "15,20": "B",
  "15,21": "B",
};

// Closed happy arches (^ ^)
const EYES_ARCH: Overlay = {
  "14,9": "B",
  "14,12": "B",
  "13,10": "B",
  "13,11": "B",
  "14,19": "B",
  "14,22": "B",
  "13,20": "B",
  "13,21": "B",
};

// Horizontal line eyes (sleepy / squinting)
const EYES_LINE: Overlay = {
  "14,9": "K",
  "14,10": "K",
  "14,11": "K",
  "14,12": "K",
  "14,19": "K",
  "14,20": "K",
  "14,21": "K",
  "14,22": "K",
};

// Star / sparkle eyes (excited)
const EYES_SPARKLE: Overlay = {
  "13,10": "Y",
  "14,9": "Y",
  "14,10": "E",
  "14,11": "Y",
  "15,10": "Y",
  "13,20": "Y",
  "14,19": "Y",
  "14,20": "E",
  "14,21": "Y",
  "15,20": "Y",
};

// Down-cast eyes (shy)
const EYES_DOWN: Overlay = {
  "15,10": "B",
  "15,11": "B",
  "15,20": "B",
  "15,21": "B",
};

// Blush on cheeks
const BLUSH: Overlay = {
  "16,5": "P",
  "16,6": "P",
  "17,6": "P",
  "16,25": "P",
  "16,26": "P",
  "17,25": "P",
};

const BLUSH_HEAVY: Overlay = {
  "15,5": "P",
  "16,5": "P",
  "16,6": "P",
  "16,7": "P",
  "17,5": "P",
  "17,6": "P",
  "17,7": "P",
  "18,6": "P",
  "15,26": "P",
  "16,24": "P",
  "16,25": "P",
  "16,26": "P",
  "17,24": "P",
  "17,25": "P",
  "17,26": "P",
  "18,25": "P",
};

// Mouths
const MOUTH_NEUTRAL: Overlay = {
  "19,15": "K",
  "19,16": "K",
};

const MOUTH_SMILE: Overlay = {
  "19,13": "K",
  "19,18": "K",
  "20,14": "K",
  "20,15": "T",
  "20,16": "T",
  "20,17": "K",
  "21,15": "K",
  "21,16": "K",
};

const MOUTH_WIDE: Overlay = {
  "18,13": "K",
  "18,14": "K",
  "18,15": "K",
  "18,16": "K",
  "18,17": "K",
  "18,18": "K",
  "19,12": "K",
  "19,13": "T",
  "19,14": "T",
  "19,15": "T",
  "19,16": "T",
  "19,17": "T",
  "19,18": "T",
  "19,19": "K",
  "20,13": "K",
  "20,14": "T",
  "20,15": "T",
  "20,16": "T",
  "20,17": "T",
  "20,18": "K",
  "21,14": "K",
  "21,15": "K",
  "21,16": "K",
  "21,17": "K",
};

const MOUTH_FROWN: Overlay = {
  "20,13": "K",
  "20,18": "K",
  "19,14": "K",
  "19,15": "K",
  "19,16": "K",
  "19,17": "K",
};

const MOUTH_SMUG: Overlay = {
  "19,13": "K",
  "19,14": "K",
  "19,15": "K",
  "18,16": "K",
};

const MOUTH_TINY: Overlay = {
  "19,15": "K",
  "19,16": "K",
};

const TEAR: Overlay = {
  "16,10": "E",
  "17,10": "E",
  "18,10": "E",
};

// --- Decoration fragments (above the head) --- //

const SPARKLES: Overlay = {
  "1,4": "Y",
  "2,3": "Y",
  "1,27": "Y",
  "2,28": "Y",
  "0,15": "Y",
  "0,16": "Y",
};

const PROUD_GLINT: Overlay = {
  "10,3": "E",
  "11,3": "Y",
  "10,28": "E",
  "11,28": "Y",
};

// "Z" symbol (sleepy) — drawn at rows 0-4 in the gap between the ears
const SLEEP_Z: Overlay = {
  "0,13": "Z",
  "0,14": "Z",
  "0,15": "Z",
  "0,16": "Z",
  "1,16": "Z",
  "2,15": "Z",
  "3,14": "Z",
  "4,13": "Z",
  "4,14": "Z",
  "4,15": "Z",
  "4,16": "Z",
};

// "?" mark (thinking)
const QUESTION: Overlay = {
  "0,12": "Q",
  "0,13": "Q",
  "0,14": "Q",
  "1,14": "Q",
  "2,14": "Q",
  "3,13": "Q",
  "5,13": "Q",
};

// Little heart (shy)
const HEART: Overlay = {
  "1,14": "H",
  "1,15": "H",
  "1,17": "H",
  "1,18": "H",
  "2,14": "H",
  "2,15": "H",
  "2,16": "H",
  "2,17": "H",
  "2,18": "H",
  "3,15": "H",
  "3,16": "H",
  "3,17": "H",
  "4,16": "H",
};

// --- Mood → overlay composition --- //

function merge(...parts: Overlay[]): Overlay {
  return Object.assign({}, ...parts);
}

const MOOD_OVERLAYS: Record<DogMood, Overlay> = {
  idle: merge(EYES_OPEN, NOSE, MOUTH_NEUTRAL),
  happy: merge(EYES_ARCH, NOSE, MOUTH_SMILE, BLUSH),
  excited: merge(EYES_SPARKLE, NOSE, MOUTH_WIDE, SPARKLES),
  sad: merge(EYES_OPEN, NOSE, MOUTH_FROWN, TEAR),
  sleepy: merge(EYES_LINE, NOSE, MOUTH_TINY, SLEEP_Z),
  thinking: merge(EYES_OPEN, { "14,20": "K", "14,21": "K", "15,20": "W", "15,21": "W" }, NOSE, MOUTH_TINY, QUESTION),
  proud: merge(EYES_ARCH, NOSE, MOUTH_SMUG, PROUD_GLINT),
  shy: merge(EYES_DOWN, NOSE, MOUTH_TINY, BLUSH_HEAVY, HEART),
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
  const grid = applyOverlay(BASE_PIXELS, MOOD_OVERLAYS[mood]);

  const animClass = animated
    ? mood === "excited"
      ? "animate-bounceSoft"
      : mood === "sad"
      ? "animate-shake"
      : mood === "sleepy"
      ? "animate-floatY"
      : "animate-floatY"
    : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`${animClass} ${className}`}
      style={{ imageRendering: "pixelated" }}
      aria-label={`像素柴犬 - ${mood}`}
      role="img"
    >
      {grid.map((row, y) =>
        row.split("").map((char, x) => {
          if (char === "." || !PALETTE[char]) return null;
          return (
            <rect
              key={`${y}-${x}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={PALETTE[char]}
            />
          );
        })
      )}
    </svg>
  );
}
