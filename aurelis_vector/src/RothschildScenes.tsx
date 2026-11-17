import React, {useContext} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Banker} from './Banker';
import {FONT_SERIF, FONT_SANS} from './theme';
import {MotionContext, SceneData, useMotion, amountAt, BrassRule, CompassRose, GuideMedallion} from './production';
import {AtlasSet, CorrespondenceSet, ExchangeSet, DraftingSet} from './Environments';

// One coherent illustration system: ink, patinated green, brass, parchment, wax.
// Maps and diagrams are explanatory illustrations, never fabricated financial data.
const P = {
  ink:'#0b141b', panel:'#112127', line:'#30464a', green:'#526d65',
  brass:'#d6b473', light:'#f0ddaf', paper:'#eadbb9', muted:'#91a5a1', wax:'#a96050',
};
const progress = (f:number, a:number, b:number) => interpolate(f,[a,b],[0,1],
  {extrapolateLeft:'clamp',extrapolateRight:'clamp'});
type Mode = 'office'|'network'|'letters'|'transaction'|'markets'|'insight'|'adapt'|'end';

const Text:React.FC<{x:number;y:number;size?:number;fill?:string;anchor?:'start'|'middle'|'end';serif?:boolean;children:React.ReactNode}> =
({x,y,size=28,fill=P.paper,anchor='start',serif=false,children}) =>
  <text x={x} y={y} fontFamily={serif?FONT_SERIF:FONT_SANS} fontSize={size} fill={fill} textAnchor={anchor} style={{fontVariantNumeric:'tabular-nums'}}>{children}</text>;

const Definitions = () => <defs>
  <linearGradient id="r-wall" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#1c3033"/><stop offset="1" stopColor={P.ink}/></linearGradient>
  <linearGradient id="r-window" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#729183"/><stop offset=".62" stopColor="#344f4b"/><stop offset="1" stopColor="#13272e"/></linearGradient>
  <linearGradient id="r-wood" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#997345"/><stop offset=".12" stopColor="#4a4030"/><stop offset="1" stopColor="#1d292a"/></linearGradient>
  <linearGradient id="r-paper" x1="0" y1="0" x2="1" y2=".4"><stop stopColor="#bba379"/><stop offset=".08" stopColor="#eddfbd"/><stop offset=".5" stopColor="#d9c69e"/><stop offset=".53" stopColor="#f0e2c2"/><stop offset="1" stopColor="#d9c49b"/></linearGradient>
  <radialGradient id="r-haze"><stop stopColor="#b7a376" stopOpacity=".12"/><stop offset="1" stopColor="#b7a376" stopOpacity="0"/></radialGradient>
  <pattern id="r-hatch" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 9L9 0" stroke={P.brass} strokeWidth=".8" opacity=".2"/></pattern>
</defs>;

const Heading:React.FC<{eyebrow:string;first:string;second?:string}> = ({eyebrow,first,second}) => {
  const f=useCurrentFrame(); const cue=useMotion('emphasis',12,40);
  return <g>
  <path d="M76 188H124" stroke={P.brass} strokeWidth="2"/>
  <text x="145" y="196" fontFamily={FONT_SANS} fontSize="23" letterSpacing="4" fill={P.muted}>{eyebrow}</text>
  <Text x={76} y={292} size={76} serif>{first}</Text>
  {second && <Text x={76} y={378} size={76} fill={P.brass} serif>{second}</Text>}
  <g opacity=".65"><BrassRule x={76} y={411} width={Math.min(490,(second??first).length*20)} progress={amountAt(f,cue)}/></g>
  <CompassRose x={961} y={191} scale={.7}/>
</g>;
};

const Envelope:React.FC<{x:number;y:number;scale?:number;angle?:number}> = ({x,y,scale=1,angle=0}) =>
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${angle})`}>
    <path d="M-90 -57H90V57H-90Z" fill={P.paper} stroke="#b2996a" strokeWidth="2"/>
    <path d="M-90 -57L0 13L90 -57 M-90 57L-24 -6 M90 57L24 -6" fill="none" stroke="#b39a6b" strokeWidth="2"/>
    <circle cy="12" r="15" fill={P.wax}/><circle cy="12" r="10" fill="none" stroke="#d09470"/>
    <path d="M-4 8L4 16M4 8L-4 16" stroke="#e0ad80" strokeWidth="1.6"/>
  </g>;

const Office:React.FC<{f:number}> = ({f}) => <g>
  <path d="M40 500H1040V1495H40Z" fill="url(#r-wall)"/>
  {/* Tall arched window and distant London roofline. */}
  <path d="M98 1150V702a194 194 0 0 1 388 0V1150Z" fill="url(#r-window)" stroke="#6b7868" strokeWidth="5"/>
  <path d="M113 1070L144 1030L171 1030V995H204V1050H231V945H244V910H251V945H267V1051H288V1018H316V986H339V1041H359V963H375V1040H403V1019H425V1070H470V1136H113Z" fill="#152a30" opacity=".9"/>
  <path d="M291 513V1147M99 807H485M99 971H485" stroke="#273b3d" strokeWidth="10"/>
  <path d="M293 515V1148M101 810H481" stroke="#93a18a" strokeWidth="2" opacity=".55"/>
  <path d="M79 1152H506L518 1171H65Z" fill="#586457"/>
  {/* Window light stays a quiet compositional element. */}
  <path d="M112 810L488 811L922 1458H476Z" fill="#b6c29a" opacity=".025"/>
  <g opacity={.09+Math.sin(f/80)*.02}>
    {[0,1,2,3,4,5].map(i=><circle key={i} cx={145+i*49+Math.sin(f/70+i)*5}
      cy={760+(i*41+f*.12)%260} r={1.6+(i%2)} fill={P.light}/>)}
  </g>
  <g stroke={P.line} fill="none" strokeWidth="2">
    <path d="M568 556H985V1114H568Z M582 570H971V1099H582Z"/>
    <path d="M598 750H959M598 899H959M598 1060H959"/>
    {Array.from({length:12},(_,i)=><path key={i} d={`M${603+i*28} 737V${652+(i%3)*13}H${621+i*28}V737 M${603+i*28} 887V${794+(i%4)*9}H${621+i*28}V887`}/>)}
    <path d="M50 1210H1030 M64 1240H325V1460H64Z M350 1240H611V1460H350Z M636 1240H897V1460H636Z"/>
  </g>
  <ellipse cx="648" cy="1472" rx="321" ry="35" fill="#050d12" opacity=".75"/>
  {/* Leather chair behind the independently rigged figure. */}
  <path d="M515 1306L499 847Q496 793 552 789H731Q779 793 777 845L764 1304Z" fill="#343e36" stroke="#8b784e" strokeWidth="3"/>
  <path d="M523 1236L516 852Q516 811 555 809H725Q758 811 758 850L748 1236Z" fill="#283831" stroke="#67705a"/>
  {[0,1,2].map(i=><circle key={i} cx={560+i*77} cy="877" r="3" fill="#a39164"/>)}
</g>;

const Desk = () => <g>
  {/* Perspective desktop, brass edging, drawers and turned legs. */}
  <path d="M125 1229L877 1229L986 1296H75Z" fill="#6c6045" stroke="#b89860" strokeWidth="2"/>
  <path d="M75 1296H986V1327H75Z" fill="url(#r-wood)" stroke="#a08651" strokeWidth="1.5"/>
  <path d="M117 1330H470V1443H117Z M643 1330H944V1443H643Z" fill="#263130" stroke="#796544" strokeWidth="2"/>
  <path d="M131 1344H454V1380H131Z M131 1391H454V1427H131Z M659 1344H929V1427H659Z" fill="none" stroke="#59604e"/>
  {[1361,1408].map(y=><g key={y}><path d={`M276 ${y}q17 17 34 0`} fill="none" stroke={P.brass} strokeWidth="3"/><circle cx="276" cy={y} r="3" fill={P.brass}/><circle cx="310" cy={y} r="3" fill={P.brass}/></g>)}
  <path d="M776 1380q17 17 34 0" fill="none" stroke={P.brass} strokeWidth="3"/>
  <path d="M132 1444L127 1510H157L164 1444 M902 1444L916 1510H941L932 1444" fill="#374037" stroke="#8e784f" strokeWidth="2"/>
  <path d="M390 1250L664 1250L702 1288H408Z" fill={P.paper} stroke="#b69b6a"/>
  <path d="M423 1261H603M438 1272H654" stroke="#8e805d" strokeWidth="1.2"/>
  <path d="M797 1247H839L848 1277H787Z" fill="#101e25" stroke="#b89a60" strokeWidth="2"/>
  <ellipse cx="817" cy="1247" rx="21" ry="6" fill="#284044" stroke={P.brass}/>
  <g transform="translate(157 1240)">
    <path d="M0 0H137V27H0Z" fill="#73483b" stroke="#b18b57"/>
    <path d="M5 -21H126V0H5Z" fill="#aaa085" stroke="#caba93"/>
    <path d="M-6 -38H116V-21H-6Z" fill="#354d47" stroke="#a58d5b"/>
    <path d="M13 -13H116M15 -8H116" stroke="#d3c6a4"/>
  </g>
</g>;

const OfficeScene:React.FC<{f:number;action?:'letter'|'write'|'consider'}> = ({f,action='letter'}) => <g>
  <g transform={`translate(${-Math.sin(f/140)*3} 0)`}><Office f={f}/></g>
  <Banker x={650} y={1203} scale={1.5} action={action}/>
  <g transform={`translate(${Math.sin(f/140)*2} 0)`}>
    <Desk/>
    <Envelope x={735} y={1264} scale={.25} angle={-7}/>
  </g>
</g>;

// Simplified geographic silhouette; points use the same lon/lat projection as coastlines.
const geo = (lon:number,lat:number):[number,number] => [100+(lon+12)*21,1360-(lat-36)*25];
const geoPath = (pts:number[][]) => pts.map(([a,b],i)=>`${i?'L':'M'}${geo(a,b).join(' ')}`).join(' ')+'Z';
const cities = [
  {name:'Frankfurt',brother:'Amschel',lon:8.68,lat:50.11,dx:5,dy:-46},
  {name:'London',brother:'Nathan',lon:-.12,lat:51.51,dx:-57,dy:-45},
  {name:'Paris',brother:'James',lon:2.35,lat:48.86,dx:-72,dy:58},
  {name:'Vienna',brother:'Salomon',lon:16.37,lat:48.21,dx:90,dy:-20},
  {name:'Naples',brother:'Carl',lon:14.27,lat:40.85,dx:86,dy:37},
];
const Network:React.FC<{f:number}> = ({f}) => {
  const center=geo(8.68,50.11);
  const cues=useContext(MotionContext);
  return <g>
    <AtlasSet frame={f}/>
    <g opacity=".3" stroke={P.line} strokeWidth="1">
      {[0,1,2,3,4,5].map(i=><path key={i} d={`M70 ${600+i*140}H1008 M${110+i*165} 510V1440`}/>)}
    </g>
    <g fill="#243c3e" stroke="#52716a" strokeWidth="2" strokeLinejoin="round">
      <path d={geoPath([[-9,43],[-8,37],[-5,36],[0,39],[3,42],[7,43],[9,44],[10,42],[12,42],[14,40],[16,38],[16,40],[14,42],[13,45],[15,45],[17,43],[20,40],[23,38],[24,41],[28,41],[29,47],[27,52],[23,54],[18,55],[14,54],[10,54],[9,57],[8,55],[7,53],[4,52],[3,51],[1,51],[-2,49],[-5,48],[-4,46],[-1,46],[-2,43]])}/>
      <path d={geoPath([[-5,50],[0,51],[1,53],[-2,55],[-3,58],[-5,59],[-6,57],[-4,55],[-5,53],[-3,52]])}/>
      <path d={geoPath([[-10,52],[-8,55],[-6,55],[-6,52],[-8,51]])}/>
      <path d={geoPath([[5,58],[7,62],[12,65],[18,68],[21,68],[18,63],[18,60],[15,56],[12,56],[11,59],[9,58]])}/>
      <path d={geoPath([[8,41],[9,41],[9,39],[8,39]])}/>
      <path d={geoPath([[12,38],[15,38],[15,37],[13,37]])}/>
    </g>
    <Text x={185} y={1450} size={20} fill={P.muted}>EUROPE · SCHEMATIC</Text>
    {cities.map((c,i)=>{
      const [x,y]=geo(c.lon,c.lat);
      const arrival=cues[c.name.toLowerCase()]?.start ?? 30+i*24;
      const on=progress(f,arrival-10,arrival);
      const u=f<arrival?on:((f-arrival)/115)%1;
      const controlY=Math.min(center[1],y)-70;
      const courierY=(1-u)*(1-u)*center[1]+2*(1-u)*u*controlY+u*u*y;
      return <g key={c.name} opacity={on}>
        {i>0 && <>
          <path d={`M${center} Q${(center[0]+x)/2} ${Math.min(center[1],y)-70} ${x} ${y}`} fill="none" stroke={P.brass} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1-on}/>
          <Envelope x={center[0]+(x-center[0])*u} y={courierY} scale={.12} angle={-8}/>
        </>}
        <circle cx={x} cy={y} r="18" fill={P.ink} stroke={P.brass} strokeWidth="2"/>
        <circle cx={x} cy={y} r="6" fill={P.light}/>
        <circle cx={x} cy={y} r={18+progress(f,arrival,arrival+25)*23} fill="none" stroke={P.brass}
          opacity={f>=arrival?1-progress(f,arrival,arrival+25):0} strokeWidth="1.5"/>
        <Text x={x+c.dx} y={y+c.dy} size={29} anchor="middle">{c.name}</Text>
        <Text x={x+c.dx} y={y+c.dy+26} size={19} fill={P.muted} anchor="middle">{c.brother}</Text>
      </g>;
    })}
    <GuideMedallion x={931} y={666} action="point" id="network-guide"/>
  </g>;
};

const Letters:React.FC<{f:number}> = ({f}) => {
  const dispatch=useMotion('dispatch',65,115);
  return <g>
  <CorrespondenceSet frame={f}/>
  <circle cx="540" cy="997" r="327" fill="none" stroke={P.line} strokeWidth="2"/>
  <circle cx="540" cy="997" r="231" fill="url(#r-hatch)" opacity=".5"/>
  {cities.map((c,i)=>{
    const a=-Math.PI/2+i*Math.PI*2/5;
    const x=540+Math.cos(a)*335,y=997+Math.sin(a)*335;
    const p=progress(f,i*12,i*12+24);
    return <g key={c.name} opacity={p} transform={`translate(0 ${15*(1-p)})`}>
      <path d={`M540 997L${x} ${y}`} stroke={P.brass} opacity=".5" strokeWidth="2" strokeDasharray="4 9"/>
      <Envelope x={x} y={y} scale={.8} angle={Math.sin(f/55+i)*1.5}/>
      <Text x={x} y={y+81} size={25} anchor="middle">{c.name}</Text>
    </g>;
  })}
  <circle cx="540" cy="997" r="133" fill={P.panel} stroke={P.brass} strokeWidth="2"/>
  <Text x={540} y={1032} size={128} fill={P.brass} serif anchor="middle">5</Text>
  <Text x={540} y={1090} size={19} fill={P.muted} anchor="middle">FAMILY BANKS</Text>
  {cities.map((c,i)=>{
    const a=-Math.PI/2+i*Math.PI*2/5;
    const p=progress(f,dispatch.start+i*6,dispatch.end+i*6);
    return <g key={`courier-${c.name}`} opacity={p>0&&p<1?Math.sin(Math.PI*p):0}>
      <Envelope x={540+Math.cos(a)*(140+p*195)} y={997+Math.sin(a)*(140+p*195)} scale={.24} angle={i*10-20}/>
    </g>;
  })}
  <Text x={540} y={1510} size={37} serif anchor="middle">Money moved. Trust travelled.</Text>
</g>;
};

const Transaction:React.FC<{f:number}> = ({f}) => {
  const signature=useMotion('signature',15,125);
  const amount=useMotion('amount',58,100);
  const purchase=useMotion('purchase',94,114);
  const draw=amountAt(f,signature);
  const inkPoint=(p:number)=>[146+204*p,1207-19*Math.sin(p*Math.PI*7)*Math.abs(Math.sin(p*Math.PI*11))];
  const pen=inkPoint(draw);
  const ink=Array.from({length:Math.floor(draw*100)+1},(_,i)=>`${i?'L':'M'}${inkPoint(i/100).join(' ')}`).join(' ')+`L${pen.join(' ')}`;
  const pounds=Math.round(4000000*amountAt(f,amount)/10000)*10000;
  return <g>
    {/* The office remains visible behind the enlarged transaction book. */}
    <g opacity=".38"><OfficeScene f={f} action="write"/></g>
    <g transform={`translate(0 ${18*(1-progress(f,0,24))}) rotate(${(1-progress(f,0,24))*-1.4} 540 1100)`}>
      <path d="M71 805Q309 751 540 791Q778 751 1009 805V1372Q777 1332 540 1373Q309 1332 71 1372Z" fill="#352c22" stroke="#b59a65" strokeWidth="3"/>
      <path d="M84 789Q307 740 540 783Q775 740 996 789V1351Q775 1310 540 1351Q307 1310 84 1351Z" fill="url(#r-paper)"/>
      <path d="M540 788V1349" stroke="#a58b60" strokeWidth="3"/>
      <path d="M96 1358Q310 1320 530 1358M550 1358Q777 1320 984 1358" fill="none" stroke="#d2bd91" strokeWidth="3"/>
      <Text x={128} y={860} size={24} fill="#776443">N M ROTHSCHILD &amp; SONS</Text>
      <Text x={128} y={919} size={43} fill="#413f30" serif>London, 1875</Text>
      <path d="M127 941H488M580 860H954" stroke="#b19d70" strokeWidth="2"/>
      {[0,1,2,3,4,5].map(i=><path key={i} d={`M128 ${998+i*48}H492M578 ${921+i*61}H952`} stroke="#bba87f" strokeWidth="1"/>)}
      <g opacity={progress(f,20,42)}>
        <Text x={128} y={990} size={26} fill="#685a3e">ADVANCE TO</Text>
        <Text x={128} y={1040} size={31} fill="#353a30" serif>British government</Text>
      </g>
      <g opacity={progress(f,amount.start-10,amount.start)}>
        <Text x={580} y={916} size={26} fill="#685a3e">AMOUNT ADVANCED</Text>
        <Text x={580} y={1000} size={61} fill="#353a30" serif>£{pounds.toLocaleString('en-GB')}</Text>
      </g>
      <g opacity={amountAt(f,purchase)}>
        <Text x={580} y={1103} size={26} fill="#685a3e">PURCHASE OF</Text>
        <Text x={580} y={1151} size={35} fill="#353a30" serif>Suez Canal shares</Text>
      </g>
      {/* Pen traces a signature; this is a reconstruction, not an archive facsimile. */}
      <path d={ink} fill="none" stroke="#66553b" strokeWidth="2.5"/>
      <g transform={`translate(${pen[0]} ${pen[1]-18*progress(f,signature.end,signature.end+14)}) rotate(27) translate(4 -19)`}>
        <path d="M0 0Q-28 -78 18 -173Q54 -95 0 0Z" fill="#f6eccf" stroke="#b69c6e" strokeWidth="1.5"/>
        <path d="M-4 19L18 -165M4 -56L27 -92M9 -94L29 -127" fill="none" stroke="#9e8962" strokeWidth="2"/>
      </g>
      <Text x={128} y={1300} size={18} fill="#84714e">ILLUSTRATED RECONSTRUCTION</Text>
    </g>
    <Text x={540} y={1510} size={33} anchor="middle" serif>A private bank. A government transaction.</Text>
  </g>;
};

const Bank:React.FC<{x:number;y:number;scale?:number;publicBank?:boolean}> = ({x,y,scale=1,publicBank=false}) => <g transform={`translate(${x} ${y}) scale(${scale})`}>
  <path d="M-173 29L0 -76L173 29Z" fill="#687c6b" stroke={P.brass} strokeWidth="2"/>
  <path d="M-131 17L0 -56L131 17Z" fill="#2a4244" stroke="#92a089"/>
  <circle cy="-8" r="18" fill="none" stroke={P.brass} strokeWidth="2"/>
  <path d="M-173 32H173V51H-173Z" fill={P.brass}/>
  <path d="M-153 53H153V224H-153Z" fill="#182d33"/>
  {[-123,-48,48,123].map(x=><g key={x}><path d={`M${x-13} 59H${x+13}V212H${x-13}Z`} fill="#8d987d"/><path d={`M${x-19} 53H${x+19}V65H${x-19}ZM${x-20} 208H${x+20}V221H${x-20}Z`} fill="#c4bd91"/><path d={`M${x-5} 70V202`} stroke="#d1c598" strokeWidth="2"/></g>)}
  <path d="M-30 221V144a30 30 0 0 1 60 0V221Z" fill="#07161d" stroke="#758779"/>
  <path d="M-171 223H171V239H-171ZM-190 241H190V255H-190Z" fill="#68786a" stroke={P.brass}/>
  {publicBank && <path d="M-210 255H210V266H-210Z" fill={P.brass}/>}
</g>;

const Markets:React.FC<{f:number;adapt?:boolean}> = ({f,adapt=false}) => {
  const expansion=useMotion('expansion',28,130);
  const shift=amountAt(f,expansion);
  return <g>
    <ExchangeSet frame={f}/>
    <path d="M76 1128H1004" stroke={P.line} strokeWidth="2"/>
    <g opacity={1-shift*.25}>
      <Bank x={285} y={787} scale={1.05}/>
      <Text x={285} y={1198} size={32} serif anchor="middle">Private networks</Text>
      <Text x={285} y={1241} size={23} fill={P.muted} anchor="middle">Family relationships</Text>
      {[0,1,2,3,4].map(i=><circle key={i} cx={161+i*62} cy="1371" r="12" fill={P.brass}/>)}
    </g>
    <g opacity={.35+shift*.65}>
      <Bank x={795} y={787} scale={1.05} publicBank/>
      <Text x={795} y={1198} size={32} serif anchor="middle">Public markets</Text>
      <Text x={795} y={1241} size={23} fill={P.muted} anchor="middle">Wider pools of capital</Text>
      {Array.from({length:24},(_,i)=>{
        const reveal=expansion.start+(expansion.end-expansion.start)*i/24;
        const p=progress(f,reveal,reveal+7);
        const x=643+(i%8)*39,y=1320+Math.floor(i/8)*39;
        return <rect key={i} x={x} y={y+12*(1-p)} width="17" height="17" rx="2" fill={P.brass} opacity={p}/>;
      })}
    </g>
    <path d="M493 935H581L563 918M581 935L563 952" fill="none" stroke={P.brass} strokeWidth="3"/>
    {adapt ? <g opacity={shift}>
      <path d="M285 1400V1485H795V1436" fill="none" stroke={P.brass} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1-shift}/>
      <Text x={540} y={1558} size={35} serif anchor="middle">An enduring advantage must evolve.</Text>
    </g> : <Text x={540} y={1530} size={21} fill={P.muted} anchor="middle">CONCEPTUAL COMPARISON · NOT MARKET-SHARE DATA</Text>}
  </g>;
};

const Insight:React.FC<{f:number}> = ({f}) => {
  const builds=useMotion('builds',0,50),sustains=useMotion('sustains',80,120);
  const p=amountAt(f,{start:builds.end,end:sustains.start}); const r=260; const y=965;
  return <g>
    <defs><clipPath id="r-overlap"><circle cx="700" cy={y} r={r}/></clipPath></defs>
    <DraftingSet/>
    <GuideMedallion x={540} y={574} action="present" id="insight-guide"/>
    <circle cx="380" cy={y} r={r} fill="#284449" fillOpacity=".55" stroke="#73968f" strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1-amountAt(f,builds)}/>
    <circle cx="700" cy={y} r={r} fill={P.brass} fillOpacity=".04" stroke={P.brass} strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1-p}/>
    <circle cx="380" cy={y} r={r} fill="url(#r-hatch)" clipPath="url(#r-overlap)"/>
    <Text x={311} y={946} size={43} serif anchor="middle">Builds</Text>
    <Text x={311} y={995} size={24} fill={P.muted} anchor="middle">An early edge</Text>
    <Text x={769} y={946} size={43} serif fill={P.brass} anchor="middle">Sustains</Text>
    <Text x={769} y={995} size={24} fill={P.muted} anchor="middle">The ability to adapt</Text>
    <path d="M540 1040V1365" stroke={P.brass} strokeWidth="1.5"/>
    <circle cx="540" cy="1040" r="5" fill={P.brass}/>
    <Text x={540} y={1434} size={48} serif anchor="middle">Rarely the same advantage.</Text>
  </g>;
};

// A distinct ending: the same guide connects an old relationship network to
// new capabilities. This is an editorial metaphor, not financial time-series data.
const Adaptation:React.FC<{f:number}> = ({f}) => {
  const cue=useMotion('expansion',70,130);
  const lesson=useMotion('lesson',30,55);
  const p=amountAt(f,cue);
  return <g>
    <ExchangeSet frame={f}/>
    <path d="M76 1128H1004" stroke={P.line} strokeWidth="2"/>
    <Bank x={300} y={676} scale={.62}/>
    <g transform="translate(760 684)">
      <path d="M-86 216V-88H74V216Z" fill="#284349" stroke="#91a38d" strokeWidth="2"/>
      <path d="M74-88L117-53V216H74Z" fill="#172b32" stroke="#627a70"/>
      {Array.from({length:7},(_,i)=><path key={i} d={`M-75 ${-64+i*39}H64M-25 ${-64+i*39}v31M23 ${-64+i*39}v31`} stroke={P.brass} strokeOpacity={.25+p*.45}/>)}
      <path d="M-100 217H131" stroke={P.brass} strokeWidth="4"/>
    </g>
    <Text x={300} y={574} size={26} anchor="middle" fill={P.muted}>RELATIONSHIPS</Text>
    <Text x={779} y={574} size={26} anchor="middle" fill={P.muted}>NEW CAPABILITIES</Text>
    <path d="M445 779Q540 704 655 779" stroke={P.brass} strokeWidth="3" fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={1-p}/>
    <Envelope x={445+210*p} y={779-150*p*(1-p)} scale={.27} angle={-8+16*p}/>
    <ellipse cx="275" cy="1542" rx="130" ry="18" fill="#050e14" opacity=".8"/>
    <Banker x={269} y={1250} scale={.92} action="present" stance="standing" gestureAt={lesson.start-10} gaze={1} id="adapt-guide"/>
    <g opacity={progress(f,lesson.start-10,lesson.start+14)}>
      <Text x={720} y={1190} size={50} serif anchor="middle">Keep the trust.</Text>
      <Text x={720} y={1262} size={50} serif anchor="middle" fill={P.brass}>Change the tools.</Text>
      <BrassRule x={520} y={1305} width={400} progress={p}/>
      <Text x={720} y={1400} size={22} anchor="middle" fill={P.muted}>A LESSON IN ADAPTATION</Text>
    </g>
  </g>;
};

export const RothschildScene:React.FC<{mode:Mode;data?:SceneData}> = ({mode,data}) => {
  const f=useCurrentFrame();
  const {fps}=useVideoConfig();
  // A tiny camera drift gives space to otherwise restrained, local joint motion.
  const camera=1+Math.min(f/fps,10)*.0012;
  const headings:Record<Mode,[string,string,string?]>={
    office:['HOW EMPIRES DIE','The Rothschilds','ruled finance.'],
    network:['EUROPE · BY THE 1820s','Five brothers.','Five cities.'],
    letters:['THE FAMILY ADVANTAGE','A network built','on trust.'],
    transaction:['LONDON · 1875','Four million pounds.','One transaction.'],
    markets:['THE WORLD CHANGED','Capital found','new connections.'],
    insight:['THE ENDURING LESSON','What builds power','may not sustain it.'],
    adapt:['EVOLUTION, NOT EXTINCTION','Still banking.','Still evolving.'],
    end:['AURELIS','How Empires Die','Rise. Evolution. Legacy.'],
  };
  const [eyebrow,first,second]=headings[mode];
  return <MotionContext.Provider value={data?.motion??{}}><AbsoluteFill style={{background:P.ink}}>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position:'absolute',inset:0}}>
      <Definitions/>
      <ellipse cx="340" cy="820" rx="740" ry="820" fill="url(#r-haze)"/>
      <Heading eyebrow={eyebrow} first={first} second={second}/>
      <g transform={`translate(540 1040) scale(${camera}) translate(-540 -1040)`}>
        {(mode==='office'||mode==='end') && <OfficeScene f={f} action={mode==='end'?'consider':'letter'}/>}
        {mode==='network' && <Network f={f}/>}
        {mode==='letters' && <Letters f={f}/>}
        {mode==='transaction' && <Transaction f={f}/>}
        {mode==='markets' && <Markets f={f}/>}
        {mode==='insight' && <Insight f={f}/>}
        {mode==='adapt' && <Adaptation f={f}/>}
      </g>
      {mode==='office' && <Text x={76} y={1585} size={26} fill={P.muted}>NINETEENTH-CENTURY FINANCE</Text>}
      {mode==='network' && <Text x={540} y={1530} size={34} serif anchor="middle">One family. A continental network.</Text>}
      {mode==='end' && <Text x={540} y={1585} size={34} fill={P.brass} anchor="middle">Follow for the next story</Text>}
    </svg>
  </AbsoluteFill></MotionContext.Provider>;
};

export const RothschildOffice = ({data}:{data?:SceneData}) => <RothschildScene mode="office" data={data}/>;
export const RothschildNetwork = ({data}:{data?:SceneData}) => <RothschildScene mode="network" data={data}/>;
export const RothschildLetters = ({data}:{data?:SceneData}) => <RothschildScene mode="letters" data={data}/>;
export const RothschildTransaction = ({data}:{data?:SceneData}) => <RothschildScene mode="transaction" data={data}/>;
export const RothschildMarkets = ({data}:{data?:SceneData}) => <RothschildScene mode="markets" data={data}/>;
export const RothschildInsight = ({data}:{data?:SceneData}) => <RothschildScene mode="insight" data={data}/>;
export const RothschildAdapt = ({data}:{data?:SceneData}) => <RothschildScene mode="adapt" data={data}/>;
export const RothschildEnd = ({data}:{data?:SceneData}) => <RothschildScene mode="end" data={data}/>;
