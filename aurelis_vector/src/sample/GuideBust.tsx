import React from 'react';

// Close-up (head-and-shoulders) rig of the recurring Aurelis guide, for Alux-style
// big framing. Same identity as Banker.tsx: grey-white swept hair, small round gold
// glasses, angular faceted face, teal suit, gold waistcoat, dark cravat, gold rim light.
// Local origin = centre of the chest line; the head sits around y = -330.
//   yaw   -1..1  head turn (negative = looking to viewer's left)
//   gazeX/gazeY  pupil offset in px (before yaw)
//   shock 0..1   brows up, eyes wide, mouth open
//   frown 0..1   brows knit, mouth pressed (suspicion / "why?")
//   blink 0..1   eyelid closure
//   tilt         head roll in degrees; breath = chest rise in px
export type BustPose = {yaw: number; gazeX: number; gazeY: number; shock: number; frown: number; blink: number; tilt: number; breath: number};

const SKIN_HI = '#f1d6a2', SKIN = '#d9b67a', SKIN_LO = '#9f7950', HAIR = '#c3c6b4', HAIR_HI = '#f2e5c7',
  SUIT_HI = '#637875', SUIT = '#344e4f', SUIT_LO = '#172b32', VEST_HI = '#c69f5c', VEST_LO = '#766143',
  GOLD = '#edd29a', RIM = '#f0cf79', INK = '#1b1d1f';

export const GuideBust: React.FC<{x: number; y: number; scale?: number; pose: BustPose; id?: string}> = ({x, y, scale = 1, pose, id = 'bust'}) => {
  const {yaw, gazeX, gazeY, shock, frown, blink, tilt, breath} = pose;
  const cx = yaw * 58;                 // facial centre line shifts with the turn
  const near = 1 - Math.max(0, yaw) * 0.45, far = 1 - Math.max(0, -yaw) * 0.45; // eye spacing squeeze
  const eyeL = cx - 40 * far, eyeR = cx + 40 * near, eyeY = -338;
  const open = Math.max(0.08, (1 - blink) * (1 + shock * 0.45 - frown * 0.25));
  const browLift = shock * 16 - frown * 5;
  const px = gazeX + yaw * 4, py = gazeY;
  const mouthOpen = shock;
  const shoulderShift = yaw * 18;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <linearGradient id={`${id}-suit`} x1="0" y1="0" x2="1" y2=".7"><stop stopColor={SUIT_HI} /><stop offset=".45" stopColor={SUIT} /><stop offset="1" stopColor={SUIT_LO} /></linearGradient>
        <linearGradient id={`${id}-skin`} x1="1" y1="0" x2="0" y2=".5"><stop stopColor={SKIN_HI} /><stop offset=".55" stopColor={SKIN} /><stop offset="1" stopColor={SKIN_LO} /></linearGradient>
        <linearGradient id={`${id}-vest`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={VEST_HI} /><stop offset="1" stopColor={VEST_LO} /></linearGradient>
        <linearGradient id={`${id}-hair`} x1="1" y1="0" x2="0" y2="1"><stop stopColor="#e3e3d4" /><stop offset=".6" stopColor={HAIR} /><stop offset="1" stopColor="#8f9486" /></linearGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0"><stop offset=".55" stopColor={RIM} stopOpacity="0" /><stop offset="1" stopColor={RIM} stopOpacity=".95" /></linearGradient>
      </defs>

      {/* ---------- torso (turns a little with the head) ---------- */}
      <g transform={`translate(${shoulderShift} ${-breath})`}>
        <path d="M-340 260 L-330 20 Q-320 -95 -170 -128 L-60 -150 L60 -150 L170 -128 Q320 -95 330 20 L340 260Z" fill={`url(#${id}-suit)`} />
        <path d="M330 20 Q320 -95 170 -128" fill="none" stroke={RIM} strokeWidth="7" opacity=".85" />
        {/* waistcoat + shirt + cravat */}
        <path d="M-78 -150 L78 -150 L118 260 L-118 260Z" fill={`url(#${id}-vest)`} />
        {[10, 80, 150, 220].map((yy) => <circle key={yy} cx="0" cy={yy} r="7" fill="#ead19a" />)}
        <path d="M18 60 Q110 150 96 30" fill="none" stroke="#dcb971" strokeWidth="5" />
        <path d="M-58 -152 L58 -152 L26 -40 L0 10 L-26 -40Z" fill="#ece7d7" />
        <path d="M-44 -140 L0 -110 L44 -140 L34 -84 L0 -64 L-34 -84Z" fill="#26323a" />
        <path d="M-16 -80 L16 -80 L28 -8 L0 12 L-28 -8Z" fill="#18262e" />
        {/* lapels */}
        <path d="M-70 -150 L-160 -100 L-120 -40 L-150 -12 L-40 190 L-78 -30Z" fill="#48605d" />
        <path d="M70 -150 L160 -100 L120 -40 L150 -12 L40 190 L78 -30Z" fill="#1c3238" />
        <path d="M160 -100 L120 -40 L150 -12" fill="none" stroke={RIM} strokeWidth="3" opacity=".6" />
        {/* shirt collar wings */}
        <path d="M-60 -154 L-6 -118 L-40 -96 L-74 -140Z M60 -154 L6 -118 L40 -96 L74 -140Z" fill="#f2edde" />
        {/* seam/fold lines */}
        <path d="M-250 40 Q-230 140 -250 250 M250 40 Q230 140 250 250" stroke="#7a8d83" strokeWidth="3" fill="none" opacity=".35" />
      </g>

      {/* ---------- neck ---------- */}
      <g transform={`translate(${shoulderShift * 0.6} ${-breath * 0.7})`}>
        <path d="M-46 -236 L-48 -150 L0 -122 L48 -150 L46 -236Z" fill="#b69261" />
        <path d="M-46 -206 Q0 -170 46 -206 L46 -236 L-46 -236Z" fill="#8e6c45" opacity=".55" />
      </g>

      {/* ---------- head ---------- */}
      <g transform={`translate(${shoulderShift * 0.5} ${-breath * 0.6}) rotate(${tilt} 0 -240)`}>
        {/* far ear (shows when looking left), near ear (shows when looking right) */}
        <g transform={`translate(${104 + cx * 0.25} -330) scale(${0.75 + Math.max(0, -yaw) * 0.4} 1)`}>
          <path d="M-6 -34 Q30 -40 28 0 Q26 34 -4 30Z" fill={SKIN} stroke="#b89466" strokeWidth="2" />
          <path d="M4 -18 Q16 -6 6 14" stroke="#8c6948" strokeWidth="3" fill="none" />
          <path d="M22 -30 Q32 0 22 26" stroke={RIM} strokeWidth="4" fill="none" opacity=".9" />
        </g>
        <g transform={`translate(${-104 + cx * 0.25} -330) scale(${-(0.75 + Math.max(0, yaw) * 0.4)} 1)`}>
          <path d="M-6 -34 Q30 -40 28 0 Q26 34 -4 30Z" fill={SKIN_LO} stroke="#8c6948" strokeWidth="2" />
        </g>

        {/* skull + face: angular, the chin follows the turn */}
        <path d={`M-98 -390 Q-104 -482 0 -490 Q104 -482 98 -390 L${94 + cx * 0.15} -300 L${66 + cx * 0.6} -222 Q${32 + cx * 0.8} -186 ${cx * 0.85} -184 Q${-32 + cx * 0.8} -186 ${-66 + cx * 0.6} -222 L${-94 + cx * 0.15} -300Z`}
          fill={`url(#${id}-skin)`} />
        {/* the signature facet shadow on the unlit (viewer's left) side */}
        <path d={`M-98 -390 L${-94 + cx * 0.15} -300 L${-66 + cx * 0.6} -222 Q${-32 + cx * 0.8} -186 ${cx * 0.85 - 4} -184 L${cx * 0.7 - 20} -250 L${eyeL - 22} -300 L${eyeL - 30} -360 L-70 -410Z`}
          fill={SKIN_LO} opacity=".55" />
        {/* rim light on the lit cheek/jaw */}
        <path d={`M98 -390 L${94 + cx * 0.15} -300 L${66 + cx * 0.6} -222`} fill="none" stroke={RIM} strokeWidth="6" opacity=".95" />
        {/* cheekbone + age lines */}
        <path d={`M${eyeR + 6} -300 L${eyeR + 30} -272 M${eyeL - 6} -300 L${eyeL - 24} -276`} stroke="#9a7650" strokeWidth="3" opacity=".6" fill="none" />
        <path d={`M${cx - 30} -262 Q${cx - 44} -238 ${cx - 38} -214 M${cx + 30} -262 Q${cx + 44} -238 ${cx + 38} -214`} stroke="#9a7650" strokeWidth="3" opacity=".55" fill="none" />

        {/* nose: angular wedge pointing along the turn */}
        <path d={`M${cx + 2} -350 L${cx + yaw * 26 + 10} -286 L${cx + yaw * 10 - 12} -276 L${cx - 6} -284`} fill="#c29a66" />
        <path d={`M${cx + 2} -350 L${cx + yaw * 26 + 10} -286`} stroke={SKIN_HI} strokeWidth="3" opacity=".8" />
        <path d={`M${cx + yaw * 10 - 18} -276 Q${cx + yaw * 12} -268 ${cx + yaw * 26 + 14} -280`} stroke="#8c6948" strokeWidth="3" fill="none" />

        {/* eyes */}
        {[eyeL, eyeR].map((ex, i) => (
          <g key={i}>
            <ellipse cx={ex} cy={eyeY} rx={15 * (i === 0 ? far : near)} ry={11 * open} fill="#f4ecd8" />
            {open > 0.25 && <circle cx={ex + px} cy={eyeY + py * open} r={shock > 0.5 ? 5 : 6.5} fill="#2c2620" />}
            {open > 0.25 && <circle cx={ex + px + 2} cy={eyeY + py * open - 2} r="1.8" fill="#fff" />}
            {/* upper lid line */}
            <path d={`M${ex - 17} ${eyeY - 11 * open + 1} Q${ex} ${eyeY - 15 * open - 2} ${ex + 17} ${eyeY - 11 * open + 1}`} stroke="#5d4636" strokeWidth="3.5" fill="none" />
          </g>
        ))}
        {/* brows: raise in shock, knit in a frown */}
        <path d={`M${eyeL - 22} ${-372 - browLift + frown * 4} L${eyeL + 18} ${-378 - browLift * 1.2 + frown * 10}`} stroke="#8f9486" strokeWidth="9" strokeLinecap="round" />
        <path d={`M${eyeR - 18} ${-378 - browLift * 1.2 + frown * 10} L${eyeR + 22} ${-372 - browLift + frown * 4}`} stroke="#8f9486" strokeWidth="9" strokeLinecap="round" />
        {frown > 0.3 && <path d={`M${cx - 6} -366 L${cx - 4} -350 M${cx + 6} -366 L${cx + 4} -350`} stroke="#9a7650" strokeWidth="2.5" opacity={frown} />}

        {/* round gold glasses */}
        <g fill="none" stroke={GOLD} strokeWidth="4.5">
          <circle cx={eyeL} cy={eyeY} r={27 * (0.85 + 0.15 * far)} />
          <circle cx={eyeR} cy={eyeY} r={27 * (0.85 + 0.15 * near)} />
          <path d={`M${eyeL + 26 * far} ${eyeY - 4} Q${cx} ${eyeY - 14} ${eyeR - 26 * near} ${eyeY - 4}`} />
          <path d={`M${eyeR + 27 * near} ${eyeY - 4} L${100 + cx * 0.25} -342`} />
        </g>
        <path d={`M${eyeR + 8} ${eyeY - 18} l10 8`} stroke="#fff" strokeWidth="3" opacity=".6" />

        {/* mouth: pressed line -> open "O" of shock */}
        {mouthOpen > 0.15 ? (
          <g>
            <ellipse cx={cx * 0.9} cy={-236 + mouthOpen * 4} rx={14 + mouthOpen * 6} ry={6 + mouthOpen * 16} fill="#3a1f1a" />
            <path d={`M${cx * 0.9 - 12} ${-244 - mouthOpen * 8} Q${cx * 0.9} ${-250 - mouthOpen * 8} ${cx * 0.9 + 12} ${-244 - mouthOpen * 8}`} stroke="#f2edde" strokeWidth="4" fill="none" opacity=".85" />
          </g>
        ) : (
          <path d={`M${cx * 0.9 - 24} ${-238 + frown * 2} Q${cx * 0.9} ${-232 - frown * 6} ${cx * 0.9 + 22} ${-240 + frown * 3}`} stroke="#6f5342" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        )}

        {/* hair: swept back, fuller on the lit side, with highlight strands */}
        <path d={`M-104 -372 Q-126 -440 -70 -486 Q-10 -526 60 -506 Q118 -488 112 -420 L106 -372 L92 -404 Q70 -452 20 -452 Q-40 -452 -72 -420 L-88 -350Z`} fill={`url(#${id}-hair)`} />
        <path d="M-80 -430 Q-30 -490 50 -478 M-60 -448 Q-4 -500 72 -486 M-30 -462 Q30 -500 92 -470" stroke={HAIR_HI} strokeWidth="4" fill="none" opacity=".75" />
        <path d="M112 -420 Q118 -488 60 -506" stroke={RIM} strokeWidth="6" fill="none" opacity=".9" />
        <path d="M-104 -372 L-96 -330 L-88 -350" fill={HAIR} />
      </g>
    </g>
  );
};
