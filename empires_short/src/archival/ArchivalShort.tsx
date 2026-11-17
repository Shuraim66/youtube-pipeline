import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { palette } from "../empire/theme";
import { CAPTION_TOP, HOOK_DEFAULT_TOP, HOOK_FADE, dominantLayer, effectiveCards, effectiveShots, hookUntil, isBeatChange, isV2 } from "./v2";
import type { NarrativeRole, TemplateVersion, V2Config } from "./v2";

/**
 * Aurelis "archival montage" Short (Oct 2026 strategy reset): one PERSON + money + reversal.
 * - frame 0 = a face (archival portrait) with a slow push-in; hook overlay big on frame 0, then docks as a banner
 * - a cut every ~1–2 s, each shot with its own push/pull/pan (Ken Burns), wide images letterboxed over a blurred fill
 * - word-by-word captions from the first word; story cards (numbers / quote / stamp) on top
 * - warm amber grade; `twistAt` switches to a cold, harsher grade (the reversal must LOOK different)
 * - question pill from mid-video; last frames dissolve back into frame 0 (loop)
 */

const { fontFamily: inter } = loadFont("normal", { weights: ["800", "900"], subsets: ["latin"] });
const { fontFamily: playfair } = loadPlayfair("normal", { weights: ["700", "900"], subsets: ["latin"] });

export type Move = "in" | "out" | "left" | "right" | "up";
export type Shot = { src: string; at: number; move?: Move; focus?: string; zoom?: number; /** "contain" keeps the whole (low-res) portrait visible; focus then sets its position */ fit?: "contain"; /** V2: narrative role; a role change gets a transition flash, same-role cuts are plain */ role?: NarrativeRole; /** V2: small on-screen label saying what the image actually shows (place, date, "same model, not hers") */ credit?: string };
export type Card =
  | { kind: "number"; at: number; until: number; value: string; label: string }
  | { kind: "quote"; at: number; until: number; text: string; source: string }
  | { kind: "stamp"; at: number; until: number; text: string };
export type Word = { w: string; s: number; e: number };

export type ArchivalShortProps = {
  vo: string;
  words: Word[];
  /** spoken-token → caption text overrides, e.g. {"12": "TWELVE"} */
  display?: Record<string, string>;
  hook: string[];
  /** frame-0 top of the hook block (default 690 = below a centred face) */
  hookTop?: number;
  shots: Shot[];
  cards: Card[];
  twistAt: number;
  /** shown only inside these [start, end] windows (sec) — short mid-video flash + the final line. Optional in V2. */
  question?: { windows: [number, number][]; text: string };
  durationSec: number;
  /** "aurelis" (default): amber/sepia + gold + emblem; "nightfile": cold B&W + amber accent + grain/flicker + horror bed */
  brand?: "aurelis" | "nightfile";
  /**
   * Per-episode look on top of the same full-bleed montage (rotate so consecutive Shorts don't look identical):
   * "film" (default) · "vhs" (scanlines, REC + timecode, boxed mono subtitles) · "ticker" (scrolling stock tape)
   */
  look?: "film" | "vhs" | "ticker";
  /** vhs: date stamp bottom-left; ticker: the scrolling text */
  lookText?: string;
  /** "v1" (default) = the original format, unchanged. "v2" = 0–2 s hook phase, role-driven transitions, one overlay at a time,
   * payoff card, optional question (see ./v2.ts) */
  templateVersion?: TemplateVersion;
  v2?: V2Config;
};

const MONO = "'Courier New', ui-monospace, monospace";

const NF_AMBER = "#F59E0B";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BRIDGE = 8;

const ShotView: React.FC<{ shot: Shot; frames: number; cold: boolean; nf?: boolean }> = ({ shot, frames, cold, nf }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, frames], [0, 1], clamp);
  const z = shot.zoom ?? 1;
  const m = shot.move ?? "in";
  const scale = m === "in" ? z * (1.04 + 0.1 * p) : m === "out" ? z * (1.16 - 0.1 * p) : z * 1.12;
  const tx = m === "left" ? 40 - 80 * p : m === "right" ? -40 + 80 * p : 0;
  const ty = m === "up" ? 40 - 80 * p : 0;
  const grade = cold
    ? "grayscale(1) contrast(1.35) brightness(0.8)"
    : nf
      ? "grayscale(1) contrast(1.25) brightness(0.78)"
      : "sepia(0.55) saturate(1.3) contrast(1.12) brightness(0.92)";
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* blurred fill so wide engravings never leave black bars */}
      <Img src={staticFile(shot.src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: `${grade} blur(30px) brightness(0.5)`, transform: "scale(1.2)" }} />
      <Img
        src={staticFile(shot.src)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: shot.focus && shot.fit !== "contain" ? "cover" : "contain",
          objectPosition: shot.focus ?? "50% 40%",
          filter: grade,
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
        }}
      />
      {cold && <AbsoluteFill style={{ background: "rgba(127,29,29,0.18)", mixBlendMode: "multiply" }} />}
      {nf && !cold && <AbsoluteFill style={{ background: "rgba(30,58,95,0.22)", mixBlendMode: "multiply" }} />}
    </AbsoluteFill>
  );
};

const Captions: React.FC<{ words: Word[]; display?: Record<string, string>; t: number; accent: string; mono?: boolean }> = ({ words, display, t, accent, mono }) => {
  let idx = -1;
  words.forEach((w, i) => {
    if (w.s <= t) idx = i;
  });
  if (idx < 0) return null;
  const start = Math.floor(idx / 3) * 3;
  const chunk = words.slice(start, start + 3);
  if (mono)
    return (
      <div className="flex justify-center">
        <div style={{ background: "rgba(0,0,0,0.82)", padding: "10px 26px", fontFamily: MONO, fontWeight: 700, fontSize: 64, lineHeight: 1.1, textTransform: "uppercase", textAlign: "center", color: palette.bone }}>
          {chunk.map((w, i) => {
            const txt = display?.[w.w] ?? w.w.replace(/^[,.]+/, "");
            return (
              <span key={start + i} style={{ color: start + i === idx ? accent : palette.bone }}>
                {txt}{i < chunk.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      </div>
    );
  return (
    <div className="flex flex-wrap justify-center" style={{ gap: "0 22px", fontFamily: inter, fontWeight: 900, fontSize: 86, lineHeight: 1.05, textTransform: "uppercase", textAlign: "center" }}>
      {chunk.map((w, i) => {
        const txt = display?.[w.w] ?? w.w.replace(/^[,.]+/, "");
        const on = start + i === idx;
        return (
          <span key={start + i} style={{ color: on ? accent : palette.bone, WebkitTextStroke: "3px #000", paintOrder: "stroke", textShadow: "0 6px 20px rgba(0,0,0,0.9)", transform: on ? "scale(1.08)" : undefined, display: "inline-block" }}>
            {txt}
          </span>
        );
      })}
    </div>
  );
};

const HookOverlay: React.FC<{ lines: string[]; t: number; accent?: string; top0?: number }> = ({ lines, t, accent = palette.gold, top0 = 690 }) => {
  // big on frame 0, docks to a banner after ~3.4 s
  const d = interpolate(t, [3.2, 3.6], [0, 1], clamp);
  const size = 104 - 54 * d;
  // frame 0: sits below the face (chest), then docks to a top banner
  const top = top0 - (top0 - 160) * d;
  return (
    <div className="absolute flex flex-col items-center" style={{ top, left: 60, right: 60, gap: 4 }}>
      {lines.map((l, i) => (
        <span key={i} style={{ fontFamily: inter, fontWeight: 900, fontSize: size, lineHeight: 1.0, textTransform: "uppercase", color: i === lines.length - 1 ? accent : palette.bone, background: "rgba(9,10,15,0.78)", padding: `${6 - 2 * d}px ${18 - 6 * d}px`, textAlign: "center" }}>
          {l}
        </span>
      ))}
    </div>
  );
};

/** V2 hook: big, specific, upper third (clear of captions), only during [0, until); fades out and never docks/returns */
const HookV2: React.FC<{ lines: string[]; t: number; until: number; accent: string; emphasis?: string; top?: number }> = ({ lines, t, until, accent, emphasis, top = HOOK_DEFAULT_TOP }) => {
  if (t >= until) return null;
  const o = interpolate(t, [until - HOOK_FADE, until], [1, 0], clamp);
  const style = (i: number): React.CSSProperties => ({ fontFamily: inter, fontWeight: 900, fontSize: 92, lineHeight: 1.04, textTransform: "uppercase", color: i === lines.length - 1 ? accent : palette.bone, background: "rgba(9,10,15,0.8)", padding: "6px 20px", textAlign: "center" });
  return (
    <div className="absolute flex flex-col items-center" style={{ top, left: 60, right: 60, gap: 6, opacity: o }}>
      {lines.map((l, i) => {
        const k = emphasis ? l.indexOf(emphasis) : -1;
        return (
          <span key={i} style={style(i)}>
            {k < 0 ? l : (
              <>
                {l.slice(0, k)}
                <span style={{ color: accent, fontSize: "1.25em" }}>{emphasis}</span>
                {l.slice(k + emphasis!.length)}
              </>
            )}
          </span>
        );
      })}
    </div>
  );
};

/** V2 payoff, "hero" style: larger, above the captions, image dimmed behind it so it reads as the ending */
const PayoffHero: React.FC<{ text: string; source?: string; kicker?: string; accent: string }> = ({ text, source, kicker, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16, stiffness: 180 } });
  return (
    <>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.45)", opacity: p }} />
      <div className="absolute flex flex-col items-start" style={{ top: 430, left: 70, right: 70, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
        {kicker && <span style={{ fontFamily: inter, fontWeight: 900, fontSize: 34, letterSpacing: 6, color: palette.obsidian, background: accent, padding: "6px 18px", textTransform: "uppercase" }}>{kicker}</span>}
        <div style={{ background: "rgba(9,10,15,0.88)", border: `4px solid ${accent}`, padding: "30px 36px", marginTop: 12 }}>
          <div style={{ fontFamily: playfair, fontWeight: 900, fontSize: 84, lineHeight: 1.08, color: palette.bone }}>{text}</div>
          {source && <div style={{ fontFamily: inter, fontWeight: 800, fontSize: 30, color: accent, marginTop: 18, letterSpacing: 3 }}>{source}</div>}
        </div>
      </div>
    </>
  );
};

const CardView: React.FC<{ card: Card }> = ({ card }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 240 } });
  if (card.kind === "number")
    return (
      <div className="absolute flex flex-col items-center" style={{ top: 560, left: 60, right: 60, transform: `scale(${0.7 + 0.3 * p})`, opacity: p }}>
        <span style={{ fontFamily: inter, fontWeight: 900, fontSize: 170, color: palette.bone, WebkitTextStroke: "4px #000", paintOrder: "stroke", textShadow: "0 10px 40px rgba(0,0,0,0.9)" }}>{card.value}</span>
        <span style={{ fontFamily: inter, fontWeight: 900, fontSize: 40, color: palette.obsidian, background: palette.gold, padding: "4px 18px", letterSpacing: 3, textTransform: "uppercase" }}>{card.label}</span>
      </div>
    );
  if (card.kind === "quote")
    return (
      <div className="absolute flex flex-col items-center" style={{ top: 800, left: 90, right: 90, opacity: p }}>
        <div style={{ background: "rgba(9,10,15,0.82)", borderLeft: `8px solid ${palette.gold}`, padding: "28px 34px" }}>
          <div style={{ fontFamily: playfair, fontWeight: 900, fontStyle: "italic", fontSize: 72, lineHeight: 1.1, color: palette.bone }}>{card.text}</div>
          <div style={{ fontFamily: inter, fontWeight: 800, fontSize: 30, color: palette.gold, marginTop: 16, letterSpacing: 2 }}>{card.source}</div>
        </div>
      </div>
    );
  return (
    <div className="absolute flex w-full justify-center" style={{ top: 600 }}>
      <span style={{ fontFamily: inter, fontWeight: 900, fontSize: 120, color: palette.crimson, border: `10px solid ${palette.crimson}`, padding: "0 30px", transform: `rotate(-8deg) scale(${2 - p})`, opacity: p, background: "rgba(9,10,15,0.55)", letterSpacing: 6 }}>
        {card.text}
      </span>
    </div>
  );
};

export const ArchivalShort: React.FC<ArchivalShortProps> = (props) => {
  const { vo, words, display, hook, twistAt, question, durationSec, brand = "aurelis", hookTop, look = "film", lookText = "" } = props;
  // V1: effectiveShots/effectiveCards return the episode arrays untouched
  const v2 = isV2(props);
  const shots = effectiveShots(props);
  const cards = effectiveCards(props);
  const until = v2 ? hookUntil(props) : 0;
  const payoff = v2 && props.v2!.payoff.show !== false ? props.v2!.payoff : undefined;
  const reduced = v2 && (props.v2!.overlayDensity ?? "reduced") === "reduced";
  const nf = brand === "nightfile";
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const punch = interpolate(frame, [0, 10], [1.04, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const cuts = shots.map((s) => Math.round(s.at * fps));
  const sinceCut = Math.min(...cuts.map((c, i) => (frame >= c && c > 0 && (!v2 || isBeatChange(shots, i)) ? frame - c : 999)));
  const flash = interpolate(sinceCut, [0, 3], [0.22, 0], clamp);
  const twistF = Math.round(twistAt * fps);
  const twistFlash = frame < twistF ? 0 : interpolate(frame - twistF, [0, 6], [0.9, 0], clamp);
  const qWin = question?.windows.find(([a, b]) => t >= a && t < b && (!v2 || dominantLayer(props, t) === "question"));
  const qIn = qWin ? spring({ frame: frame - Math.round(qWin[0] * fps), fps, config: { damping: 14, stiffness: 220 } }) : 0;

  return (
    <AbsoluteFill style={{ background: palette.obsidian }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        {shots.map((s, i) => {
          const from = cuts[i]!;
          const to = i + 1 < shots.length ? cuts[i + 1]! : durationInFrames;
          return (
            <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)} layout="none">
              <ShotView shot={s} frames={to - from} cold={s.at >= twistAt && s.at < durationSec - 2.6} nf={nf} />
            </Sequence>
          );
        })}
        {/* vignette + bottom shade for captions */}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 75% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.2) 100%)" }} />

        {cards.map((c, i) => (
          // V2: a card yields to the payoff card (one dominant overlay at a time)
          <Sequence key={`c${i}`} from={Math.round(c.at * fps)} durationInFrames={Math.max(1, Math.round(((payoff && c.at < (payoff.until ?? Infinity) ? Math.min(c.until, Math.max(c.at, payoff.at)) : c.until) - c.at) * fps))} layout="none">
            <CardView card={c} />
          </Sequence>
        ))}

        {payoff && t >= payoff.at && t < (payoff.until ?? Infinity) && (
          <Sequence from={Math.round(payoff.at * fps)} layout="none">
            {payoff.style === "hero" ? (
              <PayoffHero text={payoff.text} source={payoff.source} kicker={payoff.kicker} accent={nf ? NF_AMBER : palette.gold} />
            ) : (
              <CardView card={{ kind: "quote", at: payoff.at, until: durationSec, text: payoff.text, source: payoff.source ? `— ${payoff.source}` : "" }} />
            )}
          </Sequence>
        )}

        {/* V2: what the current image actually shows — top-left under the brand, clear of captions and the Shorts UI */}
        {v2 && t >= until && (() => {
          const cur = shots.filter((s) => s.at <= t + 1e-6).pop();
          return cur?.credit ? (
            <div className="absolute" style={{ left: 50, top: 150, maxWidth: 760, fontFamily: MONO, fontWeight: 700, fontSize: 27, letterSpacing: 1, color: palette.bone, background: "rgba(9,10,15,0.7)", padding: "4px 12px" }}>
              {cur.credit}
            </div>
          ) : null;
        })()}

        {v2 ? (
          <HookV2 lines={props.v2!.hook.lines} t={t} until={until} accent={nf ? NF_AMBER : palette.gold} emphasis={props.v2!.hook.emphasis} top={props.v2!.hook.top} />
        ) : (
          <HookOverlay lines={hook} t={t} accent={nf ? NF_AMBER : palette.gold} top0={hookTop} />
        )}

        {/* captions sit low (lower third), clear of the bottom title area (y > 1600); V2 shows them from the first word */}
        <div className="absolute" style={{ top: CAPTION_TOP, left: 140, right: 140, opacity: hookTop && !v2 ? interpolate(t, [3.2, 3.4], [0, 1], clamp) : 1 }}>
          <Captions words={words} display={display} t={t} accent={nf ? NF_AMBER : palette.gold} mono={look === "vhs"} />
        </div>

        {qWin && (
          <div className="absolute flex justify-center" style={{ top: 1230, left: 140, right: 140 }}>
            <span style={{ fontFamily: inter, fontWeight: 900, fontSize: qWin === question!.windows[question!.windows.length - 1] ? 58 : 40, background: nf ? NF_AMBER : palette.gold, color: palette.obsidian, padding: "12px 30px", borderRadius: 999, textTransform: "uppercase", transform: `scale(${qIn})`, whiteSpace: "nowrap" }}>
              {question!.text} 👇
            </span>
          </div>
        )}

        {look === "vhs" && (
          <>
            <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 5px)", pointerEvents: "none" }} />
            <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent ${(frame * 7) % 2200 - 200}px, rgba(255,255,255,0.06) ${(frame * 7) % 2200 - 160}px, transparent ${(frame * 7) % 2200 - 120}px)`, pointerEvents: "none" }} />
            <div className="absolute flex items-center" style={{ right: 50, top: 76, gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: palette.bone, letterSpacing: 3 }}>
              <span style={{ width: 20, height: 20, borderRadius: 99, background: "#ef4444", opacity: Math.floor(frame / 15) % 2 ? 1 : 0.25 }} />
              REC {String(Math.floor(t / 60)).padStart(2, "0")}:{String(Math.floor(t % 60)).padStart(2, "0")}:{String(frame % 30).padStart(2, "0")}
            </div>
            {lookText && !reduced && (
              <div className="absolute" style={{ left: 60, top: 1560, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: NF_AMBER, letterSpacing: 3, opacity: 0.85 }}>
                {lookText}
              </div>
            )}
          </>
        )}
        {look === "ticker" && t >= 3.4 && !reduced && (
          <div className="absolute overflow-hidden" style={{ left: 0, right: 0, top: 340, height: 54, background: "rgba(9,10,15,0.85)", borderTop: `2px solid ${palette.gold}`, borderBottom: `2px solid ${palette.gold}` }}>
            <div style={{ whiteSpace: "nowrap", fontFamily: MONO, fontWeight: 700, fontSize: 34, lineHeight: "50px", color: palette.gold, transform: `translateX(${1080 - (frame - 102) * 6}px)` }}>
              {`${lookText}   ·   `.repeat(6)}
            </div>
          </div>
        )}

        {/* emblem */}
        {nf ? (
          <>
            <div className="absolute" style={{ left: 50, top: 80, fontFamily: "monospace", fontWeight: 700, fontSize: 26, letterSpacing: 8, color: NF_AMBER }}>THE NIGHT FILE</div>
            {/* film grain + flicker */}
            <AbsoluteFill style={{ background: `rgba(255,255,255,${0.02 + 0.03 * Math.abs(Math.sin(frame * 1.7))})`, mixBlendMode: "overlay", pointerEvents: "none" }} />
          </>
        ) : (
          // no logo in the 2 s swipe window — brand fades in once the hook has docked
          <div className="absolute flex items-center gap-3" style={{ left: 50, top: 70, opacity: v2 ? interpolate(t, [until + 0.3, until + 0.9], [0, 1], clamp) : interpolate(t, [3.6, 4.2], [0, 1], clamp) }}>
            <Img src={staticFile("emblem.png")} style={{ width: 64, height: 64 }} />
            <span style={{ fontFamily: inter, fontWeight: 900, fontSize: 24, letterSpacing: 8, color: palette.gold }}>AURELIS</span>
          </div>
        )}
      </AbsoluteFill>

      <AbsoluteFill style={{ background: "#fff", opacity: Math.max(flash, twistFlash), pointerEvents: "none" }} />

      {/* loop bridge: dissolve into frame 0 (face + big hook) */}
      <Sequence from={durationInFrames - BRIDGE} layout="none">
        <Bridge>
          <ShotView shot={shots[0]!} frames={60} cold={false} nf={nf} />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 75% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)" }} />
          {v2 ? (
            <HookV2 lines={props.v2!.hook.lines} t={0} until={until} accent={nf ? NF_AMBER : palette.gold} emphasis={props.v2!.hook.emphasis} top={props.v2!.hook.top} />
          ) : (
            <HookOverlay lines={hook} t={0} accent={nf ? NF_AMBER : palette.gold} top0={hookTop} />
          )}
        </Bridge>
      </Sequence>

      <Audio src={staticFile(vo)} />
      {nf ? <Audio src={staticFile("audio/horror_bed.wav")} volume={0.2} loop /> : <Audio src={staticFile("sfx/drone.wav")} volume={0.12} loop />}
      {/* frame-0 hit: deep boom under the hook (Sep winners had riser+boom on the hook) */}
      <Audio src={staticFile("audio/boom.wav")} volume={0.75} />
      {!nf && <Audio src={staticFile("sfx/impact.wav")} volume={0.45} />}
      {/* riser across the last ~0.9 s so the loop lands on the boom */}
      <Sequence from={durationInFrames - 27} durationInFrames={27} layout="none">
        <Audio src={staticFile("sfx/riser.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={twistF} durationInFrames={48} layout="none">
        <Audio src={staticFile("sfx/impact.wav")} volume={0.7} />
      </Sequence>
      {/* no sound on ordinary cuts (a whoosh every ~1 s was grating) — a soft low thump only when a card lands,
          and a short riser into the twist */}
      {cards.map((c) => (
        <Sequence key={`b${c.at}`} from={Math.round(c.at * fps)} durationInFrames={15} layout="none">
          <Audio src={staticFile("sfx/beat.wav")} volume={0.35} />
        </Sequence>
      ))}
      <Sequence from={Math.max(0, twistF - 26)} durationInFrames={28} layout="none">
        <Audio src={staticFile("sfx/riser.wav")} volume={0.25} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Bridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(frame, [0, BRIDGE - 1], [0, 1], clamp) }}>{children}</AbsoluteFill>;
};
