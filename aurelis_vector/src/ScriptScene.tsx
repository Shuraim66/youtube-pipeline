// Data-driven scene: reads timing.json (produced by build.py from the script + Kokoro VO)
// and renders each beat for its narration-timed frame window, with word-synced captions.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate, useVideoConfig} from 'remotion';
import {C, FONT_SERIF, FONT_SANS, W, H} from './theme';
import {BrandMark, ProgressRing, Hook, NavyBG, Coin, Tower, TycoonImg, Wipe} from './components';
import timing from './timing.json';

// ---- individual scene renderers (the library; keyed by beat.scene) ----
// Each uses the REAL fal/FLUX character (TycoonImg) with a pose matched to the beat.
const Peak: React.FC<{hook:string[]}> = ({hook}) => (
  <AbsoluteFill>
    <NavyBG/>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position:'absolute', inset:0}}>
      <SunBurst cx={540} cy={900}/>
      <Tower cx={540} baseY={1060} bars={6}/>
    </svg>
    <TycoonImg x={540} y={1820} h={1180} pose="triumph" mood="enter"/>
    <Hook a={hook[0]} b={hook[1]}/>
  </AbsoluteFill>
);

const Mistake: React.FC<{hook:string[]}> = ({hook}) => (
  <AbsoluteFill>
    <NavyBG glow={false}/>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position:'absolute', inset:0}}>
      {/* coins arc ABOVE the character's head (head sits ~y=880 at this height) — no overlap */}
      <Coin x={250} y={560} r={100} struck delay={2}/>
      <Coin x={540} y={470} r={128} struck delay={14}/>
      <Coin x={830} y={560} r={112} struck delay={8}/>
    </svg>
    <TycoonImg x={540} y={1860} h={1080} pose="despair" mood="enter"/>
    <Hook a={hook[0]} b={hook[1]}/>
  </AbsoluteFill>
);

const Collapse: React.FC<{hook:string[]}> = ({hook}) => {
  const f = useCurrentFrame();
  const topple = interpolate(f, [6, 70], [0, 1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
  return (
    <AbsoluteFill>
      <NavyBG glow={false}/>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position:'absolute', inset:0}}>
        <Tower cx={540} baseY={1000} bars={6} topple={topple}/>
        {[0,1,2,3,4].map(i=>{
          const p = ((f*2 + i*40) % 200);
          return <Coin key={i} x={180+i*180} y={300+p*3} r={32}/>;
        })}
      </svg>
      <TycoonImg x={540} y={1860} h={1080} pose="despair" mood="fall"/>
      <Hook a={hook[0]} b={hook[1]}/>
    </AbsoluteFill>
  );
};

const SunBurst: React.FC<{cx:number; cy:number}> = ({cx, cy}) => {
  const f = useCurrentFrame(); const rays = 16;
  return <g opacity={0.14}>{Array.from({length:rays}).map((_,i)=>{
    const a=(i/rays)*Math.PI*2+f/120, x2=cx+Math.cos(a)*900, y2=cy+Math.sin(a)*900;
    const a2=((i+0.4)/rays)*Math.PI*2+f/120, x3=cx+Math.cos(a2)*900, y3=cy+Math.sin(a2)*900;
    return <path key={i} d={`M${cx} ${cy} L${x2} ${y2} L${x3} ${y3} Z`} fill={C.gold}/>;
  })}</g>;
};

const SCENES: Record<string, React.FC<{hook:string[]}>> = {peak:Peak, mistake:Mistake, collapse:Collapse};

// ---- word-synced karaoke caption (reads timing.captions, ~3 words visible) ----
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const cues = timing.captions as {word:string; startFrame:number; endFrame:number}[];
  // find the active cue, show it with its 2 neighbors as a rolling 3-word window
  let idx = cues.findIndex(c => f >= c.startFrame && f < c.endFrame);
  if (idx === -1) { // between words: hold the last-started
    for (let i=cues.length-1;i>=0;i--){ if (f>=cues[i].startFrame){ idx=i; break; } }
  }
  if (idx < 0) return null;
  const start = Math.max(0, idx-1), win = cues.slice(start, start+3);
  return (
    <div style={{position:'absolute', left:0, right:0, bottom:150, textAlign:'center', zIndex:22, padding:'0 60px'}}>
      <span style={{fontFamily:FONT_SANS, fontWeight:700, fontSize:44, lineHeight:1.5, color:'#fff',
        background:'rgba(11,14,19,.68)', padding:'6px 14px', borderRadius:8,
        boxDecorationBreak:'clone', WebkitBoxDecorationBreak:'clone'}}>
        {win.map((c,i)=>(
          <span key={start+i} style={{color: f>=c.startFrame && f<c.endFrame ? C.gold : '#fff'}}>
            {c.word}{i<win.length-1?' ':''}
          </span>
        ))}
      </span>
    </div>
  );
};

const WIPE = 16;
export const ScriptScene: React.FC = () => {
  const beats = timing.beats as any[];
  return (
    <AbsoluteFill style={{background:C.navy}}>
      {beats.map((b, i) => {
        const Comp = SCENES[b.scene] ?? Peak;
        const dur = b.endFrame - b.startFrame;
        return (
          <Sequence key={i} from={b.startFrame} durationInFrames={Math.max(1,dur)}>
            <Comp hook={b.hook ?? ['','']}/>
          </Sequence>
        );
      })}
      {/* transitions at each beat boundary (skip the first) */}
      {beats.slice(1).map((b,i)=>(
        <React.Fragment key={'w'+i}>
          <Sequence from={b.startFrame-WIPE} durationInFrames={WIPE}><Wipe dir="out" dur={WIPE}/></Sequence>
          <Sequence from={b.startFrame} durationInFrames={WIPE}><Wipe dir="in" dur={WIPE}/></Sequence>
        </React.Fragment>
      ))}
      <Captions/>
      <BrandMark/>
      <ProgressRing n="7" pct={0.47}/>
    </AbsoluteFill>
  );
};
