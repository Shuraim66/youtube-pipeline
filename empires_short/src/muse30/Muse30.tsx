// "Aurelis Test 30": Aurelis long-form pipeline test (30 s), MoneyPsych pipeline + puppet v2.0 (locked) for talking / pointing / reaction beats.
// Data-driven: src/muse30/data.json is built by scripts/muse30_build_data.py (plan + spec + real Kokoro/Whisper timings).
// Adapted from src/oldmoney/OldMoney.tsx. Removed for the 30 s test: the 9-habit tracker, chapter cards/chip, checklist. Kept every other component.
// Layers per beat: plate (slow parallax, dark overlay) -> plate-glued tags -> keyed mascot cut-outs -> drawn props. Global overlays: brand chip,
// data cards, source line, fix card, note chips, key lines. Motion: motion-design skill, "Premium" archetype (decelerating entrances, 0% overshoot).
// Typography: two fonts only. Fraunces Bold = big numbers, title, chapter names. Inter SemiBold/Bold = every other text (min 36 px, labels/headings 40 px+,
// source line 32 px, letter spacing <= 0.04 em, full gold #E0B54A or ivory with a soft dark shadow).
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import data from "./data.json";
import { PropView } from "./props";
import { FRAUNCES, INTER, PAL, SHADOW, clamp, kf, pop, win } from "../moneypsych/theme";
import { Puppet } from "../puppet/Puppet.v2.0.locked";

export const W = 1920, H = 1080, FPS = 30;
export const DUR_FRAMES = Math.ceil(data.total * FPS);
const BE = data.beats as any[];
const lib = (f: string) => staticFile(`img/aurelis/library/${f}`);
const EXIT = Easing.bezier(0.3, 0, 1, 1);
const SCALE = 1.4;
const ez = Easing.inOut(Easing.quad);
const inter = (w: 600 | 700 | 800, size: number, color: string = PAL.ivory): React.CSSProperties => ({ fontFamily: INTER, fontWeight: w, fontSize: size, color, letterSpacing: "0.02em", textShadow: SHADOW });
const fraunces = (size: number, color: string): React.CSSProperties => ({ fontFamily: FRAUNCES, fontWeight: 700, fontSize: size, color, letterSpacing: "0.01em" });

// ------------------------------------------------------------------ pieces
const PuppetM: React.FC<{ c: any; b: any; tl: number }> = ({ c, b, tl }) => {
  const k = pop(tl, 0.05, 0.35); if (k <= 0) return null;
  const cues = c.gesture ? [{ name: c.gesture, from: c.gFrom, to: c.gTo }] : [];
  return <div style={{ position: "absolute", inset: 0, opacity: k, transform: `translateY(${14 * (1 - k)}px)` }}><Puppet x={c.x} feetY={975} height={c.h} expression={c.expr} gestures={cues as any} talkSrc={staticFile("audio/muse30/narration.wav")} talkStartSec={b.start} talkGain={6} /></div>;
};
const Mascot: React.FC<{ c: any; tl: number }> = ({ c, tl }) => {
  const w = c.w * c.scale, h = c.h * c.scale, feet = 975;
  const k = pop(tl, c.at, 0.45); if (k <= 0) return null;
  return (
    <>
      <div style={{ position: "absolute", left: c.x - w * 0.34, top: feet - 14, width: w * 0.68, height: 28, borderRadius: "50%", background: "rgba(0,0,0,.4)", opacity: Math.min(1, k * 4), filter: "blur(5px)" }} />
      <Img src={lib(c.f)} style={{ position: "absolute", left: c.x - w / 2, top: feet - h, width: w, height: h, opacity: Math.min(1, k * 4), transformOrigin: "50% 100%",
        transform: `translateY(${16 * (1 - k)}px) scale(${(0.9 + 0.1 * k + Math.sin(tl * 1.7 + c.x) * 0.005) * (c.flip ? -1 : 1)}, ${0.9 + 0.1 * k}) rotate(${Math.sin(tl * 1.3 + c.x) * 0.35}deg)` }} />
    </>
  );
};

/** tag glued to the plate: Inter Bold, charcoal #1E1612 on gold (red keeps ivory text), padding 0.5em / 0.9em, rounder corners */
const PlateTag: React.FC<{ t: any; tl: number }> = ({ t, tl }) => {
  const k = pop(tl, t.at, 0.4); if (k <= 0) return null;
  const bg = t.kind === "red" ? PAL.danger : t.kind === "cash" ? PAL.bill : PAL.gold, fg = t.kind === "red" ? PAL.ivory : PAL.pillInk;
  return <div style={{ position: "absolute", left: t.x, top: t.y, transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * k})`, opacity: k, padding: "0.5em 0.9em", borderRadius: "0.6em", background: bg, border: `3px solid ${PAL.ink}`,
    fontFamily: INTER, fontWeight: 700, fontSize: 32, color: fg, letterSpacing: "0.02em", whiteSpace: "nowrap", lineHeight: 1.1 }}>{t.text}</div>;
};

const BeatView: React.FC<{ b: any; t: number }> = ({ b, t }) => {
  const tl = t - b.start, c = b.cam;
  const u = Math.min(1, Math.max(0, tl / b.dur)), e = ez(u);
  let z = c.z0 + (c.z1 - c.z0) * e; if (c.punchAt !== undefined) z += 0.1 * pop(tl, c.punchAt, 0.5);
  const px = c.px0 + (c.px1 - c.px0) * e, py = c.py0 + (c.py1 - c.py0) * e;
  const bgT = `translate(${-px * 0.55}px, ${-py * 0.55}px) scale(${z})`, chT = `translate(${-px}px, ${-py}px) scale(${1 + (z - 1) * 1.35})`;
  const fade = kf(tl, [-0.3, 0], [0, 1]);
  const props = (b.props ?? []) as any[];
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ transform: bgT, transformOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: 960 - 768, top: 540 - 432, width: 1536, height: 864, transform: `scale(${SCALE})`, transformOrigin: "50% 50%", filter: "brightness(0.9) saturate(0.92)" }}>
          <Img src={lib(b.plate)} style={{ width: 1536, height: 864 }} />
          {(b.plateTags ?? []).map((pt: any, i: number) => <PlateTag key={i} t={pt} tl={tl} />)}
        </div>
        <AbsoluteFill style={{ background: "rgba(14,14,18,.16)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: chT, transformOrigin: "50% 50%" }}>{(b.cuts as any[]).map((c, i) => c.type === "puppet" ? <PuppetM key={i} c={c} b={b} tl={tl} /> : <Mascot key={i} c={c} tl={tl} />)}</AbsoluteFill>
      {props.map((p, i) => <PropView key={i} p={p} tl={tl} at={p.at} end={p.end} bs={p.bs} />)}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ global overlays
const out = (t: number, end: number, d = 0.3) => 1 - interpolate(t, [end, end + d], [0, 1], { ...clamp, easing: EXIT });

const DataCard: React.FC<{ b: any; t: number }> = ({ b, t }) => {
  const dc = b.dc; const a = b.start + dc.at, end = b.start + b.dur - (b.last ? 0.4 : 0.05);
  const kin = pop(t, a, 0.6), k = kin * out(t, end); if (k <= 0.001) return null;
  const sw = dc.swap ? b.start + dc.swap.at : null; const swapped = sw !== null && t >= sw;
  const cur = swapped ? dc.swap : dc; const t0 = swapped ? sw! : a; const num = pop(t, t0 + 0.15, 0.7), rule = win(t, t0 + 0.5, t0 + 1.0);
  const bars = (!swapped && dc.bars) as any[] | false;
  // stamp: dc.stampAt (relative to beat start) when given — e.g. the CHALLENGED stamp lands on the spoken word — else 1 s after the card appears.
  const st = dc.stampAt !== undefined ? b.start + dc.stampAt : a + 1.0;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: PAL.charcoalDeep, opacity: k * (dc.side ? 0.35 : 0.6) }} />
      <div style={{ position: "absolute", left: dc.side === "L" ? 70 : dc.side === "R" ? 790 : 300, top: 270, width: dc.side ? 1060 : 1320, height: 540, boxSizing: "border-box", borderRadius: 22, background: PAL.charcoalDeep, border: `7px solid ${dc.claim ? PAL.slate : PAL.gold}`, opacity: k, scale: String(0.88 + 0.12 * k), textAlign: "center" }}>
        <div style={{ margin: 18, height: 504, boxSizing: "border-box", borderRadius: 14, border: `2px solid ${PAL.goldDark}`, position: "relative" }}>
          <div style={{ position: "absolute", top: 30, width: "100%", ...inter(700, 40, PAL.gold), padding: "0 30px", boxSizing: "border-box", lineHeight: 1.1 }}>{dc.claim ? "" : cur.label}</div>
          {bars ? bars.map((r, i) => {
            const g = pop(t, a + 0.2 + i * 0.5, 0.8);
            return <div key={i} style={{ position: "absolute", left: 60, top: 128 + i * 112, width: 1140, display: "flex", alignItems: "center", gap: 24, opacity: Math.min(1, g * 3) }}>
              <div style={{ width: 300, flex: "none", textAlign: "right", ...inter(700, 36), lineHeight: 1.1 }}>{r.l}</div>
              <div style={{ width: 440, flex: "none", height: 64, background: PAL.charcoalLift, borderRadius: 10, border: `4px solid ${PAL.ink}`, position: "relative", overflow: "hidden" }}><div style={{ width: `${r.v * g}%`, height: "100%", background: i ? PAL.gold : PAL.slate }} /></div>
              <div style={{ flex: "none", whiteSpace: "nowrap", ...fraunces(52, i ? PAL.gold : PAL.ivory) }}>{r.t}</div></div>;
          }) : <div style={{ position: "absolute", top: 110, width: "100%", ...fraunces(cur.size ?? dc.size ?? 120, dc.claim ? PAL.slate : PAL.gold), lineHeight: 1.05, scale: String(Math.max(0.001, 0.8 + 0.2 * num)), opacity: num, whiteSpace: dc.nowrap ? "nowrap" : "pre-wrap", padding: "0 30px", boxSizing: "border-box" }}>{cur.big}</div>}
          {!bars && !(String(cur.big).length * 0.62 * (cur.size ?? dc.size ?? 120) > (dc.side ? 900 : 1150) && !dc.nowrap) && <div style={{ position: "absolute", top: 325, left: 210, width: 780 * rule, height: 5, background: PAL.ivory }} />}
          {dc.stamp && <div style={{ position: "absolute", right: 52, top: 92, transform: `rotate(-12deg) scale(${2 - pop(t, st, 0.3)})`, opacity: pop(t, st, 0.25), padding: "6px 22px", border: `8px solid ${PAL.danger}`, borderRadius: 12, ...inter(700, 36, PAL.danger), textShadow: "none" }}>{dc.stamp}</div>}
          {dc.claim && <div style={{ position: "absolute", left: 0, right: 0, top: 22, display: "flex", justifyContent: "center" }}><div style={{ padding: "6px 26px", borderRadius: 12, background: PAL.danger, border: `4px solid ${PAL.ink}`, ...inter(800, 50, PAL.ivory), textShadow: "none", whiteSpace: "nowrap" }}>OFTEN QUOTED · NEVER PROVEN</div></div>}
          {dc.claim && <div style={{ position: "absolute", left: "50%", top: 110 + (cur.size ?? dc.size ?? 120) * 0.66, width: String(cur.big).length * 0.62 * (cur.size ?? dc.size ?? 120) + 60, height: 18, borderRadius: 9, background: PAL.danger, border: `3px solid ${PAL.ink}`, transformOrigin: "0% 50%", transform: `translate(-50%, -50%) rotate(-9deg) scaleX(${pop(t, a + 0.7, 0.35)})`, boxShadow: "0 3px 10px rgba(0,0,0,.5)" }} />}
          {cur.cap ? <div style={{ position: "absolute", bottom: 26, width: "100%", ...inter(600, 36), lineHeight: 1.2, opacity: win(t, t0 + 0.9, t0 + 1.4), padding: "0 70px", boxSizing: "border-box" }}>{cur.cap}</div> : null}
        </div>
      </div>
    </>
  );
};

const SourceLine: React.FC<{ s: any; from: number }> = ({ s, from }) => {
  const t = useT(); const a = from + s.at;
  const k = pop(t, a, 0.5) * out(t, s.until); if (k <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${20 * (1 - k)}px)` }}>
      <div style={{ padding: "12px 36px", borderRadius: 14, background: "rgba(27,27,31,.92)", border: `3px solid ${PAL.gold}`, ...inter(600, 36), maxWidth: 1760, textAlign: "center", lineHeight: 1.2 }}>
        <span style={{ color: PAL.gold, fontWeight: 700 }}>SOURCE · </span>{s.text}
      </div>
    </div>
  );
};

const FixCard: React.FC<{ f: any; from: number }> = ({ f, from }) => {
  const t = useT(); const a = from + f.at; const k = pop(t, a, 0.55) * out(t, f.until); if (k <= 0.001) return null;
  const rows = f.lines as string[];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 96, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${26 * (1 - k)}px)` }}>
      <div style={{ padding: "20px 48px 26px", borderRadius: 18, background: PAL.charcoalDeep, border: `5px solid ${PAL.gold}`, minWidth: 760, boxShadow: "0 10px 40px rgba(0,0,0,.5)" }}>
        <div style={{ ...inter(700, 40, PAL.gold), marginBottom: 6 }}>THE FIX</div>
        {rows.map((r, i) => f.ticks ? (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: i ? 14 : 0 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, border: `5px solid ${PAL.gold}`, boxSizing: "border-box", position: "relative", flex: "none" }}>
              <svg width={52} height={52} viewBox="0 0 56 56" style={{ position: "absolute", left: -5, top: -5 }}><path d="M12 29 L24 41 L46 14" fill="none" stroke={PAL.ok} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - pop(t, a + 0.5 + i * 0.7, 0.5))} /></svg></div>
            <div style={inter(700, 44)}>{r}</div></div>
        ) : <div key={i} style={{ ...inter(i ? 600 : 700, i ? 38 : 52), lineHeight: 1.2 }}>{r}</div>)}
      </div>
    </div>
  );
};

/** pill note: Inter Bold 40 px, charcoal on gold, padding 0.5em / 0.9em */
const Note: React.FC<{ b: any; t: number }> = ({ b, t }) => {
  const a = b.start + 0.5, k = pop(t, a, 0.4) * out(t, Math.min(b.start + b.dur - (b.last ? 0.45 : 0.1), a + 3.4)); if (k <= 0.001) return null;
  return <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, display: "flex", justifyContent: "center", opacity: k }}><div style={{ padding: "0.5em 0.9em", borderRadius: "0.6em", background: PAL.gold, border: `3px solid ${PAL.ink}`, fontFamily: INTER, fontWeight: 700, fontSize: 40, color: PAL.pillInk, letterSpacing: "0.02em", lineHeight: 1.1 }}>{b.note}</div></div>;
};

const KeyLines: React.FC<{ b: any; t: number }> = ({ b, t }) => {
  const end = b.start + b.dur - 0.05;
  return <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", opacity: out(t, end) }}>
    {(b.lines as any[]).map((l, i) => { const k = pop(t, b.start + l.at, 0.5); return <div key={i} style={{ opacity: k, transform: `translateY(${22 * (1 - k)}px)`, ...inter(700, 76, l.c === "gold" ? PAL.gold : PAL.ivory), letterSpacing: "0.02em", marginBottom: 8 }}>{l.t}</div>; })}</div>;
};

const Title: React.FC<{ b: any; t: number }> = ({ b, t }) => {
  const tl = t - b.start; const k = pop(tl, -0.7, 0.7) * (1 - interpolate(tl, [1.8, 2.0], [0, 1], { ...clamp })); if (k <= 0.001) return null;   // fully on at frame 0, gone at 2 s (quick cut)
  return <div style={{ position: "absolute", left: 0, right: 380, top: 60, textAlign: "center", opacity: k, transform: `translateY(${24 * (1 - k)}px)` }}>
    <div style={{ ...inter(700, 36, PAL.gold), letterSpacing: "0.04em", marginBottom: 12 }}>AURELIS HQ</div>
    <div style={{ ...fraunces(104, PAL.gold), textShadow: "0 6px 26px rgba(0,0,0,.8)", lineHeight: 1.02 }}>AURELIS TEST 30</div>
    <div style={{ width: 640 * win(tl, -0.5, 0.1), height: 5, background: PAL.ivory, margin: "22px auto 18px" }} />
  </div>;
};

/** static brand chip, top-left; hidden during the end beat so the end card gets the full stage (same as the oldmoney chapter chip) */
const BrandChip: React.FC<{ t: number }> = ({ t }) => {
  const end = BE.find((b) => b.end); if (end && t >= end.start) return null;
  const k = pop(t, 0.6, 0.5); if (k <= 0.001) return null;
  return <div style={{ position: "absolute", left: 40, top: 28, padding: "10px 26px 12px", borderRadius: 14, background: "rgba(27,27,31,.92)", border: `4px solid ${PAL.gold}`, opacity: k, transform: `translateY(${-12 * (1 - k)}px)` }}>
    <div style={{ ...inter(700, 36, PAL.gold), letterSpacing: "0.04em", lineHeight: 1.1 }}>AURELIS HQ</div>
    <div style={{ ...fraunces(36, PAL.ivory), textShadow: SHADOW, lineHeight: 1.15 }}>AURELIS TEST 30</div></div>;
};

/** end card: the closing question, the "nine habits" line, and the education note (no 9-pip grid — the tracker is removed for the 30 s test) */
const EndCard: React.FC<{ b: any; t: number }> = ({ b, t }) => {
  const tl = t - b.start; const k = pop(tl, 0.1, 0.7); if (k <= 0.001) return null;
  return <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", opacity: k, transform: `translateY(${22 * (1 - k)}px)` }}>
      <div style={{ ...fraunces(82, PAL.gold), textShadow: "0 6px 26px rgba(0,0,0,.8)" }}>Which one are you starting with?</div>
      <div style={{ ...inter(700, 40), marginTop: 10, opacity: win(tl, 1.2, 1.8) }}>NINE HABITS IN THE FULL VIDEO</div></div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, display: "flex", justifyContent: "center", opacity: win(tl, 1.8, 2.4) }}>
      <div style={{ padding: "0.5em 0.9em", borderRadius: "0.6em", background: PAL.gold, border: `3px solid ${PAL.ink}`, fontFamily: INTER, fontWeight: 700, fontSize: 40, color: PAL.pillInk, letterSpacing: "0.02em", lineHeight: 1.1 }}>EDUCATION ONLY · NOT FINANCIAL ADVICE</div></div>
  </>;
};

/** "Old money lesson" card: cream card, small gold label, serif italic line, gold rule; always frame-left (the puppet points at it from frame-right) */
const LessonCard: React.FC<{ b: any; t: number }> = ({ b, t }) => {
  const tl = t - b.start; const k = pop(tl, 0.15, 0.6) * out(t, b.start + b.dur - (b.last ? 0.4 : 0.05)); if (k <= 0.001) return null;
  const big = b.sec === "h1";
  return <div style={{ position: "absolute", left: 90, top: big ? 220 : 260, width: 1040, padding: "34px 54px 42px", boxSizing: "border-box", borderRadius: 20, background: PAL.ivory, border: `6px solid ${PAL.gold}`, boxShadow: "0 14px 50px rgba(0,0,0,.55)", opacity: k, transform: `translateY(${24 * (1 - k)}px) scale(${0.95 + 0.05 * k})` }}>
    <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 36, color: PAL.goldDark, letterSpacing: "0.04em" }}>OLD MONEY LESSON</div>
    <div style={{ width: 260 * win(tl, 0.4, 1.0), height: 5, background: PAL.gold, margin: "14px 0 20px" }} />
    <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontStyle: "italic", fontSize: big ? 76 : 62, lineHeight: 1.15, color: PAL.pillInk }}>{b.lesson.text}</div>
  </div>;
};
/** open-loop chip (teaser) or payoff card (frame-left, the puppet points at it) */
const LoopCard: React.FC<{ b: any; t: number }> = ({ b, t }) => {
  const tl = t - b.start, L = b.loop; const k = pop(tl, 0.3, 0.5) * out(t, b.start + b.dur - (b.last ? 0.4 : 0.05)); if (k <= 0.001) return null;
  if (!L.payoff) return <div style={{ position: "absolute", left: 0, right: 520, top: 170, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${18 * (1 - k)}px)` }}>
    <div style={{ padding: "0.5em 0.9em", borderRadius: "0.6em", background: PAL.gold, border: `3px solid ${PAL.ink}`, fontFamily: INTER, fontWeight: 700, fontSize: 40, color: PAL.pillInk, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{L.text}</div></div>;
  return <div style={{ position: "absolute", left: 120, top: 300, width: 980, textAlign: "center", padding: "36px 40px 44px", boxSizing: "border-box", borderRadius: 22, background: "rgba(27,27,31,.92)", border: `7px solid ${PAL.gold}`, opacity: k, transform: `scale(${0.92 + 0.08 * k})` }}>
    <div style={{ ...fraunces(150, PAL.gold), lineHeight: 0.95 }}>#{L.n}</div>
    <div style={{ width: 380 * win(tl, 0.6, 1.2), height: 5, background: PAL.ivory, margin: "14px auto 18px" }} />
    <div style={{ ...inter(700, 44), lineHeight: 1.2 }}>{L.text.replace(/^#\d · /, "")}</div></div>;
};

const Vignette: React.FC = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(0,0,0,.46) 100%)", pointerEvents: "none" }} />;
const TCtx = React.createContext(0); const useT = () => React.useContext(TCtx);

// ------------------------------------------------------------------ composition
export const Muse30: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  const live = BE.filter((b) => t >= b.start - 0.3 && t < b.start + b.dur + 0.15 + 0.01);
  return (
    <TCtx.Provider value={t}>
      <AbsoluteFill style={{ background: PAL.charcoalDeep }}>
        <Audio src={staticFile("audio/muse30/narration_mix.wav")} />
        {live.map((b) => <BeatView key={b.i} b={b} t={t} />)}
        <Vignette />
        {BE.filter((b) => b.dc && t >= b.start + b.dc.at - 0.05 && t < b.start + b.dur - (b.last ? 0.4 : 0.05) + 0.35).map((b) => <DataCard key={b.i} b={b} t={t} />)}
        {BE.filter((b) => b.src && t >= b.start + b.src.at - 0.05 && t < b.src.until + 0.4).map((b) => <SourceLine key={b.i} s={b.src} from={b.start} />)}
        {BE.filter((b) => b.fix && t >= b.start + b.fix.at - 0.05 && t < b.fix.until + 0.4).map((b) => <FixCard key={b.i} f={b.fix} from={b.start} />)}
        {BE.filter((b) => b.title && t < b.start + 2.2).map((b) => <Title key={b.i} b={b} t={t} />)}
        {BE.filter((b) => b.lines && t >= b.start && t < b.start + b.dur + 0.4).map((b) => <KeyLines key={b.i} b={b} t={t} />)}
        {BE.filter((b) => b.lesson && t >= b.start && t < b.start + b.dur + 0.4).map((b) => <LessonCard key={b.i} b={b} t={t} />)}
        {BE.filter((b) => b.loop && t >= b.start && t < b.start + b.dur + 0.4).map((b) => <LoopCard key={b.i} b={b} t={t} />)}
        {BE.filter((b) => b.note && t >= b.start && t < b.start + b.dur + 0.1).map((b) => <Note key={b.i} b={b} t={t} />)}
        {BE.filter((b) => b.end && t >= b.start).map((b) => <EndCard key={b.i} b={b} t={t} />)}
        <BrandChip t={t} />
      </AbsoluteFill>
    </TCtx.Provider>
  );
};
