/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4ecd8",
        paperDark: "#e8dfc6",
        ink: "#2d3e34",
        beret: "#e8745d",
        beretDark: "#b85238",
        mint: "#a8c4a2",
        mintDark: "#6b9968",
        sky: "#8db9d1",
        cream: "#f5dfa8",
        dogBody: "#e8c890",
        dogShadow: "#b89868",
        combo: "#f5a623",
        success: "#6fa85c",
        danger: "#d96a5c",
      },
      fontFamily: {
        pixel: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        pixel: "4px 4px 0 0 #2d3e34",
        pixelSm: "2px 2px 0 0 #2d3e34",
        pixelLg: "6px 6px 0 0 #2d3e34",
        pixelInset: "inset 2px 2px 0 0 rgba(0,0,0,0.15)",
      },
      animation: {
        bounceSoft: "bounceSoft 1.2s ease-in-out infinite",
        wiggle: "wiggle 0.4s ease-in-out",
        pop: "pop 0.25s ease-out",
        shake: "shake 0.35s",
        floatY: "floatY 2.4s ease-in-out infinite",
      },
      keyframes: {
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0)" },
          "25%": { transform: "rotate(-6deg)" },
          "75%": { transform: "rotate(6deg)" },
        },
        pop: {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};
