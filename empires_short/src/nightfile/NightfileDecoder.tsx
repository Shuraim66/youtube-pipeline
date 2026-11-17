import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/JetBrainsMono";

/**
 * NightfileHQ — cipher-tracking Short template.
 *
 * - Ultra-dark CRT baseline with scanlines + a faint vertical grid.
 * - Center: cryptographic decoder frame (animated vector-glyph matrix + cipher
 *   status rows) over a vector crosshair reticle.
 * - Hard-cut monospace captions; trigger words step-scale and switch to amber.
 * - Swipe protection: nothing fades, slides or springs in. Frame 0 renders the
 *   full layout and the first caption at 100%.
 *
 * Everything is a pure function of the frame so renders are deterministic.
 */

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "800"], subsets: ["latin"] });

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

export type CaptionSegment = {
  text: string;
  /** Inclusive start frame. */
  from: number;
  /** Exclusive end frame. */
  to: number;
};

export type CipherRecord = {
  id: string;
  status: "solved" | "unsolved";
  /** Shown for solved ciphers, e.g. "SOLVED 1969". */
  note: string;
  /** Glyph count used for the scrambling ciphertext of unsolved rows. */
  length: number;
};

export type NightfileProps = {
  channel: string;
  caseId: string;
  coordinates: string;
  captions: CaptionSegment[];
  /** Words that step-scale and turn amber (case-insensitive, punctuation ignored). */
  triggers: string[];
  ciphers: CipherRecord[];
  sound?: boolean;
};

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

const C = {
  bg: "#030305",
  white: "#E8F1F5",
  whiteDim: "rgba(232,241,245,0.55)",
  amber: "#F59E0B",
  cyan: "#06B6D4",
  cyanDim: "rgba(6,182,212,0.35)",
  cyanFaint: "rgba(6,182,212,0.12)",
  line: "rgba(232,241,245,0.08)",
} as const;

const W = 1080;
const H = 1920;
/** Horizontal centre of the area not covered by the Shorts action rail (x > 940). */
const SAFE_CX = 500;

/* ------------------------------------------------------------------ */
/* Deterministic helpers                                               */
/* ------------------------------------------------------------------ */

/** Integer hash → [0, 1). Stable across renders. */
const hash = (a: number, b = 0, c = 0): number => {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

const CIPHER_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ+/<>^#%&@=";

const scramble = (length: number, seed: number, step: number): string =>
  Array.from({ length }, (_, i) => CIPHER_ALPHABET[Math.floor(hash(seed, i, step) * CIPHER_ALPHABET.length)]).join("");

const normalize = (w: string) => w.replace(/[^A-Za-z0-9']/g, "").toUpperCase();

/* ------------------------------------------------------------------ */
/* Vector glyph set (drawn in a 40×40 box centred on 0,0)              */
/* ------------------------------------------------------------------ */

const Glyph: React.FC<{ kind: number; color: string }> = ({ kind, color }) => {
  const s = { stroke: color, strokeWidth: 3, fill: "none", strokeLinecap: "square" as const };
  switch (kind % 12) {
    case 0: // circle-cross
      return (
        <g {...s}>
          <circle r={15} />
          <path d="M-15,0 H15 M0,-15 V15" />
        </g>
      );
    case 1: // triangle
      return <path {...s} d="M0,-15 L14,13 L-14,13 Z" />;
    case 2: // filled triangle (inverted)
      return <path d="M0,15 L14,-13 L-14,-13 Z" fill={color} />;
    case 3: // square + dot
      return (
        <g>
          <rect x={-13} y={-13} width={26} height={26} {...s} />
          <circle r={4} fill={color} />
        </g>
      );
    case 4: // reversed K
      return <path {...s} d="M10,-15 V15 M10,0 L-12,-15 M10,0 L-12,15" />;
    case 5: // circle + dot
      return (
        <g>
          <circle r={14} {...s} />
          <circle r={4} fill={color} />
        </g>
      );
    case 6: // half circle
      return <path {...s} d="M-14,6 A14,14 0 0 1 14,6 Z" />;
    case 7: // diamond
      return <path {...s} d="M0,-16 L14,0 L0,16 L-14,0 Z" />;
    case 8: // filled square rotated
      return <rect x={-10} y={-10} width={20} height={20} fill={color} transform="rotate(45)" />;
    case 9: // reversed E
      return <path {...s} d="M-12,-15 H12 V15 H-12 M12,0 H-6" />;
    case 10: // slash pair
      return <path {...s} d="M-12,15 L-2,-15 M4,15 L14,-15" />;
    default: // theta bar
      return (
        <g {...s}>
          <ellipse rx={11} ry={15} />
          <path d="M-11,0 H11" />
        </g>
      );
  }
};

/* ------------------------------------------------------------------ */
/* Background: CRT scanlines + vertical grid + flicker                 */
/* ------------------------------------------------------------------ */

const CrtBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const flicker = 0.94 + hash(frame, 7) * 0.06;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* faint vertical grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${C.line} 0px, ${C.line} 1px, transparent 1px, transparent 72px)`,
        }}
      />
      {/* horizontal CRT scanlines */}
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 4px)",
          opacity: flicker,
        }}
      />
      {/* rolling refresh bar */}
      <div
        className="absolute left-0 w-full"
        style={{
          top: ((frame * 9) % (H + 200)) - 200,
          height: 200,
          background: "linear-gradient(180deg, transparent, rgba(6,182,212,0.05), transparent)",
        }}
      />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 90px rgba(0,0,0,0.9)" }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* HUD chrome                                                          */
/* ------------------------------------------------------------------ */

const Hud: React.FC<{ frame: number; fps: number; channel: string; caseId: string; coordinates: string }> = ({
  frame,
  fps,
  channel,
  caseId,
  coordinates,
}) => {
  const secs = frame / fps;
  const tc = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(Math.floor(secs % 60)).padStart(2, "0")}:${String(frame % fps).padStart(2, "0")}`;
  const recOn = Math.floor(frame / 15) % 2 === 0;
  const corner = (x: number, y: number, dx: number, dy: number) => (
    <path d={`M${x},${y + dy * 60} V${y} H${x + dx * 60}`} stroke={C.cyan} strokeWidth={4} fill="none" />
  );
  return (
    <AbsoluteFill>
      <svg width={W} height={H} className="absolute inset-0">
        {corner(40, 40, 1, 1)}
        {corner(W - 40, 40, -1, 1)}
        {corner(40, H - 40, 1, -1)}
        {corner(W - 40, H - 40, -1, -1)}
      </svg>
      <div className="absolute flex items-center gap-4" style={{ left: 72, top: 78 }}>
        <span className="text-[34px] font-extrabold tracking-[0.25em]" style={{ color: C.white }}>
          {channel}
        </span>
      </div>
      <div className="absolute flex items-center gap-3" style={{ right: 72, top: 82 }}>
        <span className="inline-block rounded-full" style={{ width: 20, height: 20, background: recOn ? C.amber : "transparent", border: `3px solid ${C.amber}` }} />
        <span className="text-[28px] font-bold tabular-nums" style={{ color: C.amber }}>
          REC {tc}
        </span>
      </div>
      <div className="absolute flex w-full justify-between px-[72px] text-[24px] font-bold tracking-[0.2em]" style={{ top: 140, color: C.cyan }}>
        <span>{caseId}</span>
        <span>{coordinates}</span>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Reticle (behind the decoder)                                        */
/* ------------------------------------------------------------------ */

const Reticle: React.FC<{ frame: number; cx: number; cy: number }> = ({ frame, cx, cy }) => {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  return (
    <svg width={W} height={H} className="absolute inset-0">
      <g transform={`translate(${cx} ${cy})`} fill="none">
        <circle r={430} stroke={C.cyanFaint} strokeWidth={2} />
        <circle r={330} stroke={C.cyanDim} strokeWidth={2} strokeDasharray="6 14" transform={`rotate(${frame * 0.4})`} />
        <circle r={220} stroke={C.cyanFaint} strokeWidth={2} />
        <g transform={`rotate(${-frame * 0.25})`}>
          {ticks.map((a) => (
            <line
              key={a}
              x1={0}
              y1={-430}
              x2={0}
              y2={a % 45 === 0 ? -396 : -414}
              stroke={a % 45 === 0 ? C.cyan : C.cyanDim}
              strokeWidth={a % 45 === 0 ? 4 : 2}
              transform={`rotate(${a})`}
            />
          ))}
        </g>
        <path d="M-520,0 H-250 M250,0 H520 M0,-520 V-250 M0,250 V520" stroke={C.cyanDim} strokeWidth={2} />
        <path d="M-30,0 H30 M0,-30 V30" stroke={C.amber} strokeWidth={3} />
        <rect x={-6} y={-6} width={12} height={12} fill={C.amber} />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Decoder frame: glyph matrix + cipher status rows                    */
/* ------------------------------------------------------------------ */

const COLS = 9;
const ROWS = 5;
const CELL = 84;

const GlyphMatrix: React.FC<{ frame: number }> = ({ frame }) => {
  const scanRow = Math.floor(frame / 10) % ROWS;
  // One "locked" cell hops every 24 frames.
  const lockStep = Math.floor(frame / 24);
  const lockCell = Math.floor(hash(lockStep, 3) * COLS * ROWS);
  return (
    <svg width={COLS * CELL} height={ROWS * CELL}>
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const period = 4 + Math.floor(hash(i, 11) * 9); // each cell re-rolls on its own cadence
        const kind = Math.floor(hash(i, Math.floor((frame + i * 3) / period)) * 12);
        const locked = i === lockCell;
        const onScan = row === scanRow;
        const color = locked ? C.amber : onScan ? C.cyan : C.whiteDim;
        return (
          <g key={i} transform={`translate(${col * CELL + CELL / 2} ${row * CELL + CELL / 2})`}>
            {locked && <rect x={-CELL / 2 + 6} y={-CELL / 2 + 6} width={CELL - 12} height={CELL - 12} stroke={C.amber} strokeWidth={3} fill="rgba(245,158,11,0.08)" />}
            <Glyph kind={kind} color={color} />
          </g>
        );
      })}
      {/* scan bar */}
      <rect x={0} y={scanRow * CELL} width={COLS * CELL} height={CELL} fill="rgba(6,182,212,0.07)" stroke={C.cyanDim} strokeWidth={1} />
    </svg>
  );
};

const CipherRows: React.FC<{ frame: number; ciphers: CipherRecord[] }> = ({ frame, ciphers }) => (
  <div className="flex w-full flex-col gap-3">
    {ciphers.map((c, i) => {
      const solved = c.status === "solved";
      const text = solved ? c.note : scramble(c.length, i + 1, Math.floor(frame / 2));
      return (
        <div key={c.id} className="flex items-center justify-between text-[30px] font-bold" style={{ letterSpacing: "0.12em" }}>
          <span style={{ color: C.white, width: 140 }}>{c.id}</span>
          <span className="flex-1 truncate text-center" style={{ color: solved ? C.cyan : C.amber }}>
            {text}
          </span>
          <span className="whitespace-nowrap text-[20px] font-extrabold" style={{ color: solved ? C.cyan : C.amber, width: 190, textAlign: "right" }}>
            {solved ? "[ DECODED ]" : "[ ACTIVE ]"}
          </span>
        </div>
      );
    })}
  </div>
);

const DecoderFrame: React.FC<{ frame: number; ciphers: CipherRecord[] }> = ({ frame, ciphers }) => {
  const progress = ((frame * 0.7) % 100).toFixed(1);
  return (
    <div className="flex flex-col items-center gap-5 px-8 py-6" style={{ width: 840, border: `3px solid ${C.cyanDim}`, background: "rgba(3,3,5,0.72)" }}>
      <div className="flex w-full justify-between text-[24px] font-extrabold tracking-[0.25em]">
        <span style={{ color: C.cyan }}>DECODER // ACTIVE</span>
        <span style={{ color: C.amber }}>PASS {progress}%</span>
      </div>
      <GlyphMatrix frame={frame} />
      <div className="w-full" style={{ height: 2, background: C.cyanDim }} />
      <CipherRows frame={frame} ciphers={ciphers} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Hard-cut captions                                                   */
/* ------------------------------------------------------------------ */

const Captions: React.FC<{ frame: number; captions: CaptionSegment[]; triggers: string[] }> = ({ frame, captions, triggers }) => {
  const seg = captions.find((s) => frame >= s.from && frame < s.to) ?? captions[captions.length - 1];
  if (!seg) return null;
  const set = new Set(triggers.map(normalize));
  const local = frame - seg.from;
  // Step (not tween) scale on 4-frame intervals: 1.12 → 1.18 → 1.12 …
  const stepScale = 1.12 + (Math.floor(local / 4) % 2) * 0.06;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
      {seg.text.split(/\s+/).map((w, i) => {
        const hot = set.has(normalize(w));
        return (
          <span
            key={`${seg.from}-${i}`}
            className="inline-block font-extrabold uppercase leading-none"
            style={{
              fontSize: 92,
              color: hot ? C.amber : C.white,
              transform: hot ? `scale(${stepScale})` : undefined,
              margin: hot ? "0 14px" : undefined,
              textShadow: hot ? "0 0 28px rgba(245,158,11,0.55)" : "0 0 18px rgba(6,182,212,0.25)",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */

export const NightfileDecoder: React.FC<NightfileProps> = ({
  channel,
  caseId,
  coordinates,
  captions,
  triggers,
  ciphers,
  sound = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const triggerSet = new Set(triggers.map(normalize));
  const hotStarts = captions.filter((s) => s.text.split(/\s+/).some((w) => triggerSet.has(normalize(w)))).map((s) => s.from);

  return (
    <AbsoluteFill style={{ fontFamily, background: C.bg }}>
      <CrtBackground frame={frame} />
      <Reticle frame={frame} cx={SAFE_CX} cy={720} />
      <Hud frame={frame} fps={fps} channel={channel} caseId={caseId} coordinates={coordinates} />

      <div className="absolute -translate-x-1/2" style={{ top: 330, left: SAFE_CX }}>
        <DecoderFrame frame={frame} ciphers={ciphers} />
      </div>

      {/* captions: kept clear of the Shorts action rail (right) and title area (bottom) */}
      <div className="absolute" style={{ top: 1230, left: 60, right: 150, minHeight: 260 }}>
        <Captions frame={frame} captions={captions} triggers={triggers} />
      </div>

      {sound && (
        <>
          <Audio src={staticFile("sfx/drone.wav")} volume={0.4} />
          {captions.map((s) => (
            <Sequence key={`t${s.from}`} from={s.from} durationInFrames={3} layout="none">
              <Audio src={staticFile("sfx/tick.wav")} volume={0.5} />
            </Sequence>
          ))}
          {hotStarts.map((f) => (
            <Sequence key={`g${f}`} from={f} durationInFrames={10} layout="none">
              <Audio src={staticFile("sfx/glitch.wav")} volume={0.45} />
            </Sequence>
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
