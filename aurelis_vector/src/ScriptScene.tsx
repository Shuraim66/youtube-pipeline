// Data-driven scene: reads timing.json (produced by build.py from the script + Kokoro VO)
// and renders each beat for its narration-timed frame window, with word-synced captions.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate, useVideoConfig} from 'remotion';
import {C, FONT_SERIF, FONT_SANS, W, H} from './theme';
import {BrandMark, ProgressRing, Hook, NavyBG, Coin, Tower, TycoonImg, Wipe, DataCard, SourceTag,
        EuropeMap, Ledger, SplitScreen, VennInsight} from './components';
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

// ---- Rothschild / general metaphor scenes (data-driven per beat) ----
const MapScene: React.FC<{hook:string[]; data?:any}> = ({hook, data}) => (
  <AbsoluteFill>
    <NavyBG glow={false}/>
    <EuropeMap lit={data?.lit ?? 5} showNames={!!data?.names}/>
    {data?.title && <Hook a={hook?.[0] ?? ''} b={hook?.[1] ?? ''}/>}
  </AbsoluteFill>
);

const LedgerScene: React.FC<{hook:string[]; data?:any}> = ({data}) => (
  <AbsoluteFill>
    <NavyBG glow={false}/>
    <Ledger lines={data?.lines ?? []} stamp={data?.stamp}/>
  </AbsoluteFill>
);

// simple flat-vector icons for the split-screen halves
const BankIcon = (
  <svg width={260} height={200} viewBox="0 0 260 200">
    <polygon points="130,20 250,80 10,80" fill={C.ivory}/>
    <rect x={20} y={80} width={220} height={14} fill={C.gold}/>
    {[40,90,140,190].map(x=><rect key={x} x={x} y={98} width={24} height={80} fill={C.ivory}/>)}
    <rect x={10} y={182} width={240} height={16} fill={C.gold}/>
    <circle cx={130} cy={52} r={10} fill={C.gold}/>
  </svg>
);
const MarketIcon = (
  <svg width={260} height={200} viewBox="0 0 260 200">
    <rect x={10} y={10} width={240} height={160} rx={10} fill="none" stroke={C.gold} strokeWidth={4}/>
    {/* rising line chart */}
    <polyline points="30,150 80,120 120,135 170,70 230,40" fill="none" stroke={C.gold} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round"/>
    {[
      [80,120],[170,70],[230,40]
    ].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={7} fill={C.goldLt}/>)}
    <polygon points="230,40 222,54 238,54" fill={C.goldLt}/>
  </svg>
);
const SplitScene: React.FC<{hook:string[]; data?:any}> = ({data}) => (
  <AbsoluteFill>
    <SplitScreen leftLabel={data?.left ?? ''} rightLabel={data?.right ?? ''} shift={data?.shift ?? 0}
                 leftIcon={BankIcon} rightIcon={MarketIcon}/>
  </AbsoluteFill>
);

const VennScene: React.FC<{hook:string[]; data?:any}> = ({data}) => (
  <AbsoluteFill>
    <NavyBG glow={false}/>
    <VennInsight leftLabel={data?.left ?? 'BUILDS'} rightLabel={data?.right ?? 'SUSTAINS'}
                 centerLabel={data?.center}/>
  </AbsoluteFill>
);

// CTA / brand outro
const CtaScene: React.FC<{hook:string[]; data?:any}> = ({data}) => (
  <AbsoluteFill style={{background:C.navy}}>
    <NavyBG/>
    <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:30}}>
      <div style={{fontFamily:FONT_SERIF, fontSize:76, fontWeight:600, color:C.ivory, textAlign:'center'}}>
        {data?.series ?? 'How Empires Die'}
      </div>
      <div style={{width:140, height:3, background:C.gold}}/>
      <div style={{fontFamily:FONT_SANS, fontSize:34, color:'#9aa3b0', letterSpacing:1}}>
        {data?.cta ?? 'Follow for more'}
      </div>
    </div>
  </AbsoluteFill>
);

// STAT scene — full-frame DATA CARD (monetization-safety: original cited number).
// Beat props: big, label, sub?, prefix?, suffix?  (e.g. big:"47", prefix:"$", suffix:"B")
const Stat: React.FC<{hook:string[]; data?:any}> = ({data}) => (
  <AbsoluteFill>
    <NavyBG glow={false}/>
    <DataCard big={data?.big ?? '0'} label={data?.label ?? ''} sub={data?.sub}
              prefix={data?.prefix} suffix={data?.suffix}/>
  </AbsoluteFill>
);

const SCENES: Record<string, React.FC<{hook:string[]; data?:any}>> =
  {peak:Peak, mistake:Mistake, collapse:Collapse, stat:Stat,
   map:MapScene, ledger:LedgerScene, split:SplitScene, venn:VennScene, cta:CtaScene};

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
            <Comp hook={b.hook ?? ['','']} data={b.data}/>
            {/* per-beat source citation (monetization-safety) — beat has "source":"<citation>" */}
            {b.source && <SourceTag text={b.source}/>}
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
      {/* ProgressRing removed — it was an Alux list-counter ("#8 of 15"); meaningless for narrative videos */}
    </AbsoluteFill>
  );
};
