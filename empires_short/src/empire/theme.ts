import type { SpringConfig } from "remotion";
import type { Severity } from "./types";

export const palette = {
  obsidian: "#090A0F",
  obsidianLift: "#12131B",
  crimson: "#EF4444",
  crimsonDeep: "#7F1D1D",
  gold: "#D97706",
  bone: "#F5F5F4",
  ash: "#A8A29E",
  grid: "rgba(245,245,244,0.07)",
} as const;

/** Tight, punchy springs — minimal overshoot, fast settle. */
export const springs = {
  pop: { damping: 14, stiffness: 260, mass: 0.6 } satisfies Partial<SpringConfig>,
  snap: { damping: 22, stiffness: 320, mass: 0.7 } satisfies Partial<SpringConfig>,
  settle: { damping: 30, stiffness: 180, mass: 1 } satisfies Partial<SpringConfig>,
} as const;

export const severityColor: Record<Severity, string> = {
  info: palette.bone,
  peak: palette.gold,
  warning: palette.gold,
  failure: palette.crimson,
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
