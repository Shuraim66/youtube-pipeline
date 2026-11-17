import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';

// Same material vocabulary as RothschildScenes: ink, patina, brass and parchment.
export const Materials:React.FC=()=> <defs>
 <linearGradient id="m-wall" x2="1" y2="1"><stop stopColor="#223638"/><stop offset="1" stopColor="#0b141b"/></linearGradient>
 <linearGradient id="m-glass" x2="0" y2="1"><stop stopColor="#789487"/><stop offset=".55" stopColor="#3d5954"/><stop offset="1" stopColor="#162d33"/></linearGradient>
 <linearGradient id="m-wood" x2="0" y2="1"><stop stopColor="#997345"/><stop offset=".12" stopColor="#4a4030"/><stop offset="1" stopColor="#1d292a"/></linearGradient>
 <linearGradient id="m-paper"><stop stopColor="#bba379"/><stop offset=".08" stopColor="#eddfbd"/><stop offset=".48" stopColor="#dfcda8"/><stop offset="1" stopColor="#c7b38b"/></linearGradient>
 <radialGradient id="m-haze"><stop stopColor="#b7a376" stopOpacity=".12"/><stop offset="1" stopColor="#b7a376" stopOpacity="0"/></radialGradient>
 <linearGradient id="m-floor" x2="0" y2="1"><stop stopColor="#243632"/><stop offset="1" stopColor="#0b171d"/></linearGradient>
 <linearGradient id="m-leather" x2="1" y2="1"><stop stopColor="#637061"/><stop offset=".35" stopColor="#34483e"/><stop offset="1" stopColor="#192b2b"/></linearGradient>
</defs>;

const Shelf:React.FC<{x:number;y:number;width?:number}>=({x,y,width=340})=><g transform={`translate(${x} ${y})`}>
 <rect width={width} height="450" fill="#102127" stroke="#526257" strokeWidth="3"/>
 <rect x="12" y="12" width={width-24} height="426" fill="none" stroke="#30464a"/>
 {[0,1,2].map(row=><g key={row}><path d={`M14 ${140+row*140}H${width-14}`} stroke="#766747" strokeWidth="7"/>
 {Array.from({length:8},(_,i)=><g key={i}><rect x={24+i*(width-48)/8} y={40+row*140+(i%3)*12} width={(width-65)/8} height={94-(i%3)*12} fill={['#344c45','#65533f','#3a5051','#734c40'][i%4]} stroke="#69705b"/><path d={`M${30+i*(width-48)/8} ${62+row*140+(i%3)*12}v45`} stroke="#b29a6c" opacity=".4"/></g>)}</g>)}
</g>;

const Window:React.FC<{x:number;arched?:boolean}>=({x,arched=true})=><g transform={`translate(${x} 0)`}>
 <path d={arched?'M0 625V325a170 170 0 0 1 340 0V625Z':'M0 175H340V625H0Z'} fill="url(#m-glass)" stroke="#6b7868" strokeWidth="6"/>
 <path d="M14 614V554H49V521H72V560H95V479H116V554H147V516H174V562H194V532H221V494H245V560H274V526H300V553H326V614Z" fill="#152a30" opacity=".8"/>
 <path d="M170 160V625M0 380H340M0 505H340" stroke="#273b3d" strokeWidth="9"/><path d="M173 170V620M4 383H336" stroke="#93a18a" strokeWidth="2" opacity=".5"/>
 <path d="M-15 628H355L369 647H-27Z" fill="#4b5d52" stroke="#76806a"/>
</g>;

export const StorySetting:React.FC<{place:string}>=({place})=>{
 const f=useCurrentFrame();const outdoor=['street','park','bank'].includes(place);
 return <g>
  <rect width="1920" height="1080" fill="url(#m-wall)"/>
  <ellipse cx="780" cy="370" rx="900" ry="600" fill="url(#m-haze)"/>
  {outdoor?<>
   <g transform={`translate(${Math.sin(f/140)*3} 0)`}>
   {[0,1,2,3,4].map(i=><g key={i} transform={`translate(${i*430-110} ${i%2?35:0})`}>
    <path d="M0 765V260H50V220H305V260H360V765Z" fill={i%2?'#1b3035':'#243c3d'} stroke="#3b5150" strokeWidth="3"/>
    <path d="M-12 265H373M-5 285H366M0 690H360M0 714H360" stroke="#5b6757" strokeWidth="5"/>
    {[0,1,2].map(row=>[0,1,2].map(col=><g key={`${row}-${col}`}><rect x={35+col*105} y={320+row*110} width="65" height="80" fill="#344e4b" stroke="#617060" strokeWidth="3"/><path d={`M${67+col*105} ${322+row*110}v76m-32-40h63`} stroke="#1c3237" strokeWidth="5"/></g>))}
    <path d="M137 765V651Q182 608 227 651V765" fill="#102129" stroke="#637363" strokeWidth="4"/>
   </g>)}
   </g>
   <rect y="790" width="1920" height="290" fill="url(#m-floor)"/>
   {[835,912,1020].map(y=><path key={y} d={`M0 ${y}H1920`} stroke="#46554d" opacity=".5"/>)}
   {[0,320,640,960,1280,1600,1920].map(x=><path key={x} d={`M960 770L${x} 1080`} stroke="#46554d" opacity=".25"/>)}
   {place==='park'&&<><path d="M0 787Q260 655 470 790T990 810T1600 780T1920 800V1080H0Z" fill="#233e34"/>{[150,1730].map(x=><g key={x}><path d={`M${x} 830l8-510m-8 270-80-140m84 90 90-130`} fill="none" stroke="#495647" strokeWidth="18"/>{[0,1,2].map(i=><ellipse key={i} cx={x+(i-1)*62} cy={365+i%2*90} rx="104" ry="135" fill={i%2?'#304d3f':'#3c5847'} stroke="#587057" strokeWidth="2"/>)}</g>)}</>}
   {[85,1810].map(x=><g key={x}><path d={`M${x} 804V420`} stroke="#55685e" strokeWidth="8"/><path d={`M${x-24} 420l-9-80h66l-9 80Z`} fill="#b4a777" stroke="#6e785e" strokeWidth="4"/><path d={`M${x-40} 338l40-30 40 30Z`} fill="#2e4644"/></g>)}
  </>:<>
   <g stroke="#30464a" fill="none" strokeWidth="2"><path d="M60 125H1860V772H60Z M75 140H1845V756H75Z M0 695H1920"/>{[0,1,2,3,4,5].map(i=><path key={i} d={`M${40+i*320} 717h280v170h-280Z`}/>)}</g>
   <g transform={`translate(${Math.sin(f/150)*2} 0)`}>
    <Window x={175} arched={place!=='kitchen'&&place!=='clinic'}/>
    {place==='office'||place==='class'?<><Shelf x={1380} y={172}/><Shelf x={950} y={172} width={330}/></>:<Window x={1375} arched={place!=='kitchen'&&place!=='clinic'}/>}
   </g>
   <path d="M180 383H510L1050 915H540Z" fill="#b6c29a" opacity=".025"/>
   <rect y="790" width="1920" height="290" fill="url(#m-floor)"/><path d="M0 790H1920M0 808H1920" stroke="#67725b" strokeWidth="3"/>
   {[0,1,2,3,4,5,6].map(i=><path key={i} d={`M${i*320-100} 1080L${650+i*120} 790`} stroke="#60705d" opacity=".16"/>)}
   {place==='kitchen'&&<><rect x="75" y="617" width="1770" height="220" fill="#213a35" stroke="#61705c" strokeWidth="3"/>{[100,445,790,1135,1480].map(x=><g key={x}><rect x={x} y="649" width="310" height="164" fill="url(#m-leather)" stroke="#768063" strokeWidth="2"/><rect x={x+13} y="662" width="284" height="137" fill="none" stroke="#41594d"/><path d={`M${x+120} 682h70`} stroke="#b39b68" strokeWidth="5"/></g>)}<path d="M55 600H1860V625H55Z" fill="url(#m-paper)"/><path d="M740 598V545Q740 510 776 520V548" stroke="#9eab92" strokeWidth="9" fill="none"/></>}
   {place==='clinic'&&<><rect x="807" y="220" width="255" height="260" fill="#243d3d" stroke="#8b825f" strokeWidth="5"/><path d="M934 262V420M855 341H1013" stroke="#b5bba0" strokeWidth="28"/><path d="M853 450H1017" stroke="#768675"/></>}
   {place==='class'&&<><rect x="685" y="173" width="640" height="420" fill="#19332f" stroke="#9b8359" strokeWidth="10"/><path d="M732 262H1240M732 295H1100M732 374H980M732 409H1190" stroke="#a7b8a0" opacity=".5" strokeWidth="3"/></>}
   {place==='night'&&<><rect x="970" y="548" width="22" height="235" fill="#796f4f"/><path d="M888 545L925 386H1038L1082 545Z" fill="#aa9566" stroke="#d1bc85" strokeWidth="3"/><ellipse cx="983" cy="782" rx="70" ry="12" fill="#4e5240"/></>}
   <g transform="translate(1800 695)"><path d="M0 85V-140M0-35Q-100-108-63-147Q-7-134 0-35M0-15Q102-120 66-158Q4-121 0-15" fill="#3e6050" stroke="#75876a" strokeWidth="3"/><path d="M-43 55H43L32 141H-31Z" fill="url(#m-wood)" stroke="#9d8861" strokeWidth="3"/><path d="M-44 62H45" stroke="#c0a473" strokeWidth="4"/></g>
  </>}
 </g>;
};

// Original supporting woman: face planes, tailored clothing and articulated hands
// use the guide's visual grammar without borrowing his face or silhouette.
export const StoryColleague:React.FC<{x:number;y:number;stance?:'standing'|'seated'}>=({x,y,stance='standing'})=>{
 const id=useId().replace(/:/g,'');const f=useCurrentFrame();const seated=stance==='seated';
 const breath=Math.sin(f/32)*1.1;const gesture=Math.sin(Math.min(f/36,1)*Math.PI/2)*3;
 const skin=`url(#${id}-skin)`,coat=`url(#${id}-coat)`;
 const blink=f%137>=129&&f%137<=132;
 return <g transform={`translate(${x} ${y})`}>
  <defs><linearGradient id={`${id}-skin`}><stop stopColor="#ebc29c"/><stop offset=".65" stopColor="#c99875"/><stop offset="1" stopColor="#956d54"/></linearGradient><linearGradient id={`${id}-coat`} x2="1" y2=".6"><stop stopColor="#77837a"/><stop offset=".35" stopColor="#4d655f"/><stop offset="1" stopColor="#283e42"/></linearGradient></defs>
  <ellipse cx="0" cy={seated?208:257} rx="86" ry="12" fill="#050e13" opacity=".45"/>
  <g transform={seated?'scale(1 .8)':''}>
   <path d={seated?'M-57 0H45L-8 91L-48 111L-58 232H-92L-91 91L-34 40Z':'M-57 0H-5L-18 127L-24 235H-61L-58 122Z'} fill="#22373e" stroke="#657674" strokeWidth="1.5"/>
   <path d={seated?'M-8 0H54L31 102L9 237H-27L-14 89L-49 69Z':'M-5 0H53L58 124L70 235H32L13 128Z'} fill="#15292f" stroke="#526366" strokeWidth="1.5"/>
   <path d={seated?'M-64 118L-73 217M2 108L-10 218':'M-39 38L-42 217M30 38L40 124L49 218'} fill="none" stroke="#779089" strokeWidth="1.5" opacity=".5"/>
   <path d={seated?'M-92 225H-58L-45 244H-105Q-118 241-108 235ZM-27 230H9L25 246H-40Q-51 242-39 236Z':'M-61 229H-24L-11 244Q-8 252-23 254H-77Q-88 249-73 240ZM32 229H70L91 242Q101 251 82 254H32Z'} fill="#0b151c" stroke="#647274" strokeWidth="1.4"/>
  </g>
  <g transform={`translate(0 ${breath})`}>
   <path d="M40-175Q64-173 72-145L93-68Q97-46 74-36L27-35L22-61L59-73L30-143Z" fill={coat} stroke="#718482" strokeWidth="1.4"/>
   <path d="M-48-175Q-7-192 39-173L57-110L67 9L16 22L-8 8L-53 20L-67 6L-58-102Z" fill={coat} stroke="#718482" strokeWidth="1.5"/>
   <path d="M-21-179L-9-113L19-179L33-156L22-42L-27-43L-35-158Z" fill="#ded5b9"/>
   <path d="M-23-177L-44-163L-27-139L-39-116L-8-74Z M21-177L41-160L24-134L36-118L-8-74Z" fill="#59726a" stroke="#9ca590" strokeWidth="1.2"/>
   <path d="M-8-73V6M-44-50L-19-45M19-47L45-52" stroke="#a5aa8e" strokeWidth="1.3" opacity=".75"/>
   {[-60,-36,-12].map(y=><circle key={y} cx="-5" cy={y} r="2" fill="#c4a76c"/>)}
   <g transform={`rotate(${Math.sin(f/47)*1.2-3} 0 -190)`}>
    <path d="M-36-212Q-57-279-15-291Q41-304 44-249L37-196L21-183H-35Z" fill="#1d292b" stroke="#596357" strokeWidth="1.2"/>
    <path d="M-15-207L-17-177L-5-163L15-181L12-207Z" fill={skin}/>
    <path d="M-33-257Q-13-284 19-270L34-246L26-224L21-203L4-193L-18-202L-30-227Z" fill={skin}/>
    <path d="M-33-250Q-47-279-12-291Q25-292 38-269L37-240L17-257L4-276Q-8-251-33-246Z" fill="#273333"/>
    <path d="M-31-262Q-15-289 11-282M-28-269Q-8-284 7-280" stroke="#7b8270" strokeWidth="1.3" fill="none" opacity=".55"/>
    <path d="M-21-232L-27-215L-17-203L3-197L17-207L11-219L-1-229Z" fill="#ab7c5e" opacity=".2"/>
    <path d="M-24-244Q-17-249-9-244M5-244Q13-248 20-243" fill="none" stroke="#5d493b" strokeWidth="2"/>
    {blink?<path d="M-23-237H-10M5-237H18" stroke="#5d493b" strokeWidth="2"/>:<><path d="M-24-237Q-17-242-10-236M4-236Q11-241 18-235" fill="#e4d8b9" stroke="#655044" strokeWidth="1.1"/><circle cx="-19" cy="-237" r="2.1" fill="#263b38"/><circle cx="8" cy="-236" r="2.1" fill="#263b38"/></>}
    <path d="M-5-237L-9-222L-2-220" fill="none" stroke="#92664e" strokeWidth="1.4"/><path d="M-11-210Q-3-207 6-212" fill="none" stroke="#805341" strokeWidth="1.7"/>
    <circle cx="-29" cy="-218" r="3" fill="#d6b473"/>
   </g>
   <g transform={`rotate(${-gesture} -48 -158)`}>
    <path d="M-46-176Q-67-176-74-148L-91-101L-131-104L-136-77L-80-68Q-64-71-59-88L-36-145Z" fill={coat} stroke="#718482" strokeWidth="1.5"/>
    <path d="M-127-105L-143-106L-148-79L-133-77Z" fill="#ded5b9" stroke="#a5a991"/>
    <path d="M-143-103L-156-106L-174-119Q-181-121-180-115L-167-101L-190-102Q-198-100-192-95L-170-91L-191-93Q-198-90-191-86L-163-80L-145-80Z" fill={skin} stroke="#aa8262" strokeWidth="1"/>
    <path d="M-172-95L-153-91M-170-87L-154-85" stroke="#9b7456" fill="none"/>
   </g>
   <path d="M26-61L14-63L0-56Q-8-52-3-47L13-48L-2-43Q-6-38 2-36L25-38L32-46Z" fill={skin} stroke="#aa8262" strokeWidth="1"/>
   <path d="M-44-16L-23-11M29-12L47-18" stroke="#899986" opacity=".5"/>
  </g>
 </g>;
};

export const DeskFurniture:React.FC=()=> <g>
 <ellipse cx="970" cy="947" rx="690" ry="37" fill="#050d12" opacity=".65"/>
 <path d="M360 662H1590L1700 737H270Z" fill="#6c6045" stroke="#b89860" strokeWidth="2"/>
 <rect x="285" y="737" width="1395" height="28" fill="url(#m-wood)" stroke="#a08651" strokeWidth="2"/>
 <path d="M330 765H655V835H330ZM1300 765H1630V835H1300Z" fill="#263130" stroke="#796544" strokeWidth="2"/>
 <path d="M345 776H640V822H345ZM1315 776H1615V822H1315Z" fill="none" stroke="#59604e"/>
 <path d="M475 793q17 18 34 0M1450 793q17 18 34 0" fill="none" stroke="#d6b473" strokeWidth="3"/>
 <path d="M350 835L343 945H368L381 835M1580 835L1590 945H1618L1608 835" fill="#374037" stroke="#8e784f" strokeWidth="2"/>
 <path d="M745 674H1030L1080 727H770Z" fill="url(#m-paper)" stroke="#b69b6a"/>
 <path d="M782 690H990M793 705H1015" stroke="#8e805d" strokeWidth="1.5"/>
 <path d="M1120 690l107 20" stroke="#172b32" strokeWidth="6"/><path d="M1227 710l15 3-10-9" fill="#d6b473"/>
 <g transform="translate(385 691)"><path d="M0 0H150V25H0Z" fill="#73483b" stroke="#b18b57"/><path d="M8-18H142V0H8Z" fill="#c1b491" stroke="#e1d0a7"/><path d="M-5-35H131V-18H-5Z" fill="#354d47" stroke="#a58d5b"/></g>
 </g>;

export const BankFacade:React.FC=()=> <g>
 <ellipse cx="1200" cy="759" rx="390" ry="30" fill="#050d12" opacity=".6"/>
 <path d="M850 405L1200 260L1550 405Z" fill="url(#m-paper)" stroke="#b89860" strokeWidth="3"/>
 <path d="M906 390L1200 281L1494 390Z" fill="#41554c" stroke="#9e926b" strokeWidth="2"/>
 <rect x="860" y="410" width="680" height="28" fill="url(#m-wood)" stroke="#b89860" strokeWidth="2"/>
 <rect x="886" y="438" width="628" height="278" fill="#233a3b"/>
 <path d="M1128 716V545Q1200 453 1272 545V716Z" fill="#10252c" stroke="#8a896a" strokeWidth="4"/>
 <path d="M1200 519V716M1140 589H1260" stroke="#52695f" strokeWidth="4"/>
 {[915,1075,1235,1395].map(x=><g key={x}><rect x={x} y="446" width="65" height="248" fill="url(#m-paper)" stroke="#968c69" strokeWidth="2"/>{[12,25,38,51].map(dx=><path key={dx} d={`M${x+dx} 461V679`} stroke="#988e6d" opacity=".55"/>)}<rect x={x-8} y="438" width="81" height="17" fill="#c9bd98" stroke="#a5936c"/><rect x={x-9} y="689" width="83" height="20" fill="url(#m-paper)"/></g>)}
 <path d="M855 712H1545V731H855ZM839 733H1561V749H839Z" fill="url(#m-paper)" stroke="#a28d5f" strokeWidth="2"/>
 <text x="1200" y="375" fill="#eadbb9" fontFamily="Georgia,serif" fontSize="32" textAnchor="middle" letterSpacing="3">BORROWING</text>
 </g>;

export const MealPlate:React.FC=()=> <g>
 <ellipse cx="1195" cy="647" rx="285" ry="104" fill="#071319" opacity=".6"/>
 <ellipse cx="1195" cy="600" rx="230" ry="126" fill="url(#m-paper)" stroke="#aa9a73" strokeWidth="3"/>
 <ellipse cx="1195" cy="596" rx="199" ry="105" fill="none" stroke="#b09c72" strokeWidth="2"/>
 <ellipse cx="1195" cy="600" rx="172" ry="88" fill="#c2b594"/>
 <path d="M1070 608Q1090 525 1180 550L1270 596L1240 658L1110 660Z" fill="#ad7952" stroke="#d2a371" strokeWidth="3"/>
 {[0,1,2,3].map(i=><path key={i} d={`M${1110+i*29} 574l-12 64`} stroke="#755740" strokeWidth="4" opacity=".6"/>)}
 {[0,1,2,3,4].map(i=><g key={i}><ellipse cx={1230+i%3*32} cy={550+Math.floor(i/3)*40} rx="29" ry="22" fill={i%2?'#5c7850':'#7c925e'} stroke="#9aab79" strokeWidth="2"/><path d={`M${1217+i%3*32} ${549+Math.floor(i/3)*40}l22 5`} stroke="#b2ba81" strokeWidth="2"/></g>)}
 <path d="M870 445V713M852 445V505Q870 530 888 505V445M1480 445V713M1480 445Q1520 490 1480 560" stroke="#b5bda4" strokeWidth="9" fill="none"/>
 <path d="M867 535V702M1477 570V702" stroke="#f0ddaf" strokeWidth="2"/>
 </g>;
