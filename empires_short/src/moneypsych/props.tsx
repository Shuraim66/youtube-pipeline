// Drawn Remotion props for the Money Psychology video (flat vector, Aurelis palette: gold on charcoal). No external images.
// Typography: Fraunces Bold only for big numbers; Inter Bold/SemiBold for all other text. SVG units are scaled x1.25 on screen, so 30 units = 37.5 px.
// Pills (tags) = Inter Bold on gold with charcoal #1E1612 text; labels over plates = Inter Bold ivory on a charcoal pill at 80% opacity.
import React from "react";
import { Easing, interpolate } from "remotion";
import { FRAUNCES, INTER, PAL, clamp, pop, win } from "./theme";

export type PropArgs = { p: any; tl: number; at: number; end: number; bs: number[] };
const INK = PAL.ink, GOLD = PAL.gold, GD = PAL.goldDark, IV = PAL.ivory, BILL = PAL.bill, RED = PAL.danger, OK = PAL.ok, CH = PAL.charcoalLift, PINK = PAL.pillInk;
const COL: Record<string, string> = { gold: GOLD, ivory: IV, bill: BILL, danger: RED, ok: OK, slate: PAL.slate };
const sw = { stroke: INK, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const MIN = 30;                                                        // minimum SVG font size (= 37.5 px on screen)
const cw = (s: number, n: number) => n * 0.66 * s;                     // approx width of n Inter Bold capitals

export const Frame: React.FC<{ x: number; y: number; k: number; w?: number; h?: number; children: React.ReactNode }> = ({ x, y, k, w = 600, h = 440, children }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: x - w / 2, top: y - h / 2, opacity: k, overflow: "visible", transform: `translateY(${18 * (1 - k)}px) scale(${(0.92 + 0.08 * k) * 1.25})`, transformOrigin: "50% 60%" }}>{children}</svg>
);
const T: React.FC<{ x: number; y: number; s?: number; c?: string; w?: number; num?: boolean; anchor?: "middle" | "start" | "end"; o?: number; children: React.ReactNode }> = ({ x, y, s = 32, c = IV, w = 700, num, anchor = "middle", o = 1, children }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={num ? FRAUNCES : INTER} fontWeight={num ? 700 : w} fontSize={num ? s : Math.max(s, MIN)} fill={c} opacity={o} letterSpacing="0.01em"
    stroke={INK} strokeWidth={3} paintOrder="stroke" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,.8))" }}>{children}</text>
);
/** pill: Inter Bold, charcoal #1E1612 on gold (or the given colour); padding 0.5 em vertical, 0.9 em horizontal; centred on (x, y) */
const Pill: React.FC<{ x: number; y: number; text: string; s?: number; bg?: string; fg?: string }> = ({ x, y, text, s = 32, bg = GOLD, fg = PINK }) => {
  const w = cw(s, text.length) + 1.8 * s, h = 1.8 * s;
  return <g><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={0.6 * s} fill={bg} stroke={INK} strokeWidth={4} /><text x={x} y={y + 0.36 * s} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={s} fill={fg} letterSpacing="0.01em">{text}</text></g>;
};
/** label over a plate: Inter Bold ivory on a small charcoal pill at about 80% opacity */
const Lab: React.FC<{ x: number; y: number; text: string; s?: number; c?: string }> = ({ x, y, text, s = 30, c = IV }) => {
  const w = cw(s, text.length) + 1.3 * s, h = 1.45 * s;
  return <g><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={0.5 * s} fill="rgba(30,22,18,.8)" /><text x={x} y={y + 0.36 * s} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={s} fill={c} letterSpacing="0.01em" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,.8))" }}>{text}</text></g>;
};
const Coin: React.FC<{ x: number; y: number; r?: number; o?: number }> = ({ x, y, r = 22, o = 1 }) => (
  <g opacity={o}><ellipse cx={x} cy={y} rx={r} ry={r * 0.45} fill={GOLD} {...sw} /><ellipse cx={x} cy={y - 3} rx={r * 0.55} ry={r * 0.2} fill="none" stroke={GD} strokeWidth={2.5} /></g>
);
const Bill: React.FC<{ x: number; y: number; w?: number; h?: number; rot?: number; o?: number }> = ({ x, y, w = 110, h = 52, rot = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} fill={BILL} {...sw} /><circle r={h * 0.26} fill="none" stroke="#6C7A52" strokeWidth={3} /></g>
);
const Card: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 120, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}><rect x={-w / 2} y={-w * 0.32} width={w} height={w * 0.64} rx={9} fill={GOLD} {...sw} /><rect x={-w / 2 + 4} y={-w * 0.32 + w * 0.14} width={w - 8} height={w * 0.1} fill={GD} /></g>
);
const Env: React.FC<{ x: number; y: number; w?: number; o?: number }> = ({ x, y, w = 130, o = 1 }) => (
  <g opacity={o} transform={`translate(${x} ${y})`}><rect x={-w / 2} y={-w * 0.34} width={w} height={w * 0.68} rx={6} fill={IV} {...sw} /><path d={`M${-w / 2},${-w * 0.34} L0,${w * 0.08} L${w / 2},${-w * 0.34}`} fill="none" {...sw} /><circle cx={0} cy={w * 0.08} r={8} fill={GOLD} stroke={INK} strokeWidth={3} /></g>
);
const Person: React.FC<{ x: number; y: number; s?: number; c?: string; o?: number; dash?: boolean }> = ({ x, y, s = 1, c = GOLD, o = 1, dash }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill={dash ? "none" : c} stroke={dash ? c : INK} strokeWidth={dash ? 4 : 5} strokeDasharray={dash ? "10 8" : undefined} strokeLinejoin="round">
    <circle cx={0} cy={-92} r={26} /><path d="M-38,0 L-30,-58 Q0,-74 30,-58 L38,0 Z" />
  </g>
);

// ---------------------------------------------------------------- individual props
const Moon: React.FC<PropArgs & { k: number }> = ({ tl, at }) => (
  <>
    <path d="M300,70 A120,120 0 1,0 420,250 A92,92 0 1,1 300,70 Z" fill={IV} {...sw} />
    {[[120, 90, 7], [480, 80, 5], [520, 200, 6], [90, 230, 5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r! + Math.sin(tl * 3 + i) * 1.5} fill={GOLD} />)}
    {[0, 1, 2].map((i) => { const u = (tl - at - i * 0.5) % 2.2; const kk = u < 0 ? 0 : u / 2.2; return <text key={i} x={430 + i * 36 + kk * 26} y={190 - i * 30 - kk * 90} fontFamily={INTER} fontWeight={700} fontSize={34 + i * 12} fill={GOLD} opacity={Math.sin(Math.PI * kk)}>z</text>; })}
  </>
);
const Spiral: React.FC<PropArgs & { k: number }> = ({ tl, at }) => {
  const pts: string[] = []; const rot = (tl - at) * 70;
  for (let a = 0; a < 15; a += 0.15) { const r = 8 + a * 12; pts.push(`${300 + Math.cos(a + (rot * Math.PI) / 180) * r},${220 + Math.sin(a + (rot * Math.PI) / 180) * r * 0.82}`); }
  return <><polyline points={pts.join(" ")} fill="none" stroke={GOLD} strokeWidth={9} strokeLinecap="round" /><polyline points={pts.join(" ")} fill="none" stroke={INK} strokeWidth={2} opacity={0.5} /></>;
};
const Brain: React.FC<PropArgs & { k: number }> = ({ tl }) => (
  <g transform="translate(300 220)">
    <circle r={150 + Math.sin(tl * 2) * 4} fill={GOLD} opacity={0.12} />
    <path d="M-10,-100 C-90,-120 -150,-60 -130,0 C-170,40 -130,110 -70,100 C-40,140 30,140 50,100 C110,120 160,60 130,10 C170,-40 120,-110 50,-90 C30,-120 0,-120 -10,-100 Z" fill="#E9B6A0" {...sw} />
    <path d="M-10,-100 C-20,-40 10,-20 0,40 C-5,80 10,100 20,112" fill="none" stroke={INK} strokeWidth={4} />
    {[[-70, -40], [-60, 30], [60, -50], [70, 30]].map(([x, y], i) => <path key={i} d={`M${x! - 25},${y} q20,-24 40,0`} fill="none" stroke={INK} strokeWidth={4} />)}
  </g>
);
const Padlock: React.FC<PropArgs & { k: number }> = ({ tl, at }) => {
  const c = win(tl, at + 0.6, at + 1.1);
  return (
    <g transform="translate(300 230)">
      <path d={`M-52,-40 L-52,${-96 + 38 * (1 - c)} A52,52 0 0 1 52,${-96 + 38 * (1 - c)} L52,-40`} fill="none" stroke={GD} strokeWidth={14} strokeLinecap="round" />
      <rect x={-78} y={-44} width={156} height={124} rx={16} fill={GOLD} {...sw} /><circle cy={10} r={14} fill={INK} /><rect x={-5} y={14} width={10} height={32} rx={4} fill={INK} />
    </g>
  );
};
const Chips: React.FC<PropArgs & { k: number }> = ({ p, tl, at }) => {
  const s = 32, ws = (p.labels as string[]).map((l) => cw(s, l.length) + 1.8 * s), gap = 26, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  let x0 = (600 - tot) / 2;
  return <>{p.labels.map((l: string, i: number) => {
    const a = Array.isArray(p._at) ? p._at[i] : at + i * 0.5; const k = pop(tl, a, 0.4); const cx = x0 + ws[i]! / 2; x0 += ws[i]! + gap;
    return <g key={i} opacity={k} transform={`translate(0 ${14 * (1 - k)})`}><Pill x={cx} y={220} text={l} s={s} /></g>;
  })}</>;
};
const Paper: React.FC<PropArgs & { k: number }> = ({ tl, at }) => (
  <g transform="translate(300 220) rotate(-4)">
    <rect x={-120} y={-170} width={240} height={330} rx={8} fill={IV} {...sw} />
    {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={-92} x2={-92 + win(tl, at + 0.3 + i * 0.12, at + 0.6 + i * 0.12) * (i % 2 ? 120 : 150)} y1={-110 + i * 46} y2={-110 + i * 46} stroke="#9A9A9A" strokeWidth={5} strokeLinecap="round" />)}
    <g transform="translate(150 60) rotate(40)"><rect x={-9} y={-110} width={18} height={150} fill={GOLD} {...sw} /><path d="M-9,40 L0,70 L9,40 Z" fill={IV} {...sw} /><rect x={-9} y={-124} width={18} height={18} fill="#E9A0A0" {...sw} /></g>
  </g>
);
const Cards: React.FC<PropArgs & { k: number }> = ({ p, tl, at }) => (
  <>{p.labels.map((l: string, i: number) => {
    const a = Array.isArray(p._at) ? p._at[i] : at + i * 0.6; const k = pop(tl, a, 0.5);
    return <g key={i} opacity={k} transform={`translate(0 ${70 + i * 150 + 24 * (1 - k)})`}>
      <rect x={20} y={-56} width={560} height={112} rx={20} fill={PAL.charcoalDeep} stroke={GOLD} strokeWidth={5} />
      <g transform="translate(100 6)">{i === 0 ? <><Coin x={0} y={14} r={34} /><Coin x={0} y={-8} r={34} /></> : i === 1 ? <><Bill x={0} y={0} w={110} h={58} /><path d="M-30,34 L0,-6 L30,34" fill="none" stroke={RED} strokeWidth={7} transform="translate(0 -4)" /></> : <>{[-34, 0, 34].map((x) => <rect key={x} x={x - 12} y={-30} width={24} height={52} rx={5} fill={GOLD} {...sw} />)}</>}</g>
      <T x={180} y={14} s={40} c={GOLD} anchor="start">{l}</T></g>;
  })}</>
);
const Coins: React.FC<PropArgs & { k: number }> = ({ p, tl, at }) => {
  const m = p.mode;
  if (m === "growth") return <>
    {[2, 4, 7].map((n, s) => <g key={s}>{Array.from({ length: n }, (_, i) => <Coin key={i} x={130 + s * 160} y={360 - i * 26} o={pop(tl, at + s * 0.35 + i * 0.07, 0.25)} />)}</g>)}
    <path d={`M90,${300 - win(tl, at + 0.4, at + 1.4) * 40} L${90 + win(tl, at + 0.4, at + 1.4) * 400},${300 - win(tl, at + 0.4, at + 1.4) * 200}`} stroke={OK} strokeWidth={9} fill="none" strokeLinecap="round" /></>;
  if (m === "pile") return <>{[[300, 360], [250, 345], [350, 345], [300, 330], [220, 365], [380, 365], [275, 312], [325, 312], [300, 295]].map(([x, y], i) => <Coin key={i} x={x!} y={y!} r={32} o={pop(tl, at + i * 0.08, 0.25)} />)}</>;
  if (m === "drift") return <>{Array.from({ length: 8 }, (_, i) => { const u = Math.max(0, tl - at - i * 0.18); return <Coin key={i} x={150 + u * 120 + i * 20} y={330 - u * 40 - i * 10} o={Math.max(0, 1 - u / 2.6) * pop(tl, at + i * 0.18, 0.2)} />; })}</>;
  return <>{[0, 1].map((i) => <g key={i}><Coin x={i ? 480 : 130} y={i ? 230 : 330} r={i ? 14 : 70} o={pop(tl, at + i * 0.6, 0.4)} /></g>)}<g opacity={pop(tl, at, 0.4)}><Lab x={130} y={410} text="TODAY" s={32} /></g><g opacity={pop(tl, at + 0.6, 0.4)}><Lab x={480} y={290} text="LATER" s={32} /></g></>;
};
const Tag: React.FC<PropArgs & { k: number }> = ({ p }) => (
  <g transform="translate(300 220)">
    <path d={p.big ? "M-230,-110 L150,-110 L230,0 L150,110 L-230,110 Z" : "M-240,-62 L150,-62 L240,0 L150,62 L-240,62 Z"} fill={p.big ? RED : GOLD} {...sw} /><circle cx={p.big ? 172 : 176} cy={0} r={13} fill={INK} />
    {p.big ? <T x={-30} y={42} s={118} c={IV} num>{p.text}</T> : <text x={-40} y={13} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={36} fill={PINK}>{p.text}</text>}
    {(p.up || p.down) && <path d={p.up ? "M-20,-150 L0,-190 L20,-150 M0,-190 L0,-110" : "M-20,110 L0,150 L20,110 M0,150 L0,80"} fill="none" stroke={RED} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
  </g>
);
const Jars: React.FC<PropArgs & { k: number }> = ({ tl, at }) => (
  <>{[0, 1, 2].map((i) => <g key={i} opacity={pop(tl, at + i * 0.3, 0.4)} transform={`translate(${110 + i * 190} 220)`}>
    <rect x={-60} y={-110} width={120} height={200} rx={20} fill="#C7D6E0" opacity={0.35} stroke={IV} strokeWidth={5} /><rect x={-66} y={-124} width={132} height={22} rx={8} fill={GD} {...sw} />
    {Array.from({ length: 3 }, (_, j) => <Coin key={j} x={0} y={70 - j * 26} r={36} />)}</g>)}</>
);
const Houses: React.FC<PropArgs & { k: number }> = ({ p, tl, at }) => {
  const H = (x: number, hot: boolean, label: string, o: number) => <g transform={`translate(${x} 250)`} opacity={o}>
    <path d="M-80,0 L-80,-90 L0,-150 L80,-90 L80,0 Z" fill={hot ? GOLD : IV} {...sw} /><rect x={-18} y={-60} width={36} height={60} fill={GD} {...sw} />{hot && <path d="M-60,-170 l20,-30 l20,30 l20,-30 l20,30" fill="none" stroke={GOLD} strokeWidth={6} />}
    <Lab x={0} y={62} text={label} s={30} c={hot ? GOLD : IV} /></g>;
  return <>
    <g opacity={pop(tl, at, 0.4)}><Pill x={300} y={34} text={p.pin} s={32} /></g>
    {H(145, true, p.labels[0], pop(tl, at + 0.4, 0.4))}{H(455, false, p.labels[1], pop(tl, at + 0.8, 0.4))}</>;
};
const Gauge: React.FC<PropArgs & { k: number }> = ({ tl, at }) => {
  const a = -80 + win(tl, at + 0.2, at + 2.4) * 150;
  return <g transform="translate(300 320)"><path d="M-170,0 A170,170 0 0 1 170,0" fill="none" stroke={CH} strokeWidth={34} /><path d="M-170,0 A170,170 0 0 1 90,-145" fill="none" stroke={GOLD} strokeWidth={34} opacity={0.9} /><path d="M90,-145 A170,170 0 0 1 170,0" fill="none" stroke={RED} strokeWidth={34} />
    <g transform={`rotate(${a})`}><path d="M-10,0 L0,-150 L10,0 Z" fill={IV} {...sw} /></g><circle r={20} fill={INK} stroke={GOLD} strokeWidth={5} /></g>;
};
const Confetti: React.FC<PropArgs & { k: number }> = ({ tl, at }) => (
  <>{Array.from({ length: 46 }, (_, i) => { const u = tl - at - (i % 9) * 0.05; if (u < 0) return null; const x = 60 + ((i * 97) % 480); const y = -30 + u * (110 + (i % 5) * 26) + 40 * Math.sin(u * 3 + i); const col = [GOLD, IV, BILL, RED][i % 4]!;
    return y > 460 ? null : <rect key={i} x={x} y={y} width={14} height={22} fill={col} stroke={INK} strokeWidth={2} transform={`rotate(${u * 220 + i * 30} ${x + 7} ${y + 11})`} />; })}</>
);
const Calendar: React.FC<PropArgs & { k: number }> = ({ p, tl, at }) => {
  const cells = Array.from({ length: 20 }, (_, i) => i); const m = p.mode;
  const circ = m === "circle" ? Math.min(7, Math.floor(Math.max(0, tl - at - 0.4) / 0.5)) : 0;
  return <g transform="translate(300 215)">
    <rect x={-190} y={-170} width={380} height={330} rx={14} fill={IV} {...sw} /><rect x={-190} y={-170} width={380} height={62} rx={14} fill={RED} {...sw} />
    {[-110, 110].map((x) => <circle key={x} cx={x} cy={-170} r={10} fill={INK} />)}
    {cells.map((i) => { const cx = -150 + (i % 5) * 75, cy = -80 + Math.floor(i / 5) * 62; const hot = m === "block" && i >= 5 && i < 20;
      return <rect key={i} x={cx - 28} y={cy - 22} width={56} height={44} rx={6} fill={hot ? GOLD : "none"} opacity={hot ? win(tl, at + 0.3 + (i - 5) * 0.05, at + 0.5 + (i - 5) * 0.05) : 1} stroke={INK} strokeWidth={3} />; })}
    {m === "circle" && <ellipse cx={-150 + (circ % 5) * 75} cy={-80 + Math.floor(circ / 5) * 62} rx={36} ry={30} fill="none" stroke={RED} strokeWidth={6} />}
    {m === "block" && <Pill x={0} y={218} text={p.label} s={30} />}
  </g>;
};
const Timeline: React.FC<PropArgs & { k: number }> = ({ p, tl, bs }) => (
  <>
    {p.segs.map((s: any, i: number) => {
      const a = (bs[s.beat] ?? 0) + 0.25; const k = pop(tl, a, 0.6); const y0 = 40 + i * 190;
      return <g key={i} opacity={Math.min(1, k * 1.4)}>
        <Lab x={300} y={y0} text={s.label} s={32} />
        <rect x={50} y={y0 + 38} width={500} height={34} rx={17} fill={CH} {...sw} /><rect x={50} y={y0 + 38} width={500 * k} height={34} rx={17} fill={COL[s.color]} {...sw} />
        <T x={300} y={y0 + 122} s={36} c={COL[s.color]!}>{s.note}</T></g>;
    })}
  </>
);
const Envelopes: React.FC<PropArgs & { k: number }> = ({ p, tl, at }) => (
  <>{Array.from({ length: p.n }, (_, i) => { const k = pop(tl, at + i * 0.4, 0.45); const x = p.n === 1 ? 300 : 130 + i * 170; return <g key={i} opacity={k}><Env x={x} y={230 + 14 * (1 - k)} w={150} />{p.n > 1 && <path d={`M${x - 30},300 L${x},340 L${x + 30},300`} fill="none" stroke={GOLD} strokeWidth={7} strokeLinecap="round" />}</g>; })}{p.label && <Lab x={300} y={345} text={p.label} s={32} c={GOLD} />}</>
);
const Chain: React.FC<PropArgs & { k: number }> = ({ tl, at }) => (
  <>{Array.from({ length: 7 }, (_, i) => { const a = Math.min(1, Math.max(0, (tl - at - 0.4 - i * 0.28) / 0.35)); const s = 0.6 + i * 0.14; return <g key={i} transform={`translate(${70 + i * 78} 380) rotate(${a * 78})`}><rect x={-14 * s} y={-110 * s} width={28 * s} height={110 * s} rx={4} fill={i === 0 ? RED : GOLD} {...sw} /></g>; })}</>
);
const Ticks: React.FC<PropArgs & { k: number }> = ({ p, tl, at }) => (
  <>{Array.from({ length: p.n }, (_, i) => { const a = at + i * 0.45; const k = win(tl, a, a + 0.35); return <g key={i} transform={`translate(${70 + i * 130} 190)`}><rect width={96} height={96} rx={14} fill="none" stroke={GOLD} strokeWidth={7} opacity={pop(tl, a - 0.1, 0.2)} /><path d="M18,50 L40,74 L80,22" fill="none" stroke={OK} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={100} strokeDashoffset={100 * (1 - k)} /></g>; })}</>
);
const Bars: React.FC<PropArgs & { k: number }> = ({ p, tl, bs }) => {
  const n = p.items.length, W = p.w ?? 560, slot = W / n, bw = Math.min(150, slot - 24), base = 330, max = p.max ?? 20;
  return <g transform={`translate(${(600 - W) / 2} 0)`}>
    <line x1={0} x2={W} y1={base} y2={base} stroke={IV} strokeWidth={5} strokeLinecap="round" />
    {p.items.map((it: any, i: number) => {
      const a = (bs[it.beat] ?? 0) + (it._at ?? 0.3); const k = pop(tl, a, 0.9); const cx = i * slot + slot / 2; const h = (it.val / max) * 230 * k; const words = (it.label as string).split(" ");
      const lines = words.length > 1 && words.join(" ").length > 8 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [it.label];
      return <g key={i} opacity={Math.min(1, k * 3)}><rect x={cx - bw / 2} y={base - h} width={bw} height={h} rx={8} fill={COL[it.color]} {...sw} />
        {lines.map((ln: string, j: number) => <T key={j} x={cx} y={base + 38 + j * 36} s={30} c={IV}>{ln}</T>)}
        {it.text && <T x={cx} y={base - h - 16} s={40} c={COL[it.color]!} num>{it.text}</T>}</g>;
    })}</g>;
};
const Scale: React.FC<PropArgs & { k: number }> = ({ p, tl, at }) => {
  const tip = (p.tip ?? 0.3) + win(tl, at + 1.0, at + 2.2) * 0.7; const a = (tip - 0.5) * -26;
  return <g transform="translate(300 240)"><path d="M0,-30 L0,170 M-70,170 L70,170" stroke={IV} strokeWidth={9} strokeLinecap="round" /><g transform={`rotate(${a})`}><path d="M-190,0 L190,0" stroke={GOLD} strokeWidth={11} strokeLinecap="round" /><circle r={14} fill={GOLD} {...sw} />
    {[-190, 190].map((x, i) => <g key={x} transform={`translate(${x} 0) rotate(${-a})`}><path d="M0,0 L-50,70 M0,0 L50,70" stroke={IV} strokeWidth={4} /><path d="M-62,70 L62,70 Q40,100 0,100 Q-40,100 -62,70 Z" fill={CH} {...sw} />
      {Array.from({ length: i ? 5 : 2 }, (_, j) => <Coin key={j} x={-20 + j * 12} y={60 - j * 14} r={22} />)}</g>)}</g>
    <Lab x={-175} y={-80} text="GAIN" s={32} /><Lab x={175} y={-80} text="LOSS" s={32} /></g>;
};
const Arrow: React.FC<PropArgs & { k: number }> = ({ tl, at }) => {
  const u = win(tl, at, at + 0.7), lk = pop(tl, at + 1.2, 0.4);
  return <g transform="translate(300 220)"><path d={`M-120,-150 L-40,${-150 + 90 * u} L0,${-110 + 90 * u} L40,${-150 + 140 * u} L120,${-150 + 210 * u}`} fill="none" stroke={RED} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    <g opacity={lk} transform="translate(120 100) scale(0.9)"><rect x={-40} y={-26} width={80} height={64} rx={10} fill={GOLD} {...sw} /><path d="M-24,-26 L-24,-50 A24,24 0 0 1 24,-50 L24,-26" fill="none" stroke={GD} strokeWidth={9} /></g></g>;
};
const Toggle: React.FC<PropArgs & { k: number }> = ({ p, tl, at }) => {
  const on = p.state === "on" ? 1 : win(tl, at + 0.8, at + 1.2);
  return <g transform="translate(300 215)"><rect x={-130} y={-60} width={260} height={120} rx={60} fill={on > 0.5 ? GOLD : CH} {...sw} /><circle cx={-70 + 140 * on} cy={0} r={46} fill={IV} {...sw} />
    <text x={on > 0.5 ? -38 : 40} y={15} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={40} fill={on > 0.5 ? PINK : IV}>{on > 0.5 ? "ON" : "OFF"}</text>{p.state === "flip" && <Lab x={0} y={150} text="THE STARTING SETTING" s={32} c={GOLD} />}</g>;
};
const Gears: React.FC<PropArgs & { k: number }> = ({ tl, at }) => {
  const G2 = (r: number, rot: number, col: string) => <g transform={`rotate(${rot})`}>{Array.from({ length: 10 }, (_, i) => <rect key={i} x={-12} y={-r - 16} width={24} height={34} fill={col} {...sw} transform={`rotate(${i * 36})`} />)}<circle r={r} fill={col} {...sw} /><circle r={r * 0.35} fill={PAL.charcoalDeep} {...sw} /></g>;
  const t = tl - at;
  return <g><g transform="translate(220 230)">{G2(90, t * 40, GOLD)}</g><g transform="translate(386 160)">{G2(58, -t * 64 + 18, GD)}</g><g opacity={pop(tl, at + 0.8, 0.4)} transform="translate(440 340)"><circle r={42} fill={OK} {...sw} /><path d="M-18,0 L-5,14 L20,-14" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /></g></g>;
};
const Silhouettes: React.FC<PropArgs & { k: number }> = ({ p, tl, at }) => (
  p.mode === "future" ? <>
    <Person x={170} y={360} s={1.5} c={GOLD} /><Lab x={170} y={405} text="NOW" s={32} c={GOLD} />
    <g opacity={pop(tl, at + 0.5, 0.6)}><Person x={470} y={290} s={1.0} c={IV} dash /><Lab x={470} y={335} text="FUTURE YOU" s={30} /></g>
    <path d="M250,230 L390,230" stroke={GOLD} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" opacity={pop(tl, at + 0.3, 0.4)} />
  </> : <>
    <Person x={150} y={350} s={1.5} c={GOLD} /><Person x={450} y={350} s={1.5} c={IV} dash o={pop(tl, at, 0.5)} />
    <path d={`M210,${270}L${210 + 180 * win(tl, at + 0.4, at + 1.2)},${270}`} stroke={OK} strokeWidth={12} strokeLinecap="round" /><Lab x={150} y={410} text="PRESENT YOU" s={30} c={GOLD} /><Lab x={450} y={410} text="FUTURE YOU" s={30} />
  </>
);
const CardChip: React.FC<PropArgs & { k: number }> = ({ p }) => (
  <g transform="translate(300 220)"><rect x={-170} y={-70} width={340} height={140} rx={34} fill={p.kind === "cash" ? BILL : GOLD} {...sw} /><text x={0} y={26} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={78} fill={PINK}>{p.text}</text>
    {p.kind === "cash" ? <Bill x={210} y={-80} rot={14} w={90} h={44} /> : <Card x={210} y={-80} w={100} rot={-10} />}</g>
);
const BillSlide: React.FC<PropArgs & { k: number }> = ({ tl, at }) => {
  const u = win(tl, at + 0.3, at + 1.6);
  return <g><Bill x={400 - u * 380} y={190} w={190} h={90} rot={-6} o={1 - u * 0.9} /><g opacity={pop(tl, at + 1.6, 0.5)}><Card x={300} y={310} w={170} /></g><g opacity={pop(tl, at + 1.8, 0.4)}><Lab x={300} y={410} text="THE CARD JUST WAITS" s={32} c={GOLD} /></g></g>;
};
const Battery: React.FC<PropArgs & { k: number }> = ({ tl, at }) => {
  const lvl = 1 - win(tl, at + 0.3, at + 3.0) * 0.78;
  return <g transform="translate(300 210)"><rect x={-170} y={-80} width={320} height={160} rx={22} fill="none" stroke={IV} strokeWidth={10} /><rect x={150} y={-30} width={26} height={60} rx={8} fill={IV} />
    <rect x={-154} y={-64} width={288 * lvl} height={128} rx={12} fill={lvl > 0.4 ? OK : RED} /><Lab x={-10} y={150} text="MENTAL BANDWIDTH" s={32} c={GOLD} /></g>;
};
const Stamp: React.FC<PropArgs & { k: number }> = ({ p, tl, at }) => {
  const u = Math.min(1, Math.max(0, (tl - at) / 0.25)); const s = 2.2 - 1.2 * Easing.out(Easing.cubic)(u);
  return <g transform={`translate(300 230) rotate(-12) scale(${s})`} opacity={u}><rect x={-150} y={-70} width={300} height={140} rx={14} fill="none" stroke={RED} strokeWidth={14} /><T x={0} y={30} s={96} c={RED} num>{p.text}</T></g>;
};

const MAP: Record<string, React.FC<PropArgs & { k: number }>> = { moon: Moon, spiral: Spiral, brain: Brain, padlock: Padlock, chips: Chips, paper: Paper, cards: Cards, coins: Coins, tag: Tag, jars: Jars, houses: Houses, gauge: Gauge, confetti: Confetti,
  calendar: Calendar, timeline: Timeline, envelopes: Envelopes, chain: Chain, ticks: Ticks, bars: Bars, scale: Scale, arrow: Arrow, toggle: Toggle, gears: Gears, silhouettes: Silhouettes, cardchip: CardChip, billslide: BillSlide, battery: Battery, stamp: Stamp };
const SIDE: Record<string, [number, number]> = { L: [520, 560], R: [1400, 560], C: [960, 560], T: [960, 360] };

export const PropView: React.FC<PropArgs> = (a) => {
  const C = MAP[a.p.k]; if (!C) return null;
  const k = pop(a.tl, a.at, 0.45) * (1 - interpolate(a.tl, [a.end - 0.18, a.end], [0, 1], clamp));
  if (k <= 0.001) return null;
  const [x0, y0] = SIDE[a.p.side ?? "R"]!; const x = x0 + (a.p.dx ?? 0), y = y0 + (a.p.dy ?? 0);
  return <Frame x={x} y={y} k={k}><C {...a} k={k} /></Frame>;
};
