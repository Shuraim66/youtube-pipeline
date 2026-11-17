import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { palette, springs } from "../theme";
import type { SceneSpec } from "../types";

/**
 * Second scene library: per-company objects + rotating data graphics.
 * Every scene fills a 1080×760 slot and is driven only by the beat-relative frame.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 1080;
const H = 760;

type Of<K extends SceneSpec["kind"]> = Extract<SceneSpec, { kind: K }>;

/* ------------------------------------------------------------------ */
/* Image-led beat: real photo + optional big counting number           */
/* ------------------------------------------------------------------ */

export const ImageScene: React.FC<{ spec: Of<"image">; beatFrames: number }> = ({ spec, beatFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const push = interpolate(frame, [0, beatFrames], [1.0, 1.08], clamp);
  const count = spring({ frame: frame - 4, fps, config: { damping: 30, stiffness: 60 } });
  const value = spec.number ? spec.number.from + (spec.number.to - spec.number.from) * count : 0;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute flex justify-center" style={{ left: 0, right: 0, top: 10 }}>
        <div className="relative overflow-hidden rounded-3xl" style={{ width: 400, height: 520, boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}>
          <Img
            src={staticFile(spec.src)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%", transformOrigin: "50% 0%", transform: `scale(${push})`, filter: "brightness(1.15) contrast(1.05)" }}
          />
        </div>
      </div>
      {spec.credit && (
        <span className="absolute text-center text-[18px] font-semibold" style={{ left: 0, right: 0, top: 540, color: "rgba(245,245,244,0.5)" }}>
          {spec.credit}
        </span>
      )}
      {spec.number && (
        <div className="absolute flex flex-col items-center" style={{ left: 0, right: 0, bottom: 0 }}>
          <span className="font-black leading-none" style={{ fontSize: 120, color: palette.bone, textShadow: "0 8px 40px rgba(0,0,0,0.9)" }}>
            {spec.number.prefix}
            {value.toFixed(spec.number.decimals ?? 0)}
            {spec.number.suffix}
          </span>
          <span className="mt-2 text-[30px] font-extrabold uppercase tracking-[0.3em]" style={{ color: palette.gold }}>
            {spec.number.label}
          </span>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Big number: one giant figure counting (e.g. a loss)                 */
/* ------------------------------------------------------------------ */

export const BigNumberScene: React.FC<{ spec: Of<"bigNumber">; beatFrames: number }> = ({ spec, beatFrames }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [4, beatFrames * 0.6], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const v = spec.from + (spec.to - spec.from) * p;
  const color = spec.tone === "red" ? palette.crimson : palette.gold;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <span className="text-[34px] font-extrabold uppercase tracking-[0.3em]" style={{ color: palette.ash }}>
        {spec.label}
      </span>
      <span className="font-black leading-none" style={{ fontSize: 230, color: palette.bone }}>
        {spec.prefix}
        {v.toFixed(spec.decimals ?? 0)}
        {spec.suffix}
      </span>
      <div style={{ width: interpolate(p, [0, 1], [0, 700]), height: 10, background: color, boxShadow: `0 0 30px ${color}` }} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Timeline ruler: years on a rail, playhead travels to the beat year  */
/* ------------------------------------------------------------------ */

export const RulerScene: React.FC<{ spec: Of<"ruler">; beatFrames: number }> = ({ spec, beatFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const left = 110;
  const right = W - 230; // clear of the Shorts action rail
  const xOf = (y: number) => left + ((y - spec.from) / (spec.to - spec.from)) * (right - left);
  const move = spring({ frame: frame - 6, fps, config: { damping: 24, stiffness: 70 } });
  const head = spec.playheadFrom + (spec.playhead - spec.playheadFrom) * move;
  const years = Array.from({ length: spec.to - spec.from + 1 }, (_, i) => spec.from + i);
  const railY = 420;
  return (
    <svg width={W} height={H}>
      <line x1={left} x2={right} y1={railY} y2={railY} stroke="rgba(245,245,244,0.25)" strokeWidth={4} />
      <line x1={left} x2={xOf(head)} y1={railY} y2={railY} stroke={palette.crimson} strokeWidth={6} />
      {years.map((y) => (
        <g key={y}>
          <line x1={xOf(y)} x2={xOf(y)} y1={railY - (y % 5 === 0 ? 22 : 12)} y2={railY} stroke="rgba(245,245,244,0.4)" strokeWidth={2} />
          {((y % 5 === 0 && y - spec.from >= 3 && spec.to - y >= 3) || y === spec.from || y === spec.to) && (
            <text x={xOf(y)} y={railY + 56} textAnchor="middle" fontSize={30} fontWeight={800} fill={palette.ash}>
              {y}
            </text>
          )}
        </g>
      ))}
      {spec.marks.map((m, i) => {
        const shown = head >= m.year - 0.01;
        const up = i % 2 === 0;
        const c = m.tone === "red" ? palette.crimson : m.tone === "gold" ? palette.gold : palette.bone;
        return (
          <g key={m.year} opacity={shown ? 1 : 0.25}>
            <line x1={xOf(m.year)} x2={xOf(m.year)} y1={railY} y2={up ? railY - 150 : railY + 110} stroke={c} strokeWidth={3} />
            <circle cx={xOf(m.year)} cy={railY} r={12} fill={c} />
            <text x={xOf(m.year)} y={up ? railY - 170 : railY + 150} textAnchor="middle" fontSize={30} fontWeight={900} fill={palette.bone}>
              {m.label.toUpperCase()}
            </text>
            <text x={xOf(m.year)} y={up ? railY - 210 : railY + 188} textAnchor="middle" fontSize={26} fontWeight={800} fill={c}>
              {m.year}
            </text>
          </g>
        );
      })}
      <g transform={`translate(${xOf(head)} ${railY})`}>
        <path d="M-18,-44 H18 L0,-18 Z" fill={palette.crimson} />
        <line x1={0} x2={0} y1={-18} y2={18} stroke={palette.crimson} strokeWidth={4} />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Bars: one bar per period, value labels only at the ends             */
/* ------------------------------------------------------------------ */

export const BarsScene: React.FC<{ spec: Of<"bars">; beatFrames: number }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = Math.max(...spec.items.map((d) => d.value));
  const plotL = 90;
  const plotR = W - 230;
  const plotB = 640;
  const plotT = 120;
  const bw = (plotR - plotL) / spec.items.length;
  return (
    <svg width={W} height={H}>
      <line x1={plotL} x2={plotR} y1={plotB} y2={plotB} stroke="rgba(245,245,244,0.2)" strokeWidth={2} />
      {spec.items.map((d, i) => {
        const g = spring({ frame: frame - i * 4, fps, config: springs.settle });
        const h = ((plotB - plotT) * d.value * g) / max;
        // thin marks: cap bar width so a 2-bar comparison isn't a wall of colour
        const barW = Math.min(bw - 16, 150);
        const x = plotL + i * bw + (bw - barW) / 2;
        const isPeak = d.value === max;
        const isLast = i === spec.items.length - 1;
        return (
          <g key={d.label}>
            <rect x={x} y={plotB - h} width={barW} height={Math.max(h, 4)} rx={4} fill={isLast ? palette.crimson : isPeak ? "rgba(245,245,244,0.55)" : "rgba(245,245,244,0.35)"} />
            <text x={x + barW / 2} y={plotB + 40} textAnchor="middle" fontSize={26} fontWeight={800} fill={palette.ash}>
              {d.label}
            </text>
            {(isPeak || isLast) && (
              <text x={x + barW / 2} y={plotB - h - 16} textAnchor="middle" fontSize={32} fontWeight={900} fill={palette.bone}>
                {spec.prefix}
                {d.value}
                {spec.suffix}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* BlackBerry: keyboard phone loses its keys as a touchscreen slides in */
/* ------------------------------------------------------------------ */

export const KeyboardBreakScene: React.FC<{ beatFrames: number }> = ({ beatFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cols = 10;
  const rows = 4;
  const phoneX = 300;
  const phoneY = 60;
  const slide = spring({ frame: frame - Math.round(beatFrames * 0.45), fps, config: { damping: 18, stiffness: 90 } });
  return (
    <svg width={W} height={H}>
      {/* keyboard phone (generic, drawn) */}
      <g transform={`translate(${phoneX} ${phoneY}) rotate(${interpolate(slide, [0, 1], [0, -8])} 200 320)`} opacity={interpolate(slide, [0, 1], [1, 0.5])}>
        <rect width={400} height={640} rx={48} fill="#15161C" stroke="#3A3C48" strokeWidth={6} />
        <rect x={34} y={50} width={332} height={250} rx={12} fill="#07080B" />
        <text x={200} y={190} textAnchor="middle" fontSize={34} fontWeight={900} fill="rgba(245,245,244,0.35)">
          ●●●
        </text>
        <rect x={150} y={316} width={100} height={44} rx={22} fill="#262833" />
        {Array.from({ length: cols * rows }, (_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          // keys drop in a scattered order with gravity
          const order = (i * 17) % (cols * rows);
          const t0 = 6 + order * 1.1;
          const t = Math.max(0, frame - t0);
          const dy = 0.9 * t * t;
          const dx = ((i * 37) % 11 - 5) * t * 0.8;
          const rot = ((i * 53) % 21 - 10) * t * 1.5;
          const x = 30 + c * 34;
          const y = 390 + r * 56;
          return (
            <g key={i} transform={`translate(${x + 14 + dx} ${y + 20 + dy}) rotate(${rot})`}>
              <rect x={-14} y={-20} width={28} height={40} rx={8} fill="#2E3040" stroke="#4A4D5E" strokeWidth={2} />
            </g>
          );
        })}
      </g>
      {/* touchscreen slab slides in over it */}
      <g transform={`translate(${interpolate(slide, [0, 1], [W + 40, 330])} 40)`}>
        <rect width={380} height={680} rx={56} fill="#0B0C10" stroke="#C9CED6" strokeWidth={6} />
        <rect x={20} y={20} width={340} height={640} rx={40} fill="url(#screenGlow)" />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={50 + (i % 4) * 75} y={70 + Math.floor(i / 4) * 90} width={54} height={54} rx={14} fill={["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#06B6D4"][i % 6]} opacity={0.9} />
        ))}
        <defs>
          <linearGradient id="screenGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* BlackBerry: "No Service" — signal bars drop, screen goes dark        */
/* ------------------------------------------------------------------ */

export const NoServiceScene: React.FC<{ spec: Of<"noService">; beatFrames: number }> = ({ spec, beatFrames }) => {
  const frame = useCurrentFrame();
  // `hold` = already dead (used when the scene continues under the outro)
  const bars = spec.hold ? 0 : Math.max(0, 4 - Math.floor(frame / 8));
  const dim = spec.hold ? 0.08 : interpolate(frame, [beatFrames * 0.45, beatFrames * 0.9], [1, 0.08], clamp);
  const blink = bars === 0 ? (Math.floor(frame / 10) % 2 === 0 ? 1 : 0.35) : 1;
  return (
    <svg width={W} height={H}>
      <g transform="translate(330 30)">
        <rect width={360} height={700} rx={44} fill="#15161C" stroke="#3A3C48" strokeWidth={6} />
        <rect x={26} y={50} width={308} height={380} rx={10} fill="#0B0C10" />
        <g opacity={dim}>
          <rect x={26} y={50} width={308} height={380} rx={10} fill="#1B2A3A" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={50 + i * 20} y={100 - i * 12} width={14} height={16 + i * 12} fill={i < bars ? palette.bone : "rgba(245,245,244,0.18)"} />
          ))}
          <text x={180} y={250} textAnchor="middle" fontSize={40} fontWeight={900} fill={palette.crimson} opacity={bars === 0 ? blink : 0}>
            NO SERVICE
          </text>
          <text x={180} y={300} textAnchor="middle" fontSize={24} fontWeight={700} fill={palette.ash} opacity={bars === 0 ? 1 : 0}>
            {spec.date}
          </text>
        </g>
        {/* keyboard block */}
        {Array.from({ length: 30 }, (_, i) => (
          <rect key={i} x={30 + (i % 10) * 30} y={460 + Math.floor(i / 10) * 60} width={24} height={44} rx={7} fill="#2E3040" opacity={0.6 + 0.4 * dim} />
        ))}
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Lehman: the weekend — day cards flip over one by one                 */
/* ------------------------------------------------------------------ */

export const DaysScene: React.FC<{ spec: Of<"days">; beatFrames: number }> = ({ spec, beatFrames }) => {
  const frame = useCurrentFrame();
  const per = Math.max(8, Math.floor((beatFrames * 0.8) / spec.days.length));
  const shown = Math.min(spec.days.length, 1 + Math.floor(frame / per));
  const cardW = 190;
  const gap = 18;
  const total = spec.days.length * cardW + (spec.days.length - 1) * gap;
  const x0 = (W - 150 - total) / 2 + 20; // centred in the area clear of the action rail
  return (
    <svg width={W} height={H}>
      {spec.days.map((d, i) => {
        const on = i < shown;
        const latest = i === shown - 1;
        const c = d.tone === "red" ? palette.crimson : d.tone === "gold" ? palette.gold : palette.bone;
        const x = x0 + i * (cardW + gap);
        return (
          <g key={d.day} opacity={on ? 1 : 0.18}>
            <rect x={x} y={170} width={cardW} height={330} rx={18} fill={latest ? `${c}22` : "#12131B"} stroke={latest ? c : "#2A2C36"} strokeWidth={latest ? 5 : 3} />
            <rect x={x} y={170} width={cardW} height={62} rx={18} fill={on ? c : "#2A2C36"} />
            <rect x={x} y={214} width={cardW} height={18} fill={on ? c : "#2A2C36"} />
            <text x={x + cardW / 2} y={213} textAnchor="middle" fontSize={34} fontWeight={900} fill={palette.obsidian}>
              {d.day}
            </text>
            <text x={x + cardW / 2} y={330} textAnchor="middle" fontSize={96} fontWeight={900} fill={palette.bone}>
              {d.date}
            </text>
            {on &&
              d.note.split("\n").map((line, j) => (
                <text key={j} x={x + cardW / 2} y={410 + j * 34} textAnchor="middle" fontSize={26} fontWeight={800} fill={c}>
                  {line.toUpperCase()}
                </text>
              ))}
          </g>
        );
      })}
      <text x={(W - 150) / 2 + 20} y={600} textAnchor="middle" fontSize={30} fontWeight={800} fill={palette.ash} letterSpacing={6}>
        {spec.caption.toUpperCase()}
      </text>
    </svg>
  );
};
