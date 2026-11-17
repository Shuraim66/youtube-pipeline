import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {FONT_SANS, FONT_SERIF} from '../theme';
import {captionPhrases} from '../captionPhrases';
import {Defs, Kicker, Title} from '../AtariShort';
import {GuideBust, BustPose} from '../sample/GuideBust';
import {Carts3D, CartSpec} from '../sample/Carts3D';
import {Cam, Dust, Grain, Vignette, Wipe, layer} from '../sample/AtariSample';
import timing from '../ftxShortTiming.json';

// "How Empires Die" — FTX. Code-only visuals (React/SVG + three.js), same production
// grammar as the approved Atari sample: parallax sets, the acting close-up guide,
// toon-shaded 3D tokens, word-keyed events, gold wipes, grain, loop to frame 0.
const T = timing as any;
const GOLD = '#e3b23c', GOLD_LT = '#f0cf79', IVORY = '#f4efe6', OX = '#9b2c2c', OX_LT = '#c0453f', NAVY = '#0b0e13', TEAL = '#6fb3a8';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const k01 = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const rnd = (i: number) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

const at = (word: string, from = 0): number => {
  const c = T.captions.find((w: any) => w.startFrame >= from && w.word.toLowerCase().replace(/[^a-z0-9-]/g, '') === word);
  return c ? c.startFrame : from;
};
const B: number[] = T.beats.map((b: any) => b.startFrame);
const END: number = T.totalFrames;
const LOOP = 16;
const phrases = captionPhrases(T.captions, T.beats).flatMap((p: any) => {
  const out: any[] = [];
  for (let i = 0; i < p.words.length; i += 3) out.push({words: p.words.slice(i, i + 3), start: p.words[i].startFrame, end: 0});
  return out;
});
phrases.forEach((p: any, i: number) => { const n = phrases[i + 1]; p.end = n ? n.start : p.words[p.words.length - 1].endFrame + 8; });

// Shot starts (frames). Beats: hook, arena, leak, token, run, vault, bankrupt, end.
const S = {
  miami: 0, days: at('it', 60), arena: B[1], leak: B[2], token: B[3], dump: B[4], run: at('customers', B[4]) - 6,
  vault: B[5], empty: at('eight', B[5]) - 4, dark: B[6], gavel: B[7], back: at('most', B[7]) - 6,
};
const IMPACTS = [at('ten', B[0]), at('dumped', B[4]), at('missing', B[5]), at('bankrupt', B[6]), at('twenty-five', B[7])];
const shake = (f: number) => {
  let a = 0;
  for (const t of IMPACTS) if (f >= t && f < t + 12) a += 10 * Math.exp(-(f - t) / 3.5);
  return [a * Math.sin(f * 2.3), a * Math.cos(f * 3.1)];
};

// ---------------------------------------------------------------- Miami + arena set
const MiamiSky: React.FC<{f: number}> = ({f}) => (
  <g>
    <defs>
      <linearGradient id="mi-sky" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#060b16" /><stop offset=".45" stopColor="#101f38" /><stop offset=".75" stopColor="#2a2440" /><stop offset="1" stopColor="#7a3b36" />
      </linearGradient>
    </defs>
    <rect x="-300" y="-100" width="1680" height="1150" fill="url(#mi-sky)" />
    {Array.from({length: 50}, (_, i) => (
      <circle key={i} cx={rnd(i) * 1400 - 150} cy={rnd(i + 50) * 600} r={0.8 + rnd(i + 5) * 1.8} fill="#fff6dc" opacity={0.2 + 0.5 * Math.abs(Math.sin(f / 9 + i))} />
    ))}
    <ellipse cx="540" cy="1040" rx="900" ry="150" fill={GOLD} opacity=".18" filter="url(#fx-soft)" />
  </g>
);

const Towers: React.FC<{f: number}> = ({f}) => (
  <g>
    {Array.from({length: 18}, (_, i) => {
      const w = 50 + rnd(i + 3) * 60, h = 220 + rnd(i + 4) * 380, x = -180 + i * 82;
      return (
        <g key={i}>
          <rect x={x} y={1040 - h} width={w} height={h} fill={i % 2 ? '#141e33' : '#1a2742'} />
          <path d={`M${x + w} ${1040 - h} V1040`} stroke={GOLD} strokeWidth="2" opacity=".35" />
          {Array.from({length: Math.floor(h / 28)}, (_, r) => Array.from({length: Math.floor(w / 16)}, (_, c) => (
            rnd(i * 97 + r * 13 + c) > 0.6 || (rnd(i + r + c * 3) > 0.92 && Math.sin(f / 6 + r) > 0)
              ? <rect key={`${r}-${c}`} x={x + 5 + c * 16} y={1040 - h + 10 + r * 28} width="7" height="11" fill={GOLD_LT} opacity=".7" /> : null
          )))}
        </g>
      );
    })}
  </g>
);

const Bay: React.FC<{f: number}> = ({f}) => (
  <g>
    <rect x="-300" y="1040" width="1680" height="130" fill="#0b1426" />
    {Array.from({length: 26}, (_, i) => (
      <rect key={i} x={rnd(i + 30) * 1400 - 150 + Math.sin(f / 10 + i) * 12} y={1050 + rnd(i + 31) * 110} width={30 + rnd(i + 32) * 90} height="3" fill={GOLD_LT} opacity={0.2 + 0.2 * Math.sin(f / 7 + i)} />
    ))}
  </g>
);

// The arena: curved roof, glass bowl, a marquee sign whose letters can light/die.
const SIGN = 'FTX ARENA';
const Arena: React.FC<{f: number; lit: number[]; searchOn: number}> = ({f, lit, searchOn}) => (
  <g>
    <defs>
      <linearGradient id="ar-glass" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#e9b35a" stopOpacity=".55" /><stop offset="1" stopColor="#3a2a1c" stopOpacity=".9" /></linearGradient>
      <linearGradient id="ar-roof" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#2c3a52" /><stop offset="1" stopColor="#141c2a" /></linearGradient>
      <linearGradient id="ar-beam" x1="0" y1="1" x2="0" y2="0"><stop stopColor="#fff2c8" stopOpacity=".35" /><stop offset="1" stopColor="#fff2c8" stopOpacity="0" /></linearGradient>
    </defs>
    {/* searchlights */}
    {[260, 820].map((x, i) => (
      <path key={x} d={`M${x} 880 L${x - 70} -200 L${x + 70} -200Z`} fill="url(#ar-beam)" opacity={searchOn}
        transform={`rotate(${Math.sin(f / 22 + i * 2) * 24} ${x} 880)`} />
    ))}
    {/* wet plaza: the arena's glow reflected, crowd silhouettes along the edge */}
    <rect x="-300" y="1170" width="1680" height="900" fill="#0d1119" />
    <ellipse cx="540" cy="1260" rx="560" ry="130" fill="#e9b35a" opacity={0.16 * searchOn + 0.04} filter="url(#fx-soft)" />
    {Array.from({length: 18}, (_, i) => (
      <rect key={i} x={170 + i * 42 + Math.sin(f / 9 + i) * 3} y={1200 + (i % 3) * 14} width={24} height={4} fill={GOLD_LT} opacity={0.12 * searchOn} />
    ))}
    <path d="M-300 1170 H1380" stroke={GOLD} strokeWidth="3" opacity=".5" />
    {Array.from({length: 34}, (_, i) => {
      const x = -60 + i * 36 + rnd(i + 300) * 14, h = 58 + rnd(i + 301) * 26, bob = Math.sin(f / 7 + i) * 2;
      return (
        <g key={i} fill="#05070b">
          <circle cx={x} cy={1300 - h + bob} r="15" />
          <path d={`M${x - 22} 1340 Q${x - 20} ${1300 - h + 18 + bob} ${x} ${1300 - h + 16 + bob} Q${x + 20} ${1300 - h + 18 + bob} ${x + 22} 1340Z`} />
        </g>
      );
    })}
    <rect x="-300" y="1336" width="1680" height="700" fill="#05070b" />
    {/* bowl */}
    <path d="M110 1170 L140 960 Q540 900 940 960 L970 1170Z" fill="url(#ar-glass)" />
    {Array.from({length: 14}, (_, i) => <path key={i} d={`M${150 + i * 57} 965 L${140 + i * 58} 1170`} stroke="#1b2230" strokeWidth="7" />)}
    {[1010, 1060, 1110].map((y) => <path key={y} d={`M125 ${y} Q540 ${y - 40} 955 ${y}`} stroke="#1b2230" strokeWidth="6" fill="none" />)}
    {/* roof + sign band */}
    <path d="M70 975 Q540 800 1010 975 L1010 900 Q540 720 70 900Z" fill="url(#ar-roof)" />
    <path d="M70 900 Q540 720 1010 900" stroke={GOLD_LT} strokeWidth="6" fill="none" />
    <rect x="200" y="832" width="680" height="96" rx="12" fill="#0b0e13" stroke={GOLD} strokeWidth="4" />
    {SIGN.split('').map((ch, i) => {
      const on = lit[i] ?? 1;
      return (
        <text key={i} x={248 + i * 74} y="906" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="74"
          fill={on > 0.5 ? '#fff4d6' : '#2a2a2a'} style={{filter: on > 0.5 ? 'drop-shadow(0 0 12px rgba(255,214,120,.95))' : 'none'}}>{ch}</text>
      );
    })}
    {/* marquee bulbs chasing */}
    {Array.from({length: 26}, (_, i) => (
      <circle key={i} cx={214 + i * 26} cy="842" r="4.5" fill={(i + Math.floor(f / 3)) % 3 === 0 && searchOn > 0.5 ? '#ffe7a8' : '#4a3d24'} />
    ))}
  </g>
);

const Palms: React.FC<{side: number}> = ({side}) => (
  <g transform={side < 0 ? '' : 'translate(1080 0) scale(-1 1)'} filter="url(#fx-dof)">
    <path d="M60 1920 Q90 1500 150 1150" stroke="#05070a" strokeWidth="34" fill="none" />
    {[-60, -20, 20, 60, 100, 140].map((a, i) => (
      <path key={i} d={`M150 1150 q${Math.cos((a * Math.PI) / 180) * 160} ${-80 + Math.sin((a * Math.PI) / 180) * 40} ${Math.cos((a * Math.PI) / 180) * 280} ${60 + Math.sin((a * Math.PI) / 180) * 120}`}
        stroke="#05070a" strokeWidth="26" fill="none" strokeLinecap="round" />
    ))}
  </g>
);

const floatingCoins = (f: number, n = 14, area = {x: 540, y: 560, w: 900, h: 420}): CartSpec[] =>
  Array.from({length: n}, (_, i) => ({
    kind: 'coin', label: i % 3 ? '#e3b23c' : '#f0cf79',
    x: area.x + (rnd(i + 1) - 0.5) * area.w + noise2D(`cx${i}`, f / 60, 0) * 30,
    y: area.y + (rnd(i + 2) - 0.5) * area.h + Math.sin(f / 20 + i) * 16,
    z: i, rx: 0.3 * Math.sin(f / 30 + i), ry: f / 18 + i, rz: 0.2 * rnd(i + 3), s: 0.7 + rnd(i + 4) * 0.6,
  }));

const ShotMiami: React.FC<{f: number; l: number}> = ({f, l}) => {
  const cam: Cam = {x: 0, y: 40 * ease(k01(l, 0, 92)), zoom: 1.05 + 0.07 * ease(k01(l, 0, 92))};
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <FxDefs />
        <g transform={layer(cam, 0.05)}><MiamiSky f={f} /></g>
        <g transform={layer(cam, 0.2)}><Towers f={f} /></g>
        <g transform={layer(cam, 0.35)}><Bay f={f} /></g>
        <g transform={layer(cam, 0.6)}><Arena f={f} lit={[]} searchOn={1} /></g>
      </svg>
      <Carts3D carts={floatingCoins(f, 12, {x: 540, y: 700, w: 1000, h: 200})} />
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <FxDefs />
        <g transform={layer(cam, 1)}><Palms side={-1} /><Palms side={1} /></g>
        <Dust f={f} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 10 days
const ShotDays: React.FC<{f: number; l: number}> = ({f, l}) => {
  const pose: BustPose = {yaw: -0.1 + 0.1 * ease(k01(l, 0, 20)), gazeX: -4, gazeY: -8, shock: easeOut(k01(f, at('ten', B[0]) - 4, at('ten', B[0]) + 6)),
    frown: 0, blink: l > 50 && l < 55 ? Math.sin(((l - 50) / 5) * Math.PI) : 0, tilt: -3 + noise2D('d', f / 40, 0) * 1.5, breath: Math.sin(f / 14) * 4};
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3a1414 0%, #150709 60%, #060304 100%)'}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        {Array.from({length: 10}, (_, i) => {
          const t0 = 4 + i * 4.5, k = easeOut(k01(l, t0, t0 + 6)), x = 150 + (i % 5) * 195, y = 640 + Math.floor(i / 5) * 230;
          const struck = k01(l, t0 + 5, t0 + 9);
          return k > 0 && (
            <g key={i} transform={`translate(${x} ${y - (1 - k) * 120}) rotate(${(rnd(i) - 0.5) * 8}) scale(${0.6 + 0.4 * k})`} opacity={k}>
              <rect x="-80" y="-95" width="160" height="190" rx="12" fill="#ece0c4" />
              <rect x="-80" y="-95" width="160" height="48" rx="12" fill={OX} />
              <text x="0" y="-62" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="26" letterSpacing="3" fill={IVORY}>NOV</text>
              <text x="0" y="50" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize="92" fill="#1c2f33">{i + 2}</text>
              <path d="M-60 -30 L60 80 M60 -30 L-60 80" stroke={OX_LT} strokeWidth="12" strokeLinecap="round"
                strokeDasharray="170" strokeDashoffset={170 * (1 - struck)} opacity=".9" />
            </g>
          );
        })}
        <GuideBust x={540} y={1760} scale={1.3} id="d-bust" pose={pose} />
        <Dust f={f} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- arena close (and dark)
const ShotArena: React.FC<{f: number; l: number; dying?: boolean}> = ({f, l, dying = false}) => {
  const cam: Cam = {x: 0, y: 100, zoom: 1.48 + 0.08 * ease(k01(l, 0, 80))};
  const lightOn = SIGN.split('').map((_, i) => (dying ? (l < 8 + i * 5 ? 1 : 0) : (l > i * 3 ? 1 : 0)));
  const search = dying ? 1 - k01(l, 0, 18) : 1;
  return (
    <AbsoluteFill style={{filter: dying ? `saturate(${1 - 0.5 * k01(l, 0, 50)})` : 'none'}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <FxDefs />
        <g transform={layer(cam, 0.1)}><MiamiSky f={f} /></g>
        <g transform={layer(cam, 0.3)}><Towers f={f} /></g>
        <g transform={layer(cam, 0.75)}><Arena f={f} lit={lightOn} searchOn={search} /></g>
        <g transform={layer({...cam, zoom: 1.1}, 1)}><Palms side={-1} /></g>
        {dying && <rect width="1080" height="1920" fill="#000" opacity={0.35 * k01(l, 10, 60)} />}
        <Dust f={f} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- leaked balance sheet
const ROWS: [string, string, boolean][] = [
  ['TOTAL ASSETS', '$14.6B', false], ['FTT (UNLOCKED)', '$3.66B', true], ['FTT COLLATERAL', '$2.16B', true],
  ['SOL', '$1.2B', false], ['CASH', '$134M', false],
];
const ShotLeak: React.FC<{f: number; l: number}> = ({f, l}) => {
  const open = easeOut(k01(l, 2, 18));
  const hl = k01(f, at('secret', B[2]) - 6, at('secret', B[2]) + 8);
  const push = 1 + 0.12 * ease(k01(l, 20, 94));
  const pose: BustPose = {yaw: 0.35, gazeX: -9, gazeY: 8, shock: 0, frown: ease(k01(l, 40, 58)), blink: 0, tilt: 6, breath: Math.sin(f / 14) * 3};
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #3b2619 0%, #1a100a 70%, #0a0604 100%)'}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 58%'}}>
        {/* desk lamp pool */}
        <div style={{position: 'absolute', left: 60, top: 520, width: 960, height: 900, background: 'radial-gradient(ellipse, rgba(255,217,138,.28), rgba(255,217,138,0) 65%)'}} />
        <div style={{position: 'absolute', left: 150, top: 610, width: 780, height: 640, perspective: 1300}}>
          {/* folder back */}
          <div style={{position: 'absolute', inset: 0, background: '#b58a4a', borderRadius: 14, transform: 'rotateX(22deg)', boxShadow: '0 30px 60px rgba(0,0,0,.6)'}} />
          {/* document */}
          <div style={{position: 'absolute', left: 40, top: 30, right: 40, bottom: 30, background: 'linear-gradient(170deg,#f6edd6,#e6d7b6)', transform: `rotateX(22deg) translateY(${(1 - open) * 40}px)`,
            padding: '34px 40px', fontFamily: FONT_SANS, color: '#1c2f33'}}>
            <div style={{fontSize: 22, letterSpacing: 4, color: '#6a6450', fontWeight: 700}}>ALAMEDA RESEARCH</div>
            <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: 44, marginBottom: 22}}>Balance Sheet</div>
            {ROWS.map(([k, v, key], i) => (
              <div key={k} style={{position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: 30, fontWeight: 700, padding: '12px 10px', borderBottom: '2px solid #cdbd98'}}>
                {key && <div style={{position: 'absolute', left: 0, top: 6, bottom: 6, width: `${100 * k01(hl, i * 0.25, i * 0.25 + 0.6)}%`, background: 'rgba(192,69,63,.35)', borderRadius: 6}} />}
                <span style={{position: 'relative'}}>{k}</span><span style={{position: 'relative', color: key && hl > 0.5 ? OX : '#1c2f33'}}>{v}</span>
              </div>
            ))}
          </div>
          {/* folder cover opening like a page */}
          <div style={{position: 'absolute', inset: 0, transformOrigin: '0% 50%', transform: `rotateX(22deg) rotateY(${-178 * open}deg)`, backfaceVisibility: 'hidden',
            background: 'linear-gradient(160deg,#d6a95e,#a8783a)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{border: `6px solid ${OX}`, color: OX, fontFamily: FONT_SANS, fontWeight: 800, fontSize: 64, letterSpacing: 6, padding: '8px 24px', transform: 'rotate(-10deg)'}}>CONFIDENTIAL</div>
          </div>
        </div>
      </AbsoluteFill>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <GuideBust x={900} y={1880} scale={1.05} id="l-bust" pose={pose} />
        <Dust f={f} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- tower on a token stack
const stack = (f: number, l: number, fall: number): CartSpec[] =>
  Array.from({length: 11}, (_, i) => {
    const wob = Math.sin(f / 7 + i * 0.6) * (3 + i * 0.8);
    const fly = k01(fall, rnd(i + 9) * 0.3, rnd(i + 9) * 0.3 + 0.5);
    const dir = rnd(i + 10) > 0.5 ? 1 : -1;
    return {
      kind: 'coin', label: i % 2 ? '#e3b23c' : '#f0cf79',
      x: 540 + wob + dir * fly * (300 + rnd(i) * 300), y: 1330 - i * 26 + fly * (300 + rnd(i + 1) * 500) - Math.sin(fly * Math.PI) * 180,
      z: i * 4, rx: 1.35 + fly * 4 * dir, ry: fly * 3, rz: (rnd(i + 2) - 0.5) * 0.08 + fly * 2, s: 1.35,
    };
  });

const ShotTower: React.FC<{f: number; l: number; dumping?: boolean}> = ({f, l, dumping = false}) => {
  const fall = dumping ? k01(f, at('dumped', B[4]) - 2, at('dumped', B[4]) + 30) : 0;
  const lean = (dumping ? 38 * ease(k01(f, at('dumped', B[4]) + 4, at('dumped', B[4]) + 30)) : 0) + Math.sin(f / 7) * 2.2;
  const drop = dumping ? 420 * Math.pow(k01(f, at('dumped', B[4]) + 8, at('dumped', B[4]) + 34), 2) : 0;
  const push = 1.02 + 0.06 * ease(k01(l, 0, 90));
  const extra: CartSpec[] = dumping ? Array.from({length: 16}, (_, i) => {
    const t = k01(f, at('dumped', B[4]) - 10 + i * 2, at('dumped', B[4]) + 14 + i * 2);
    return {kind: 'coin', label: '#e3b23c', x: 200 + rnd(i + 40) * 700, y: -80 + t * 1500, z: 60 + i, rx: t * 6, ry: t * 5, rz: t * 2, s: 1};
  }) : [];
  return (
    <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 60%', background: 'radial-gradient(ellipse at 50% 55%, #1f2a44 0%, #0b1020 65%, #05070d 100%)'}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <FxDefs />
        <ellipse cx="540" cy="1360" rx="520" ry="90" fill={GOLD} opacity=".18" filter="url(#fx-soft)" />
        <rect x="-100" y="1350" width="1280" height="700" fill="#070a12" />
        <path d="M-100 1350 H1180" stroke={GOLD} strokeWidth="3" opacity=".5" />
        {/* spotlight cone */}
        <path d="M540 -100 L260 1360 L820 1360Z" fill="#fff2c8" opacity=".06" />
        {/* the sister firm's tower, balanced on the stack */}
        <g transform={`translate(0 ${drop}) rotate(${lean} 540 1040)`}>
          <path d="M400 1040 L680 1040 L660 520 L420 520Z" fill="#1b2a44" />
          <path d="M660 520 L680 1040" stroke={GOLD_LT} strokeWidth="5" />
          {Array.from({length: 14}, (_, r) => Array.from({length: 5}, (_, c) => (
            <rect key={`${r}-${c}`} x={440 + c * 44} y={545 + r * 34} width="26" height="18" fill={rnd(r * 7 + c) > 0.35 ? GOLD_LT : '#26334d'} opacity=".8" />
          )))}
          <rect x="430" y="470" width="220" height="56" rx="6" fill="#0b0e13" stroke={GOLD} strokeWidth="3" />
          <text x="540" y="508" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="32" letterSpacing="4" fill={IVORY}>ALAMEDA</text>
        </g>
        <Dust f={f} />
      </svg>
      <Carts3D carts={[...stack(f, l, fall), ...extra]} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- bank run: phones
const ShotRun: React.FC<{f: number; l: number}> = ({f, l}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #3a1414 0%, #12070a 70%, #050203 100%)', transform: `scale(${1.02 + 0.05 * ease(k01(l, 0, 52))})`}}>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
      {Array.from({length: 12}, (_, i) => {
        const cx = 190 + (i % 3) * 350, cy = 600 + Math.floor(i / 3) * 300, t0 = rnd(i + 70) * 14;
        const k = easeOut(k01(l, t0, t0 + 6)), tap = (l - t0 - 8) % 10 < 3 && l > t0 + 8;
        return k > 0 && (
          <g key={i} transform={`translate(${cx} ${cy}) scale(${0.55 + 0.45 * k}) rotate(${(rnd(i) - 0.5) * 10})`} opacity={k}>
            <rect x="-80" y="-130" width="160" height="260" rx="22" fill="#0b0e13" stroke="#3b4450" strokeWidth="5" />
            <rect x="-68" y="-112" width="136" height="224" rx="10" fill="#1c2436" />
            <text x="0" y="-70" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="18" letterSpacing="2" fill="#9aa3b0">BALANCE</text>
            <rect x="-52" y="-10" width="104" height="44" rx="10" fill={tap ? '#ff5b4a' : OX_LT} />
            <text x="0" y="20" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="800" fontSize="17" letterSpacing="1" fill="#fff">WITHDRAW</text>
            {tap && <circle cx="10" cy="12" r="26" fill="none" stroke="#fff" strokeWidth="4" opacity=".6" />}
            <circle cx="62" cy="-118" r="16" fill={OX_LT} /><text x="62" y="-111" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="800" fontSize="18" fill="#fff">!</text>
          </g>
        );
      })}
      <Dust f={f} />
    </svg>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- vault: coins pour out, then empty
const Vault: React.FC<{f: number; open: number; empty: boolean}> = ({f, open, empty}) => (
  <g>
    <defs>
      <radialGradient id="va-in" cx=".5" cy=".5"><stop stopColor={empty ? '#2a2620' : '#f0cf79'} stopOpacity={empty ? 1 : 0.9} /><stop offset="1" stopColor="#0b0e13" /></radialGradient>
      <linearGradient id="va-steel" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8a939d" /><stop offset=".5" stopColor="#4b545e" /><stop offset="1" stopColor="#262c33" /></linearGradient>
    </defs>
    <rect x="-100" y="-100" width="1280" height="2200" fill="#11151c" />
    {Array.from({length: 9}, (_, i) => <path key={i} d={`M-100 ${200 + i * 200} H1180`} stroke="#1a2029" strokeWidth="6" />)}
    <circle cx="540" cy="980" r="360" fill="#0a0c10" />
    <circle cx="540" cy="980" r="320" fill="url(#va-in)" />
    {empty && Array.from({length: 4}, (_, i) => <path key={i} d={`M300 ${840 + i * 90} H780`} stroke="#3a342a" strokeWidth="10" />)}
    {/* the door swings open on its left hinge */}
    <g transform={`translate(${220} 980) scale(${1 - 0.86 * open} 1) translate(${-220} -980)`}>
      <circle cx="540" cy="980" r="320" fill="url(#va-steel)" />
      <circle cx="540" cy="980" r="250" fill="none" stroke="#2c3238" strokeWidth="14" />
      {Array.from({length: 6}, (_, i) => (
        <path key={i} d="M540 980 L540 800" stroke="#c7ccd1" strokeWidth="18" strokeLinecap="round" transform={`rotate(${i * 60 + f * 0.5} 540 980)`} />
      ))}
      <circle cx="540" cy="980" r="46" fill="#c7ccd1" />
      {Array.from({length: 16}, (_, i) => <circle key={i} cx={540 + Math.cos((i / 16) * Math.PI * 2) * 290} cy={980 + Math.sin((i / 16) * Math.PI * 2) * 290} r="10" fill="#2c3238" />)}
    </g>
    <circle cx="540" cy="980" r="360" fill="none" stroke={GOLD} strokeWidth="6" opacity=".6" />
  </g>
);

const ShotVault: React.FC<{f: number; l: number; empty?: boolean}> = ({f, l, empty = false}) => {
  const open = empty ? 1 : easeOut(k01(l, 0, 16));
  const coins: CartSpec[] = empty ? [{kind: 'coin', label: '#e3b23c', x: 560, y: 1230, z: 0, rx: 1.2 + 0.3 * Math.sin(l / 3), ry: l / 2, rz: 0, s: 1.2}]
    : Array.from({length: 22}, (_, i) => {
      const t = ((l * 1.2 + i * 6) % 45) / 45; const a = rnd(i) * Math.PI * 2;
      return {kind: 'coin', label: i % 2 ? '#e3b23c' : '#f0cf79', x: 540 + Math.cos(a) * t * 700, y: 980 + Math.sin(a) * t * 900 + t * t * 300,
        z: 100 + t * 300, rx: t * 7, ry: t * 5 + i, rz: t * 3, s: 0.6 + t * 1.8};
    });
  return (
    <AbsoluteFill style={{transform: `scale(${empty ? 1.18 + 0.05 * ease(k01(l, 0, 60)) : 1.02 + 0.08 * ease(k01(l, 0, 78))})`, transformOrigin: '50% 51%'}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <Vault f={f} open={open} empty={empty} />
        <Dust f={f} />
      </svg>
      <Carts3D carts={coins} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- gavel
const ShotGavel: React.FC<{f: number; l: number}> = ({f, l}) => {
  const hit = at('twenty-five', B[7]);
  const swing = f < hit ? -40 * ease(k01(f, hit - 16, hit - 4)) : -40 * (1 - easeOut(k01(f, hit - 4, hit)));
  const angle = f < hit - 4 ? swing : f < hit ? -40 + 40 * easeOut(k01(f, hit - 4, hit)) : 0;
  const ring = k01(f, hit, hit + 16);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #3b2619 0%, #160d08 70%, #070403 100%)', transform: `scale(${1.02 + 0.05 * ease(k01(l, 0, 82))})`}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <FxDefs />
        {/* bench + scales */}
        <rect x="-100" y="1180" width="1280" height="800" fill="#2a170e" />
        <path d="M-100 1180 H1180" stroke={GOLD_LT} strokeWidth="5" opacity=".6" />
        {[140, 400, 660, 920].map((x) => <rect key={x} x={x - 90} y="1240" width="180" height="500" rx="8" fill="none" stroke="#4d3322" strokeWidth="10" />)}
        <g transform={`translate(830 760) rotate(${Math.sin(f / 18) * 4})`} filter="url(#fx-glow)">
          <path d="M0 -150 V160 M-150 -110 H150" stroke={GOLD} strokeWidth="10" />
          <path d="M-150 -110 L-190 0 H-110Z M150 -110 L110 0 H190Z" fill="none" stroke={GOLD} strokeWidth="6" />
          <path d="M-195 0 Q-150 40 -105 0Z M105 0 Q150 40 195 0Z" fill={GOLD} />
          <rect x="-60" y="160" width="120" height="20" fill={GOLD} />
        </g>
        {/* sound block */}
        <ellipse cx="430" cy="1200" rx="170" ry="34" fill="#1a0f09" />
        <rect x="290" y="1150" width="280" height="50" rx="10" fill="#6b4226" />
        <ellipse cx="430" cy="1150" rx="140" ry="26" fill="#8a5a36" />
        {ring > 0 && ring < 1 && <ellipse cx="430" cy="1150" rx={140 + ring * 360} ry={26 + ring * 70} fill="none" stroke={GOLD_LT} strokeWidth={8 * (1 - ring)} opacity={1 - ring} />}
        {/* gavel pivots at the handle end */}
        <g transform={`rotate(${angle} 720 1060)`}>
          <rect x="400" y="1045" width="330" height="30" rx="15" fill="#5a3522" />
          <rect x="330" y="990" width="110" height="140" rx="22" fill="#7a4a2c" />
          <rect x="330" y="1020" width="110" height="18" fill={GOLD} />
          <rect x="330" y="1082" width="110" height="18" fill={GOLD} />
        </g>
        <Dust f={f} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- paid back (guide, coins return)
const ShotBack: React.FC<{f: number; l: number}> = ({f, l}) => {
  const pose: BustPose = {yaw: 0.05 + 0.1 * Math.sin(l / 40), gazeX: 0, gazeY: 0, shock: 0, frown: 0.25 * (1 - ease(k01(l, 20, 40))),
    blink: l > 60 && l < 65 ? Math.sin(((l - 60) / 5) * Math.PI) : 0, tilt: 3 + noise2D('b', f / 40, 0) * 1.5, breath: Math.sin(f / 14) * 4};
  const coins: CartSpec[] = Array.from({length: 14}, (_, i) => {
    const t = k01(l, i * 2, i * 2 + 26);
    return {kind: 'coin', label: '#f0cf79', x: 540 + (rnd(i) - 0.5) * 1000 * (1 - t), y: 700 - (rnd(i + 1) * 500) * (1 - t) + 80 * t, z: i, rx: 0.3, ry: l / 10 + i, rz: 0, s: 0.9 * (1 - t * 0.6)};
  });
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2a3350 0%, #111726 65%, #06080e 100%)', transform: `scale(${1.02 + 0.04 * ease(k01(l, 0, 88))})`}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <FxDefs />
        <ellipse cx="540" cy="1150" rx="560" ry="620" fill={GOLD} opacity=".12" filter="url(#fx-soft)" />
        <GuideBust x={540} y={1760} scale={1.5} id="bk-bust" pose={pose} />
        <Dust f={f} />
      </svg>
      <Carts3D carts={coins} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- shared defs
const FxDefs: React.FC = () => (
  <defs>
    <filter id="fx-soft"><feGaussianBlur stdDeviation="24" /></filter>
    <filter id="fx-dof"><feGaussianBlur stdDeviation="5" /></filter>
    <filter id="fx-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
  </defs>
);

const Hook: React.FC = () => (
  <g>
    <Kicker y={262} text="FTX · NOVEMBER 2022" />
    <text x="540" y="392" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize="112" fill={IVORY} stroke={NAVY} strokeWidth="6" paintOrder="stroke fill">$32 BILLION.</text>
    <text x="540" y="512" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize="100" fill="url(#at-gold)" stroke={NAVY} strokeWidth="6" paintOrder="stroke fill" filter="url(#at-glow)">GONE IN 10 DAYS.</text>
  </g>
);

const shotAt = (f: number): React.ReactNode => {
  if (f < S.days) return <ShotMiami f={f} l={f - S.miami} />;
  if (f < S.arena) return <ShotDays f={f} l={f - S.days} />;
  if (f < S.leak) return <ShotArena f={f} l={f - S.arena} />;
  if (f < S.token) return <ShotLeak f={f} l={f - S.leak} />;
  if (f < S.dump) return <ShotTower f={f} l={f - S.token} />;
  if (f < S.run) return <ShotTower f={f} l={f - S.token} dumping />;
  if (f < S.vault) return <ShotRun f={f} l={f - S.run} />;
  if (f < S.empty) return <ShotVault f={f} l={f - S.vault} />;
  if (f < S.dark) return <ShotVault f={f} l={f - S.empty} empty />;
  if (f < S.gavel) return <ShotArena f={f} l={f - S.dark} dying />;
  if (f < S.back) return <ShotGavel f={f} l={f - S.gavel} />;
  return <ShotBack f={f} l={f - S.back} />;
};

export const FtxShort: React.FC = () => {
  const f = useCurrentFrame();
  const W = 10;
  const wipes = [S.arena, S.token, S.vault, S.gavel];
  const w = wipes.find((c) => f >= c && f < c + W);
  const body = w !== undefined ? <Wipe p={(f - w) / W} prev={shotAt(w - 1)} next={shotAt(f)} /> : shotAt(f);
  const cuts = [S.days, S.leak, S.dump, S.run, S.empty, S.dark, S.back];
  const since = Math.min(...cuts.map((c) => (f >= c ? f - c : 99)));
  const punch = since < 8 ? 1 + 0.06 * Math.pow(1 - since / 8, 2) : 1;
  const flash = since < 4 ? 0.2 * (1 - since / 4) : 0;
  const [sx, sy] = shake(f);
  const loopIn = k01(f, END - LOOP, END - 1);
  const phrase = phrases.find((p: any) => f >= p.start && f < p.end && f < END - LOOP);
  const bil = at('billions', B[5]);

  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${punch})`}}>{body}</AbsoluteFill>
      {loopIn > 0 && <AbsoluteFill style={{opacity: loopIn}}><ShotMiami f={0} l={0} /></AbsoluteFill>}
      <Vignette />
      <Grain f={f} />
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <defs><linearGradient id="ftx-top" x1="0" y1="0" x2="0" y2="1"><stop stopColor={NAVY} stopOpacity=".75" /><stop offset="1" stopColor={NAVY} stopOpacity="0" /></linearGradient></defs>
        <rect width="1080" height="560" fill="url(#ftx-top)" />
        {(f < S.days || loopIn > 0) && <g opacity={f < S.days ? 1 : loopIn}><Hook /></g>}
        {f >= S.days && f < S.arena && <Title f={f} t={at('ten', B[0])} y={440} size={180} text="10 DAYS" fill="url(#at-ox)" />}
        {f >= S.arena && f < S.leak && (
          <g><Kicker y={300} text="MIAMI · 19-YEAR NAMING DEAL" /><Title f={f} t={at('arena', B[1]) - 4} y={470} size={170} text="$135M" /></g>
        )}
        {f >= S.leak && f < S.token && (
          <g><Kicker y={300} text="LEAKED · NOVEMBER 2, 2022" /><Title f={f} t={at('secret', B[2])} y={470} size={120} text="THE SECRET" fill="url(#at-ox)" /></g>
        )}
        {f >= S.token && f < S.dump && <Title f={f} t={at('token', B[3])} y={340} size={104} text="ITS OWN TOKEN" />}
        {f >= S.dump && f < S.run && (
          <g><Kicker y={300} text="A RIVAL SELLS · NOVEMBER 6" /><Title f={f} t={at('dumped', B[4])} y={470} size={170} text="DUMPED" fill="url(#at-ox)" /></g>
        )}
        {f >= S.run && f < S.vault && <Title f={f} t={at('ran', B[4]) - 2} y={420} size={150} text="BANK RUN" fill={IVORY} />}
        {f >= S.vault && f < S.empty && (
          <g><Kicker y={300} text="WITHDRAWALS" /><Title f={f} t={bil} y={470} size={170} text="72 HOURS" /></g>
        )}
        {f >= S.empty && f < S.dark && <Title f={f} t={at('eight', B[5])} y={440} size={136} text="−$8 BILLION" fill="url(#at-ox)" />}
        {f >= S.dark && f < S.gavel && (
          <g><Kicker y={300} text="NOVEMBER 11, 2022" /><Title f={f} t={at('bankrupt', B[6])} y={470} size={150} text="CHAPTER 11" fill="url(#at-ox)" /></g>
        )}
        {f >= S.gavel && f < S.back && (
          <g><Kicker y={300} text="THE FOUNDER · SENTENCED 2024" /><Title f={f} t={at('twenty-five', B[7])} y={470} size={170} text="25 YEARS" /></g>
        )}
        {f >= S.back && loopIn === 0 && (
          <g><Kicker y={300} text="98% OF CREDITORS · PAID 118% OF CLAIMS" /><Title f={f} t={at('paid', B[7]) - 2} y={470} size={200} text="118%" /></g>
        )}
        <image href={staticFile('emblem.png')} x="72" y="73" width="90" height="90" />
        <text x="180" y="119" fontFamily={FONT_SERIF} fontSize="39" letterSpacing="1" fill={GOLD}>Aurelis</text>
        <text x="182" y="151" fontFamily={FONT_SANS} fontSize="16" letterSpacing="2" fill="#d9d2bf">HOW EMPIRES DIE</text>
        {flash > 0 && <rect width="1080" height="1920" fill={GOLD_LT} opacity={flash} />}
      </svg>
      {phrase && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1420, display: 'flex', justifyContent: 'center'}}>
          <div style={{display: 'flex', gap: 16, padding: '14px 28px', borderRadius: 16, background: 'rgba(11,14,19,.9)',
            border: '2px solid rgba(227,178,60,.55)', boxShadow: '0 8px 30px rgba(0,0,0,.45)'}}>
            {phrase.words.map((wd: any, i: number) => {
              const active = f >= wd.startFrame && (i === phrase.words.length - 1 || f < phrase.words[i + 1].startFrame);
              return <span key={i} style={{fontFamily: FONT_SANS, fontWeight: 700, fontSize: 54, letterSpacing: 1, textTransform: 'uppercase',
                color: active ? GOLD : IVORY, textShadow: active ? '0 0 18px rgba(227,178,60,.55)' : 'none'}}>{wd.word}</span>;
            })}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
