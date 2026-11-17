import type { GuessShortProps } from "./types";

/**
 * Night File — Lady Be Good, "Guess first" test (experiments/guess_test_2026-10.json). No voiceover.
 * Facts (en.wikipedia "Lady Be Good (aircraft)" incl. Barker; PBS Wisconsin; migflug.com; see src/archival/ladybegood_v2.ts):
 * lost 4 Apr 1943 returning from Naples, crew's first mission; presumed down in the Mediterranean; a BP survey flight sighted it
 * almost intact ~440 mi inland in 1958; crew flew past their base in the dark and kept going south; bailed out not knowing they
 * were over land; co-pilot Toner's diary: eight days walking north, one canteen. Images (USAF/US gov PD) and credits:
 * ladybegood_v2.ts. No remains imagery, no crew portrait.
 */
const SITE = { src: "img/ladybegood/f014.jpg", credit: "THE CRASH SITE · USAF PHOTO", fit: "contain" as const, box: { top: 730, height: 600 } };

export const ladybegoodGuess: GuessShortProps = {
  brand: "nightfile",
  compact: true,
  question: ["A US BOMBER VANISHED IN 1943, PRESUMED LOST AT SEA.", "WHERE WAS IT FOUND?"],
  evidence: SITE,
  options: [
    { key: "A", text: "THE MEDITERRANEAN" },
    { key: "B", text: "THE SAHARA" },
    { key: "C", text: "AN ITALIAN BEACH" },
  ],
  correct: "B",
  revealImage: { src: "img/ladybegood/tail.jpg", credit: "LADY BE GOOD · USAF PHOTO, 1960", focus: "50% 50%" },
  stamp: "IN THE SAHARA.",
  countdownLabel: "GUESS BEFORE 0",
  cards: [
    { text: "April 1943: Lady Be Good flew its crew's first mission, a raid on Naples.", hl: "a raid on Naples.", img: { src: "img/ladybegood/naples.jpg", credit: "RAID ON NAPLES · 1943", focus: "50% 50%" } },
    { text: "In the dark, they flew past their base and kept going south.", hl: "kept going south.", img: { src: "img/ladybegood/lowalt.jpg", credit: "B-24s · SAME TYPE, NOT THIS PLANE", focus: "75% 55%" } },
    { text: "1958: an oil survey flight spotted it almost intact, 440 miles inland.", hl: "440 miles inland.", img: { src: "img/ladybegood/wreck.jpg", credit: "THE WRECK FROM THE AIR · 1958", focus: "15% 45%" } },
  ],
  closing: { text: "None of them knew they were over land.", img: SITE, byReadingTime: true },
};
