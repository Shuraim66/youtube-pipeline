/** Run: npm test  (bundled with esbuild, executed with node:test) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ARCHIVAL_EPISODES } from "../src/archival/registry";
import type { ArchivalShortProps } from "../src/archival/ArchivalShort";
import {
  CAPTION_TOP, captionChunks, dominantLayer, effectiveCards, effectiveShots, hookUntil, isBeatChange, validateEpisode,
} from "../src/archival/v2";

const ROOT = join(__dirname, "..");
const FPS = 30;
const codes = (p: ArchivalShortProps, level?: "error" | "warning") =>
  validateEpisode(p, { fps: FPS }).filter((i) => !level || i.level === level).map((i) => i.code);
const base = ARCHIVAL_EPISODES.CaponeShortV2!.props;
const v1 = Object.entries(ARCHIVAL_EPISODES).filter(([, e]) => (e.props.templateVersion ?? "v1") === "v1");

test("registry matches every ArchivalShort composition in Root.tsx", () => {
  const root = readFileSync(join(ROOT, "src/Root.tsx"), "utf8");
  const ids = [...root.matchAll(/id="([A-Za-z0-9]+)" component=\{ArchivalShort\}/g)].map((m) => m[1]).sort();
  assert.deepEqual(Object.keys(ARCHIVAL_EPISODES).sort(), ids);
});

test("V1 is the default and V1 episodes pass through untouched", () => {
  assert.ok(v1.length >= 15);
  for (const [id, { props }] of v1) {
    assert.equal(props.v2, undefined, id);
    assert.equal(effectiveShots(props), props.shots, `${id} shots must be the same array`);
    assert.equal(effectiveCards(props), props.cards, `${id} cards must be the same array`);
    for (let t = 0; t < props.durationSec; t += 0.1) assert.ok(!["hook", "payoff"].includes(dominantLayer(props, t)), id);
  }
});

test("every registered episode is error-free (assets on disk, timing, captions)", () => {
  for (const [id, { props }] of Object.entries(ARCHIVAL_EPISODES)) {
    const errs = validateEpisode(props, { fps: FPS, assetExists: (s) => existsSync(join(ROOT, "public", s)) }).filter((i) => i.level === "error");
    assert.deepEqual(errs, [], id);
  }
});

test("frame boundaries: cuts strictly increase, speech and cards end inside the video", () => {
  for (const [id, { props }] of Object.entries(ARCHIVAL_EPISODES)) {
    const frames = effectiveShots(props).map((s) => Math.round(s.at * FPS));
    const total = Math.round(props.durationSec * FPS);
    frames.forEach((f, i) => i && assert.ok(f > frames[i - 1]!, `${id} cut ${i}`));
    assert.ok(frames.at(-1)! < total, `${id} last cut before end`);
    assert.ok(props.words.at(-1)!.e <= props.durationSec, `${id} speech inside video`);
    for (const c of effectiveCards(props)) assert.ok(Math.round(c.until * FPS) <= total, `${id} card ${c.at}`);
  }
});

test("V2 hook phase: hook visual owns [0, until), regular shots resume at until, no card inside the hook", () => {
  const shots = effectiveShots(base);
  const until = hookUntil(base);
  assert.equal(until, 2);
  assert.equal(shots[0]!.role, "hook");
  assert.equal(shots[0]!.src, base.v2!.hook.shot!.src);
  assert.equal(shots[1]!.at, until);
  assert.ok(effectiveCards(base).every((c) => c.at >= until));
  const early: ArchivalShortProps = { ...base, cards: [{ kind: "stamp", at: 0.5, until: 4, text: "X" }] };
  assert.deepEqual(effectiveCards(early).map((c) => c.at), [until]);
  assert.ok(codes(early, "warning").includes("card-in-hook"));
});

test("V2 transitions only flash on narrative role changes", () => {
  const s = [{ src: "a", at: 0, role: "setup" }, { src: "b", at: 2, role: "setup" }, { src: "c", at: 4, role: "reveal" }, { src: "d", at: 6 }] as ArchivalShortProps["shots"];
  assert.deepEqual([0, 1, 2, 3].map((i) => isBeatChange(s, i)), [false, false, true, false]);
});

test("one dominant overlay layer at a time; the headline never returns after the hook", () => {
  for (const id of ["CaponeShortV2", "NightfileFawcettV2"]) {
    const p = ARCHIVAL_EPISODES[id]!.props;
    const until = hookUntil(p);
    for (let f = 0; f < Math.round(p.durationSec * FPS); f++) {
      const t = f / FPS;
      const layer = dominantLayer(p, t);
      assert.equal(layer === "hook", t < until, `${id} frame ${f}: ${layer}`);
      if (t >= p.v2!.payoff.at) assert.equal(layer, "payoff");
    }
  }
  const withQ: ArchivalShortProps = { ...base, question: { windows: [[8, 9]], text: "Q" } };
  assert.equal(dominantLayer(withQ, 8.5), "card", "question yields to an active card");
});

test("V2 contract violations are hard errors", () => {
  const bad = (patch: Partial<NonNullable<ArchivalShortProps["v2"]>["hook"]>) =>
    codes({ ...base, v2: { ...base.v2!, hook: { ...base.v2!.hook, ...patch } } }, "error");
  assert.ok(bad({ until: 3.5 }).includes("hook-persist"));
  assert.ok(bad({ lines: ["one two three four five six", "seven eight nine ten eleven"] }).includes("hook-length"));
  assert.ok(bad({ emphasis: "1999" }).includes("hook-emphasis"));
  assert.ok(bad({ top: 1150 }).includes("hook-overlaps-captions"));
  assert.ok(codes({ ...base, v2: { ...base.v2!, payoff: { ...base.v2!.payoff, text: "" } } }, "error").includes("payoff-missing"));
  assert.ok(codes({ ...base, v2: undefined }, "error").includes("v2-config"));
  const lastShot = base.shots.at(-1)!;
  assert.ok(codes({ ...base, shots: [...base.shots, { ...lastShot, at: lastShot.at + 0.001 }] }, "error").includes("shot-order"));
  assert.ok(codes({ ...base, durationSec: 20 }, "error").includes("speech-cut"));
  assert.ok(codes({ ...base, words: [] }, "error").includes("words-empty"));
});

test("editorial warnings stay warnings", () => {
  const p: ArchivalShortProps = { ...base, v2: { ...base.v2!, payoff: { ...base.v2!.payoff, text: "Nobody knows what happened." } } };
  assert.ok(codes(p, "warning").includes("payoff-kind"));
  assert.ok(!codes(p, "error").includes("payoff-kind"));
  assert.ok(codes({ ...base, cards: [...base.cards, { kind: "stamp", at: 15, until: 16, text: "Jailed for taxes" }] }, "warning").includes("hook-repeated"));
  assert.ok(codes({ ...base, v2: { ...base.v2!, hook: { ...base.v2!.hook, lines: ["one two three four", "five six seven eight"] } } }, "warning").includes("hook-length"));
});

test("captions: chunking follows <Captions>, overrides applied, long words flagged; hook block stays above captions", () => {
  const words = [{ w: "$50", s: 0, e: 0.2 }, { w: ",000", s: 0.2, e: 0.4 }, { w: "bounty", s: 0.4, e: 0.6 }, { w: ".hi", s: 0.6, e: 0.8 }];
  assert.deepEqual(captionChunks(words, { $50: "$50,000", ",000": "" }), ["$50,000 bounty", "hi"]);
  const wide = codes({ ...base, words: [...base.words.slice(0, -1), { w: "INCOMPREHENSIBILITIES", s: 20, e: 20.5 }] }, "warning");
  assert.ok(wide.includes("caption-word-wide"));
  for (const id of ["CaponeShortV2", "NightfileFawcettV2"]) {
    const h = ARCHIVAL_EPISODES[id]!.props.v2!.hook;
    assert.ok((h.top ?? 900) + h.lines.length * 2 * 106 < CAPTION_TOP, id);
  }
});

test("hook that only repeats the words spoken under it is flagged; a complementary headline is not", () => {
  assert.ok(codes(base, "warning").includes("hook-echoes-captions"));
  const fresh = { ...base, v2: { ...base.v2!, hook: { ...base.v2!.hook, lines: ["Chicago's boss.", "Jailed by accountants."], emphasis: undefined } } };
  assert.ok(!codes(fresh).includes("hook-echoes-captions"));
});
