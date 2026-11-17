import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/tulip/words.json";

/**
 * Aurelis — tulip mania: the Semper Augustus at ƒ10,000, then a Haarlem auction with no buyers (Feb 1637).
 * V2-native (scripts_v2/tulip.json). V3 batch (V3_BATCH_BRIEF.md §3.5): arm S, non-loop (Gate 2: fallback ending
 * "But for one winter, it was real."; NO BUYERS stamp dropped). Look "film", VO bf_emma atempo 1.0.
 * Captions: "ten thousand guilders." shows as "ƒ10,000"; the two extra tokens are "~" placeholders blanked by `display`.
 * Facts (en.wikipedia "Tulip mania"): peak winter 1636–37, collapse early Feb 1637; Haarlem auction ~3 Feb found no
 * buyers; Semper Augustus ƒ10,000; >10× a skilled artisan's annual income; flames from a mosaic virus; Goldgar/Garber
 * revisionism. Avoided: "bulb = a house", the sailor-eats-the-bulb story.
 * Images (licences read via the en.wikipedia API):
 *  semper.jpg   "Semper Augustus - Six Collection (no book).jpg" PD (17th-c. tulip book)
 *  verijck.jpg  "Admiral Verijck (van der Eijck).jpg" PD (P. Cos tulip book, 1637)
 *  brueghel.jpg "Jan Brueghel the Younger, Satire on Tulip Mania, c. 1640.jpg" PD
 *  tooneel.png  "Tooneel van Flora Handel der Floristen in Amsterdam 1637 (Tulip mania).png" PD — 1637 pamphlet;
 *               SUBSTITUTE for the Haarlem cityscape (none reachable)
 *  pot.jpg      "Flora's Wagon of Fools (Flora's Mallewagen) tulipomania, Hendrik Gerritsz Pot c1637.jpg" PD
 */
export const tulipV2: ArchivalShortProps = {
  look: "film",
  templateVersion: "v2",
  vo: "vo/tulip/vo.wav",
  words,
  display: { "~": "" },
  hook: ["HOLLAND · FEB\u00a01637", "THEN: NO\u00a0BUYERS."],
  twistAt: 16.78,
  durationSec: 22.1,
  v2: {
    hook: {
      lines: ["HOLLAND · FEB\u00a01637", "THEN: NO\u00a0BUYERS."], until: 2.8, emphasis: "NO\u00a0BUYERS.", top: 700,
      shot: { src: "img/tulip/semper.jpg", at: 0, move: "in", focus: "50% 35%", role: "hook", credit: "SEMPER AUGUSTUS · 17TH-C. TULIP BOOK" },
    },
    payoff: {
      at: 16.78, kind: "explanation", style: "card",
      text: "Historians like Anne Goldgar argue the crash hit a small group. Mass ruin is mostly legend.", source: "A. GOLDGAR, TULIPMANIA (2007)",
    },
  },
  cards: [
    { kind: "number", at: 7.84, until: 9.1, value: "ƒ10,000", label: "one Semper Augustus bulb" },
  ],
  shots: [
    { src: "img/tulip/verijck.jpg", at: 2.8, move: "up", focus: "50% 35%", role: "setup", credit: "TULIP BOOK PLATE · 1637" },
    { src: "img/tulip/brueghel.jpg", at: 4.04, move: "left", focus: "50% 50%", role: "setup", credit: "BRUEGHEL THE YOUNGER · SATIRE ON TULIP MANIA, c.1640" },
    { src: "img/tulip/semper.jpg", at: 6.6, move: "in", focus: "50% 30%", zoom: 1.3, role: "evidence", credit: "SEMPER AUGUSTUS" },
    { src: "img/tulip/verijck.jpg", at: 9.2, move: "in", focus: "50% 22%", zoom: 1.9, role: "evidence", credit: "\"FLAMED\" PETALS · TULIP BOOK, 1637" },
    { src: "img/tulip/tooneel.png", at: 11.46, move: "up", focus: "50% 40%", role: "conflict", credit: "PAMPHLET ON THE TULIP TRADE, 1637" },
    { src: "img/tulip/pot.jpg", at: 14.7, move: "left", focus: "45% 50%", role: "reveal", credit: "POT · FLORA'S WAGON OF FOOLS, c.1637" },
    { src: "img/tulip/brueghel.jpg", at: 16.78, move: "in", focus: "60% 55%", zoom: 1.8, role: "payoff", credit: "BRUEGHEL THE YOUNGER · DETAIL" },
    { src: "img/tulip/semper.jpg", at: 19.78, move: "in", focus: "50% 35%", role: "payoff", credit: "SEMPER AUGUSTUS · 17TH-C. TULIP BOOK" },
  ],
};
