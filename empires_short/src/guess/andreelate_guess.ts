import type { GuessShortProps } from "./types";

/**
 * Night File — Andrée balloon expedition, "Guess first, late reveal" (reveal: "end"; experiments/guess_test_2026-10.json, arm late_reveal). No voiceover.
 * Facts (from the published description of the Andrée Short + src/archival/andree_v2.ts): lift-off 11 Jul 1897 from Svalbard in a hydrogen
 * balloon, aiming for the North Pole; 1930 sealers (Bratvaag) landed on Kvitøya and found their last camp, with diaries and exposed film;
 * John Hertzberg saved 93 frames; they showed the balloon down on the ice less than three days after take-off.
 * Clue cards show NO film frames; the recovered-film images appear only at the reveal and closing.
 * Images (all public domain via Wikimedia Commons, same files as andree_v2.ts): station.jpg balloon house, Danes Island; north.png balloon after
 * lift-off 11 Jul 1897; andree.jpg S. A. Andrée portrait (Nordiska Museet); hut.jpg Strindberg's sketch of their hut; sled.jpg + crashed.jpg frames from the recovered film.
 */
const STATION = { src: "img/andree/station.jpg", credit: "BALLOON HOUSE, SVALBARD · 1897", focus: "40% 55%" };
const LIFTOFF = { src: "img/andree/north.png", credit: "THE BALLOON AFTER LIFT-OFF · 11 JULY 1897", focus: "50% 40%" };
const LEADER = { src: "img/andree/andree.jpg", credit: "S. A. ANDRÉE · EXPEDITION LEADER", focus: "55% 30%" };
const HUT = { src: "img/andree/hut.jpg", credit: "STRINDBERG'S SKETCH OF THEIR HUT · 1897", focus: "50% 40%" };
const SLED = { src: "img/andree/sled.jpg", credit: "RECOVERED FILM · ON THE ICE, 1897", focus: "45% 50%" };
const CRASHED = { src: "img/andree/crashed.jpg", credit: "RECOVERED FILM · 14 JULY 1897", focus: "65% 50%" };

export const andreeLateGuess: GuessShortProps = {
  brand: "nightfile",
  reveal: "end",
  question: ["3 EXPLORERS VANISHED BY BALLOON IN 1897.", "WHAT WAS FOUND 33 YEARS LATER?"],
  evidence: STATION,
  options: [
    { key: "A", text: "THE BALLOON, INTACT" },
    { key: "B", text: "UNDEVELOPED FILM" },
    { key: "C", text: "A MESSAGE IN A BOTTLE" },
  ],
  correct: "B",
  revealImage: SLED,
  stamp: "UNDEVELOPED FILM.",
  countdownLabel: "",
  cards: [
    { text: "July 1897: three Swedish explorers took off from Svalbard in a hydrogen balloon, aiming for the North Pole.", hl: "hydrogen balloon", img: LIFTOFF },
    { text: "They were never seen again.", hl: "never seen again.", img: LEADER },
    { text: "1930: sealers landed on remote Kvitøya and found their last camp, with their diaries.", hl: "their last camp", img: HUT },
  ],
  closing: { text: "93 frames were saved. They showed the balloon down on the ice, less than three days after takeoff.", img: CRASHED, byReadingTime: true },
};
