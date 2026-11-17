import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/voynich/words.json";

/**
 * Night File — the Voynich Manuscript (Beinecke MS 408, Yale), carbon-dated 1404–1438, never deciphered.
 * V2-native (scripts_v2/voynich.json). V3 batch (V3_BATCH_BRIEF.md §3.2): arm S (short loop: "Still, no one can read a
 * word." → "This book is about…"), spoken hook first, evidence on frame 0. Look "film", VO am_michael atempo 1.05.
 * Captions: "fourteen hundreds" shows as the token "1400s.", "Two hundred and forty" as "240"; the extra tokens are "~"
 * placeholders blanked by `display` (so no real word like "and" is blanked anywhere else).
 * Facts (en.wikipedia "Voynich manuscript"): vellum carbon-dated 2009 to 1404–1438; ~240 pages; herbal, astronomical,
 * balneological sections; WWII codebreakers (Friedmans, Currier, Tiltman) failed; every proposed decipherment rejected.
 * Images (licences read via the en.wikipedia API), all scans of Beinecke MS 408 — courtesy of the Beinecke Rare Book &
 * Manuscript Library, cited in the description:
 *  p32.jpg  "Voynich Manuscript (32).jpg" PD — herbal page with text (hook)
 *  p119.jpg "Voynich Manuscript (119).jpg" PD — text-only page (script close-ups)
 *  p3.jpg   "Voynich Manuscript (3).jpg" PD — faded opening page
 *  p175.jpg "Voynich Manuscript (175).jpg" PD — herbal page
 *  p158.jpg "Voynich Manuscript (158).jpg" PD — fold-out rosettes page (SUBSTITUTE for the zodiac page: no zodiac scan
 *           was reachable; the rosettes are the cosmological fold-out)
 *  f78r.jpg "Voynich-partof f78r.jpg" PD — balneological detail (bathers)
 *  p167.jpg "Voynich Manuscript (167).jpg" PD — pharmaceutical page (jars)
 *  p135.jpg "Voynich Manuscript (135).jpg" PD — balneological page
 *  friedman.jpg "William-Friedman.jpg" PD (US government)
 */
export const voynichV2: ArchivalShortProps = {
  brand: "nightfile",
  look: "film",
  templateVersion: "v2",
  vo: "vo/voynich/vo.wav",
  words,
  display: { "~": "" },
  hook: ["CARBON-DATED 1404–1438.", "STILL UNREAD."],
  twistAt: 20.84,
  durationSec: 23.5,
  v2: {
    hook: {
      lines: ["CARBON-DATED 1404–1438.", "STILL UNREAD."], until: 2.8, emphasis: "1404–1438",
      shot: { src: "img/voynich/p32.jpg", at: 0, move: "in", focus: "50% 40%", role: "hook", credit: "VOYNICH MANUSCRIPT · BEINECKE MS 408, YALE" },
    },
    payoff: {
      at: 20.84, kind: "unresolved", style: "hero", kicker: "STATUS",
      text: "Never deciphered. Every proposed solution so far has been rejected by experts.", source: "BEINECKE LIBRARY, YALE · MS 408",
    },
  },
  cards: [
    { kind: "number", at: 5.5, until: 8.8, value: "1404–1438", label: "parchment carbon-dated, 2009" },
    { kind: "stamp", at: 19.58, until: 20.8, text: "NEVER DECIPHERED" },
  ],
  shots: [
    { src: "img/voynich/p119.jpg", at: 2.8, move: "left", focus: "45% 30%", zoom: 1.6, role: "setup", credit: "THE SCRIPT · NO ONE CAN READ IT" },
    { src: "img/voynich/p3.jpg", at: 4.78, move: "in", focus: "50% 45%", role: "evidence", credit: "VOYNICH MANUSCRIPT · BEINECKE MS 408" },
    { src: "img/voynich/p175.jpg", at: 7.07, move: "up", focus: "50% 55%", role: "evidence", credit: "HERBAL SECTION · UNKNOWN PLANTS" },
    { src: "img/voynich/p158.jpg", at: 11.1, move: "in", focus: "50% 50%", role: "evidence", credit: "COSMOLOGICAL FOLD-OUT" },
    { src: "img/voynich/f78r.jpg", at: 11.96, move: "left", focus: "50% 55%", role: "evidence", credit: "BALNEOLOGICAL SECTION · f78r" },
    { src: "img/voynich/friedman.jpg", at: 13.14, move: "in", focus: "50% 30%", role: "conflict", credit: "WILLIAM F. FRIEDMAN · US ARMY CODEBREAKER" },
    { src: "img/voynich/p167.jpg", at: 17.68, move: "up", focus: "50% 45%", role: "conflict", credit: "PHARMACEUTICAL SECTION" },
    { src: "img/voynich/p135.jpg", at: 19.58, move: "in", focus: "50% 40%", role: "reveal", credit: "VOYNICH MANUSCRIPT · BEINECKE MS 408" },
    { src: "img/voynich/p119.jpg", at: 20.84, move: "left", focus: "55% 60%", zoom: 1.6, role: "payoff", credit: "THE SCRIPT · STILL UNREAD" },
  ],
};
