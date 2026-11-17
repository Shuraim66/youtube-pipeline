import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/carnegie/words.json";

/**
 * Aurelis — Andrew Carnegie (archival montage; person + money + reversal; deeper version of the
 * Sep 2026 1,132-view Short: adds the Homestead twist). Facts (Wikipedia, verified Oct 3 2026):
 * b. 1835 Dunfermline; emigrated 1848 aged 12; bobbin boy in a cotton mill at $1.20/week; sold Carnegie
 * Steel to J.P. Morgan in 1901 for $303.45M (his share $225.64M) → richest American; gave away ~$350M
 * (~90%) in his last 18 years; ~3,000 libraries; Carnegie Hall (1891); "The man who dies thus rich dies
 * disgraced" (The Gospel of Wealth, 1889). Homestead strike 1892 (9 years before the sale): company under
 * Frick demanded a 22% wage cut and ended union recognition; 300 Pinkertons; 10 died July 6 (7 strikers,
 * 3 Pinkertons); union broken. Images: Wikimedia — public domain (portraits by Theodore C. Marceau, Life
 * cover by Albert Levering, Encke portrait of Morgan, Harper's Weekly / Burgoyne / Mentes engravings,
 * Palmer furnaces photo, 1891 Edgar Thomson works engraving, Carnegie Hall 1895, Pittsburgh library);
 * birthplace + Dunfermline library — Kilnburn (attribution); Syracuse library — Newkai, CC BY-SA 2.0.
 */
export const carnegie: ArchivalShortProps = {
  vo: "vo/carnegie/vo.wav",
  words,
  display: { "12": "TWELVE", "20": "TWENTY", "3": "3,000", ",000": "", J: "J.P.", ".P.": "", "10": "TEN" },
  hook: ["Richest man in America.", "Gave it all away."],
  twistAt: 21.0,
  question: { windows: [[14.3, 17.4], [30.7, 34]], text: "Generosity or guilt?" },
  durationSec: 33.4,
  cards: [
    { kind: "number", at: 5.7, until: 7.15, value: "$1.20", label: "a week · age 12" },
    { kind: "number", at: 8.7, until: 10.3, value: "$303M", label: "sold to J.P. Morgan · 1901" },
    { kind: "number", at: 14.3, until: 15.9, value: "~3,000", label: "libraries" },
    { kind: "quote", at: 18.0, until: 20.95, text: "“The man who dies thus rich dies disgraced.”", source: "— CARNEGIE, THE GOSPEL OF WEALTH, 1889" },
    { kind: "stamp", at: 21.0, until: 22.3, text: "1892" },
    { kind: "number", at: 23.3, until: 25.4, value: "−22%", label: "pay cut demanded" },
    { kind: "stamp", at: 28.0, until: 29.8, text: "10 DEAD" },
  ],
  shots: [
    { src: "img/carnegie/port_marceau.jpg", at: 0, move: "in", focus: "50% 22%" },
    { src: "img/carnegie/port_1913.jpg", at: 1.8, move: "out", focus: "45% 20%" },
    { src: "img/carnegie/kilt_money.jpg", at: 3.0, move: "in", focus: "50% 35%" },
    { src: "img/carnegie/birthplace.jpg", at: 4.08, move: "right" },
    { src: "img/carnegie/birthplace.jpg", at: 5.5, move: "in", focus: "40% 60%", zoom: 1.3 },
    { src: "img/carnegie/furnaces.jpg", at: 7.2, move: "up", focus: "50% 40%" },
    { src: "img/carnegie/etworks.jpg", at: 8.0, move: "left" },
    { src: "img/carnegie/morgan.jpg", at: 9.4, move: "in", focus: "50% 25%" },
    { src: "img/carnegie/port_1913.jpg", at: 11.1, move: "in", focus: "45% 15%", zoom: 1.5 },
    { src: "img/carnegie/kilt_money.jpg", at: 12.9, move: "out", focus: "50% 30%" },
    { src: "img/carnegie/lib_pitt.jpg", at: 14.3, move: "right" },
    { src: "img/carnegie/lib_dunf.jpg", at: 15.2, move: "up", focus: "50% 40%" },
    { src: "img/carnegie/lib_syr.jpg", at: 16.0, move: "in" },
    { src: "img/carnegie/hall1895.jpg", at: 17.1, move: "left" },
    { src: "img/carnegie/port_marceau.jpg", at: 18.0, move: "in", focus: "50% 20%", zoom: 1.25 },
    { src: "img/carnegie/riot.jpg", at: 21.0, move: "in", focus: "50% 55%" },
    { src: "img/carnegie/frick.jpg", at: 22.3, move: "in", focus: "50% 30%" },
    { src: "img/carnegie/cartoon.png", at: 23.3, move: "right" },
    { src: "img/carnegie/guard.jpg", at: 25.5, move: "left" },
    { src: "img/carnegie/battle.jpg", at: 26.8, move: "in" },
    { src: "img/carnegie/mob.jpg", at: 28.0, move: "right" },
    { src: "img/carnegie/riot.jpg", at: 29.4, move: "out", focus: "50% 70%", zoom: 1.3 },
    { src: "img/carnegie/port_marceau.jpg", at: 30.7, move: "in", focus: "50% 22%", zoom: 1.15 },
  ],
};
