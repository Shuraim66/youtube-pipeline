import React from "react";
import { Easing, interpolate } from "remotion";
import { geoMercator, geoPath, geoBounds, geoArea, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import land10m from "world-atlas/land-10m.json";
import type { Feature, MultiPolygon, Polygon } from "geojson";

/**
 * Night File map beat: real coastline (Natural Earth 10m via world-atlas, public domain),
 * camera zooms from a wide extent to a tight one while pins / a dashed distance line
 * appear. Frame-driven from the beat-local frame.
 */

export type MapSpec = {
  /** [[west, south], [east, north]] in degrees */
  from: [[number, number], [number, number]];
  to: [[number, number], [number, number]];
  /** frames of the zoom */
  zoomFrames?: number;
  pins: { lon: number; lat: number; label: string; tone?: "amber" | "white"; atFrame?: number; anchor?: "left" | "right" }[];
  /** dashed line between two pins (indexes) with a label */
  line?: { a: number; b: number; label: string; atFrame?: number };
};

const W = 820;
const H = 620;

type Poly = Feature<Polygon>;
let polysCache: { poly: Poly; b: [[number, number], [number, number]] }[] | null = null;
const allPolys = () => {
  if (polysCache) return polysCache;
  const topo = land10m as unknown as Topology<{ land: GeometryCollection }>;
  const fc = feature(topo, topo.objects.land) as unknown as { features: Feature<MultiPolygon | Polygon>[] };
  const out: { poly: Poly; b: [[number, number], [number, number]] }[] = [];
  for (const f of fc.features) {
    const rings = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const coords of rings) {
      let poly: Poly = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: coords } };
      // a ring wound the wrong way means "everything except this island" to d3 — flip it
      if (geoArea(poly as GeoPermissibleObjects) > 2 * Math.PI) {
        poly = { ...poly, geometry: { type: "Polygon", coordinates: coords.map((r) => [...r].reverse()) } };
      }
      out.push({ poly, b: geoBounds(poly as GeoPermissibleObjects) as [[number, number], [number, number]] });
    }
  }
  polysCache = out;
  return out;
};

const lerpBox = (a: MapSpec["from"], b: MapSpec["from"], p: number): MapSpec["from"] => [
  [a[0][0] + (b[0][0] - a[0][0]) * p, a[0][1] + (b[0][1] - a[0][1]) * p],
  [a[1][0] + (b[1][0] - a[1][0]) * p, a[1][1] + (b[1][1] - a[1][1]) * p],
];

export const MapBeat: React.FC<{ spec: MapSpec; local: number; amber: string; white: string; label: string; mono: string }> = ({ spec, local, amber, white, label, mono }) => {
  const p = interpolate(local, [0, spec.zoomFrames ?? 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const box = lerpBox(spec.from, spec.to, p);
  // pad the box a little so coastlines don't touch the frame
  const proj = geoMercator().fitExtent(
    [
      [0, 0],
      [W, H],
    ],
    { type: "MultiPoint", coordinates: [box[0], box[1], [box[0][0], box[1][1]], [box[1][0], box[0][1]]] } as GeoPermissibleObjects,
  );
  const path = geoPath(proj);
  const polys = allPolys().filter(({ b }) => b[1][0] >= spec.from[0][0] - 2 && b[0][0] <= spec.from[1][0] + 2 && b[1][1] >= spec.from[0][1] - 2 && b[0][1] <= spec.from[1][1] + 2);

  const pts: [number, number][] = spec.pins.map((pin) => (proj([pin.lon, pin.lat]) ?? [0, 0]) as [number, number]);
  const pulse = 1 + 0.35 * Math.abs(Math.sin(local / 9));

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* graticule-ish grid */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`v${i}`} x1={(i * W) / 8} x2={(i * W) / 8} y1={0} y2={H} stroke="rgba(242,244,245,0.05)" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h${i}`} x1={0} x2={W} y1={(i * H) / 6} y2={(i * H) / 6} stroke="rgba(242,244,245,0.05)" />
      ))}
      {polys.map(({ poly }, i) => (
        <path key={i} d={path(poly as GeoPermissibleObjects) ?? ""} fill="rgba(242,244,245,0.10)" stroke="rgba(242,244,245,0.55)" strokeWidth={1.4} />
      ))}
      {spec.line && local >= (spec.line.atFrame ?? 0) && (() => {
        const a = pts[spec.line.a] ?? [0, 0], b = pts[spec.line.b] ?? [0, 0];
        const q = interpolate(local, [spec.line.atFrame ?? 0, (spec.line.atFrame ?? 0) + 20], [0, 1], { extrapolateRight: "clamp" });
        const ex = a[0] + (b[0] - a[0]) * q, ey = a[1] + (b[1] - a[1]) * q;
        return (
          <g>
            <line x1={a[0]} y1={a[1]} x2={ex} y2={ey} stroke={amber} strokeWidth={3} strokeDasharray="10 8" />
            {q >= 1 && (
              <text x={(a[0] + b[0]) / 2} y={(a[1] + b[1]) / 2 - 18} fill={amber} fontFamily={mono} fontSize={30} fontWeight={700} textAnchor="middle">
                {spec.line.label}
              </text>
            )}
          </g>
        );
      })()}
      {spec.pins.map((pin, i) => {
        if (local < (pin.atFrame ?? 0)) return null;
        const [x, y] = pts[i]!;
        const col = pin.tone === "amber" ? amber : white;
        const right = pin.anchor !== "left";
        return (
          <g key={pin.label}>
            {pin.tone === "amber" && <circle cx={x} cy={y} r={22 * pulse} fill="none" stroke={amber} strokeWidth={2} opacity={0.6} />}
            <circle cx={x} cy={y} r={9} fill={col} />
            <text x={x + (right ? 22 : -22)} y={y + 10} fill={col} fontFamily={mono} fontSize={28} fontWeight={700} textAnchor={right ? "start" : "end"} letterSpacing={2}>
              {pin.label}
            </text>
          </g>
        );
      })}
      <text x={16} y={H - 16} fill={label} fontFamily={mono} fontSize={16}>
        MAP DATA: NATURAL EARTH (PUBLIC DOMAIN)
      </text>
    </svg>
  );
};
