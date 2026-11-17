import type { GuessShortProps } from "./types";

/**
 * Aurelis — tulip mania, "Guess first" test (experiments/guess_test_2026-10.json). No voiceover.
 * Facts (en.wikipedia "Tulip mania"; Goldgar, Tulipmania 2007; see src/archival/tulip_v2.ts): Semper Augustus ƒ10,000; >10x a skilled
 * artisan's annual income; flames from a mosaic virus; Haarlem auction early Feb 1637 found no buyers; trade collapsed;
 * historians (Goldgar) say the ruin was smaller than the legend. Images and credits: tulip_v2.ts.
 */
const SEMPER = { src: "img/tulip/semper.jpg", credit: "SEMPER AUGUSTUS · 17TH-C. TULIP BOOK", focus: "50% 35%" };

export const tulipGuess: GuessShortProps = {
  brand: "aurelis",
  compact: true,
  question: ["HOLLAND, 1637. ONE RARE TULIP BULB.", "WHAT DID IT SELL FOR?"],
  evidence: SEMPER,
  options: [
    { key: "A", text: "10 GUILDERS" },
    { key: "B", text: "1,000 GUILDERS" },
    { key: "C", text: "10,000 GUILDERS" },
  ],
  correct: "C",
  revealImage: { src: "img/tulip/verijck.jpg", credit: "TULIP BOOK PLATE · 1637", focus: "50% 35%" },
  stamp: "ƒ10,000.",
  countdownLabel: "GUESS BEFORE 0",
  cards: [
    { text: "More than ten times a skilled worker's yearly pay.", hl: "More than ten times", img: { src: "img/tulip/brueghel.jpg", credit: "BRUEGHEL THE YOUNGER · SATIRE ON TULIP MANIA, c.1640", focus: "50% 50%" } },
    { text: "Its famous flames came from a virus.", hl: "a virus.", img: { src: "img/tulip/verijck.jpg", credit: "\"FLAMED\" PETALS · TULIP BOOK, 1637", focus: "50% 22%" } },
    { text: "February 1637: an auction in Haarlem found no buyers.", hl: "no buyers.", img: { src: "img/tulip/tooneel.png", credit: "PAMPHLET ON THE TULIP TRADE, 1637", focus: "50% 40%" } },
    { text: "Within days, the tulip trade collapsed.", hl: "collapsed.", img: { src: "img/tulip/pot.jpg", credit: "POT · FLORA'S WAGON OF FOOLS, c.1637", focus: "45% 50%" } },
  ],
  closing: { text: "Historians now say the ruin was smaller than the legend.", img: SEMPER, byReadingTime: true },
};
