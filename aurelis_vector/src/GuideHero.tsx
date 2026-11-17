import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Guide} from './Guide';
import {FONT_SANS, FONT_SERIF} from './theme';

// Single large hero view of the Aurelis flat-vector guide, for design review.
export const GuideHero: React.FC = () => (
  <AbsoluteFill style={{background: '#16212f'}}>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="hero-bg" x1="0" y1="0" x2=".3" y2="1">
          <stop stopColor="#243a52" /><stop offset=".55" stopColor="#18263a" /><stop offset="1" stopColor="#0c141f" />
        </linearGradient>
        <radialGradient id="hero-glow"><stop stopColor="#e3b23c" stopOpacity=".22" /><stop offset="1" stopColor="#e3b23c" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#hero-bg)" />
      <ellipse cx="540" cy="1040" rx="620" ry="640" fill="url(#hero-glow)" />
      <path d="M0 1520H1080V1920H0Z" fill="#0c141f" opacity=".5" />
      <path d="M0 1520H1080" stroke="#e3b23c" strokeWidth="2" opacity=".25" />

      <text x="540" y="360" textAnchor="middle" fontFamily={FONT_SANS} fontSize="24" letterSpacing="6" fill="#e3b23c">THE AURELIS GUIDE</text>
      <text x="540" y="440" textAnchor="middle" fontFamily={FONT_SERIF} fontSize="52" fontWeight="700" fill="#efe7d6">FLAT-VECTOR · CODED</text>

      <Guide x={540} y={1560} scale={1.9} action="present" stance="standing" id="hero" gestureAt={0} held="none" />
    </svg>
  </AbsoluteFill>
);
