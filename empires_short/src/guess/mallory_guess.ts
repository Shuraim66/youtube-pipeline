import type { GuessShortProps } from "./types";

/**
 * Night File — George Mallory, "Guess first" test (experiments/guess_test_2026-10.json). No voiceover.
 * Facts (en.wikipedia "George Mallory", "1924 British Mount Everest expedition", "Mallory and Irvine Research Expedition";
 * Smithsonian Magazine; NPR 2024-10-12; see src/archival/mallory_v2.ts): set out 8 Jun 1924; Odell saw them high on the ridge,
 * still climbing, before cloud closed in; body found 1 May 1999 on the north face; daughter Clare: photo of Ruth to leave on the
 * summit, not on the body. Whether they reached the top is UNRESOLVED. Images and licences: mallory_v2.ts. No body imagery.
 */
const NORTH_FACE = { src: "img/mallory/northface.jpg", credit: "EVEREST NORTH FACE · MODERN, CC BY-SA", focus: "50% 30%" };

export const malloryGuess: GuessShortProps = {
  brand: "nightfile",
  compact: true,
  question: ["MALLORY CARRIED SOMETHING TO LEAVE ON EVEREST'S SUMMIT.", "WHAT WAS IT?"],
  evidence: NORTH_FACE,
  options: [
    { key: "A", text: "A BRITISH FLAG" },
    { key: "B", text: "A LETTER TO THE KING" },
    { key: "C", text: "A PHOTO OF HIS WIFE" },
  ],
  correct: "C",
  revealImage: { src: "img/mallory/ruth.jpg", credit: "RUTH MALLORY", focus: "50% 35%" },
  stamp: "A PHOTO OF HIS WIFE.",
  countdownLabel: "GUESS BEFORE 0",
  cards: [
    { text: "June 1924: Mallory and Sandy Irvine were last seen high on the ridge, still climbing.", hl: "still climbing.", img: { src: "img/mallory/steps.jpg", credit: "THE NORTHEAST RIDGE · MODERN, CC BY", fit: "contain" } },
    { text: "1999: climbers found Mallory's body on the North Face.", hl: "1999", img: { src: "img/mallory/rongbuk.jpg", credit: "RONGBUK VALLEY, BELOW THE NORTH FACE · MODERN, CC BY-SA", focus: "50% 40%" } },
    { text: "His daughter said he carried a photo of his wife, Ruth. It wasn't on him.", hl: "It wasn't on him.", img: { src: "img/mallory/ruth.jpg", credit: "RUTH MALLORY", focus: "50% 30%" } },
  ],
  closing: { text: "Did they reach the top? No one knows.", img: NORTH_FACE, byReadingTime: true },
};
