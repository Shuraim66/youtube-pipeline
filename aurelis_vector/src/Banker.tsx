import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// Original vector artwork: a fictional period banker, not a historical portrait.
// Coordinates are local to the hips. Each limb has its own anatomical pivot.
// A hand-held object lives inside the wrist group, so it cannot drift off the hand.
export const Banker: React.FC<{
  x: number; y: number; scale?: number;
  action?: 'letter' | 'write' | 'consider' | 'present' | 'point';
  id?: string;
  stance?: 'seated' | 'standing';
  gestureAt?: number;
  gaze?: number;
  held?: 'letter' | 'phone' | 'card' | 'document';
}> = ({x, y, scale = 1, action = 'letter', id = 'banker', stance='seated', gestureAt=0, gaze=0, held='letter'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const cueTime=Math.max(0,(f-gestureAt)/fps);
  const reach = Math.sin(Math.min(cueTime/1.1,1)*Math.PI/2);
  const settle = interpolate(cueTime,[2.4,3.8],[1,.3],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const gesture = reach*settle;
  const reading=action==='letter'?interpolate(t,[0,.6,1.4,2.5,3.2],[0,0,1,1,0],{extrapolateRight:'clamp'}):0;
  const anticipation=interpolate(f,[gestureAt-10,gestureAt,gestureAt+15],[0,-2,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const breath = Math.sin(t * 1.45) * 1.25;
  const nod=cueTime<1.4?Math.sin(cueTime/1.4*Math.PI)*3:0;
  const head = Math.sin(t * .8) * .7 + (action === 'write' ? 8 : -3)+gaze*2+nod+reading*5;
  const upper = action === 'consider' ? 80 : action === 'write' ? 16 :
    action === 'point' ? -8-gesture*20 : action === 'present' ? -8-gesture*12 : -8-reading*5;
  const elbow = action === 'consider' ? 125 : action === 'write' ? 14 :
    action === 'point' ? -20-gesture*38 : action === 'present' ? -20-gesture*30 : -34;
  const wrist = Math.sin(t * (action === 'write' ? 3.2 : 1.1)) * (action === 'write' ? 3 : 1.8);
  const suit = `url(#${id}-coat)`;
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <defs>
      <linearGradient id={`${id}-coat`} x1="0" y1="0" x2="1" y2=".65">
        <stop stopColor="#637875"/><stop offset=".36" stopColor="#344e4f"/><stop offset="1" stopColor="#172b32"/>
      </linearGradient>
      <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2=".4">
        <stop stopColor="#f1d6a2"/><stop offset=".6" stopColor="#d9b67a"/><stop offset="1" stopColor="#9f7950"/>
      </linearGradient>
      <linearGradient id={`${id}-vest`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#c69f5c"/><stop offset="1" stopColor="#766143"/>
      </linearGradient>
    </defs>
    {/* Bent legs and polished shoes, visible below the writing desk. */}
    {stance==='seated' ? <g transform="scale(1 .59)">
    <path d="M-82 14 Q-100 91 -45 132 L23 162 L59 315 L96 315 L72 123 L8 46Z" fill="#15292f" stroke="#526366" strokeWidth="1.5"/>
    <path d="M10 26 L102 104 L81 306 L47 306 L52 134 L-25 113Z" fill="#22373e"/>
    <path d="M59 304 L97 303 L121 325 Q121 335 109 337 L45 337 L43 325Z" fill="#0b151c" stroke="#647274" strokeWidth="1.4"/>
    <path d="M49 306 L82 306 L83 328 L44 339 L0 339 Q-11 333 1 325Z" fill="#0b151c" stroke="#647274" strokeWidth="1.4"/>
    <path d="M-39 137 L32 165 L62 300 M68 145 L57 298" stroke="#6a7775" strokeWidth="1.2" opacity=".45" fill="none"/>
    </g> : <g>
      <path d="M-68 31L-8 36L-23 174L-32 296H-70L-65 171Z" fill="#22373e" stroke="#657674" strokeWidth="1.5"/>
      <path d="M-8 36L63 31L69 162L90 292L51 301L20 170Z" fill="#15292f" stroke="#526366" strokeWidth="1.5"/>
      <path d="M-48 78L-47 269M40 74L53 159L69 274" fill="none" stroke="#6a7775" opacity=".5"/>
      <path d="M-70 288H-31L-15 309Q-13 320-31 320H-90Q-103 315-92 307Z M51 293L89 286L123 307Q134 317 118 321H52Z" fill="#0b151c" stroke="#647274" strokeWidth="1.4"/>
    </g>}
    <g transform={`translate(0 ${breath}) rotate(${Math.sin(t*.55)*.35+anticipation} 0 25)`}>
      {/* Far sleeve, resting on the desk. */}
      <path d="M-66 -191 Q-91 -202 -110 -163 L-139 -47 Q-141 -27 -119 -19 L-26 -16 L-23 -48 L-97 -60 L-59 -148Z" fill={suit} stroke="#718482" strokeWidth="1.5"/>
      <path d="M-137 -41 L-103 -55 L-29 -38" fill="none" stroke="#9baba0" opacity=".35" strokeWidth="2"/>
      <path d="M-37 -48 L-15 -48 L-11 -15 L-31 -14Z" fill="#e5dfce"/>
      <path d="M-17 -45 L8 -49 Q23 -49 32 -41 L55 -29 Q62 -21 51 -19 L21 -25 L40 -12 Q46 -4 37 -3 L8 -18 L-13 -16Z" fill={`url(#${id}-skin)`}/>
      {/* Tailcoat, waistcoat, shirt and cravat. */}
      <path d="M-62 -201 L-24 -218 L25 -217 L73 -194 Q93 -144 76 -65 L95 61 L26 81 L-3 49 L-23 81 L-105 52 L-80 -67Z" fill={suit} stroke="#7a8d83" strokeWidth="1.5"/>
      <path d="M-29 -212 L26 -209 L44 -73 L21 20 L-20 20 L-39 -77Z" fill={`url(#${id}-vest)`}/>
      <path d="M-25 -215 L24 -215 L11 -160 L-4 -119 L-24 -162Z" fill="#ece7d7"/>
      <path d="M-20 -199 L5 -184 L24 -201 L17 -170 L-7 -155 L-22 -172Z" fill="#26323a"/>
      <path d="M-7 -165 L11 -165 L18 -125 L-3 -115 L-19 -130Z" fill="#18262e"/>
      <path d="M-33 -214 L-66 -186 L-47 -157 L-64 -145 L-17 -66 L-29 -156Z" fill="#48605d" stroke="#819185" strokeWidth="1"/>
      <path d="M28 -213 L62 -190 L46 -163 L63 -149 L14 -65 L25 -157Z" fill="#1c3238" stroke="#70857e" strokeWidth="1"/>
      <path d="M-84 11 L-48 17 M44 16 L77 8 M-80 25 L-52 30" stroke="#92a092" strokeWidth="1.5" opacity=".65"/>
      {[-100,-73,-46,-19].map(y=><circle key={y} cx="2" cy={y} r="3" fill="#ead19a"/>)}
      <path d="M8 -70 Q66 -27 52 -94" fill="none" stroke="#dcb971" strokeWidth="2.2"/>
      <circle cx="51" cy="-95" r="4" fill="#dcc38b"/>
      {/* Neck and independently turning head. */}
      <g transform={`rotate(${head} 0 -217)`}>
        <path d="M-21 -246 L-22 -215 L-4 -193 L21 -215 L21 -254Z" fill="#b69261"/>
        <path d="M-22 -220 L-2 -201 L-20 -189 L-33 -211 M-2 -201 L22 -221 L30 -209 L12 -186Z" fill="#f2edde"/>
        <path d="M-37 -291 Q-41 -335 -4 -345 Q35 -349 45 -313 L42 -287 L54 -270 L44 -262 L37 -237 Q13 -221 -8 -236 L-27 -256Z" fill={`url(#${id}-skin)`} stroke="#d4bb8c" strokeWidth="1"/>
        <path d="M13 -321 L39 -309 L37 -283 L48 -270 L32 -266 L31 -241 L10 -235 L18 -264Z" fill="#b58c58" opacity=".6"/>
        <path d="M-37 -282 Q-59 -291 -39 -312 L-42 -326 Q-21 -359 14 -346 L39 -335 L46 -312 L30 -317 L19 -329 L-13 -315 L-23 -283 L-23 -258 L-34 -263Z" fill="#bec2af"/>
        <path d="M-40 -317 Q-20 -336 13 -333 M-37 -325 Q-18 -343 12 -339 M-25 -312 L-29 -285" fill="none" stroke="#f2e5c7" strokeWidth="2.2" opacity=".8"/>
        <path d="M-27 -283 Q-40 -293 -40 -277 Q-39 -263 -29 -265" fill="#c39e6a" stroke="#e2c490" strokeWidth="1.5"/>
        <path d="M-34 -280 L-30 -275 L-34 -270" fill="none" stroke="#8c6948" strokeWidth="1.5"/>
        <path d={`M13 ${-293-nod*.4} L31 -293 M36 -292 L43 -290`} stroke="#585447" strokeWidth="2.5"/>
        <circle cx="24" cy="-283" r="10" fill="none" stroke="#edd29a" strokeWidth="2"/>
        <path d="M34 -284 L41 -283 M14 -285 L-23 -285" stroke="#edd29a" strokeWidth="1.7"/>
        {(t%4.7)>4.53 ? <path d="M21-281Q25-279 29-281" stroke="#6f5342" strokeWidth="1.6" fill="none"/> : <>
          <path d="M21-281Q25-285 30-281" stroke="#6f5342" strokeWidth="1.2" fill="#dbbf8d"/>
          <ellipse cx={25+gaze*.7} cy={-281+reading*.8} rx="1.5" ry="1.7" fill="#463e34"/>
        </>}
        <path d="M30 -253 L42 -252 M25 -245 L36 -243" stroke="#6f5342" strokeWidth="1.8" fill="none"/>
      </g>
      {/* Near upper arm -> elbow -> wrist -> attached prop. */}
      <g transform={`rotate(${upper + Math.sin(t)*.7} 66 -175)`}>
        <path d="M55 -193 Q90 -207 104 -168 L110 -80 Q106 -57 88 -58 L65 -67 L58 -139Z" fill={suit} stroke="#85968a" strokeWidth="1.5"/>
        <path d="M87 -181 L94 -93" stroke="#a1ad97" strokeWidth="2" opacity=".45"/>
        <g transform={`rotate(${elbow + Math.sin(t * .9) * 1.3} 90 -75)`}>
          <path d="M72 -91 Q96 -107 111 -80 L122 -14 L105 13 L79 7 L76 -45Z" fill={suit} stroke="#80958c" strokeWidth="1.5"/>
          <path d="M102 -72 L111 -19" stroke="#a3af99" strokeWidth="1.5" opacity=".5"/>
          <path d="M81 0 L110 0 L112 19 L83 20Z" fill="#eee5d3"/>
          <circle cx="103" cy="10" r="3" fill="#c59d53"/>
          <g transform={`rotate(${wrist} 96 20)`}>
            {action === 'letter' && held === 'letter' && <g transform="translate(90 45) rotate(-14)">
              <path d="M-39 -94 L79 -94 L79 -12 L-39 -12Z" fill="#e7d5b1" stroke="#ba9e66" strokeWidth="1.4"/>
              <path d="M-38 -93 L20 -49 L78 -93 M-38 -12 L3 -51 M79 -12 L39 -52" fill="none" stroke="#b69a67" strokeWidth="1.5"/>
              <circle cx="21" cy="-49" r="10" fill="#9b5246"/>
              <path d="M17 -53 L24 -45 M24 -53 L17 -45" stroke="#d49c70" strokeWidth="1.2"/>
            </g>}
            {action === 'letter' && held === 'phone' && <g transform="translate(68 -65) rotate(-10 30 40)"><rect width="60" height="94" rx="9" fill="#182831" stroke="#a3b3a5" strokeWidth="3"/><rect x="6" y="10" width="48" height="67" rx="3" fill="#abc7bb"/><path d="M18 27H43M18 38H36M18 49H43" stroke="#52786b" strokeWidth="3"/><circle cx="30" cy="84" r="3" fill="#d4c9a7"/></g>}
            {action === 'letter' && held === 'card' && <g transform="translate(50 -26) rotate(-8)"><rect width="102" height="62" rx="7" fill="#b88f46"/><rect y="12" width="102" height="11" fill="#27393e"/><rect x="12" y="36" width="21" height="15" rx="2" fill="#e9d5a0"/></g>}
            {action === 'letter' && held === 'document' && <g transform="translate(52 -79) rotate(-12)"><rect width="98" height="117" rx="3" fill="#ece0c4"/>{[23,39,55,71,87].map(y=><path key={y} d={`M13 ${y}H83`} stroke="#9a967e" strokeWidth="3"/>)}</g>}
            <path d={action==='present' ?
              'M85 18L109 18L120 25L137 27Q145 30 138 34L119 34L140 39Q145 44 138 45L115 41L133 48Q138 54 130 54L109 46L123 56Q126 62 119 61L98 47L80 36Q74 26 85 18Z' : action==='point' ?
              'M85 18L110 18L118 32L113 48Q107 54 104 47L102 39L99 75Q94 81 91 75L92 38L79 31Q73 23 85 18Z' :
              'M85 18 L111 17 L120 30 L116 48 Q112 54 108 49 L107 36 L103 55 Q99 59 96 53 L96 39 L93 54 Q87 58 85 49 L82 36 L77 26 Q77 19 85 18Z'} fill={`url(#${id}-skin)`} stroke="#b38d5c" strokeWidth="1"/>
            <path d="M89 25L104 28M88 31L100 34" stroke="#936d49" strokeWidth=".9" opacity=".65" fill="none"/>
            {action === 'write' && <g transform="translate(103 34) rotate(-30)">
              <path d="M0 13 L12 -108 Q40 -74 0 13Z" fill="#e9ddbf"/>
              <path d="M0 25 L12 -108 M5 -29 L22 -54 M7 -52 L25 -76" fill="none" stroke="#b49b6d" strokeWidth="1.7"/>
            </g>}
          </g>
        </g>
      </g>
    </g>
  </g>;
};
