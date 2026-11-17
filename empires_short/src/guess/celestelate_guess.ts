import type { GuessImage, GuessShortProps } from "./types";

/**
 * Night File — Mary Celeste, "Guess first, late reveal" (reveal: "end"; experiments/guess_test_2026-10.json, arm late_reveal). No voiceover.
 * Facts (published description + src/nightfile/celeste.ts, Wikipedia): found adrift off the Azores 4 Dec 1872 by the Dei Gratia; ten aboard incl. Capt. Briggs,
 * wife Sarah and daughter Sophia (2); plenty of food and water, belongings untouched; lifeboat missing, most papers and the captain's navigation instruments missing.
 * NOT used (myth): the "untouched dinner / galley fire". The 1873 newspaper (murder/piracy headline) is NOT used at all: it would contradict the closing line.
 * Images: ship.jpg "Mary Celeste (as Amazon)", painting 1861 (public domain; three different crops of one image).
 */
const SHIP = { src: "evidence/celeste/ship.jpg", credit: "THE SHIP · PAINTED 1861 (AS AMAZON)", focus: "40% 50%" };
/** clue 1: animated map (MapBeat) zooming from the North Atlantic to the Azores; pin is the island group only (no position claim) */
const AZORES: GuessImage = {
  src: "evidence/celeste/ship.jpg",
  credit: "THE AZORES · MAP DATA: NATURAL EARTH (PUBLIC DOMAIN)",
  map: { from: [[-78, 26], [-4, 52]], to: [[-32.5, 35.6], [-23.5, 41]], zoomFrames: 100, pins: [{ lon: -27.5, lat: 38.6, label: "AZORES", tone: "amber" as const, anchor: "left" as const, atFrame: 45 }] },
};
/** clue 2: typed "ABOARD: 10" card over the darkened, blurred painting (no portraits, no lap desk) */
const ABOARD: GuessImage = {
  src: "evidence/celeste/ship.jpg",
  credit: "THE SHIP · PAINTED 1861 (AS AMAZON)",
  focus: "40% 50%",
  typed: { label: "ABOARD", big: "10", lines: ["Captain Benjamin Briggs", "His wife, Sarah", "Their daughter, Sophia, 2"], foot: "+ 7 crew" },
};
/** clue 3: upper sails and foremast only (zoom 1.5 about 52% 22%): no hull, deck or boat in frame, and a framing not used earlier */
const SAILS: GuessImage = { src: "evidence/celeste/ship.jpg", credit: "THE SHIP · PAINTED 1861 (AS AMAZON)", focus: "52% 22%", zoom: 1.5 };
const SHIP_R = { src: "evidence/celeste/ship.jpg", credit: "THE SHIP · PAINTED 1861 (AS AMAZON)", focus: "85% 50%" };

export const celesteLateGuess: GuessShortProps = {
  brand: "nightfile",
  reveal: "end",
  question: ["1872: A SHIP WAS FOUND SAILING WITH NO ONE ABOARD.", "WHAT WAS MISSING?"],
  evidence: SHIP,
  options: [
    { key: "A", text: "THE FOOD AND WATER" },
    { key: "B", text: "THE CARGO" },
    { key: "C", text: "THE LIFEBOAT" },
  ],
  correct: "C",
  revealImage: SHIP_R,
  stamp: "THE LIFEBOAT.",
  countdownLabel: "",
  cards: [
    { text: "December 4, 1872: the Dei Gratia found the Mary Celeste drifting off the Azores.", hl: "Mary Celeste", img: AZORES },
    { text: "Ten people had left New York aboard, including the captain's wife and two-year-old daughter.", hl: "Ten people", img: ABOARD },
    { text: "There was plenty of food and water. Their belongings were untouched.", hl: "untouched.", img: SAILS },
  ],
  closing: { text: "Most of the ship's papers and the captain's navigation instruments were gone too.", img: SHIP, byReadingTime: true },
};
