/** Types for the Aurelis long-form (16:9) component. Kept separate from ArchivalShort/V2 on purpose. */
export type Stat = {
  /** numeric target for the count-up; omit when `display` is a fixed string (e.g. "2×", "#3") */
  value?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  display?: string;
  label: string;
};

export type Bar = { label: string; value: number; decimals?: number; prefix?: string; suffix?: string };

export type CardSpec = {
  /** the card appears when this phrase is first spoken in the section (normalised, punctuation ignored) */
  from: string;
  /** hides when this phrase is spoken; otherwise `dur` seconds (default 6) */
  to?: string;
  dur?: number;
  kind: "stats" | "bars" | "split" | "pair" | "cta";
  headline?: string;
  stats?: Stat[];
  bars?: Bar[];
  /** unsourced editorial cards (split/pair/cta) leave this out; every number card has one */
  source?: string;
  /** optional second source line (shown stacked under `source`) */
  source2?: string;
  /** small line under the bars/stats; appears when `noteFrom` is spoken */
  note?: string;
  noteFrom?: string;
  cols?: { title: string; range: string; items: string[] }[];
};

export type SectionSpec = {
  id: string; // s01…s20, matches public/vo/skills2030/sections.json
  chapter: string; // chapter name for the description
  /** skill number 15…1; undefined for the non-skill sections */
  num?: number;
  /** chapter-card title (upper case); omit for no card (cold open, close) */
  card?: string;
  cards: CardSpec[];
};

export type Mark = { id: string; label: string; start: number; end: number; w0: number; w1: number };
export type Word = { w: string; s: number; e: number; sec: string };
export type Clip = { file: string; section: string; dur: number };

export type ResolvedCard = CardSpec & { start: number; end: number; secId: string; cardIdx: number; noteT: number };
export type Piece = { start: number; end: number; file: string; offset: number; dir: 1 | -1 };
export type ToStart = { start: number; end: number; text: string };
export type ResolvedSection = {
  spec: SectionSpec;
  mark: Mark;
  visStart: number;
  visEnd: number;
  cards: ResolvedCard[];
  pieces: Piece[];
  toStart?: ToStart;
  chapterCard?: { start: number; end: number };
};
