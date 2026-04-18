import type { ReactNode } from "react";

interface SpeechBubbleProps {
  children: ReactNode;
  direction?: "left" | "right";
  className?: string;
}

export function SpeechBubble({
  children,
  direction = "left",
  className = "",
}: SpeechBubbleProps) {
  return (
    <div className={`relative inline-block min-w-0 ${className}`}>
      <div className="pixel-border bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-ink text-sm sm:text-base leading-relaxed shadow-pixelSm break-words">
        {children}
      </div>
      {/* 尾巴（像素三角）*/}
      <div
        className={`absolute bottom-[-10px] ${
          direction === "left" ? "left-6" : "right-6"
        } w-0 h-0`}
        style={{
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "10px solid #2d3e34",
        }}
      />
      <div
        className={`absolute bottom-[-6px] ${
          direction === "left" ? "left-[28px] " : "right-[28px]"
        } w-0 h-0`}
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "7px solid white",
        }}
      />
    </div>
  );
}
