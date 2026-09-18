// Full production scene: a 3-beat "How Empires Die" micro-arc in Aurelis flat-vector.
// Beat 1 PEAK (0-3s) -> Beat 2 MISTAKE (3-6s) -> Beat 3 COLLAPSE (6-10s).
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';
import {C, FONT_SERIF, W, H} from './theme';
import {BrandMark, ProgressRing, Caption, Hook, NavyBG, Coin, Tower, Tycoon, Wipe} from './components';

// big bold headline typography scene (Alux "YOU CAN'T MAKE MANUFACTURE OF IT" device)
const BigHeadline: React.FC<{lines:string[]}> = ({lines}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position:'absolute', left:0, right:0, top:520, textAlign:'center', padding:'0 70px'}}>
      {lines.map((l,i)=>{
        const s = spring({frame:f-i*4, fps, config:{damping:14}});
        return <div key={i} style={{fontFamily:FONT_SERIF, fontWeight:600, fontSize:96, lineHeight:1.0,
          color:i===lines.length-1?C.gold:C.ivory, transform:`translateY(${(1-s)*40}px)`, opacity:s}}>{l}</div>;
      })}
    </div>
  );
};

// BEAT 1 — the peak: tower rises, tycoon triumphant
const Peak: React.FC = () => (
  <AbsoluteFill>
    <NavyBG/>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position:'absolute', inset:0}}>
      {/* sunburst reveal behind */}
      <SunBurst cx={540} cy={980}/>
      <Tower cx={540} baseY={1180} bars={7}/>
      <Tycoon x={540} y={1240} scale={1.5} arm="up"/>
    </svg>
    <Hook a="He built an empire" b="from nothing."/>
    <Caption pre="A fortune worth " pop="billions" post="."/>
  </AbsoluteFill>
);

// BEAT 2 — the mistake: struck-out coins, tycoon head-in-hands
const Mistake: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <NavyBG glow={false}/>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position:'absolute', inset:0}}>
        <Coin x={290} y={840} r={104} struck delay={2}/>
        <Coin x={790} y={880} r={116} struck delay={8}/>
        <Coin x={540} y={1120} r={148} struck delay={14}/>
        <Tycoon x={540} y={1560} scale={1.4} arm="head" lean={Math.sin(f/40)*3}/>
      </svg>
      {/* headline sits clearly ABOVE the coins (coins start ~y=736); no BigHeadline collision */}
      <Hook a="One bad" b="decision."/>
      <Caption pre="Then he made " pop="one mistake" post="."/>
    </AbsoluteFill>
  );
};

// BEAT 3 — the collapse: tower topples, coins fall, tycoon tumbles
const Collapse: React.FC = () => {
  const f = useCurrentFrame();
  const topple = interpolate(f, [6, 70], [0, 1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
  const fallP = interpolate(f, [10, 80], [0, 1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
  return (
    <AbsoluteFill>
      <NavyBG glow={false}/>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position:'absolute', inset:0}}>
        <Tower cx={540} baseY={1180} bars={7} topple={topple}/>
        {[0,1,2,3,4].map(i=>{
          const p = ((f*2 + i*40) % 200);
          return <Coin key={i} x={180+i*180} y={360+p*3} r={34}/>;
        })}
        <Tycoon x={450+Math.sin(f/30)*16} y={1140+fallP*90} scale={1.5} arm="down" lean={-16-fallP*26} fall/>
      </svg>
      <Hook a="Then it all" b="vanished."/>
      <Caption pre="It " pop="collapsed" post=" in weeks."/>
    </AbsoluteFill>
  );
};

// low-poly sunburst rays (Alux "triumph" device)
const SunBurst: React.FC<{cx:number; cy:number}> = ({cx, cy}) => {
  const f = useCurrentFrame();
  const rays = 16;
  return <g opacity={0.14}>{Array.from({length:rays}).map((_,i)=>{
    const a = (i/rays)*Math.PI*2 + f/120;
    const x2 = cx+Math.cos(a)*900, y2 = cy+Math.sin(a)*900;
    const a2 = ((i+0.4)/rays)*Math.PI*2 + f/120;
    const x3 = cx+Math.cos(a2)*900, y3 = cy+Math.sin(a2)*900;
    return <path key={i} d={`M${cx} ${cy} L${x2} ${y2} L${x3} ${y3} Z`} fill={C.gold}/>;
  })}</g>;
};

const WIPE = 18; // frames the gold panel takes to sweep across
export const CollapseScene: React.FC = () => (
  <AbsoluteFill style={{background:C.navy}}>
    <Sequence durationInFrames={90}><Peak/></Sequence>
    <Sequence from={90} durationInFrames={90}><Mistake/></Sequence>
    <Sequence from={180} durationInFrames={120}><Collapse/></Sequence>
    {/* gold shape-wipe transitions covering each cut (Alux-style).
        At each boundary: panel sweeps IN over the outgoing beat's tail, then OUT revealing the next. */}
    <Sequence from={90-WIPE} durationInFrames={WIPE}><Wipe dir="out" dur={WIPE}/></Sequence>
    <Sequence from={90} durationInFrames={WIPE}><Wipe dir="in" dur={WIPE}/></Sequence>
    <Sequence from={180-WIPE} durationInFrames={WIPE}><Wipe dir="out" dur={WIPE}/></Sequence>
    <Sequence from={180} durationInFrames={WIPE}><Wipe dir="in" dur={WIPE}/></Sequence>
    {/* persistent UI across all beats */}
    <BrandMark/>
    <ProgressRing n="7" pct={0.47}/>
  </AbsoluteFill>
);
