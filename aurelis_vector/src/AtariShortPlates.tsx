import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Banker} from './Banker';
import {FONT_SANS, FONT_SERIF} from './theme';
import {
  B, END, LOOP, GOLD, GOLD_LT, IVORY, OX_LT, NAVY, LABELS,
  Cart, Defs, Hook, Kicker, Title, at, clamp, easeOut, k01, phrases, rnd, shake,
} from './AtariShort';

// Option A test: the same Atari Short (timing, script, titles, captions, guide, loop)
// over AI-illustrated scene plates (fal FLUX, commercial licence; prompts and seeds in
// public/plates/atari/manifest.json, generator gen_scene_plates.py). The plates carry
// the illustration richness; Remotion adds the camera move, animated overlays and brand.
const PLATES = ['hook', 'concrete', 'buy', 'boom', 'rush', 'flop', 'loss', 'dig'];

// Per-beat Ken Burns: [scaleFrom, scaleTo, originX, originY] — push toward the subject.
const MOVES: [number, number, number, number][] = [
  [1.08, 1.18, 540, 1250], // hook: push into the pit
  [1.06, 1.16, 540, 1100], // concrete: down into the pour
  [1.10, 1.02, 540, 1150], // buy: pull back from the desk
  [1.02, 1.12, 540, 700],  // boom: rise toward the tower
  [1.04, 1.14, 420, 1250], // rush: push toward the clock
  [1.12, 1.04, 540, 900],  // flop: pull back down the aisle
  [1.04, 1.16, 900, 1400], // loss: follow the line down
  [1.06, 1.16, 540, 1250], // dig: push into the excavation
];

const Plate: React.FC<{i: number; p: number; punch?: number}> = ({i, p, punch = 0}) => {
  const [a, b, ox, oy] = MOVES[i];
  const s = (a + (b - a) * p) * (1 + punch);
  return (
    <g transform={`translate(${ox} ${oy}) scale(${s}) translate(${-ox} ${-oy})`}>
      <image href={staticFile(`plates/atari/${PLATES[i]}.png`)} x="0" y="0" width="1080" height="1920" preserveAspectRatio="xMidYMid slice" />
    </g>
  );
};

// Seat the flat-vector guide into painted plates: slight darken to the plate's key,
// a warm gold rim glow (brand rim light), and a soft contact shadow under the feet.
const GuideFx: React.FC<{x: number; children: React.ReactNode}> = ({x, children}) => (
  <g>
    <defs>
      <filter id="pl-guide" x="-20%" y="-10%" width="140%" height="120%">
        <feComponentTransfer in="SourceGraphic" result="dim">
          <feFuncR type="linear" slope=".86" /><feFuncG type="linear" slope=".84" /><feFuncB type="linear" slope=".82" />
        </feComponentTransfer>
        {/* one-sided rim: the thin sliver of the silhouette the light hits (upper-right) */}
        <feOffset in="SourceAlpha" dx="-5" dy="4" result="off" />
        <feComposite in="SourceAlpha" in2="off" operator="out" result="edge" />
        <feFlood floodColor="#f0cf79" floodOpacity=".62" /><feComposite in2="edge" operator="in" result="rimc" />
        <feGaussianBlur in="rimc" stdDeviation="1.2" result="rim" />
        <feMerge><feMergeNode in="dim" /><feMergeNode in="rim" /></feMerge>
      </filter>
    </defs>
    <ellipse cx={x} cy="1832" rx="150" ry="22" fill="#000" opacity=".5" filter="url(#at-soft)" />
    <g filter="url(#pl-guide)">{children}</g>
  </g>
);

// Floating gold dust — ties every plate together and keeps the frame alive.
const Dust: React.FC<{f: number; n?: number; color?: string}> = ({f, n = 26, color = GOLD_LT}) => (
  <g>
    {Array.from({length: n}, (_, i) => (
      <circle key={i} cx={(rnd(i) * 1080 + Math.sin(f / 40 + i) * 30)} cy={(rnd(i + 40) * 1920 - f * (0.5 + rnd(i + 3)) + 3840) % 1920}
        r={1.5 + rnd(i + 9) * 3} fill={color} opacity={0.15 + 0.25 * Math.abs(Math.sin(f / 14 + i))} />
    ))}
  </g>
);

// Shade the top and bottom so titles and captions sit on calm ground (Alux does the same).
const Grade: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="pl-top" x1="0" y1="0" x2="0" y2="1"><stop stopColor={NAVY} stopOpacity=".85" /><stop offset="1" stopColor={NAVY} stopOpacity="0" /></linearGradient>
      <linearGradient id="pl-bot" x1="0" y1="0" x2="0" y2="1"><stop stopColor={NAVY} stopOpacity="0" /><stop offset="1" stopColor={NAVY} stopOpacity=".8" /></linearGradient>
      <radialGradient id="pl-vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".45" /></radialGradient>
    </defs>
    <rect width="1080" height="640" fill="url(#pl-top)" />
    <rect y="1380" width="1080" height="540" fill="url(#pl-bot)" />
    <rect width="1080" height="1920" fill="url(#pl-vig)" />
  </g>
);

// Cartridges tumbling into the pit on the hook plate — real motion from frame 0.
const Tumble: React.FC<{f: number}> = ({f}) => (
  <g>
    {Array.from({length: 12}, (_, i) => {
      const period = 34, t = ((f + 20 + i * (period / 12) * 1.9) % period) / period;
      const x = 470 + rnd(i) * 160 + t * 30, y = 930 + t * 620;
      return <Cart key={i} x={x} y={y} rot={t * 280 * (rnd(i + 1) > 0.5 ? 1 : -1)} s={0.55 + rnd(i + 2) * 0.25} c={LABELS[i % 5]} />;
    })}
  </g>
);

const Scene0: React.FC<{f: number}> = ({f}) => (
  <g>
    <Plate i={0} p={f / (B[1] - B[0])} />
    <Tumble f={f} />
    <Dust f={f} />
    <Grade />
  </g>
);

export const AtariShortPlates: React.FC = () => {
  const f = useCurrentFrame();
  const stage = Math.max(0, B.filter((s) => f >= s).length - 1);
  const bf = f - B[stage];
  const len = (B[stage + 1] ?? END) - B[stage];
  const [sx, sy] = shake(f);
  const p = bf / len;
  const punch = stage > 0 ? 0.06 * Math.pow(1 - k01(bf, 0, 9), 2) : 0;

  let fx: React.ReactNode = null;      // animated layer inside the camera
  let guide: React.ReactNode = null;   // recurring Aurelis guide
  let overlay: React.ReactNode = null; // titles, outside the camera

  if (stage === 0) {
    overlay = <Hook />;
    guide = <GuideFx x={175}><Banker x={175} y={1500} scale={1.12} action="consider" stance="standing" held="card" gaze={1} id="pl-g0" gestureAt={8} /></GuideFx>;
  } else if (stage === 1) {
    fx = Array.from({length: 10}, (_, i) => {
      const t = ((bf + i * 7) % 30) / 30;
      return <circle key={i} cx={520 + rnd(i) * 80} cy={700 + t * 600} r={6 + rnd(i + 1) * 8} fill="#9d9a94" opacity={0.7 * (1 - t)} />;
    });
    overlay = (
      <g>
        <Title f={f} t={at('concrete', B[1])} y={380} size={86} text="UNDER CONCRETE" fill={IVORY} />
        <Title f={f} t={at('top', B[1]) + 6} y={540} size={150} text="WHY?" />
      </g>
    );
  } else if (stage === 2) {
    const warner = at('warner', B[2]);
    const rewinding = f < warner - 4;
    const year = Math.round(interpolate(bf, [4, 36], [1983, 1976], clamp));
    const n28 = at('twenty-eight', B[2]);
    const amt = Math.round(28 * easeOut(k01(f, n28, n28 + 18)));
    fx = rewinding ? (
      <g>
        <rect width="1080" height="1920" fill={NAVY} opacity=".55" />
        {Array.from({length: 6}, (_, i) => (
          <rect key={i} x="0" y={((i * 330 + bf * 40) % 2100) - 120} width="1080" height={18 + rnd(i) * 34} fill={IVORY} opacity={0.06 + rnd(i + 2) * 0.08} />
        ))}
      </g>
    ) : null;
    if (!rewinding) guide = <GuideFx x={880}><Banker x={880} y={1500} scale={1.12} action="present" stance="standing" held="document" gaze={-1} id="pl-g2" gestureAt={at('bought', B[2])} /></GuideFx>;
    overlay = rewinding ? (
      <g>
        <Kicker y={420} text="◀◀  REWIND" />
        <Title f={f} t={B[2]} y={620} size={220} text={`${year}`} />
      </g>
    ) : (
      <g>
        <Kicker y={300} text="1976 · WARNER BUYS ATARI" />
        {f >= n28 - 2 && <Title f={f} t={n28 - 2} y={500} size={190} text={`$${amt}M`} />}
      </g>
    );
  } else if (stage === 3) {
    const tb = at('two-billion-dollar', B[3]);
    const g = easeOut(k01(f, tb - 10, tb + 16));
    fx = Array.from({length: 18}, (_, i) => {
      const t = ((bf * 0.9 + i * 9) % 90) / 90;
      return <g key={i} transform={`translate(${60 + rnd(i) * 960} ${-60 + t * 1500}) rotate(${t * 360})`} opacity={0.9}>
        <circle r={18 + rnd(i + 4) * 10} fill="url(#at-gold)" /></g>;
    });
    overlay = (
      <g>
        <Kicker y={300} text="SIX YEARS LATER · 1982" />
        {g > 0.05 && <Title f={f} t={tb - 8} y={470} size={124} text={`$${(2 * g).toFixed(g < 1 ? 1 : 0)} BILLION`} />}
      </g>
    );
  } else if (stage === 4) {
    const et = at('et', B[4]);
    fx = Array.from({length: 4}, (_, i) => {
      const tt = k01(bf, 6 + i * 16, 6 + i * 16 + 20);
      return tt > 0 && tt < 1 ? (
        <g key={i} transform={`translate(${160 + tt * 700} ${760 - tt * 520}) rotate(${tt * 70})`} opacity={1 - tt}>
          <rect x="-90" y="-70" width="180" height="150" fill="#ece0c4" stroke="#b49a63" strokeWidth="3" />
          <text x="0" y="40" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize="100" fill="#1c2f33">{i + 2}</text>
        </g>
      ) : null;
    });
    guide = f >= et ? (
      <g transform={`translate(${interpolate(f, [et, et + 9], [500, 0], {...clamp, easing: easeOut})} 0)`}>
        <g transform="translate(800 1180) rotate(7)">
          <rect x="-120" y="-110" width="240" height="196" rx="14" fill="#1d2530" />
          <rect x="-120" y="-110" width="240" height="196" rx="14" fill="none" stroke={GOLD_LT} strokeWidth="4" />
          <rect x="-96" y="-88" width="192" height="112" rx="6" fill="#d9864a" />
          <text x="0" y="-8" textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700" fontSize="78" fill="#1c2f33">E.T.</text>
          <text x="0" y="62" textAnchor="middle" fontFamily={FONT_SANS} fontWeight="700" fontSize="22" letterSpacing="3" fill={GOLD_LT}>MOVIE GAME</text>
        </g>
      </g>
    ) : null;
    overlay = (
      <g>
        <Kicker y={300} text="RUSHED FOR CHRISTMAS" />
        <Title f={f} t={at('six', B[4])} y={470} size={104} text="UNDER 6 WEEKS" />
      </g>
    );
  } else if (stage === 5) {
    const flop = at('flopped', B[5]);
    const fillP = 0.4 * easeOut(k01(bf, 6, 60));
    guide = <GuideFx x={230}><Banker x={230} y={1500} scale={1.12} action="consider" stance="standing" held="card" gaze={1} id="pl-g5" gestureAt={B[5]} /></GuideFx>;
    overlay = (
      <g>
        <g transform="translate(0 30)">
          <rect x="100" y="560" width="880" height="170" rx="24" fill={NAVY} opacity=".78" />
          <text x="140" y="620" fontFamily={FONT_SANS} fontWeight="700" fontSize="30" letterSpacing="3" fill={IVORY}>SALES</text>
          <text x="940" y="620" textAnchor="end" fontFamily={FONT_SANS} fontWeight="700" fontSize="30" letterSpacing="3" fill={GOLD}>BREAK-EVEN · 4,000,000</text>
          <rect x="140" y="644" width="800" height="56" rx="28" fill="#1a0709" stroke={GOLD} strokeWidth="4" />
          <rect x="150" y="654" width={780 * fillP} height="36" rx="18" fill={OX_LT} />
          <path d="M930 630 V714" stroke={GOLD_LT} strokeWidth="6" strokeDasharray="10 8" />
        </g>
        <Title f={f} t={flop} y={440} size={200} text="FLOP." fill="url(#at-ox)" />
      </g>
    );
  } else if (stage === 6) {
    const lost = at('lost', B[6]);
    const k = easeOut(k01(f, lost, at('year', B[6])));
    fx = Array.from({length: 12}, (_, i) => {
      const t = ((bf + i * 9) % 55) / 55;
      return <g key={i} transform={`translate(${520 + rnd(i) * 480} ${900 + t * 900}) rotate(${t * 400})`} opacity={1 - t}>
        <circle r="22" fill="url(#at-gold)" /></g>;
    });
    overlay = (
      <g>
        <Kicker y={300} text="1983 · ONE YEAR" />
        {f >= lost - 2 && <Title f={f} t={lost - 2} y={500} size={180} text={`−$${Math.round(536 * k)}M`} fill="url(#at-ox)" />}
      </g>
    );
  } else {
    const found = at('found', B[7]);
    const y14 = at('2014', B[7]);
    fx = f >= found ? Array.from({length: 12}, (_, i) => {
      const t = k01(f, found + i, found + i + 30);
      return <Cart key={i} x={560 + (rnd(i) - 0.5) * 560 * t} y={1330 - 480 * t + 440 * t * t} rot={t * 400} s={0.8} c={LABELS[i % 5]} />;
    }) : null;
    guide = <GuideFx x={175}><Banker x={175} y={1500} scale={1.12} action="point" stance="standing" held="letter" gaze={1} id="pl-g7" gestureAt={found} /></GuideFx>;
    overlay = (
      <g>
        <Kicker y={300} text="31 YEARS LATER" op={k01(f, y14, y14 + 6)} />
        <Title f={f} t={y14} y={470} size={180} text="2014" />
        <Title f={f} t={found} y={610} size={110} text="FOUND." fill={IVORY} />
      </g>
    );
  }

  const loopIn = k01(f, END - LOOP, END - 1);
  const phrase = phrases.find((ph: any) => f >= ph.start && f < ph.end && f < END - LOOP);

  return (
    <AbsoluteFill style={{background: NAVY}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <g transform={`translate(${sx} ${sy})`}>
          {stage === 0 ? <Scene0 f={f} /> : (
            <g>
              <Plate i={stage} p={p} punch={punch} />
              {fx}
              <Dust f={f} />
              <Grade />
            </g>
          )}
          {guide}
        </g>
        {overlay}
        {loopIn > 0 && (
          <g opacity={loopIn}>
            <Scene0 f={0} />
            <GuideFx x={175}><Banker x={175} y={1500} scale={1.12} action="consider" stance="standing" held="card" gaze={1} id="pl-gl" gestureAt={8} /></GuideFx>
            <Hook />
          </g>
        )}
        <image href={staticFile('emblem.png')} x="72" y="73" width="90" height="90" />
        <text x="180" y="119" fontFamily={FONT_SERIF} fontSize="39" letterSpacing="1" fill={GOLD}>Aurelis</text>
        <text x="182" y="151" fontFamily={FONT_SANS} fontSize="16" letterSpacing="2" fill="#d9d2bf">HOW EMPIRES DIE</text>
        {stage > 0 && bf < 5 && <rect width="1080" height="1920" fill={GOLD_LT} opacity={0.16 * (1 - bf / 5)} />}
      </svg>

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
