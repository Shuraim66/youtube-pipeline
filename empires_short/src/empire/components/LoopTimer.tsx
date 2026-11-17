import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { palette } from "../theme";

/** Vine object: a ring that sweeps 6 seconds then snaps back and loops (with a loop counter). */
export type LoopTimerSpec = { kind: "loopTimer"; seconds: number; label: string };

export const LoopTimerScene: React.FC<{ spec: LoopTimerSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // sped-up clock so the full 6 s sweep happens ~3x per beat
  const cycle = Math.round(fps * 1.4);
  const t = (frame % cycle) / cycle;
  const loops = Math.floor(frame / cycle) + 1;
  const R = 230, C = 2 * Math.PI * R;
  const secs = Math.min(spec.seconds, Math.floor(t * spec.seconds) + 1);
  const snap = frame % cycle < 3;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center" style={{ paddingRight: 60 }}>
      <svg width={560} height={560} viewBox="-280 -280 560 560">
        <circle r={R} fill="none" stroke="rgba(245,245,244,0.1)" strokeWidth={34} />
        <circle r={R} fill="none" stroke={snap ? palette.bone : palette.gold} strokeWidth={34} strokeLinecap="round" strokeDasharray={`${C * t} ${C}`} transform="rotate(-90)" />
        <text y={40} textAnchor="middle" fontSize={190} fontWeight={900} fill={palette.bone} fontFamily="Inter, sans-serif">
          {secs}s
        </text>
        <text y={110} textAnchor="middle" fontSize={34} fontWeight={800} fill={palette.ash} letterSpacing={6} fontFamily="Inter, sans-serif">
          LOOP ×{loops}
        </text>
      </svg>
      <span className="text-[34px] font-extrabold uppercase tracking-[0.3em]" style={{ color: palette.ash }}>
        {spec.label}
      </span>
    </div>
  );
};
