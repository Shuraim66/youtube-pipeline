import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/crater/words.json";

/**
 * Night File — Judge Joseph Crater. Oct 9 test: face on frame 0, SLOWER shots (~3–4 s), mid re-hook
 * ("But that's not the strangest part."), concrete details, complete-sentence loop ("…nobody knows why" →
 * "New York Supreme Court Justice Joseph Crater cashed over $5,000, then vanished."). Look "film" (Cyclops was vhs).
 * Facts (en.wikipedia, verified Oct 9 2026): vanished Aug 6 1930; that morning ~2 h destroying documents in his
 * chambers, $5,150 cashed; last seen leaving Billy Haas's Chophouse, 332 W 45th St; police not notified until
 * Sept 3; Jan 20 1931 wife Stella found envelopes with checks, stocks, bonds and a note in a dresser drawer police
 * had searched; declared dead 1939.
 * Images (PD): Crater c.1930; Court House NY (Bain, LOC); Tammany Hall (Irving Underhill, LOC); reused PD NYC
 * Fifth Ave 1905, Flatiron c.1903 / Stieglitz 1903, Social Register 1920.
 */
export const crater: ArchivalShortProps = {
  brand: "nightfile",
  look: "film",
  vo: "vo/crater/vo.wav",
  words,
  display: { $5: "$5,000", ",000": "", "45th": "45TH" },
  hook: ["A New York judge.", "Cashed $5,000. Vanished."],
  hookTop: 980,
  twistAt: 17.46,
  question: { windows: [[26.68, 28.7]], text: "Ran, or silenced?" },
  durationSec: 28.7,
  cards: [
    { kind: "stamp", at: 5.56, until: 7.3, text: "AUG 6, 1930" },
    { kind: "stamp", at: 8.28, until: 10.8, text: "2 HOURS" },
    { kind: "stamp", at: 13.6, until: 14.9, text: "GONE" },
    { kind: "stamp", at: 15.4, until: 17.3, text: "1 MONTH" },
    { kind: "quote", at: 23.62, until: 26.6, text: "“Checks. Stocks. A note.”", source: "— FOUND JAN 1931 · A DRAWER POLICE HAD SEARCHED" },
  ],
  shots: [
    { src: "evidence/crater/port.jpg", at: 0, move: "in", focus: "50% 0%", fit: "contain" },
    { src: "evidence/crater/court.jpg", at: 4.04, move: "up", focus: "50% 50%" },
    { src: "evidence/crater/port.jpg", at: 7.48, move: "in", focus: "50% 25%", zoom: 1.5 },
    { src: "evidence/arnold/fifth1905.jpg", at: 10.94, move: "left", focus: "50% 50%" },
    { src: "evidence/crater/tammany.jpg", at: 14.92, move: "in", focus: "50% 50%" },
    { src: "evidence/crater/port.jpg", at: 17.46, move: "in", focus: "50% 20%", zoom: 1.8 },
    { src: "evidence/arnold/flatiron.jpg", at: 19.44, move: "up", focus: "50% 40%" },
    { src: "evidence/arnold/register.jpg", at: 23.62, move: "in", focus: "50% 30%" },
    { src: "evidence/crater/port.jpg", at: 26.68, move: "in", focus: "50% 0%", fit: "contain" },
  ],
};
