import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Banker} from './Banker';
import {FONT_SANS, FONT_SERIF} from './theme';
import {captionPhrases} from './captionPhrases';
import timing from './panAmShortTiming.json';

// "How Empires Die" Short — Pan American World Airways.
// Same idiom as MoneyLeaksShort: 1080x1920 SVG stage, recurring Aurelis guide,
// karaoke captions, seamless loop bar. All artwork is original vector.
const T = timing as any;
const gold = '#d6b473', paper = '#eadbb9', ink = '#0b141b', ox = '#a45445';
const lift = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const phrases = captionPhrases(T.captions, T.beats);

// Per-beat backgrounds so the composition changes every scene (Alux varies the
// GROUND per beat — warm skies, storm dark, oxblood alarm, sunburst — not one room).
type BG = {top: string; mid: string; bot: string; glow: string};
const BEAT_BG: BG[] = [
  {top: '#20363b', mid: '#122a30', bot: '#081014', glow: '#b28f58'}, // 0 hook — deep teal
  {top: '#2f5a7a', mid: '#1c3b57', bot: '#0b1a2a', glow: '#7fb0d6'}, // 1 empire — daytime sky blue
  {top: '#3a4f74', mid: '#213558', bot: '#0d1626', glow: '#d9b06a'}, // 2 jet — dusk cruise
  {top: '#2a2f3a', mid: '#191c26', bot: '#080a0f', glow: '#6f7684'}, // 3 storm — cold graphite
  {top: '#403225', mid: '#241a12', bot: '#0d0906', glow: '#c69a52'}, // 4 fire sale — amber ledger
  {top: '#3a1414', mid: '#230b0d', bot: '#0b0405', glow: '#c0453f'}, // 5 collapse — oxblood alarm
  {top: '#2b3a24', mid: '#182415', bot: '#080d06', glow: '#e3b23c'}, // 6 CTA — warm sunburst gold
];

// Alux-style skewed shape-wipe that sweeps across at each beat boundary.
const Wipe: React.FC<{bf: number; color: string}> = ({bf, color}) => {
  if (bf > 16) return null;
  const p = bf / 16; // 0..1 as the panel sweeps off to the right
  const x = interpolate(p, [0, 1], [-260, 1400]);
  return (
    <g opacity={bf < 15 ? 1 : 0}>
      <path d={`M${x} 0 L${x + 900} 0 L${x + 640} 1920 L${x - 260} 1920 Z`} fill={color} />
      <path d={`M${x + 900} 0 L${x + 936} 0 L${x + 676} 1920 L${x + 640} 1920 Z`} fill={gold} opacity=".5" />
    </g>
  );
};

// A slowly rotating meridian globe — the "flew everywhere" motif.
const Globe: React.FC<{f: number; cx: number; cy: number; r: number; routes?: boolean}> = ({f, cx, cy, r, routes = false}) => {
  const spin = (f * 0.5) % 360;
  const cities: [number, number][] = [
    [-70, -30], [-35, 20], [10, -10], [30, 45], [55, 5], [-20, 55], [45, -35],
  ];
  const pt = (lon: number, lat: number): [number, number] => {
    const a = ((lon + spin) * Math.PI) / 180, b = (lat * Math.PI) / 180;
    return [cx + r * Math.cos(b) * Math.sin(a), cy - r * Math.sin(b)];
  };
  const front = (lon: number) => Math.cos(((lon + spin) * Math.PI) / 180) > -0.15;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#152d33" stroke="#8f7a4f" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={r} fill="url(#pa-globe)" />
      {[-60, -30, 0, 30, 60].map((lat) => {
        const rr = r * Math.cos((lat * Math.PI) / 180), yy = cy - r * Math.sin((lat * Math.PI) / 180);
        return <ellipse key={lat} cx={cx} cy={yy} rx={rr} ry={rr * 0.16} fill="none" stroke="#3f5c5a" strokeWidth="2" opacity=".7" />;
      })}
      {[0, 30, 60, 90, 120, 150].map((lon) => (
        <path key={lon} d={`M${cx} ${cy - r} A ${r * Math.abs(Math.sin(((lon + spin) * Math.PI) / 180))} ${r} 0 0 ${front(lon) ? 1 : 0} ${cx} ${cy + r}`}
          fill="none" stroke="#3f5c5a" strokeWidth="2" opacity={front(lon) ? 0.7 : 0.28} />
      ))}
      {routes && cities.map((c, i) => {
        const nxt = cities[(i + 1) % cities.length];
        const [x1, y1] = pt(c[0], c[1]);
        const [x2, y2] = pt(nxt[0], nxt[1]);
        if (!front(c[0]) && !front(nxt[0])) return null;
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 60;
        const on = Math.max(0, Math.min(1, (f - 12) / 40));
        return <path key={i} d={`M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`} fill="none" stroke={gold} strokeWidth="3"
          opacity={0.85} strokeDasharray="380" strokeDashoffset={380 * (1 - on)} />;
      })}
      {routes && cities.map((c, i) => {
        const [x, y] = pt(c[0], c[1]);
        if (!front(c[0])) return null;
        return <circle key={i} cx={x} cy={y} r="6" fill={gold} stroke="#fff2d0" strokeWidth="1.5" opacity=".95" />;
      })}
      <circle cx={cx} cy={cy} r={r} fill="url(#pa-globe-shade)" />
    </g>
  );
};

// The winged Pan-Am-style emblem (original: gold ring + wing + globe grid, no real logo).
const WingedGlobe: React.FC<{cx: number; cy: number; s: number}> = ({cx, cy, s}) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`}>
    <circle r="70" fill="#12262c" stroke={gold} strokeWidth="5" />
    <ellipse rx="70" ry="26" fill="none" stroke="#c9ad72" strokeWidth="3" />
    <ellipse rx="34" ry="70" fill="none" stroke="#c9ad72" strokeWidth="3" />
    <path d="M-158 0 Q-95 -34 -74 0 Q-95 22 -158 6Z M158 0 Q95 -34 74 0 Q95 22 158 6Z" fill={gold} opacity=".92" stroke="#f0d39b" strokeWidth="2" />
    <path d="M-150 2H-80 M-136 10H-82 M150 2H80 M136 10H82" stroke="#12262c" strokeWidth="2" />
  </g>
);

// A stylised jumbo jet climbing to the right.
const Jet: React.FC<{f: number}> = ({f}) => {
  const climb = interpolate(f, [0, 60], [40, -30], {extrapolateRight: 'clamp'});
  return (
    <g transform={`translate(540 ${1050 + climb}) rotate(-9)`}>
      <path d="M-360 0 Q-420 -6 -360 -16 L230 -34 Q320 -34 348 -12 Q320 10 230 8 L-360 18 Q-420 6 -360 0Z" fill="#e7dcc2" stroke="#b49a63" strokeWidth="4" />
      <path d="M300 -18 Q352 -30 350 -6 Q352 14 300 6Z" fill="#2b4247" />
      <path d="M-120 -18 L60 -150 L118 -150 L20 -22Z" fill="#cdbf9d" stroke="#a5895457" strokeWidth="3" />
      <path d="M-120 12 L40 128 L96 128 L10 16Z" fill="#b9ab8a" stroke="#9a7f4e" strokeWidth="3" />
      <path d="M-360 -8 L-430 -78 L-388 -80 L-300 -16Z" fill="#c7b892" stroke="#9a7f4e" strokeWidth="3" />
      <path d="M-360 8 L-424 66 L-384 68 L-300 12Z" fill="#b3a483" stroke="#9a7f4e" strokeWidth="3" />
      {[-300, -230, -160, -90, -20, 50, 130, 210].map((x) => (
        <circle key={x} cx={x} cy={-4} r="7" fill="#3c545a" />
      ))}
      <path d="M-360 0 L228 -13" stroke={gold} strokeWidth="6" />
      <g opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 5))}>
        <path d="M-360 -6 Q-470 -8 -560 -2" stroke="#cdbf9d" strokeWidth="5" opacity=".4" fill="none" />
        <path d="M-360 6 Q-470 10 -560 14" stroke="#cdbf9d" strokeWidth="5" opacity=".4" fill="none" />
      </g>
    </g>
  );
};

// A falling stock line inside a framed chart — the collapse.
const CrashGraph: React.FC<{f: number}> = ({f}) => {
  const on = Math.max(0, Math.min(1, (f - 6) / 44));
  const pts = [[210, 980], [320, 940], [430, 990], [545, 900], [660, 1010], [770, 1120], [858, 1300]];
  const total = 1600;
  return (
    <g>
      <rect x="180" y="820" width="720" height="560" rx="22" fill="#12242a" stroke="#8a7247" strokeWidth="4" />
      {[900, 1000, 1100, 1200, 1300].map((y) => <path key={y} d={`M210 ${y}H872`} stroke="#22383d" strokeWidth="2" />)}
      <path d="M210 850V1340H872" stroke="#5c7069" strokeWidth="3" fill="none" />
      <path d={`M${pts.map((p) => p.join(' ')).join('L')}`} fill="none" stroke={ox} strokeWidth="8"
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray={total} strokeDashoffset={total * (1 - on)} />
      {on > 0.9 && (
        <g transform="translate(858 1300)">
          <path d="M0 0 L-26 -34 M0 0 L18 -38 M0 0 L34 -6" stroke={ox} strokeWidth="7" strokeLinecap="round" />
          <circle r="9" fill={ox} />
        </g>
      )}
      <text x="240" y="890" fontFamily={FONT_SANS} fontSize="24" letterSpacing="2" fill="#9aa79c">MARKET VALUE</text>
    </g>
  );
};

// A route card being stamped SOLD (the crown-jewel fire sale).
const SoldCard: React.FC<{x: number; y: number; label: string; buyer: string; show: number; f: number; rot: number}> = ({x, y, label, buyer, show, f, rot}) => {
  const drop = interpolate(f, [show, show + 8], [1.6, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opac = lift(f, show - 2, show + 4);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opac}>
      <rect x="-190" y="-124" width="380" height="248" rx="14" fill="#e7dcc2" stroke="#b49a63" strokeWidth="5" />
      <text x="0" y="-64" textAnchor="middle" fontFamily={FONT_SERIF} fontSize="40" fontWeight="700" fill="#1c2f33">{label}</text>
      <path d="M-150 -38H150" stroke="#b49a63" strokeWidth="3" />
      <text x="0" y="-4" textAnchor="middle" fontFamily={FONT_SANS} fontSize="22" letterSpacing="1" fill="#43554a">SOLD TO</text>
      <text x="0" y="34" textAnchor="middle" fontFamily={FONT_SANS} fontSize="30" fontWeight="700" fill="#2b4247">{buyer}</text>
      <g transform={`translate(78 74) rotate(-14) scale(${drop})`} opacity={f >= show ? 1 : 0}>
        <rect x="-96" y="-34" width="192" height="66" rx="9" fill="rgba(231,220,194,.7)" stroke={ox} strokeWidth="6" />
        <text x="0" y="18" textAnchor="middle" fontFamily={FONT_SANS} fontSize="44" fontWeight="800" letterSpacing="3" fill={ox}>SOLD</text>
      </g>
    </g>
  );
};

export const PanAmShort: React.FC = () => {
  const f = useCurrentFrame();
  const last = T.beats.length - 1;
  const idx = T.beats.findIndex((b: any, i: number) => f >= b.startFrame && f < (i === last ? T.totalFrames : b.endFrame));
  const stage = idx < 0 ? (f < T.beats[0].startFrame ? 0 : last) : idx;
  const beat = T.beats[Math.min(stage, last)];
  const phrase = phrases.find((p: any) => f >= p.start && f < p.end);
  const cta = stage >= last;
  const bf = f - beat.startFrame; // frames since this beat began
  const bg = BEAT_BG[Math.min(stage, BEAT_BG.length - 1)];
  // The recurring Banker guide MOVES per beat — different side, scale, pose and prop —
  // so the same character reads as doing different things across the story (never the
  // same static position/pose). null = characterless beat (pure metaphor carries it).
  const GUIDE: (null | {x: number; scale: number; action: 'present' | 'point' | 'consider' | 'write' | 'letter'; held: 'letter' | 'phone' | 'card' | 'document'; gaze: number})[] = [
    {x: 278, scale: 1.18, action: 'present', held: 'letter', gaze: 1},   // 0 hook — left, gestures to the globe on the right
    {x: 812, scale: 1.2, action: 'point', held: 'document', gaze: -1}, // 1 empire — right, points across the routes
    {x: 800, scale: 1.25, action: 'present', held: 'letter', gaze: -1},  // 2 jet — right, presenting the jet
    {x: 278, scale: 1.2, action: 'point', held: 'letter', gaze: 1},    // 3 storm — left, warning gesture
    {x: 820, scale: 1.14, action: 'consider', held: 'card', gaze: -1},  // 4 fire sale — right, hand-to-chin over the cards
    null,                                                               // 5 collapse — characterless (graph carries it)
    null,                                                               // 6 CTA — characterless card
  ];
  const guide = GUIDE[Math.min(stage, GUIDE.length - 1)];
  const showGuide = !!guide;
  const title = ['THE AIRLINE THAT OWNED THE SKY', 'EVERY CONTINENT BUT ONE', 'THE JUMBO JET ERA', 'THE STORM CLOSES IN', 'SELLING THE CROWN JEWELS', 'DECEMBER 4, 1991', 'ONE LESSON'][stage] || 'PAN AM';
  // Artwork eases in; the hook TITLE is hard-on at frame 0 (readable in the muted feed).
  const art = lift(f, 0, 22);

  return (
    <AbsoluteFill style={{background: ink, color: paper}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="pa-bg" x1="0" y1="0" x2=".4" y2="1">
            <stop stopColor={bg.top} /><stop offset=".5" stopColor={bg.mid} /><stop offset="1" stopColor={bg.bot} />
          </linearGradient>
          <radialGradient id="pa-glow"><stop stopColor={bg.glow} stopOpacity=".34" /><stop offset="1" stopColor={bg.glow} stopOpacity="0" /></radialGradient>
          <radialGradient id="pa-globe" cx=".38" cy=".34"><stop stopColor="#2c5157" /><stop offset=".7" stopColor="#173036" /><stop offset="1" stopColor="#0c1a1f" /></radialGradient>
          <radialGradient id="pa-globe-shade" cx=".38" cy=".34"><stop stopColor="#000" stopOpacity="0" /><stop offset=".72" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".5" /></radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#pa-bg)" />
        <ellipse cx="540" cy="1010" rx="700" ry="720" fill="url(#pa-glow)" />
        {/* Sunburst rays behind the CTA "reveal" beat (Alux device). */}
        {stage === 6 && Array.from({length: 24}, (_, i) => (
          <path key={i} d="M540 1010 L520 -200 L560 -200 Z" transform={`rotate(${i * 15 + (f % 360) * 0.2} 540 1010)`} fill={gold} opacity=".05" />
        ))}
        {/* Ground plane — shared floor, but its tint tracks the beat. */}
        <path d="M0 1470H1080V1920H0Z" fill={bg.bot} opacity=".55" />
        <path d="M0 1470H1080" stroke={bg.glow} strokeWidth="2" opacity=".25" />

        {/* Brand lockup */}
        <image href={staticFile('emblem.png')} x="72" y="73" width="90" height="90" />
        <text x="180" y="119" fontFamily={FONT_SERIF} fontSize="39" letterSpacing="1" fill={gold}>Aurelis</text>
        <text x="182" y="151" fontFamily={FONT_SANS} fontSize="16" letterSpacing="2" fill="#b3b8a7">HOW EMPIRES DIE</text>

        {/* Hook headline — HARD-ON at frame 0, no fade (readable silent in the feed). */}
        <text x="540" y="322" textAnchor="middle" fontFamily={FONT_SANS} fontSize="22" letterSpacing="5" fill={gold}>PAN AM · 1927–1991</text>
        {stage === 0 ? (
          <>
            <text x="540" y="410" textAnchor="middle" fontFamily={FONT_SERIF} fontSize="72" fontWeight="700" fill={paper}>IT OWNED</text>
            <text x="540" y="486" textAnchor="middle" fontFamily={FONT_SERIF} fontSize="72" fontWeight="700" fill={gold}>THE SKY.</text>
            <text x="540" y="548" textAnchor="middle" fontFamily={FONT_SANS} fontSize="30" letterSpacing="2" fill={paper}>THEN IT VANISHED.</text>
          </>
        ) : (
          <>
            <text x="540" y="440" textAnchor="middle" fontFamily={FONT_SERIF} fontSize={title.length > 22 ? 46 : 56} fontWeight="700" fill={cta ? gold : paper}>{title}</text>
            <path d="M280 484H800" stroke="#947a4d" strokeWidth="3" />
          </>
        )}

        <g opacity={art}>
          {/* Stage 0 — hook: winged globe emblem over slow globe */}
          {stage === 0 && (
            <g>
              <Globe f={f} cx={540} cy={1040} r={292} />
              <g transform={`translate(0 ${Math.sin(f / 16) * 6})`}>
                <WingedGlobe cx={540} cy={1040} s={1.24} />
              </g>
            </g>
          )}

          {/* Stage 1 — empire: globe with animated route arcs */}
          {stage === 1 && <Globe f={bf} cx={430} cy={1045} r={292} routes />}

          {/* Stage 2 — the jumbo jet */}
          {stage === 2 && (
            <g>
              <path d="M120 700H960" stroke="#2a4145" strokeWidth="2" opacity=".4" />
              <g transform="translate(0 -28) scale(1.12 1.12)" transform-origin="540 1050"><Jet f={bf} /></g>
              <text x="410" y="1325" textAnchor="middle" fontFamily={FONT_SANS} fontSize="26" letterSpacing="2" fill="#c9d0c0">FIRST TO FLY THE 747</text>
            </g>
          )}

          {/* Stage 3 — the storm closes in */}
          {stage === 3 && (
            <g>
              {/* storm motif shifted RIGHT so it clears the guide standing on the left */}
              <path d="M300 860q-40 0-40 42 0 40 46 40h300q54 0 54-52 0-46-52-48-4-58-70-58-52 0-64 46-30-8-48 18-16 24 8 46" transform="translate(300 0) scale(1.15)" fill="#20343a" stroke="#5c6f68" strokeWidth="5" />
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d={`M${700 + i * 62} 1090 l-30 70 h34 l-40 92`} fill="none" stroke={gold} strokeWidth="7" strokeLinecap="round" opacity={Math.abs(Math.sin((bf + i * 9) / 7))} />
              ))}
              {['OIL SHOCKS', 'DEREGULATION', 'FIERCE RIVALS'].map((w, i) => (
                <text key={w} x="740" y={1300 + i * 52} textAnchor="middle" fontFamily={FONT_SANS} fontSize="30" fontWeight="700" letterSpacing="1" fill={ox} opacity={lift(bf, i * 12 + 4, i * 12 + 16)}>{w}</text>
              ))}
            </g>
          )}

          {/* Stage 4 — fire sale: route cards stamped SOLD (no guide → centered) */}
          {stage === 4 && (
            <g>
              <SoldCard x={350} y={910} label="PACIFIC ROUTES" buyer="UNITED · 1985" show={8} f={bf} rot={-5} />
              <SoldCard x={500} y={1205} label="ATLANTIC ROUTES" buyer="UNITED · 1990" show={36} f={bf} rot={4} />
            </g>
          )}

          {/* Stage 5 — collapse: crashing value line + shutdown date (no guide → centered) */}
          {stage === 5 && (
            <g>
              <CrashGraph f={bf} />
              <g opacity={lift(bf, 44, 58)}>
                <rect x="300" y="1180" width="480" height="152" rx="14" fill="#1a0709" stroke={ox} strokeWidth="4" />
                <text x="540" y="1242" textAnchor="middle" fontFamily={FONT_SERIF} fontSize="48" fontWeight="700" fill={paper}>DEC 4, 1991</text>
                <text x="540" y="1298" textAnchor="middle" fontFamily={FONT_SANS} fontSize="26" letterSpacing="2" fill={gold}>LAST FLIGHT LANDED</text>
              </g>
            </g>
          )}

          {/* Stage 6 — CTA (standalone: series follow, no "full video" claim) */}
          {stage === 6 && (
            <g>
              <rect x="150" y="770" width="780" height="520" rx="34" fill="#1a2410" stroke="#b69a61" strokeWidth="5" opacity=".9" />
              <WingedGlobe cx={540} cy={900} s={0.95} />
              <text x="540" y="1042" textAnchor="middle" fontFamily={FONT_SERIF} fontSize="58" fontWeight="700" fill={gold}>NO GIANT IS FOREVER.</text>
              <path d="M300 1088H780" stroke="#8d754a" strokeWidth="3" />
              <text x="540" y="1156" textAnchor="middle" fontFamily={FONT_SANS} fontSize="30" letterSpacing="3" fill="#e7dcc2">HOW EMPIRES DIE</text>
              <text x="540" y="1204" textAnchor="middle" fontFamily={FONT_SANS} fontSize="26" letterSpacing="2" fill="#c7cbb8">A SERIES BY AURELIS</text>
            </g>
          )}

          <path d="M0 1394H1080" stroke="#a18a5a" strokeWidth="4" />
        </g>
        {/* Shape-wipe at each beat boundary (skip the very first frames of beat 0). */}
        {stage > 0 && <Wipe bf={bf} color={bg.mid} />}
      </svg>

      {/* Recurring Aurelis guide — repositioned + re-posed PER BEAT so it never sits
          in the same spot/pose twice. Slides in from its side as each beat opens. */}
      {showGuide && guide && (
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920">
            <g transform={`translate(${(guide.x < 540 ? -1 : 1) * (1 - lift(bf, 0, 14)) * 70} 0)`} opacity={lift(bf, 0, 12)}>
              <Banker x={guide.x} y={1363} scale={guide.scale} action={guide.action} stance="standing" held={guide.held} gaze={guide.gaze} id="panam-guide" gestureAt={beat?.startFrame || 0} />
            </g>
          </svg>
        </div>
      )}

      {/* Karaoke captions */}
      {phrase && (
        <div style={{position: 'absolute', left: 94, right: 94, bottom: 266, minHeight: 94, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center', padding: '16px 24px', borderRadius: 18, background: 'rgba(7,15,19,.89)', border: '1px solid rgba(214,180,115,.48)', fontFamily: FONT_SANS, fontSize: 38, fontWeight: 650, lineHeight: 1.25, boxShadow: '0 10px 40px rgba(0,0,0,.35)'}}>
          {phrase.words.map((w: any, i: number) => (
            <span key={`${w.startFrame}-${i}`} style={{color: f >= w.startFrame && f < w.endFrame ? gold : paper, marginRight: 10}}>{w.word}</span>
          ))}
        </div>
      )}

      {cta && (
        <div style={{position: 'absolute', top: 1330, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_SANS, fontSize: 31, fontWeight: 700, letterSpacing: 3, color: gold}}>FOLLOW FOR THE NEXT FALL ↓</div>
      )}

      {/* Seamless-loop progress bar */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, background: 'rgba(255,255,255,.14)'}}>
        <div style={{height: '100%', width: `${(f / (T.totalFrames - 1)) * 100}%`, background: gold}} />
      </div>
    </AbsoluteFill>
  );
};
