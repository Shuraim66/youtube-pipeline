import { Object3DScene } from "../../three/Objects3D";
import { LoopTimerScene } from "./LoopTimer";
import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette, springs } from "../theme";
import type { SceneSpec } from "../types";
import { BarsScene, BigNumberScene, DaysScene, ImageScene, KeyboardBreakScene, NoServiceScene, RulerScene } from "./Scenes2";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ------------------------------------------------------------------ */
/* Split: A vs B with a slammed stamp                                  */
/* ------------------------------------------------------------------ */

const SplitScene: React.FC<{ spec: Extract<SceneSpec, { kind: "split" }> }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inL = spec.instant ? 1 : spring({ frame, fps, config: springs.snap });
  const inR = spec.instant ? 1 : spring({ frame: frame - 3, fps, config: springs.snap });
  const stamp = spec.instant ? 1 : spring({ frame: frame - spec.stampAt, fps, config: { damping: 11, stiffness: 300, mass: 0.7 } });

  const Panel: React.FC<{ name: string; value: string; color: string; x: number; p: number; dim: boolean }> = ({
    name,
    value,
    color,
    x,
    p,
    dim,
  }) => (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl"
      style={{
        height: 560,
        background: `linear-gradient(180deg, ${color}22, ${palette.obsidianLift})`,
        border: `3px solid ${color}66`,
        transform: `translateX(${x * (1 - p)}px)`,
        opacity: dim ? 0.55 : 1,
      }}
    >
      <span className="px-4 text-center text-[30px] font-black uppercase leading-tight tracking-[0.2em]" style={{ color: palette.ash }}>
        {name}
      </span>
      <span className="font-black leading-none" style={{ fontSize: Math.min(104, Math.floor(700 / Math.max(1, value.length))), color, textShadow: `0 0 40px ${color}66` }}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="relative flex h-full w-full items-center gap-6 px-10">
      <Panel name={spec.left.name} value={spec.left.value} color={palette.bone} x={-500} p={inL} dim={false} />
      <span className="text-[56px] font-black" style={{ color: palette.ash }}>
        vs
      </span>
      <Panel name={spec.right.name} value={spec.right.value} color={palette.gold} x={500} p={inR} dim={false} />
      {frame >= spec.stampAt && (
        <div
          className="absolute rounded-2xl px-8 py-3"
          style={{
            border: `10px solid ${palette.crimson}`,
            color: palette.crimson,
            left: "26%", top: "72%", transform: `translate(-50%, -50%) rotate(-12deg) scale(${interpolate(stamp, [0, 1], [2.6, 1])})`,
            opacity: interpolate(stamp, [0, 0.3], [0, 1], clamp),
            background: "rgba(9,10,15,0.85)",
            boxShadow: `0 0 60px ${palette.crimson}66`,
          }}
        >
          <span className="font-black uppercase leading-none tracking-wider" style={{ fontSize: Math.min(96, Math.floor(620 / Math.max(1, spec.stamp.length))) }}>{spec.stamp}</span>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Stores: a dot grid that lights up / goes dark in waves              */
/* ------------------------------------------------------------------ */

const COLS = 30;
const ROWS = 24;

const StoreGrid: React.FC<{ spec: Extract<SceneSpec, { kind: "stores" }>; beatFrames: number }> = ({
  spec,
  beatFrames,
}) => {
  const frame = useCurrentFrame();
  const total = COLS * ROWS;
  // Deterministic shuffled order so dots change in organic waves, not row by row.
  const order = useMemo(() => {
    const idx = Array.from({ length: total }, (_, i) => i);
    let seed = 42;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    // bias by distance from center so change radiates
    return idx
      .map((i) => {
        const cx = (i % COLS) - COLS / 2;
        const cy = Math.floor(i / COLS) - ROWS / 2;
        return { i, k: Math.hypot(cx, cy) / 20 + rand() * 0.8 };
      })
      .sort((a, b) => a.k - b.k)
      .map((o, rank) => ({ i: o.i, rank }));
  }, [total]);
  const rankOf = useMemo(() => {
    const r = new Array<number>(total);
    order.forEach((o) => (r[o.i] = o.rank));
    return r;
  }, [order, total]);

  const prog = interpolate(frame, [4, beatFrames * 0.7], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const lit = interpolate(prog, [0, 1], [spec.litFrom, spec.litTo]) * total;
  const stores = Math.round((lit / total) * spec.total);
  const on = spec.tone === "gold" ? palette.gold : palette.crimson;
  const cell = 28;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <div className="flex items-baseline gap-4">
        {spec.label ? (
          <span className="text-[64px] font-black uppercase leading-none tracking-[0.12em]" style={{ color: on, textShadow: `0 0 40px ${on}66` }}>
            {spec.label}
          </span>
        ) : (
          <>
            <span className="text-[120px] font-black leading-none tabular-nums" style={{ color: on, textShadow: `0 0 40px ${on}66` }}>
              {stores.toLocaleString("en-US")}
            </span>
            <span className="text-[44px] font-black uppercase tracking-[0.2em]" style={{ color: palette.ash }}>
              {spec.unit ?? "stores"}
            </span>
          </>
        )}
      </div>
      <svg width={COLS * cell} height={ROWS * cell}>
        {Array.from({ length: total }, (_, i) => {
          const rank = rankOf[i] ?? 0;
          // Ranks below `lit` are open; the rest are dark.
          const isOn = rank < lit;
          const justChanged = Math.abs(rank - lit) < 18;
          return (
            <circle
              key={i}
              cx={(i % COLS) * cell + cell / 2}
              cy={Math.floor(i / COLS) * cell + cell / 2}
              r={justChanged ? 9 : 7}
              fill={isOn ? on : "rgba(245,245,244,0.08)"}
              opacity={isOn ? 0.95 : 1}
            />
          );
        })}
      </svg>
      {!spec.label && (
        <span className="text-[26px] font-bold uppercase tracking-[0.3em]" style={{ color: palette.ash }}>
          1 dot = {Math.round(spec.total / total)} {spec.unit ?? "stores"}
        </span>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* VHS vs Play: streaming swallows the tape                            */
/* ------------------------------------------------------------------ */

const VhsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tapeIn = spring({ frame, fps, config: springs.snap });
  const play = spring({ frame: frame - 18, fps, config: { damping: 16, stiffness: 140, mass: 0.9 } });
  const playScale = interpolate(play, [0, 1], [0, 1.5]);
  const tapeShrink = interpolate(play, [0, 1], [1, 0.55]);
  const reel = frame * (1 - play) * 6;

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg width={1040} height={760} viewBox="0 0 1000 700">
        <g
          transform={`translate(${interpolate(play, [0, 1], [500, 250])} 350) scale(${tapeIn * tapeShrink}) rotate(${interpolate(play, [0, 1], [0, -14])})`}
          opacity={interpolate(play, [0, 1], [1, 0.45])}
        >
          <rect x={-300} y={-170} width={600} height={340} rx={24} fill="#15161C" stroke="#2A2C36" strokeWidth={6} />
          <rect x={-230} y={-130} width={460} height={110} rx={10} fill={palette.bone} />
          <text x={0} y={-60} textAnchor="middle" fontSize={44} fontWeight={900} fill={palette.obsidian}>
            BE KIND · REWIND
          </text>
          <rect x={-200} y={10} width={400} height={120} rx={14} fill="#07080B" />
          {[-110, 110].map((cx) => (
            <g key={cx} transform={`translate(${cx} 70) rotate(${reel})`}>
              <circle r={48} fill="#1F2029" stroke="#3A3C48" strokeWidth={4} />
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <rect key={a} x={-4} y={-40} width={8} height={22} fill="#3A3C48" transform={`rotate(${a})`} />
              ))}
              <circle r={10} fill="#07080B" />
            </g>
          ))}
        </g>
        <g transform={`translate(${interpolate(play, [0, 1], [900, 640])} 350) scale(${playScale})`}>
          <circle r={150} fill={palette.crimson} style={{ filter: `drop-shadow(0 0 40px ${palette.crimson})` }} />
          <path d="M-45,-75 L85,0 L-45,75 Z" fill={palette.bone} />
        </g>
      </svg>
    </div>
  );
};

export const Scene: React.FC<{ spec: SceneSpec; beatFrames: number }> = ({ spec, beatFrames }) => {
  switch (spec.kind) {
    case "split":
      return <SplitScene spec={spec} />;
    case "stores":
      return <StoreGrid spec={spec} beatFrames={beatFrames} />;
    case "vhs":
      return <VhsScene />;
    case "image":
      return <ImageScene spec={spec} beatFrames={beatFrames} />;
    case "bigNumber":
      return <BigNumberScene spec={spec} beatFrames={beatFrames} />;
    case "ruler":
      return <RulerScene spec={spec} beatFrames={beatFrames} />;
    case "bars":
      return <BarsScene spec={spec} beatFrames={beatFrames} />;
    case "keyboardBreak":
      return <KeyboardBreakScene beatFrames={beatFrames} />;
    case "days":
      return <DaysScene spec={spec} beatFrames={beatFrames} />;
    case "loopTimer":
      return <LoopTimerScene spec={spec} />;
    case "object3d":
      return <Object3DScene spec={spec} beatFrames={beatFrames} />;
    case "noService":
      return <NoServiceScene spec={spec} beatFrames={beatFrames} />;
    default:
      return null;
  }
};
