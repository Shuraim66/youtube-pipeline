import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Banker} from './Banker';
import {FONT_SANS, FONT_SERIF} from './theme';
import {captionPhrases} from './captionPhrases';
import timing from './moneyLeaksShortTiming.json';

const T=timing as any;
const gold='#d6b473', paper='#eadbb9', ink='#0b141b';
const lift=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const phrases=captionPhrases(T.captions,T.beats);

const Coins:React.FC<{f:number; dense?:boolean}>=({f,dense=false})=><g>
  {Array.from({length:dense?7:3},(_,i)=>{
    const x=dense?275+(i%4)*160:365+i*150;
    const y=dense?1040+Math.floor(i/4)*145:1040+((f*2+i*95)%180);
    return <g key={i} transform={`translate(${x} ${y})`} opacity={dense ? .85 : .95}>
      <ellipse rx="48" ry="18" fill="#070e13" opacity=".45" transform="translate(0 38)"/>
      <circle r="42" fill="#aa8246" stroke="#f0d39b" strokeWidth="4"/>
      <circle r="30" fill="none" stroke="#755b39" strokeWidth="3"/>
      <text y="15" textAnchor="middle" fontSize="38" fontFamily={FONT_SERIF} fill="#233238">$</text>
    </g>;
  })}
</g>;

const Phone:React.FC<{f:number;checked:boolean}>=({f,checked})=><g transform={`translate(540 ${1080+Math.sin(f/22)*5})`}>
  <rect x="-225" y="-310" width="450" height="620" rx="50" fill="#283b40" stroke="#d6b473" strokeWidth="7"/>
  <rect x="-203" y="-282" width="406" height="565" rx="30" fill="#e8dec4"/>
  <rect x="-72" y="-272" width="144" height="13" rx="7" fill="#283b40"/>
  <text x="0" y="-210" textAnchor="middle" fontFamily={FONT_SANS} fontSize="25" fontWeight="700" fill="#26373a">SAMPLE STATEMENT</text>
  <path d="M-164-180H164" stroke="#afa58d" strokeWidth="3"/>
  {['MONTHLY SUBSCRIPTION','ACCOUNT SERVICE FEE','STREAMING MEMBERSHIP'].map((label,i)=>{
    const y=-115+i*112;
    const active=checked&&i===1;
    return <g key={label}>
      <text x="-161" y={y} fontFamily={FONT_SANS} fontSize="18" letterSpacing=".2" fill="#334447">{label}</text>
      <text x="-161" y={y+36} fontFamily={FONT_SANS} fontSize="17" fill="#68736a">REPEATS MONTHLY</text>
      <text x="158" y={y+19} textAnchor="end" fontFamily={FONT_SERIF} fontSize="28" fontWeight="700" fill="#293d3e">${['8.99','4.99','12.99'][i]}</text>
      {active&&<ellipse cx="-57" cy={y-8} rx="108" ry="39" fill="none" stroke="#a45445" strokeWidth="6" transform="rotate(-4 -57 0)"/>}
      <path d={`M-162 ${y+53}H161`} stroke="#c4b89c" strokeWidth="2"/>
    </g>;
  })}
 </g>;

const Folder:React.FC<{f:number}>=({f})=><g>
  <path d="M300 1020V930Q300 900 332 900H471L510 936H764Q792 936 792 968V1378H300Z" fill="#526d65" stroke="#bda06c" strokeWidth="7"/>
  <path d="M300 1011H792V1378H300Z" fill="#e5d6b5" stroke="#8d774f" strokeWidth="5"/>
  <text x="545" y="1080" textAnchor="middle" fontFamily={FONT_SANS} fontSize="22" letterSpacing="4" fill="#52665b">YOUR NEXT GOAL</text>
  <path d="M365 1124H722" stroke="#9e987f" strokeWidth="3"/>
  <rect x="365" y="1162" width="300" height="15" rx="8" fill="#a7a18b"/>
  <rect x="365" y="1201" width="225" height="15" rx="8" fill="#a7a18b"/>
  <g transform={`translate(0 ${Math.sin(f/14)*9})`}>
   <Coins f={f} dense/>
  </g>
  <path d="M348 1284Q540 1244 743 1290" fill="none" stroke="#a45445" strokeWidth="7" strokeDasharray="9 12"/>
</g>;

const PaperStack:React.FC=()=><g>
 {[-1,0,1].map((i)=><g key={i} transform={`translate(${540+i*165} ${1060+i*25}) rotate(${i*5})`}>
  <rect x="-115" y="-200" width="230" height="390" rx="9" fill="#e8dec4" stroke="#a48a59" strokeWidth="4"/>
  <text x="0" y="-145" textAnchor="middle" fontFamily={FONT_SANS} fontSize="15" letterSpacing="2" fill="#44584e">MONTHLY</text>
  {[0,1,2,3].map(j=><g key={j}><path d={`M-78 ${-95+j*57}H56`} stroke="#aaa18a" strokeWidth="4"/><circle cx="78" cy={-98+j*57} r="16" fill="#d6b473"/></g>)}
 </g>)}
</g>;

export const MoneyLeaksShort:React.FC=()=>{
 const f=useCurrentFrame();
 const beatIndex=Math.max(0,T.beats.findIndex((b:any,i:number)=>f>=b.startFrame&&(f<(i===T.beats.length-1?900:b.endFrame))))||0;
 const beat=T.beats[Math.min(beatIndex,T.beats.length-1)];
 const stage=beatIndex;
 const phrase=phrases.find((p:any)=>f>=p.start&&f<p.end);
 const cta=stage>=T.beats.length-1;
 const title=['THE QUIET LEAKS','A CHARGE YOU FORGOT','THE FEE YOU MISSED','SMALL. REPEATED. COSTLY.','FIND ONE. CHOOSE.','WATCH THE FULL BREAKDOWN'][stage]||'15 MONEY TRAPS';
 const intro=lift(f,0,24);
 return <AbsoluteFill style={{background:ink,color:paper}}>
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position:'absolute',inset:0}}>
   <defs>
    <linearGradient id="short-bg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#294346"/><stop offset=".46" stopColor="#142a31"/><stop offset="1" stopColor="#091116"/></linearGradient>
    <radialGradient id="short-glow"><stop stopColor="#b28f58" stopOpacity=".32"/><stop offset="1" stopColor="#b28f58" stopOpacity="0"/></radialGradient>
   </defs>
   <rect width="1080" height="1920" fill="url(#short-bg)"/>
   <ellipse cx="565" cy="1070" rx="650" ry="660" fill="url(#short-glow)"/>
   <path d="M84 1370V405a456 456 0 0 1 912 0v965Z" fill="#263b3c" stroke="#927c56" strokeWidth="9" opacity=".72"/>
   <path d="M540 60V1368M90 840H990M90 1100H990" stroke="#172a2e" strokeWidth="16" opacity=".78"/>
   <path d="M0 1435H1080V1920H0Z" fill="#091116" opacity=".52"/>
   <image href={staticFile('emblem.png')} x="72" y="73" width="90" height="90"/>
   <text x="180" y="119" fontFamily={FONT_SERIF} fontSize="39" letterSpacing="1" fill={gold}>Aurelis</text>
   <text x="182" y="151" fontFamily={FONT_SANS} fontSize="16" letterSpacing="2" fill="#b3b8a7">MONEY / HABITS / SYSTEMS</text>
   <g opacity={intro}>
    <text x="540" y="354" textAnchor="middle" fontFamily={FONT_SANS} fontSize="22" letterSpacing="5" fill={gold}>15 MONEY TRAPS · ONE TO FIX TODAY</text>
    <text x="540" y="464" textAnchor="middle" fontFamily={FONT_SERIF} fontSize={stage>=4?48:56} fontWeight="700" fill={cta?gold:paper}>{title}</text>
    <path d="M280 504H800" stroke="#947a4d" strokeWidth="3"/>
    {stage===0&&<g transform={`translate(0 ${Math.sin(f/13)*9})`}>
      <path d="M323 1050Q320 996 379 978L673 948Q725 946 742 1004L768 1275Q770 1317 723 1328L377 1375Q329 1376 322 1337Z" fill="#3b5b56" stroke="#ceb078" strokeWidth="8"/>
      <path d="M354 1055L396 1023L445 1041L489 1006L536 1035L582 1000L632 1027L701 1003" fill="none" stroke="#0b171d" strokeWidth="15"/>
      <path d="M354 1055L396 1023L445 1041L489 1006L536 1035L582 1000L632 1027L701 1003" fill="none" stroke="#d6b473" strokeWidth="4"/>
      <Coins f={f}/>
    </g>}
    {(stage===1||stage===2)&&<Phone f={f} checked={stage===2}/>}
    {stage===3&&<Folder f={f}/>}
    {stage===4&&<g><PaperStack/><path d="M760 930q90-120 164-32t-12 152q-71 59-145 10" fill="none" stroke={gold} strokeWidth="13"/><circle cx="878" cy="988" r="14" fill={gold}/></g>}
    {stage===4&&<g><PaperStack/><path d="M378 994l19 20 39-47M378 1104l19 20 39-47" fill="none" stroke="#6b8068" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/></g>}
    {stage===5&&<g>
      <rect x="178" y="795" width="724" height="460" rx="32" fill="#172d33" stroke="#b69a61" strokeWidth="5"/>
      <text x="540" y="932" textAnchor="middle" fontFamily={FONT_SERIF} fontSize="86" fontWeight="700" fill={paper}>15 MONEY</text>
      <text x="540" y="1038" textAnchor="middle" fontFamily={FONT_SERIF} fontSize="86" fontWeight="700" fill={gold}>TRAPS</text>
      <path d="M300 1080H780" stroke="#8d754a" strokeWidth="3"/>
      <text x="540" y="1150" textAnchor="middle" fontFamily={FONT_SANS} fontSize="30" letterSpacing="2" fill="#d4d6c1">WATCH THE FULL BREAKDOWN</text>
      <path d="M540 1180V1220M522 1203L540 1221L558 1203" stroke={gold} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </g>}
    <path d="M0 1394H1080" stroke="#a18a5a" strokeWidth="4"/>
   </g>
  </svg>
  {!cta&&<div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
   <svg width="1080" height="1920" viewBox="0 0 1080 1920"><Banker x={760} y={1363} scale={1.08} action="point" stance="standing" id="money-leak-guide" gestureAt={beat?.startFrame||0}/></svg>
  </div>}
  {phrase&&<div style={{position:'absolute',left:94,right:94,bottom:266,minHeight:94,display:'flex',alignItems:'center',justifyContent:'center',flexWrap:'wrap',textAlign:'center',padding:'16px 24px',borderRadius:18,background:'rgba(7,15,19,.89)',border:'1px solid rgba(214,180,115,.48)',fontFamily:FONT_SANS,fontSize:38,fontWeight:650,lineHeight:1.25,boxShadow:'0 10px 40px rgba(0,0,0,.35)'}}>
   {phrase.words.map((w:any,i:number)=><span key={`${w.startFrame}-${i}`} style={{color:f>=w.startFrame&&f<w.endFrame?gold:paper,marginRight:10}}>{w.word}</span>)}
  </div>}
  {cta&&<div style={{position:'absolute',top:1320,left:0,right:0,textAlign:'center',fontFamily:FONT_SANS,fontSize:31,fontWeight:700,letterSpacing:3,color:gold}}>TAP THE RELATED VIDEO ↓</div>}
  <div style={{position:'absolute',left:0,right:0,bottom:0,height:5,background:'rgba(255,255,255,.14)'}}><div style={{height:'100%',width:`${f/899*100}%`,background:gold}}/></div>
 </AbsoluteFill>;
};
