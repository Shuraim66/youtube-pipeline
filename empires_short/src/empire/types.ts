/**
 * Data schema for "Business Empires That Died" Shorts.
 * Swap in a new EmpireTimeline to produce a new episode — no component changes needed.
 */

export type IconKey =
  | "store"
  | "handshake"
  | "crown"
  | "wifi"
  | "trendingDown"
  | "gavel"
  | "lock"
  | "skull"
  | "alert";

/** What fills the top of the frame during a beat. Omit (or "chart") to show the revenue chart. */
export type SceneSpec =
  | { kind: "chart"; zoom?: boolean }
  | {
      kind: "split";
      left: { name: string; value: string };
      right: { name: string; value: string };
      stamp: string;
      /** Frame (within the beat) the stamp slams in. */
      stampAt: number;
      /** Render fully composed from the first frame (for the frame-0 hook). */
      instant?: boolean;
    }
  | {
      kind: "stores";
      total: number;
      /** Fraction of dots lit at beat start / end (0–1). */
      litFrom: number;
      litTo: number;
      tone: "gold" | "red";
      /** Unit label, default "stores". */
      unit?: string;
      /** Replace the counter with this label (when no real count exists). */
      label?: string;
    }
  | { kind: "vhs" }
  /** Image-led beat: a real photo (path under public/), optional counting number. */
  | {
      kind: "image";
      src: string;
      credit?: string;
      number?: { from: number; to: number; prefix?: string; suffix?: string; decimals?: number; label: string };
    }
  /** One giant number counting from → to. */
  | { kind: "bigNumber"; from: number; to: number; prefix?: string; suffix?: string; decimals?: number; label: string; tone: "gold" | "red" }
  /** Timeline ruler with labelled marks; the playhead travels to `playhead`. */
  | {
      kind: "ruler";
      from: number;
      to: number;
      playheadFrom: number;
      playhead: number;
      marks: { year: number; label: string; tone?: "gold" | "red" }[];
    }
  /** Simple bar chart (one bar per period); peak + last are labelled. */
  | { kind: "bars"; items: { label: string; value: number }[]; prefix?: string; suffix?: string }
  /** BlackBerry-specific: keyboard phone loses its keys as a touchscreen slides in. */
  | { kind: "keyboardBreak" }
  | import("../three/Objects3D").Object3DSpec
  | import("./components/LoopTimer").LoopTimerSpec
  /** BlackBerry-specific: signal drops to "No Service", screen goes dark. */
  | { kind: "noService"; date: string; hold?: boolean }
  /** Lehman-specific: day cards flipping over (e.g. the weekend it died). */
  | { kind: "days"; caption: string; days: { day: string; date: string; note: string; tone?: "gold" | "red" }[] };

export type Severity = "info" | "peak" | "warning" | "failure";

export interface TimelineNode {
  /** Stable key for React lists. */
  id: string;
  /** When this beat starts, in seconds from the top of the video. */
  atSec: number;
  /** How long the beat holds before the next one takes over. */
  durationSec: number;
  /** Big date stamp, e.g. "2004". */
  label: string;
  /** Hard-hitting headline; split into words and scale-popped in one by one. */
  headline: string;
  /** Words from `headline` rendered in the accent colour (case-insensitive match). */
  emphasis?: readonly string[];
  /** Short supporting line under the headline. */
  subline?: string;
  icon: IconKey;
  severity: Severity;
  /** Metric value plotted on the bleeding chart (omit to keep this beat off the chart). */
  value?: number;
  /** Short label pinned to this point on the chart. */
  marker?: string;
  scene?: SceneSpec;
  /** Optional background footage (path under public/), dimmed + blurred behind the graphics. */
  bg?: string;
  /** Fire the structural screen-shake when this beat lands. */
  shake?: boolean;
}

export interface EmpireTimeline {
  /** Structural format (layout, type, transitions, progress, outro) — rotate per episode. Default "stack". */
  format?: import("./formats").EmpireFormat;
  /** Show the comment prompt from this second (mid-video), not just in the outro. */
  promptAtSec?: number;
  /** Year span for the "chapters" outro card, e.g. "2003 — 2018". */
  span?: string;
  company: string;
  /** Frame-0 hook — must work with sound off. */
  hook: string;
  hookEmphasis?: readonly string[];
  /** Chart metric description, e.g. "Annual revenue". */
  metricLabel: string;
  /** Formatter for chart values, e.g. v => `$${v}B`. */
  unitPrefix: string;
  unitSuffix: string;
  nodes: readonly TimelineNode[];
  /** Closing line. */
  outro: string;
  outroEmphasis?: readonly string[];
  outroDurationSec: number;
  /** Voiceover under public/ (starts at frame 0; beat timings must match it). */
  vo?: string;
  /** v2: visual hook scene shown above the hook headline on frame 0. */
  hookScene?: SceneSpec;
  /** v2: beats show only year + headline (+ failure pill) — no icon badge, no subline. */
  minimal?: boolean;
  /** v2: outro line plays over the last beat's scene (no static end card). */
  outroOverLast?: boolean;
  /** v2: on-screen comment prompt shown during the outro, e.g. "Did you own one? 👇" (not spoken). */
  prompt?: string;
}
