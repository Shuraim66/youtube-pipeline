import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {Banker} from './Banker';
import {FONT_SERIF, FONT_SANS} from './theme';

const gold='#d6b473', paper='#eadbb9', ink='#0b141b';

export const MoneyThumbnail:React.FC=()=>{
 const f=useCurrentFrame();
 const coinY=interpolate(f,[0,45,90],[0,16,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:ink}}>
  <svg width="1920" height="1080" viewBox="0 0 1920 1080">
   <defs>
    <linearGradient id="thumb-wall" x2="1" y2="1"><stop stopColor="#23383a"/><stop offset=".45" stopColor="#142a31"/><stop offset="1" stopColor="#080f15"/></linearGradient>
    <linearGradient id="thumb-window" x2="0" y2="1"><stop stopColor="#859c89"/><stop offset=".7" stopColor="#35504a"/><stop offset="1" stopColor="#14252b"/></linearGradient>
    <linearGradient id="thumb-leather" x2="1" y2="1"><stop stopColor="#738477"/><stop offset=".45" stopColor="#3f5b55"/><stop offset="1" stopColor="#1a3035"/></linearGradient>
    <linearGradient id="thumb-gold" x2="0" y2="1"><stop stopColor="#f2dcaa"/><stop offset=".5" stopColor={gold}/><stop offset="1" stopColor="#9b7440"/></linearGradient>
    <radialGradient id="thumb-glow"><stop stopColor="#b49157" stopOpacity=".27"/><stop offset="1" stopColor="#b49157" stopOpacity="0"/></radialGradient>
    <filter id="thumb-shadow" x="-.3" y="-.3" width="1.6" height="1.7"><feGaussianBlur stdDeviation="18"/></filter>
   </defs>
   <rect width="1920" height="1080" fill="url(#thumb-wall)"/>
   <ellipse cx="1280" cy="510" rx="760" ry="620" fill="url(#thumb-glow)"/>
   <path d="M1010 711V291a253 253 0 0 1 506 0V711Z" fill="url(#thumb-window)" stroke="#927c56" strokeWidth="10"/>
   <path d="M1263 30V712M1015 454H1510M1015 583H1510" stroke="#263b3b" strokeWidth="13"/>
   <path d="M1020 703V637H1071V593H1110V648H1153V537H1193V623H1240V582H1288V647H1336V601H1370V650H1425V594H1499V710Z" fill="#12252b" opacity=".92"/>
   <path d="M0 868H1920V1080H0Z" fill="#0b171d"/>
   <path d="M0 869H1920" stroke="#88764f" strokeWidth="5"/>
   {[0,1,2,3,4].map(i=><path key={i} d={`M${120+i*345} 1080L${770+i*145} 870`} stroke="#43534b" strokeWidth="2" opacity=".35"/>)}
   <path d="M70 203H937" stroke="#667367" strokeWidth="2" opacity=".8"/>
   <path d="M72 218H620" stroke={gold} strokeWidth="5"/>

   {/* Brand lockup */}
   <image href={staticFile('emblem.png')} x={86} y={84} width={82} height={82}/>
   <text x="185" y="143" fill={gold} fontFamily={FONT_SERIF} fontSize="38" letterSpacing="1">Aurelis</text>
   <text x="89" y="272" fill="#a8b4a7" fontFamily={FONT_SANS} fontSize="23" letterSpacing="5">MONEY / HABITS / SYSTEMS</text>

   {/* Large, legible hook */}
   <text x="76" y="434" fill={paper} fontFamily={FONT_SERIF} fontWeight="700" fontSize="154" letterSpacing="-5">15 MONEY</text>
   <text x="66" y="608" fill="url(#thumb-gold)" fontFamily={FONT_SERIF} fontWeight="700" fontSize="184" letterSpacing="-5">TRAPS</text>
   <path d="M84 650H655" stroke="#aa8751" strokeWidth="3"/>
   <text x="86" y="725" fill={paper} fontFamily={FONT_SANS} fontWeight="600" fontSize="50">KEEP YOU BROKE?</text>

   {/* A cracked, overstuffed wallet and leaking coins make the subject immediate. */}
   <ellipse cx="1088" cy="860" rx="390" ry="54" fill="#03090d" opacity=".72" filter="url(#thumb-shadow)"/>
   <g transform="translate(1050 790) rotate(-8)">
    <path d="M-280-100Q-285-148-230-166L145-220Q215-224 230-165L260 104Q265 146 215 158L-235 193Q-283 190-285 142Z" fill="url(#thumb-leather)" stroke="#b29662" strokeWidth="8"/>
    <path d="M-250-108L-196-143L-125-121L-82-153L-26-121L30-157L93-123L157-145L234-107" fill="none" stroke="#0b171d" strokeWidth="14"/>
    <path d="M-250-108L-196-143L-125-121L-82-153L-26-121L30-157L93-123L157-145L234-107" fill="none" stroke="#d3b675" strokeWidth="3"/>
    <path d="M-230-27Q-50-56 218-31L229 87Q48 120-215 143Z" fill="#253b3b" stroke="#8f805b" strokeWidth="5"/>
    <path d="M-183 15Q-20-13 156 1" stroke="#728377" strokeWidth="3" opacity=".8"/>
    <path d="M-171 59Q-18 32 167 46" stroke="#728377" strokeWidth="3" opacity=".8"/>
    <text x="-119" y="105" fill="#bec2a7" fontFamily={FONT_SANS} fontSize="21" letterSpacing="4">BUFFER</text>
   </g>
   {[0,1,2].map(i=><g key={i} transform={`translate(${962+i*125} ${675+coinY+i*17})`}>
    <ellipse cy="0" rx="42" ry="13" fill="#080e12" opacity=".7" transform="translate(8 70)"/>
    <ellipse cy="0" rx="34" ry="34" fill="url(#thumb-gold)" stroke="#f0d69a" strokeWidth="4"/>
    <ellipse cy="0" rx="23" ry="23" fill="none" stroke="#8a673c" strokeWidth="3"/>
    <text y="12" textAnchor="middle" fontSize="37" fontFamily={FONT_SERIF} fill="#263630">$</text>
   </g>)}
   <path d="M1107 574Q1161 607 1197 646" fill="none" stroke="#e0c184" strokeWidth="5" strokeDasharray="3 17" strokeLinecap="round"/>

   {/* Recurring Aurelis guide, pointing to the leak. */}
   <ellipse cx="1604" cy="975" rx="229" ry="29" fill="#03090d" opacity=".7"/>
  </svg>
  <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
   <svg width="1920" height="1080" viewBox="0 0 1920 1080"><Banker x={1597} y={620} scale={1.3} action="point" stance="standing" id="money-thumb-guide"/></svg>
  </div>
 </AbsoluteFill>;
};
