// Reusable Aurelis flat-vector components — the scene LIBRARY.
// Every scene is assembled from these (like Alux: metaphor-objects + character + persistent UI).
import React from 'react';
import {useCurrentFrame, interpolate, spring, useVideoConfig, staticFile} from 'remotion';
import {C, FONT_SERIF, FONT_SANS} from './theme';

// ---------- the REAL character (AI flat-vector, fal/FLUX, commercial-licensed) ----------
// Whole-image "puppet" with a POSE LIBRARY. `pose` selects the illustration
// (neutral/triumph/despair/point — bg-removed PNGs in public/poses/); motion adds
// life on top (idle sway/breathe, entrance rise, fall). Poses read the emotional beat.
type Pose = 'neutral'|'triumph'|'despair'|'point';
export const TycoonImg: React.FC<{
  x:number; y:number; h?:number; pose?:Pose; mood?:'idle'|'enter'|'fall';
}> = ({x, y, h=1000, pose='neutral', mood='enter'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame:f, fps, config:{damping:16}});
  const sway = Math.sin(f/26)*0.8;
  const bob = Math.sin(f/22)*4;
  let rot = sway, ty = bob, scale = 1, opacity = 1;
  if (mood==='enter'){ scale = interpolate(enter,[0,1],[0.96,1]); ty = bob + interpolate(enter,[0,1],[24,0]); opacity = enter; }
  if (mood==='fall'){ const p = interpolate(f,[0,60],[0,1],{extrapolateRight:'clamp'});
    rot = -6 - p*20; ty = p*110; opacity = 1 - p*0.12; }
  const w = h * (896/1152);
  return (
    <div style={{position:'absolute', left:x - w/2, top:y - h, width:w, height:h,
      transform:`translateY(${ty}px) rotate(${rot}deg) scale(${scale})`,
      transformOrigin:'50% 92%', opacity, zIndex:8}}>
      <img src={staticFile(`poses/tycoon_${pose}.png`)} width={w} height={h}
        style={{display:'block', filter:'drop-shadow(0 26px 26px rgba(0,0,0,.32))'}}/>
    </div>
  );
};

// ---------- persistent brand UI (on every scene) — REAL Aurelis emblem (gold laurel + A) ----------
export const BrandMark: React.FC = () => (
  <div style={{position:'absolute', top:40, left:44, display:'flex', alignItems:'center', gap:14, zIndex:20}}>
    <img src={staticFile('emblem.png')} width={56} height={56} style={{display:'block'}}/>
    <span style={{fontFamily:FONT_SERIF, fontSize:30, color:C.gold, letterSpacing:0.5}}>Aurelis</span>
  </div>
);

// numbered progress ring (Alux's "#8 / #11 / #14" device) — optional per scene
export const ProgressRing: React.FC<{n:string; pct:number}> = ({n, pct}) => {
  const R = 40, circ = 2*Math.PI*R;
  return (
    <div style={{position:'absolute', top:40, right:44, zIndex:20}}>
      <svg width={104} height={104} viewBox="0 0 104 104">
        <circle cx={52} cy={52} r={44} fill={C.navy2}/>
        <circle cx={52} cy={52} r={R} fill="none" stroke={C.slate} strokeWidth={5}/>
        <circle cx={52} cy={52} r={R} fill="none" stroke={C.gold} strokeWidth={5}
                strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
                strokeLinecap="round" transform="rotate(-90 52 52)"/>
        <text x={52} y={62} textAnchor="middle" fontFamily={FONT_SERIF} fontWeight={600}
              fontSize={34} fill={C.ivory}>{n}</text>
      </svg>
    </div>
  );
};

// karaoke caption — bottom, sans, gold pop word
export const Caption: React.FC<{pre:string; pop:string; post?:string}> = ({pre, pop, post}) => (
  <div style={{position:'absolute', left:0, right:0, bottom:150, textAlign:'center', zIndex:20, padding:'0 60px'}}>
    <span style={{
      fontFamily:FONT_SANS, fontWeight:700, fontSize:42, lineHeight:1.5,
      color:'#fff', background:'rgba(11,14,19,.68)', padding:'6px 12px', borderRadius:8,
      boxDecorationBreak:'clone', WebkitBoxDecorationBreak:'clone',
    }}>
      {pre}<span style={{color:C.gold}}>{pop}</span>{post}
    </span>
  </div>
);

// frame-0 serif hook (two lines, peak->collapse, per the retention hook standard)
export const Hook: React.FC<{a:string; b:string; gold?:string}> = ({a, b}) => {
  const f = useCurrentFrame();
  const y = interpolate(f, [0, 8], [30, 0], {extrapolateRight:'clamp'});
  const o = interpolate(f, [0, 6], [0, 1], {extrapolateRight:'clamp'});
  return (
    <div style={{position:'absolute', left:0, right:0, top:170, textAlign:'center', zIndex:18,
                 padding:'0 60px', transform:`translateY(${y}px)`, opacity:o}}>
      <div style={{fontFamily:FONT_SERIF, fontWeight:600, fontSize:66, lineHeight:1.04,
                   color:C.ivory, textShadow:'0 3px 16px rgba(0,0,0,.6)'}}
           dangerouslySetInnerHTML={{__html:`${a}<br/><span style="color:${C.gold}">${b}</span>`}}/>
    </div>
  );
};

// ---------- DATA CARD (monetization-safety: original rendered numbers = "not mass-produced") ----------
// A premium dark-gold card with a big GOLD figure + label + optional sub. Counts up on entry.
// This is OUR own graphic with REAL cited numbers — the clearest human-value / non-slop signal.
export const DataCard: React.FC<{big:string; label:string; sub?:string; prefix?:string; suffix?:string}> =
({big, label, sub, prefix='', suffix=''}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame:f, fps, config:{damping:18}});
  // count-up if `big` is a plain number; else show as-is
  const num = parseFloat(big.replace(/[^0-9.]/g,''));
  const isNum = !isNaN(num) && /^[$£€]?[0-9.,]+[BMK%]?$/.test(big.trim());
  let shown = big;
  if (isNum){
    const cur = num * enter;
    const dec = big.includes('.') ? 1 : 0;
    shown = prefix + cur.toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec}) + suffix
            + (big.match(/[BMK%]$/)?big.match(/[BMK%]$/)![0]:'');
  }
  const cw=820, ch=560, cx=(1080-cw)/2, cy=(1920-ch)/2 - 60;
  const rise = interpolate(enter,[0,1],[40,0]);
  return (
    <div style={{position:'absolute', left:cx, top:cy+rise, width:cw, height:ch, opacity:enter, zIndex:9}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`}>
        <defs>
          <linearGradient id="cardg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141a26"/><stop offset="1" stopColor="#0b0e13"/>
          </linearGradient>
        </defs>
        <rect x={4} y={4} width={cw-8} height={ch-8} rx={28} fill="url(#cardg)"
              stroke={C.goldDk} strokeWidth={2}/>
        <rect x={22} y={22} width={cw-44} height={ch-44} rx={18} fill="none"
              stroke="#243040" strokeWidth={1.5}/>
      </svg>
      <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:18, padding:'0 48px'}}>
        <div style={{fontFamily:FONT_SERIF, fontWeight:600, fontSize:150, lineHeight:1,
          color:C.gold, letterSpacing:-1, fontVariantNumeric:'tabular-nums'}}>{shown}</div>
        <div style={{width:120, height:3, background:C.gold, opacity:0.8}}/>
        <div style={{fontFamily:FONT_SANS, fontWeight:700, fontSize:38, letterSpacing:1,
          textTransform:'uppercase', color:C.ivory, textAlign:'center'}}>{label}</div>
        {sub && <div style={{fontFamily:FONT_SANS, fontSize:26, color:C.muted ?? '#9aa3b0',
          textAlign:'center', lineHeight:1.4}}>{sub}</div>}
      </div>
    </div>
  );
};

// ---------- SOURCE TAG (monetization-safety: visible citation nobody else bothers with) ----------
export const SourceTag: React.FC<{text:string}> = ({text}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [4,14], [0,1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
  return (
    <div style={{position:'absolute', left:54, bottom:230, opacity:o, zIndex:19,
      display:'flex', alignItems:'center', gap:12,
      background:'rgba(11,14,19,.72)', padding:'8px 16px 8px 12px', borderRadius:10}}>
      <div style={{width:5, height:26, background:C.gold, borderRadius:3}}/>
      <span style={{fontFamily:FONT_SANS, fontSize:24, color:'#d6d2ca', letterSpacing:0.3}}>
        Source: {text}
      </span>
    </div>
  );
};

// ---------- backgrounds ----------
export const NavyBG: React.FC<{glow?:boolean}> = ({glow=true}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position:'absolute', inset:0, background:C.navy, overflow:'hidden'}}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
        {[1,2,3,4,5,6].map(i=>(
          <circle key={i} cx={540} cy={860} r={120+i*130} fill="none" stroke="#182031" strokeWidth={1.5}/>
        ))}
        {glow && <ellipse cx={540} cy={1680} rx={640} ry={200} fill={C.gold} opacity={0.06}/>}
        {/* slow drifting sparkle */}
        {[0,1,2,3].map(i=>{
          const a = f/40 + i*1.6;
          const x = 540 + Math.cos(a)*260, y = 700 + Math.sin(a)*160;
          return <circle key={'s'+i} cx={x} cy={y} r={3} fill={C.gold} opacity={0.5}/>;
        })}
      </svg>
    </div>
  );
};

// ---------- transitions (Alux-style shape wipes between scenes) ----------
// A gold diagonal panel sweeps across to cover, then reveals the next scene.
// Place at the END of an outgoing sequence (dir 'out') and START of the next (dir 'in').
export const Wipe: React.FC<{dir:'in'|'out'; dur:number; color?:string}> = ({dir, dur, color=C.gold}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  // out: panel enters from right covering everything by the end.
  // in:  panel starts covering, exits to the left.
  const p = spring({frame:f, fps, durationInFrames:dur, config:{damping:200}});
  const shiftOut = interpolate(p, [0,1], [1.25, 0]);   // 1.25W offscreen -> 0 covered
  const shiftIn  = interpolate(p, [0,1], [0, -1.25]);  // covered -> exit left
  const tx = (dir==='out'? shiftOut : shiftIn) * 1080;
  return (
    <div style={{position:'absolute', inset:0, zIndex:40, pointerEvents:'none',
      transform:`translateX(${tx}px) skewX(-12deg)`, transformOrigin:'center'}}>
      <div style={{position:'absolute', top:0, bottom:0, left:'-15%', width:'130%', background:color}}/>
      <div style={{position:'absolute', top:0, bottom:0, left:'-15%', width:'8%', background:C.goldLt}}/>
      <div style={{position:'absolute', top:0, bottom:0, left:'123%', width:'8%', background:C.goldDk}}/>
    </div>
  );
};

// ---------- metaphor objects ----------
export const Coin: React.FC<{x:number; y:number; r:number; struck?:boolean; delay?:number}> =
({x, y, r, struck=false, delay=0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame:f-delay, fps, config:{damping:12}});
  const bob = Math.sin((f-delay)/16)*6;
  const strike = struck ? interpolate(f, [delay+8, delay+16], [0,1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'}) : 0;
  return (
    <g transform={`translate(${x}, ${y+bob}) scale(${s})`}>
      <ellipse cx={0} cy={r+10} rx={r*0.8} ry={8} fill="#000" opacity={0.25}/>
      <circle cx={0} cy={0} r={r} fill={C.gold}/>
      <circle cx={0} cy={0} r={r-6} fill="none" stroke={C.goldDk} strokeWidth={3}/>
      <text x={0} y={r*0.34} textAnchor="middle" fontFamily={FONT_SERIF} fontSize={r} fill="#8a6a1e">$</text>
      {struck && (<g opacity={strike}>
        <line x1={-r} y1={-r} x2={r} y2={r} stroke={C.ox} strokeWidth={9} strokeLinecap="round"/>
        <line x1={-r} y1={r} x2={r} y2={-r} stroke={C.ox} strokeWidth={9} strokeLinecap="round"/>
      </g>)}
    </g>
  );
};

// gold-bar wealth tower that grows (peak) or topples (collapse)
export const Tower: React.FC<{cx:number; baseY:number; bars:number; topple?:number}> =
({cx, baseY, bars, topple=0}) => {
  const f = useCurrentFrame();
  const grow = interpolate(f, [4, 46], [0, 1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
  const items = [];
  for (let i=0;i<bars;i++){
    if (!topple && grow*bars <= i) continue;
    const w = 300 - i*30, h = 44;
    const baseYi = baseY - i*62;
    const t = topple * (i*i) * 0.6;
    const gx = cx - t*8, gy = baseYi + t*5, rot = t*1.5;
    items.push(
      <g key={i} transform={`translate(${gx-cx},${gy-baseYi}) rotate(${rot} ${cx} ${baseYi})`}>
        <rect x={cx-w/2} y={baseYi} width={w} height={h} rx={5} fill={topple?C.goldDk:C.gold} opacity={topple?1-topple*0.3:1}/>
        <rect x={cx-w/2} y={baseYi} width={w} height={13} rx={5} fill={C.goldLt}/>
      </g>
    );
  }
  return <g>{items}</g>;
};

// ---------- the character: "the tycoon" (rigged, illustrated flat-vector) ----------
// Broad-shouldered suit silhouette, two-tone jacket + gold pocket-square, styled hair,
// signature face-shadow facet (Alux device). Arms are rigged: an <Arm> rotates from the
// shoulder joint, so poses interpolate smoothly instead of being hard-swapped path art.
type Pose = 'up'|'head'|'down'|'present';
const SKIN = '#e9cfa6', SKIN_SH = '#d8b988', SUIT = '#f4efe6', SUIT_SH = '#ddd4c2', HAIR = '#2a2118';

const Arm: React.FC<{side:1|-1; shoulderRot:number; elbowRot:number; hand?:'open'|'head'}> =
({side, shoulderRot, elbowRot, hand='open'}) => (
  // upper arm pivots at shoulder (0,0 of this group); forearm pivots at elbow
  <g transform={`rotate(${shoulderRot*side})`}>
    <rect x={-11} y={0} width={22} height={62} rx={11} fill={SUIT}/>       {/* sleeve */}
    <rect x={-11} y={0} width={9} height={62} rx={9} fill={SUIT_SH}/>       {/* sleeve shade */}
    <g transform={`translate(0,60) rotate(${elbowRot*side})`}>
      <rect x={-9} y={0} width={18} height={50} rx={9} fill={SKIN}/>        {/* forearm */}
      {hand==='open'
        ? <circle cx={0} cy={52} r={11} fill={SKIN}/>
        : <circle cx={0} cy={50} r={12} fill={SKIN_SH}/>}
    </g>
  </g>
);

export const Tycoon: React.FC<{x:number; y:number; scale?:number; arm?:Pose; lean?:number; fall?:boolean}> =
({x, y, scale=1, arm='up', lean=0, fall=false}) => {
  const f = useCurrentFrame();
  const bob = fall ? 0 : Math.sin(f/20)*4;
  const breathe = fall ? 0 : Math.sin(f/22)*1.5;
  // pose -> shoulder/elbow angles (deg). Arm hangs DOWN (+y) at rot 0; rotation is
  // multiplied by `side` so both arms mirror. up = arms raised overhead & out;
  // head = hands to temples; present = arms out low; down = arms at sides.
  const P = {
    up:      {sh:168, el:-30, hand:'open' as const},  // arms overhead, forearms angle in toward center
    present: {sh:52,  el:26,  hand:'open' as const},
    down:    {sh:12,  el:7,   hand:'open' as const},
    head:    {sh:150, el:-60, hand:'head' as const},  // hands to temples
  }[arm];
  return (
    <g transform={`translate(${x},${y+bob}) scale(${scale}) rotate(${lean})`}>
      {!fall && <ellipse cx={0} cy={168} rx={78} ry={13} fill="#000" opacity={0.26}/>}
      {/* legs — tapered trousers */}
      <path d="M-30 70 Q-34 130 -30 166 L-10 166 L-6 78 Z" fill={C.char}/>
      <path d="M30 70 Q34 130 30 166 L10 166 L6 78 Z" fill={C.ink}/>
      <ellipse cx={-20} cy={168} rx={16} ry={7} fill={C.ink}/>{/* shoes */}
      <ellipse cx={20} cy={168} rx={16} ry={7} fill={C.ink}/>
      {/* back arm (behind torso) */}
      <g transform="translate(-40,-40)"><Arm side={-1} shoulderRot={P.sh} elbowRot={P.el} hand={P.hand}/></g>
      {/* torso — broad-shoulder suit jacket */}
      <path d="M-46 -46 Q0 -58 46 -46 L40 78 Q0 88 -40 78 Z" fill={SUIT}/>
      <path d="M0 -52 L-14 82 L0 84 Z" fill={SUIT_SH} opacity={0.7}/>{/* center shade */}
      {/* lapels + shirt V */}
      <path d="M0 -50 L-22 -30 L-6 44 L0 -6 Z" fill={SUIT_SH}/>
      <path d="M0 -50 L22 -30 L6 44 L0 -6 Z" fill={SUIT_SH}/>
      <path d="M0 -46 L-10 30 L0 36 L10 30 Z" fill={C.ivory}/>{/* shirt */}
      <path d="M0 -40 L-7 -8 L0 4 L7 -8 Z" fill={C.gold}/>{/* gold tie */}
      {/* gold pocket square */}
      <path d="M28 6 l14 -3 l-4 14 z" fill={C.gold} opacity={0.9}/>
      {/* front arm (over torso) */}
      <g transform="translate(40,-40)"><Arm side={1} shoulderRot={P.sh} elbowRot={P.el} hand={P.hand}/></g>
      {/* neck */}
      <path d="M-11 -58 L-9 -44 Q0 -40 9 -44 L11 -58 Z" fill={SKIN_SH}/>
      {/* head — rounded with a jaw */}
      <path d="M-27 -84 Q-28 -108 0 -110 Q28 -108 27 -84 Q27 -64 14 -58 Q0 -52 -14 -58 Q-27 -64 -27 -84 Z"
            fill={SKIN} transform={`translate(0,${breathe})`}/>
      {/* signature face-shadow facet (Alux) */}
      <path d="M0 -110 Q28 -108 27 -84 Q27 -64 14 -58 Q6 -55 0 -56 Z" fill={SKIN_SH} opacity={0.55}
            transform={`translate(0,${breathe})`}/>
      {/* hair — styled sweep */}
      <path d="M-28 -88 Q-30 -116 0 -116 Q30 -116 28 -88 Q20 -104 6 -100 Q0 -108 -8 -100 Q-20 -104 -28 -88 Z"
            fill={HAIR} transform={`translate(0,${breathe})`}/>
      {/* brows + eyes + mouth */}
      <g transform={`translate(0,${breathe})`}>
        <circle cx={-10} cy={-84} r={2.8} fill={HAIR}/>
        <circle cx={10} cy={-84} r={2.8} fill={HAIR}/>
        {fall
          ? <path d="M-9 -68 Q0 -76 9 -68" fill="none" stroke={HAIR} strokeWidth={3.2} strokeLinecap="round"/>
          : <path d="M-9 -70 Q0 -63 9 -70" fill="none" stroke={HAIR} strokeWidth={3.2} strokeLinecap="round"/>}
      </g>
      {/* laurel-crown motif above head (brand tie) */}
      <path d="M-20 -118 Q0 -136 20 -118" fill="none" stroke={C.gold} strokeWidth={3}
            transform={`translate(0,${breathe})`}/>
      <circle cx={0} cy={-125} r={4} fill={C.gold} transform={`translate(0,${breathe})`}/>
    </g>
  );
};

// ============================================================================
// SCRIPT-DRIVEN METAPHOR COMPONENTS (Rothschild + reusable for future scripts)
// ============================================================================

// ---------- EUROPE MAP: 5 cities light up + connecting network ----------
// Stylized (not geographic-accurate) — dots at rough relative positions, lines connect.
const CITIES: {name:string; x:number; y:number}[] = [
  {name:'Frankfurt', x:545, y:560},
  {name:'London',    x:380, y:430},
  {name:'Paris',     x:430, y:640},
  {name:'Vienna',    x:690, y:600},
  {name:'Naples',    x:610, y:830},
];
export const EuropeMap: React.FC<{lit?:number; showNames?:boolean}> = ({lit=5, showNames=false}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position:'absolute', inset:0}}>
      {/* faint continent blob */}
      <path d="M300 380 Q520 300 760 420 Q860 560 780 760 Q640 940 470 880 Q300 820 300 620 Z"
            fill="#131a26" stroke="#223047" strokeWidth={2}/>
      {/* connecting lines between lit cities (drawn progressively) */}
      {CITIES.slice(0,lit).map((c,i)=> CITIES.slice(0,lit).map((d,j)=> j>i ? (
        <line key={`${i}-${j}`} x1={c.x} y1={c.y} x2={d.x} y2={d.y}
              stroke={C.gold} strokeWidth={1.4} opacity={0.28}/>
      ) : null))}
      {/* city dots */}
      {CITIES.map((c,i)=>{
        const on = i < lit;
        const pulse = on ? 1 + Math.sin(f/10 + i)*0.12 : 0.6;
        return (
          <g key={c.name} opacity={on?1:0.25}>
            <circle cx={c.x} cy={c.y} r={on? 16*pulse : 9} fill={C.gold}/>
            {on && <circle cx={c.x} cy={c.y} r={26} fill="none" stroke={C.gold} strokeWidth={1.5} opacity={0.4}/>}
            {(showNames && on) && (
              <text x={c.x} y={c.y-32} textAnchor="middle" fontFamily={FONT_SANS}
                    fontSize={26} fontWeight={700} fill={C.ivory}>{c.name}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ---------- LEDGER: parchment page, lines write on (quill), for the 1875 Suez transaction ----------
export const Ledger: React.FC<{lines:string[]; stamp?:string}> = ({lines, stamp}) => {
  const f = useCurrentFrame();
  const px=180, pw=720, py=560, ph=820;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position:'absolute', inset:0}}>
      <rect x={px} y={py} width={pw} height={ph} rx={10} fill="#efe6cf" stroke="#c9bd9c" strokeWidth={3}/>
      <rect x={px} y={py} width={pw} height={ph} rx={10} fill="none" stroke="#d8cdaf" strokeWidth={1}/>
      {/* ruled lines */}
      {lines.map((_,i)=>(
        <line key={'r'+i} x1={px+50} y1={py+120+i*100} x2={px+pw-50} y2={py+120+i*100}
              stroke="#cbbf9e" strokeWidth={1}/>
      ))}
      {/* header */}
      <text x={px+pw/2} y={py+64} textAnchor="middle" fontFamily={FONT_SERIF} fontSize={34}
            fontWeight={600} fill="#5a4a2a">N M ROTHSCHILD &amp; SONS · 1875</text>
      <line x1={px+50} y1={py+88} x2={px+pw-50} y2={py+88} stroke="#8a7a52" strokeWidth={2}/>
      {/* entries write on, one per ~14 frames */}
      {lines.map((ln,i)=>{
        const start = 10 + i*16;
        const on = interpolate(f, [start, start+12], [0,1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
        return (
          <g key={i} opacity={on} clipPath="none">
            <text x={px+60} y={py+112+i*100} fontFamily={FONT_SERIF} fontSize={40} fill="#3a2f18"
                  style={{}}>{ln}</text>
          </g>
        );
      })}
      {stamp && (() => {
        const s = interpolate(f, [10+lines.length*16, 10+lines.length*16+12], [0,1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
        return (
          <g opacity={s} transform={`rotate(-12 ${px+pw-160} ${py+ph-120})`}>
            <rect x={px+pw-300} y={py+ph-170} width={240} height={90} rx={8}
                  fill="none" stroke={C.ox} strokeWidth={5}/>
            <text x={px+pw-180} y={py+ph-108} textAnchor="middle" fontFamily={FONT_SERIF}
                  fontSize={40} fontWeight={600} fill={C.ox}>{stamp}</text>
          </g>
        );
      })()}
    </svg>
  );
};

// ---------- SPLIT SCREEN: LEFT (old) vs RIGHT (new), weight shifts over time ----------
export const SplitScreen: React.FC<{
  leftLabel:string; rightLabel:string; shift?:number;  // 0 = balanced, 1 = right dominant
  leftIcon?:React.ReactNode; rightIcon?:React.ReactNode;
}> = ({leftLabel, rightLabel, shift=0, leftIcon, rightIcon}) => {
  const leftO = interpolate(shift, [0,1], [1, 0.35]);
  const rightO = interpolate(shift, [0,1], [0.5, 1]);
  return (
    <div style={{position:'absolute', inset:0, display:'flex'}}>
      <div style={{flex:1, background:'#141017', opacity:leftO, position:'relative',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24}}>
        {leftIcon}
        <div style={{fontFamily:FONT_SANS, fontWeight:700, fontSize:34, color:C.ivory,
          textTransform:'uppercase', letterSpacing:1, textAlign:'center', padding:'0 30px'}}>{leftLabel}</div>
      </div>
      <div style={{width:4, background:C.gold, opacity:0.5}}/>
      <div style={{flex:1, background:'#0c1420', opacity:rightO, position:'relative',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24}}>
        {rightIcon}
        <div style={{fontFamily:FONT_SANS, fontWeight:700, fontSize:34, color:C.gold,
          textTransform:'uppercase', letterSpacing:1, textAlign:'center', padding:'0 30px'}}>{rightLabel}</div>
      </div>
    </div>
  );
};

// ---------- VENN INSIGHT: two labeled circles + pulsing overlap (the thesis) ----------
export const VennInsight: React.FC<{leftLabel:string; rightLabel:string; centerLabel?:string}> =
({leftLabel, rightLabel, centerLabel}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = spring({frame:f, fps, config:{damping:20}});
  // circles closer together -> bigger, clearer overlap lens
  const r=240, cy=850, lx=445, rx=635;
  const circ = 2*Math.PI*r;
  const pulse = 0.5 + Math.abs(Math.sin(f/14))*0.5;
  const half = (rx-lx)/2;                 // half the center gap
  const lensRx = r - half;                // horizontal half-width of the overlap lens
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position:'absolute', inset:0}}>
      {/* overlap highlight (matches the true lens width) */}
      <ellipse cx={540} cy={cy} rx={lensRx} ry={r*0.82} fill={C.gold} opacity={0.12*pulse}/>
      {/* circles draw on */}
      <circle cx={lx} cy={cy} r={r} fill="none" stroke="#5b8bd0" strokeWidth={5}
              strokeDasharray={circ} strokeDashoffset={circ*(1-draw)} />
      <circle cx={rx} cy={cy} r={r} fill="none" stroke={C.gold} strokeWidth={5}
              strokeDasharray={circ} strokeDashoffset={circ*(1-draw)} />
      {/* side labels sit clear of the circles */}
      <text x={lx-120} y={cy-r-30} textAnchor="middle" fontFamily={FONT_SANS} fontWeight={700}
            fontSize={38} fill="#8fb4e6">{leftLabel}</text>
      <text x={rx+120} y={cy-r-30} textAnchor="middle" fontFamily={FONT_SANS} fontWeight={700}
            fontSize={38} fill={C.gold}>{rightLabel}</text>
      {/* center label BELOW the circles (full width available) with a tick line up to the overlap */}
      {centerLabel && (
        <g opacity={draw}>
          <line x1={540} y1={cy} x2={540} y2={cy+r+70} stroke={C.gold} strokeWidth={2} opacity={0.5}/>
          <circle cx={540} cy={cy} r={6} fill={C.gold}/>
          <text x={540} y={cy+r+120} textAnchor="middle" fontFamily={FONT_SERIF} fontWeight={600}
                fontSize={54} fill={C.ivory}>{centerLabel}</text>
        </g>
      )}
    </svg>
  );
};
