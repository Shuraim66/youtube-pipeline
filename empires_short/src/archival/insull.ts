import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/insull/words.json";

/**
 * Aurelis — Samuel Insull (Durant formula: question opener, face on frame 0, twist at ~9.4 s, ~28 s, binary close).
 * Look "ticker" (Durant was "film"). Facts (en.wikipedia, verified Oct 6 2026): b. 1859 London; Edison's secretary;
 * Commonwealth Edison president 1907; controlled ~$500M in assets; collapse after 1929 — ~600,000 shareholders
 * lost their savings; fled to France then Greece; arrested in Turkey and extradited 1934; acquitted; died July 16
 * 1938 in a Paris Métro station with 30 francs in his pocket; debts ~$14M.
 * Images (Wikimedia): PD — Insull portraits (Koehne Studio; 1910 Commonwealth Edison), TIME cover Nov 1926
 * (not renewed), Edison group photo (Bain), Paris Métro 1903–06 + Nord-Sud entrance (Agence Rol); reused PD 1929
 * crowd / NYT / bank-run photos. CC: Civic Opera Building — Mark Heard (BY 2.0); Cuneo mansion — Witoki (BY-SA 3.0).
 */
export const insull: ArchivalShortProps = {
  vo: "vo/insull/vo.wav",
  words,
  display: { Insul: "INSULL", "600": "600,000", ",000": "", "14": "$14" },
  hook: ["He lit up Chicago.", "Died with 30 francs?"],
  hookTop: 900,
  look: "ticker",
  lookText: "INSULL UTILITIES · COMMONWEALTH EDISON · MIDDLE WEST UTILITIES · CHICAGO",
  twistAt: 9.38,
  question: { windows: [[14.4, 16.1], [26.6, 28.6]], text: "Villain or victim?" },
  durationSec: 28.6,
  cards: [
    { kind: "number", at: 8.06, until: 9.3, value: "$500M", label: "electric empire" },
    { kind: "stamp", at: 9.52, until: 10.9, text: "1929" },
    { kind: "number", at: 12.14, until: 14.3, value: "600,000", label: "lost their savings" },
    { kind: "stamp", at: 18.16, until: 19.3, text: "NOT GUILTY" },
    { kind: "number", at: 22.52, until: 24.3, value: "30", label: "francs in his pocket" },
    { kind: "number", at: 24.5, until: 26.5, value: "−$14M", label: "in debt" },
  ],
  shots: [
    { src: "img/insull/port.jpg", at: 0, move: "in", focus: "50% 0%", fit: "contain" },
    { src: "img/insull/opera.jpg", at: 1.3, move: "up", focus: "50% 50%" },
    { src: "img/insull/metro.jpg", at: 2.4, move: "in", focus: "50% 50%" },
    { src: "img/insull/port.jpg", at: 3.68, move: "in", focus: "50% 20%", zoom: 1.3 },
    { src: "img/insull/edison.jpg", at: 5.0, move: "in", focus: "50% 40%" },
    { src: "img/insull/port2.jpg", at: 6.1, move: "in", focus: "50% 30%" },
    { src: "img/insull/opera.jpg", at: 6.9, move: "left", focus: "50% 40%", zoom: 1.2 },
    { src: "img/insull/time26.jpg", at: 7.8, move: "in", focus: "50% 45%" },
    { src: "img/insull/mansion.jpeg", at: 8.6, move: "right", focus: "50% 50%" },
    { src: "img/livermore/crowd29.jpg", at: 9.38, move: "in", focus: "50% 50%" },
    { src: "img/livermore/nyt29.jpg", at: 10.6, move: "up", focus: "50% 15%" },
    { src: "img/livermore/bank.jpg", at: 11.5, move: "left", focus: "50% 50%" },
    { src: "img/livermore/unemployed.jpg", at: 12.9, move: "in", focus: "50% 30%" },
    { src: "img/insull/port.jpg", at: 14.46, move: "in", focus: "50% 22%", zoom: 1.5 },
    { src: "img/livermore/bankus.jpg", at: 15.9, move: "right", focus: "50% 50%" },
    { src: "img/insull/time26.jpg", at: 17.3, move: "in", focus: "50% 40%", zoom: 1.4 },
    { src: "img/insull/metro2.jpg", at: 19.36, move: "in", focus: "50% 40%" },
    { src: "img/insull/metro.jpg", at: 20.8, move: "up", focus: "50% 50%", zoom: 1.2 },
    { src: "img/insull/port2.jpg", at: 22.4, move: "in", focus: "50% 30%", zoom: 1.3 },
    { src: "img/livermore/crowd29.jpg", at: 24.5, move: "out", focus: "50% 50%" },
    { src: "img/insull/port.jpg", at: 26.6, move: "in", focus: "50% 0%", fit: "contain" },
  ],
};
