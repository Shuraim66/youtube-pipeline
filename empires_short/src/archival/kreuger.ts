import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/kreuger/words.json";

/**
 * Aurelis — Ivar Kreuger, the Match King. Oct 10 test, built on the Ponzi/Crater learnings (50%+ stayed): face on frame 0,
 * number in the first line, ~3 s shots, mid re-hook, NO slow time-jump narration, ends on a SPOKEN question that matches the
 * pinned comment. Look "ticker" (Ponzi was film).
 * Facts (en.wikipedia "Ivar Kreuger", Oct 10 2026): ~75% of world match production; 1929 >200 companies; $125M loan to Germany
 * for a match monopoly, signed with "no idea where he would obtain" the money; found dead in his Paris flat 12 Mar 1932;
 * Price Waterhouse: manipulations "so childish that anyone with but a rudimentary knowledge of bookkeeping could see".
 * Images (Wikimedia): Kreuger c.1920 (PD), Kreuger 1930 colour (CC BY 4.0), Stockholm office (PD), business flight (PD),
 * Kreuger & Toll B-share 1926 (PD).
 */
export const kreuger: ArchivalShortProps = {
  vo: "vo/kreuger/vo.wav",
  words,
  display: { "-quarters": "QUARTERS", "country's": "countries", $125: "$125M", "million.": "" },
  hook: ["Made 75% of the world's matches.", "Then the books opened."],
  hookTop: 960,
  look: "ticker",
  lookText: "KREUGER & TOLL ▲  ·  INTL MATCH ▲  ·  SWEDISH MATCH ▲  ·  1929: 200+ COMPANIES  ·  ",
  twistAt: 15.18,
  question: { windows: [[24.52, 27.9]], text: "Genius or swindler?" },
  durationSec: 27.9,
  cards: [
    { kind: "number", at: 3.6, until: 6.0, value: "200+", label: "companies · 1929" },
    { kind: "number", at: 7.68, until: 10.4, value: "$125M", label: "loaned to Germany" },
    { kind: "number", at: 18.9, until: 21.9, value: "1932", label: "found dead · Paris" },
    { kind: "quote", at: 22.3, until: 24.4, text: "“So childish… anyone could see the books were falsified.”", source: "— PRICE WATERHOUSE, 1932" },
  ],
  shots: [
    { src: "img/kreuger/port.jpg", at: 0, move: "in", focus: "50% 22%" },
    { src: "img/kreuger/office.jpg", at: 3.08, move: "left", focus: "45% 40%" },
    { src: "img/kreuger/flight.jpg", at: 6.16, move: "in", focus: "50% 55%" },
    { src: "img/kreuger/p1930.jpg", at: 10.52, move: "up", focus: "50% 25%" },
    { src: "img/kreuger/port.jpg", at: 13.24, move: "in", focus: "50% 0%", zoom: 1.15 },
    { src: "img/kreuger/kt1926.jpg", at: 15.18, move: "up", focus: "50% 30%" },
    { src: "img/kreuger/office.jpg", at: 18.72, move: "in", focus: "45% 35%", zoom: 1.6 },
    { src: "img/kreuger/kt1926.jpg", at: 22.3, move: "in", focus: "50% 70%", zoom: 1.5 },
    { src: "img/kreuger/p1930.jpg", at: 24.52, move: "in", focus: "50% 22%" },
  ],
};
