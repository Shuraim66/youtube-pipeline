import React from 'react';

// Low-contrast sets sit behind information, with foreground movement kept separate.
const brass='#d6b473', line='#30464a';
export const AtlasSet:React.FC<{frame:number}> = ({frame}) => <g>
  <g transform={`translate(${Math.sin(frame/120)*3} 0)`}>
    <path d="M55 515H1010V1480H55Z" fill="#112127" stroke="#526257" strokeWidth="3"/>
    <path d="M69 529H996V1466H69Z" fill="#102027" stroke={brass} strokeOpacity=".3"/>
    {[0,1,2,3,4,5].map(i=><path key={i} d={`M82 ${565+i*170}H986M${140+i*163} 545V1450`} stroke={line} strokeWidth="1" opacity=".55"/>)}
    <path d="M84 580V548H118M951 548H982V580M84 1420V1451H118M951 1451H982V1420" stroke={brass} fill="none" opacity=".5"/>
  </g>
  <path d="M68 1491H990L969 1510H93Z" fill="#070f14" opacity=".7"/>
</g>;

export const CorrespondenceSet:React.FC<{frame:number}> = ({frame}) => <g>
  <path d="M54 534H1026V1458H54Z" fill="#15262a" stroke={line} strokeWidth="3"/>
  <g transform={`translate(${Math.sin(frame/100)*3} ${Math.cos(frame/140)*2})`} opacity=".6">
    <path d="M96 612L449 558L555 1335L178 1378Z" fill="#273c3c" stroke="#617064"/>
    <path d="M617 618L956 644L892 1357L548 1322Z" fill="#233735" stroke="#617064"/>
    {Array.from({length:8},(_,i)=><path key={i} d={`M135 ${704+i*60}l270-39M633 ${716+i*61}l251 20`} stroke="#809080" opacity=".23"/>)}
  </g>
  <path d="M63 1466H1020V1490H63Z" fill="#514632" stroke="#9b8053"/>
  <g transform={`translate(${Math.sin(frame/130)*-3} 0)`}>
    <path d="M91 1401L250 1433L254 1449L96 1418Z" fill="#a08655"/>
    <path d="M250 1433L281 1449L254 1449Z" fill="#dfc89b"/>
    <ellipse cx="936" cy="1416" rx="31" ry="9" fill="#080f14"/>
    <path d="M919 1372H951V1412Q936 1425 919 1412Z" fill="#775347" stroke="#b79563"/>
    <path d="M926 1372V1338Q936 1324 945 1338V1372" fill="#344c49" stroke="#a28c64"/>
  </g>
</g>;

export const ExchangeSet:React.FC<{frame:number}> = ({frame}) => <g>
  <g transform={`translate(${Math.sin(frame/150)*-4} 0)`} opacity=".55">
    <path d="M49 1105V626H187V585H323V681H452V550H611V640H746V596H928V706H1034V1105Z" fill="#172c32"/>
    {Array.from({length:12},(_,i)=><path key={i} d={`M${84+i*81} 741v302m-13-278h26m-26 74h26m-26 74h26m-26 74h26`} stroke="#3c5656" strokeWidth="2"/>)}
    <path d="M58 1110H1029M75 1130H1010" stroke={brass} opacity=".25"/>
  </g>
  <path d="M59 1136H1021L1070 1510H10Z" fill="#12232a"/>
  {[0,1,2,3].map(i=><path key={i} d={`M${20+i*25} ${1170+i*95}H${1060-i*25}M540 1136L${70+i*310} 1510`} stroke={line} opacity=".28"/>)}
  <ellipse cx="285" cy="1082" rx="207" ry="26" fill="#071218" opacity=".65"/>
  <ellipse cx="795" cy="1082" rx="207" ry="26" fill="#071218" opacity=".65"/>
</g>;

export const DraftingSet:React.FC = () => <g opacity=".5">
  <path d="M77 689L991 667L1008 1297L94 1320Z" fill="#11262d" stroke={line}/>
  {Array.from({length:8},(_,i)=><path key={i} d={`M110 ${736+i*73}H979M${134+i*112} 705V1277`} stroke="#385451" opacity=".4"/>)}
  <path d="M111 727V706H134M958 706H982V727M111 1263V1284H134M958 1284H982V1263" fill="none" stroke={brass}/>
</g>;
