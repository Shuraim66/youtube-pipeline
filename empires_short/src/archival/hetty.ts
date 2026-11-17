import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/hetty/words.json";

/**
 * Aurelis — Hetty Green. Oct 8 test: SUPERLATIVE + PARADOX statement opener (Sep 60%+ pattern) vs the question
 * openers; boom on frame 0 + riser into the loop; COMPLETE-SENTENCE verbal loop
 * ("And yet, until the very end," → "the richest woman in America wore the same black dress for years.").
 * Look "ticker" (Drew was "film"). Facts (en.wikipedia, verified Oct 8 2026): estate $100–200M at death (1916);
 * single black dress, boarding houses, moved Brooklyn/Hoboken to avoid taxes; "Witch of Wall Street"; Panic of 1907
 * lent $1.1M to New York City. (Ned's-leg story is disputed — not used.)
 * Images: PD — Hetty Green (National Magazine; Hollinger & Rockey), Jersey City/Hudson 1890; reused PD 1907/1900s
 * NYSE, curb market, Keppler bears, Knickerbocker Trust, Fifth Ave 1905, Flatiron c.1903; 1907 Panic crop (Soerfm, CC BY-SA 3.0).
 */
export const hetty: ArchivalShortProps = {
  vo: "vo/hetty/vo.wav",
  words,
  display: { $100: "$100", $1: "$1.1", ".1": "", $200: "$200" },
  hook: ["America's richest woman.", "Wore one dress for years."],
  hookTop: 980,
  look: "ticker",
  lookText: "HETTY GREEN · WITCH OF WALL STREET · CHEMICAL NATIONAL BANK · 1907",
  twistAt: 11.6,
  question: { windows: [[17.0, 18.8], [18.82, 21.1]], text: "Genius or miser?" },
  durationSec: 21.1,
  cards: [
    { kind: "number", at: 4.52, until: 5.9, value: "$100M+", label: "her fortune" },
    { kind: "stamp", at: 9.9, until: 11.5, text: "WITCH" },
    { kind: "stamp", at: 12.24, until: 13.4, text: "1907" },
    { kind: "number", at: 15.34, until: 17.0, value: "$1.1M", label: "lent to New York City" },
    { kind: "number", at: 18.14, until: 18.8, value: "$200M", label: "at her death" },
  ],
  shots: [
    { src: "img/hetty/port.jpg", at: 0, move: "in", focus: "50% 0%", fit: "contain" },
    { src: "img/livermore/curb.jpg", at: 1.3, move: "in", focus: "50% 50%" },
    { src: "img/hetty/port2.jpg", at: 2.3, move: "in", focus: "50% 25%" },
    { src: "img/hetty/port.jpg", at: 3.48, move: "in", focus: "50% 20%", zoom: 1.3 },
    { src: "img/livermore/nyse.jpg", at: 4.52, move: "in", focus: "50% 50%" },
    { src: "img/hetty/hudson.jpg", at: 5.94, move: "right", focus: "50% 50%" },
    { src: "evidence/arnold/fifth1905.jpg", at: 7.66, move: "left", focus: "50% 50%" },
    { src: "img/hetty/port2.jpg", at: 9.0, move: "out", focus: "50% 25%", zoom: 1.2 },
    { src: "img/livermore/bears07.jpg", at: 9.9, move: "in", focus: "50% 50%" },
    { src: "img/livermore/panic07.jpg", at: 11.6, move: "in", focus: "50% 50%" },
    { src: "img/livermore/knick.jpg", at: 13.14, move: "up", focus: "50% 50%" },
    { src: "evidence/arnold/flat1903.jpg", at: 14.22, move: "in", focus: "50% 40%" },
    { src: "img/hetty/port.jpg", at: 15.34, move: "in", focus: "50% 22%", zoom: 1.5 },
    { src: "img/livermore/curb.jpg", at: 17.06, move: "right", focus: "50% 50%", zoom: 1.3 },
    { src: "img/hetty/port2.jpg", at: 18.82, move: "in", focus: "50% 22%", zoom: 1.3 },
  ],
};
