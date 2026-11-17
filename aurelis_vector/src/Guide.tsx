import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// Aurelis recurring guide — original flat-vector character in the ALUX STRUCTURE
// (slim FULL-BODY figure, solid flat fill, dark simple face with two-dot eyes and a
// small emblem on the head, sparse staging) but in AURELIS GOLD, not Alux's blue,
// so it is clearly ours. Hand-coded SVG with a rig: posable near arm + a turning
// head, and a prop that rides inside the hand group. Local origin at the pelvis.
export const Guide: React.FC<{
  x: number; y: number; scale?: number;
  action?: 'present' | 'point' | 'consider' | 'hold';
  id?: string;
  stance?: 'standing';
  gestureAt?: number;
  gaze?: number;
  held?: 'none' | 'card' | 'phone' | 'bag';
}> = ({x, y, scale = 1, action = 'present', id = 'guide', gestureAt = 0, gaze = 0, held = 'none'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const cueTime = Math.max(0, (f - gestureAt) / fps);
  const reach = Math.sin(Math.min(cueTime / 1.0, 1) * Math.PI / 2);
  const settle = interpolate(cueTime, [2.2, 3.6], [1, 0.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const gesture = reach * settle;
  const anticip = interpolate(f, [gestureAt - 9, gestureAt, gestureAt + 14], [0, -1.5, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const breath = Math.sin(t * 1.35) * 1.0;
  const nod = cueTime < 1.3 ? Math.sin(cueTime / 1.3 * Math.PI) * 2 : 0;
  const head = Math.sin(t * 0.75) * 0.8 - 1 + gaze * 2 + nod;
  const blink = (t % 4.6) > 4.48;

  // Aurelis gold body (Alux uses solid blue; we swap the hue).
  const body = '#e3b23c', bodyLt = '#f0cf79', bodyDk = '#b98a25';
  const face = '#141a26', faceEdge = '#0b0e13';
  const cuff = '#f4efe6', ink = '#0b0e13';

  // Near-arm joint angles per pose (shoulder + elbow, degrees).
  const upper = action === 'consider' ? 66 : action === 'point' ? -22 - gesture * 20
    : action === 'hold' ? 38 : -14 - gesture * 14; // present
  const elbow = action === 'consider' ? 108 : action === 'point' ? -12 - gesture * 30
    : action === 'hold' ? 74 : -14 - gesture * 26; // present

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* soft contact shadow */}
      <ellipse cx="4" cy="330" rx="120" ry="16" fill="#05090d" opacity=".4" />

      {/* ---- LEGS: two clear trouser columns from the pelvis, the dominant lower half ---- */}
      <g stroke={bodyDk} strokeWidth="2">
        {/* left leg */}
        <path d="M-4 6 L-40 6 L-46 170 L-48 316 L-16 316 L-8 168 L-2 60 Z" fill="#241b0e" />
        {/* right leg */}
        <path d="M4 6 L40 6 L44 170 L50 316 L18 316 L10 168 L2 60 Z" fill="#2e230f" />
        {/* inseam shadow */}
        <path d="M0 40 V300" stroke={ink} strokeWidth="2" opacity=".6" />
        {/* shoes */}
        <path d="M-48 308 H-18 L-6 328 Q-4 338 -22 338 H-64 Q-74 332 -60 324 Z" fill={ink} stroke={ink} />
        <path d="M18 308 H48 L64 324 Q76 332 62 338 H20 Q4 338 6 328 Z" fill={ink} stroke={ink} />
      </g>

      {/* body sways; slight anticipation lean before a gesture */}
      <g transform={`translate(0 ${breath}) rotate(${Math.sin(t * 0.5) * 0.35 + anticip} 0 30)`}>

        {/* ---- FAR ARM behind the torso (hangs straight down the side) ---- */}
        <path d="M-34 -140 Q-50 -142 -52 -112 L-52 -4 Q-52 12 -38 12 L-30 12 L-30 -110 Z" fill={bodyDk} stroke={ink} strokeWidth="2" />
        <circle cx="-41" cy="14" r="9" fill={face} stroke={faceEdge} strokeWidth="1.5" />

        {/* ---- TORSO: narrow tube ending flush at the waist ---- */}
        <path d="M-32 -150 Q-17 -166 0 -166 Q17 -166 32 -150 L34 -12 L-34 -12 Z" fill={body} stroke={ink} strokeWidth="2.5" />
        {/* pelvis block the legs spring from (sits just under the torso) */}
        <path d="M-34 -14 H34 L30 16 H-30 Z" fill={bodyDk} stroke={ink} strokeWidth="2" />
        {/* one soft body facet (left-lit) */}
        <path d="M-32 -150 Q-17 -166 0 -166 L0 -12 H-34 Z" fill={bodyLt} opacity=".22" />
        {/* subtle center crease */}
        <path d="M0 -150 V-14" stroke={bodyDk} strokeWidth="2" opacity=".4" />

        {/* ---- NECK + turning HEAD (dark, simple, small emblem on top) ---- */}
        <rect x="-13" y="-186" width="26" height="34" rx="10" fill={body} stroke={ink} strokeWidth="2" />
        <g transform={`rotate(${head} 0 -176)`}>
          {/* rounded head */}
          <path d="M-30 -206 Q-34 -252 0 -258 Q34 -252 30 -206 Q28 -170 0 -164 Q-28 -170 -30 -206 Z" fill={face} stroke={faceEdge} strokeWidth="2" />
          {/* two simple dot-eyes on a light patch (Alux face) */}
          {blink ? (
            <path d="M-16 -214 H-4 M4 -214 H16" stroke="#c9cdd6" strokeWidth="2.4" strokeLinecap="round" />
          ) : (
            <>
              <circle cx={-10 + gaze * 0.8} cy="-214" r="6.5" fill="#f4efe6" />
              <circle cx={10 + gaze * 0.8} cy="-214" r="6.5" fill="#f4efe6" />
              <circle cx={-9 + gaze * 1.4} cy="-213" r="2.6" fill={ink} />
              <circle cx={11 + gaze * 1.4} cy="-213" r="2.6" fill={ink} />
            </>
          )}
          {/* tiny mouth hint */}
          <path d="M-7 -190 Q0 -186 7 -190" fill="none" stroke="#3a4150" strokeWidth="2" strokeLinecap="round" />
          {/* small GOLD emblem on the head (our crown-equivalent) */}
          <path d="M-14 -256 L-8 -246 L0 -258 L8 -246 L14 -256 L11 -240 H-11 Z" fill={body} stroke={bodyDk} strokeWidth="1.5" />
        </g>

        {/* ---- NEAR ARM: shoulder -> elbow -> hand -> optional prop ---- */}
        <g transform={`rotate(${upper + Math.sin(t) * 0.6} 34 -148)`}>
          <path d="M24 -156 L56 -158 Q66 -156 66 -128 L70 -48 Q70 -28 52 -28 L34 -34 L28 -118 Z" fill={body} stroke={ink} strokeWidth="2.5" />
          <path d="M24 -156 L56 -158 Q64 -156 64 -136 Q46 -148 28 -138 Z" fill={bodyLt} opacity=".3" />
          <g transform={`rotate(${elbow + Math.sin(t * 0.9) * 1.2} 60 -34)`}>
            <path d="M44 -50 Q76 -58 84 -28 L90 40 Q90 58 70 58 L50 50 L46 -18 Z" fill={body} stroke={ink} strokeWidth="2.5" />
            {/* light cuff */}
            <path d="M50 40 L90 36 L92 54 L54 60 Z" fill={cuff} />
            <g transform="translate(0 0)">
              {/* hand (simple dark mitt, Alux keeps hands dark) */}
              <path d={
                action === 'point'
                  ? 'M62 44 L86 44 L94 56 L90 70 Q85 76 82 68 L80 60 L78 92 Q73 97 70 92 L71 58 L58 52 Q52 44 62 44 Z'
                  : 'M62 44 L88 43 L100 52 Q107 58 98 60 L80 57 L100 64 Q106 70 97 71 L76 66 L94 74 Q97 80 89 79 L72 68 L58 56 Q52 46 62 44 Z'
              } fill={face} stroke={faceEdge} strokeWidth="1.5" />

              {held === 'card' && (
                <g transform="translate(48 22) rotate(-8)">
                  <rect width="96" height="60" rx="8" fill={body} stroke={bodyDk} strokeWidth="2" />
                  <rect y="12" width="96" height="10" fill={ink} />
                  <rect x="10" y="34" width="20" height="14" rx="2" fill={cuff} />
                </g>
              )}
              {held === 'phone' && (
                <g transform="translate(60 -56) rotate(-8)">
                  <rect width="58" height="92" rx="10" fill={ink} stroke="#8a7444" strokeWidth="3" />
                  <rect x="7" y="10" width="44" height="64" rx="3" fill="#3a3320" />
                  <path d="M16 28H42M16 40H36M16 52H42" stroke={body} strokeWidth="3" />
                </g>
              )}
              {held === 'bag' && (
                <g transform="translate(42 6) rotate(-6)">
                  <path d="M0 20 Q10 -6 40 -6 Q70 -6 80 20 L86 92 Q86 104 40 104 Q-6 104 -6 92 Z" fill="#9b2c2c" stroke="#6f1d1d" strokeWidth="2.5" />
                  <path d="M18 -6 Q40 -22 62 -6" fill="none" stroke="#6f1d1d" strokeWidth="4" />
                  <text x="40" y="66" textAnchor="middle" fontFamily="Georgia,serif" fontSize="52" fontWeight="700" fill={bodyLt}>$</text>
                </g>
              )}
            </g>
          </g>
        </g>
      </g>
    </g>
  );
};
