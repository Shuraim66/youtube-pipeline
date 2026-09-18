// Quick test: the REAL vectorized character in a scene, so we can judge it in-engine.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, W, H} from './theme';
import {BrandMark, ProgressRing, Hook, NavyBG, Tower, TycoonImg} from './components';

const SunBurst: React.FC<{cx:number; cy:number}> = ({cx, cy}) => {
  const f = useCurrentFrame(); const rays = 16;
  return <g opacity={0.14}>{Array.from({length:rays}).map((_,i)=>{
    const a=(i/rays)*Math.PI*2+f/120, x2=cx+Math.cos(a)*900, y2=cy+Math.sin(a)*900;
    const a2=((i+0.4)/rays)*Math.PI*2+f/120, x3=cx+Math.cos(a2)*900, y3=cy+Math.sin(a2)*900;
    return <path key={i} d={`M${cx} ${cy} L${x2} ${y2} L${x3} ${y3} Z`} fill={C.gold}/>;
  })}</g>;
};

export const CharacterTest: React.FC = () => (
  <AbsoluteFill style={{background:C.navy}}>
    <NavyBG/>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position:'absolute', inset:0}}>
      <SunBurst cx={540} cy={1000}/>
      <Tower cx={540} baseY={1120} bars={5}/>
    </svg>
    {/* the real AI character (triumph pose) standing at frame bottom-center */}
    <TycoonImg x={540} y={1800} h={1120} pose="triumph" mood="enter"/>
    <Hook a="He built an empire" b="from nothing."/>
    <BrandMark/>
    <ProgressRing n="7" pct={0.47}/>
  </AbsoluteFill>
);
