import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import timing from './timing.json';
import storyboard from './moneyStoryboard.json';
import {Banker} from './Banker';
import {ObjectArt} from './MoneyHabits';
import {Materials, StorySetting as Setting, StoryColleague as Colleague, DeskFurniture, BankFacade, MealPlate} from './MoneyArt';
import {BrandMark} from './components';
import {C as BaseColors, FONT_SANS, FONT_SERIF} from './theme';
import {captionPhrases} from './captionPhrases';

const C={...BaseColors,navy:'#0b141b',gold:'#d6b473',goldDk:'#a58b57',goldLt:'#f0ddaf',ivory:'#eadbb9'};
const T=timing as any;
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const enter=(f:number,a=0,b=24)=>interpolate(f,[a,b],[0,1],clamp);
const Txt:React.FC<{x:number;y:number;children:React.ReactNode;size?:number;fill?:string;center?:boolean;serif?:boolean}>=({x,y,children,size=32,fill=C.ivory,center=false,serif=false})=><text x={x} y={y} fill={fill} fontFamily={serif?FONT_SERIF:FONT_SANS} fontSize={size} textAnchor={center?'middle':'start'}>{children}</text>;
const Copy:React.FC<{text:string;x?:number;y?:number;w?:number;size?:number;color?:string;center?:boolean}>=({text,x=170,y=160,w=1580,size=66,color=C.ivory,center=false})=><foreignObject x={x} y={y} width={w} height="250"><div style={{fontFamily:FONT_SERIF,fontSize:size,lineHeight:1.13,color,textAlign:center?'center':'left'}}>{text}</div></foreignObject>;
const Tag:React.FC<{text:string}>=({text})=><Txt x={960} y={865} size={26} center fill="#b6c0b8">{text}</Txt>;
const Note:React.FC<{x:number;y:number;label:string;value?:string;light?:boolean}>=({x,y,label,value,light=false})=><g transform={`translate(${x} ${y})`}><rect width="310" height="190" rx="2" fill={light?'url(#m-paper)':'url(#m-leather)'} stroke={light?'#b8aa8d':'#577367'} strokeWidth="2"/><rect x="24" y="26" width="45" height="5" fill={C.goldDk}/><Txt x={24} y={83} size={24} fill={light?C.ink:C.ivory}>{label}</Txt>{value?<Txt x={24} y={144} size={40} fill={light?C.ink:C.gold}>{value}</Txt>:<path d="M24 117H270M24 140H230" stroke={light?'#b2a48e':'#668076'} strokeWidth="5"/>}</g>;
const Plant:React.FC<{x:number;y:number}>=({x,y})=><g transform={`translate(${x} ${y})`}><path d="M0 0V-190M0-55Q-100-123-52-179Q4-159 0-55M0-80Q94-177 55-215Q-2-179 0-80" fill="#658577" stroke="#8fa78b" strokeWidth="4"/><path d="M-47-10H47L31 82H-31Z" fill="#ad8160"/></g>;
const Art:React.FC<{kind:string;f:number;x?:number;y?:number;scale?:number;carMode?:'repair'|'purchase'}>=({kind,f,x=960,y=545,scale=1.35,carMode='repair'})=><g transform={`translate(${x} ${y}) scale(${scale}) translate(-1200 -550)`}>{kind==='bank'?<BankFacade/>:kind==='meal'?<MealPlate/>:<ObjectArt kind={kind} f={f} carMode={carMode}/>}</g>;

const Guide:React.FC<{x?:number;y?:number;scale?:number;action?:any;held?:any;seated?:boolean;id:string}>=({x=590,y=555,scale=.85,action='consider',held='document',seated=false,id})=><Banker x={x} y={y} scale={scale} action={action} held={held} stance={seated?'seated':'standing'} id={id} gaze={1}/>;

const Desk:React.FC<{place?:string;id:string;f:number;focus?:string}>=({place='office',id,f,focus='PLAN'})=><>
 <Setting place={place}/>
 <rect x="470" y="515" width="190" height="210" rx="28" fill="url(#m-leather)" stroke="#8b784e" strokeWidth="3"/>
 <Guide id={id} x={570} y={645} scale={1} seated action="letter" held={focus==='VERIFY'?'phone':'document'}/>
 <rect x="1360" y="480" width="155" height="235" rx="24" fill="url(#m-leather)" stroke="#8b784e" strokeWidth="3"/>
 <g transform="translate(1430 632) scale(1.15)"><Colleague x={0} y={0} stance="seated"/></g>
 <DeskFurniture/>
 <Txt x={1080} y={687} size={20} fill="#d8c49b">{focus}</Txt>
</>;

const Calendar:React.FC<{f:number;label:string}>=({f,label})=><>
 <rect width="1920" height="1080" fill="url(#m-wall)"/>
 <rect x="350" y="218" width="1220" height="635" rx="4" fill="#594b36" stroke="#aa8e5d" strokeWidth="2"/><rect x="360" y="210" width="1200" height="620" rx="20" fill="url(#m-paper)" stroke="#c4b79d" strokeWidth="3"/>
 <rect x="360" y="210" width="1200" height="115" rx="20" fill="#263e3a"/>{[470,670,870,1070,1270,1470].map(x=><g key={x}><path d={`M${x} 222V187Q${x+14} 166 ${x+28} 187V222`} fill="none" stroke="#c6ae75" strokeWidth="8"/><path d={`M${x+3} 216V189`} stroke="#eee0b8" strokeWidth="2"/></g>)}<Txt x={415} y={284} size={42}>{label}</Txt>
 {[0,1,2,3,4,5,6].map(i=><g key={i}><Txt x={447+i*164} y={379} size={21} center fill="#506b60">{['MON','TUE','WED','THU','FRI','SAT','SUN'][i]}</Txt>{[0,1,2].map(j=><g key={j}><rect x={393+i*164} y={408+j*126} width="141" height="105" rx="6" fill="#e4dfcd"/><Txt x={410+i*164} y={438+j*126} size={20} fill="#8c8976">{j*7+i+1}</Txt></g>)}</g>)}
 {[0,1,2,3,4].map(i=><g key={i} opacity={enter(f,12+i*25,30+i*25)}><rect x={400+i*164} y="452" width="128" height="47" rx="5" fill="#739487"/><path d={`M${433+i*164} 474l12 12 25-27`} fill="none" stroke="#f5eedc" strokeWidth="5"/></g>)}
</>;

const Ledger:React.FC<{f:number;mode:string}>=({f,mode})=>{
 const labels=mode==='fee-audit'||mode==='receipts'?['BANK FEES','FUND EXPENSES','ADVISORY FEES','SUBSCRIPTIONS']:mode==='terms'?['INTEREST RATE','FEES','TOTAL REPAYMENT','AFFORDABILITY']:mode==='documents'?['BILLS','POLICIES','TAX RECORDS','CONTACTS']:mode==='costs'?['PURCHASE PRICE','UPKEEP','STORAGE','REPLACEMENT']:['INCOME','BILLS','PAYMENT PLANS','SAVINGS'];
 return <><rect width="1920" height="1080" fill="url(#m-wall)"/><g transform={`translate(960 530) rotate(${mode==='receipts'?-5:0}) translate(-960 -530)`}><path d="M431 155H1485V893H431Z" fill="#594a35" stroke="#9d8456" strokeWidth="3"/><path d="M444 170H1473V880H444Z" fill="#c8b58e"/><rect x="450" y="165" width="1020" height="710" rx="2" fill="url(#m-paper)"/><path d="M484 180V858" stroke="#a98657" strokeWidth="2"/><path d="M1460 180V860" stroke="#f1e1b7" strokeWidth="3"/><Txt x={525} y={259} size={43} fill={C.ink}>{mode==='fee-audit'?'FOLLOW THE FEES':mode==='costs'?'THE TOTAL COST':'FOLLOW THE MONEY'}</Txt>{labels.map((l,i)=><g key={l} opacity={enter(f,i*22,i*22+16)}><path d={`M525 ${345+i*115}H1395`} stroke="#d0c6ae" strokeWidth="2"/><Txt x={530} y={398+i*115} size={29} fill={C.ink}>{l}</Txt><rect x="1120" y={371+i*115} width={170-i*25} height="20" rx="4" fill={i===3?'#61877b':'#b08c4d'}/></g>)}</g></>;
};

const Phone:React.FC<{f:number;mode:string}>=({f,mode})=>{
 const fraud=['scam','panic','guaranteed','verify','registry'].includes(mode);
 const pause=mode==='phone-pause'; const cancelled=mode==='subscription';
 const reveal=enter(f,40,65);
 return <><rect width="1920" height="1080" fill="url(#m-wall)"/><circle cx="1450" cy="540" r="480" fill="url(#m-haze)" opacity=".6"/>
  <g transform={`translate(0 ${interpolate(f,[0,160],[12,-8],clamp)})`}><rect x="1060" y="160" width="420" height="685" rx="49" fill="#1d2b32" stroke="#a9b7a4" strokeWidth="6"/><rect x="1084" y="211" width="372" height="560" rx="15" fill="#f1ecdf"/><rect x="1190" y="181" width="160" height="10" rx="5" fill="#76857c"/>
  <Txt x={1270} y={291} size={28} fill={C.ink} center>{mode==='panic'?'URGENT MESSAGE':mode==='guaranteed'?'THE PROMISE':fraud?'CHECK THE CLAIM':cancelled?'SUBSCRIPTIONS':'YOUR CART'}</Txt>
  <Note x={1115} y={330} label={fraud?'GUARANTEED?':cancelled?'RECURRING PLAN':'NONESSENTIAL ITEM'} light/>
  <g opacity={1-enter(f,30,40)}><rect x="1115" y="561" width="310" height="77" rx="12" fill={fraud?'#a36359':'#b38d46'}/><Txt x={1270} y={609} size={25} center>{fraud?'HIGH RETURN / NO RISK?':cancelled?'RENEW AUTOMATICALLY':'BUY NOW'}</Txt></g>
  <g opacity={reveal}><rect x="1115" y="550" width="310" height="105" rx="12" fill="#386456"/><Txt x={1270} y={611} size={28} center>{fraud?'VERIFY INDEPENDENTLY':cancelled?'CANCEL UNUSED':pause?'WAIT 24 HOURS':'CHECK THE BUDGET'}</Txt></g>
  <circle cx="1270" cy="807" r="18" fill="#9aa88f"/></g>
  {!['panic','guaranteed'].includes(mode)&&<Guide id={`phone-${mode}`} x={550} y={570} scale={.95} action="letter" held="phone"/>}
  {!['panic','guaranteed'].includes(mode)&&<Copy text={fraud?'Confidence is not evidence.':cancelled?'A small charge. Every month.':pause?'Give the decision a day.':'Before you tap.'} x={155} y={155} w={680} size={55}/>}
 </>;
};

const Fact:React.FC<{value:string;label:string;source:string;f:number;note?:string}>=({value,label,source,f,note})=><>
 <rect width="1920" height="1080" fill="url(#m-wall)"/>
 <path d="M140 210H1780M140 790H1780" stroke="#3c514a" strokeWidth="2"/>
 <Txt x={180} y={284} size={25} fill={C.gold}>THE EVIDENCE</Txt>
 <g opacity={enter(f,0,20)}><Txt x={180} y={520} size={value.length>8?116:164} fill={C.gold} serif>{value}</Txt></g>
 <Copy text={label} x={920} y={345} w={810} size={54} color={C.ivory}/>
 <path d="M185 680H1735" stroke="#3c514a" strokeWidth="3"/>
 <Txt x={180} y={759} size={25} fill="#a7b6aa">{note||'U.S. data / see source and year below'}</Txt>
 <Txt x={180} y={845} size={23} fill="#91a5a1">{source}</Txt>
</>;

const Network:React.FC<{f:number;mode:string}>=({f,mode})=>{
 const labels=mode==='allocate'?['INVESTING','DEBT REDUCTION','QUALITY OF LIFE']:mode==='support'?['ADVICE','REMINDERS','DOCUMENTS']:mode==='diversify'?['HOLDING A','HOLDING B','HOLDING C']:['LEARN','DISCUSS','BUILD'];
 return <><rect width="1920" height="1080" fill="url(#m-wall)"/><Txt x={960} y={190} size={52} center serif>{mode==='allocate'?'Give the raise a job.':mode==='diversify'?'Spread the exposure.':'Build a useful system.'}</Txt><circle cx="960" cy="490" r="135" fill="url(#m-leather)" stroke="#b79b65" strokeWidth="2"/><Txt x={960} y={505} size={32} fill={C.gold} center>{mode==='allocate'?'YOUR RAISE':'YOUR PLAN'}</Txt>{labels.map((l,i)=>{const x=[400,960,1520][i],y=i===1?740:620;return <g key={l} opacity={enter(f,i*28,i*28+25)}><path d={`M960 490L${x} ${y}`} stroke="#a7c0a8" strokeWidth="2"/><rect x={x-220} y={y-55} width="440" height="110" rx="3" fill="url(#m-paper)" stroke="#a38d61" strokeWidth="2"/><Txt x={x} y={y+8} fill={C.ink} size={29} center>{l}</Txt></g>})}<Tag text={mode==='diversify'?'Conceptual illustration / diversification cannot prevent all losses':'Choose a structure that fits your circumstances'}/></>;
};

const LifeScene:React.FC<{style:string;f:number;id:string}>=({style,f,id})=>{
 const kitchen=['kitchen','groceries','meal','delivery'].includes(style);
 const park=['park','rest','leisure','relationships','friends'].includes(style);
 const clinic=['clinic','consultation','treatment'].includes(style);
 const desk=['adviser','conversation','interview','consultation','study-group'].includes(style);
 if(desk)return <Desk id={id} f={f} place={clinic?'clinic':style==='study-group'?'class':'office'} focus={style==='interview'?'SKILLS / ROLE / FIT':style==='consultation'?'CARE PLAN':'DISCUSS THE DECISION'}/>;
 const place=kitchen?'kitchen':park?'park':clinic?'clinic':['bank','street','apartment','repair','car'].includes(style)?'street':['night','sleep','television','comfort'].includes(style)?'night':['class','education','study'].includes(style)?'class':'office';
 return <>
  <Setting place={place}/>
  {style==='bank'?<><Art kind="bank" f={f} x={1130} y={495} scale={1.4}/><Guide id={id} x={370} y={540} scale={.85} action="letter" held="document"/></>:
   ['repair','car'].includes(style)?<><Art kind="car" carMode={style==='repair'?'repair':'purchase'} f={f} x={1250} y={545} scale={1.2}/><Guide id={id} x={530} y={550} scale={.85} action="consider"/>{style==='repair'&&<g opacity={enter(f,45,65)}><Note x={140} y={170} label="UNEXPECTED" value="REPAIR BILL" light/></g>}</>:
   kitchen?<><Guide id={id} x={530} y={548} scale={.92} action="present"/><g transform="translate(1320 587)"><Colleague x={0} y={0} stance="standing"/></g><rect x="260" y="665" width="1400" height="42" fill="url(#m-wood)" stroke="#b89860" strokeWidth="2"/><rect x="285" y="707" width="1350" height="153" fill="url(#m-leather)" stroke="#697b62" strokeWidth="2"/><Art kind="meal" f={f} x={1060} y={600} scale={.64}/>{style==='groceries'&&<g opacity={enter(f,30,60)}><path d="M1430 550H1550L1565 665H1415Z" fill="#b18a55"/><path d="M1460 550V520Q1490 490 1520 520V550" fill="none" stroke="#d6b176" strokeWidth="6"/></g>}</>:
   ['television','night','sleep','comfort'].includes(style)?<><rect x="280" y="563" width="640" height="190" rx="30" fill="#344b42"/><rect x="260" y="630" width="690" height="100" rx="30" fill="url(#m-leather)" stroke="#8b784e" strokeWidth="3"/><Guide id={id} x={615} y={655} scale={.88} seated action="consider"/><rect x="1140" y="270" width="560" height="330" rx="15" fill="#101e27" stroke="#5d7574" strokeWidth="15"/><path d="M1230 530L1370 357L1530 485L1650 340" stroke="#6c9c9c" strokeWidth="9" fill="none"/><path d="M1410 610V723M1290 730H1530" stroke="#344e51" strokeWidth="15"/>{style==='sleep'&&<Txt x={1450} y={458} size={82} center fill="#b9d0c1">REST</Txt>}</>:
   ['workshop','portfolio','study','jobs','certificate','education'].includes(style)?<><Guide id={id} x={535} y={645} seated scale={1} action="present"/><rect x="260" y="662" width="1200" height="40" fill="url(#m-wood)" stroke="#b89860" strokeWidth="2"/><path d="M320 700V927M1360 700V927" stroke="#6d634b" strokeWidth="18"/><Art kind="laptop" f={f} x={1110} y={527} scale={.7}/><g opacity={enter(f,45,75)}><Note x={1420} y={340} label={style==='certificate'?'CERTIFICATION':'VISIBLE WORK'} value={style==='jobs'?'RESEARCH':'PORTFOLIO'} light/></g></>:
   <><Guide id={id} x={645} y={540} scale={.9} action={park?'present':'consider'}/><g transform={`translate(${1290+interpolate(f,[0,90],[35,0],clamp)} 620) scale(1.25)`}><Colleague x={0} y={0} stance="standing"/></g>{park&&<><path d="M1460 709H1790M1480 748H1770" stroke="#bda070" strokeWidth="30"/><path d="M1510 748V837M1740 748V837" stroke="#41534c" strokeWidth="16"/></>}</>}
 </>;
};

const FACTS:Record<string,[string,string,string,string?]>={
 'time-stat':['2.6 hours','Average daily TV time','BLS / American Time Use Survey 2024','U.S. population age 15+ / average, not every individual'],
 'food-stat':['Food away','An expense worth planning','BLS / Consumer Expenditures 2024','Restaurants and takeaway / not a claim that eating out causes poverty'],
 'rate':['Above 20%','Average annual credit card rates','Federal Reserve / G.19 commercial-bank data','Recent years / not the rate on every account'],
 'debt-stat':['$1.21T','U.S. credit card balances','New York Fed / Q2 2025','Includes balances paid off each month'],
 'emergency-stat':['63%','Would use cash or its equivalent for a $400 emergency','Federal Reserve / SHED 2025','Includes a credit card paid off at the next statement'],
 'unexpected-stat':['59%','Reported a major unexpected expense','Federal Reserve / SHED 2025','U.S. adults / previous 12 months'],
 'income-stat':['$87,460','Real median annual household income','U.S. Census Bureau / Income 2025','U.S. / pretax household money income, not individual take-home pay'],
 'medical-stat':['26%','Skipped medical expenses because of cost','Federal Reserve / SHED 2025','U.S. adults / previous year'],
 'fraud-stat':['20%','Reported financial fraud or scams','Federal Reserve / SHED 2025','U.S. adults / survey estimate'],
 'fraud-loss':['$100B','Estimated non-credit-card fraud','Federal Reserve / SHED 2025','$56B borne directly by consumers / not all investment scams'],
};

const WORDS:Record<string,[string,string]>={
 'hypothetical':['An illustration.','Not a promised return.'],
 'scope':['Fraud takes many forms.','These totals cover more than investment scams.'],
 'spiva':['15 years.','No reported category had a majority of active managers outperform.'],
 'uncertainty':['Past performance','does not identify the next winner.'],
 'risk':['Risk remains.','Diversification cannot prevent every loss.'],
 'secret':['A secret shortcut?','Start by examining the claim.'],
 'decision':['Useful? Affordable?','Give the purchase a job before it takes your money.'],
 'one-action':['Choose one action.','Make the next step small enough to take.'],
 'step':['The next responsible step.','Use the options you have.'],
 'pattern':['A better pattern.','Something you can repeat.'],
 'system':['Make the useful action easier.','A reminder. A routine. A person you trust.'],
 'globe':['U.S. evidence.','Your costs and options may differ.'],
 'method-note':['A chosen payment method.','Not proof that everyone else is unable to pay.'],
 'overview':['15 money traps.','Practical systems to try.'],
};

const Flow:React.FC<{f:number;style:string}>=({f,style})=>{
 const list=style==='tax-account'?['INCOME','TAX PLAN','TAX RESERVE']:style==='payment-method'?['CASH','SAVINGS','CARD PAID NEXT STATEMENT']:style==='paid-card'?['STATEMENT','PAY IN FULL','NO CARRIED BALANCE']:style==='compound'?['CONTRIBUTIONS','EARNINGS','REINVESTMENT']:style==='manual-transfer'?['PAYMENT ARRIVES','CHECK BILLS','CHOOSE AN AMOUNT']:['INCOME CLEARS','BILLS + BUFFER','SAVINGS'];
 return <><rect width="1920" height="1080" fill="url(#m-wall)"/><Copy text={style==='payment-method'?'How would you pay?':style==='compound'?'Let earnings join the next cycle.':style==='paid-card'?'A balance can be paid in full.':'Make room for your future.'} x={165} y={170} w={1550} size={65}/>{list.map((l,i)=><g key={l} opacity={enter(f,i*30,i*30+20)}><rect x={155+i*555} y="431" width="490" height="230" rx="3" fill={i===2?'#b79a60':'url(#m-paper)'} stroke="#b89c65" strokeWidth="2"/><foreignObject x={190+i*555} y="509" width="420" height="120"><div style={{fontFamily:FONT_SANS,fontSize:31,textAlign:'center',color:C.ink}}>{l}</div></foreignObject>{i<2&&<path d={`M${665+i*555} 547h40l-13-14m13 14-13 14`} stroke={C.gold} strokeWidth="5" fill="none"/>}</g>)}<Tag text={style==='compound'?'Returns may be negative / fees and time affect outcomes':style==='payment-method'?'The remaining respondents are not automatically unable to pay':'Choose an amount your budget can sustain'}/></>;
};

const Buffer:React.FC<{f:number}>=({f})=><><rect width="1920" height="1080" fill="url(#m-wall)"/><Copy text="Give an emergency somewhere to land." color={C.ivory} x={145} y={180} w={750} size={64}/><path d="M1070 395Q1050 425 1060 464V757Q1210 835 1360 757V464Q1370 425 1350 395Z" fill="#99b8a4" fillOpacity=".45" stroke="#426b5a" strokeWidth="7"/><rect x="1080" y="350" width="260" height="42" rx="10" fill="#587668"/>{[0,1,2,3].map(i=><g key={i} opacity={enter(f,15+i*25,25+i*25)} transform={`translate(0 ${interpolate(f,[15+i*25,50+i*25],[-170,0],clamp)})`}><ellipse cx={1145+(i%2)*120} cy={721-Math.floor(i/2)*40} rx="47" ry="16" fill={C.goldDk} stroke={C.goldLt} strokeWidth="3"/></g>)}<Txt x={1210} y={570} fill={C.ivory} size={34} center>EMERGENCY</Txt><Txt x={1210} y={616} fill={C.ivory} size={34} center>BUFFER</Txt><Txt x={150} y={713} fill="#91a5a1" size={30}>Accessible. Affordable. Built over time.</Txt></>;

const Bills:React.FC<{f:number;style:string}>=({f,style})=><><Setting place="home"/><Guide id={`bills-${style}`} x={960} y={565} scale={.87} action="consider"/>{['RENT','MEDICAL','PAYMENTS','FAMILY'].map((label,i)=>{const x=[170,1360,230,1300][i],y=[200,260,580,610][i];return <g key={label} opacity={enter(f,i*25,i*25+20)} transform={`translate(0 ${interpolate(f,[i*25,i*25+40],[35,0],clamp)})`}><Note x={x} y={y} label={label} light/></g>})}</>;

const Fees:React.FC<{f:number;style:string}>=({f,style})=>{
 if(style==='fee-assumptions')return <><rect width="1920" height="1080" fill="url(#m-wall)"/><Copy text="The SEC's hypothetical example" color={C.ivory} center y={155}/>{[['$100,000','INITIAL PORTFOLIO'],['4%','ANNUAL RETURN BEFORE FEES'],['20 years','TIME']].map(([value,label],i)=><g key={value} opacity={enter(f,i*25,i*25+20)}><Txt x={360+i*600} y={490} size={91} center fill={C.gold} serif>{value}</Txt><Txt x={360+i*600} y={581} size={23} center fill="#91a5a1">{label}</Txt></g>)}<Txt x={960} y={803} size={26} center fill="#91a5a1">Illustrative assumptions / not a forecast</Txt></>;
 if(style==='fee-timeline')return <><rect width="1920" height="1080" fill="url(#m-wall)"/><Copy text="Small percentages. Long horizons." center y={160}/><path d="M240 565H1680" stroke="#637a77" strokeWidth="8"/>{[0,5,10,15,20].map((n,i)=><g key={n} opacity={enter(f,i*22,i*22+15)}><circle cx={240+i*360} cy="565" r="14" fill={C.gold}/><Txt x={240+i*360} y={640} center>YEAR {n}</Txt></g>)}<Tag text="Compare ongoing fees, not just the first year's cost"/></>;
 return <><rect width="1920" height="1080" fill="url(#m-wall)"/><Art kind="fees" f={f} x={960} y={520} scale={1.4}/><Txt x={960} y={902} size={23} center fill="#a0b0a7">SEC / Investor.gov / Understanding Fees</Txt></>;
};

const Compare:React.FC<{f:number;style:string}>=({f,style})=>{
 const labels=style==='horizon'?['NEEDED SOON','INVESTED FOR DECADES']:style==='priorities'?['TODAY’S ESSENTIALS','TOMORROW’S BUFFER']:style==='compare'?['SALARY + BENEFITS','STABILITY + COSTS']:style==='alternatives'?['BORROW','COMPARE ALTERNATIVES']:['BUY NOW','KEEP THE OPTIONS'];
 return <><rect width="960" height="1080" fill="#112127"/><rect x="960" width="960" height="1080" fill="#152b2c"/>{labels.map((l,i)=><g key={l} opacity={enter(f,i*30,i*30+25)}><Copy text={l} x={130+i*960} y={230} w={710} size={60} color={C.ivory} center/><Art kind={style==='horizon'?(i?'portfolio':'planner'):(i?'transfer':'phone')} f={f} x={480+i*960} y={625} scale={.68}/></g>)}</>;
};

const SOURCES:Record<string,string>={spiva:'S&P DJI / SPIVA U.S. Year-End 2024', 'fee-chart':'SEC / Investor.gov', 'fee-compare':'SEC / Investor.gov',treatment:'CDC / Physical Activity Benefits'};
const LIFE=new Set('street clinic family comfort television rest workshop portfolio study wardrobe kitchen groceries meal delivery restaurant bank education repair car night sleep park adviser conversation interview consultation study-group class friends leisure relationships jobs certificate apartment treatment'.split(' '));

const Shot:React.FC<{shot:any}>=({shot})=>{
 const f=useCurrentFrame(); const style=shot.style; const duration=shot.endFrame-shot.startFrame;
 const progress=enter(f,0,duration); let content:React.ReactNode;
 if(style==='chapter')content=<><rect width="1920" height="1080" fill="url(#m-wall)"/><circle cx="1510" cy="510" r="410" fill="#152a2c"/><Txt x={1440} y={730} size={460} center fill="#53654f" serif>{String(shot.chapter).padStart(2,'0')}</Txt><Txt x={175} y={309} fill={C.gold} size={26}>MONEY TRAP {shot.chapter} / 15</Txt><Copy text={shot.title} x={165} y={370} w={1170} size={98}/></>;
 else if(style==='end')content=<><rect width="1920" height="1080" fill={C.navy}/><foreignObject x="835" y="230" width="250" height="250"><Img src={staticFile('emblem.png')} style={{width:250,height:250}}/></foreignObject><Txt x={960} y={620} size={104} center serif>Aurelis</Txt><Txt x={960} y={720} size={32} center fill={C.gold}>MONEY. POWER. THE SYSTEMS THAT OUTLIVE BOTH.</Txt></>;
 else if(FACTS[style]){const [value,label,source,note]=FACTS[style];content=<Fact {...{value,label,source,note,f}}/>;}
 else if(WORDS[style]){const [a,b]=WORDS[style];content=<><rect width="1920" height="1080" fill="url(#m-wall)"/><path d="M200 280H1720" stroke={C.gold} strokeWidth="4"/><Copy text={a} x={200} y={325} w={1520} size={95} center/><Copy text={b} x={320} y={580} w={1280} size={42} center color="#b9caba"/></>;}
 else if(style==='wardrobe')content=<><Setting place="home"/><Guide id={shot.id} x={500} y={550} scale={.92} action="consider"/><rect x="1000" y="185" width="650" height="620" fill="url(#m-leather)" stroke="#a69777" strokeWidth="15"/><path d="M1080 265H1570" stroke="#e3d5b6" strokeWidth="8"/>{[0,1,2].map(i=><g key={i} transform={`translate(${1130+i*170} 290)`}><path d="M0-25Q20-56 40-25L20 0L-55 45H95L20 0" stroke="#c4ad7b" strokeWidth="5" fill="none"/><path d="M-25 32L-90 70L-62 168L-29 150L-30 345H72L70 150L106 168L130 70L65 32L20 65Z" fill={['#486964','#956d60','#b59a67'][i]} stroke="#c6b99d" strokeWidth="3"/></g>)}</>;
 else if(style==='status')content=<LifeScene style="car" f={f} id={shot.id}/>;
 else if(style==='debt')content=<Compare f={f} style="alternatives"/>;
 else if(style==='budget')content=<Ledger f={f} mode="ledger"/>;
 else if(style==='restaurant')content=<><Setting place="night"/>{[300,960,1620].map((x,i)=><g key={x}><path d={`M${x} 0V200`} stroke="#6a7c71" strokeWidth="5"/><path d={`M${x-90} 240Q${x} 105 ${x+90} 240Z`} fill="#c79c58"/><ellipse cx={x} cy="250" rx="83" ry="9" fill="#ecd7a2"/></g>)}<Guide id={shot.id} x={700} y={660} scale={1} seated action="present"/><g transform="translate(1300 630) scale(1.15)"><Colleague x={0} y={0} stance="seated"/></g><ellipse cx="960" cy="720" rx="440" ry="95" fill="url(#m-wood)" stroke="#b89860" strokeWidth="3"/><path d="M960 740V925M790 927H1130" stroke="#8c7658" strokeWidth="24"/><Art kind="meal" f={f} x={960} y={670} scale={.38}/></>;
 else if(style==='delivery')content=<><rect width="1920" height="1080" fill="url(#m-wall)"/><path d="M0 730H1920V1080H0Z" fill="url(#m-wood)"/><path d="M670 315H1210L1260 735H620Z" fill="#d3b78b" stroke="#8b6e4c" strokeWidth="6"/><path d="M800 319V220Q940 98 1080 220V319" fill="none" stroke="#e4cda4" strokeWidth="18"/><Txt x={940} y={528} size={56} fill="#6a5942" center>DINNER, DELIVERED</Txt><g opacity={enter(f,35,65)}><Note x={1280} y={520} label="ORDER TOTAL" value="+ DELIVERY" light/></g></>;
 else if(style==='wallet')content=<><rect width="1920" height="1080" fill="url(#m-wall)"/><rect x="595" y="355" width="730" height="390" rx="40" fill="#9d7251" stroke="#ceac7c" strokeWidth="7"/><path d="M630 399H1280V704H630Z" fill="none" stroke="#c49b6e" strokeWidth="4" strokeDasharray="10 9"/><rect x="1100" y="478" width="280" height="132" rx="20" fill="#78583f"/><circle cx="1160" cy="541" r="14" fill={C.gold}/><Copy text="Let the plan decide." x={320} y={175} w={1280} center/></>;
 else if(LIFE.has(style))content=<LifeScene style={style} f={f} id={shot.id}/>;
 else if(style==='registry')content=<><rect width="1920" height="1080" fill="url(#m-wall)"/><rect x="220" y="150" width="1480" height="715" rx="15" fill="url(#m-paper)" stroke="#b6ac95" strokeWidth="4"/><path d="M220 230H1700" stroke="#b6ac95" strokeWidth="4"/><Txt x={265} y={200} size={25} fill="#567365">INDEPENDENT CHECK / USE THE RELEVANT REGULATOR</Txt><Copy text="Check the record." x={300} y={300} w={1200} color={C.ink}/>{['CORRECT NAME','REQUIRED AUTHORISATION','DISCIPLINARY HISTORY'].map((l,i)=><g key={l} opacity={enter(f,15+i*22,30+i*22)}><Txt x={330} y={485+i*100} size={34} fill={C.ink}>{l}</Txt><path d={`M1450 ${465+i*100}l15 15 30-33`} stroke="#648b74" strokeWidth="7" fill="none"/></g>)}<Txt x={300} y={808} size={25} fill="#716b5b">If registration is required / registration is not an endorsement</Txt></>;
 else if(['checkout','phone-pause','subscription','scam','panic','guaranteed','verify'].includes(style))content=<Phone f={f} mode={style}/>;
 else if(['ledger','receipt','receipts','costs','fee-audit','statement','terms','documents'].includes(style))content=<Ledger f={f} mode={style}/>;
 else if(['calendar','policy','time-budget'].includes(style))content=<Calendar f={f} label={style==='time-budget'?'PROTECT A SMALL BLOCK':style==='policy'?'WHEN WILL YOU NEED THE MONEY?':'MAKE SPACE FOR THE NEXT STEP'}/>;
 else if(['network','allocate','diversify','support'].includes(style))content=<Network f={f} mode={style}/>;
 else if(['transfer','manual-transfer','payment-method','paid-card','compound','tax-account'].includes(style))content=<Flow f={f} style={style}/>;
 else if(style.startsWith('fee-'))content=<Fees f={f} style={style}/>;
 else if(['horizon','choices','priorities','compare','alternatives'].includes(style))content=<Compare f={f} style={style}/>;
 else if(style==='buffer'||style==='seed')content=<Buffer f={f}/>;
 else if(['crisis','bills'].includes(style))content=<Bills f={f} style={style}/>;
 else if(style==='leaks')content=<><Ledger f={f} mode="ledger"/>{[0,1,2].map(i=><g key={i} opacity={enter(f,i*25,i*25+20)}><path d={`M${720+i*240} 821v${25+progress*60}`} stroke="#aa724c" strokeWidth="5"/><circle cx={720+i*240} cy={855+progress*60} r="19" fill={C.goldDk}/></g>)}</>;
 else if(style==='payslip')content=<><Setting place="office"/><Guide id={shot.id} x={560} y={555} scale={.93} action="letter" held="document"/><g transform="translate(890 310) scale(1.75)"><Note x={0} y={0} label="PAYCHECK" value="INCOME" light/></g></>;
 else if(['clock','sale','wallet','coins'].includes(style))content=<><rect width="1920" height="1080" fill="url(#m-wall)"/><Art kind={style==='clock'?'time':style==='sale'?'sale':'transfer'} f={f}/></>;
 else throw new Error(`Unstoryboarded visual: ${style}`);
 const closeups:Record<string,[number,number,number]>={portfolio:[1.65,1120,480],groceries:[1.5,1300,540],meal:[1.6,1030,565],interview:[1.22,1130,500],treatment:[1.22,1020,440],conversation:[1.18,970,500],sleep:[1.15,640,470],panic:[1.3,1220,485],guaranteed:[1.5,1260,480]};
 const [base,focusX,focusY]=closeups[style]||[1,960,500];
 const zoom=LIFE.has(style)||closeups[style]?base+progress*.035:1;
 return <AbsoluteFill style={{background:C.navy}}>
  <svg width="1920" height="1080" viewBox="0 0 1920 1080"><Materials/><g transform={`translate(960 500) scale(${zoom}) translate(${-focusX} ${-focusY})`}>{content}</g>{SOURCES[style]&&<Txt x={110} y={909} size={22} fill="#b9c4b6">{SOURCES[style]}</Txt>}</svg>
  {style!=='end'&&<BrandMark/>}
 </AbsoluteFill>;
};

const phrases=captionPhrases(T.captions,T.beats);
export const MoneyHabitsV3:React.FC=()=>{
 const frame=useCurrentFrame();const phrase=phrases.find(p=>frame>=p.start&&frame<p.end);
 return <AbsoluteFill>{storyboard.map(s=><Sequence key={s.id} from={s.startFrame} durationInFrames={s.endFrame-s.startFrame}><Shot shot={s}/></Sequence>)}
  <div style={{position:'absolute',left:0,right:0,bottom:0,height:126,background:'linear-gradient(transparent,rgba(8,17,22,.94) 35%)'}}/>
  {phrase&&<div style={{position:'absolute',left:170,right:170,bottom:40,textAlign:'center',fontFamily:FONT_SANS,fontSize:39,fontWeight:500,color:C.ivory,textShadow:'0 2px 5px #000'}}>{phrase.words.map((w,i)=><span key={i} style={{color:frame>=w.startFrame&&frame<w.endFrame?C.gold:C.ivory}}>{w.word}{' '}</span>)}</div>}
 </AbsoluteFill>;
};
