import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Banker} from './Banker';
import {FONT_SANS, FONT_SERIF} from './theme';
import {captionPhrases} from './captionPhrases';
import timing from './atariShortTiming.json';

// "How Empires Die" Short — Atari. Aurelis brand, Alux-style Short grammar
// (studied from Alux Shorts dalNe0hkMD4 / jr8I7NmTiJE / Ua6rcDHVcEg, Sep 24 2026):
// dark cinematic grounds lit by a single brand rim-light (Alux = cyan, Aurelis = gold),
// glowing focal objects, the recurring guide in most scenes, a single-line caption
// pill with one highlighted word, and big glowing serif title words.
// Retention mechanics kept: open-loop hook, a visual event keyed to the spoken word
// every ~1-1.5 s, camera punch per cut, no end card, last frames dissolve into frame 0.
const T = timing as any;

// Aurelis tokens (theme.ts family); per-scene grounds stay inside this range.
export const GOLD = '#e3b23c', GOLD_LT = '#f0cf79', GOLD_DK = '#b98a25', IVORY = '#f4efe6',
  OX = '#9b2c2c', OX_LT = '#c0453f', NAVY = '#0b0e13', TEAL = '#6fb3a8';
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const k01 = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const rnd = (i: number) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

// Frame of the first caption word matching `word` at/after `from` (keys visuals to speech).
export const at = (word: string, from = 0): number => {
  const c = T.captions.find((w: any) => w.startFrame >= from &&
    w.word.toLowerCase().replace(/[^a-z0-9,-]/g, '').replace(/,$/, '') === word);
  return c ? c.startFrame : from;
};
export const B: number[] = T.beats.map((b: any) => b.startFrame);
export const END: number = T.totalFrames;
export const LOOP = 16; // frames of dissolve back into frame 0

// ---------------------------------------------------------------- captions (≤3 words)
export const phrases = captionPhrases(T.captions, T.beats).flatMap((p: any) => {
  const out: any[] = [];
  for (let i = 0; i < p.words.length; i += 3) {
    const words = p.words.slice(i, i + 3);
    out.push({words, start: words[0].startFrame, end: 0});
  }
  return out;
});
phrases.forEach((p: any, i: number) => {
  const next = phrases[i + 1];
  p.end = next ? next.start : p.words[p.words.length - 1].endFrame + 8;
});

// ---------------------------------------------------------------- camera impacts
const IMPACTS = [at('concrete', B[1]), at('flopped', B[5]), at('billion', B[6]), at('found', B[7])];
export const shake = (f: number) => {
  let a = 0;
  for (const t of IMPACTS) if (f >= t && f < t + 12) a += 9 * Math.exp(-(f - t) / 3.5);
  return [a * Math.sin(f * 2.3), a * Math.cos(f * 3.1)];
};

// ---------------------------------------------------------------- shared defs + type
export const Defs: React.FC = () => (
  <defs>
    <filter id="at-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="10" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="at-soft"><feGaussianBlur stdDeviation="22" /></filter>
    <linearGradient id="at-gold" x1="0" y1="0" x2="0" y2="1">
      <stop stopColor="#fff0bf" /><stop offset=".45" stopColor={GOLD_LT} /><stop offset="1" stopColor={GOLD_DK} />
    </linearGradient>
    <linearGradient id="at-ox" x1="0" y1="0" x2="0" y2="1">
      <stop stopColor="#ff8a7a" /><stop offset="1" stopColor={OX_LT} />
    </linearGradient>
  </defs>
);

// Alux-style title word: big, glowing, pops in (scale 1.35→1, slight rise). Serif = Aurelis.
export const Title: React.FC<{f: number; t: number; x?: number; y: number; size: number; text: string; fill?: string}> =
  ({f, t, x = 540, y, size, text, fill = 'url(#at-gold)'}) => {
    if (f < t) return null;
    const k = easeOut(k01(f, t, t + 8));
    return (
      <g transform={`translate(${x} ${y + (1 - k) * 30}) scale(${1.35 - 0.35 * k})`} opacity={k01(f, t, t + 4)}>
        <text x="0" y="0" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize={size} fill={fill}
          stroke={NAVY} strokeWidth={size * 0.05} paintOrder="stroke fill" filter="url(#at-glow)">{text}</text>
      </g>
    );
  };

export const Kicker: React.FC<{y: number; text: string; op?: number}> = ({y, text, op = 1}) => (
  <text x="540" y={y} textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="28" letterSpacing="6" fill={GOLD} opacity={op}>{text}</text>
);

// ---------------------------------------------------------------- props (lit flat vector)
export const LABELS = [GOLD, OX_LT, TEAL, IVORY, '#d9864a'];
export const Cart: React.FC<{x: number; y: number; rot?: number; s?: number; c?: string}> = ({x, y, rot = 0, s = 1, c = GOLD}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x="-34" y="-40" width="68" height="80" rx="7" fill="#1d2530" />
    <rect x="-34" y="-40" width="68" height="80" rx="7" fill="none" stroke={GOLD_LT} strokeWidth="2.5" opacity=".7" />
    <rect x="-25" y="-31" width="50" height="38" rx="3" fill={c} />
    <rect x="-25" y="-31" width="50" height="9" fill="#fff" opacity=".3" />
    {[13, 22, 31].map((yy) => <path key={yy} d={`M-24 ${yy}H24`} stroke="#34404d" strokeWidth="3" />)}
  </g>
);

// Night desert, gold horizon glow, crescent moon — reads instantly on a phone.
const Desert: React.FC<{f: number; dawn?: boolean}> = ({f, dawn = false}) => (
  <g>
    <defs>
      <linearGradient id={`at-sky${dawn ? 'd' : ''}`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor={dawn ? '#1b2f45' : '#0c1624'} /><stop offset=".55" stopColor={dawn ? '#3b4d63' : '#1a2e40'} />
        <stop offset=".9" stopColor={dawn ? '#e0a456' : '#b8783a'} /><stop offset="1" stopColor={dawn ? '#f3c877' : '#d99a4a'} />
      </linearGradient>
      <linearGradient id="at-sand" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#4a3827" /><stop offset=".5" stopColor="#2c2219" /><stop offset="1" stopColor="#15110d" />
      </linearGradient>
    </defs>
    <rect width="1080" height="930" fill={`url(#at-sky${dawn ? 'd' : ''})`} />
    {Array.from({length: 38}, (_, i) => (
      <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 50) * 560} r={1 + rnd(i + 7) * 2.2} fill="#fff6dc"
        opacity={(dawn ? 0.25 : 0.55) * (0.6 + 0.4 * Math.sin(f / 9 + i))} />
    ))}
    {!dawn && (
      // True crescent: the bite is masked out (transparent), so the sky shows through
      // at any gradient height — an overlaid sky-coloured disc read as an eclipse.
      <g>
        <mask id="at-crescent" maskUnits="userSpaceOnUse" x="700" y="540" width="300" height="300">
          <circle cx="850" cy="680" r="54" fill="#fff" />
          <circle cx="874" cy="664" r="47" fill="#000" />
        </mask>
        <circle cx="850" cy="680" r="120" fill="#ffe7a8" opacity=".10" filter="url(#at-soft)" />
        <circle cx="850" cy="680" r="54" fill="#ffe7a8" mask="url(#at-crescent)" filter="url(#at-glow)" />
      </g>
    )}
    <ellipse cx="540" cy="930" rx="760" ry="120" fill={GOLD} opacity=".22" filter="url(#at-soft)" />
    <path d="M0 930 L0 812 L120 804 L150 752 L330 748 L360 812 L520 824 L560 782 L700 777 L720 822 L1080 812 L1080 930Z" fill="#1c2430" />
    <path d="M150 752 L330 748 M560 782 L700 777" stroke={GOLD} strokeWidth="3" opacity=".6" />
    <path d="M0 930 L0 872 L260 862 L420 884 L640 872 L900 882 L1080 868 L1080 930Z" fill="#141a22" />
    <rect y="930" width="1080" height="990" fill="url(#at-sand)" />
    <path d="M0 930H1080" stroke={GOLD_LT} strokeWidth="3" opacity=".45" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${(i * 300 + f * 0.8) % 1400 - 200} ${1010 + i * 110} q120 -16 240 0`} stroke={GOLD} strokeWidth="3" fill="none" opacity=".16" />
    ))}
  </g>
);

const Pit: React.FC<{fill: number; slab: number; crack?: number}> = ({fill, slab, crack = 0}) => (
  <g>
    <ellipse cx="560" cy="1150" rx="250" ry="60" fill="#0a0806" />
    <path d="M310 1150 a250 60 0 0 0 500 0" fill="none" stroke={GOLD} strokeWidth="4" opacity=".55" />
    {Array.from({length: Math.round(32 * fill)}, (_, i) => (
      <Cart key={i} x={560 + (rnd(i) - 0.5) * 360 * (1 - i / 60)} y={1172 - i * 1.5 - rnd(i + 9) * 14}
        rot={(rnd(i + 3) - 0.5) * 120} s={0.6} c={LABELS[i % LABELS.length]} />
    ))}
    {slab > 0 && (
      <g opacity={Math.min(1, slab * 1.4)}>
        <ellipse cx="560" cy="1152" rx={236 * Math.min(1, slab * 1.1)} ry={52 * Math.min(1, slab * 1.1)} fill="#6d6c6a" />
        <ellipse cx="545" cy="1140" rx={150 * slab} ry={20 * slab} fill="#8e8c88" opacity=".8" />
        <path d="M324 1152 a236 52 0 0 1 472 0" fill="none" stroke={GOLD_LT} strokeWidth="3" opacity={0.5 * slab} />
        {crack > 0 && <path d="M430 1150 l40 -12 l30 16 l44 -20 l36 14 l50 -10" fill="none" stroke="#1b1a19" strokeWidth="6"
          strokeDasharray="300" strokeDashoffset={300 * (1 - crack)} />}
      </g>
    )}
  </g>
);

const Wheel: React.FC<{cx: number}> = ({cx}) => (
  <g><circle cx={cx} cy="1105" r="34" fill="#0d1116" /><circle cx={cx} cy="1105" r="13" fill="#5a6470" />
    <path d={`M${cx - 30} 1090 a34 34 0 0 1 40 -20`} stroke={GOLD} strokeWidth="3" fill="none" opacity=".7" /></g>
);

// Dump truck in brand colors, rim-lit gold.
const Truck: React.FC<{tilt: number}> = ({tilt}) => (
  <g>
    <g transform={`rotate(${-tilt} 440 1065)`}>
      <path d="M170 950 L440 950 L440 1065 L190 1065Z" fill="#7c6a4c" />
      <path d="M170 950 L440 950" stroke={GOLD_LT} strokeWidth="5" />
      <path d="M190 985 H425 M190 1022 H425" stroke="#5f5139" strokeWidth="6" />
    </g>
    <path d="M30 985 L30 1080 L165 1080 L165 945 L100 945 L70 985Z" fill={OX} />
    <path d="M30 985 L70 985 L100 945 L165 945" stroke={GOLD_LT} strokeWidth="4" fill="none" />
    <path d="M82 988 L106 958 L150 958 L150 988Z" fill="#23384a" />
    <path d="M86 986 L108 960 L120 960 L98 986Z" fill={IVORY} opacity=".35" />
    <rect x="20" y="1066" width="440" height="24" rx="6" fill="#1b2027" />
    {[90, 320, 400].map((cx) => <Wheel key={cx} cx={cx} />)}
  </g>
);

// Cartridges pouring from the tipped bed into the pit; already mid-air on frame 0.
const Stream: React.FC<{f: number}> = ({f}) => (
  <g>
    {Array.from({length: 15}, (_, i) => {
      const period = 26, t = ((f + 40 + i * (period / 15) * 1.7) % period) / period;
      const sx = 450 + rnd(i) * 30, ex = 470 + rnd(i + 5) * 190;
      return <Cart key={i} x={sx + (ex - sx) * t} y={975 + 25 * t + 170 * t * t} rot={t * 300 * (rnd(i + 1) > 0.5 ? 1 : -1)}
        s={0.66} c={LABELS[i % LABELS.length]} />;
    })}
  </g>
);

const Mixer: React.FC<{x: number; f: number}> = ({x, f}) => (
  <g transform={`translate(${x} ${1105 * 0.25}) scale(.75)`}>
    <rect x="0" y="1066" width="380" height="26" rx="6" fill="#1b2027" />
    <path d="M250 985 L250 1080 L380 1080 L380 990 L350 945 L280 945Z" fill="#2b4a5e" />
    <path d="M250 985 L280 945 L350 945 L380 990" stroke={GOLD_LT} strokeWidth="5" fill="none" />
    <path d="M290 988 L296 958 L340 958 L360 988Z" fill="#132030" />
    <g transform={`rotate(${f * 4} 130 995)`}>
      <ellipse cx="130" cy="995" rx="125" ry="76" fill="#cfc8b8" />
      <path d="M40 945 L220 1045 M20 995 L240 995" stroke={OX} strokeWidth="10" />
    </g>
    <path d="M10 1020 a125 76 0 0 1 120 -100" stroke={GOLD_LT} strokeWidth="5" fill="none" opacity=".8" />
    <path d="M10 1025 L-90 1105" stroke="#55534f" strokeWidth="22" strokeLinecap="round" />
    {[60, 290].map((cx) => <Wheel key={cx} cx={cx} />)}
  </g>
);

const Excavator: React.FC<{p: number}> = ({p}) => {
  const boom = interpolate(p, [0, 0.35, 0.6, 1], [-40, 18, 18, -30], clamp);
  return (
    <g transform="translate(-130 -20)">
      <rect x="820" y="1060" width="240" height="66" rx="14" fill="#1b2027" />
      {[850, 910, 970, 1030].map((cx) => <circle key={cx} cx={cx} cy="1093" r="16" fill="#3a434d" />)}
      <path d="M840 960 L1060 960 L1060 1062 L840 1062Z" fill="#8a6a2c" />
      <path d="M960 900 L1050 900 L1050 962 L960 962Z" fill="#8a6a2c" />
      <path d="M840 960 H960 V900 H1050" stroke={GOLD_LT} strokeWidth="5" fill="none" />
      <path d="M972 912 L1038 912 L1038 950 L972 950Z" fill="#132030" />
      <g transform={`rotate(${boom} 860 980)`}>
        <path d="M860 990 L620 900 L600 930 L850 1010Z" fill="#a47f35" />
        <path d="M860 990 L620 900" stroke={GOLD_LT} strokeWidth="4" />
        <g transform={`rotate(${-boom * 1.6} 612 915)`}>
          <path d="M612 915 L560 1080 L590 1088 L632 925Z" fill="#a47f35" />
          <path d="M540 1070 L630 1080 L610 1140 L540 1128Z" fill="#3a3f45" />
          {p > 0.55 && [0, 1, 2].map((i) => <Cart key={i} x={570 + i * 22} y={1066 - i * 8} rot={i * 30 - 20} s={0.5} c={LABELS[i]} />)}
        </g>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- grounds
const Ground: React.FC<{top: string; mid: string; bot: string; glow: string; f: number; rays?: boolean; cy?: number}> =
  ({top, mid, bot, glow, f, rays = false, cy = 960}) => (
    <g>
      <defs><linearGradient id={`gr-${top.slice(1)}`} x1="0" y1="0" x2=".35" y2="1">
        <stop stopColor={top} /><stop offset=".5" stopColor={mid} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
      <rect width="1080" height="1920" fill={`url(#gr-${top.slice(1)})`} />
      {rays && Array.from({length: 22}, (_, i) => (
        <path key={i} d={`M540 ${cy} L500 -1300 L580 -1300Z`} transform={`rotate(${i * 16.36 + f * 0.25} 540 ${cy})`} fill={glow} opacity=".07" />
      ))}
      <ellipse cx="540" cy={cy} rx="620" ry="620" fill={glow} opacity=".16" filter="url(#at-soft)" />
      {Array.from({length: 14}, (_, i) => (
        <circle key={i} cx={rnd(i + 3) * 1080} cy={(rnd(i + 30) * 1900 - f * (0.4 + rnd(i) * 0.6) + 1920) % 1920} r={2 + rnd(i + 9) * 3}
          fill={glow} opacity={0.25 + 0.2 * Math.sin(f / 8 + i)} />
      ))}
    </g>
  );

const Floor: React.FC<{y?: number; tone?: string}> = ({y = 1300, tone = '#07090d'}) => (
  <g>
    <rect y={y} width="1080" height={1920 - y} fill={tone} opacity=".75" />
    <path d={`M0 ${y}H1080`} stroke={GOLD} strokeWidth="3" opacity=".5" />
  </g>
);

export const Hook: React.FC = () => (
  <g>
    <Kicker y={262} text="ALAMOGORDO, NEW MEXICO · 1983" />
    <text x="540" y="392" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize="112" fill={IVORY}
      stroke={NAVY} strokeWidth="6" paintOrder="stroke fill">ATARI BURIED</text>
    <text x="540" y="516" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize="112" fill="url(#at-gold)"
      stroke={NAVY} strokeWidth="6" paintOrder="stroke fill" filter="url(#at-glow)">700,000 GAMES.</text>
  </g>
);

const Scene0: React.FC<{f: number}> = ({f}) => (
  <g>
    <Desert f={f} />
    <Pit fill={0.35 + 0.5 * k01(f, 0, 120)} slab={0} />
    <Truck tilt={32} />
    <Stream f={f} />
    <Banker x={900} y={1250} scale={1.02} action="consider" stance="standing" held="card" gaze={-1} id="at-g0" gestureAt={8} />
  </g>
);

export const AtariShort: React.FC = () => {
  const f = useCurrentFrame();
  const stage = Math.max(0, B.filter((s) => f >= s).length - 1);
  const bf = f - B[stage];
  const len = (B[stage + 1] ?? END) - B[stage];
  const [sx, sy] = shake(f);

  // Camera: soft punch-in on every cut + slow push through the beat (Alux-style drift).
  const punch = stage > 0 ? 0.07 * Math.pow(1 - k01(bf, 0, 9), 2) : 0;
  const push = 0.06 * (bf / len);
  const wordPunch = stage === 0 ? 0.08 * easeOut(k01(f, at('games'), at('games') + 10)) : 0;
  const desert = stage === 0 || stage === 1 || stage === 7;
  const zoom = (desert ? 1.1 : 1) * (1 + punch + push + wordPunch);
  const [zx, zy] = desert ? [520, 1060] : [540, 960];
  const cam = `translate(${sx} ${sy}) translate(${zx} ${zy}) scale(${zoom}) translate(${-zx} ${-zy})`;

  let scene: React.ReactNode = null;
  let overlay: React.ReactNode = null; // titles/text outside the camera move
  if (stage === 0) {
    scene = <Scene0 f={f} />;
    overlay = <Hook />;
  } else if (stage === 1) { // concrete pours over the pile; the guide points
    const mx = interpolate(bf, [0, 14], [1150, 640], {...clamp, easing: easeOut});
    const top = at('top', B[1]);
    scene = (
      <g>
        <Desert f={f} />
        <Pit fill={0.85} slab={k01(bf, 10, 60)} />
        <Mixer x={mx} f={bf} />
        {bf > 12 && bf < 64 && <path d={`M${mx - 68} 1101 Q${mx - 78} 1130 ${mx - 70} 1152`} stroke="#8e8c88" strokeWidth="28" fill="none" strokeLinecap="round" />}
        <Banker x={170} y={1250} scale={1.02} action="point" stance="standing" held="letter" gaze={1} id="at-g1" gestureAt={at('concrete', B[1])} />
      </g>
    );
    overlay = (
      <g>
        <Title f={f} t={at('concrete', B[1])} y={400} size={86} text="UNDER CONCRETE" fill={IVORY} />
        <Title f={f} t={top + 6} y={560} size={150} text="WHY?" />
      </g>
    );
  } else if (stage === 2) { // rewind → 1976 purchase
    const warner = at('warner', B[2]);
    const rewinding = f < warner - 4;
    const year = Math.round(interpolate(bf, [4, 36], [1983, 1976], clamp));
    const check = easeOut(k01(f, warner - 4, warner + 10));
    const n28 = at('twenty-eight', B[2]);
    const amt = Math.round(28 * easeOut(k01(f, n28, n28 + 18)));
    scene = (
      <g>
        <Ground top="#12303a" mid="#0c1f28" bot="#060b10" glow={TEAL} f={f} />
        {rewinding && Array.from({length: 6}, (_, i) => (
          <rect key={i} x="0" y={((i * 330 + bf * 40) % 2100) - 120} width="1080" height={18 + rnd(i) * 34} fill={IVORY} opacity={0.05 + rnd(i + 2) * 0.07} />
        ))}
        {!rewinding && (
          <g>
            <g transform={`translate(${interpolate(check, [0, 1], [-900, 0])} 0) rotate(-4 400 900)`}>
              <rect x="80" y="740" width="600" height="290" rx="14" fill="#ece0c4" />
              <rect x="80" y="740" width="600" height="290" rx="14" fill="none" stroke={GOLD} strokeWidth="5" />
              <rect x="80" y="740" width="600" height="52" rx="14" fill="#1f3a3f" />
              <text x="110" y="776" fontFamily={FONT_SANS} fontWeight="700" fontSize="24" letterSpacing="3" fill={GOLD_LT}>WARNER COMMUNICATIONS</text>
              <text x="110" y="850" fontFamily={FONT_SANS} fontSize="22" letterSpacing="2" fill="#6a6450">PAY TO THE ORDER OF</text>
              <text x="110" y="906" fontFamily={FONT_SERIF} fontWeight="700" fontSize="52" fill="#1c2f33">Atari, Inc.</text>
              <rect x="420" y="930" width="236" height="62" rx="8" fill="#fbf6e8" stroke="#b49a63" strokeWidth="3" />
              <text x="538" y="973" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="32" fill="#1c2f33">$28,000,000</text>
              <path d="M110 980 q30 -30 60 0 t60 0 t60 0" stroke="#2b4247" strokeWidth="4" fill="none" />
            </g>
            <Floor y={1300} />
            <Banker x={860} y={1250} scale={1.02} action="present" stance="standing" held="document" gaze={-1} id="at-g2" gestureAt={at('bought', B[2])} />
          </g>
        )}
      </g>
    );
    overlay = rewinding ? (
      <g>
        <Kicker y={420} text="◀◀  REWIND" />
        <Title f={f} t={B[2]} y={620} size={220} text={`${year}`} />
      </g>
    ) : (
      <g>
        <Kicker y={300} text="1976 · WARNER BUYS ATARI" />
        {f >= n28 - 2 && <Title f={f} t={n28 - 2} y={520} size={190} text={`$${amt}M`} />}
      </g>
    );
  } else if (stage === 3) { // the boom: gold tower to $2B, crown on "empire"
    const tb = at('two-billion-dollar', B[3]);
    const g = easeOut(k01(f, tb - 10, tb + 16));
    const h = 40 + 460 * g;
    const emp = at('empire', B[3]);
    scene = (
      <g>
        <Ground top="#3a2c12" mid="#1d160b" bot="#080604" glow={GOLD} f={f} rays cy={760} />
        <Floor y={1300} />
        <rect x="200" y={1300 - 40} width="150" height="40" fill="#3b5f66" />
        <text x="275" y="1250" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="34" fill={IVORY}>$28M</text>
        <text x="275" y="1350" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="30" letterSpacing="3" fill={GOLD}>1976</text>
        <rect x="440" y={1300 - h} width="230" height={h} fill="url(#at-gold)" filter="url(#at-glow)" />
        {Array.from({length: Math.floor(h / 46)}, (_, i) => <path key={i} d={`M440 ${1300 - i * 46 - 46}H670`} stroke={GOLD_DK} strokeWidth="4" />)}
        <text x="555" y="1350" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="30" letterSpacing="3" fill={GOLD}>1982</text>
        {f >= emp && (
          <g transform={`translate(555 ${1300 - h - 70}) scale(${1 + 0.8 * Math.pow(1 - k01(f, emp, emp + 7), 3)})`} filter="url(#at-glow)">
            <path d="M-80 36 L-98 -44 L-44 0 L0 -62 L44 0 L98 -44 L80 36Z" fill="url(#at-gold)" />
            <rect x="-82" y="36" width="164" height="22" fill={GOLD_DK} />
          </g>
        )}
        <Banker x={860} y={1250} scale={1.02} action="point" stance="standing" held="document" gaze={-1} id="at-g3" gestureAt={tb} />
      </g>
    );
    overlay = (
      <g>
        <Kicker y={300} text="SIX YEARS LATER · 1982" />
        {g > 0.05 && <Title f={f} t={tb - 8} y={470} size={124} text={`$${(2 * g).toFixed(g < 1 ? 1 : 0)} BILLION`} />}
      </g>
    );
  } else if (stage === 4) { // the rush: calendar pages tear off, stopwatch spins
    const torn = Math.min(5, Math.floor(Math.max(0, bf - 4) / 9));
    const et = at('et', B[4]);
    scene = (
      <g>
        <Ground top="#1d2240" mid="#12152a" bot="#06070f" glow="#8f9ad6" f={f} />
        <Floor y={1300} />
        <g transform="translate(330 900)">
          <rect x="-190" y="-220" width="380" height="440" rx="18" fill="#ece0c4" />
          <rect x="-190" y="-220" width="380" height="104" rx="18" fill={OX} />
          <rect x="-190" y="-220" width="380" height="440" rx="18" fill="none" stroke={GOLD} strokeWidth="5" />
          <text x="0" y="-150" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize="52" fill={IVORY}>1982</text>
          <text x="0" y="-30" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="34" letterSpacing="4" fill="#6a6450">WEEK</text>
          <text x="0" y="150" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize="190" fill="#1c2f33">{Math.min(6, torn + 1)}</text>
          {Array.from({length: torn}, (_, i) => {
            const tt = k01(bf, 4 + i * 9 + 9, 4 + i * 9 + 24);
            return tt < 1 ? (
              <g key={i} transform={`translate(${tt * 700} ${-tt * 500}) rotate(${tt * 80})`} opacity={1 - tt}>
                <rect x="-190" y="-116" width="380" height="336" fill="#ece0c4" stroke="#b49a63" strokeWidth="3" />
                <text x="0" y="150" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize="190" fill="#1c2f33">{i + 1}</text>
              </g>
            ) : null;
          })}
        </g>
        <g transform="translate(790 800)" filter="url(#at-glow)">
          <rect x="-24" y="-176" width="48" height="36" rx="8" fill={GOLD_DK} />
          <circle r="150" fill="#fbf6e8" stroke={GOLD} strokeWidth="9" />
          {Array.from({length: 12}, (_, i) => <path key={i} d="M0 -132V-116" stroke="#1c2f33" strokeWidth="5" transform={`rotate(${i * 30})`} />)}
          <path d="M0 0 L0 -118" stroke={OX_LT} strokeWidth="9" strokeLinecap="round" transform={`rotate(${bf * 24})`} />
          <circle r="12" fill="#1c2f33" />
        </g>
        {f >= et && (
          <g transform={`translate(${interpolate(f, [et, et + 9], [1300, 760], {...clamp, easing: easeOut})} 1130) rotate(7)`}>
            <rect x="-120" y="-110" width="240" height="196" rx="14" fill="#1d2530" />
            <rect x="-120" y="-110" width="240" height="196" rx="14" fill="none" stroke={GOLD_LT} strokeWidth="4" />
            <rect x="-96" y="-88" width="192" height="112" rx="6" fill="#d9864a" />
            <text x="0" y="-8" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize="78" fill="#1c2f33">E.T.</text>
            <text x="0" y="62" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="22" letterSpacing="3" fill={GOLD_LT}>MOVIE GAME</text>
          </g>
        )}
      </g>
    );
    overlay = (
      <g>
        <Kicker y={300} text="RUSHED FOR CHRISTMAS" />
        <Title f={f} t={at('six', B[4])} y={470} size={104} text="UNDER 6 WEEKS" />
      </g>
    );
  } else if (stage === 5) { // the flop: break-even meter stalls, unsold stack topples
    const flop = at('flopped', B[5]);
    const fillP = 0.4 * easeOut(k01(bf, 6, 60));
    const fall = easeOut(k01(f, flop, flop + 14));
    scene = (
      <g>
        <Ground top="#3a1414" mid="#230b0d" bot="#0b0405" glow={OX_LT} f={f} />
        <Floor y={1300} />
        <g transform="translate(0 40)">
          <text x="120" y="610" fontFamily={FONT_SANS} fontWeight="700" fontSize="30" letterSpacing="3" fill={IVORY}>SALES</text>
          <text x="960" y="610" textAnchor="end" fontFamily={FONT_SANS} fontWeight="700" fontSize="30" letterSpacing="3" fill={GOLD}>BREAK-EVEN · 4,000,000</text>
          <rect x="120" y="636" width="840" height="64" rx="32" fill="#1a0709" stroke={GOLD} strokeWidth="4" />
          <rect x="130" y="646" width={820 * fillP} height="44" rx="22" fill={OX_LT} />
          <path d="M950 620 V716" stroke={GOLD_LT} strokeWidth="6" strokeDasharray="10 8" />
        </g>
        <g transform={`rotate(${fall * 58} 800 1300)`}>
          {Array.from({length: 6}, (_, i) => (
            <g key={i}>
              <rect x="690" y={1226 - i * 74} width="220" height="70" rx="6" fill={i % 2 ? '#2b4a5e' : '#7c6a4c'} />
              <rect x="690" y={1226 - i * 74} width="220" height="70" rx="6" fill="none" stroke={GOLD_LT} strokeWidth="3" opacity=".7" />
              <text x="800" y={1272 - i * 74} textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="28" letterSpacing="4" fill={IVORY}>UNSOLD</text>
            </g>
          ))}
        </g>
        <Banker x={270} y={1250} scale={1.02} action="consider" stance="standing" held="card" gaze={1} id="at-g5" gestureAt={B[5]} />
      </g>
    );
    overlay = <Title f={f} t={flop} y={500} size={210} text="FLOP." fill="url(#at-ox)" />;
  } else if (stage === 6) { // the loss: characterless metaphor (Alux alternates)
    const lost = at('lost', B[6]);
    const k = easeOut(k01(f, lost, at('year', B[6])));
    const pts = [[140, 760], [300, 720], [440, 800], [580, 880], [720, 1060], [860, 1320], [980, 1700]];
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join('');
    scene = (
      <g>
        <Ground top="#2a0d0f" mid="#170608" bot="#050203" glow={OX_LT} f={f} cy={1100} />
        {[760, 900, 1040, 1180, 1320].map((y) => <path key={y} d={`M100 ${y}H980`} stroke={GOLD} opacity=".12" strokeWidth="2" />)}
        <path d={d} fill="none" stroke={OX_LT} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" filter="url(#at-glow)"
          strokeDasharray="1800" strokeDashoffset={1800 * (1 - k01(bf, 0, 40))} />
        {Array.from({length: 10}, (_, i) => {
          const t = ((bf + i * 11) % 60) / 60;
          return <g key={i} transform={`translate(${160 + rnd(i) * 760} ${760 + t * 1000}) rotate(${t * 400})`} opacity={1 - t}>
            <circle r="32" fill="url(#at-gold)" /><circle r="22" fill="none" stroke={GOLD_DK} strokeWidth="4" /></g>;
        })}
      </g>
    );
    overlay = (
      <g>
        <Kicker y={300} text="1983 · ONE YEAR" />
        {f >= lost - 2 && <Title f={f} t={lost - 2} y={500} size={180} text={`−$${Math.round(536 * k)}M`} fill="url(#at-ox)" />}
      </g>
    );
  } else { // 2014: the dig at dawn — then dissolve back into frame 0
    const found = at('found', B[7]);
    const y14 = at('2014', B[7]);
    scene = (
      <g>
        <Desert f={f} dawn />
        <Pit fill={0.85} slab={1} crack={k01(f, at('diggers', B[7]), at('diggers', B[7]) + 14)} />
        <Excavator p={k01(bf, 0, len - LOOP)} />
        {f >= found && Array.from({length: 10}, (_, i) => {
          const t = k01(f, found + i, found + i + 30);
          return <Cart key={i} x={560 + (rnd(i) - 0.5) * 500 * t} y={1140 - 420 * t + 380 * t * t} rot={t * 400} s={0.72} c={LABELS[i % 5]} />;
        })}
        <Banker x={150} y={1250} scale={1.02} action="point" stance="standing" held="letter" gaze={1} id="at-g7" gestureAt={found} />
      </g>
    );
    overlay = (
      <g>
        <Kicker y={300} text="31 YEARS LATER" op={k01(f, y14, y14 + 6)} />
        <Title f={f} t={y14} y={470} size={180} text="2014" />
        <Title f={f} t={found} y={610} size={110} text="FOUND." fill={IVORY} />
      </g>
    );
  }

  const loopIn = k01(f, END - LOOP, END - 1); // seamless loop into the exact frame-0 picture
  const phrase = phrases.find((p: any) => f >= p.start && f < p.end && f < END - LOOP);

  return (
    <AbsoluteFill style={{background: NAVY}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <g transform={cam}>{scene}</g>
        {overlay}
        {loopIn > 0 && (
          <g opacity={loopIn}>
            <g transform="translate(520 1060) scale(1.1) translate(-520 -1060)"><Scene0 f={0} /></g>
            <Hook />
          </g>
        )}
        {/* Aurelis lockup — same as every Aurelis Short */}
        <image href={staticFile('emblem.png')} x="72" y="73" width="90" height="90" />
        <text x="180" y="119" fontFamily={FONT_SERIF} fontSize="39" letterSpacing="1" fill={GOLD}>Aurelis</text>
        <text x="182" y="151" fontFamily={FONT_SANS} fontSize="16" letterSpacing="2" fill="#d9d2bf">HOW EMPIRES DIE</text>
        {/* soft gold flash on each cut */}
        {stage > 0 && bf < 5 && <rect width="1080" height="1920" fill={GOLD_LT} opacity={0.18 * (1 - bf / 5)} />}
      </svg>

      {/* Alux-style caption pill: single line, all caps, one highlighted word (Aurelis gold) */}
      {phrase && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1400, display: 'flex', justifyContent: 'center'}}>
          <div style={{display: 'flex', gap: 16, padding: '14px 28px', borderRadius: 16, background: 'rgba(11,14,19,.9)',
            border: '2px solid rgba(227,178,60,.55)', boxShadow: '0 8px 30px rgba(0,0,0,.45)'}}>
            {phrase.words.map((w: any, i: number) => {
              const active = f >= w.startFrame && (i === phrase.words.length - 1 || f < phrase.words[i + 1].startFrame);
              return <span key={i} style={{fontFamily: FONT_SANS, fontWeight: 700, fontSize: 54, letterSpacing: 1, textTransform: 'uppercase',
                color: active ? GOLD : IVORY, textShadow: active ? '0 0 18px rgba(227,178,60,.55)' : 'none'}}>{w.word}</span>;
            })}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
