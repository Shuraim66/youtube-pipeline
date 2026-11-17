import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/earhart/words.json";

/**
 * Night File — Amelia Earhart. Oct 10 test: face on frame 0, ~3 s shots, mid re-hook, NO lull on the time jump (cut straight to
 * the next clue), ends on a SPOKEN question matching the pinned comment. Look "vhs" (Crater was film).
 * Facts (en.wikipedia "Amelia Earhart" + "Nikumaroro", Oct 10 2026): 2 Jul 1937 toward Howland Island (~10 ft high);
 * Itasca rated her 7:58 transmission the loudest possible yet never saw the plane; last message gave line of position 157–337;
 * $4M Navy/Coast Guard search found nothing; Sept 1940 thirteen bones found on Gardner (Nikumaroro), ~400 mi SE;
 * Dr Hoodless (Fiji) said male; bones since lost; 2018 Jantz: "consistent with Earhart in all respects we know".
 * Images (PD): Earhart dressed to fly, LOC hec.40747, under the Electra's nose, USCGC Itasca, Howland camp Jan 1937 (NARA),
 * Nikumaroro lagoon, Earhart & Noonan.
 */
export const earhart: ArchivalShortProps = {
  brand: "nightfile",
  look: "vhs",
  lookText: "JUL 02 1937",
  vo: "vo/earhart/vo.wav",
  words,
  display: { $4: "$4M", million: "" },
  hook: ["Her signal: the loudest possible.", "Nobody saw her plane."],
  hookTop: 980,
  twistAt: 18.4,
  question: { windows: [[30.5, 33.4]], text: "Sank, or castaway?" },
  durationSec: 33.4,
  cards: [
    { kind: "stamp", at: 6.1, until: 7.9, text: "JULY 2, 1937" },
    { kind: "stamp", at: 12.2, until: 14.0, text: "157° – 337°" },
    { kind: "stamp", at: 14.28, until: 16.3, text: "$4,000,000" },
    { kind: "stamp", at: 19.32, until: 22.0, text: "13 BONES" },
    { kind: "stamp", at: 25.1, until: 26.7, text: "LOST" },
    { kind: "quote", at: 27.12, until: 30.3, text: "“Consistent with Earhart in all respects.”", source: "— FORENSIC STUDY · 2018" },
  ],
  shots: [
    { src: "evidence/earhart/port.jpg", at: 0, move: "in", focus: "50% 30%" },
    { src: "evidence/earhart/itasca.jpg", at: 3.64, move: "left", focus: "50% 50%" },
    { src: "evidence/earhart/loc.jpg", at: 6.1, move: "in", focus: "55% 55%" },
    { src: "evidence/earhart/howland.jpg", at: 8.22, move: "left", focus: "50% 50%" },
    { src: "evidence/earhart/electra.jpg", at: 11.82, move: "in", focus: "50% 30%" },
    { src: "evidence/earhart/itasca.jpg", at: 14.16, move: "in", focus: "40% 45%", zoom: 1.5 },
    { src: "evidence/earhart/port.jpg", at: 16.42, move: "in", focus: "50% 18%", zoom: 1.3 },
    { src: "evidence/earhart/niku.jpg", at: 18.4, move: "left", focus: "50% 60%" },
    { src: "evidence/earhart/noonan.jpg", at: 23.04, move: "up", focus: "50% 30%" },
    { src: "evidence/earhart/electra.jpg", at: 26.82, move: "in", focus: "50% 25%", zoom: 1.5 },
    { src: "evidence/earhart/port.jpg", at: 30.5, move: "in", focus: "50% 30%" },
  ],
};
