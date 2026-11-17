import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Documentary-illustration bust: bright cyan-suited executive with a pitch-black
 * block face and hands, cradling a coral coin that is cracking in two.
 * Near-black night sky, line-art swirl clouds, a cyan horizon band of hills
 * with tiny trees and fallen columns.
 *
 * Framer Motion `motion.g` nodes are the render targets; all values come from
 * Remotion's frame clock so frame-by-frame renders stay deterministic.
 */

const C = {
  bg: "#0A0A0C",
  cyanHi: "#4CC3F5",
  cyan: "#1BA3E8",
  cyanLo: "#0877B8",
  cyanLine: "#07598C",
  ink: "#020203",
  inkB: "#0B0B0E",
  white: "#F4F8FB",
  coralHi: "#FF9A7A",
  coral: "#F2695A",
  coralLo: "#B8392F",
  hillHi: "#1690C9",
  hillLo: "#06273A",
} as const;

const BREATH_SEC = 4.4;

const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="suit" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stopColor={C.cyanHi} />
      <stop offset="55%" stopColor={C.cyan} />
      <stop offset="100%" stopColor={C.cyanLo} />
    </linearGradient>
    <linearGradient id="sleeveL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stopColor={C.cyan} />
      <stop offset="100%" stopColor={C.cyanLo} />
    </linearGradient>
    <linearGradient id="sleeveR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor={C.cyanHi} />
      <stop offset="100%" stopColor={C.cyan} />
    </linearGradient>
    <radialGradient id="coin" cx="35%" cy="30%" r="80%">
      <stop offset="0%" stopColor={C.coralHi} />
      <stop offset="60%" stopColor={C.coral} />
      <stop offset="100%" stopColor={C.coralLo} />
    </radialGradient>
    <radialGradient id="coinGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={C.coral} stopOpacity={0.45} />
      <stop offset="100%" stopColor={C.coral} stopOpacity={0} />
    </radialGradient>
    <linearGradient id="hills" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={C.hillHi} />
      <stop offset="100%" stopColor={C.hillLo} />
    </linearGradient>
    <linearGradient id="hillsFar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={C.hillLo} />
      <stop offset="100%" stopColor={C.bg} />
    </linearGradient>
    <linearGradient id="face" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor={C.inkB} />
      <stop offset="100%" stopColor={C.ink} />
    </linearGradient>
  </defs>
);

/* ------------------------------------------------------------------ */
/* Environment                                                         */
/* ------------------------------------------------------------------ */

/** Line-art swirl cloud with an underline, as in the reference frames. */
const SwirlCloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" strokeLinecap="round">
    <path
      d="M0,30 C10,5 40,0 52,18 C60,30 44,40 38,30 C32,18 56,2 78,10 C92,-8 124,-6 132,14 C140,32 120,40 112,28 C106,18 124,10 138,20"
      stroke={C.cyan}
      strokeWidth={4}
    />
    <path d="M6,52 L112,52" stroke={C.white} strokeWidth={3} opacity={0.85} />
  </g>
);

/** Tiny pine silhouette for the horizon band. */
const Pine: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => (
  <path d={`M${x},${y - h} L${x + h * 0.28},${y} L${x - h * 0.28},${y} Z`} fill={C.hillLo} />
);

const FallenColumn: React.FC<{ x: number; y: number; tilt: number }> = ({ x, y, tilt }) => (
  <g transform={`rotate(${tilt} ${x} ${y})`} fill={C.hillLo}>
    <rect x={x - 9} y={y - 70} width={18} height={70} />
    <rect x={x - 14} y={y - 78} width={28} height={8} />
    <rect x={x - 14} y={y - 4} width={28} height={6} />
  </g>
);

const Environment: React.FC<{ t: number; sway: number }> = ({ t, sway }) => {
  const stars = useMemo(() => {
    const r = rng(3);
    return Array.from({ length: 90 }, () => ({
      x: r() * 1080,
      y: r() * 1500,
      r: 1 + r() * 2.4,
      cyan: r() > 0.6,
      ring: r() > 0.9,
      p: r() * 6,
    }));
  }, []);
  const pines = useMemo(() => {
    const r = rng(29);
    return Array.from({ length: 46 }, () => ({ x: r() * 1080, h: 14 + r() * 26 }));
  }, []);
  const tufts = useMemo(() => {
    const r = rng(41);
    return Array.from({ length: 10 }, () => ({ x: 40 + r() * 1000, y: 1180 + r() * 700, coral: r() > 0.7 }));
  }, []);

  const drift = (t * 6) % 1300;
  return (
    <g>
      <rect width={1080} height={1920} fill={C.bg} />

      {stars.map((s, i) => {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.4 + s.p));
        return s.ring ? (
          <circle key={i} cx={s.x} cy={s.y} r={4} fill="none" stroke={C.cyan} strokeWidth={1.5} opacity={0.5 * tw} />
        ) : (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.cyan ? C.cyan : C.white} opacity={tw * 0.8} />
        );
      })}

      <SwirlCloud x={((80 + drift) % 1300) - 150} y={210} s={1.3} />
      <SwirlCloud x={((820 + drift * 0.7) % 1300) - 150} y={320} s={1.1} />

      {/* horizon band */}
      <motion.g style={{ x: sway * 0.3 }}>
        <path
          d="M-40,1080 C60,1000 150,990 230,1040 C300,1000 380,960 470,1030 C560,980 660,960 760,1030 C840,990 950,980 1120,1050 L1120,1100 L-40,1100 Z"
          fill="url(#hillsFar)"
        />
        <path
          d="M-40,1100 C40,1050 120,1040 190,1075 C260,1040 330,1030 410,1072 C520,1040 620,1030 700,1070 C790,1040 880,1030 960,1068 C1020,1050 1070,1048 1120,1060 L1120,1112 L-40,1112 Z"
          fill="url(#hills)"
        />
        {pines.map((p, i) => (
          <Pine key={i} x={p.x} y={1108} h={p.h} />
        ))}
        {/* ruined colonnade on the horizon: the empire already falling */}
        <FallenColumn x={150} y={1106} tilt={0} />
        <FallenColumn x={190} y={1106} tilt={-24} />
        <FallenColumn x={880} y={1106} tilt={0} />
        <FallenColumn x={930} y={1106} tilt={interpolate(t, [0, 12], [18, 34])} />
        <path d="M-40,1112 L1120,1112" stroke={C.cyan} strokeWidth={3} />
        <path d="M-40,1130 L1120,1130" stroke={C.cyanLine} strokeWidth={1.5} opacity={0.7} />
      </motion.g>

      {/* sparse line-art ground tufts */}
      {tufts.map((g, i) => (
        <g key={i} stroke={g.coral ? C.coral : C.cyan} strokeWidth={3} strokeLinecap="round" opacity={0.8}>
          <path d={`M${g.x},${g.y} L${g.x - 10},${g.y - 18}`} />
          <path d={`M${g.x + 10},${g.y} L${g.x + 10},${g.y - 24}`} />
          <path d={`M${g.x + 20},${g.y} L${g.x + 30},${g.y - 16}`} />
        </g>
      ))}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Character                                                           */
/* ------------------------------------------------------------------ */

const Head: React.FC<{ blink: number; look: number }> = ({ blink, look }) => (
  <g>
    {/* slicked hair */}
    <path
      d="M404,408 C400,330 470,280 560,284 C640,288 690,330 694,392 C660,360 610,350 560,352 C500,354 450,370 420,420 Z"
      fill={C.ink}
    />
    <path d="M440,330 C500,296 600,294 660,330" stroke={C.cyan} strokeWidth={3} fill="none" opacity={0.7} />
    {/* block face, split into two planes with a stepped nose */}
    <path
      d="M420,400 C470,380 520,376 560,378 L560,470 L540,520 L560,532 L560,710 C520,712 476,706 452,690 C440,640 436,560 420,520 C414,480 414,430 420,400 Z"
      fill={C.inkB}
    />
    <path
      d="M560,378 C610,378 660,384 690,396 C696,470 694,580 684,680 C650,702 600,712 560,710 L560,532 L540,520 L560,470 Z"
      fill={C.ink}
    />
    <path d="M560,378 L560,470 L540,520 L560,532 L560,710" stroke="#1A1A20" strokeWidth={2} fill="none" />
    {/* eyes: white half-moons with pupils, lids blink */}
    {[480, 626].map((ex) => (
      <g key={ex} transform={`translate(0 470) scale(1 ${blink}) translate(0 -470)`}>
        <path d={`M${ex - 38},474 C${ex - 34},440 ${ex + 34},440 ${ex + 38},474 C${ex + 20},462 ${ex - 20},462 ${ex - 38},474 Z`} fill={C.white} />
        <path d={`M${ex - 30},478 C${ex - 14},456 ${ex + 14},456 ${ex + 30},478 C${ex + 14},490 ${ex - 14},490 ${ex - 30},478 Z`} fill={C.white} />
        <circle cx={ex + look} cy={474} r={10} fill={C.ink} />
      </g>
    ))}
  </g>
);

/** Coral coin, splitting along a jagged crack; halves drift apart over the clip. */
const CrackingCoin: React.FC<{ t: number; float: number }> = ({ t, float }) => {
  const split = interpolate(t, [1, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gap = split * 22;
  const tilt = split * 7;
  const crack = "L548,1060 L524,1120 L556,1170 L528,1230 L560,1290 L540,1340 L546,1400";
  const cy = 1230 + float;
  const embers = Array.from({ length: 7 }, (_, i) => {
    const p = ((t * 0.35 + i / 7) % 1);
    return { x: 540 + Math.sin(i * 2.1 + t) * 60, y: cy - 40 - p * 360, o: (1 - p) * split };
  });
  return (
    <g transform={`translate(0 ${float})`}>
      <circle cx={540} cy={1230} r={320} fill="url(#coinGlow)" />
      <defs>
        <clipPath id="coinLeft">
          <path d={`M300,1040 L546,1040 ${crack} L300,1420 Z`} />
        </clipPath>
        <clipPath id="coinRight">
          <path d={`M780,1040 L546,1040 ${crack} L780,1420 Z`} />
        </clipPath>
      </defs>
      {(["coinLeft", "coinRight"] as const).map((id, i) => {
        const dir = i === 0 ? -1 : 1;
        return (
          <g key={id} transform={`translate(${dir * gap} 0) rotate(${dir * tilt} 540 1400)`} clipPath={`url(#${id})`}>
            <circle cx={540} cy={1230} r={170} fill="url(#coin)" />
            <circle cx={540} cy={1230} r={140} fill="none" stroke={C.coralLo} strokeWidth={6} />
            <text x={540} y={1290} textAnchor="middle" fontSize={170} fontWeight={900} fontFamily="Inter, Arial, sans-serif" fill={C.coralLo}>
              $
            </text>
            <path d="M430,1140 C460,1110 500,1096 540,1094" stroke={C.coralHi} strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      {/* glowing seam */}
      <path d={`M546,1060 ${crack.replace(/^L548,1060 /, "")}`} fill="none" stroke={C.white} strokeWidth={3} opacity={split * 0.9} transform={`translate(0 0)`} />
      {embers.map((e, i) => (
        <rect key={i} x={e.x} y={e.y} width={6} height={6} fill={C.coral} opacity={e.o} transform={`rotate(45 ${e.x + 3} ${e.y + 3})`} />
      ))}
    </g>
  );
};

const Executive: React.FC<{ t: number }> = ({ t }) => {
  const phase = (t / BREATH_SEC) * Math.PI * 2;
  const breath = 0.5 - 0.5 * Math.cos(phase);
  const lag = 0.5 - 0.5 * Math.cos(phase - 0.7);

  const rise = interpolate(breath, [0, 1], [0, -14]);
  const chest = interpolate(breath, [0, 1], [1, 1.02]);
  const headBob = interpolate(lag, [0, 1], [0, -10]);
  const headTilt = Math.sin(phase * 0.5) * 2;
  const armRise = interpolate(lag, [0, 1], [0, -10]);
  const blink = t % 4.7 > 4.56 ? 0.08 : 1;
  const look = Math.sin(t * 0.6) * 6;

  return (
    <g>
      {/* torso */}
      <motion.g style={{ y: rise, scale: chest, originX: "540px", originY: "1920px" }} transform-origin="540 1920">
        <path
          d="M140,1010 C160,900 260,826 400,788 C460,770 500,764 540,764 C580,764 620,770 680,788 C820,826 920,900 940,1010 C930,1300 910,1600 900,1920 L180,1920 C170,1600 150,1300 140,1010 Z"
          fill="url(#suit)"
        />
        {/* lapels as soft contour lines */}
        <path d="M470,780 C480,860 500,950 540,1040" stroke={C.cyanLine} strokeWidth={3} fill="none" />
        <path d="M612,780 C602,860 582,950 540,1040" stroke={C.cyanLine} strokeWidth={3} fill="none" />
        {/* collar + coral tie */}
        <path d="M478,770 C500,800 520,820 540,830 C560,820 584,800 604,770 C590,762 560,758 540,758 C520,758 494,762 478,770 Z" fill={C.white} />
        <path d="M528,822 L552,822 L558,846 L522,846 Z" fill={C.coralLo} />
        <path d="M522,846 L558,846 L566,960 L540,992 L514,960 Z" fill={C.coral} />
        {/* sleeve seams */}
        
      </motion.g>

      {/* neck + head */}
      <motion.g style={{ y: rise + headBob, rotate: headTilt, originX: "556px", originY: "740px" }} transform-origin="556 740">
        <path d="M468,690 C500,712 610,714 650,690 L640,780 C600,796 516,796 476,780 Z" fill={C.cyanLo} />
        <Head blink={blink} look={look} />
      </motion.g>

      {/* arms: upper arms hang at the sides, forearms come across the belly */}
      <motion.g style={{ y: rise + armRise }}>
        <path d="M140,1010 C112,1120 104,1300 126,1440 C136,1500 180,1520 236,1506 L300,1080 C280,1000 200,960 140,1010 Z" fill="url(#sleeveL)" />
        <path d="M940,1010 C968,1120 976,1300 954,1440 C944,1500 900,1520 844,1506 L780,1080 C800,1000 880,960 940,1010 Z" fill="url(#sleeveR)" />
        <path d="M300,1080 C280,1220 262,1360 236,1506" stroke={C.cyanLine} strokeWidth={3} fill="none" />
        <path d="M780,1080 C800,1220 818,1360 844,1506" stroke={C.cyanLine} strokeWidth={3} fill="none" />
        <path d="M126,1440 C150,1530 300,1520 462,1486 L458,1402 C330,1414 230,1404 180,1370 Z" fill="url(#sleeveL)" />
        <path d="M954,1440 C930,1530 780,1520 618,1486 L622,1402 C750,1414 850,1404 900,1370 Z" fill="url(#sleeveR)" />
        <path d="M180,1370 C230,1404 330,1414 458,1402" stroke={C.cyanLine} strokeWidth={3} fill="none" />
        <path d="M900,1370 C850,1404 750,1414 622,1402" stroke={C.cyanLine} strokeWidth={3} fill="none" />
        {/* white cuffs */}
        <path d="M450,1398 L484,1394 C490,1424 490,1458 486,1484 L452,1488 C456,1460 456,1428 450,1398 Z" fill={C.white} />
        <path d="M630,1398 L596,1394 C590,1424 590,1458 594,1484 L628,1488 C624,1460 624,1428 630,1398 Z" fill={C.white} />
      </motion.g>
    </g>
  );
};

/** Black hands cupped under the coin — drawn after it. */
const Hands: React.FC<{ y: number }> = ({ y }) => (
  <g transform={`translate(0 ${y})`} fill={C.ink}>
    {/* left palm cupped under the coin, thumb up its side */}
    <path d="M482,1398 C520,1388 566,1396 590,1416 C606,1432 598,1458 570,1466 C540,1474 506,1478 484,1480 Z" />
    <path d="M486,1410 C470,1392 468,1370 478,1352" stroke={C.ink} strokeWidth={24} strokeLinecap="round" fill="none" />
    {/* right palm overlapping */}
    <path d="M598,1402 C560,1392 516,1402 496,1424 C484,1440 494,1462 520,1468 C548,1474 578,1476 596,1480 Z" />
    <path d="M594,1410 C610,1392 612,1370 602,1352" stroke={C.ink} strokeWidth={24} strokeLinecap="round" fill="none" />
    <path d="M510,1440 C530,1432 556,1434 574,1446" stroke="#2A2A33" strokeWidth={2.5} fill="none" />
    <path d="M514,1456 C534,1450 556,1452 570,1460" stroke="#2A2A33" strokeWidth={2.5} fill="none" />
  </g>
);

export const AluxExecutive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const phase = (t / BREATH_SEC) * Math.PI * 2;
  const breath = 0.5 - 0.5 * Math.cos(phase);
  const lag = 0.5 - 0.5 * Math.cos(phase - 0.7);
  const sway = Math.sin(phase) * 8;
  const armY = interpolate(breath, [0, 1], [0, -14]) + interpolate(lag, [0, 1], [0, -10]);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <Defs />
        <Environment t={t} sway={sway} />
        <Executive t={t} />
        <CrackingCoin t={t} float={armY - 20} />
        <Hands y={armY} />
      </svg>
    </AbsoluteFill>
  );
};
