import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadPlex } from "@remotion/google-fonts/IBMPlexMono";
import { palette, severityColor } from "./theme";
import type { TimelineNode } from "./types";

/**
 * Episode formats — the STRUCTURE of an Aurelis Short changes per episode, not just the scenes.
 * Brand constants (obsidian/gold/crimson, emblem, voice) stay; everything below varies:
 *
 * | format   | scene slot                 | headline                          | cut transition        | progress            | emblem     | outro                         |
 * |----------|----------------------------|-----------------------------------|-----------------------|---------------------|------------|-------------------------------|
 * | stack    | top 200, under = text      | Inter word-pop, centred           | horizontal whip+flash | top bar             | top-left   | line over last scene + pill   |
 * | poster   | lower half, larger         | Anton condensed caps, top-left,   | vertical push + wipe  | segmented pills     | top-right  | freeze (desat) + giant quote  |
 * |          |                            | line-mask reveal                  |                       |                     |            |                               |
 * | chapters | centred                    | lower-third bar, typewriter       | full-screen year card | left vertical rail  | top-centre | span card "2003 — 2018"       |
 * | dossier  | tilted framed card         | Playfair serif, under the card    | iris reveal           | "02 / 05" counter   | top-left   | card stamped over + line      |
 */
export type EmpireFormat = "stack" | "poster" | "chapters" | "dossier";

const { fontFamily: anton } = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: playfair } = loadPlayfair("normal", { weights: ["800", "900"], subsets: ["latin"] });
const { fontFamily: plex } = loadPlex("normal", { weights: ["500", "700"], subsets: ["latin"] });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.out(Easing.cubic);

const isHot = (w: string, emphasis: readonly string[] = []) => emphasis.some((e) => e.toLowerCase() === w.toLowerCase());

/* ------------------------------ geometry ------------------------------ */

/** Where the 1080×760 scene sits for each format. */
export const sceneBox = (f: EmpireFormat): { top: number; scale: number; rotate: number; frame: boolean } =>
  f === "poster"
    ? { top: 600, scale: 1, rotate: 0, frame: false }
    : f === "chapters"
      ? { top: 330, scale: 1, rotate: 0, frame: false }
      : f === "dossier"
        ? { top: 300, scale: 0.84, rotate: -1.6, frame: true }
        : { top: 200, scale: 1, rotate: 0, frame: false };

export const SceneFrame: React.FC<{ format: EmpireFormat; children: React.ReactNode }> = ({ format, children }) => {
  const b = sceneBox(format);
  return (
    <div className="absolute left-0 w-full" style={{ top: b.top, height: 760, transform: `scale(${b.scale}) rotate(${b.rotate}deg)`, transformOrigin: "50% 50%" }}>
      {b.frame && (
        <div
          className="absolute"
          style={{ inset: "-26px 20px", border: `3px solid ${palette.gold}`, background: "rgba(18,19,27,0.85)", boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}
        />
      )}
      {children}
    </div>
  );
};

/* ------------------------------ text styles ------------------------------ */

/** Anton caps, each line slides up out of a mask. `instant` = fully composed (frame-0 hook). */
export const LineReveal: React.FC<{ text: string; emphasis?: readonly string[]; accent: string; size: number; perLine: number; instant?: boolean; delay?: number; align?: "left" | "center" }> = ({
  text,
  emphasis,
  accent,
  size,
  perLine,
  instant,
  delay = 0,
  align = "left",
}) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[][] = [];
  for (let i = 0; i < words.length; i += perLine) lines.push(words.slice(i, i + perLine));
  return (
    <div className="flex flex-col" style={{ alignItems: align === "left" ? "flex-start" : "center" }}>
      {lines.map((ln, i) => {
        const p = instant ? 1 : interpolate(frame - delay - i * 4, [0, 10], [0, 1], { ...clamp, easing: ease });
        return (
          <div key={i} style={{ overflow: "hidden", paddingTop: 6 }}>
            <div style={{ transform: `translateY(${(1 - p) * 105}%)`, fontFamily: anton, fontSize: size, lineHeight: 1.02, textTransform: "uppercase", letterSpacing: 1 }}>
              {ln.map((w, j) => (
                <span key={j} style={{ color: isHot(w, emphasis) ? accent : palette.bone }}>
                  {w}
                  {j < ln.length - 1 ? " " : ""}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Mono typewriter with a block cursor. */
export const Typewriter: React.FC<{ text: string; emphasis?: readonly string[]; accent: string; size: number; instant?: boolean; delay?: number; cps?: number }> = ({ text, emphasis, accent, size, instant, delay = 0, cps = 1.6 }) => {
  const frame = useCurrentFrame();
  const n = instant ? text.length : Math.max(0, Math.floor((frame - delay) * cps));
  let used = 0;
  const words = text.split(" ");
  return (
    <div style={{ fontFamily: plex, fontWeight: 700, fontSize: size, lineHeight: 1.15, color: palette.bone }}>
      {words.map((w, i) => {
        const start = used;
        used += w.length + 1;
        const vis = w.slice(0, Math.max(0, n - start));
        return (
          <span key={i} style={{ color: isHot(w, emphasis) ? accent : palette.bone }}>
            {vis}
            {i < words.length - 1 && n > start + w.length ? " " : ""}
          </span>
        );
      })}
      {n < text.length || Math.floor(frame / 8) % 2 === 0 ? <span style={{ color: accent }}>▌</span> : null}
    </div>
  );
};

/** Playfair serif, words rise + fade in (editorial). */
export const SerifRise: React.FC<{ text: string; emphasis?: readonly string[]; accent: string; size: number; instant?: boolean; delay?: number }> = ({ text, emphasis, accent, size, instant, delay = 0 }) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div className="flex flex-wrap justify-center" style={{ gap: `0 ${size * 0.28}px`, fontFamily: playfair, fontWeight: 900, fontSize: size, lineHeight: 1.08, textAlign: "center" }}>
      {words.map((w, i) => {
        const p = instant ? 1 : interpolate(frame - delay - i * 3, [0, 12], [0, 1], { ...clamp, easing: ease });
        return (
          <span key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px)`, color: isHot(w, emphasis) ? accent : palette.bone, fontStyle: isHot(w, emphasis) ? "italic" : "normal" }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------ beat text per format ------------------------------ */

export const BeatText: React.FC<{ format: EmpireFormat; node: TimelineNode; index: number; total: number }> = ({ format, node, index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = node.severity === "failure" ? palette.crimson : palette.gold;
  if (format === "poster") {
    const chip = spring({ frame, fps, config: { damping: 18, stiffness: 240 } });
    return (
      <div className="absolute" style={{ top: 190, left: 60, right: 170 }}>
        <span className="inline-block px-4 py-1 text-[30px] font-black tracking-[0.2em]" style={{ background: accent, color: palette.obsidian, transform: `scaleX(${chip})`, transformOrigin: "left" }}>
          {node.label}
        </span>
        <div style={{ marginTop: 14 }}>
          <LineReveal text={node.headline} emphasis={node.emphasis} accent={accent} size={118} perLine={2} delay={2} />
        </div>
      </div>
    );
  }
  if (format === "chapters") {
    return (
      <div className="absolute flex" style={{ top: 1160, left: 70, right: 170 }}>
        <div style={{ width: 8, background: accent, marginRight: 26 }} />
        <div className="flex flex-col gap-3">
          <span style={{ fontFamily: plex, fontSize: 34, fontWeight: 700, color: accent, letterSpacing: 6 }}>
            {String(index + 1).padStart(2, "0")} · {node.label}
          </span>
          <Typewriter text={node.headline} emphasis={node.emphasis} accent={accent} size={70} delay={16} />
        </div>
      </div>
    );
  }
  if (format === "dossier") {
    const y = spring({ frame: frame - 6, fps, config: { damping: 20, stiffness: 200 } });
    return (
      <>
        {/* giant faint year watermark behind everything */}
        <div className="absolute w-full text-center" style={{ top: 1000, left: -50, fontFamily: playfair, fontWeight: 900, fontSize: node.label.length > 5 ? 200 : 330, whiteSpace: "nowrap", color: "rgba(245,245,244,0.05)", transform: `translateY(${(1 - y) * 40}px)` }}>
          {node.label}
        </div>
        <div className="absolute flex flex-col items-center gap-5" style={{ top: 1130, left: 50, right: 170 }}>
          <span style={{ fontFamily: plex, fontSize: 28, fontWeight: 700, color: accent, letterSpacing: 8 }}>
            EXHIBIT {String.fromCharCode(65 + index)} · {node.label}
          </span>
          <SerifRise text={node.headline} emphasis={node.emphasis} accent={accent} size={92} delay={4} />
        </div>
      </>
    );
  }
  return null; // "stack" keeps TimelineBeat
};

/* ------------------------------ transitions ------------------------------ */

/** Entry transition for a beat (frame 0 = beat start). */
export const BeatTransition: React.FC<{ format: EmpireFormat; dir: 1 | -1; children: React.ReactNode }> = ({ format, dir, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (format === "poster") {
    const p = spring({ frame, fps, config: { damping: 22, stiffness: 200, mass: 0.7 } });
    return <AbsoluteFill style={{ transform: `translateY(${(1 - p) * 220}px)`, opacity: Math.min(1, p * 2) }}>{children}</AbsoluteFill>;
  }
  if (format === "chapters") {
    // content arrives after the year card (see YearCard) with a zoom-through
    const p = interpolate(frame, [12, 24], [0, 1], { ...clamp, easing: ease });
    return <AbsoluteFill style={{ transform: `scale(${1.25 - 0.25 * p})`, opacity: frame < 12 ? 0 : 1, filter: `blur(${(1 - p) * 10}px)` }}>{children}</AbsoluteFill>;
  }
  if (format === "dossier") {
    const r = interpolate(frame, [0, 14], [0, 1500], { ...clamp, easing: ease });
    return <AbsoluteFill style={{ clipPath: `circle(${r}px at 50% 42%)` }}>{children}</AbsoluteFill>;
  }
  const p = spring({ frame, fps, config: { damping: 20, stiffness: 260, mass: 0.6 } });
  const x = interpolate(p, [0, 1], [dir * 160, 0]);
  return <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: `blur(${Math.abs(x) / 40}px)` }}>{children}</AbsoluteFill>;
};

/** "chapters" only: a full-screen year slam that doubles as the cut. */
export const YearCard: React.FC<{ node: TimelineNode }> = ({ node }) => {
  const frame = useCurrentFrame();
  if (frame > 14) return null;
  const color = severityColor[node.severity];
  const s = interpolate(frame, [0, 14], [1.15, 0.95]);
  const o = interpolate(frame, [10, 14], [1, 0], clamp);
  return (
    <AbsoluteFill className="items-center justify-center" style={{ background: palette.obsidian, opacity: o, paddingRight: 110 }}>
      <span style={{ fontFamily: anton, fontSize: 300, color: "transparent", WebkitTextStroke: `4px ${color}`, transform: `scale(${s})`, letterSpacing: 4 }}>{node.label}</span>
    </AbsoluteFill>
  );
};

/** "poster" only: a gold line sweeping across at the cut. */
export const WipeLine: React.FC<{ at: number[] }> = ({ at }) => {
  const frame = useCurrentFrame();
  const since = Math.min(...at.map((a) => (frame >= a ? frame - a : 999)));
  if (since > 10) return null;
  const x = interpolate(since, [0, 10], [-200, 1200], { easing: ease });
  return <div className="absolute" style={{ top: 0, bottom: 0, left: x, width: 14, background: palette.gold, boxShadow: `0 0 40px ${palette.gold}`, transform: "skewX(-12deg)" }} />;
};

/* ------------------------------ progress + emblem ------------------------------ */

export const Progress: React.FC<{ format: EmpireFormat; nodes: readonly TimelineNode[]; fps: number }> = ({ format, nodes, fps }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const idx = nodes.findIndex((n) => frame >= n.atSec * fps && frame < (n.atSec + n.durationSec) * fps);
  if (format === "poster") {
    return (
      <div className="absolute flex gap-3" style={{ top: 40, left: 60, right: 60 }}>
        {nodes.map((n, i) => {
          const p = interpolate(frame, [n.atSec * fps, (n.atSec + n.durationSec) * fps], [0, 1], clamp);
          return (
            <div key={n.id} className="h-2 flex-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full" style={{ width: `${p * 100}%`, background: i === idx ? palette.bone : palette.gold }} />
            </div>
          );
        })}
      </div>
    );
  }
  if (format === "chapters") {
    const top = 330, h = 760;
    return (
      <div className="absolute" style={{ left: 30, top, height: h, width: 4, background: "rgba(255,255,255,0.12)" }}>
        <div style={{ height: `${(frame / durationInFrames) * 100}%`, width: 4, background: palette.gold }} />
        {nodes.map((n, i) => (
          <div key={n.id} className="absolute rounded-full" style={{ left: -6, top: `${((n.atSec * fps) / durationInFrames) * 100}%`, width: 16, height: 16, background: i <= idx ? severityColor[n.severity] : "#333" }} />
        ))}
      </div>
    );
  }
  if (format === "dossier") {
    const shown = Math.max(0, idx) + 1;
    if (idx < 0) return null;
    return (
      <div className="absolute" style={{ top: 86, right: 70, fontFamily: plex, fontSize: 34, fontWeight: 700, color: palette.ash, letterSpacing: 4 }}>
        <span style={{ color: palette.gold }}>{String(shown).padStart(2, "0")}</span> / {String(nodes.length).padStart(2, "0")}
      </div>
    );
  }
  return (
    <div className="absolute left-0 top-0 h-3 w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div className="h-full" style={{ width: `${(frame / durationInFrames) * 100}%`, background: `linear-gradient(90deg, ${palette.gold}, ${palette.crimson})` }} />
    </div>
  );
};

export const Emblem: React.FC<{ format: EmpireFormat }> = ({ format }) => {
  if (format === "poster")
    return <Img src={staticFile("emblem.png")} className="absolute" style={{ right: 60, top: 80, width: 84, height: 84 }} />;
  if (format === "chapters")
    return (
      <div className="absolute flex w-full items-center justify-center gap-3" style={{ top: 80, paddingRight: 0 }}>
        <Img src={staticFile("emblem.png")} style={{ width: 64, height: 64 }} />
        <span style={{ fontFamily: plex, fontWeight: 700, fontSize: 28, letterSpacing: 10, color: palette.gold }}>AURELIS</span>
      </div>
    );
  return (
    <div className="absolute flex items-center gap-4" style={{ left: 56, top: 70 }}>
      <Img src={staticFile("emblem.png")} style={{ width: format === "dossier" ? 72 : 88, height: format === "dossier" ? 72 : 88 }} />
      <span className="text-[30px] font-black uppercase tracking-[0.4em]" style={{ color: palette.gold, fontFamily: format === "dossier" ? playfair : undefined }}>
        Aurelis
      </span>
    </div>
  );
};

/* ------------------------------ hook + outro text ------------------------------ */

export const HookText: React.FC<{ format: EmpireFormat; text: string; emphasis?: readonly string[] }> = ({ format, text, emphasis }) => {
  if (format === "poster")
    return (
      <div className="absolute" style={{ top: 190, left: 60, right: 170 }}>
        <LineReveal text={text} emphasis={emphasis} accent={palette.crimson} size={124} perLine={2} instant />
      </div>
    );
  if (format === "chapters")
    return (
      <div className="absolute flex" style={{ top: 1120, left: 70, right: 170 }}>
        <div style={{ width: 10, background: palette.crimson, marginRight: 26 }} />
        {/* hook stays huge in every format (Quibi lesson: 78px typewriter lost the feed) */}
        <LineReveal text={text} emphasis={emphasis} accent={palette.crimson} size={120} perLine={2} instant />
      </div>
    );
  if (format === "dossier")
    return (
      <div className="absolute" style={{ top: 1100, left: 50, right: 170 }}>
        <SerifRise text={text} emphasis={emphasis} accent={palette.crimson} size={118} instant />
      </div>
    );
  return null;
};

export const OutroText: React.FC<{ format: EmpireFormat; text: string; emphasis?: readonly string[]; span: string; prompt?: string }> = ({ format, text, emphasis, span, prompt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = spring({ frame: frame - 16, fps, config: { damping: 16, stiffness: 200 } });
  const Prompt = prompt ? (
    <span className="rounded-full px-8 py-3 text-[40px] font-black uppercase tracking-[0.08em]" style={{ background: palette.gold, color: palette.obsidian, transform: `scale(${pill})` }}>
      {prompt}
    </span>
  ) : null;
  if (format === "poster")
    return (
      <AbsoluteFill style={{ background: "rgba(9,10,15,0.72)" }}>
        <div className="absolute flex flex-col gap-10" style={{ top: 520, left: 60, right: 170 }}>
          <LineReveal text={text} emphasis={emphasis} accent={palette.crimson} size={140} perLine={2} delay={2} />
          <div>{Prompt}</div>
        </div>
      </AbsoluteFill>
    );
  if (format === "chapters") {
    const s = spring({ frame, fps, config: { damping: 20, stiffness: 160 } });
    return (
      <AbsoluteFill className="items-center" style={{ background: palette.obsidian, paddingRight: 110, paddingTop: 520 }}>
        <span style={{ fontFamily: anton, fontSize: 150, color: palette.bone, transform: `scale(${0.9 + 0.1 * s})`, letterSpacing: 2 }}>{span}</span>
        <div style={{ height: 6, width: 520 * s, background: palette.crimson, margin: "30px 0 50px" }} />
        <div style={{ paddingLeft: 40 }}>
          <Typewriter text={text} emphasis={emphasis} accent={palette.crimson} size={64} delay={6} cps={2} />
        </div>
        <div style={{ marginTop: 50 }}>{Prompt}</div>
      </AbsoluteFill>
    );
  }
  if (format === "dossier") {
    const st = spring({ frame: frame - 4, fps, config: { damping: 12, stiffness: 260 } });
    return (
      <>
        <div className="absolute flex w-full justify-center" style={{ top: 560, paddingRight: 110 }}>
          <span
            style={{ fontFamily: anton, fontSize: 150, color: palette.crimson, border: `10px solid ${palette.crimson}`, padding: "0 40px", transform: `rotate(-9deg) scale(${2 - st})`, opacity: st, letterSpacing: 10, background: "rgba(9,10,15,0.5)" }}
          >
            FALLEN
          </span>
        </div>
        <div className="absolute flex flex-col items-center gap-8" style={{ top: 1130, left: 50, right: 170 }}>
          <SerifRise text={text} emphasis={emphasis} accent={palette.crimson} size={92} delay={6} />
          {Prompt}
        </div>
      </>
    );
  }
  return null;
};
