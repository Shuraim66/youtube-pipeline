import React, { useContext } from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { palette } from "../empire/theme";
import { MapBeat } from "../nightfile/MapBeat";
import { GUESS_BEATS, GUESS_FPS, guessTiming } from "./types";
import type { GuessCard, GuessImage, GuessShortProps } from "./types";

/**
 * "Guess first": question + options + 3-2-1 countdown → reveal → one evidence card at a time → closing line → dissolve into frame 0.
 * Everything is a pure function of t (seconds), so the loop bridge can render Stage at t=0. Clean, full-bleed, no VHS look.
 * Text stays in x 60–900, y 220–1450 (Shorts UI covers the rest); only the brand chip and credit sit above that, top-left.
 */
const { fontFamily: inter } = loadFont("normal", { weights: ["800", "900"], subsets: ["latin"] });
const MONO = "'Courier New', ui-monospace, monospace";
/** per-brand accent: Night File amber, Aurelis gold (same values ArchivalShort uses) */
const ACCENT = { nightfile: "#F59E0B", aurelis: palette.gold } as const;
const AccentCtx = React.createContext<string>(ACCENT.nightfile);
const BONE = "#E8E4DA";
const INK = "#07080C";
const SAFE = { x: 60, w: 840, bottom: 1450 };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

const IllustrationTag: React.FC = () => (
  <div style={{ position: "absolute", left: 660, top: 62, padding: "4px 12px", fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: "rgba(242,244,245,0.9)", background: "rgba(6,7,11,0.6)", border: "1px solid rgba(242,244,245,0.45)" }}>ILLUSTRATION</div>
);

/** `t` = composition time (s); only `seq` backdrops use it */
const Backdrop: React.FC<{ img: GuessImage; local: number; t?: number }> = ({ img, local, t = 0 }) => {
  if (img.seq) {
    const f = Math.max(0, Math.min(img.seq.count - 1, Math.round(t * GUESS_FPS)));
    const src = `${img.seq.dir}/f_${String(f).padStart(4, "0")}.jpg`;
    return (
      <AbsoluteFill style={{ background: INK }}>
        {img.typed ? <Backdrop img={{ ...img, seq: undefined, src }} local={local} /> : (
          <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.9) contrast(1.08)" }} />
        )}
        <IllustrationTag />
      </AbsoluteFill>
    );
  }
  const scale = 1.04 + 0.06 * Math.min(1, local / 4);
  const dark = "brightness(0.58) contrast(1.05) saturate(0.85)";
  if (img.typed) {
    const ty = img.typed;
    const rise = (at: number) => easeOut(interpolate(local, [at, at + 0.25], [0, 1], clamp));
    return (
      <AbsoluteFill style={{ background: INK }}>
        <Img src={staticFile(img.src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: img.focus ?? "50% 50%", transform: "scale(1.25)", filter: "blur(26px) brightness(0.3) saturate(0.7)" }} />
        <div style={{ position: "absolute", left: SAFE.x, top: 520, width: SAFE.w, boxSizing: "border-box", borderLeft: "10px solid #F59E0B", padding: "6px 34px 10px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 26, opacity: rise(0), transform: `translateY(${(1 - rise(0)) * 20}px)` }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 58, letterSpacing: 6, color: BONE }}>ABOARD:</span>
            <span style={{ fontWeight: 900, fontSize: 260, lineHeight: 1, letterSpacing: -6, color: "#F59E0B" }}>{ty.big}</span>
          </div>
          {ty.lines.map((l, i) => (
            <div key={l} style={{ fontWeight: 800, fontSize: 46, lineHeight: 1.3, color: "#fff", opacity: rise(0.3 + i * 0.35), transform: `translateY(${(1 - rise(0.3 + i * 0.35)) * 16}px)` }}>{l}</div>
          ))}
          <div style={{ marginTop: 10, fontWeight: 900, fontSize: 56, color: "#F59E0B", opacity: rise(0.3 + ty.lines.length * 0.35 + 0.15) }}>{ty.foot}</div>
        </div>
      </AbsoluteFill>
    );
  }
  if (img.map) {
    return (
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #14181f 0%, #07080C 75%)" }}>
        <div style={{ position: "absolute", left: SAFE.x, top: 500, width: 820, height: 620, transform: "scale(1.02)", transformOrigin: "0 0" }}>
          <MapBeat spec={img.map} local={local * GUESS_FPS} amber="#F59E0B" white="#F2F4F5" label="rgba(242,244,245,0.55)" mono={MONO} />
        </div>
      </AbsoluteFill>
    );
  }
  if (img.fit === "contain") {
    return (
      <AbsoluteFill>
        <Img src={staticFile(img.src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(42px) brightness(0.32)", transform: "scale(1.3)" }} />
        <Img src={staticFile(img.src)} style={{ position: "absolute", left: 90, top: img.box?.top ?? 250, width: 900, height: img.box?.height ?? 800, objectFit: "contain", transform: `scale(${scale})`, filter: "brightness(0.92)", boxShadow: "0 0 60px rgba(0,0,0,0.6)" }} />
      </AbsoluteFill>
    );
  }
  return <Img src={staticFile(img.src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: img.focus ?? "50% 50%", transform: `scale(${scale * (img.zoom ?? 1)})`, transformOrigin: img.zoom ? (img.focus ?? "50% 50%") : undefined, filter: dark }} />;
};

const Scrim: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)" }} />
);

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const acc = useContext(AccentCtx);
  return (
  <div style={{ position: "absolute", left: SAFE.x, width: SAFE.w, boxSizing: "border-box", background: "rgba(6,7,11,0.88)", borderLeft: `10px solid ${acc}`, padding: "26px 34px", ...style }}>{children}</div>
  );
};

const Highlighted: React.FC<{ text: string; hl?: string }> = ({ text, hl }) => {
  const acc = useContext(AccentCtx);
  const i = hl ? text.indexOf(hl) : -1;
  if (!hl || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span style={{ color: acc }}>{hl}</span>
      {text.slice(i + hl.length)}
    </>
  );
};

const Chrome: React.FC<{ p: GuessShortProps; img: GuessImage }> = ({ p, img }) => {
  const acc = ACCENT[p.brand];
  return (
    <>
      {p.brand === "aurelis" ? (
        <div style={{ position: "absolute", left: SAFE.x, top: 60, display: "flex", alignItems: "center", gap: 14 }}>
          <Img src={staticFile("emblem.png")} style={{ width: 64, height: 64 }} />
          <span style={{ fontFamily: inter, fontWeight: 900, fontSize: 24, letterSpacing: 8, color: acc }}>AURELIS</span>
        </div>
      ) : (
        <div style={{ position: "absolute", left: SAFE.x, top: 68, display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 6, color: acc }}>
          <span style={{ width: 14, height: 14, background: acc, display: "inline-block" }} />THE NIGHT FILE
        </div>
      )}
      <div style={{ position: "absolute", left: SAFE.x, top: p.brand === "aurelis" ? 138 : 118, maxWidth: SAFE.w, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 1, color: BONE, background: "rgba(7,8,12,0.72)", padding: "4px 12px" }}>
        {img.credit}
      </div>

    </>
  );
};

const Stage: React.FC<{ t: number; p: GuessShortProps }> = ({ t, p }) => {
  const acc = ACCENT[p.brand];
  const T = guessTiming(p);
  const B = GUESS_BEATS;
  const inQuestion = t < T.cardsAt;
  const revealed = t >= T.revealAt;
  const cardIdx = T.cardWindows.findIndex(([s, e]) => t >= s - 1e-6 && t < e - 1e-6);
  const inClosing = t >= T.closingAt - 1e-6;

  let img: GuessImage = p.evidence;
  let segStart = 0;
  if (revealed && inQuestion) { img = p.revealImage; segStart = T.revealAt; }
  if (cardIdx >= 0) { img = p.cards[cardIdx]!.img; segStart = T.cardWindows[cardIdx]![0]; }
  if (inClosing) { img = p.closing.img; segStart = T.closingAt; }
  const local = t - segStart;

  const card: GuessCard | undefined = cardIdx >= 0 ? p.cards[cardIdx] : undefined;
  const textIn = (d = 0.2) => easeOut(interpolate(local, [0, d], [0, 1], clamp));

  const remaining = Math.max(0, T.revealAt - t);
  const count = Math.max(1, Math.ceil(remaining - 1e-6));
  const frac = (t - T.countdownAt) % 1;
  const pop = 1 + 0.35 * Math.max(0, 1 - frac * 5);
  const flash = revealed && t < T.revealAt + 0.12 ? 1 - (t - T.revealAt) / 0.12 : 0;
  const stampP = easeOut(interpolate(t - T.revealAt, [0, 0.18], [0, 1], clamp)); // slams in from 1.2× but is visible from the first frame

  return (
    <AccentCtx.Provider value={acc}>
    <AbsoluteFill style={{ background: INK, fontFamily: inter }}>
      <Backdrop img={img} local={local} t={t} />
      <Scrim />

      <Chrome p={p} img={img} />

      {inQuestion && (() => {
        // compact = flow layout for long questions (episodes 2-4): question, options and countdown/stamp stack under the
        // panel with small gaps, so nothing depends on how many lines the question wraps to. Default = Flight 19's fixed layout.
        const compact = !!p.compact;
        const questionPanel = (
          <Panel style={compact ? { position: "relative", left: 0 } : { top: 250 }}>
            {p.question.map((line, i) => (
              <div key={i} style={{ fontWeight: 900, fontSize: compact ? 64 : 66, lineHeight: compact ? 1.06 : 1.1, letterSpacing: -0.5, color: i === 0 ? "#fff" : acc, marginTop: i === 0 ? 0 : compact ? 10 : 14 }}>{line}</div>
            ))}
          </Panel>
        );
        const options = p.options.map((o, i) => {
          const at = B.optionsAt + i * B.optionGap;
          const k = easeOut(interpolate(t, [at, at + B.optionSlide], [0, 1], clamp));
          const correct = o.key === p.correct;
          const fade = revealed ? interpolate(t, [T.revealAt, T.revealAt + 0.2], [1, 0.3], clamp) : 1;
          const hot = revealed && correct ? interpolate(t, [T.revealAt, T.revealAt + 0.12], [0, 1], clamp) : 0;
          const place: React.CSSProperties = compact ? { position: "relative", minHeight: 124, padding: "12px 24px" } : { position: "absolute", left: SAFE.x, top: 720 + i * 176, height: 156, padding: "0 28px" };
          return (
            <div key={o.key} style={{ ...place, width: SAFE.w, boxSizing: "border-box", display: "flex", alignItems: "center", gap: compact ? 22 : 26, opacity: k * (correct ? 1 : fade), transform: `translateX(${(1 - k) * 700}px)`, background: hot > 0 ? acc : "rgba(6,7,11,0.84)", border: `3px solid ${hot > 0 ? acc : "rgba(255,255,255,0.3)"}`, color: hot > 0 ? INK : "#fff" }}>
              <span style={{ flex: "0 0 auto", width: compact ? 76 : 84, height: compact ? 76 : 84, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 64, background: hot > 0 ? INK : acc, color: hot > 0 ? acc : INK }}>{o.key}</span>
              <span style={{ fontWeight: 900, fontSize: 64, lineHeight: compact ? 1.0 : 1.05, letterSpacing: -0.5 }}>{o.text}</span>
            </div>
          );
        });
        const ring = compact ? 140 : 170;
        const r = ring / 2 - 11;
        const slot: React.CSSProperties = compact ? { position: "relative" } : { position: "absolute", left: SAFE.x, top: 1262 };
        const countdown = t >= T.countdownAt && !revealed && (
          <div style={{ ...slot, height: ring, display: "flex", alignItems: "center", gap: 30 }}>
            <div style={{ position: "relative", width: ring, height: ring }}>
              <svg width={ring} height={ring} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                <circle cx={ring / 2} cy={ring / 2} r={r} fill="rgba(6,7,11,0.8)" stroke="rgba(255,255,255,0.22)" strokeWidth={12} />
                <circle cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke={acc} strokeWidth={12} strokeLinecap="round" strokeDasharray={2 * Math.PI * r} strokeDashoffset={2 * Math.PI * r * (1 - remaining / B.countdownSec)} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: compact ? 92 : 112, color: "#fff", transform: `scale(${pop})` }}>{count}</div>
            </div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 38, letterSpacing: 4, color: BONE, background: "rgba(7,8,12,0.72)", padding: "6px 14px" }}>{p.countdownLabel}</div>
          </div>
        );
        const longStamp = p.stamp.length > 22; // two centred lines at 60 px instead of shrinking to an unreadable single line
        const stamp = revealed && (
          <div style={{ ...slot, width: SAFE.w, height: compact ? (longStamp ? 150 : 140) : 170, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: longStamp ? "0 30px" : 0, background: acc, color: INK, fontWeight: 900, fontSize: longStamp ? 60 : Math.min(76, Math.floor(790 / (p.stamp.length * 0.63))), lineHeight: 1.05, letterSpacing: -1, whiteSpace: longStamp ? "normal" : "nowrap", transform: `scale(${1.2 - 0.2 * stampP})` }}>{p.stamp}</div>
        );
        return compact ? (
          <div style={{ position: "absolute", left: SAFE.x, top: 250, width: SAFE.w, display: "flex", flexDirection: "column", gap: 14 }}>
            {questionPanel}
            {options}
            {countdown}
            {stamp}
          </div>
        ) : (
          <>
            {questionPanel}
            {options}
            {countdown}
            {stamp}
          </>
        );
      })()}

      {card && (
        <Panel style={{ bottom: 1920 - SAFE.bottom, opacity: textIn(), transform: `translateY(${(1 - textIn()) * 30}px)` }}>
          <div style={{ fontWeight: 800, fontSize: 56, lineHeight: 1.18, color: "#fff" }}><Highlighted text={card.text} hl={card.hl} /></div>
        </Panel>
      )}

      {inClosing && (
        <Panel style={{ bottom: 1920 - SAFE.bottom, opacity: textIn(), transform: `translateY(${(1 - textIn()) * 30}px)` }}>
          <div style={{ fontWeight: 900, fontSize: 80, lineHeight: 1.1, letterSpacing: -1, color: "#fff" }}>{p.closing.text}</div>
        </Panel>
      )}

      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.3 }} />}

      {p.debugSafe && <div style={{ position: "absolute", left: 60, top: 220, width: 840, height: 1230, border: "3px dashed #ff00ff", boxSizing: "border-box", pointerEvents: "none" }} />}
    </AbsoluteFill>
    </AccentCtx.Provider>
  );
};


/**
 * reveal: "end" — full question + options at frame 0 (options slide in 1.2/1.5/1.8 s), shrink into a compact strip near the top at
 * END_BEATS.stripAt, evidence cards one at a time, then the correct option lights up and the stamp slams in, then the closing line.
 * A progress bar under the strip fills toward the reveal (replaces the countdown ticks).
 */
const EndStage: React.FC<{ t: number; p: GuessShortProps }> = ({ t, p }) => {
  const acc = ACCENT[p.brand];
  const T = guessTiming(p);
  const B = GUESS_BEATS;
  const revealed = t >= T.revealAt - 1e-6;
  const inClosing = t >= T.closingAt - 1e-6;
  const cardIdx = T.cardWindows.findIndex(([s, e]) => t >= s - 1e-6 && t < e - 1e-6);

  let img: GuessImage = p.evidence;
  let segStart = 0;
  if (revealed) { img = p.revealImage; segStart = T.revealAt; }
  if (cardIdx >= 0) { img = p.cards[cardIdx]!.img; segStart = T.cardWindows[cardIdx]![0]; }
  if (inClosing) { img = p.closing.img; segStart = T.closingAt; }
  const local = t - segStart;
  const card: GuessCard | undefined = cardIdx >= 0 ? p.cards[cardIdx] : undefined;
  const textIn = (d = 0.2) => easeOut(interpolate(local, [0, d], [0, 1], clamp));

  // full question/options block -> strip crossfade over stripAt..cardsAt
  const lin = interpolate(t, [T.stripAt, T.cardsAt], [0, 1], clamp);
  const shrink = easeOut(lin);
  const fullOpacity = 1 - interpolate(lin, [0, 0.45], [0, 1], clamp); // full block fades out first,
  const stripOpacity = interpolate(lin, [0.55, 1], [0, 1], clamp); // then the strip fades in (no overlapping text)
  const fade = revealed ? interpolate(t, [T.revealAt, T.revealAt + 0.2], [1, 0.3], clamp) : 1;
  const flash = revealed && t < T.revealAt + 0.12 ? 1 - (t - T.revealAt) / 0.12 : 0;
  const stampP = easeOut(interpolate(t - T.revealAt, [0, 0.18], [0, 1], clamp));
  const progress = interpolate(t, [T.cardsAt, T.revealAt], [0, 1], clamp);
  const hotOf = (k: string) => (revealed && k === p.correct ? interpolate(t, [T.revealAt, T.revealAt + 0.12], [0, 1], clamp) : 0);
  const longStamp = p.stamp.length > 22;

  return (
    <AccentCtx.Provider value={acc}>
    <AbsoluteFill style={{ background: INK, fontFamily: inter }}>
      <Backdrop img={img} local={local} t={t} />
      <Scrim />
      <Chrome p={p} img={img} />

      {fullOpacity > 0.001 && (
        <div style={{ position: "absolute", left: SAFE.x, top: 250, width: SAFE.w, display: "flex", flexDirection: "column", gap: 14, opacity: fullOpacity, transformOrigin: "0 0", transform: `scale(${1 - 0.15 * shrink}) translateY(${-60 * shrink}px)` }}>
          <Panel style={{ position: "relative", left: 0 }}>
            {p.question.map((line, i) => (
              <div key={i} style={{ fontWeight: 900, fontSize: 64, lineHeight: 1.06, letterSpacing: -0.5, color: i === 0 ? "#fff" : acc, marginTop: i === 0 ? 0 : 10 }}>{line}</div>
            ))}
          </Panel>
          {p.options.map((o, i) => {
            const at = B.optionsAt + i * B.optionGap;
            const k = easeOut(interpolate(t, [at, at + B.optionSlide], [0, 1], clamp));
            return (
              <div key={o.key} style={{ position: "relative", minHeight: 112, padding: "10px 24px", width: SAFE.w, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 22, opacity: k, transform: `translateX(${(1 - k) * 700}px)`, background: "rgba(6,7,11,0.84)", border: "3px solid rgba(255,255,255,0.3)", color: "#fff" }}>
                <span style={{ flex: "0 0 auto", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 56, background: acc, color: INK }}>{o.key}</span>
                <span style={{ fontWeight: 900, fontSize: 56, lineHeight: 1.0, letterSpacing: -0.5 }}>{o.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {stripOpacity > 0.001 && (
        <div style={{ position: "absolute", left: SAFE.x, top: 232, width: SAFE.w, opacity: stripOpacity, transform: `translateY(${(1 - shrink) * 20}px)` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {p.options.map((o) => {
              const correct = o.key === p.correct;
              const hot = hotOf(o.key);
              return (
                <div key={o.key} style={{ height: 58, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 16, padding: "0 12px", opacity: correct ? 1 : fade, background: hot > 0 ? acc : "rgba(6,7,11,0.86)", border: `2px solid ${hot > 0 ? acc : "rgba(255,255,255,0.28)"}`, color: hot > 0 ? INK : "#fff" }}>
                  <span style={{ flex: "0 0 auto", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 28, background: hot > 0 ? INK : acc, color: hot > 0 ? acc : INK }}>{o.key}</span>
                  <span style={{ fontWeight: 900, fontSize: 34, letterSpacing: -0.3, whiteSpace: "nowrap" }}>{o.text}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, display: "inline-block", fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: BONE, background: "rgba(7,8,12,0.78)", padding: "4px 12px" }}>{revealed ? "THE ANSWER" : "ANSWER AT THE END"}</div>
          <div style={{ marginTop: 10, height: 8, background: "rgba(255,255,255,0.22)" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: acc }} />
          </div>
        </div>
      )}

      {card && (
        <Panel style={{ bottom: 1920 - SAFE.bottom, opacity: textIn(), transform: `translateY(${(1 - textIn()) * 30}px)` }}>
          <div style={{ fontWeight: 800, fontSize: 56, lineHeight: 1.18, color: "#fff" }}><Highlighted text={card.text} hl={card.hl} /></div>
        </Panel>
      )}

      {revealed && !inClosing && (
        <div style={{ position: "absolute", left: SAFE.x, bottom: 1920 - SAFE.bottom, width: SAFE.w, height: longStamp ? 150 : 140, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: longStamp ? "0 30px" : 0, background: acc, color: INK, fontWeight: 900, fontSize: longStamp ? 60 : Math.min(76, Math.floor(790 / (p.stamp.length * 0.63))), lineHeight: 1.05, letterSpacing: -1, whiteSpace: longStamp ? "normal" : "nowrap", transform: `scale(${1.2 - 0.2 * stampP})` }}>{p.stamp}</div>
      )}

      {inClosing && (
        <Panel style={{ bottom: 1920 - SAFE.bottom, opacity: textIn(), transform: `translateY(${(1 - textIn()) * 30}px)` }}>
          <div style={{ fontWeight: 900, fontSize: p.closing.text.split(/\s+/).length > 12 ? 60 : 80, lineHeight: 1.1, letterSpacing: -1, color: "#fff" }}>{p.closing.text}</div>
        </Panel>
      )}

      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.3 }} />}
      {p.debugSafe && <div style={{ position: "absolute", left: 60, top: 220, width: 840, height: 1230, border: "3px dashed #ff00ff", boxSizing: "border-box", pointerEvents: "none" }} />}
    </AbsoluteFill>
    </AccentCtx.Provider>
  );
};

const Tick: React.FC<{ at: number; src: string; volume: number }> = ({ at, src, volume }) => (
  <Sequence from={Math.round(at * GUESS_FPS)} durationInFrames={90} layout="none">
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

export const GuessShort: React.FC<GuessShortProps> = (p) => {
  const frame = useCurrentFrame();
  const T = guessTiming(p);
  const t = frame / GUESS_FPS;
  const bridgeF = Math.round(GUESS_BEATS.bridgeSec * GUESS_FPS);
  const bridgeStart = T.durationFrames - bridgeF;
  const end = p.reveal === "end";
  const Active = end ? EndStage : Stage;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Active t={t} p={p} />
      {/* loop bridge: dissolve into frame 0 (full question over the formation photo) */}
      {!p.noBridge && frame >= bridgeStart && (
        <AbsoluteFill style={{ opacity: interpolate(frame, [bridgeStart, T.durationFrames], [0, 1], clamp) }}>
          <Active t={0} p={p} />
        </AbsoluteFill>
      )}

{!p.noAudio && <>
      <Audio src={staticFile("sfx/guess_bed.wav")} volume={0.9} />
      {!end && [0, 1, 2].map((i) => (
        <Tick key={i} at={T.countdownAt + i} src="sfx/guess_tick.wav" volume={0.9} />
      ))}
      <Tick at={T.revealAt} src="sfx/guess_hit.wav" volume={0.95} />
      <Tick at={T.closingAt} src="sfx/beat.wav" volume={0.35} />
      </>}
    </AbsoluteFill>
  );
};
