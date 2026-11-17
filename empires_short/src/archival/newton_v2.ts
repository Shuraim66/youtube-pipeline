import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/newton/words.json";

/**
 * Aurelis — Isaac Newton and the South Sea Bubble (1720): sold for ~£20,000 profit, bought back near the peak, lost
 * the profit and about a third of his wealth. V2-native (scripts_v2/newton.json). V3 batch (V3_BATCH_BRIEF.md §3.6):
 * arm L, spoken hook first, evidence (Hogarth) on frame 0 — not Newton's face. Look "film", VO bf_emma atempo 0.92 (Gate 2: slowed + 6 words to reach the L range).
 * Facts (Odlyzko, Notes and Records 2019 / Physics Today; en.wikipedia "South Sea Company"): sold Apr 1720 (~£20,000
 * profit); reinvested June near the peak, kept buying as it fell; ~£30,000 → ~£20,000 by mid-1721; shares £128 (Jan) →
 * ~£1,000 (Aug) → ~£100 (Dec 1720). "Madness of people" = secondhand anecdote (Spence via Lord Radnor), labelled so.
 * Images (licences read via the en.wikipedia API):
 *  hogarth.png       "William Hogarth - The South Sea Scheme.png" PD (1721)
 *  southseahouse.png "SouthSeaHouse Stowe'sSurveyOfLondon 1754.PNG" PD (engraving, 1754)
 *  kneller.jpg       "Portrait of Sir Isaac Newton, 1689 (brightened).jpg" PD (Kneller)
 *  ward.jpg          "Edward Matthew Ward (1816-1879) - The South Sea Bubble, a Scene in 'Change Alley in 1720 - N00432
 *                     - National Gallery.jpg" PD — painted 1847, labelled
 *  kneller1702.jpg   "Sir Isaac Newton by Sir Godfrey Kneller, Bt.jpg" PD (Kneller, 1702)
 *  cards.png         "South Sea Bubble Cards-Tree.png" PD — satirical bubble playing card
 * SUBSTITUTE: no 1720 stock receipt and no older (1720s) portrait were reachable (the Vanderbank download failed);
 * Kneller 1702 + the bubble card stand in.
 */
export const newtonV2: ArchivalShortProps = {
  look: "film",
  templateVersion: "v2",
  vo: "vo/newton/vo.wav",
  words,
  display: {},
  hook: ["SOLD HIGH.", "BOUGHT BACK HIGHER."],
  twistAt: 27.32,
  durationSec: 34.1,
  v2: {
    hook: {
      lines: ["SOLD HIGH.", "BOUGHT BACK HIGHER."], until: 2.8, emphasis: "HIGHER.",
      shot: { src: "img/newton/hogarth.png", at: 0, move: "in", focus: "50% 45%", role: "hook", credit: "HOGARTH · THE SOUTH SEA SCHEME, 1721" },
    },
    payoff: {
      at: 27.32, kind: "explanation", style: "hero", kicker: "THE LINE HE'S REMEMBERED FOR",
      text: "\"I can calculate the motions of the heavenly bodies, but not the madness of people.\" (reported secondhand)",
      source: "JOSEPH SPENCE, ANECDOTES · VIA LORD RADNOR",
    },
  },
  cards: [
    { kind: "number", at: 11.1, until: 13.2, value: "£20,000", label: "profit, April 1720" },
    { kind: "number", at: 21.86, until: 24.2, value: "~£1,000 → ~£100", label: "share price, Aug → Dec 1720" },
  ],
  shots: [
    { src: "img/newton/hogarth.png", at: 2.8, move: "left", focus: "50% 40%", zoom: 1.8, role: "setup", credit: "HOGARTH · THE SOUTH SEA SCHEME (DETAIL)" },
    { src: "img/newton/southseahouse.png", at: 5.64, move: "left", focus: "50% 50%", role: "setup", credit: "SOUTH SEA HOUSE · ENGRAVING, 1754" },
    { src: "img/newton/kneller.jpg", at: 9.32, move: "in", focus: "50% 35%", role: "setup", credit: "ISAAC NEWTON · KNELLER, 1689" },
    { src: "img/newton/ward.jpg", at: 13.28, move: "left", focus: "50% 50%", role: "conflict", credit: "'CHANGE ALLEY, 1720 · PAINTED 1847" },
    { src: "img/newton/kneller1702.jpg", at: 16.64, move: "in", focus: "50% 30%", role: "conflict", credit: "ISAAC NEWTON · KNELLER, 1702" },
    { src: "img/newton/cards.png", at: 20.62, move: "up", focus: "50% 35%", role: "reveal", credit: "SOUTH SEA BUBBLE PLAYING CARD · SATIRE" },
    { src: "img/newton/kneller1702.jpg", at: 23.64, move: "in", focus: "50% 25%", zoom: 1.4, role: "reveal", credit: "ISAAC NEWTON" },
    { src: "img/newton/hogarth.png", at: 27.32, move: "in", focus: "50% 45%", role: "payoff", credit: "HOGARTH · THE SOUTH SEA SCHEME, 1721" },
  ],
};
