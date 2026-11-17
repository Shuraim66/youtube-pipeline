import type { GuessShortProps } from "./types";

/**
 * Night File — Titanic's Collapsible A, "Guess first" test (experiments/guess_test_2026-10.json). No voiceover.
 * Facts (en.wikipedia "Lifeboats of the Titanic"; Encyclopedia Titanica "RMS Oceanic finds Collapsible Lifeboat A adrift"; see
 * src/archival/collapsiblea_v2.ts): floated off as Titanic sank; ~30 clung to it, swamped; Lowe (Lifeboat 14) took survivors off,
 * leaving 3 dead; found 13 May 1912 almost 190 miles away by RMS Oceanic; Thomson Beattie (1st class) among the dead; buried at sea.
 * Images and licences: collapsiblea_v2.ts (credits unchanged). No body imagery.
 */
const BOAT_A = { src: "img/collapsiblea/boatA.jpg", credit: "COLLAPSIBLE A · RECOVERED BY OCEANIC, MAY 1912", fit: "contain" as const, box: { top: 700, height: 700 } };

export const collapsibleaGuess: GuessShortProps = {
  brand: "nightfile",
  compact: true,
  question: ["A TITANIC LIFEBOAT DRIFTED AWAY WITH 3 DEAD ABOARD.", "WHEN WAS IT FOUND?"],
  evidence: BOAT_A,
  options: [
    { key: "A", text: "ALMOST A MONTH LATER" },
    { key: "B", text: "1 WEEK LATER" },
    { key: "C", text: "2 DAYS LATER" },
  ],
  correct: "A",
  revealImage: { src: "img/collapsiblea/oceanic.jpg", credit: "RMS OCEANIC", focus: "50% 50%" },
  stamp: "ALMOST A MONTH LATER.",
  countdownLabel: "GUESS BEFORE 0",
  cards: [
    { text: "It floated off the Titanic's deck as she sank. About 30 people clung to it.", hl: "About 30 people", img: { src: "img/collapsiblea/lifeboatD.jpg", credit: "COLLAPSIBLE D, APRIL 1912 · SAME TYPE AS A", focus: "45% 60%" } },
    { text: "Officer Harold Lowe came back for the survivors. Three dead were left aboard.", hl: "Three dead", img: { src: "img/collapsiblea/lowe.jpg", credit: "FIFTH OFFICER HAROLD LOWE", focus: "50% 25%" } },
    { text: "May 13, 1912: the liner Oceanic found it almost 190 miles away.", hl: "almost 190 miles away.", img: { src: "img/collapsiblea/boatA.jpg", credit: "COLLAPSIBLE A · MAY 1912", fit: "contain" } },
  ],
  closing: { text: "All three were buried at sea.", img: BOAT_A },
};
