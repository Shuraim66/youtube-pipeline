import React from "react";
import { motion } from "framer-motion";
import { AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { MapBeat, type MapSpec } from "./MapBeat";
import { loadFont as loadElite } from "@remotion/google-fonts/SpecialElite";

/**
 * NightfileHQ — minimalist case-file Short template.
 *
 * - Obsidian canvas with a vignette that blacks out the outer ~15%.
 * - Monospace briefing header.
 * - Evidence window with a hairline border and a slow linear zoom drift.
 * - Word-by-word captions: one word every WORD_FRAMES frames; inactive words at
 *   30% opacity, the active word amber at 1.1x with no transition.
 * - Frame 0 is fully composed (no fades / offsets / lag). The composition is
 *   one loop + 1 frame, and every animated value is computed from
 *   `frame % loop`, so the final frame is identical to frame 0.
 *
 * Framer Motion `motion.*` nodes are only render targets — every value comes
 * from Remotion's frame clock so frame-by-frame renders stay deterministic.
 */

const { fontFamily: sans } = loadInter("normal", { weights: ["800", "900"], subsets: ["latin"] });
const { fontFamily: mono } = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] });
const { fontFamily: elite } = loadElite("normal", { weights: ["400"], subsets: ["latin"] });

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

export type BriefingLine = {
  label: string;
  value: string;
  /** Render the value in amber (e.g. a status). */
  alert?: boolean;
};

export type EvidenceAsset = {
  /** Image path under public/ (e.g. "evidence/letter.jpg"). Omit to use the built-in document plate. */
  src?: string;
  /** Small caption under the window, e.g. "EXHIBIT A — LETTER, 1969". */
  caption: string;
  /** Caption word index at which this asset takes over the window (default 0). */
  fromWord?: number;
  /** CSS object-position for the crop, e.g. "50% 20%". */
  position?: string;
  /**
   * Layout of this beat (varies per episode so no two Shorts look the same):
   * - "window" (default): image in the hairline evidence window
   * - "full": image full-bleed behind everything, darkened
   * - "clock": a timeline of clock times revealed one by one
   * - "count": one giant number with tally marks (highlighted subset)
   * - "checklist": evidence items stamped in as the narration reaches them
   */
  kind?: "window" | "full" | "clock" | "count" | "checklist" | "map";
  /** "map": real coastline zoom with pins (see MapBeat). */
  map?: MapSpec;
  /** Invert a light graphic (e.g. a map) so it sits on the dark canvas. */
  invert?: boolean;
  times?: { time: string; label: string }[];
  count?: { n: number; label: string; highlight?: number; highlightLabel?: string };
  /** Checklist items; each appears when narration reaches `atWord`. */
  items?: { text: string; atWord: number }[];
};

export type NightfileCaseFileProps = {
  briefing: BriefingLine[];
  /** One asset, or several switched by `fromWord`. */
  evidence: EvidenceAsset | EvidenceAsset[];
  /**
   * Narration, split into caption blocks with "|" (each block is shown as one
   * group of words). Example: "IN 1969 | A KILLER WROTE | TO THE PAPERS".
   */
  script: string;
  /** Optional start frame of every word (e.g. from VO alignment). Defaults to WORD_FRAMES rhythm. */
  timings?: number[];
  /** Optional loop length in frames (e.g. VO length). Defaults to words × WORD_FRAMES. */
  loop?: number;
  /** Voiceover file under public/. */
  vo?: string;
  /** Music/ambience bed under public/. */
  bed?: string;
  bedVolume?: number;
  /** Impact hit on frame 0 of every loop (feed-stopper). Set "" to disable. */
  hitSfx?: string;
  /**
   * Structural format — rotate per episode so Shorts don't share a skeleton:
   * - "casefile" (default): mono briefing header, hairline evidence window, big centred word-by-word captions
   * - "tape": camcorder REC/timecode header, larger evidence with scanlines, one-line subtitle captions in a box
   * - "polaroid": red UNSOLVED stamp header, evidence pinned as a tilted polaroid, left-aligned typewriter captions
   */
  format?: "casefile" | "tape" | "polaroid";
  /** Bold frame-0 hook card over the evidence, shown until narration reaches `untilWord`. Last line in amber. */
  hookCard?: { lines: string[]; untilWord: number };
  /** On-screen theory prompt from `fromWord` to the end of the loop (text only; VO stays clean). */
  prompt?: { text: string; fromWord: number };
};

/** Frames each word is active (the requested 10–12 frame rhythm). */
export const WORD_FRAMES = 11;
/** Max zoom of the evidence window at mid-loop. */
const ZOOM_PEAK = 1.03;

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

const C = {
  bg: "#030305",
  white: "#F2F4F5",
  dim: "rgba(242,244,245,0.3)",
  label: "rgba(242,244,245,0.45)",
  amber: "#F59E0B",
  paper: "#D9D3C4",
  ink: "#1A1A1C",
} as const;

/** Horizontal centre of the area clear of the Shorts action rail (x > 940). */
const SAFE_CX = 500;

/* ------------------------------------------------------------------ */
/* Script helpers                                                      */
/* ------------------------------------------------------------------ */

type Word = { text: string; block: number; index: number };

export const parseScript = (script: string): Word[] => {
  const words: Word[] = [];
  script
    .split("|")
    .map((b) => b.trim())
    .filter(Boolean)
    .forEach((block, b) => {
      block
        .split(/\s+/)
        .filter(Boolean)
        .forEach((text) => words.push({ text, block: b, index: words.length }));
    });
  return words;
};

/** One full loop in frames. */
export const loopFrames = (p: Pick<NightfileCaseFileProps, "script" | "loop">) => p.loop ?? parseScript(p.script).length * WORD_FRAMES;
/** Composition length: loop + 1 so the last rendered frame equals frame 0. */
export const getCaseFileDuration = (p: Pick<NightfileCaseFileProps, "script" | "loop">) => loopFrames(p) + 1;

/**
 * Frame-0 punch: the first frame is fully composed (no fade/offset), then a quick
 * push from 1.04 → 1.0 over 10 frames gives the feed something moving in the first
 * third of a second.
 */
const hookPunch = (frame: number) => interpolate(frame, [0, 10], [1.04, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });

/** Index of the word active at `frame`. */
const activeWordAt = (frame: number, count: number, timings?: number[]) => {
  if (!timings) return Math.min(count - 1, Math.floor(frame / WORD_FRAMES));
  let idx = 0;
  for (let i = 0; i < timings.length; i++) if ((timings[i] ?? Infinity) <= frame) idx = i;
  return Math.min(count - 1, idx);
};

/* ------------------------------------------------------------------ */
/* Backdrop                                                            */
/* ------------------------------------------------------------------ */

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      // Clear centre, fully black by the outer ~15% of the frame.
      background: "radial-gradient(ellipse 85% 85% at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.85) 85%, #000 100%)",
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Briefing header                                                     */
/* ------------------------------------------------------------------ */

const BriefingHeader: React.FC<{ lines: BriefingLine[] }> = ({ lines }) => (
  <div className="flex flex-col gap-3" style={{ fontFamily: mono }}>
    {lines.map((l) => (
      <div key={l.label} className="flex items-baseline gap-4 text-[30px] tracking-[0.18em]">
        <span style={{ color: C.label }}>{l.label}:</span>
        <span className="font-bold" style={{ color: l.alert ? C.amber : C.white }}>
          {l.value}
        </span>
      </div>
    ))}
    <div style={{ height: 1, width: 820, background: "rgba(255,255,255,0.12)", marginTop: 6 }} />
  </div>
);

/* ------------------------------------------------------------------ */
/* Evidence window                                                     */
/* ------------------------------------------------------------------ */

/** Built-in stand-in asset: a typed, partly redacted case document. */
const DocumentPlate: React.FC = () => (
  <svg viewBox="0 0 820 620" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <rect width={820} height={620} fill="#0B0B0D" />
    <g transform="translate(90 40) rotate(-2.5 320 270)">
      <rect width={640} height={560} fill={C.paper} />
      <rect width={640} height={560} fill="url(#paperShade)" />
      <text x={40} y={70} fontFamily="Courier New, monospace" fontSize={30} fontWeight={700} fill={C.ink}>
        CASE FILE — CONFIDENTIAL
      </text>
      {Array.from({ length: 10 }, (_, i) => {
        const y = 130 + i * 38;
        const redact = i === 2 || i === 5 || i === 6;
        const w = 520 - ((i * 53) % 160);
        return redact ? (
          <rect key={i} x={40} y={y - 22} width={w} height={28} fill={C.ink} />
        ) : (
          <rect key={i} x={40} y={y - 12} width={w} height={6} fill="rgba(26,26,28,0.55)" />
        );
      })}
      <rect x={400} y={470} width={200} height={60} fill="none" stroke="#8B1E1E" strokeWidth={5} transform="rotate(-8 500 500)" />
      <text x={418} y={512} fontFamily="Courier New, monospace" fontSize={30} fontWeight={700} fill="#8B1E1E" transform="rotate(-8 500 500)">
        UNSOLVED
      </text>
    </g>
    <defs>
      <radialGradient id="paperShade" cx="40%" cy="30%" r="90%">
        <stop offset="0%" stopColor="#fff" stopOpacity={0.08} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.35} />
      </radialGradient>
    </defs>
  </svg>
);

const EvidenceWindow: React.FC<{ asset: EvidenceAsset; frame: number; loop: number }> = ({ asset, frame, loop }) => {
  // Linear drift 1.0 → 1.03 → 1.0 across one loop: continuous, and identical at both ends.
  const half = loop / 2;
  const zoom = interpolate(frame, [0, half, loop], [1, ZOOM_PEAK, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden border border-white/5" style={{ width: 820, height: 620 }}>
        <motion.div className="absolute inset-0" style={{ scale: zoom }}>
          {asset.src ? (
            <Img
              src={staticFile(asset.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: asset.invert ? "contain" : "cover",
                objectPosition: asset.position ?? "50% 50%",
                filter: asset.invert ? "invert(0.92) grayscale(1) contrast(1.2)" : "grayscale(0.6) contrast(1.05) brightness(0.85)",
              }}
            />
          ) : (
            <DocumentPlate />
          )}
        </motion.div>
      </div>
      <span className="text-[24px] tracking-[0.2em]" style={{ fontFamily: mono, color: C.label }}>
        {asset.caption}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Alternate beat layouts (same 820×620 slot, hairline frame)          */
/* ------------------------------------------------------------------ */

const Slot: React.FC<{ caption: string; children: React.ReactNode }> = ({ caption, children }) => (
  <div className="flex flex-col gap-4">
    <div className="relative overflow-hidden border border-white/5" style={{ width: 820, height: 620, background: "rgba(255,255,255,0.015)" }}>
      {children}
    </div>
    <span className="text-[24px] tracking-[0.2em]" style={{ fontFamily: mono, color: C.label }}>
      {caption}
    </span>
  </div>
);

/** Clock times revealed one per ~0.5 s from the beat start (hard cuts, no fades). */
const ClockBeat: React.FC<{ asset: EvidenceAsset; local: number }> = ({ asset, local }) => {
  const times = asset.times ?? [];
  const shown = Math.min(times.length, 1 + Math.floor(local / 16));
  return (
    <Slot caption={asset.caption}>
      <div className="absolute" style={{ left: 120, top: 60, bottom: 60, width: 4, background: "rgba(242,244,245,0.15)" }} />
      <div className="flex h-full flex-col justify-center gap-14" style={{ paddingLeft: 90, fontFamily: mono }}>
        {times.map((t, i) => (
          <div key={t.time} className="flex items-center gap-8" style={{ visibility: i < shown ? "visible" : "hidden" }}>
            <span className="inline-block rounded-full" style={{ width: 28, height: 28, background: i === shown - 1 ? C.amber : C.white }} />
            <span className="whitespace-nowrap text-[56px] font-bold" style={{ color: i === shown - 1 ? C.amber : C.white, width: 300 }}>
              {t.time}
            </span>
            <span className="text-[30px] tracking-[0.12em]" style={{ color: C.label }}>
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </Slot>
  );
};

/** One giant number + tally marks; `highlight` of them in amber. */
const CountBeat: React.FC<{ asset: EvidenceAsset; local: number }> = ({ asset, local }) => {
  const c = asset.count ?? { n: 0, label: "" };
  const marks = Math.min(c.n, 1 + Math.floor(local / 4));
  return (
    <Slot caption={asset.caption}>
      <div className="flex h-full flex-col items-center justify-center gap-8">
        <span className="font-black leading-none" style={{ fontFamily: sans, fontSize: 300, color: C.white }}>
          {c.n}
        </span>
        <div className="flex gap-4">
          {Array.from({ length: c.n }, (_, i) => (
            <span
              key={i}
              className="inline-block"
              style={{ width: 22, height: 90, background: i < (c.highlight ?? 0) ? C.amber : C.white, visibility: i < marks ? "visible" : "hidden" }}
            />
          ))}
        </div>
        <span className="text-[30px] tracking-[0.2em]" style={{ fontFamily: mono, color: C.label }}>
          {c.label}
          {c.highlightLabel && (
            <>
              {" · "}
              <span style={{ color: C.amber }}>{c.highlightLabel}</span>
            </>
          )}
        </span>
      </div>
    </Slot>
  );
};

/** Evidence items stamped in as the narration reaches them. */
const ChecklistBeat: React.FC<{ asset: EvidenceAsset; activeIndex: number }> = ({ asset, activeIndex }) => (
  <Slot caption={asset.caption}>
    <div className="flex h-full flex-col justify-center gap-10 px-14" style={{ fontFamily: mono }}>
      {(asset.items ?? []).map((it, i) => {
        const on = activeIndex >= it.atWord;
        const latest = on && !(asset.items ?? []).some((o) => o.atWord > it.atWord && activeIndex >= o.atWord);
        return (
          <div key={i} className="flex items-center gap-6" style={{ visibility: on ? "visible" : "hidden" }}>
            <span className="text-[26px] font-bold" style={{ color: latest ? C.amber : C.label }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[44px] font-bold uppercase" style={{ color: latest ? C.amber : C.white }}>
              {it.text}
            </span>
          </div>
        );
      })}
    </div>
  </Slot>
);

/** Full-bleed darkened image behind the whole frame. */
const FullBleed: React.FC<{ asset: EvidenceAsset; frame: number; loop: number }> = ({ asset, frame, loop }) => {
  const zoom = interpolate(frame, [0, loop / 2, loop], [1.02, 1.02 + (ZOOM_PEAK - 1), 1.02], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {asset.src && (
        <Img
          src={staticFile(asset.src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: asset.position ?? "50% 50%",
            transform: `scale(${zoom})`,
            filter: "grayscale(0.85) contrast(1.1) brightness(0.45)",
          }}
        />
      )}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,3,5,0.6) 0%, rgba(3,3,5,0.1) 35%, rgba(3,3,5,0.75) 60%, #030305 100%)" }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Captions                                                            */
/* ------------------------------------------------------------------ */

const Captions: React.FC<{ words: Word[]; activeIndex: number }> = ({ words, activeIndex }) => {
  const active = words[activeIndex];
  if (!active) return null;
  const block = words.filter((w) => w.block === active.block);
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center" style={{ fontFamily: sans }}>
      {block.map((w) => {
        const isActive = w.index === activeIndex;
        return (
          <motion.span
            key={w.index}
            className="inline-block font-black uppercase leading-none"
            style={{
              fontSize: 96,
              color: isActive ? C.amber : C.white,
              opacity: isActive ? 1 : 0.3,
              scale: isActive ? 1.1 : 1,
              textShadow: isActive ? "0 0 30px rgba(245,158,11,0.45)" : "none",
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
/* Alternate formats                                                   */
/* ------------------------------------------------------------------ */

const TapeHeader: React.FC<{ lines: BriefingLine[]; frame: number }> = ({ lines, frame }) => {
  const f = frame % 30, sec = Math.floor(frame / 30);
  const tc = `00:${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
  const where = lines[lines.length - 1]?.value ?? "";
  return (
    <div className="flex items-center justify-between" style={{ width: 880, fontFamily: mono, fontSize: 32, color: C.white, letterSpacing: 4 }}>
      <span className="flex items-center gap-4">
        <span className="inline-block rounded-full" style={{ width: 24, height: 24, background: "#EF4444", opacity: Math.floor(frame / 15) % 2 ? 0.25 : 1 }} />
        REC
      </span>
      <span style={{ color: C.amber }}>{tc}</span>
      <span style={{ color: C.label, fontSize: 24 }}>{where}</span>
    </div>
  );
};

/** Frames 1–8 of each loop: RGB-split static bands (frame 0 stays clean and fully composed). */
const OpeningGlitch: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 1 || frame > 8) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {[0.14, 0.33, 0.52, 0.71, 0.86].map((b, i) => (
        <div
          key={i}
          className="absolute left-0 w-full"
          style={{ top: `${b * 100}%`, height: 18 + ((i * 41 + frame * 17) % 80), transform: `translateX(${(((i * 59 + frame * 31) % 120) - 60) * 1.8}px)`, background: i % 2 ? "rgba(245,158,11,0.35)" : "rgba(242,244,245,0.25)", mixBlendMode: "screen" }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Scanlines: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 5px)", pointerEvents: "none" }} />
    <div className="absolute left-0 w-full" style={{ top: `${((frame * 7) % 100)}%`, height: 40, background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
  </>
);

const SubtitleCaptions: React.FC<{ words: Word[]; activeIndex: number }> = ({ words, activeIndex }) => {
  const active = words[activeIndex];
  if (!active) return null;
  const block = words.filter((w) => w.block === active.block);
  return (
    <div className="flex justify-center">
      <div className="px-8 py-4 text-center" style={{ background: "rgba(0,0,0,0.82)", fontFamily: sans, fontWeight: 800, fontSize: 66, lineHeight: 1.15, maxWidth: 860 }}>
        {block.map((w) => (
          <span key={w.index} style={{ color: w.index === activeIndex ? C.amber : C.white }}>
            {w.text}{" "}
          </span>
        ))}
      </div>
    </div>
  );
};

const StampHeader: React.FC<{ lines: BriefingLine[] }> = ({ lines }) => {
  const status = lines.find((l) => l.alert)?.value ?? "UNSOLVED";
  const rest = lines.filter((l) => !l.alert);
  return (
    <div className="flex items-center gap-10" style={{ width: 860 }}>
      <span style={{ fontFamily: elite, fontSize: 64, color: "#DC2626", border: "6px solid #DC2626", padding: "4px 22px", transform: "rotate(-6deg)", letterSpacing: 6 }}>{status}</span>
      <div className="flex flex-col gap-1" style={{ fontFamily: elite, fontSize: 30, color: C.white }}>
        {rest.map((l) => (
          <span key={l.label}>{l.value}</span>
        ))}
      </div>
    </div>
  );
};

/** Polaroid frame around the evidence; tilt alternates per evidence item. */
const Polaroid: React.FC<{ tilt: number; label: string; children: React.ReactNode }> = ({ tilt, label, children }) => (
  <div style={{ transform: `rotate(${tilt}deg)`, background: "#E9E4D8", padding: "22px 22px 0", boxShadow: "0 30px 70px rgba(0,0,0,0.8)", position: "relative" }}>
    <div className="absolute rounded-full" style={{ top: -14, left: "50%", width: 30, height: 30, marginLeft: -15, background: "#B91C1C", boxShadow: "0 4px 8px rgba(0,0,0,0.6)" }} />
    <div style={{ background: "#07070A", padding: "14px 14px 6px", transform: "scale(1)" }}>{children}</div>
    <div style={{ fontFamily: elite, fontSize: 38, color: "#1A1A1C", padding: "14px 6px 18px" }}>{label}</div>
  </div>
);

const TypedCaptions: React.FC<{ words: Word[]; activeIndex: number }> = ({ words, activeIndex }) => {
  const active = words[activeIndex];
  if (!active) return null;
  const prev = words.filter((w) => w.block === active.block - 1);
  // the hook block is shown whole so frame 0 is fully composed
  const cur = words.filter((w) => w.block === active.block && (active.block === 0 || w.index <= activeIndex));
  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: elite, textTransform: "uppercase" }}>
      <div style={{ fontSize: 50, color: C.dim, minHeight: 60 }}>{prev.map((w) => w.text).join(" ")}</div>
      <div style={{ fontSize: 84, color: C.white, lineHeight: 1.1 }}>
        {cur.map((w) => (
          <span key={w.index} style={{ color: w.index === activeIndex ? C.amber : C.white }}>
            {w.text}{" "}
          </span>
        ))}
        <span style={{ color: C.amber }}>▌</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */

export const NightfileCaseFile: React.FC<NightfileCaseFileProps> = ({
  briefing,
  evidence,
  script,
  timings,
  loop: loopOverride,
  vo,
  bed,
  bedVolume = 0.18,
  hitSfx = "audio/boom.wav",
  format = "casefile",
  hookCard,
  prompt,
}) => {
  const words = React.useMemo(() => parseScript(script), [script]);
  const loop = Math.max(1, loopOverride ?? words.length * WORD_FRAMES);
  const frame = useCurrentFrame() % loop;
  const activeIndex = activeWordAt(frame, words.length, timings);
  const assets = Array.isArray(evidence) ? evidence : [evidence];
  const asset = [...assets].reverse().find((a) => activeIndex >= (a.fromWord ?? 0)) ?? assets[0];
  // frame at which the current asset took over (for beat-local animation)
  const assetStart = asset?.fromWord ? (timings?.[asset.fromWord] ?? asset.fromWord * WORD_FRAMES) : 0;
  const local = Math.max(0, frame - assetStart);
  const kind = asset?.kind ?? "window";
  const assetIdx = Math.max(0, assets.indexOf(asset!));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${hookPunch(frame)})` }}>
      {asset && kind === "full" && format !== "polaroid" && <FullBleed asset={asset} frame={frame} loop={loop} />}

      {format === "casefile" && (
        <>
      {/* header */}
      <div className="absolute -translate-x-1/2" style={{ top: 150, left: SAFE_CX, width: 820 }}>
        <BriefingHeader lines={briefing} />
      </div>

      {/* evidence window — upper middle */}
      <div className="absolute -translate-x-1/2" style={{ top: 360, left: SAFE_CX }}>
        {asset && kind === "window" && <EvidenceWindow asset={asset} frame={frame} loop={loop} />}
        {asset && kind === "clock" && <ClockBeat asset={asset} local={local} />}
        {asset && kind === "count" && <CountBeat asset={asset} local={local} />}
        {asset && kind === "checklist" && <ChecklistBeat asset={asset} activeIndex={activeIndex} />}
        {asset && kind === "map" && asset.map && (
          <Slot caption={asset.caption}>
            <MapBeat spec={asset.map} local={local} amber={C.amber} white={C.white} label={C.label} mono={mono} />
          </Slot>
        )}
        {asset && kind === "full" && (
          <div style={{ width: 820, height: 620, display: "flex", alignItems: "flex-end" }}>
            <span className="text-[24px] tracking-[0.2em]" style={{ fontFamily: mono, color: C.label }}>
              {asset.caption}
            </span>
          </div>
        )}
      </div>

      {/* captions — lower-middle third, clear of the action rail and title area */}
      <div className="absolute" style={{ top: 1150, left: 60, right: 150 }}>
        {!(hookCard && activeIndex < hookCard.untilWord) && <Captions words={words} activeIndex={activeIndex} />}
      </div>

        </>
      )}

      {format === "tape" && (
        <>
          <div className="absolute -translate-x-1/2" style={{ top: 170, left: SAFE_CX }}>
            <TapeHeader lines={briefing} frame={frame} />
          </div>
          <div className="absolute -translate-x-1/2" style={{ top: 280, left: SAFE_CX }}>
            <div className="relative" style={{ transform: "scale(1.07)", transformOrigin: "50% 0%" }}>
        {asset && kind === "window" && <EvidenceWindow asset={asset} frame={frame} loop={loop} />}
        {asset && kind === "clock" && <ClockBeat asset={asset} local={local} />}
        {asset && kind === "count" && <CountBeat asset={asset} local={local} />}
        {asset && kind === "checklist" && <ChecklistBeat asset={asset} activeIndex={activeIndex} />}
        {asset && kind === "map" && asset.map && (
          <Slot caption={asset.caption}>
            <MapBeat spec={asset.map} local={local} amber={C.amber} white={C.white} label={C.label} mono={mono} />
          </Slot>
        )}
              {asset && kind === "full" && <div style={{ width: 820, height: 620 }} />}
              <Scanlines frame={frame} />
            </div>
          </div>
          <div className="absolute" style={{ top: 1180, left: 50, right: 150 }}>
            {!(hookCard && activeIndex < hookCard.untilWord) && <SubtitleCaptions words={words} activeIndex={activeIndex} />}
          </div>
        </>
      )}

      {format === "polaroid" && (
        <>
          <div className="absolute" style={{ top: 150, left: 70 }}>
            <StampHeader lines={briefing} />
          </div>
          <div className="absolute -translate-x-1/2" style={{ top: 330, left: SAFE_CX }}>
            <div style={{ transform: "scale(0.92)", transformOrigin: "50% 0%" }}>
              <Polaroid tilt={assetIdx % 2 ? 2.2 : -2.4} label={`EXHIBIT ${String.fromCharCode(65 + assetIdx)}`}>
        {asset && (kind === "window" || kind === "full") && <EvidenceWindow asset={asset} frame={frame} loop={loop} />}
        {asset && kind === "clock" && <ClockBeat asset={asset} local={local} />}
        {asset && kind === "count" && <CountBeat asset={asset} local={local} />}
        {asset && kind === "checklist" && <ChecklistBeat asset={asset} activeIndex={activeIndex} />}
        {asset && kind === "map" && asset.map && (
          <Slot caption={asset.caption}>
            <MapBeat spec={asset.map} local={local} amber={C.amber} white={C.white} label={C.label} mono={mono} />
          </Slot>
        )}
              </Polaroid>
            </div>
          </div>
          <div className="absolute" style={{ top: 1150, left: 70, right: 150 }}>
            {!(hookCard && activeIndex < hookCard.untilWord) && <TypedCaptions words={words} activeIndex={activeIndex} />}
          </div>
        </>
      )}
      {hookCard && activeIndex < hookCard.untilWord && (
        <div className="absolute -translate-x-1/2" style={{ top: format === "tape" ? 1110 : 1080, left: SAFE_CX, width: 860 }}>
          <div className="flex flex-col items-center" style={{ background: "rgba(3,3,5,0.88)", padding: "22px 30px", borderTop: `6px solid ${C.amber}` }}>
            {hookCard.lines.map((l, i) => (
              <span key={i} style={{ fontFamily: sans, fontWeight: 900, fontSize: 104, lineHeight: 1.02, color: i === hookCard.lines.length - 1 ? C.amber : C.white, textTransform: "uppercase", textAlign: "center" }}>
                {l}
              </span>
            ))}
          </div>
        </div>
      )}
      {prompt && activeIndex >= prompt.fromWord && (
        <div className="absolute flex -translate-x-1/2 justify-center" style={{ top: 1450, left: SAFE_CX, width: 820 }}>
          <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 38, color: "#030305", background: C.amber, padding: "12px 30px", borderRadius: 999, textTransform: "uppercase", whiteSpace: "nowrap" }}>{prompt.text}</span>
        </div>
      )}
      </AbsoluteFill>
      <OpeningGlitch frame={frame} />
      <Vignette />

      {hitSfx && <Audio src={staticFile(hitSfx)} volume={0.8} />}
      {hookCard && <Audio src={staticFile("audio/static.wav")} volume={0.5} />}
      {vo && <Audio src={staticFile(vo)} />}
      {bed && <Audio src={staticFile(bed)} volume={bedVolume} loop />}
    </AbsoluteFill>
  );
};
