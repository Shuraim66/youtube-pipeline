import marksJson from "../../public/vo/skills2030/sections.json";
import wordsJson from "../../public/vo/skills2030/words.json";
import creditsJson from "../../public/longform/broll/credits.json";
import { SECTIONS } from "./skills2030";
import type { Clip, Mark, Piece, ResolvedCard, ResolvedSection, Word } from "./types";

export const FPS = 30;
const marks = marksJson as Mark[];
export const words = wordsJson as Word[];
const clips = (creditsJson as { file: string; section: string; dur: number }[]) as Clip[];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const toks = (s: string) => s.split(/\s+/).map(norm).filter(Boolean);

/** index of the first word of `phrase` at/after `from` inside [w0,w1); throws so a bad anchor never ships silently */
function find(w0: number, w1: number, phrase: string, from = w0): number {
  const p = toks(phrase);
  for (let i = from; i + p.length <= w1; i++) {
    if (p.every((t, k) => norm(words[i + k]!.w) === t)) return i;
  }
  throw new Error(`anchor "${phrase}" not found in words ${w0}-${w1}`);
}

export const MAX_HOLD = 8; // no still/card longer than this
const PIECE = 6; // b-roll cut length target (s)
const CARD_LEAD = 0.2;

export const TAIL = 3;
export const TOTAL_SEC = words[words.length - 1]!.e + TAIL;
export const TOTAL_FRAMES = Math.ceil(TOTAL_SEC * FPS);

export function buildTimeline(): ResolvedSection[] {
  return SECTIONS.map((spec, si) => {
    const mark = marks.find((m) => m.id === spec.id)!;
    const visStart = si === 0 ? 0 : marks[si - 1]!.end;
    const visEnd = si === SECTIONS.length - 1 ? TOTAL_SEC : mark.end;

    // cards
    const cards: ResolvedCard[] = [];
    spec.cards.forEach((c, ci) => {
      const i = find(mark.w0, mark.w1, c.from);
      let start = i === mark.w0 ? visStart : Math.max(visStart, words[i]!.s - CARD_LEAD);
      let end: number;
      if (c.to) {
        const j = find(mark.w0, mark.w1, c.to, i + 1);
        end = words[j]!.s - 0.1;
      } else end = start + (c.dur ?? 6);
      if (c.dur && c.to) end = Math.min(end, start + c.dur);
      end = Math.min(end, start + MAX_HOLD, visEnd);
      const prev = cards[cards.length - 1];
      if (prev) {
        start = Math.max(start, prev.end);
        if (start >= end - 1.5) throw new Error(`card ${spec.id}#${ci} too short after overlap fix`);
      }
      const noteT = c.noteFrom ? words[find(mark.w0, mark.w1, c.noteFrom, i)]!.s - start : 0;
      cards.push({ ...c, start, end, secId: spec.id, cardIdx: ci, noteT });
    });

    // b-roll pieces fill the time the cards leave free; tiny gaps are absorbed by the neighbouring card
    const free: [number, number][] = [];
    let cur = visStart;
    for (const c of cards) {
      if (c.start - cur >= 1.2) free.push([cur, c.start]);
      else c.start = cur;
      cur = c.end;
    }
    if (visEnd - cur >= 1.2 || !cards.length) free.push([cur, visEnd]);
    else if (cards.length) cards[cards.length - 1]!.end = visEnd;

    const secClips = clips.filter((c) => c.section === spec.id);
    const pieces: Piece[] = [];
    let n = 0;
    for (const [a, b] of free) {
      const k = Math.max(1, Math.ceil((b - a) / PIECE));
      for (let q = 0; q < k; q++) {
        const clip = secClips[n % secClips.length]!;
        const use = Math.floor(n / secClips.length);
        const len = (b - a) / k;
        const offset = Math.max(0, Math.min(use * 4.5, clip.dur - len - 0.05));
        pieces.push({ start: a + q * len, end: a + (q + 1) * len, file: clip.file, offset, dir: n % 2 ? -1 : 1 });
        n++;
      }
    }

    // "TO START" lower-third: first ~8 words after "To start," while the sentence is spoken
    let toStart;
    if (spec.num) {
      const i = find(mark.w0, mark.w1, "To start");
      let j = i;
      while (j < mark.w1 - 1 && !/[.?!]$/.test(words[j]!.w)) j++;
      const body = words.slice(i + 2, j + 1).map((x) => x.w);
      const text = body.slice(0, 8).join(" ").replace(/[,;:]$/, "") + (body.length > 8 ? "…" : "");
      toStart = { start: words[i]!.s - 0.1, end: words[j]!.e + 0.4, text };
    }

    const chapterCard = spec.card ? { start: Math.max(0, mark.start - 0.4), end: mark.start + 1.1 } : undefined;
    return { spec, mark, visStart, visEnd, cards, pieces, toStart, chapterCard };
  });
}

export const TIMELINE = buildTimeline();

/** merged speech intervals, used to duck the music under the voice */
export const speech: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (const w of words) {
    const last = out[out.length - 1];
    if (last && w.s - last[1] < 0.35) last[1] = w.e;
    else out.push([w.s, w.e]);
  }
  return out;
})();
