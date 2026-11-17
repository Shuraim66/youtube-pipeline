import React from "react";
import { motion } from "framer-motion";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette, springs } from "../theme";

interface KineticHeadlineProps {
  text: string;
  /** Words to paint in the accent colour (case-insensitive). */
  emphasis?: readonly string[];
  accent?: string;
  /** Frames between each word's entrance. */
  stagger?: number;
  /** Frame (relative to the parent Sequence) the first word enters. */
  delay?: number;
  /** Max words per stacked line. */
  wordsPerLine?: number;
  fontSize?: number;
  className?: string;
}

const chunk = <T,>(items: readonly T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

/**
 * Splits a line into single words that scale-pop in on a tight spring, stacked
 * into short phrase rows for mobile readability.
 *
 * Framer Motion's `motion.span` is used as the render node, but every value is
 * driven by Remotion's frame clock — Framer's own time-based `animate` would
 * desync during frame-by-frame rendering.
 */
export const KineticHeadline: React.FC<KineticHeadlineProps> = ({
  text,
  emphasis = [],
  accent = palette.crimson,
  stagger = 4,
  delay = 0,
  wordsPerLine = 3,
  fontSize = 112,
  className = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const emphasisSet = new Set(emphasis.map((w) => w.toLowerCase()));
  const words = text.split(/\s+/).filter(Boolean);
  const lines = chunk(words, wordsPerLine);

  let index = 0;
  return (
    <div className={`flex flex-col items-center gap-2 text-center ${className}`}>
      {lines.map((line, li) => (
        <div key={li} className="flex flex-wrap justify-center gap-x-5">
          {line.map((word) => {
            const i = index++;
            const local = frame - delay - i * stagger;
            const pop = spring({ frame: local, fps, config: springs.pop });
            const scale = interpolate(pop, [0, 1], [2.1, 1]);
            const blur = interpolate(pop, [0, 1], [4, 0], { extrapolateRight: "clamp" });
            const isHot = emphasisSet.has(word.toLowerCase());
            // Brief white flash as each word lands.
            const flash = interpolate(local, [0, 3, 8], [1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <motion.span
                key={`${word}-${i}`}
                className="inline-block font-black uppercase leading-[0.95] tracking-tight"
                style={{
                  fontSize,
                  opacity: local < 0 ? 0 : Math.min(1, pop * 1.4),
                  scale,
                  filter: `blur(${blur}px)`,
                  color: isHot ? accent : palette.bone,
                  textShadow: isHot
                    ? `0 0 ${24 + flash * 40}px ${accent}AA, 0 6px 0 rgba(0,0,0,0.6)`
                    : `0 0 ${flash * 36}px rgba(255,255,255,0.8), 0 6px 0 rgba(0,0,0,0.6)`,
                }}
              >
                {word}
              </motion.span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
