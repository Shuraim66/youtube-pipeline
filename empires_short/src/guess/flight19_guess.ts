import type { GuessShortProps } from "./types";

/**
 * Night File — Flight 19, "Guess first" test (experiments/guess_test_2026-10.json). No voiceover.
 * Facts (en.wikipedia "Flight 19"): 5 Dec 1945, NAS Fort Lauderdale, five TBM Avengers, 14 airmen, all lost; Lt. Charles C. Taylor
 * radioed "Both of my compasses are out."; a PBM-5 Mariner with 13 crew went to search and was lost; the tanker SS Gaines Mills
 * reported flames; no wreck of the Avengers or the Mariner has been confirmed found; the Navy blamed Taylor, then amended the
 * finding to "cause unknown" after his mother objected. Nothing supernatural claimed.
 * (The 13-crew Mariner fact lives in the upload description; the on-screen card was cut at Gate 2.)
 * Images and licences: see src/archival/flight19_v2.ts (credits copied unchanged).
 */
const FORMATION = { src: "img/flight19/formation.jpg", credit: "AVENGERS, 1942 · SAME TYPE, NOT FLIGHT 19", focus: "45% 50%" };
const MARINER = { src: "img/flight19/mariner.jpg", credit: "PBM MARINER · SAME TYPE", focus: "50% 50%" };
const MAP = { src: "img/flight19/map.png", credit: "FLIGHT 19'S ROUTE · CC BY 2.5", fit: "contain" as const };
const TAYLOR = { src: "img/flight19/taylor.jpg", credit: "LT. CHARLES C. TAYLOR, FLIGHT LEADER", fit: "contain" as const };
const SEA = { src: "img/flight19/sea.jpg", credit: "OPEN SEA · MODERN, ILLUSTRATIVE", focus: "50% 50%" };

export const flight19Guess: GuessShortProps = {
  brand: "nightfile",
  question: ["5 NAVY BOMBERS VANISHED IN 1945.", "THE PLANE SENT TO FIND THEM…"],
  evidence: FORMATION,
  options: [
    { key: "A", text: "IT FOUND THE WRECKAGE" },
    { key: "B", text: "IT TURNED BACK" },
    { key: "C", text: "IT VANISHED TOO" },
  ],
  correct: "C",
  revealImage: MARINER,
  stamp: "IT VANISHED TOO.",
  countdownLabel: "GUESS BEFORE 0",
  cards: [
    { text: "Dec 5, 1945. Flight 19: five Avengers, 14 men.", hl: "14 men.", img: MAP },
    { text: "The leader radioed: ‘Both of my compasses are out.’", hl: "Both of my compasses are out.", img: TAYLOR },
    { text: "That night, a passing tanker saw flames on the sea.", hl: "flames on the sea", img: SEA },
    { text: "The Navy blamed the leader. Then changed its verdict to ‘cause unknown.’", hl: "‘cause unknown.’", img: TAYLOR },
  ],
  closing: { text: "No wreck has ever been confirmed.", img: FORMATION },
};
