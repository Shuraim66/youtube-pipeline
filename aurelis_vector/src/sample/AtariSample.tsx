import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Banker} from '../Banker';
import {FONT_SANS, FONT_SERIF} from '../theme';
import {Defs, Hook, Kicker, Title, at, B, phrases} from '../AtariShort';
import {GuideBust, BustPose} from './GuideBust';
import {Carts3D, CartSpec, cartLabel} from './Carts3D';

// 11-second code-only sample of the Atari hook at a higher production level:
// multi-layer parallax sets, a close-up rig of the guide that acts, toon-shaded 3D
// cartridges (three.js), animated concrete, a real rewind (earlier shots replayed
// backwards), a 1976 boardroom with a CSS-3D cheque, and grain/vignette/bloom.
// No hosted APIs or AI models: everything is drawn and animated in code.
// Narration: the existing Atari mix, first 11 s (no model is run).

const GOLD = '#e3b23c', GOLD_LT = '#f0cf79', IVORY = '#f4efe6', OX = '#9b2c2c', NAVY = '#0b0e13';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const k01 = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const rnd = (i: number) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

// Shot boundaries (frames), keyed to the existing narration timing.
const S = {wide: 0, bust: 57, pit: B[1], why: 160, rewind: B[2], room: 242, end: 330};

// ---------------------------------------------------------------- camera / parallax
export type Cam = {x: number; y: number; zoom: number};
// A layer at `depth` 0..1 moves/zooms that fraction of the camera (0 = sky, 1 = foreground).
export const layer = (cam: Cam, depth: number, cx = 540, cy = 960) => {
  const z = 1 + (cam.zoom - 1) * depth;
  return `translate(${cx - cam.x * depth} ${cy - cam.y * depth}) scale(${z}) translate(${-cx} ${-cy})`;
};

// ---------------------------------------------------------------- desert set (wide)
const DUMP_REAR = {x: 668, y: 1040};           // where cartridges leave the tipped bed
const PIT = {x: 800, y: 1215, rx: 240, ry: 68};

const Sky: React.FC<{f: number; id: string}> = ({f, id}) => (
  <g>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#070d18" /><stop offset=".4" stopColor="#10233a" /><stop offset=".72" stopColor="#23344a" />
        <stop offset=".9" stopColor="#8a5a33" /><stop offset="1" stopColor="#d4914a" />
      </linearGradient>
      <mask id={`${id}-moon`} maskUnits="userSpaceOnUse" x="780" y="520" width="240" height="240">
        <circle cx="900" cy="640" r="42" fill="#fff" /><circle cx="919" cy="627" r="37" fill="#000" />
      </mask>
      <radialGradient id={`${id}-haze`}><stop stopColor="#f0cf79" stopOpacity=".5" /><stop offset="1" stopColor="#f0cf79" stopOpacity="0" /></radialGradient>
    </defs>
    <rect x="-200" width="1480" height="1000" fill={`url(#${id}-sky)`} />
    <path d="M-100 520 Q300 380 700 240 T1300 60" stroke="#9fb3d6" strokeWidth="140" opacity=".05" fill="none" />
    {Array.from({length: 70}, (_, i) => (
      <circle key={i} cx={rnd(i) * 1300 - 100} cy={rnd(i + 90) * 720} r={0.8 + rnd(i + 7) * 2}
        fill="#fff6dc" opacity={0.25 + 0.55 * Math.abs(Math.sin(f / (6 + rnd(i) * 8) + i))} />
    ))}
    <circle cx="900" cy="640" r="110" fill={`url(#${id}-haze)`} opacity=".35" />
    <circle cx="900" cy="640" r="42" fill="#ffe7a8" mask={`url(#${id}-moon)`} />
    <ellipse cx="540" cy="990" rx="900" ry="120" fill={`url(#${id}-haze)`} opacity=".9" />
  </g>
);

const Mesas: React.FC = () => (
  <g>
    <path d="M-200 1000 L-200 880 L-40 872 L10 800 L240 792 L280 870 L470 882 L520 836 L700 830 L730 880 L1000 872 L1030 820 L1180 816 L1210 870 L1300 876 L1300 1000Z" fill="#1a2332" />
    <path d="M10 800 L240 792 M520 836 L700 830 M1030 820 L1180 816" stroke={GOLD} strokeWidth="3" opacity=".55" />
    <path d="M240 792 L280 870 M700 830 L730 880" stroke="#2b3a50" strokeWidth="6" opacity=".6" />
  </g>
);

const Ridge: React.FC = () => (
  <path d="M-200 1010 L-200 930 Q150 900 420 935 T900 925 T1300 930 L1300 1010Z" fill="#12181f" />
);

const Ground: React.FC<{id: string}> = ({id}) => (
  <g>
    <defs>
      <linearGradient id={`${id}-sand`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#5a4230" /><stop offset=".25" stopColor="#3a2b20" /><stop offset="1" stopColor="#140f0b" />
      </linearGradient>
    </defs>
    <rect x="-200" y="990" width="1480" height="1100" fill={`url(#${id}-sand)`} />
    <path d="M-200 992 H1280" stroke={GOLD_LT} strokeWidth="2" opacity=".35" />
    {/* tyre tracks leading to the pit */}
    <path d="M-100 1130 Q300 1100 600 1120 M-100 1165 Q300 1135 600 1152" stroke="#23190f" strokeWidth="12" fill="none" opacity=".7" />
    {Array.from({length: 40}, (_, i) => (
      <ellipse key={i} cx={rnd(i + 3) * 1400 - 150} cy={1010 + rnd(i + 11) * 800} rx={6 + rnd(i) * 22} ry={2 + rnd(i + 2) * 4} fill="#1d150e" opacity=".5" />
    ))}
  </g>
);

const PitHole: React.FC<{id: string}> = ({id}) => (
  <g>
    <defs>
      <radialGradient id={`${id}-pit`} cx=".5" cy=".35"><stop stopColor="#050403" /><stop offset=".7" stopColor="#140d08" /><stop offset="1" stopColor="#2e2016" /></radialGradient>
    </defs>
    <path d={`M${PIT.x - PIT.rx} ${PIT.y} Q${PIT.x - PIT.rx + 30} ${PIT.y - PIT.ry - 10} ${PIT.x} ${PIT.y - PIT.ry} Q${PIT.x + PIT.rx - 20} ${PIT.y - PIT.ry + 5} ${PIT.x + PIT.rx} ${PIT.y} Q${PIT.x + PIT.rx - 40} ${PIT.y + PIT.ry + 8} ${PIT.x} ${PIT.y + PIT.ry} Q${PIT.x - PIT.rx + 30} ${PIT.y + PIT.ry} ${PIT.x - PIT.rx} ${PIT.y}Z`} fill={`url(#${id}-pit)`} />
    <path d={`M${PIT.x - PIT.rx} ${PIT.y} Q${PIT.x - PIT.rx + 30} ${PIT.y - PIT.ry - 10} ${PIT.x} ${PIT.y - PIT.ry} Q${PIT.x + PIT.rx - 20} ${PIT.y - PIT.ry + 5} ${PIT.x + PIT.rx} ${PIT.y}`} fill="none" stroke="#7a5a3a" strokeWidth="6" />
    <path d={`M${PIT.x + 40} ${PIT.y - PIT.ry + 2} Q${PIT.x + PIT.rx - 20} ${PIT.y - PIT.ry + 5} ${PIT.x + PIT.rx} ${PIT.y}`} fill="none" stroke={GOLD_LT} strokeWidth="4" opacity=".7" />
    {/* spoil heap behind the pit */}
    <path d={`M${PIT.x + 120} ${PIT.y - PIT.ry + 4} Q${PIT.x + 230} ${PIT.y - 170} ${PIT.x + 340} ${PIT.y - 40} L${PIT.x + 340} ${PIT.y - PIT.ry + 10}Z`} fill="#2c2017" />
    <path d={`M${PIT.x + 150} ${PIT.y - 110} Q${PIT.x + 230} ${PIT.y - 170} ${PIT.x + 300} ${PIT.y - 90}`} stroke={GOLD} strokeWidth="3" fill="none" opacity=".5" />
  </g>
);

export const Wheel: React.FC<{cx: number; cy: number; r?: number}> = ({cx, cy, r = 44}) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#0c0f13" />
    <circle cx={cx} cy={cy} r={r * 0.55} fill="#3b4450" />
    <circle cx={cx} cy={cy} r={r * 0.2} fill="#9aa3ad" />
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <circle key={a} cx={cx + Math.cos((a * Math.PI) / 180) * r * 0.38} cy={cy + Math.sin((a * Math.PI) / 180) * r * 0.38} r={3} fill="#1b2027" />
    ))}
    <path d={`M${cx + r * 0.2} ${cy - r * 0.95} A${r} ${r} 0 0 1 ${cx + r * 0.95} ${cy - r * 0.2}`} stroke={GOLD_LT} strokeWidth="4" fill="none" opacity=".8" />
  </g>
);

// Heavy 1980s dump truck facing left. The bed is hinged at the rear axle and lifted by a
// telescopic ram (positive SVG rotation about the rear hinge raises the front); the
// tailgate hangs open from its top hinge so cartridges slide out toward the pit.
const HINGE = {x: 660, y: 1052};
const Truck: React.FC<{f: number; id: string}> = ({f, id}) => {
  const tilt = 31 + Math.sin(f / 9) * 0.6; // hydraulic shudder
  const rad = (tilt * Math.PI) / 180;
  const onBed = (bx: number, by: number) => ({ // bed-local point -> world
    x: HINGE.x + (bx - HINGE.x) * Math.cos(rad) - (by - HINGE.y) * Math.sin(rad),
    y: HINGE.y + (bx - HINGE.x) * Math.sin(rad) + (by - HINGE.y) * Math.cos(rad),
  });
  const ram = onBed(345, HINGE.y);
  const base = {x: 300, y: 1066};
  const seg = (t: number) => ({x: base.x + (ram.x - base.x) * t, y: base.y + (ram.y - base.y) * t});
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-cab`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c9534a" /><stop offset=".55" stopColor={OX} /><stop offset="1" stopColor="#521818" /></linearGradient>
        <linearGradient id={`${id}-bed`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a58d5e" /><stop offset=".55" stopColor="#7a6746" /><stop offset="1" stopColor="#4b3f2c" /></linearGradient>
        <linearGradient id={`${id}-chrome`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#5d6670" /><stop offset=".45" stopColor="#dfe3e6" /><stop offset="1" stopColor="#6d7680" /></linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#3a5670" /><stop offset="1" stopColor="#101c2a" /></linearGradient>
        <linearGradient id={`${id}-beam`} x1="1" y1="0" x2="0" y2="0"><stop stopColor="#fff2c8" stopOpacity=".55" /><stop offset="1" stopColor="#fff2c8" stopOpacity="0" /></linearGradient>
        <clipPath id={`${id}-bedclip`}><rect x="287" y="880" width="370" height="170" /></clipPath>
      </defs>

      {/* headlight beam (volumetric) */}
      <path d="M40 1008 L-300 915 L-300 1125Z" fill={`url(#${id}-beam)`} />

      {/* exhaust stack + drifting smoke (behind the cab) */}
      {Array.from({length: 5}, (_, i) => {
        const t = ((f + i * 12) % 60) / 60;
        return <circle key={i} cx={272 + t * 60 + Math.sin(t * 6 + i) * 8} cy={836 - t * 150} r={10 + t * 26} fill="#8c8a86" opacity={0.3 * (1 - t)} />;
      })}
      <rect x="264" y="840" width="14" height="222" rx="4" fill={`url(#${id}-chrome)`} />
      <path d="M262 842 L282 832 L282 846 L262 850Z" fill="#3b4450" />

      {/* chassis rail + fuel tank + mud flap */}
      <rect x="30" y="1058" width="660" height="24" rx="5" fill="#161b21" />
      <path d="M30 1058 H690" stroke="#3b4450" strokeWidth="3" />
      <rect x="180" y="1072" width="84" height="34" rx="16" fill={`url(#${id}-chrome)`} />
      <path d="M672 1080 L700 1080 L704 1136 L676 1136Z" fill="#0c0f13" />

      {/* telescopic hydraulic ram (three stages) */}
      <path d={`M${base.x} ${base.y} L${seg(0.45).x} ${seg(0.45).y}`} stroke="#3b4450" strokeWidth="24" strokeLinecap="round" />
      <path d={`M${seg(0.4).x} ${seg(0.4).y} L${seg(0.75).x} ${seg(0.75).y}`} stroke="#8a939d" strokeWidth="17" strokeLinecap="round" />
      <path d={`M${seg(0.7).x} ${seg(0.7).y} L${ram.x} ${ram.y}`} stroke={`url(#${id}-chrome)`} strokeWidth="11" strokeLinecap="round" />

      {/* dump body, rotated about the rear hinge */}
      <g transform={`rotate(${tilt} ${HINGE.x} ${HINGE.y})`}>
        {/* load sliding toward the open tailgate (clipped to the body) */}
        <g clipPath={`url(#${id}-bedclip)`}>
          {Array.from({length: 14}, (_, i) => {
            const bx = 470 + (i % 5) * 38 + rnd(i + 60) * 10 + Math.min(12, (f % 30) * 0.4), by = 1020 - Math.floor(i / 5) * 34 - rnd(i + 61) * 8;
            return (
              <g key={i} transform={`translate(${bx} ${by}) rotate(${rnd(i + 62) * 50 - 25})`}>
                <rect x="-17" y="-20" width="34" height="40" rx="4" fill="#27313d" stroke="#0b0e13" strokeWidth="2.5" />
                <rect x="-12" y="-15" width="24" height="18" rx="2" fill={cartLabel(i)} />
              </g>
            );
          })}
        </g>
        {/* side panel with pressed ribs */}
        <path d="M285 896 L658 896 L658 1052 L300 1052 L285 1036Z" fill={`url(#${id}-bed)`} />
        {[335, 395, 455, 515, 575, 630].map((x) => (
          <g key={x}><rect x={x - 7} y="902" width="14" height="146" rx="3" fill="#5f5139" /><rect x={x - 7} y="902" width="4" height="146" fill="#c2a979" opacity=".5" /></g>
        ))}
        <rect x="280" y="886" width="382" height="16" rx="4" fill="#6b5a3e" />
        <path d="M280 886 H662" stroke={GOLD_LT} strokeWidth="5" />
        <path d="M290 1050 H658" stroke="#2e271b" strokeWidth="6" />
        {/* front wall / cab-protector lip */}
        <path d="M285 886 L262 870 L262 900 L285 912Z" fill="#5f5139" />
        {/* tailgate: hinged at the top rear corner, hangs plumb while the body tilts */}
        <g transform={`rotate(${-tilt} 664 892)`}>
          <rect x="656" y="892" width="18" height="150" rx="3" fill="#6b5a3e" stroke="#2e271b" strokeWidth="3" />
          <circle cx="664" cy="894" r="6" fill={`url(#${id}-chrome)`} />
        </g>
      </g>

      {/* hood + grille + bumper */}
      <path d="M36 988 L132 978 L132 1060 L36 1060Z" fill={`url(#${id}-cab)`} />
      <path d="M36 988 L132 978" stroke={GOLD_LT} strokeWidth="4" />
      <rect x="24" y="990" width="16" height="66" rx="3" fill={`url(#${id}-chrome)`} />
      {[1000, 1012, 1024, 1036, 1048].map((y) => <path key={y} d={`M26 ${y} H38`} stroke="#2b3138" strokeWidth="3" />)}
      <rect x="14" y="1056" width="60" height="18" rx="4" fill={`url(#${id}-chrome)`} />
      <rect x="40" y="996" width="22" height="18" rx="4" fill="#fff2c8" />
      <circle cx="46" cy="1005" r="26" fill="#fff2c8" opacity={0.3 + 0.05 * Math.sin(f / 3)} />
      <circle cx="120" cy="1052" r="5" fill="#ffb347" />

      {/* cab */}
      <path d="M132 1060 L132 978 L150 900 L262 896 L262 1060Z" fill={`url(#${id}-cab)`} />
      <path d="M132 978 L150 900 L262 896" stroke={GOLD_LT} strokeWidth="4" fill="none" />
      <path d="M140 972 L156 910 L184 909 L170 972Z" fill={`url(#${id}-glass)`} />
      <path d="M190 910 L250 908 L250 968 L190 970Z" fill={`url(#${id}-glass)`} />
      <path d="M196 914 L214 914 L200 966 L194 966Z" fill={IVORY} opacity=".22" />
      <path d="M150 986 H258 M152 986 V1052 M258 986 V1052" stroke="#4a1414" strokeWidth="3" fill="none" />
      <rect x="232" y="1000" width="18" height="6" rx="3" fill={`url(#${id}-chrome)`} />
      <rect x="170" y="1064" width="60" height="8" rx="2" fill="#3b4450" />
      {/* mirror */}
      <path d="M150 930 L118 918" stroke="#2b3138" strokeWidth="4" />
      <rect x="104" y="900" width="16" height="34" rx="3" fill="#1b2027" stroke={`url(#${id}-chrome)`} strokeWidth="3" />
      {/* amber cab lights */}
      {[170, 200, 230].map((x) => <circle key={x} cx={x} cy="892" r="4" fill="#ffb347" />)}
      {[420, 520, 620].map((x) => <circle key={x} cx={x} cy="1070" r="5" fill="#ffb347" />)}

      {/* wheels: steer axle + rear tandem */}
      {[92, 520, 616].map((cx) => <Wheel key={cx} cx={cx} cy={1095} />)}
    </g>
  );
};

const Foreground: React.FC<{id: string}> = ({id}) => (
  <g filter={`url(#${id}-dof)`}>
    <defs><filter id={`${id}-dof`}><feGaussianBlur stdDeviation="5" /></filter></defs>
    <path d="M-120 1920 L-120 1560 Q-40 1500 60 1540 Q150 1480 230 1560 L290 1640 L330 1920Z" fill="#07090c" />
    <path d="M60 1540 Q150 1480 230 1560" stroke={GOLD} strokeWidth="5" fill="none" opacity=".5" />
    <path d="M1200 1920 L1200 1600 Q1110 1560 1030 1610 Q960 1580 900 1650 L860 1920Z" fill="#07090c" />
    {Array.from({length: 14}, (_, i) => (
      <path key={i} d={`M${880 + i * 22} 1660 q${6 - rnd(i) * 12} -${60 + rnd(i + 1) * 70} ${14 - rnd(i + 2) * 28} -${110 + rnd(i + 3) * 60}`} stroke="#0d1014" strokeWidth="5" fill="none" />
    ))}
  </g>
);

// Parametric cartridge avalanche from the bed lip into the pit (world coordinates).
const streamCarts = (f: number, n = 18): CartSpec[] =>
  Array.from({length: n}, (_, i) => {
    const period = 30, t = ((f + 40 + i * (period / n) * 1.6) % period) / period;
    const ex = PIT.x - 110 + rnd(i + 5) * 190, ey = PIT.y - 10 + rnd(i + 8) * 30;
    const sx = DUMP_REAR.x + rnd(i) * 20, sy = DUMP_REAR.y + rnd(i + 1) * 20;
    return {
      x: sx + (ex - sx) * t + 40 * Math.sin(t * Math.PI) * (rnd(i + 2) - 0.3),
      y: sy + (ey - sy) * t * t - 60 * Math.sin(t * Math.PI) * rnd(i + 3),
      z: 10 + i, rx: t * 5 * (rnd(i + 4) - 0.5) * 2, ry: t * 6 * (rnd(i + 6) - 0.5) * 2, rz: t * 4 + i,
      s: 0.62 + rnd(i + 9) * 0.22, label: cartLabel(i),
    };
  });
const pileCarts = (n = 16): CartSpec[] =>
  Array.from({length: n}, (_, i) => ({
    x: PIT.x - 150 + rnd(i + 20) * 300, y: PIT.y - 10 + rnd(i + 21) * 36 - i * 1.4, z: -40 + i,
    rx: -1.1 + rnd(i + 22) * 0.6, ry: (rnd(i + 23) - 0.5) * 1.2, rz: rnd(i + 24) * 6, s: 0.6, label: cartLabel(i + 3),
  }));

// World → screen for the 3D layer, matching an SVG layer at `depth`.
const toScreen = (c: CartSpec, cam: Cam, depth: number): CartSpec => {
  const z = 1 + (cam.zoom - 1) * depth;
  return {...c, x: 540 - cam.x * depth + (c.x - 540) * z, y: 960 - cam.y * depth + (c.y - 960) * z, s: c.s * z};
};

// ---------------------------------------------------------------- SHOT 1: wide dump
const ShotWide: React.FC<{l: number; f: number}> = ({l, f}) => {
  const cam: Cam = {x: -22 + 18 * ease(k01(l, 0, 57)), y: 140 + 10 * ease(k01(l, 0, 57)), zoom: 1.1 + 0.07 * ease(k01(l, 0, 57))};
  const carts = [...pileCarts(), ...streamCarts(f)].map((c) => toScreen(c, cam, 0.6));
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <g transform={layer(cam, 0.05)}><Sky f={f} id="w" /></g>
        <g transform={layer(cam, 0.2)}><Mesas /></g>
        <g transform={layer(cam, 0.35)}><Ridge /></g>
        <g transform={layer(cam, 0.6)}><Ground id="w" /><PitHole id="w" /><Truck f={f} id="w" /></g>
      </svg>
      <Carts3D carts={carts} />
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <g transform={layer(cam, 1)}><Foreground id="w" /></g>
        <Dust f={f} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- SHOT 2: guide turns in shock
const bustPoseAt = (l: number, f: number): BustPose => {
  const turn = ease(k01(l, 14, 26));
  const blink = l > 46 && l < 52 ? Math.sin(((l - 46) / 6) * Math.PI) : 0;
  return {
    yaw: -0.58 + 0.63 * turn, gazeX: -8 + 8 * turn, gazeY: 6 - 6 * turn,
    shock: easeOut(k01(l, 18, 28)), frown: 0, blink,
    tilt: -5 + 7 * turn + noise2D('tilt', f / 40, 0) * 1.5, breath: Math.sin(f / 14) * 4,
  };
};

const ShotBust: React.FC<{l: number; f: number}> = ({l, f}) => {
  // Background: the same set, pushed in on the pit and defocused (the guide is in front).
  const bg: Cam = {x: 650 + 10 * l / 65, y: 250, zoom: 1.75};
  const carts = streamCarts(f, 12).map((c) => toScreen(c, bg, 0.6));
  const push = 1 + 0.05 * ease(k01(l, 0, 65)) + 0.04 * easeOut(k01(l, 18, 26)); // punch on the reaction
  return (
    <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 60%'}}>
      <AbsoluteFill style={{filter: 'blur(6px) brightness(.8)'}}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
          <g transform={layer(bg, 0.05)}><Sky f={f} id="b" /></g>
          <g transform={layer(bg, 0.2)}><Mesas /></g>
          <g transform={layer(bg, 0.6)}><Ground id="b" /><PitHole id="b" /><Truck f={f} id="b" /></g>
        </svg>
        <Carts3D carts={carts} />
      </AbsoluteFill>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <defs><radialGradient id="bust-glow"><stop stopColor={GOLD} stopOpacity=".28" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient></defs>
        <ellipse cx="760" cy="1100" rx="520" ry="620" fill="url(#bust-glow)" />
        <GuideBust x={600} y={1640} scale={1.5} id="bust2" pose={bustPoseAt(l, f)} />
        <Dust f={f} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- SHOT 3: top-down concrete
const PIT_TOP = {x: 540, y: 1080};
const topPile = (): CartSpec[] =>
  Array.from({length: 46}, (_, i) => {
    const a = rnd(i + 40) * Math.PI * 2, r = Math.sqrt(rnd(i + 41)) * 300;
    return {x: PIT_TOP.x + Math.cos(a) * r * 1.2, y: PIT_TOP.y + Math.sin(a) * r * 0.9, z: i,
      rx: (rnd(i + 42) - 0.5) * 0.5, ry: (rnd(i + 43) - 0.5) * 0.5, rz: rnd(i + 44) * 6.28, s: 1.05, label: cartLabel(i)};
  });

// Gooey (metaball) concrete that spreads from the pour point and swallows the pile.
const Concrete: React.FC<{p: number; f: number; id: string}> = ({p, f, id}) => {
  const blobs = Array.from({length: 48}, (_, i) => {
    const a = rnd(i + 70) * Math.PI * 2, d = Math.sqrt(rnd(i + 71)) * 330 * Math.min(1, p * 1.15);
    const grow = k01(p, rnd(i + 72) * 0.5, rnd(i + 72) * 0.5 + 0.4);
    return {x: 600 + Math.cos(a) * d * 1.2 + noise2D(`cx${i}`, f / 30, 0) * 10, y: 880 + (Math.sin(a) * d * 0.9 + d * 0.35), r: (55 + rnd(i + 73) * 70) * grow};
  });
  return (
    <g>
      <defs>
        <filter id={`${id}-goo`}>
          <feGaussianBlur stdDeviation="28" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -13" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
        <radialGradient id={`${id}-wet`} cx=".4" cy=".3"><stop stopColor="#c9c6bf" /><stop offset=".6" stopColor="#8e8b86" /><stop offset="1" stopColor="#5d5b58" /></radialGradient>
      </defs>
      <g filter={`url(#${id}-goo)`}>
        {blobs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#8f8c86" />)}
        {p > 0 && p < 0.97 && <rect x="578" y="-40" width="46" height={880} rx="22" fill="#9d9a94" />}
      </g>
      {/* wet sheen */}
      {blobs.slice(0, 14).map((b, i) => b.r > 30 && (
        <path key={i} d={`M${b.x - b.r * 0.5} ${b.y - b.r * 0.2} Q${b.x} ${b.y - b.r * 0.55} ${b.x + b.r * 0.45} ${b.y - b.r * 0.25}`} stroke="#d8d5ce" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".45" />
      ))}
    </g>
  );
};

const PitTop: React.FC<{id: string}> = ({id}) => (
  <g>
    <defs>
      <radialGradient id={`${id}-hole`} cx=".5" cy=".5"><stop stopColor="#0a0705" /><stop offset=".75" stopColor="#1a120c" /><stop offset="1" stopColor="#4a3525" /></radialGradient>
    </defs>
    <rect x="-200" y="-200" width="1480" height="2320" fill="#3a2b1f" />
    {Array.from({length: 120}, (_, i) => (
      <circle key={i} cx={rnd(i + 5) * 1300 - 100} cy={rnd(i + 6) * 2100 - 90} r={2 + rnd(i + 7) * 7} fill={i % 3 ? '#2b1f16' : '#4c3a2a'} />
    ))}
    <path d="M-100 1700 Q300 1600 600 1720 T1300 1680 M-100 1760 Q300 1660 600 1780 T1300 1740" stroke="#261a11" strokeWidth="26" fill="none" />
    <path d="M150 1040 Q170 720 540 700 Q930 700 950 1050 Q940 1420 540 1440 Q140 1420 150 1040Z" fill={`url(#${id}-hole)`} />
    <path d="M150 1040 Q170 720 540 700 Q930 700 950 1050" stroke={GOLD_LT} strokeWidth="5" fill="none" opacity=".45" />
  </g>
);

const ShotPit: React.FC<{l: number; f: number}> = ({l, f}) => {
  const rot = 3 * ease(k01(l, 0, 38));
  const zoom = 1.06 + 0.06 * ease(k01(l, 0, 38));
  const pour = k01(f, at('concrete', B[1]) - 12, S.why + 30);
  return (
    <AbsoluteFill style={{transform: `rotate(${rot}deg) scale(${zoom})`}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}><PitTop id="t" /></svg>
      <Carts3D carts={topPile()} />
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <Concrete p={pour} f={f} id="t" />
        {/* the mixer chute entering from the top edge */}
        <path d="M520 -40 L680 -40 L660 90 L540 90Z" fill="#6f6c68" />
        <path d="M680 -40 L660 90" stroke={GOLD_LT} strokeWidth="5" />
        <Dust f={f} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- SHOT 4: "Why?" close-up
const ShotWhy: React.FC<{l: number; f: number}> = ({l, f}) => {
  const pose: BustPose = {
    yaw: 0.22 - 0.1 * ease(k01(l, 8, 20)), gazeX: -6, gazeY: -6 + 3 * ease(k01(l, 8, 20)), shock: 0,
    frown: ease(k01(l, 2, 12)), blink: l > 28 && l < 33 ? Math.sin(((l - 28) / 5) * Math.PI) : 0,
    tilt: 6 * ease(k01(l, 2, 14)) + noise2D('t4', f / 40, 0) * 1.2, breath: Math.sin(f / 14) * 4,
  };
  const why = at('top', B[1]) + 6;
  return (
    <AbsoluteFill style={{transform: `scale(${1.04 + 0.04 * ease(k01(l, 0, 39))})`, transformOrigin: '50% 55%'}}>
      <AbsoluteFill style={{filter: 'blur(9px) brightness(.45) saturate(.8)'}}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
          <g transform={layer({x: 700, y: 260, zoom: 1.9}, 0.05)}><Sky f={f} id="y" /></g>
          <g transform={layer({x: 700, y: 260, zoom: 1.9}, 0.2)}><Mesas /></g>
          <g transform={layer({x: 700, y: 260, zoom: 1.9}, 0.6)}><Ground id="y" /><PitHole id="y" /></g>
        </svg>
      </AbsoluteFill>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <defs><radialGradient id="why-glow"><stop stopColor={GOLD} stopOpacity=".3" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient></defs>
        <ellipse cx="540" cy="1150" rx="560" ry="640" fill="url(#why-glow)" />
        {/* floating question marks (Alux device, Aurelis gold) */}
        {[[210, 820, 0], [880, 760, 7], [800, 1050, 13], [250, 1080, 4]].map(([x, y, d], i) => {
          const s = easeOut(k01(f, why - 6 + d, why + 4 + d));
          return s > 0 && (
            <text key={i} x={x} y={y + Math.sin(f / 10 + i) * 12} textAnchor="middle" fontFamily={FONT_SERIF} fontWeight="700"
              fontSize={90 + i * 18} fill={GOLD} opacity={0.85 * s} transform={`rotate(${(i % 2 ? 1 : -1) * 12} ${x} ${y})`}
              style={{filter: 'drop-shadow(0 0 14px rgba(227,178,60,.6))'}}>?</text>
          );
        })}
        <GuideBust x={540} y={1690} scale={1.55} id="bust4" pose={pose} />
        <Dust f={f} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- SHOT 6: 1976 boardroom
const Skyline: React.FC<{f: number}> = ({f}) => (
  <g>
    <rect x="160" y="300" width="760" height="720" fill="#0e1a2c" />
    <circle cx="760" cy="420" r="40" fill="#ffe7a8" opacity=".85" />
    {Array.from({length: 16}, (_, i) => {
      const w = 40 + rnd(i + 90) * 50, h = 160 + rnd(i + 91) * 420, x = 160 + i * 48;
      return (
        <g key={i}>
          <rect x={x} y={1020 - h} width={w} height={h} fill={i % 2 ? '#15243a' : '#1b2d46'} />
          {Array.from({length: Math.floor(h / 26)}, (_, r) => Array.from({length: Math.floor(w / 14)}, (_, c) => {
            const on = rnd(i * 100 + r * 10 + c) > 0.62 || (rnd(i * 7 + r + c) > 0.9 && Math.sin(f / 7 + r) > 0);
            return on ? <rect key={`${r}-${c}`} x={x + 4 + c * 14} y={1020 - h + 8 + r * 26} width="6" height="10" fill={GOLD_LT} opacity=".75" /> : null;
          }))}
        </g>
      );
    })}
  </g>
);

const Room: React.FC<{f: number}> = ({f}) => (
  <g>
    <defs>
      <linearGradient id="rm-wall" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#2a1a12" /><stop offset=".5" stopColor="#3b2619" /><stop offset="1" stopColor="#21150e" /></linearGradient>
    </defs>
    <rect x="-200" y="-100" width="1480" height="1500" fill="url(#rm-wall)" />
    {[-120, 60, 960, 1140].map((x) => <rect key={x} x={x} y="120" width="150" height="1100" rx="8" fill="none" stroke="#4d3322" strokeWidth="10" />)}
    <rect x="140" y="280" width="800" height="760" fill="#1c120c" />
    <Skyline f={f} />
    <path d="M540 280 V1040 M140 660 H940" stroke="#1c120c" strokeWidth="18" />
    <rect x="140" y="280" width="800" height="760" fill="none" stroke={GOLD} strokeWidth="6" opacity=".55" />
    {/* oxblood curtains */}
    <path d="M60 240 Q120 700 70 1100 L200 1100 Q170 700 200 240Z" fill="#6b1f1f" />
    <path d="M1020 240 Q960 700 1010 1100 L880 1100 Q910 700 880 240Z" fill="#5a1a1a" />
    <path d="M200 240 Q170 700 200 1100" stroke={GOLD} strokeWidth="4" opacity=".4" fill="none" />
  </g>
);

const Desk: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="dk-top" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#5a3522" /><stop offset="1" stopColor="#2a170e" /></linearGradient>
      <radialGradient id="dk-pool" cx=".3" cy=".3"><stop stopColor="#ffd98a" stopOpacity=".55" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient>
      <linearGradient id="dk-cone" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffe7a8" stopOpacity=".45" /><stop offset="1" stopColor="#ffe7a8" stopOpacity="0" /></linearGradient>
    </defs>
    <path d="M-100 1110 L1180 1110 L1260 1920 L-180 1920Z" fill="url(#dk-top)" />
    <path d="M-100 1110 H1180" stroke={GOLD_LT} strokeWidth="5" opacity=".7" />
    <ellipse cx="380" cy="1250" rx="540" ry="240" fill="url(#dk-pool)" />
    {/* brass banker's lamp + volumetric cone */}
    <path d="M150 860 L20 1250 L440 1250 L260 860Z" fill="url(#dk-cone)" />
    <path d="M140 860 Q200 800 270 860Z" fill="#b98a25" />
    <path d="M140 860 Q200 800 270 860" stroke={GOLD_LT} strokeWidth="4" fill="none" />
    <rect x="198" y="860" width="12" height="240" fill="#8a6a2c" />
    <ellipse cx="204" cy="1105" rx="70" ry="18" fill="#6e5222" />
    {/* fountain pen */}
    <path d="M760 1300 L960 1220" stroke="#111" strokeWidth="14" strokeLinecap="round" />
    <path d="M925 1234 L960 1220" stroke={GOLD} strokeWidth="14" strokeLinecap="round" />
  </g>
);

// CSS-3D cheque: slides across the desk in perspective and settles flat.
const Cheque: React.FC<{l: number}> = ({l}) => {
  const p = easeOut(k01(l, 4, 24));
  const sign = k01(l, 26, 50);
  return (
    <div style={{position: 'absolute', left: 130, top: 1120, width: 640, height: 300, perspective: 900}}>
      <div style={{width: '100%', height: '100%', transformOrigin: '50% 100%',
        transform: `translateX(${(1 - p) * 700}px) rotateX(${38 + (1 - p) * 20}deg) rotateZ(${-4 + (1 - p) * 10}deg)`,
        background: 'linear-gradient(160deg,#f6edd6,#e2d3b0)', borderRadius: 12, border: `4px solid ${GOLD}`,
        boxShadow: '0 30px 40px rgba(0,0,0,.55)', fontFamily: FONT_SANS, color: '#1c2f33', overflow: 'hidden'}}>
        <div style={{height: 52, background: '#1f3a3f', color: GOLD_LT, fontWeight: 700, fontSize: 24, letterSpacing: 3, padding: '12px 26px'}}>WARNER COMMUNICATIONS</div>
        <div style={{padding: '18px 26px 0', fontSize: 20, letterSpacing: 2, color: '#6a6450'}}>PAY TO THE ORDER OF</div>
        <div style={{padding: '2px 26px', fontFamily: FONT_SERIF, fontWeight: 700, fontSize: 50}}>Atari, Inc.</div>
        <div style={{position: 'absolute', right: 24, bottom: 26, padding: '8px 16px', background: '#fbf6e8', border: '2px solid #b49a63', borderRadius: 8, fontWeight: 700, fontSize: 32}}>$28,000,000</div>
        <svg width="260" height="70" style={{position: 'absolute', left: 24, bottom: 12}}>
          <path d="M6 44 q22 -34 44 0 t44 0 t44 -6 q18 -20 36 4 t40 0" fill="none" stroke="#1b3a8a" strokeWidth="4" strokeLinecap="round"
            strokeDasharray="320" strokeDashoffset={320 * (1 - sign)} />
        </svg>
      </div>
    </div>
  );
};

const ShotRoom: React.FC<{l: number; f: number}> = ({l, f}) => {
  const cam: Cam = {x: -30 + 40 * ease(k01(l, 0, 88)), y: 0, zoom: 1.0 + 0.06 * ease(k01(l, 0, 88))};
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <g transform={layer(cam, 0.25)}><Room f={f} /></g>
        <g transform={layer(cam, 0.55)}>
          <g style={{filter: 'drop-shadow(0 0 0 transparent)'}}>
            <Banker x={820} y={1215} scale={1.55} action="present" stance="standing" held="document" gaze={-1} id="rm-g" gestureAt={at('bought', B[2])} />
          </g>
        </g>
        <g transform={layer(cam, 0.9)}><Desk /></g>
      </svg>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${-cam.x * 0.9}px) scale(${1 + (cam.zoom - 1) * 0.9})`}}>
        <Cheque l={l} />
      </div>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute'}}><Dust f={f} n={30} /></svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- shared FX
export const Dust: React.FC<{f: number; n?: number}> = ({f, n = 22}) => (
  <g>
    {Array.from({length: n}, (_, i) => (
      <circle key={i} cx={rnd(i + 200) * 1080 + Math.sin(f / 35 + i) * 26} cy={(rnd(i + 240) * 1920 - f * (0.4 + rnd(i + 3) * 0.8) + 3840) % 1920}
        r={1.4 + rnd(i + 9) * 2.8} fill={GOLD_LT} opacity={0.12 + 0.28 * Math.abs(Math.sin(f / 13 + i))} />
    ))}
  </g>
);

export const Grain: React.FC<{f: number}> = ({f}) => (
  <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.16, pointerEvents: 'none'}}>
    <filter id={`grain-${f % 8}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 8} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="1080" height="1920" filter={`url(#grain-${f % 8})`} />
  </svg>
);

export const Vignette: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 75% 60% at 50% 52%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
);

// Renders any story frame (used live, and by the rewind to play it backwards).
const StoryFrame: React.FC<{f: number}> = ({f}) => {
  if (f < S.bust) return <ShotWide l={f - S.wide} f={f} />;
  if (f < S.pit) return <ShotBust l={f - S.bust} f={f} />;
  if (f < S.why) return <ShotPit l={f - S.pit} f={f} />;
  return <ShotWhy l={f - S.why} f={f} />;
};

// VHS rewind: earlier shots replayed backwards at speed with tracking noise + OSD.
const ShotRewind: React.FC<{l: number; f: number}> = ({l, f}) => {
  const src = Math.max(0, Math.round(S.rewind - 1 - l * 4.6));
  const jitter = noise2D('vhs', f / 2, 0) * 14;
  const band = ((l * 57) % 2200) - 200;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${jitter}px)`, filter: 'saturate(.65) contrast(1.15) brightness(.9) hue-rotate(-8deg)'}}>
        <StoryFrame f={src} />
      </AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 2px, rgba(0,0,0,0) 2px 5px)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: band, height: 90,
        background: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.22), rgba(255,255,255,0))', transform: `translateX(${-jitter * 3}px)`}} />
      <div style={{position: 'absolute', left: 70, top: 200, fontFamily: FONT_SANS, fontWeight: 700, fontSize: 52, color: '#fff',
        textShadow: '3px 0 rgba(255,60,60,.7), -3px 0 rgba(60,200,255,.7)'}}>◀◀ REW</div>
    </AbsoluteFill>
  );
};

// Diagonal Alux-style wipe with a gold leading edge: reveals `next` over `prev`.
export const Wipe: React.FC<{p: number; prev: React.ReactNode; next: React.ReactNode}> = ({p, prev, next}) => {
  const x = interpolate(ease(p), [0, 1], [-400, 1480]);
  const poly = `polygon(0 0, ${x + 300}px 0, ${x}px 100%, 0 100%)`;
  return (
    <AbsoluteFill>
      {prev}
      <AbsoluteFill style={{clipPath: poly}}>{next}</AbsoluteFill>
      <svg width="1080" height="1920" style={{position: 'absolute'}}>
        <path d={`M${x + 300} 0 L${x + 330} 0 L${x + 30} 1920 L${x} 1920Z`} fill={GOLD_LT} />
      </svg>
    </AbsoluteFill>
  );
};

export const AtariSample: React.FC = () => {
  const f = useCurrentFrame();
  const W = 10; // wipe length (frames)

  let body: React.ReactNode;
  if (f >= S.pit && f < S.pit + W) {
    body = <Wipe p={(f - S.pit) / W} prev={<ShotBust l={f - S.bust} f={f} />} next={<ShotPit l={f - S.pit} f={f} />} />;
  } else if (f >= S.room && f < S.room + W) {
    // push transition: rewind slides out left, the boardroom slides in from the right
    const p = ease((f - S.room) / W);
    body = (
      <AbsoluteFill>
        <AbsoluteFill style={{transform: `translateX(${-p * 1080}px)`}}><ShotRewind l={f - S.rewind} f={f} /></AbsoluteFill>
        <AbsoluteFill style={{transform: `translateX(${(1 - p) * 1080}px)`}}><ShotRoom l={f - S.room} f={f} /></AbsoluteFill>
      </AbsoluteFill>
    );
  } else if (f < S.rewind) {
    body = <StoryFrame f={f} />;
  } else if (f < S.room) {
    body = <ShotRewind l={f - S.rewind} f={f} />;
  } else {
    body = <ShotRoom l={f - S.room} f={f} />;
  }

  // Cut punches (hard cuts land with a small scale settle + gold flash).
  const sinceCut = Math.min(...[S.bust, S.why].map((c) => (f >= c ? f - c : 99)));
  const punch = sinceCut < 8 ? 1 + 0.06 * Math.pow(1 - sinceCut / 8, 2) : 1;
  const flash = sinceCut < 4 ? 0.22 * (1 - sinceCut / 4) : 0;

  const year = Math.round(interpolate(f, [S.rewind + 4, S.room - 8], [1983, 1976], clamp));
  const n28 = at('twenty-eight', B[2]);
  const amt = Math.round(28 * easeOut(k01(f, n28, n28 + 18)));
  const phrase = phrases.find((p: any) => f >= p.start && f < p.end);

  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${punch})`}}>{body}</AbsoluteFill>
      <Vignette />
      <Grain f={f} />
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <rect width="1080" height="560" fill="url(#smp-top)" />
        <defs><linearGradient id="smp-top" x1="0" y1="0" x2="0" y2="1"><stop stopColor={NAVY} stopOpacity=".75" /><stop offset="1" stopColor={NAVY} stopOpacity="0" /></linearGradient></defs>
        {f < S.pit && <Hook />}
        {f >= S.pit && f < S.rewind && (
          <g>
            <Title f={f} t={at('concrete', B[1])} y={380} size={86} text="UNDER CONCRETE" fill={IVORY} />
            <Title f={f} t={at('top', B[1]) + 6} y={560} size={170} text="WHY?" />
          </g>
        )}
        {f >= S.rewind && f < S.room + 4 && <Title f={f} t={S.rewind} y={640} size={230} text={`${year}`} />}
        {f >= S.room && (
          <g>
            <Kicker y={300} text="1976 · WARNER BUYS ATARI" />
            {f >= n28 - 2 && <Title f={f} t={n28 - 2} y={520} size={200} text={`$${amt}M`} />}
          </g>
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
