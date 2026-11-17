import React, {createContext, useContext} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Banker} from './Banker';

export type MotionCue = {start:number; end:number};
export type SceneData = {motion?:Record<string,MotionCue>};
export const MotionContext = createContext<Record<string,MotionCue>>({});
export const useMotion = (name:string, start=0, end=30):MotionCue =>
  useContext(MotionContext)[name] ?? {start,end};
export const amountAt = (frame:number,cue:MotionCue) => interpolate(
  frame,[cue.start,Math.max(cue.start+1,cue.end)],[0,1],
  {extrapolateLeft:'clamp',extrapolateRight:'clamp'});

export const BrassRule:React.FC<{x:number;y:number;width:number;progress?:number}> =
({x,y,width,progress=1}) => <g stroke="#d6b473" strokeWidth="2">
  <path d={`M${x} ${y}h${width*progress}`}/>
  <path d={`M${x+width*progress-4} ${y-4}l4 4-4 4`} fill="none"/>
</g>;

export const CompassRose:React.FC<{x:number;y:number;scale?:number}> = ({x,y,scale=1}) =>
  <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="#d6b473" fill="none" opacity=".55">
    <circle r="30" strokeWidth="1"/><circle r="23" strokeWidth=".7" strokeDasharray="2 6"/>
    <path d="M0-40V40M-40 0H40M-21-21L21 21M21-21L-21 21" strokeWidth="1"/>
    <path d="M0-22L5 0 0 22-5 0Z" fill="#d6b473" fillOpacity=".4"/>
    <circle r="3" fill="#d6b473"/>
  </g>;

export const GuideMedallion:React.FC<{x:number;y:number;action?:'point'|'present'|'consider';id:string}> =
({x,y,action='point',id}) => {
  const cue=useMotion(action==='point'?'frankfurt':'builds',15,45);
  return <g>
  <defs><clipPath id={`${id}-mask`}><circle cx={x} cy={y} r="92"/></clipPath></defs>
  <circle cx={x} cy={y} r="97" fill="#112127" stroke="#586c62" strokeWidth="1.5"/>
  <g clipPath={`url(#${id}-mask)`}>
    <Banker x={x-8} y={y+153} scale={.7} action={action} id={id} gestureAt={cue.start-10}/>
  </g>
  <path d={`M${x-65} ${y+79}q65 36 130 0`} stroke="#d6b473" fill="none" strokeWidth="1.5"/>
</g>;
};

export const AurelisTransition:React.FC<{kind:'ink'|'paper'|'brass'}> = ({kind}) => {
  const f=useCurrentFrame();
  const ease=(p:number)=>p*p*(3-2*p);
  const x=f<9?1200*(1-ease(f/8)):-1200*ease((f-9)/8);
  const paper=kind==='paper';
  return <AbsoluteFill style={{zIndex:18,pointerEvents:'none'}}>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920">
      <g transform={`translate(${x} 0)`}>
        <path d="M-100-20H1190V1940H-100Z" fill={paper?'#b6a079':'#0b141b'}/>
        {paper ? <>
          <path d="M-100-20Q80 600-60 1100Q30 1600-80 1940H35Q130 1400 80 900Q120 400 35-20Z" fill="#d6c29c"/>
          <path d="M40-20Q110 700 55 1100Q75 1600 25 1940" fill="none" stroke="#75664e" strokeWidth="3" opacity=".4"/>
          {[0,1,2].map(i=><path key={i} d={`M${130+i*13} 0V1920`} stroke="#8b7a59" opacity=".25"/>)}
        </> : kind==='brass' ? <>
          <path d="M-60-20H-43V1940H-60Z" fill="#d6b473"/>
          <path d="M-22-20V1940" stroke="#63786b" strokeWidth="2"/>
          <CompassRose x={70} y={980} scale={1.2}/>
        </> : <>
          <path d="M-100 0L18 340-68 820 28 1420-100 1920Z" fill="#263e40"/>
          <path d="M-62 0L38 550-12 1100 48 1600-55 1920" fill="none" stroke="#d6b473" opacity=".45" strokeWidth="2"/>
        </>}
      </g>
    </svg>
  </AbsoluteFill>;
};
