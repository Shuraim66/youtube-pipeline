import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AlertTriangle } from "lucide-react";
import { palette, severityColor, springs } from "../theme";
import type { TimelineNode } from "../types";
import { KineticHeadline } from "./KineticHeadline";
import { NodeIcon } from "./NodeIcon";

interface TimelineBeatProps {
  node: TimelineNode;
  /** Year + headline (+ failure pill) only. */
  minimal?: boolean;
}

/** One timeline beat: date stamp + icon badge, kinetic headline, subline. Frame 0 = beat start. */
export const TimelineBeat: React.FC<TimelineBeatProps> = ({ node, minimal = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = severityColor[node.severity];
  const isFailure = node.severity === "failure";

  const stamp = spring({ frame, fps, config: springs.snap });
  const badge = spring({ frame: frame - 3, fps, config: springs.pop });
  const sub = spring({ frame: frame - 10, fps, config: springs.settle });
  const blink = isFailure ? (Math.floor(frame / 6) % 2 === 0 ? 1 : 0.35) : 1;

  return (
    <div className="flex w-full flex-col items-center gap-6 px-4">
      <div className="flex items-center gap-6">
        {!minimal && <div
          className="flex items-center justify-center rounded-2xl"
          style={{
            width: 124,
            height: 124,
            background: `${color}1F`,
            border: `4px solid ${color}`,
            boxShadow: `0 0 40px ${color}55`,
            transform: `scale(${badge}) rotate(${interpolate(badge, [0, 1], [-25, 0])}deg)`,
          }}
        >
          <NodeIcon icon={node.icon} color={color} />
        </div>}
        <span
          className="font-black leading-none tabular-nums"
          style={{
            fontSize: 132,
            color,
            opacity: stamp,
            transform: `translateX(${interpolate(stamp, [0, 1], [80, 0])}px)`,
            textShadow: `0 0 40px ${color}66`,
          }}
        >
          {node.label}
        </span>
      </div>

      {isFailure && (
        <div
          className="flex items-center gap-3 rounded-full px-7 py-2"
          style={{
            background: palette.crimson,
            opacity: badge * blink,
            transform: `scale(${badge})`,
          }}
        >
          <AlertTriangle size={34} color={palette.obsidian} strokeWidth={3} />
          <span className="text-[30px] font-black uppercase tracking-[0.3em]" style={{ color: palette.obsidian }}>
            Structural failure
          </span>
        </div>
      )}

      <KineticHeadline
        text={node.headline}
        emphasis={node.emphasis}
        accent={isFailure ? palette.crimson : palette.gold}
        delay={3}
        stagger={3}
        fontSize={88}
      />

      {!minimal && node.subline && (
        <p
          className="max-w-[860px] text-center text-[40px] font-semibold leading-snug"
          style={{
            color: palette.ash,
            opacity: sub,
            transform: `translateY(${interpolate(sub, [0, 1], [30, 0])}px)`,
          }}
        >
          {node.subline}
        </p>
      )}
    </div>
  );
};
