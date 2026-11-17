import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette, springs } from "../theme";

export interface ChartPoint {
  label: string;
  value: number;
  /** Frame at which the line starts drawing toward this point. */
  atFrame: number;
  /** Event label pinned to this point once the line reaches it. */
  marker?: string;
}

interface BleedingChartProps {
  points: readonly ChartPoint[];
  width: number;
  height: number;
  unitPrefix: string;
  unitSuffix: string;
  metricLabel: string;
  /** Frames the line takes to travel between two points. */
  drawFrames?: number;
  /** 0–1: camera push toward the head of the line. */
  zoom?: number;
}

interface Datum {
  x: number;
  ghost: number;
  neon: number | null;
}

/**
 * Frame-driven "bleeding value" area chart. Recharts' own animation is disabled
 * (it runs on wall-clock time); instead the head of the line is interpolated
 * toward the next point with a spring every beat.
 */
export const BleedingChart: React.FC<BleedingChartProps> = ({
  points,
  width,
  height,
  unitPrefix,
  unitSuffix,
  metricLabel,
  drawFrames = 22,
  zoom = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const peak = useMemo(() => Math.max(...points.map((p) => p.value)), [points]);
  const yMax = Math.ceil(peak * 1.15);

  // Neon trail head: springs toward each point as its beat starts.
  let headX = 0;
  let headValue = points[0]?.value ?? 0;
  points.forEach((p, i) => {
    if (i === 0 || frame < p.atFrame) return;
    const prev = points[i - 1]!;
    const prog = Math.min(
      1,
      spring({ frame: frame - p.atFrame, fps, config: springs.settle, durationInFrames: drawFrames }),
    );
    headX = i - 1 + prog;
    headValue = interpolate(prog, [0, 1], [prev.value, p.value]);
  });

  // Ghost = full trajectory (always visible); neon = portion drawn so far.
  // Time axis is proportional: numeric labels (years) are plotted at their real
  // position, so uneven gaps (2011 → 2013 → 2014 → 2016) are not drawn as equal steps.
  const numeric = points.every((p) => /^\d{4}$/.test(p.label));
  const xs = points.map((p, i) => (numeric ? Number(p.label) : i));
  const xAt = (pos: number) => {
    const i = Math.min(xs.length - 2, Math.max(0, Math.floor(pos)));
    const a = xs[i] ?? 0;
    const b = xs[i + 1] ?? a;
    return xs.length < 2 ? a : a + (b - a) * (pos - i);
  };
  const xMin = xs[0] ?? 0;
  const xMax = xs[xs.length - 1] ?? 1;
  const data: Datum[] = points.map((p, i) => ({ x: xs[i] ?? i, ghost: p.value, neon: i <= Math.floor(headX) ? p.value : null }));
  if (headX % 1 !== 0) data.push({ x: xAt(headX), ghost: headValue, neon: headValue });
  data.sort((a, b) => a.x - b.x);

  const peakIndex = points.findIndex((p) => p.value === peak);
  const current: { x: number; value: number } = { x: xAt(headX), value: headValue };
  const isFalling = headX > peakIndex;
  const lineColor = isFalling ? palette.crimson : palette.gold;
  // Readout punches in each time the line starts toward a new point.
  const lastArrival = [...points].reverse().find((p) => frame >= p.atFrame);
  const sinceArrival = lastArrival ? frame - lastArrival.atFrame : 999;
  const punch = 1 + 0.28 * Math.exp(-sinceArrival / 5) * (sinceArrival < 30 ? 1 : 0);

  // Plot-space position of the head, for the zoom origin (margins match <AreaChart>).
  const plotW = width - 110 - 12 - 48;
  const plotH = height - 120 - 24 - 12 - 50;
  const headPxX = 12 + 110 + ((xAt(headX) - xMin) / Math.max(1, xMax - xMin)) * plotW;
  const headPxY = 120 + 24 + (1 - headValue / yMax) * plotH;

  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 4);
  const fmt = (v: number) => `${unitPrefix}${v.toFixed(v >= 100 ? 0 : 1)}${unitSuffix}`;

  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      <div className="mb-3 flex items-end justify-between px-6">
        <span className="text-[30px] font-bold uppercase tracking-[0.25em]" style={{ color: palette.ash }}>
          {metricLabel}
        </span>
        <span className="flex items-center gap-4 text-[84px] font-black leading-none" style={{ color: palette.bone }}>
          {/* status lives in the marker, not the text colour */}
          <span
            className="inline-block"
            style={{
              width: 0,
              height: 0,
              borderLeft: "22px solid transparent",
              borderRight: "22px solid transparent",
              ...(isFalling
                ? { borderTop: `34px solid ${palette.crimson}` }
                : { borderBottom: `34px solid ${palette.gold}` }),
              filter: `drop-shadow(0 0 10px ${lineColor})`,
            }}
          />
          <span style={{ display: "inline-block", transform: `scale(${punch})`, transformOrigin: "right bottom" }}>
            {fmt(current.value)}
          </span>
        </span>
      </div>
      <style>{`.neon-trail .recharts-area-curve { filter: drop-shadow(0 0 6px ${lineColor}) drop-shadow(0 0 18px ${lineColor}88); }`}</style>
      <div
        style={{
          transform: `scale(${1 + zoom * 0.15})`,
          transformOrigin: `${headPxX}px ${headPxY - 120}px`,
        }}
      >
      <AreaChart
        width={width}
        height={height - 120}
        data={data}
        margin={{ top: 24, right: 48, bottom: 12, left: 12 }}
      >
        <defs>
          <linearGradient id="bleed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.crimson} stopOpacity={0.75} />
            <stop offset="55%" stopColor={palette.crimsonDeep} stopOpacity={0.35} />
            <stop offset="100%" stopColor={palette.obsidian} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="bleedStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={palette.gold} />
            <stop offset="35%" stopColor={palette.crimson} />
            <stop offset="100%" stopColor={palette.crimson} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={palette.grid} vertical={false} />
        <XAxis
          dataKey="x"
          type="number"
          domain={[xMin, xMax]}
          ticks={xs}
          tickFormatter={(v: number) => points[xs.indexOf(v)]?.label ?? ""}
          tick={{ fill: palette.ash, fontSize: 30, fontWeight: 800 }}
          axisLine={{ stroke: palette.grid }}
          tickLine={false}
          tickMargin={14}
        />
        <YAxis
          domain={[0, yMax]}
          tickFormatter={fmt}
          tick={{ fill: palette.ash, fontSize: 26, fontWeight: 700 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <ReferenceLine
          y={peak}
          stroke={palette.gold}
          strokeDasharray="10 10"
          strokeOpacity={0.6}
          label={{ value: "PEAK", fill: palette.gold, fontSize: 24, fontWeight: 900, position: "insideTopRight" }}
        />
        <Area
          type="monotone"
          dataKey="ghost"
          stroke="rgba(245,245,244,0.24)"
          strokeWidth={5}
          strokeDasharray="4 10"
          fill="none"
          isAnimationActive={false}
          dot={false}
          activeDot={false}
        />
        <Area
          type="monotone"
          dataKey="neon"
          className="neon-trail"
          connectNulls={false}
          activeDot={false}
          stroke="url(#bleedStroke)"
          strokeWidth={9}
          fill="url(#bleed)"
          isAnimationActive={false}
          dot={false}
        />
        {points.map((p, i) =>
          p.marker && frame >= p.atFrame + drawFrames * 0.6 ? (
            <ReferenceDot
              key={`m${i}`}
              x={xs[i]}
              y={p.value}
              r={9}
              fill={palette.bone}
              stroke={palette.obsidian}
              strokeWidth={3}
              label={{
                value: p.marker.toUpperCase(),
                position: i === 0 ? "right" : i === points.length - 1 ? "left" : "top",
                offset: 18,
                fill: palette.bone,
                fontSize: 24,
                fontWeight: 900,
              }}
            />
          ) : null,
        )}
        {(
          <ReferenceDot
            x={current.x}
            y={current.value}
            r={14 + pulse * 10}
            fill={lineColor}
            fillOpacity={0.35 + pulse * 0.4}
            stroke={palette.bone}
            strokeWidth={4}
          />
        )}
      </AreaChart>
      </div>
    </div>
  );
};
