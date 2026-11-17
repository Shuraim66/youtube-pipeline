import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { palette } from "../empire/theme";
import { FPS, TIMELINE, TOTAL_SEC, speech } from "./timeline";
import type { Bar, ResolvedCard, ResolvedSection, Stat } from "./types";

const inter = loadInter("normal", { weights: ["500", "600", "800", "900"], subsets: ["latin"] }).fontFamily;
const serif = loadFraunces("normal", { weights: ["600", "800"], subsets: ["latin"] }).fontFamily;
const GOLD = palette.gold;
const INK = palette.obsidian;
const BONE = palette.bone;
const ASH = palette.ash;
const f = (s: number) => Math.round(s * FPS);
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

/* ---------------------------------------------------------------- b-roll */
const Broll: React.FC<{ file: string; offset: number; len: number; dir: 1 | -1 }> = ({ file, offset, len, dir }) => {
  const frame = useCurrentFrame();
  const p = frame / Math.max(1, f(len));
  const scale = dir === 1 ? 1.02 + 0.07 * p : 1.09 - 0.07 * p;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, filter: "brightness(0.66) contrast(1.08) saturate(0.78)" }}>
        <OffthreadVideo src={staticFile(`longform/broll/${file}`)} startFrom={f(offset)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(9,10,15,0.6) 0%, rgba(9,10,15,0.05) 38%, rgba(9,10,15,0.78) 100%)" }} />
      <AbsoluteFill style={{ background: "rgba(217,119,6,0.07)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(0,0,0,0.65)" }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ data cards */
const countText = (v: number | undefined, p: number, s: { decimals?: number; prefix?: string; suffix?: string; display?: string }) => {
  if (s.display !== undefined) return s.display;
  const d = s.decimals ?? 0;
  const x = (v ?? 0) * ease(p);
  const txt = d ? x.toFixed(d) : Math.round(x).toLocaleString("en-US");
  return `${s.prefix ?? ""}${txt}${s.suffix ?? ""}`;
};

const bigSize = (txt: string, n: number) => {
  const base = n === 1 ? 280 : n === 2 ? 220 : 170;
  return Math.min(base, Math.floor((1500 / n) / Math.max(1, txt.length * (txt.length > 10 ? 0.85 : 0.62))));
};

const StatRow: React.FC<{ stats: Stat[]; t: number }> = ({ stats, t }) => (
  <div style={{ display: "flex", gap: 110, alignItems: "flex-start" }}>
    {stats.map((s, i) => {
      const p = (t - i * 0.18) / 1.0;
      const txt = countText(s.value, p, s);
      const sz = bigSize(txt, stats.length);
      const inP = ease((t - i * 0.18) / 0.35);
      return (
        <div key={i} style={{ opacity: inP, transform: `translateY(${(1 - inP) * 24}px)` }}>
          <div style={{ fontFamily: serif, fontWeight: 800, fontSize: sz, lineHeight: 1, color: GOLD, letterSpacing: -2, whiteSpace: "nowrap" }}>{txt}</div>
          <div style={{ fontFamily: inter, fontWeight: 600, fontSize: 42, color: BONE, marginTop: 18, maxWidth: stats.length === 1 ? 1200 : 560, lineHeight: 1.22 }}>{s.label}</div>
        </div>
      );
    })}
  </div>
);

const BarRows: React.FC<{ bars: Bar[]; t: number; note?: string; noteT: number }> = ({ bars, t, note, noteT }) => {
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, width: 1500 }}>
      {bars.map((b, i) => {
        const p = (t - 0.2 - i * 0.25) / 1.1;
        const w = (b.value / max) * 1080 * ease(p);
        return (
          <div key={i}>
            <div style={{ fontFamily: inter, fontWeight: 600, fontSize: 36, color: i === 0 ? BONE : ASH, marginBottom: 6 }}>{b.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ height: 58, width: Math.max(6, w), background: i === 0 ? GOLD : "rgba(245,245,244,0.32)", borderRadius: 6 }} />
              <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 76, color: i === 0 ? GOLD : BONE, minWidth: 230 }}>{countText(b.value, p, b)}</div>
            </div>
          </div>
        );
      })}
      {note && (
        <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 84, color: GOLD, opacity: ease((t - noteT) / 0.4), transform: `translateY(${(1 - ease((t - noteT) / 0.4)) * 20}px)` }}>{note}</div>
      )}
    </div>
  );
};

const SplitCols: React.FC<{ card: ResolvedCard; t: number }> = ({ card, t }) => (
  <div style={{ display: "flex", gap: 90 }}>
    {card.cols!.map((c, i) => {
      const inP = ease((t - i * 0.35) / 0.5);
      return (
        <div key={i} style={{ width: 760, opacity: inP, transform: `translateY(${(1 - inP) * 30}px)`, borderTop: `6px solid ${i === 0 ? GOLD : BONE}`, paddingTop: 22 }}>
          <div style={{ fontFamily: inter, fontWeight: 800, fontSize: 32, letterSpacing: 6, color: i === 0 ? GOLD : BONE }}>{c.range}</div>
          <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 100, color: BONE, margin: "8px 0 18px" }}>{c.title}</div>
          <div style={{ fontFamily: inter, fontWeight: 500, fontSize: 42, color: ASH, lineHeight: 1.45 }}>{c.items.join(" · ")}</div>
        </div>
      );
    })}
  </div>
);

const Pair: React.FC<{ t: number }> = ({ t }) => {
  const a = ease(t / 0.5), b = ease((t - 0.5) / 0.5), c = ease((t - 1.0) / 0.5);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
      <div style={{ opacity: a, fontFamily: serif, fontWeight: 800, fontSize: 130, color: GOLD, lineHeight: 1.05 }}>1 technical<br />skill</div>
      <div style={{ opacity: b, fontFamily: inter, fontWeight: 900, fontSize: 150, color: BONE }}>+</div>
      <div style={{ opacity: c, fontFamily: serif, fontWeight: 800, fontSize: 130, color: BONE, lineHeight: 1.05 }}>1 human<br />skill</div>
    </div>
  );
};

const CardScene: React.FC<{ card: ResolvedCard; kicker: string }> = ({ card, kicker }) => {
  const frame = useCurrentFrame();
  // a card that opens the video is already settled on frame 0 (no wipe, number already counting)
  const open = card.start === 0;
  const t = frame / FPS + (open ? 1.5 : 0);
  const len = card.end - card.start;
  const reveal = open ? 1 : ease(t / 0.3);
  const drift = interpolate(t, [0, len], [0, 1]);
  return (
    <AbsoluteFill style={{ background: INK, clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${20 + drift * 14}% 40%, rgba(217,119,6,0.20), rgba(9,10,15,0) 62%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(245,245,244,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(245,245,244,0.045) 1px, transparent 1px)", backgroundSize: "96px 96px", backgroundPosition: `${-drift * 60}px 0` }} />
      <div style={{ position: "absolute", left: 150, top: 140, bottom: 140, width: 8, background: GOLD, transform: `scaleY(${ease(t / 0.5)})`, transformOrigin: "top" }} />
      <div style={{ position: "absolute", left: 210, top: 168, fontFamily: inter, fontWeight: 800, fontSize: 30, letterSpacing: 7, color: GOLD }}>{kicker}</div>
      <div style={{ position: "absolute", left: 210, top: 250, right: 150, transform: `scale(${1 + drift * 0.02})`, transformOrigin: "left top" }}>
        {card.headline && <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 64, color: BONE, marginBottom: card.kind === "bars" ? 28 : 56, opacity: ease(t / 0.4) }}>{card.headline}</div>}
        {card.kind === "stats" && <StatRow stats={card.stats!} t={t} />}
        {card.kind === "bars" && <BarRows bars={card.bars!} t={t} note={card.note} noteT={card.noteT} />}
        {card.kind === "split" && <SplitCols card={card} t={t} />}
        {card.kind === "pair" && <Pair t={t} />}
        {card.kind === "cta" && (
          <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 150, color: BONE, lineHeight: 1.05, opacity: ease(t / 0.5) }}>
            Which skill are<br /><span style={{ color: GOLD }}>you choosing?</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------- overlays */
const ChapterCard: React.FC<{ title: string; num?: number; len: number }> = ({ title, num, len }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const inP = ease(t / 0.3), out = ease((len - t) / 0.25);
  const o = Math.min(inP, out);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "rgba(9,10,15,0.74)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 410, height: 260, display: "flex", alignItems: "center", paddingLeft: 150, borderTop: `3px solid ${GOLD}`, borderBottom: `3px solid ${GOLD}`, background: "rgba(9,10,15,0.8)", transform: `translateX(${(1 - inP) * -120}px)` }}>
        {num !== undefined && <span style={{ fontFamily: serif, fontWeight: 800, fontSize: 150, color: GOLD, marginRight: 36 }}>#{num}</span>}
        {num !== undefined && <span style={{ fontFamily: inter, fontWeight: 900, fontSize: 80, color: GOLD, marginRight: 36 }}>·</span>}
        <span style={{ fontFamily: inter, fontWeight: 900, fontSize: title.length > 26 ? 62 : 84, letterSpacing: 4, color: BONE }}>{title}</span>
      </div>
    </AbsoluteFill>
  );
};

const ToStart: React.FC<{ text: string; len: number }> = ({ text, len }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const inP = ease(t / 0.35), out = ease((len - t) / 0.3);
  return (
    <div style={{ position: "absolute", left: 80, bottom: 150, display: "flex", alignItems: "stretch", opacity: Math.min(inP, out), transform: `translateX(${(1 - inP) * -60}px)` }}>
      <span style={{ background: GOLD, color: INK, fontFamily: inter, fontWeight: 900, fontSize: 34, letterSpacing: 5, padding: "16px 24px", display: "flex", alignItems: "center" }}>TO START</span>
      <span style={{ background: "rgba(9,10,15,0.88)", color: BONE, fontFamily: inter, fontWeight: 600, fontSize: 44, padding: "14px 30px", maxWidth: 1300 }}>{text}</span>
    </div>
  );
};

const Tracker: React.FC<{ cur: number }> = ({ cur }) => (
  <div style={{ position: "absolute", right: 80, top: 56, background: "rgba(9,10,15,0.78)", padding: "14px 22px 16px", borderRadius: 4, borderBottom: `3px solid ${GOLD}` }}>
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 24 }}>
      <span style={{ fontFamily: inter, fontWeight: 800, fontSize: 22, letterSpacing: 5, color: ASH }}>15 → 1</span>
      <span style={{ fontFamily: serif, fontWeight: 800, fontSize: 56, color: GOLD, lineHeight: 1 }}>#{cur}</span>
    </div>
    <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
      {Array.from({ length: 15 }, (_, i) => 15 - i).map((n) => (
        <div key={n} style={{ width: 14, height: 7, background: n >= cur ? GOLD : "rgba(245,245,244,0.22)" }} />
      ))}
    </div>
  </div>
);

const Brand: React.FC = () => (
  <div style={{ position: "absolute", left: 80, top: 56, display: "flex", alignItems: "center", gap: 14, opacity: 0.9 }}>
    <Img src={staticFile("emblem.png")} style={{ width: 44, height: 44, objectFit: "contain" }} />
    <span style={{ fontFamily: inter, fontWeight: 900, fontSize: 24, letterSpacing: 8, color: GOLD }}>AURELIS</span>
  </div>
);

const SourceLine: React.FC<{ lines: string[] }> = ({ lines }) => (
  <div style={{ position: "absolute", left: 80, bottom: 56, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
    {lines.map((text, i) => (
      <div key={i} style={{ fontFamily: inter, fontWeight: 600, fontSize: 28, color: BONE, background: "rgba(9,10,15,0.82)", padding: "8px 18px", borderLeft: `5px solid ${GOLD}` }}>
        {i === 0 && <span style={{ color: GOLD, fontWeight: 800, letterSpacing: 4, marginRight: 14, fontSize: 22 }}>SOURCE</span>}
        {text}
      </div>
    ))}
  </div>
);

/** source of the card active at t, else the next card's in the section (so a number spoken just before its card is covered), else the last one */
const sourceAt = (sec: ResolvedSection, t: number): string[] | undefined => {
  const sourced = sec.cards.filter((c) => c.source);
  if (!sourced.length) return undefined;
  const act = sourced.find((c) => t >= c.start && t < c.end);
  if (act) return [act.source!, ...(act.source2 ? [act.source2] : [])];
  const next = sourced.find((c) => c.start > t);
  const prev = [...sourced].reverse().find((c) => c.end <= t);
  const pick = next && t >= sec.visStart && !prev ? next : prev ?? next;
  return pick ? [pick.source!, ...(pick.source2 ? [pick.source2] : [])] : undefined;
};

/* ------------------------------------------------------------- audio mix */
const bedVolume = (frame: number) => {
  const t = frame / FPS;
  let d = 9;
  for (const [a, b] of speech) {
    const dd = t < a ? a - t : t > b ? t - b : 0;
    if (dd < d) d = dd;
    if (a - t > 9) break;
  }
  const duck = interpolate(d, [0, 0.8], [0.055, 0.17], { extrapolateRight: "clamp" });
  const fade = interpolate(t, [0, 2, TOTAL_SEC - 5, TOTAL_SEC], [0.6, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return duck * fade;
};

/* ----------------------------------------------------------------- video */
export const LongForm: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sec = TIMELINE.find((s) => t >= s.visStart && t < s.visEnd) ?? TIMELINE[TIMELINE.length - 1]!;
  const src = sourceAt(sec, t);
  const trackerNum = (() => {
    const first = TIMELINE.find((s) => s.spec.num);
    const last = [...TIMELINE].reverse().find((s) => s.spec.num);
    if (!first || !last || t < first.mark.start - 0.4 || t >= last.mark.end) return undefined;
    return [...TIMELINE].reverse().find((s) => s.spec.num && t >= s.visStart)?.spec.num;
  })();
  const endFade = interpolate(t, [TOTAL_SEC - 1.5, TOTAL_SEC], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Audio src={staticFile("vo/skills2030/vo.wav")} />
      <Audio src={staticFile("audio/skills2030_bed.wav")} volume={bedVolume} />
      <AbsoluteFill style={{ opacity: endFade }}>
        {TIMELINE.map((s) => (
          <React.Fragment key={s.spec.id}>
            {s.pieces.map((p, i) => (
              <Sequence key={`p${i}`} from={f(p.start)} durationInFrames={Math.max(1, f(p.end) - f(p.start))}>
                <Broll file={p.file} offset={p.offset} len={p.end - p.start} dir={p.dir} />
              </Sequence>
            ))}
            {s.cards.map((c, i) => (
              <Sequence key={`c${i}`} from={f(c.start)} durationInFrames={Math.max(1, f(c.end) - f(c.start))}>
                <CardScene card={c} kicker={s.spec.num ? `#${s.spec.num} · ${s.spec.card}` : (s.spec.card ?? "AURELIS")} />
              </Sequence>
            ))}
            {s.toStart && (
              <Sequence from={f(s.toStart.start)} durationInFrames={f(s.toStart.end - s.toStart.start)}>
                <ToStart text={s.toStart.text} len={s.toStart.end - s.toStart.start} />
              </Sequence>
            )}
            {s.chapterCard && s.spec.card && (
              <Sequence from={f(s.chapterCard.start)} durationInFrames={f(s.chapterCard.end - s.chapterCard.start)}>
                <ChapterCard title={s.spec.card} num={s.spec.num} len={s.chapterCard.end - s.chapterCard.start} />
              </Sequence>
            )}
          </React.Fragment>
        ))}
        <Brand />
        {trackerNum !== undefined && <Tracker cur={trackerNum} />}
        {src && <SourceLine lines={src} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
