import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface ShakeImpact {
  /** Frame the failure threshold is crossed. */
  frame: number;
  /** Peak displacement in px. */
  intensity: number;
}

export interface ShakeTransform {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  /** 0–1 envelope, useful for syncing flashes / chromatic splits. */
  energy: number;
}

/**
 * Deterministic structural shake: every impact fires a sharp attack then a decaying
 * multi-frequency wobble. Pure function of the frame so renders are reproducible.
 */
export const useScreenShake = (impacts: readonly ShakeImpact[]): ShakeTransform => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let x = 0;
  let y = 0;
  let rotate = 0;
  let energy = 0;

  for (const [n, impact] of impacts.entries()) {
    const t = frame - impact.frame;
    if (t < 0 || t > fps * 0.8) continue;
    const env = interpolate(t, [0, 2, fps * 0.8], [0, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const decay = env * env;
    const seed = n * 13.37;
    x += Math.sin(t * 2.9 + seed) * impact.intensity * decay;
    y += Math.cos(t * 3.7 + seed * 0.5) * impact.intensity * 0.7 * decay;
    rotate += Math.sin(t * 2.3 + seed) * 1.6 * decay;
    energy = Math.max(energy, decay);
  }

  return { x, y, rotate, scale: 1 + energy * 0.04, energy };
};

interface ScreenShakeProps {
  impacts: readonly ShakeImpact[];
  children: React.ReactNode;
}

/** Wraps the whole layout; distorts it (and flashes red) at each failure threshold. */
export const ScreenShake: React.FC<ScreenShakeProps> = ({ impacts, children }) => {
  const s = useScreenShake(impacts);
  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg) scale(${s.scale})`,
        filter:
          s.energy > 0.02
            ? `drop-shadow(${s.energy * 10}px 0 0 rgba(239,68,68,0.55)) drop-shadow(${-s.energy * 10}px 0 0 rgba(56,189,248,0.25))`
            : undefined,
      }}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(239,68,68,0.0) 30%, rgba(239,68,68,0.55) 100%)",
          opacity: s.energy * 0.9,
        }}
      />
    </div>
  );
};
