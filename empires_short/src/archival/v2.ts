/**
 * V2 template for ArchivalShort: config types, pure timing helpers and the deterministic episode validator.
 * No React / no fs here, so the same code drives the renderer, the CLI validator (scripts/validate_episodes.ts) and tests.
 *
 * V1 (the default) ignores everything in this file except `validateEpisode`, so existing episodes render unchanged.
 */
import type { ArchivalShortProps, Card, Shot, Word } from "./ArchivalShort";

export type TemplateVersion = "v1" | "v2";
export type NarrativeRole = "hook" | "setup" | "conflict" | "evidence" | "reveal" | "payoff";
export const NARRATIVE_ROLES: NarrativeRole[] = ["hook", "setup", "conflict", "evidence", "reveal", "payoff"];

export type V2Hook = {
  /** 1–2 short lines shown only during the opening hook phase */
  lines: string[];
  /** hook phase end in seconds (default 2.0); the headline fades out over the last 0.25 s and never returns */
  until?: number;
  /** a substring (number/date/word) rendered larger in the accent colour; optional */
  emphasis?: string;
  /** visual for the hook phase only; the regular shot list continues after `until` */
  shot?: Shot;
  /** top of the hook block in px (default 900 — under a centred face, clear of captions at 1360; validator checks the fit) */
  top?: number;
};

export type V2Payoff = {
  /** when the payoff/explanation/unresolved fact is spoken (sec) */
  at: number;
  kind: "resolved" | "explanation" | "unresolved";
  /** the verified closing fact (also used as on-screen text when `show`) */
  text: string;
  source?: string;
  /** render as the closing lower card (default true) */
  show?: boolean;
  /** "card" (default, V2 original) or "hero": larger card above the captions with the image dimmed behind it */
  style?: "card" | "hero";
  /** optional end of the payoff layer (default: video end) — e.g. to follow it with a "disputed" card */
  until?: number;
  /** hero only: short label above the payoff ("THE VERDICT", "WHERE SHE WAS") */
  kicker?: string;
};

export type V2Config = {
  hook: V2Hook;
  payoff: V2Payoff;
  /** "reduced" (default) hides the ticker tape / date stamp and allows one overlay at a time */
  overlayDensity?: "reduced" | "normal";
};

export const HOOK_DEFAULT_UNTIL = 2.0;
export const HOOK_FADE = 0.25;
export const HOOK_DEFAULT_TOP = 900;
export const CAPTION_TOP = 1360;
export const CAPTION_SIDE = 140;
export const FRAME_W = 1080;
export const BRIDGE_FRAMES = 8;

export const isV2 = (p: Pick<ArchivalShortProps, "templateVersion">) => p.templateVersion === "v2";
export const hookUntil = (p: ArchivalShortProps) => p.v2?.hook.until ?? HOOK_DEFAULT_UNTIL;

/**
 * Shot list actually rendered. V1: `shots` untouched. V2 with `hook.shot`: the hook visual owns [0, until),
 * and the first regular shot starts at `until` (later shots keep their narration-synced times).
 */
export function effectiveShots(p: ArchivalShortProps): Shot[] {
  if (!isV2(p) || !p.v2?.hook.shot) return p.shots;
  const until = hookUntil(p);
  // regular shots that would have started inside the hook phase are dropped (the first one is moved to `until`)
  const rest = p.shots.map((s, i) => (i === 0 ? { ...s, at: Math.max(s.at, until) } : s)).filter((s) => s.at >= until);
  return [{ ...p.v2.hook.shot, at: 0, role: "hook" }, ...rest];
}

/** V2 cards never compete with the hook: anything starting inside the hook phase is delayed to its end */
export function effectiveCards(p: ArchivalShortProps): Card[] {
  if (!isV2(p)) return p.cards;
  const until = hookUntil(p);
  return p.cards.map((c) => (c.at < until ? { ...c, at: until } : c)).filter((c) => c.until > c.at);
}

/** V2 transition rule: flash only when the narrative role changes (new information), plain cut otherwise */
export function isBeatChange(shots: Shot[], i: number): boolean {
  if (i <= 0) return false;
  const a = shots[i - 1]!.role;
  const b = shots[i]!.role;
  return a !== undefined && b !== undefined && a !== b;
}

export type Layer = "hook" | "payoff" | "card" | "question" | "none";

/**
 * One dominant overlay layer at a time (captions are separate and always on).
 * Priority: hook > payoff > card > question.
 */
export function dominantLayer(p: ArchivalShortProps, t: number): Layer {
  if (isV2(p)) {
    if (t < hookUntil(p)) return "hook";
    const pay = p.v2!.payoff;
    if (pay.show !== false && t >= pay.at && t < (pay.until ?? Infinity)) return "payoff";
    if (effectiveCards(p).some((c) => t >= c.at && t < c.until)) return "card";
  } else if (p.cards.some((c) => t >= c.at && t < c.until)) return "card";
  if (p.question?.windows.some(([a, b]) => t >= a && t < b)) return "question";
  return "none";
}

/** caption chunks exactly as <Captions> groups them (3 words), with the displayed text */
export function captionChunks(words: Word[], display?: Record<string, string>): string[] {
  const out: string[] = [];
  for (let i = 0; i < words.length; i += 3)
    out.push(words.slice(i, i + 3).map((w) => display?.[w.w] ?? w.w.replace(/^[,.]+/, "")).filter(Boolean).join(" "));
  return out;
}

export type Issue = { level: "error" | "warning"; code: string; msg: string };

/** rough Inter-900 uppercase width per char at 86 px (empirical ≈0.62 em) */
const CAPTION_CHAR_PX = 86 * 0.62;
const CAPTION_WIDTH = FRAME_W - 2 * CAPTION_SIDE;
const HOOK_LINE_PX = 106;

/**
 * Deterministic checks. Errors = would render wrong / break the V2 contract; warnings = editorial or legibility risks.
 * `fps` is the composition fps; `assetExists` / `audioSec` are injected by the CLI (fs-free here).
 */
export function validateEpisode(
  p: ArchivalShortProps,
  opts: { fps: number; assetExists?: (src: string) => boolean; audioSec?: number } = { fps: 30 },
): Issue[] {
  const issues: Issue[] = [];
  const err = (code: string, msg: string) => issues.push({ level: "error", code, msg });
  const warn = (code: string, msg: string) => issues.push({ level: "warning", code, msg });
  const { fps } = opts;
  const dur = p.durationSec;
  const frames = Math.round(dur * fps);

  // --- timing boundaries
  if (!(dur > 0)) err("duration", `durationSec must be > 0 (got ${dur})`);
  if (dur < 15 || dur > 40) warn("duration-range", `durationSec ${dur}s is outside the 15–40 s Shorts sweet spot`);
  const shots = effectiveShots(p);
  if (!shots.length) err("shots-empty", "no shots");
  else if (shots[0]!.at !== 0) err("shot-start", `first shot must start at 0 (got ${shots[0]!.at})`);
  shots.forEach((s, i) => {
    if (s.at >= dur) err("shot-after-end", `shot ${i} (${s.src}) starts at ${s.at}s ≥ duration ${dur}s`);
    if (i > 0) {
      const f0 = Math.round(shots[i - 1]!.at * fps);
      const f1 = Math.round(s.at * fps);
      if (f1 <= f0) err("shot-order", `shot ${i} (${s.src}) at ${s.at}s does not start after shot ${i - 1} once rounded to frames`);
      else if (f1 - f0 < Math.round(0.5 * fps)) warn("shot-too-short", `shot ${i - 1} lasts ${((f1 - f0) / fps).toFixed(2)}s (<0.5 s)`);
    }
    if (opts.assetExists && !opts.assetExists(s.src)) err("asset-missing", `missing image public/${s.src}`);
  });
  if (opts.assetExists && !opts.assetExists(p.vo)) err("asset-missing", `missing voiceover public/${p.vo}`);

  // --- captions / words
  if (!p.words.length) err("words-empty", "words.json is empty — captions would be blank");
  p.words.forEach((w, i) => {
    if (!(w.e >= w.s)) err("word-time", `word ${i} "${w.w}" ends before it starts`);
    if (i > 0 && w.s < p.words[i - 1]!.s) err("word-order", `word ${i} "${w.w}" starts before the previous word`);
  });
  const lastEnd = p.words.length ? p.words[p.words.length - 1]!.e : 0;
  if (lastEnd > dur) err("speech-cut", `speech ends at ${lastEnd}s but the video ends at ${dur}s`);
  else if (lastEnd > dur - BRIDGE_FRAMES / fps) warn("speech-in-bridge", `last word ends inside the ${BRIDGE_FRAMES}-frame loop dissolve`);
  if (opts.audioSec !== undefined) {
    // speech past the end is caught above (speech-cut); a longer WAV with speech inside is only trailing silence being trimmed
    if (opts.audioSec > dur + 0.25) warn("audio-tail-trimmed", `voiceover file is ${opts.audioSec.toFixed(2)}s, video ends at ${dur}s (trailing silence trimmed)`);
    if (dur - opts.audioSec > 1.5) warn("dead-air", `${(dur - opts.audioSec).toFixed(2)}s of silence after the voiceover`);
  }
  if (Math.abs(frames / fps - dur) > 0.5 / fps) warn("frame-rounding", `durationSec ${dur} is not frame-aligned at ${fps} fps`);
  for (const chunk of captionChunks(p.words, p.display)) {
    const longest = Math.max(...chunk.split(" ").map((x) => x.length));
    if (longest * CAPTION_CHAR_PX > CAPTION_WIDTH) warn("caption-word-wide", `caption word in "${chunk}" may overflow the safe width`);
    if (chunk.length > 30) warn("caption-long", `caption chunk "${chunk}" wraps to 3+ lines`);
  }
  if (p.display) {
    const tokens = new Set(p.words.map((w) => w.w));
    for (const k of Object.keys(p.display)) if (!tokens.has(k)) warn("display-unused", `display override "${k}" matches no spoken token`);
  }

  // --- cards / overlays
  const cards = effectiveCards(p);
  cards.forEach((c, i) => {
    if (!(c.until > c.at)) err("card-time", `card ${i} has until ≤ at`);
    if (c.until > dur) err("card-after-end", `card ${i} ends at ${c.until}s after the video (${dur}s)`);
  });
  const sorted = [...cards].sort((a, b) => a.at - b.at);
  for (let i = 1; i < sorted.length; i++)
    if (sorted[i]!.at < sorted[i - 1]!.until) warn("card-overlap", `cards at ${sorted[i - 1]!.at}s and ${sorted[i]!.at}s overlap`);
  const texts = cards.map(cardText).filter(Boolean);
  const dup = texts.filter((x, i) => texts.indexOf(x) !== i);
  if (dup.length) warn("card-repeat", `repeated overlay text: ${[...new Set(dup)].join(", ")}`);
  if (p.question) for (const [, b] of p.question.windows) if (b > dur + 1e-6) warn("question-after-end", `question window ends at ${b}s after the video`);

  if (!isV2(p)) return issues;

  // --- V2 contract
  const v2 = p.v2;
  if (!v2) {
    err("v2-config", 'templateVersion "v2" needs a `v2` config (hook + payoff)');
    return issues;
  }
  const until = hookUntil(p);
  const lines = v2.hook.lines;
  if (!lines.length || lines.length > 2) err("hook-lines", `hook needs 1–2 lines (got ${lines.length})`);
  const hookWords = lines.join(" ").split(/\s+/).filter(Boolean).length;
  if (hookWords > 10) err("hook-length", `hook is ${hookWords} words — keep it ≤10 so it reads in 2 s`);
  else if (hookWords > 7) warn("hook-length", `hook is ${hookWords} words — ≤7 reads faster`);
  lines.forEach((l) => l.length > 28 && warn("hook-line-wide", `hook line "${l}" is ${l.length} chars; may wrap`));
  if (until > 3) err("hook-persist", `hook stays until ${until}s — V2 hooks must clear by 3 s`);
  if (until < 1) warn("hook-short", `hook phase is only ${until}s`);
  if (v2.hook.emphasis && !lines.join(" ").includes(v2.hook.emphasis)) err("hook-emphasis", `emphasis "${v2.hook.emphasis}" is not in the hook text`);
  const top = v2.hook.top ?? HOOK_DEFAULT_TOP;
  const wraps = lines.reduce((n, l) => n + Math.max(1, Math.ceil(l.length / 16)), 0);
  if (top + wraps * HOOK_LINE_PX > CAPTION_TOP - 40) err("hook-overlaps-captions", `hook block (top ${top}, ~${wraps} lines) reaches the caption area at ${CAPTION_TOP}px`);
  const hookText = norm(lines.join(" "));
  for (const t of texts) if (norm(t) && hookText.includes(norm(t)) && norm(t).length > 6) warn("hook-repeated", `card "${t}" repeats the hook headline`);
  // the headline should add to what is being spoken under it, not caption it twice
  const content = (s: string) => norm(s).split(" ").filter((w) => w.length > 3);
  const hookContent = content(lines.join(" "));
  const spoken = new Set(content(p.words.filter((w) => w.s < until).map((w) => w.w).join(" ")));
  const echoed = hookContent.filter((w) => spoken.has(w)).length;
  if (hookContent.length && echoed / hookContent.length >= 0.6)
    warn("hook-echoes-captions", `${echoed}/${hookContent.length} hook words are also spoken (and captioned) during the hook — make the headline add information`);
  if (p.cards.some((c) => c.at < until)) warn("card-in-hook", `cards starting before ${until}s are delayed to the end of the hook phase`);

  const pay = v2.payoff;
  if (!pay || !pay.text?.trim()) err("payoff-missing", "V2 needs payoff metadata (verified closing fact or explicit unresolved fact)");
  else {
    if (pay.at < until || pay.at >= dur) err("payoff-time", `payoff at ${pay.at}s must fall between the hook end and the video end`);
    if (pay.at < dur * 0.5) warn("payoff-early", `payoff at ${pay.at}s lands in the first half`);
    if (pay.kind !== "unresolved" && /\b(nobody knows|no one knows|unknown|unsolved)\b/i.test(pay.text))
      warn("payoff-kind", `payoff text sounds unresolved but kind is "${pay.kind}"`);
  }
  if (!shots.some((s) => s.role)) warn("roles-missing", "no narrative roles on shots — V2 transitions fall back to plain cuts");
  const roles = new Set(shots.map((s) => s.role).filter(Boolean));
  if (shots.some((s) => s.role) && !roles.has("reveal") && !roles.has("payoff")) warn("roles-no-reveal", "no reveal/payoff shot");
  const covered = cards.reduce((a, c) => a + (Math.min(c.until, dur) - c.at), 0) + (pay && pay.show !== false ? dur - pay.at : 0);
  if ((v2.overlayDensity ?? "reduced") === "reduced" && covered / dur > 0.45)
    warn("overlay-density", `overlays cover ${Math.round((100 * covered) / dur)}% of the runtime (reduced density target ≤45%)`);
  return issues;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9$%]+/g, " ").trim();
export const cardText = (c: Card) => (c.kind === "number" ? `${c.value} ${c.label}` : c.text);
