import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import timing from './timing.json';
import {Banker} from './Banker';
import {C, FONT_SANS, FONT_SERIF} from './theme';
import {captionPhrases} from './captionPhrases';

const T=timing as any;
const ease=(f:number,a=0,b=30)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const Text:React.FC<{x:number;y:number;children:React.ReactNode;size?:number;color?:string;anchor?:'start'|'middle'|'end'}>=({x,y,children,size=24,color=C.ivory,anchor='start'})=><text x={x} y={y} fill={color} fontSize={size} fontFamily={FONT_SANS} textAnchor={anchor}>{children}</text>;
const Paper:React.FC<{x:number;y:number;title?:string;scale?:number}>=({x,y,title='PLAN',scale=1})=><g transform={`translate(${x} ${y}) scale(${scale})`}><rect width="170" height="210" rx="8" fill={C.cream}/><rect x="18" y="22" width="38" height="5" fill={C.goldDk}/><Text x={18} y={58} size={18} color={C.ink}>{title}</Text>{[85,112,139,166].map((p,i)=><path key={p} d={`M18 ${p}H${i%2?115:150}`} stroke="#a7a393" strokeWidth="4"/>)}</g>;
const Coin:React.FC<{x:number;y:number;r?:number}>=({x,y,r=26})=><g><circle cx={x} cy={y} r={r} fill={C.goldDk}/><circle cx={x} cy={y} r={r*.78} fill={C.gold} stroke={C.goldLt} strokeWidth="2"/><Text x={x} y={y+r*.32} size={r} color={C.ink} anchor="middle">$</Text></g>;

// Original supporting character with separate silhouette, face and clothing.
export const Colleague:React.FC<{x:number;y:number;stance?:'standing'|'seated'}>=({x,y,stance})=>{
 const f=useCurrentFrame(); const nod=Math.sin(f/42)*1.5;
 return <g transform={`translate(${x} ${y})`}>
  {stance==='standing'?<g>
   <path d="M-57 0H-5L-18 127L-24 235H-61L-58 122ZM-5 0H53L58 124L70 235H32L13 128Z" fill="#223b48" stroke="#607771" strokeWidth="2"/>
   <path d="M-39 38L-42 217M30 38L40 124L49 218" fill="none" stroke="#779089" strokeWidth="2" opacity=".5"/>
   <path d="M-61 229H-24L-11 244Q-8 252-23 254H-77Q-88 249-73 240ZM32 229H70L91 242Q101 251 82 254H32Z" fill="#17292f"/>
  </g>:stance==='seated'?<g transform="scale(1 .8)">
   <path d="M-57 0H45L-8 91L-48 111L-58 232H-92L-91 91L-34 40Z" fill="#1b303b" stroke="#607771" strokeWidth="2"/>
   <path d="M-8 0H54L31 102L9 237H-27L-14 89L-49 69Z" fill="#294450" stroke="#607771" strokeWidth="2"/>
   <path d="M-92 225H-58L-45 244H-105Q-118 241-108 235ZM-27 230H9L25 246H-40Q-51 242-39 236Z" fill="#17292f"/>
  </g>:<g>
  <path d="M-57 0L-58 145H-21L-8 30L22 145H60L53 0" fill="#223b48"/>
  <path d="M-58 137H-21L-8 153Q-7 161-20 163H-72Q-82 156-68 149ZM22 138H60L79 151Q88 160 72 163H22Z" fill="#17292f"/>
  </g>}
  <path d="M-61-167Q0-201 60-165L75 6H-76Z" fill="#8a5550" stroke="#bb8376" strokeWidth="2"/>
  <path d="M-20-175L0-134L24-175" fill={C.cream}/>
  <g transform={`rotate(${nod} 0 -190)`}><path d="M-40-222Q-58-291 0-295Q53-292 42-223L30-180H-32Z" fill="#171c22"/><rect x="-12" y="-202" width="26" height="34" fill="#bb876a"/><ellipse cx="0" cy="-236" rx="34" ry="46" fill="#d5a080"/><path d="M-36-254Q-9-299 35-264L39-242Q18-248 7-272Q-4-249-36-243Z" fill="#242a30"/><path d="M-23-238H-13M11-238H21M-10-211Q0-206 12-212" fill="none" stroke="#5c3e36" strokeWidth="3"/></g>
  <path d="M-52-155Q-90-105-104-62L-150-69" fill="none" stroke="#8a5550" strokeWidth="32" strokeLinecap="round"/>
  <path d="M-150-69L-173-70" stroke="#d5a080" strokeWidth="20" strokeLinecap="round"/>
  <path d="M53-153L83-53L30-45" fill="none" stroke="#8a5550" strokeWidth="29" strokeLinecap="round"/>
  <path d="M30-45L8-44" stroke="#d5a080" strokeWidth="19" strokeLinecap="round"/>
 </g>;
};

const Room:React.FC<{bank?:boolean}>=({bank=false})=><g>
 <rect x="650" y="240" width="1140" height="620" rx="20" fill="#18272e"/>
 {[710,1040,1370].map(x=><g key={x}><rect x={x} y="278" width="260" height="290" rx="3" fill="#283d45"/><path d={`M${x+130} 278V568M${x} 423H${x+260}`} stroke="#516260" strokeWidth="7"/><path d={`M${x+15} 550V470H${x+60}V450H${x+112}V500H${x+180}V460H${x+245}V550`} fill="#1e3038"/></g>)}
 <path d="M650 780H1790" stroke="#5b6258" strokeWidth="3"/>
 {bank&&<g><path d="M980 355L1200 255L1420 355Z" fill={C.cream}/><rect x="985" y="357" width="430" height="24" fill={C.goldDk}/>{[1020,1130,1240,1350].map(x=><rect key={x} x={x} y="384" width="35" height="230" fill="#c2bfae"/>)}<rect x="972" y="618" width="458" height="26" fill={C.goldDk}/><Text x={1200} y={343} color={C.ink} anchor="middle">BANK</Text></g>}
 <path d="M1690 795V686M1690 730Q1590 677 1650 631Q1695 638 1690 730M1690 748Q1777 674 1746 652Q1695 658 1690 748" fill="#557267" stroke="#7b8d72" strokeWidth="4"/>
 <path d="M1652 780H1730L1715 840H1666Z" fill="#aa8361"/>
</g>;

export const ObjectArt:React.FC<{kind:string;f:number;carMode?:'repair'|'purchase'}>=({kind,f,carMode='repair'})=>{
 const p=ease(f,8,90); const bob=Math.sin(f/35)*4;
 if(kind==='bank')return <g><path d="M850 405L1200 260L1550 405Z" fill={C.cream}/><rect x="860" y="410" width="680" height="28" fill={C.goldDk}/>{[915,1075,1235,1395].map(x=><g key={x}><rect x={x} y="442" width="65" height="255" fill="#bfc5b4"/><rect x={x-9} y="689" width="83" height="20" fill={C.cream}/></g>)}<rect x="839" y="718" width="722" height="30" fill={C.gold}/><Text x={1200} y={383} color={C.ink} size={36} anchor="middle">BORROWING</Text><Paper x={1410} y={568} scale={.8} title="TERMS"/></g>;
 if(kind==='time')return <g><circle cx="1165" cy="505" r="182" fill="#1d3039" stroke={C.gold} strokeWidth="9"/>{Array.from({length:12},(_,i)=><path key={i} d="M1165 345V364" transform={`rotate(${i*30} 1165 505)`} stroke={C.cream} strokeWidth="5"/>)}<path d="M1165 505V405M1165 505L1260 550" fill="none" stroke={C.ivory} strokeWidth="10" strokeLinecap="round" transform={`rotate(${p*15} 1165 505)`}/><circle cx="1165" cy="505" r="12" fill={C.gold}/><Text x={1165} y={758} size={34} anchor="middle">30 MINUTES / YOUR CHOICE</Text></g>;
 if(kind==='phone'||kind==='scam')return <g transform={`translate(0 ${bob})`}><rect x="1020" y="290" width="330" height="480" rx="40" fill="#283940" stroke="#7f8d85" strokeWidth="5"/><rect x="1040" y="325" width="290" height="390" rx="14" fill={C.cream}/><rect x="1127" y="303" width="110" height="8" rx="4" fill={C.ink}/><Text x={1185} y={393} color={C.ink} size={28} anchor="middle">{kind==='scam'?'GUARANTEED?':'BUY NOW?'}</Text><circle cx="1185" cy="493" r="54" fill={kind==='scam'?C.ox:C.gold}/><Text x={1185} y={513} size={56} anchor="middle">{kind==='scam'?'?':'$'}</Text><rect x="1070" y="594" width="230" height="65" rx="10" fill="#2b5149"/><Text x={1185} y={636} anchor="middle">{kind==='scam'?'VERIFY FIRST':'PAUSE 24H'}</Text><circle cx="1185" cy="744" r="13" fill={C.gold}/></g>;
 if(kind==='car')return <g><path d="M920 570L986 447H1306L1420 570L1500 600V711H872V606Z" fill="#58756e" stroke="#92a89a" strokeWidth="5"/><path d="M1011 466H1141V559H966ZM1161 466H1293L1379 559H1161Z" fill="#233d49"/>{[1000,1370].map(x=><g key={x}><circle cx={x} cy="706" r="65" fill="#0e171e"/><circle cx={x} cy="706" r="31" fill="#859187"/></g>)}<Paper x={1430} y={325} scale={.8} title={carMode==='repair'?'REPAIR':'PAYMENTS'}/><Text x={1170} y={377} size={30} anchor="middle">{carMode==='repair'?'UNEXPECTED EXPENSE':'MONTHLY COMMITMENT'}</Text></g>;
 if(kind==='meal')return <g><ellipse cx="1195" cy="625" rx="295" ry="140" fill="#394d4e"/><ellipse cx="1195" cy="600" rx="230" ry="126" fill={C.cream}/><ellipse cx="1195" cy="600" rx="175" ry="89" fill="#c9c6ad"/>{[0,1,2,3,4].map(i=><ellipse key={i} cx={1090+i*45} cy={590+(i%2)*25} rx="37" ry="25" fill={i%2?'#729263':'#bd7853'}/>)}<path d="M870 445V713M852 445V505Q870 530 888 505V445M1480 445V713M1480 445Q1520 490 1480 560" stroke={C.cream} strokeWidth="9" fill="none"/><Text x={1190} y={377} size={32} anchor="middle">A PLAN FOR TIRED DAYS</Text></g>;
 if(kind==='health')return <g><rect x="968" y="367" width="450" height="300" rx="35" fill={C.cream}/><path d="M1110 365V321Q1193 285 1275 321V365" fill="none" stroke="#96a395" strokeWidth="20"/><path d="M1193 427V598M1107 512H1279" stroke="#8a5550" strokeWidth="47"/><Text x={1193} y={746} size={32} anchor="middle">CARE THAT FITS YOUR NEEDS</Text></g>;
 if(kind==='laptop')return <g><rect x="929" y="344" width="530" height="330" rx="17" fill="#73837c"/><rect x="948" y="365" width="492" height="286" fill="#182b35"/><path d="M880 679H1509L1550 721H842Z" fill="#b2b9a6"/><Text x={1194} y={423} size={29} anchor="middle">PROOF OF WORK</Text>{[0,1,2].map(i=><g key={i}><rect x="985" y={458+i*51} width={p*(300-i*50)} height="12" rx="6" fill={i===0?C.gold:'#64877a'}/><circle cx="1380" cy={464+i*51} r="10" fill={C.gold}/></g>)}</g>;
 if(kind==='sale')return <g transform={`translate(0 ${bob})`}><path d="M993 339H1322L1465 499L1322 659H993Z" fill={C.gold}/><circle cx="1360" cy="499" r="24" fill={C.navy}/><Text x={1166} y={490} size={75} color={C.ink} anchor="middle">50% OFF</Text><Text x={1166} y={559} size={28} color={C.ink} anchor="middle">STILL A PURCHASE</Text><path d="M1378 486Q1540 318 1610 406" stroke={C.cream} strokeWidth="7" fill="none"/></g>;
 if(kind==='transfer'||kind==='salary')return <g><Text x={1190} y={340} size={30} anchor="middle">{kind==='transfer'?'AFTER INCOME CLEARS':'GIVE THE RAISE A JOB'}</Text><rect x="865" y="420" width="235" height="220" rx="18" fill="#2d474a"/><Text x={982} y={472} anchor="middle">INCOME</Text><Coin x={982} y={550} r={44}/><path d="M1120 530H1360M1340 513L1360 530L1340 547" stroke={C.gold} strokeWidth="5" fill="none"/><Coin x={1140+p*180} y={530} r={22}/><rect x="1390" y="420" width="230" height="220" rx="18" fill="#4d6256"/><Text x={1505} y={477} anchor="middle">{kind==='transfer'?'SAVINGS':'YOUR PLAN'}</Text><Paper x={1455} y={513} scale={.52}/></g>;
 if(kind==='fees')return <g><Text x={1200} y={323} anchor="middle" size={27}>HYPOTHETICAL / 20 YEARS</Text>{[208,198,179].map((v,i)=><g key={v}><rect x={955+i*190} y={695-v*1.4*p} width="126" height={v*1.4*p} rx="8" fill={i===0?C.gold:i===1?'#779184':'#a56861'}/><Text x={1018+i*190} y={675-v*1.4*p} size={32} anchor="middle">${v}K</Text><Text x={1018+i*190} y={737} size={27} anchor="middle">{['0.25%','0.50%','1.00%'][i]}</Text></g>)}<Text x={1200} y={805} size={21} color={C.muted} anchor="middle">$100K initial / 4% annual return before fees</Text></g>;
 if(kind==='portfolio')return <g><Text x={1200} y={342} size={32} anchor="middle">SPREAD THE EXPOSURE</Text>{[0,1,2,3,4,5].map(i=><rect key={i} x={944+(i%3)*178} y={400+Math.floor(i/3)*130} width="155" height="105" rx="13" fill={['#496e69','#b9944e','#637f8b'][i%3]} opacity={ease(f,i*8,i*8+20)}/>)}<Text x={1200} y={755} size={26} anchor="middle">DIVERSIFICATION DOES NOT PREVENT ALL LOSSES</Text></g>;
 if(kind==='planner'||kind==='closing')return <g><Paper x={986} y={305} title={kind==='closing'?'ONE ACTION':'THIS WEEK'} scale={2}/>{[0,1,2].map(i=><path key={i} d={`M1040 ${490+i*54}l10 10 24-26`} fill="none" stroke="#426e5d" strokeWidth="6" opacity={ease(f,i*22,i*22+12)}/>)}</g>;
 return <g><Paper x={975} y={304} title="YOUR MONEY" scale={2}/>{[0,1,2].map(i=><g key={i}><path d={`M${1100+i*85} 736v${40+Math.sin(f/25+i)*12}`} stroke={C.gold} strokeWidth="4"/><Coin x={1100+i*85} y={798+(f+i*20)%45} r={17}/></g>)}</g>;
};

const Scene:React.FC<{beat:any}>=({beat})=>{
 const f=useCurrentFrame(); const d=beat.data; const conversation=d.mode==='conversation'||d.kind==='people';
 const intro=ease(f,0,16); const action=d.mode==='action';
 return <AbsoluteFill style={{background:C.navy,color:C.ivory,fontFamily:FONT_SANS}}>
 <svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs><radialGradient id="room-glow"><stop stopColor="#293c42"/><stop offset="1" stopColor={C.navy}/></radialGradient></defs>
  <rect width="1920" height="1080" fill="url(#room-glow)"/>
  <path d="M75 175H1845M75 900H1845" stroke="#40504e" strokeWidth="1"/>
  <Text x={80} y={92} size={29} color={C.gold}>A U R E L I S</Text>
  <Text x={1840} y={92} size={22} color={C.muted} anchor="end">MONEY / HABITS / SYSTEMS</Text>
  <g opacity={intro} transform={`translate(${(1-intro)*-16} 0)`}>
   <Text x={80} y={252} size={23} color={C.gold}>{d.chapter===0?'THE QUIET LEAKS':d.chapter===16?'YOUR NEXT STEP':`TRAP ${String(d.chapter).padStart(2,'0')} / 15`}</Text>
   <foreignObject x="75" y="287" width="560" height="235"><div style={{fontFamily:FONT_SERIF,fontSize:66,lineHeight:1.08,fontWeight:600}}>{d.title}</div></foreignObject>
   <foreignObject x="80" y="530" width="480" height="145"><div style={{fontSize:28,lineHeight:1.45,color:C.muted}}>{d.takeaway}</div></foreignObject>
   <rect x="80" y="705" width="54" height="4" fill={C.gold}/>
   <Text x={80} y={756} size={20} color={C.muted}>{action?'TRY THIS SYSTEM':d.source?'THE EVIDENCE':conversation?'PUT IT INTO PRACTICE':'FOLLOW THE DECISION'}</Text>
  </g>
  <g opacity={intro}>
   {conversation?<>
    <Room/>
    <rect x="917" y="551" width="139" height="174" rx="20" fill="#354e4c" stroke="#697c69" strokeWidth="3"/>
    <path d="M926 714V844M1045 714V844" stroke="#697c69" strokeWidth="9"/>
    <rect x="1419" y="565" width="140" height="155" rx="20" fill="#354e4c" stroke="#697c69" strokeWidth="3"/>
    <Banker x={990} y={659} scale={.81} action={d.kind==='planner'?'write':'letter'} id={`guide-${beat.scene}`} gaze={1}/>
    <Colleague x={1490} y={684}/>
    <path d="M928 777V848M1514 777V848" stroke="#665f4d" strokeWidth="15"/>
    <path d="M856 687H1564L1641 732H811Z" fill="#ae8e60"/><rect x="820" y="731" width="811" height="31" fill="#64503e"/>
    <Paper x={1130} y={689} scale={.24} title="PLAN"/>
    <path d="M1190 712L1250 712" stroke={C.cream} strokeWidth="6"/>
    <Text x={1230} y={835} size={22} anchor="middle">A CONVERSATION / A SHARED PLAN</Text>
   </>:action?<>
    <Room bank={d.kind==='bank'}/>
    <Banker x={884} y={607} scale={.69} action="point" stance="standing" id={`guide-${beat.scene}`}/>
    {d.labels.map((label:string,i:number)=><g key={label} opacity={ease(f,10+i*12,25+i*12)}><rect x="1090" y={351+i*125} width="600" height="99" rx="12" fill="#263d41" stroke="#53665c"/><Text x={1120} y={412+i*125} size={26} color={C.gold}>{String(i+1).padStart(2,'0')}</Text><Text x={1185} y={412+i*125} size={25}>{label}</Text></g>)}
   </>:<>
    <rect x="680" y="225" width="1110" height="650" rx="22" fill="#121f28" stroke="#33474a"/>
    <ObjectArt kind={d.kind} f={f}/>
    {d.mode==='establish'&&<Banker x={765} y={730} scale={.34} action="present" stance="standing" id={`guide-${beat.scene}`}/>}
   </>}
  </g>
  {d.source&&<Text x={1820} y={880} anchor="end" size={20} color={C.muted}>{d.source}</Text>}
 </svg>
 </AbsoluteFill>;
};

const phrases=captionPhrases(T.captions,T.beats);
export const MoneyHabits:React.FC=()=>{
 const f=useCurrentFrame(); const phrase=phrases.find(p=>f>=p.start&&f<p.end);
 return <AbsoluteFill>
  {T.beats.map((b:any,i:number)=><Sequence key={b.scene} from={b.startFrame} durationInFrames={(i===T.beats.length-1?T.totalFrames:b.endFrame)-b.startFrame}><Scene beat={b}/></Sequence>)}
  {phrase&&<div style={{position:'absolute',bottom:61,left:180,right:180,textAlign:'center',fontFamily:FONT_SANS,fontSize:38,fontWeight:500,color:C.ivory}}>{phrase.words.map((w,i)=><span key={i} style={{color:f>=w.startFrame&&f<w.endFrame?C.gold:C.ivory}}>{w.word}{' '}</span>)}</div>}
  <div style={{position:'absolute',bottom:0,left:0,height:4,width:`${f/T.totalFrames*100}%`,background:C.gold}}/>
 </AbsoluteFill>;
};
