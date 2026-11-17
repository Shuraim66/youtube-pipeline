import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Guide} from './Guide';
import {FONT_SANS} from './theme';

// Isolated character check: the guide in each pose against the Aurelis ground.
export const GuideTest: React.FC = () => (
  <AbsoluteFill style={{background: '#16212f'}}>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920">
      <rect width="1080" height="1920" fill="#1a2636" />
      {(['present', 'point', 'hold', 'consider'] as const).map((a, i) => {
        const x = 270 + (i % 2) * 540;
        const y = 640 + Math.floor(i / 2) * 900;
        return (
          <g key={a}>
            <Guide x={x} y={y} scale={0.9} action={a} stance="standing" id={`t${i}`} gestureAt={0} held={a === 'hold' ? 'card' : 'none'} />
            <text x={x} y={y + 90} textAnchor="middle" fontFamily={FONT_SANS} fontSize="30" fill="#e3b23c" letterSpacing="2">{a.toUpperCase()}</text>
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);
