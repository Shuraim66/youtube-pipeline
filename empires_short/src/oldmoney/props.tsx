// Extra drawn props for the Old Money video (flat vector, Aurelis palette). Unknown kinds fall through to the Money Psychology props.
// Same typography rules: Inter Bold labels (min 30 SVG units = 37.5 px), Fraunces Bold only for big numbers.
import React from "react";
import { interpolate } from "remotion";
import { PropView as MPProp, Frame, type PropArgs } from "../moneypsych/props";
import { INTER, PAL, clamp, pop, win } from "../moneypsych/theme";

const INK = PAL.ink, GOLD = PAL.gold, GD = PAL.goldDark, IV = PAL.ivory, RED = PAL.danger, OK = PAL.ok, CH = PAL.charcoalLift, PINK = PAL.pillInk;
const sw = { stroke: INK, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const cw = (s: number, n: number) => n * 0.66 * s;
const Lab: React.FC<{ x: number; y: number; text: string; s?: number; c?: string }> = ({ x, y, text, s = 30, c = IV }) => {
  const w = cw(s, text.length) + 1.3 * s, h = 1.45 * s;
  return <g><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={0.5 * s} fill="rgba(30,22,18,.85)" /><text x={x} y={y + 0.36 * s} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={s} fill={c} letterSpacing="0.01em">{text}</text></g>;
};
const Pill: React.FC<{ x: number; y: number; text: string; s?: number }> = ({ x, y, text, s = 32 }) => {
  const w = cw(s, text.length) + 1.8 * s, h = 1.8 * s;
  return <g><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={0.6 * s} fill={GOLD} stroke={INK} strokeWidth={4} /><text x={x} y={y + 0.36 * s} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={s} fill={PINK}>{text}</text></g>;
};
const Coin: React.FC<{ x: number; y: number; r?: number; o?: number }> = ({ x, y, r = 22, o = 1 }) => (
  <g opacity={o}><ellipse cx={x} cy={y} rx={r} ry={r * 0.45} fill={GOLD} {...sw} /><ellipse cx={x} cy={y - 3} rx={r * 0.55} ry={r * 0.2} fill="none" stroke={GD} strokeWidth={2.5} /></g>
);
const Person: React.FC<{ x: number; y: number; s?: number; c?: string; o?: number }> = ({ x, y, s = 1, c = GOLD, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill={c} stroke={INK} strokeWidth={5} strokeLinejoin="round"><circle cx={0} cy={-92} r={26} /><path d="M-38,0 L-30,-58 Q0,-74 30,-58 L38,0 Z" /></g>
);
const Doc: React.FC<{ x: number; y: number; title?: string; seal?: boolean; q?: boolean; tick?: number; w?: number }> = ({ x, y, title, seal, q, tick = 0, w = 170 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-w * 0.68} width={w} height={w * 1.3} rx={8} fill={IV} {...sw} />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={-w / 2 + 22} x2={w / 2 - 22 - (i % 2) * 30} y1={-w * 0.3 + i * 30} y2={-w * 0.3 + i * 30} stroke="#9A9A9A" strokeWidth={5} strokeLinecap="round" />)}
    {title && <text x={0} y={-w * 0.45} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={30} fill={PINK}>{title}</text>}
    {seal && <g transform={`translate(${w * 0.22} ${w * 0.45})`}><circle r={30} fill={q ? RED : GOLD} {...sw} />{q && <text y={13} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={38} fill={IV}>?</text>}</g>}
    {tick > 0 && <path d={`M${-w / 2 + 20},${w * 0.42} l20,20 l40,-46`} fill="none" stroke={OK} strokeWidth={10} strokeLinecap="round" strokeDasharray={90} strokeDashoffset={90 * (1 - tick)} />}
  </g>
);

const FamilyTree: React.FC<PropArgs> = ({ p, tl, at }) => {
  const rows = [{ n: 1, label: "GRANDPARENTS" }, { n: 2, label: "PARENTS" }, { n: 4, label: "GRANDCHILDREN" }];
  return <>{rows.map((r, i) => {
    const k = pop(tl, at + i * 0.45, 0.45); const y = 120 + i * 150; const fade = p.mode === "fade" ? 1 - 0.75 * win(tl, at + 1.2 + i * 0.3, at + 2.2 + i * 0.3) * (i / 2) : 1;
    return <g key={i} opacity={k}>
      {i > 0 && <line x1={300} x2={300} y1={y - 120} y2={y - 92} stroke={GOLD} strokeWidth={5} />}
      {Array.from({ length: r.n }, (_, j) => <Person key={j} x={300 + (j - (r.n - 1) / 2) * 92} y={y + 10} s={0.62} c={p.mode === "gold" || i === 0 ? GOLD : IV} o={fade} />)}
      <Lab x={300 + (r.n * 46 + 130)} y={y - 30} text={r.label} s={30} c={GOLD} /></g>;
  })}</>;
};
const Ledger: React.FC<PropArgs> = ({ p, tl, at }) => {
  const flip = (tl - at) * 3; const u = win(tl, at + 0.3, at + 2.2);
  return <g transform="translate(300 230)">
    <path d="M-240,-140 Q-120,-170 0,-140 L0,150 Q-120,120 -240,150 Z" fill={IV} {...sw} /><path d="M240,-140 Q120,-170 0,-140 L0,150 Q120,120 240,150 Z" fill={IV} {...sw} />
    {[0, 1, 2, 3, 4].map((i) => <g key={i}><line x1={-210} x2={-30} y1={-100 + i * 48} y2={-100 + i * 48} stroke="#9A9A9A" strokeWidth={4} /><line x1={30} x2={210} y1={-100 + i * 48} y2={-100 + i * 48} stroke="#9A9A9A" strokeWidth={4} /></g>)}
    {p.mode === "fade" ? <path d={`M-210,-80 C-60,-60 60,40 ${-210 + 420 * u},${-80 + 190 * u}`} fill="none" stroke={GOLD} strokeWidth={10} strokeLinecap="round" opacity={1 - 0.6 * u} />
      : <><path d={`M0,-140 Q${80 * Math.cos(flip)},-160 ${200 * Math.cos(flip)},-140 L${200 * Math.cos(flip)},150 Q${80 * Math.cos(flip)},120 0,150 Z`} fill={IV} opacity={0.85} {...sw} />
        <Pill x={0} y={210} text={`${p.a} → ${u > 0.5 ? p.b : p.a}`} s={34} /></>}
  </g>;
};
const Icons: React.FC<PropArgs> = ({ p, tl, at }) => (
  <>{(p.labels as string[]).map((l, i) => {
    const a = Array.isArray(p._at) ? p._at[i] : at + i * 0.5; const k = pop(tl, a, 0.4); const x = 100 + i * 200;
    return <g key={i} opacity={k} transform={`translate(${x} ${220 + 16 * (1 - k)})`}>
      {i === 0 && <><path d="M-70,30 L-70,-40 L0,-90 L70,-40 L70,30 Z" fill={GOLD} {...sw} /><rect x={-14} y={-10} width={28} height={40} fill={GD} {...sw} /></>}
      {i === 1 && <><path d="M-60,20 Q-60,-70 0,-70 Q60,-70 60,20 Z" fill={GOLD} {...sw} /><rect x={-75} y={18} width={150} height={16} rx={6} fill={GD} {...sw} /><circle cy={-80} r={10} fill={GOLD} {...sw} /></>}
      {i === 2 && <><path d="M-55,-70 L55,-70 L55,0 Q55,50 0,70 Q-55,50 -55,0 Z" fill={GOLD} {...sw} /><path d="M-25,-25 L0,-45 L25,-25 L25,15 L-25,15 Z" fill={IV} {...sw} /></>}
      <Lab x={0} y={110} text={l} s={30} /></g>;
  })}</>
);
const Plaque: React.FC<PropArgs> = ({ p, tl, at }) => {
  const c = p.mode === "crack" ? win(tl, at + 0.4, at + 1.2) : 1 - win(tl, at + 0.4, at + 1.2);
  return <g transform="translate(300 220)" opacity={1 - 0.35 * c}>
    <rect x={-230} y={-80} width={460} height={160} rx={18} fill={GOLD} {...sw} /><rect x={-210} y={-60} width={420} height={120} rx={10} fill="none" stroke={GD} strokeWidth={5} />
    <text y={22} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={62} fill={PINK} letterSpacing="0.04em">OLD MONEY</text>
    <path d="M-40,-80 L-10,-20 L-50,10 L-20,80" fill="none" stroke={INK} strokeWidth={7} strokeDasharray={220} strokeDashoffset={220 * (1 - c)} />
  </g>;
};
const Crest: React.FC<PropArgs> = ({ tl, at }) => (
  <g transform="translate(300 220)"><path d="M-110,-130 L110,-130 L110,0 Q110,100 0,140 Q-110,100 -110,0 Z" fill={GOLD} {...sw} /><path d="M-50,-60 L0,-95 L50,-60 L50,20 L-50,20 Z" fill={IV} {...sw} />
    <text y={-170 + 10 * Math.sin(tl * 3)} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={120} fill={IV} stroke={INK} strokeWidth={4} paintOrder="stroke" opacity={pop(tl, at + 0.4, 0.4)}>?</text></g>
);
const Magnify: React.FC<PropArgs> = ({ p, tl, at }) => {
  const x = 230 + 90 * Math.sin((tl - at) * 1.4);
  return <g><circle cx={300} cy={220} r={120} fill={CH} {...sw} /><text x={300} y={248} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={80} fill={IV}>{p.text}</text>
    <g transform={`translate(${x} 170)`} opacity={pop(tl, at + 0.4, 0.4)}><circle r={70} fill="rgba(244,236,216,.15)" stroke={GOLD} strokeWidth={14} /><line x1={50} y1={50} x2={130} y2={130} stroke={GOLD} strokeWidth={22} strokeLinecap="round" /></g></g>;
};
const Bubble: React.FC<PropArgs> = ({ p, tl, at }) => (
  <g transform="translate(300 200)">{[[-170, 170, 16], [-130, 120, 24]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={IV} {...sw} opacity={pop(tl, at + i * 0.15, 0.3)} />)}
    <g opacity={pop(tl, at + 0.35, 0.4)}><ellipse rx={230} ry={120} fill={IV} {...sw} /><rect x={-70} y={-60} width={140} height={90} rx={6} fill={GOLD} {...sw} /><path d="M-70,-60 L0,0 L70,-60" fill="none" {...sw} /><Lab x={0} y={80} text={p.text} s={30} c={GOLD} /></g></g>
);
const WealthBar: React.FC<PropArgs> = ({ tl, at }) => {
  const g = win(tl, at, at + 1.0);
  return <g transform="translate(300 220)"><Lab x={0} y={-140} text="TOP 10% WEALTH" s={32} c={GOLD} />
    <rect x={-240} y={-70} width={480} height={110} rx={14} fill={CH} {...sw} /><rect x={-240} y={-70} width={480} height={110} rx={14} fill={GOLD} opacity={0.9} />
    <rect x={-240} y={-70} width={170 * g} height={110} rx={14} fill={IV} {...sw} />
    <g opacity={g} transform="translate(-155 -15)"><rect x={-34} y={-28} width={68} height={56} fill={RED} {...sw} /><rect x={-6} y={-28} width={12} height={56} fill={GOLD} /><path d="M-20,-28 Q0,-60 0,-28 Q0,-60 20,-28" fill="none" stroke={GOLD} strokeWidth={6} /></g>
    <Lab x={-150} y={110} text="INHERITED / GIFTS" s={30} /><Lab x={120} y={110} text="BUILT" s={30} c={GOLD} /></g>;
};
const Bricks: React.FC<PropArgs> = ({ tl, at }) => (
  <g transform="translate(300 330)">{Array.from({ length: 10 }, (_, i) => { const row = i < 4 ? 0 : i < 7 ? 1 : i < 9 ? 2 : 3; const col = i < 4 ? i : i < 7 ? i - 4 : i < 9 ? i - 7 : 0; const n = [4, 3, 2, 1][row]!;
    const k = pop(tl, at + i * 0.12, 0.3); return <rect key={i} x={(col - n / 2) * 110 + 5} y={-row * 60 - 60 - 30 * (1 - k)} width={100} height={52} rx={6} fill={GOLD} opacity={k} {...sw} />; })}
    <g opacity={pop(tl, at + 1.4, 0.4)}><Lab x={0} y={50} text="BUILT" s={34} c={GOLD} /></g></g>
);
const Statement: React.FC<PropArgs> = ({ tl, at }) => {
  const u = win(tl, at, at + 2.5);
  return <g transform="translate(300 220)"><rect x={-200} y={-170} width={400} height={340} rx={10} fill={IV} {...sw} />
    {[0, 1, 2].map((i) => <line key={i} x1={-170} x2={60} y1={-120 + i * 40} y2={-120 + i * 40} stroke="#9A9A9A" strokeWidth={5} />)}
    <rect x={-170} y={10} width={340} height={44} rx={8} fill={CH} {...sw} /><rect x={-170} y={10} width={340 * (1 - 0.06 * u)} height={44} rx={8} fill={RED} {...sw} />
    <g transform="rotate(-10)" opacity={pop(tl, at + 0.4, 0.3)}><rect x={-160} y={80} width={320} height={64} rx={10} fill="none" stroke={RED} strokeWidth={8} /><text x={0} y={124} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={34} fill={RED}>MINIMUM PAYMENT</text></g></g>;
};
const Speech: React.FC<PropArgs> = ({ p }) => (
  <g transform="translate(300 180)"><path d="M-220,-70 L220,-70 L220,50 L-40,50 L-90,110 L-90,50 L-220,50 Z" fill={GOLD} {...sw} /><text y={10} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={56} fill={PINK}>{`“${p.text}”`}</text></g>
);
const Book: React.FC<PropArgs> = () => (
  <g transform="translate(300 220) rotate(-5)"><rect x={-150} y={-190} width={300} height={380} rx={10} fill={GD} {...sw} /><rect x={-130} y={-170} width={260} height={340} rx={6} fill="none" stroke={GOLD} strokeWidth={5} />
    {["THE", "MILLIONAIRE", "NEXT DOOR"].map((t, i) => <text key={i} y={-70 + i * 60} textAnchor="middle" fontFamily={INTER} fontWeight={700} fontSize={i === 1 ? 40 : 36} fill={IV}>{t}</text>)}</g>
);
const PhoneApp: React.FC<PropArgs> = ({ tl, at }) => {
  const lvl = 1 - win(tl, at + 0.2, at + 3.0) * 0.85; const scroll = ((tl - at) * 60) % 60;
  return <g transform="translate(300 220)"><rect x={-120} y={-200} width={240} height={420} rx={30} fill={INK} stroke={GOLD} strokeWidth={6} /><rect x={-100} y={-170} width={200} height={360} rx={12} fill={CH} />
    <rect x={-80} y={-150} width={160} height={40} rx={10} fill={IV} opacity={0.2} /><rect x={-80} y={-150} width={160 * lvl} height={40} rx={10} fill={lvl > 0.4 ? OK : RED} />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-80} y={-80 + i * 55 - scroll} width={160} height={36} rx={8} fill={IV} opacity={0.35} />)}</g>;
};
const Jar: React.FC<PropArgs> = ({ p, tl, at }) => {
  const e = p.empty ? win(tl, at + 0.2, at + 1.4) : 0;
  return <g transform="translate(300 220)"><rect x={-110} y={-150} width={220} height={300} rx={34} fill="#C7D6E0" opacity={0.3} stroke={IV} strokeWidth={6} /><rect x={-120} y={-172} width={240} height={30} rx={10} fill={GD} {...sw} />
    {Array.from({ length: 6 }, (_, j) => <Coin key={j} x={-30 + (j % 3) * 30} y={120 - Math.floor(j / 3) * 30 + e * 30} r={40} o={j === 0 ? 1 : 1 - e} />)}
    <Lab x={0} y={210} text={p.text} s={32} c={GOLD} /></g>;
};
const Tower: React.FC<PropArgs> = ({ tl, at }) => (
  <g transform="translate(300 380)" opacity={pop(tl, at, 0.4)}><rect x={-90} y={-330} width={180} height={330} fill={CH} {...sw} />{Array.from({ length: 12 }, (_, i) => <rect key={i} x={-65 + (i % 3) * 50} y={-300 + Math.floor(i / 3) * 70} width={30} height={40} fill={GOLD} opacity={0.85} />)}<Lab x={0} y={40} text="ONE LARGE US COMPANY" s={30} /></g>
);
const Ruler: React.FC<PropArgs> = ({ p, tl, at }) => {
  const u = win(tl, at, at + 1.6);
  return <g transform="translate(300 230)"><rect x={-260} y={-30} width={520} height={60} rx={10} fill={GOLD} {...sw} />{Array.from({ length: 11 }, (_, i) => <line key={i} x1={-240 + i * 48} x2={-240 + i * 48} y1={-30} y2={i % 5 ? -6 : 8} stroke={INK} strokeWidth={4} />)}
    <rect x={-240} y={-30} width={480 * u} height={60} fill={IV} opacity={0.25} /><Lab x={-200} y={80} text={p.a} s={30} /><Lab x={200} y={80} text={p.b} s={30} c={GOLD} /></g>;
};
const Docs: React.FC<PropArgs> = ({ p, tl, at }) => (
  <>{(p.labels as string[]).map((l, i) => { const k = pop(tl, at + i * 0.4, 0.4); const n = p.labels.length; const x = 300 + (i - (n - 1) / 2) * 210;
    return <g key={i} opacity={k}><Doc x={x} y={230} title={l} w={180} tick={p.ticks ? win(tl, at + 0.9 + i * 0.5, at + 1.3 + i * 0.5) : 0} /></g>; })}</>
);
const Will: React.FC<PropArgs> = ({ p }) => <Doc x={300} y={230} title="WILL" seal q={p.q} w={230} />;

const MAP: Record<string, React.FC<PropArgs>> = { familytree: FamilyTree, ledger: Ledger, icons: Icons, plaque: Plaque, crest: Crest, magnify: Magnify, bubble: Bubble, wealthbar: WealthBar,
  bricks: Bricks, statement: Statement, speech: Speech, book: Book, phoneapp: PhoneApp, jar: Jar, tower: Tower, ruler: Ruler, docs: Docs, will: Will };
const SIDE: Record<string, [number, number]> = { L: [520, 560], R: [1400, 560], C: [960, 560], T: [960, 360] };

export const PropView: React.FC<PropArgs> = (a) => {
  const C = MAP[a.p.k]; if (!C) return <MPProp {...a} />;
  const k = pop(a.tl, a.at, 0.45) * (1 - interpolate(a.tl, [a.end - 0.18, a.end], [0, 1], clamp));
  if (k <= 0.001) return null;
  const [x0, y0] = SIDE[a.p.side ?? "R"]!; const x = x0 + (a.p.dx ?? 0), y = y0 + (a.p.dy ?? 0);
  return <Frame x={x} y={y} k={k}><C {...a} /></Frame>;
};
