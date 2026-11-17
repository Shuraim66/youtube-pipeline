import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/fawcett/words.json";

/**
 * Night File — Percy Fawcett. Oct 11 test: paradox line 1 ("one order: nobody should come looking. Then he vanished."),
 * famous case + little-known detail (the campfires stopped), ≤30 s, hard bridge beat, spoken closing question.
 * Look "film" (Earhart was vhs).
 * Facts (en.wikipedia "Percy Fawcett", Oct 11 2026): left instructions that no rescue be sent; departed Cuiabá 20 Apr 1925 with
 * son Jack and Raleigh Rimmel searching for "Z"; last letter 29 May 1925, about to enter unexplored territory; Kalapalo oral
 * account: the three went east and after five days no longer made campfires; bones provided by chief Comatzi were not Fawcett's.
 * Images: Fawcett portrait (PD), Manuscript 512 + its inscriptions (PD), Kalapalo canoeing (CC BY 2.5).
 */
export const fawcett: ArchivalShortProps = {
  brand: "nightfile",
  look: "film",
  vo: "vo/fawcett/vo.wav",
  words,
  display: {},
  hook: ["“Don't come looking for me.”", "Then he vanished."],
  hookTop: 980,
  twistAt: 16.64,
  question: { windows: [[25.72, 28.6]], text: "The jungle, or someone in it?" },
  durationSec: 28.6,
  cards: [
    { kind: "stamp", at: 4.36, until: 6.6, text: "1925" },
    { kind: "stamp", at: 9.44, until: 10.4, text: "“Z”" },
    { kind: "stamp", at: 14.0, until: 14.7, text: "SILENCE" },
    { kind: "stamp", at: 20.06, until: 22.4, text: "5 DAYS" },
    { kind: "stamp", at: 24.34, until: 25.6, text: "NOT HIS" },
  ],
  shots: [
    { src: "evidence/fawcett/face.jpg", at: 0, move: "in", focus: "50% 30%" },
    { src: "evidence/fawcett/kalapalo.jpg", at: 3.32, move: "left", focus: "50% 50%" },
    { src: "evidence/fawcett/face.jpg", at: 6.76, move: "in", focus: "50% 45%", zoom: 1.15 },
    { src: "evidence/fawcett/ms1.jpg", at: 8.8, move: "up", focus: "50% 30%" },
    { src: "evidence/fawcett/glyphs.png", at: 10.48, move: "in", focus: "50% 50%" },
    { src: "evidence/fawcett/ms1.jpg", at: 14.0, move: "in", focus: "50% 40%", zoom: 1.6 },
    { src: "evidence/fawcett/kalapalo.jpg", at: 16.64, move: "in", focus: "60% 50%", zoom: 1.5 },
    { src: "evidence/fawcett/glyphs.png", at: 20.06, move: "in", focus: "50% 50%", zoom: 1.6 },
    { src: "evidence/fawcett/ms1.jpg", at: 22.58, move: "in", focus: "50% 60%", zoom: 1.5 },
    { src: "evidence/fawcett/face.jpg", at: 25.72, move: "in", focus: "50% 30%" },
  ],
};
