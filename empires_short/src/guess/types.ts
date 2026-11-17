/** Props for GuessShort ("Guess first" format): a question + countdown + reveal, then evidence cards. No voiceover. */

import type { MapSpec } from "../nightfile/MapBeat";

export type GuessKey = "A" | "B" | "C";

export type GuessImage = {
  /** image file; ignored when `map` is set */
  src: string;
  /** animated real-coastline map (MapBeat, Natural Earth, public domain) drawn over a dark backdrop instead of a photo */
  map?: MapSpec;
  /** rendered 3D frame sequence (e.g. Blender) aligned to the composition timeline: frame = round(t * fps), file `${dir}/f_NNNN.jpg`; replaces `src` and draws an "ILLUSTRATION" tag */
  seq?: { dir: string; count: number };
  /** small label saying what the image actually shows (top-left under the brand) */
  credit: string;
  /** typed evidence card (big number, lines, footer) drawn over `src`, darkened and blurred; no photo detail is meant to be read */
  typed?: { label: string; big: string; lines: string[]; foot: string };
  /** cover only: extra zoom about the `focus` point ("x% y%"), to frame a detail without a new file */
  zoom?: number;
  /** "cover" (default) = full-bleed; "contain" = whole low-res image over a blurred backdrop */
  fit?: "cover" | "contain";
  /** CSS object-position for cover, e.g. "45% 50%" */
  focus?: string;
  /** contain only: vertical placement of the 900 px-wide image (default top 250, height 800) */
  box?: { top: number; height: number };
};

export type GuessOption = { key: GuessKey; text: string };

export type GuessCard = {
  text: string;
  /** phrase inside `text` drawn in the accent colour */
  hl?: string;
  img: GuessImage;
  /** optional fixed duration (s) instead of the reading-time rule, e.g. to match a voiced line (Old Money Short A) */
  sec?: number;
};

export type GuessShortProps = {
  brand: "nightfile" | "aurelis";
  /** question lines; line 1 white, the rest accent. Full question is on screen at frame 0. */
  question: string[];
  /** image behind the question and options */
  evidence: GuessImage;
  options: GuessOption[];
  correct: GuessKey;
  /** image shown from the reveal until the first card */
  revealImage: GuessImage;
  /** big stamp on the reveal */
  stamp: string;
  countdownLabel: string;
  cards: GuessCard[];
  closing: { text: string; img: GuessImage; /** hold the closing for max(2.2 s, words / 3.5 + 0.8 s) instead of a fixed 2.2 s */ byReadingTime?: boolean; /** optional fixed closing duration (s) */ sec?: number };
  /** flow layout for long questions (see GuessShort); Flight 19 keeps the fixed layout */
  compact?: boolean;
  /**
   * "early" (default, all existing episodes): options -> 3-2-1 countdown -> reveal -> evidence cards -> closing.
   * "end": options shrink into a strip, evidence cards play, and the answer is held until the last seconds (no countdown ticks).
   */
  reveal?: "early" | "end";
  /** draw the Shorts safe-zone rectangle (QA stills only) */
  debugSafe?: boolean;
  /** end mode: optional answer-stamp hold (s) before the closing, default END_BEATS.stampHold */
  stampHoldSec?: number;
  /** embedding: skip the built-in loop bridge / built-in audio (the host composition does its own) */
  noBridge?: boolean;
  noAudio?: boolean;
};

export const GUESS_FPS = 30;

/** Fixed beats of the format (seconds). */
export const GUESS_BEATS = {
  optionsAt: 1.2,
  optionGap: 0.3,
  optionSlide: 0.25,
  countdownSec: 3,
  /** reveal stamp stays alone on screen this long before the first card */
  stampHold: 1.0,
  closingSec: 2.2,
  bridgeSec: 0.4,
} as const;

/** Reading time for a card: max(2.2 s, words / 3.5 + 0.8 s). */
export const cardSeconds = (text: string): number =>
  Math.max(2.2, text.trim().split(/\s+/).length / 3.5 + 0.8);

export type GuessTiming = {
  /** end mode: options start shrinking into the strip (0 in early mode) */
  stripAt: number;
  countdownAt: number;
  revealAt: number;
  cardsAt: number;
  /** [start, end] seconds per card, frame-aligned (durations rounded up to whole frames) */
  cardWindows: [number, number][];
  closingAt: number;
  durationFrames: number;
  durationSec: number;
};

/** End-mode beats: full question + options stay readable until stripAt, strip settles by cardsAt, answer stamp holds endStampHold before the closing. */
export const END_BEATS = { stripAt: 3.4, cardsAt: 3.9, stampHold: 1.2 } as const;

export function guessTiming(p: GuessShortProps): GuessTiming {
  const B = GUESS_BEATS;
  if (p.reveal === "end") {
    let f = Math.round(END_BEATS.cardsAt * GUESS_FPS);
    const cardWindows: [number, number][] = p.cards.map((c) => {
      const start = f;
      f += Math.ceil((c.sec ?? cardSeconds(c.text)) * GUESS_FPS);
      return [start / GUESS_FPS, f / GUESS_FPS];
    });
    const revealAt = f / GUESS_FPS;
    f += Math.round((p.stampHoldSec ?? END_BEATS.stampHold) * GUESS_FPS);
    const closingAt = f / GUESS_FPS;
    const closingSec = p.closing.sec ?? (p.closing.byReadingTime ? Math.max(B.closingSec, cardSeconds(p.closing.text)) : B.closingSec);
    const durationFrames = f + Math.ceil(closingSec * GUESS_FPS);
    return { stripAt: END_BEATS.stripAt, countdownAt: revealAt, revealAt, cardsAt: END_BEATS.cardsAt, cardWindows, closingAt, durationFrames, durationSec: durationFrames / GUESS_FPS };
  }
  // countdown starts as the last option finishes sliding in (1.2 + 2×0.3 + 0.25 = 2.05 s → 2.0 s, the slide is ~99% done)
  const countdownAt = Math.round(2.0 * GUESS_FPS) / GUESS_FPS;
  const revealAt = countdownAt + B.countdownSec;
  const cardsAt = revealAt + B.stampHold;
  let f = Math.round(cardsAt * GUESS_FPS);
  const cardWindows: [number, number][] = p.cards.map((c) => {
    const start = f;
    f += Math.ceil(cardSeconds(c.text) * GUESS_FPS);
    return [start / GUESS_FPS, f / GUESS_FPS];
  });
  const closingAt = f / GUESS_FPS;
  // default closing = fixed closingSec (episodes 1-7 as approved); closing.byReadingTime applies the card reading-time rule to it
  const closingSec = p.closing.byReadingTime ? Math.max(B.closingSec, cardSeconds(p.closing.text)) : B.closingSec;
  const durationFrames = f + Math.ceil(closingSec * GUESS_FPS);
  return { stripAt: 0, countdownAt, revealAt, cardsAt, cardWindows, closingAt, durationFrames, durationSec: durationFrames / GUESS_FPS };
}
