import React from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

/**
 * High-retention, seamlessly looping data Short.
 *
 * - Frame 0 is fully composed: hook word, chart, axes and readout are all at
 *   100% with no entry fade/offset/lag.
 * - Captions: one word every WORD_FRAMES frames, entering at 1.15x in gold;
 *   previous words are cleared.
 * - Loop: the composition is LOOP_FRAMES + 1 long and every animated value is
 *   computed from `frame % LOOP_FRAMES`, so the final frame is rendered from the
 *   exact same state as frame 0.
 *
 * Everything is a pure function of the frame (Framer Motion nodes are driven by
 * Remotion's clock) so renders are deterministic.
 */

const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

export type CaptionWord = {
  text: string;
  /** Stays gold for its whole window (other words flash gold, then turn white). */
  keyword?: boolean;
};

export type ChartPoint = {
  label: string;
  value: number;
  /** Caption word index at which the neon trail starts travelling toward this point. */
  atWord: number;
};

export type CinematicDataProps = {
  kicker: string;
  metricLabel: string;
  unitPrefix: string;
  unitSuffix: string;
  captions: CaptionWord[];
  chart: ChartPoint[];
};

/** Frames each caption word holds. */
export const WORD_FRAMES = 10;
/** Camera punch-in period (frames). */
const CAMERA_PERIOD = 60;

/** One full loop; the composition adds a final frame that renders loop-frame 0. */
export const loopFrames = (p: Pick<CinematicDataProps, "captions">) =>
  p.captions.length * WORD_FRAMES;
export const getCinematicDuration = (p: Pick<CinematicDataProps, "captions">) => loopFrames(p) + 1;

/**
 * Splits a script into single-word caption items. Mark keywords with a leading
 * `*`, e.g. "a *$6 *billion empire".
 */
export const toWords = (script: string): CaptionWord[] =>
  script
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ({ text: w.replace(/^\*/, ""), keyword: w.startsWith("*") }));

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

const T = {
  obsidian: "#07080B",
  obsidianLift: "#11131A",
  white: "#FFFFFF",
  dim: "rgba(255,255,255,0.55)",
  ghost: "rgba(255,255,255,0.24)",
  gold: "#D4AF37",
  goldGlow: "rgba(212,175,55,0.55)",
  crimson: "#EF4444",
  grid: "rgba(255,255,255,0.06)",
} as const;

const POP = { damping: 14, stiffness: 320, mass: 0.5 };
const DRAW = { damping: 28, stiffness: 160, mass: 1 };

/** Loop-aware frame: the last composition frame maps back to 0. */
const useLoopFrame = (loop: number) => useCurrentFrame() % loop;

/* ------------------------------------------------------------------ */
/* Camera: pattern interrupt every CAMERA_PERIOD frames                */
/* ------------------------------------------------------------------ */

const cameraAt = (frame: number, fps: number) => {
  const cycle = Math.floor(frame / CAMERA_PERIOD);
  const local = frame % CAMERA_PERIOD;
  // Each window starts at exactly 1.0 / no pan (so frame 0 is untouched), then eases to 1.05.
  const push = spring({ frame: local, fps, config: { damping: 30, stiffness: 40, mass: 1 } });
  const dirs = [
    [1, 0.4],
    [-1, -0.3],
    [0.5, -1],
    [-0.6, 0.8],
  ] as const;
  const [dx, dy] = dirs[cycle % dirs.length] ?? [0, 0];
  return { scale: interpolate(push, [0, 1], [1, 1.05]), x: dx * push * 18, y: dy * push * 14 };
};

/* ------------------------------------------------------------------ */
/* Film grain                                                          */
/* ------------------------------------------------------------------ */

const FilmGrain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.12 }) => (
  <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ mixBlendMode: "overlay", opacity }}>
    <filter id="cinema-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={3} seed={frame % 24} stitchTiles="stitch" />
      <feColorMatrix
        type="matrix"
        values="0.33 0.33 0.33 0 0
                0.33 0.33 0.33 0 0
                0.33 0.33 0.33 0 0
                0    0    0    0.6 0"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#cinema-grain)" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Single-word flash captions                                          */
/* ------------------------------------------------------------------ */

const FlashCaption: React.FC<{ words: CaptionWord[]; frame: number }> = ({ words, frame }) => {
  const { fps } = useVideoConfig();
  const index = Math.min(words.length - 1, Math.floor(frame / WORD_FRAMES));
  const local = frame - index * WORD_FRAMES;

  return (
    <div className="relative flex h-[200px] items-center justify-center px-10 text-center">
      {words.map((w, i) => {
        if (i !== index) return null; // previous (and upcoming) words are fully transparent
        // Enters at 1.15x — fully opaque on its first frame — and settles to 1.0.
        const settle = spring({ frame: local, fps, config: POP });
        const scale = interpolate(settle, [0, 1], [1.15, 1]);
        const gold = w.keyword || local < 4;
        return (
          <motion.span
            key={i}
            className="inline-block font-black uppercase leading-none tracking-tight"
            style={{
              fontSize: w.text.length > 9 ? 128 : 164,
              scale,
              color: gold ? T.gold : T.white,
              textShadow: gold
                ? `0 0 44px ${T.goldGlow}, 0 10px 0 rgba(0,0,0,0.7)`
                : "0 10px 0 rgba(0,0,0,0.7), 0 0 28px rgba(0,0,0,0.8)",
            }}
          >
            {w.text}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Centerpiece chart (fully laid out from frame 0)                     */
/* ------------------------------------------------------------------ */

type Datum = { x: number; ghost: number; neon: number | null };

const NeonChart: React.FC<{
  points: ChartPoint[];
  frame: number;
  width: number;
  height: number;
  metricLabel: string;
  unitPrefix: string;
  unitSuffix: string;
}> = ({ points, frame, width, height, metricLabel, unitPrefix, unitSuffix }) => {
  const { fps } = useVideoConfig();
  const peak = Math.max(...points.map((p) => p.value));
  const yMax = Math.ceil(peak * 1.15);

  // Trail head: position along the series (0 … n-1), springing per point.
  let headX = 0;
  let headValue = points[0]?.value ?? 0;
  points.forEach((p, i) => {
    if (i === 0) return;
    const prev = points[i - 1];
    const at = p.atWord * WORD_FRAMES;
    if (!prev || frame < at) return;
    const prog = Math.min(1, spring({ frame: frame - at, fps, config: DRAW }));
    headX = i - 1 + prog;
    headValue = interpolate(prog, [0, 1], [prev.value, p.value]);
  });

  // Ghost line = full series, always visible. Neon = drawn portion up to the head.
  const data: Datum[] = points.map((p, i) => ({ x: i, ghost: p.value, neon: i <= Math.floor(headX) ? p.value : null }));
  if (headX % 1 !== 0) data.push({ x: headX, ghost: headValue, neon: headValue });
  data.sort((a, b) => a.x - b.x);

  const peakIndex = points.findIndex((p) => p.value === peak);
  const falling = headX > peakIndex;
  const tone = falling ? T.crimson : T.gold;
  const fmt = (v: number) => `${unitPrefix}${v.toFixed(v >= 10 ? 0 : 1)}${unitSuffix}`;
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 4);

  return (
    <div style={{ width, height }}>
      <style>{`
        .neon .recharts-area:last-of-type .recharts-area-curve { filter: drop-shadow(0 0 6px ${tone}) drop-shadow(0 0 18px ${tone}88); }
      `}</style>
      <div className="flex items-end justify-between px-4 pb-4">
        <span className="text-[30px] font-extrabold uppercase tracking-[0.3em]" style={{ color: T.dim }}>
          {metricLabel}
        </span>
        <span className="text-[96px] font-black leading-none tabular-nums" style={{ color: tone, textShadow: `0 0 30px ${tone}77` }}>
          {fmt(headValue)}
        </span>
      </div>
      <div className="neon">
        <AreaChart width={width} height={height - 130} data={data} margin={{ top: 20, right: 40, bottom: 10, left: 0 }}>
          <defs>
            <linearGradient id="neon-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tone} stopOpacity={0.45} />
              <stop offset="100%" stopColor={T.obsidian} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="neon-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={T.gold} />
              <stop offset="40%" stopColor={T.crimson} />
              <stop offset="100%" stopColor={T.crimson} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={T.grid} vertical={false} />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, Math.max(1, points.length - 1)]}
            ticks={points.map((_, i) => i)}
            tickFormatter={(i: number) => points[i]?.label ?? ""}
            tick={{ fill: T.dim, fontSize: 30, fontWeight: 800 }}
            axisLine={{ stroke: T.grid }}
            tickLine={false}
            tickMargin={14}
          />
          <YAxis
            domain={[0, yMax]}
            tickFormatter={fmt}
            tick={{ fill: T.dim, fontSize: 26, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <ReferenceLine y={peak} stroke={T.gold} strokeDasharray="10 12" strokeOpacity={0.5} />
          <Area
            type="monotone"
            dataKey="ghost"
            stroke={T.ghost}
            strokeWidth={5}
            strokeDasharray="4 10"
            fill="none"
            isAnimationActive={false}
            dot={false}
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="neon"
            stroke="url(#neon-stroke)"
            strokeWidth={8}
            fill="url(#neon-fill)"
            connectNulls={false}
            isAnimationActive={false}
            dot={false}
            activeDot={false}
          />
          <ReferenceDot
            x={headX}
            y={headValue}
            r={14 + pulse * 8}
            fill={tone}
            stroke={T.white}
            strokeWidth={4}
            style={{ filter: `drop-shadow(0 0 ${12 + pulse * 16}px ${tone})` }}
          />
        </AreaChart>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */

export const CinematicDataShort: React.FC<CinematicDataProps> = (props) => {
  const { kicker, metricLabel, unitPrefix, unitSuffix, captions, chart } = props;
  const { width, fps } = useVideoConfig();
  const frame = useLoopFrame(loopFrames(props));
  const cam = cameraAt(frame, fps);

  return (
    <AbsoluteFill style={{ fontFamily, background: T.obsidian }}>
      {/* camera rig: everything except vignette + grain lives inside */}
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})` }}>
        <AbsoluteFill
          style={{ background: `radial-gradient(ellipse 90% 60% at 50% 42%, ${T.obsidianLift} 0%, ${T.obsidian} 70%)` }}
        />
        <div className="absolute left-0 top-[120px] w-full text-center">
          <span className="text-[34px] font-black uppercase tracking-[0.45em]" style={{ color: T.gold }}>
            {kicker}
          </span>
        </div>
        <div className="absolute left-1/2 top-[260px] -translate-x-1/2">
          <NeonChart
            points={chart}
            frame={frame}
            width={width - 80}
            height={860}
            metricLabel={metricLabel}
            unitPrefix={unitPrefix}
            unitSuffix={unitSuffix}
          />
        </div>
        <div className="absolute left-0 top-[1240px] w-full">
          <FlashCaption words={captions} frame={frame} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ boxShadow: "inset 0 0 280px 90px rgba(0,0,0,0.85)" }} />
      <FilmGrain frame={frame} />
    </AbsoluteFill>
  );
};
