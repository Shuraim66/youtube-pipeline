import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/drew/words.json";

/**
 * Aurelis — Daniel Drew (look "film" — Insull was "ticker"). Oct 7 rules: question opener, twist at 11.5 s,
 * 3 beats after it (Gould & Fisk → 1873 → died living off his son), VERBAL loop ("Now ask yourself:" → "How does…").
 * Facts (en.wikipedia, verified Oct 7 2026): cattle drover → Wall Street ("Uncle Daniel"); peak ~$13M; lost $1.5M in
 * 1870 when Fisk and Gould turned on him; Panic of 1873 losses; bankrupt 1876; died 1879 dependent on his son.
 * The salted-cattle "watered stock" origin is folklore — narrated as "Legend says".
 * Images (Wikimedia, PD): Drew 1872, Currier & Ives "Vanderbilt & Fisk", Gould (Bain), Fisk, Vanderbilt (Howell &
 * Meyer), Panic of 1873 bank run, Tompkins Square 1874 (Matt Morgan), 1855 Erie map (Colton), Grand Central 1880,
 * Drew Seminary faculty, Vanderbilt steamboat (James Bard), cattle round-up, Val Marie stampede.
 */
export const drew: ArchivalShortProps = {
  vo: "vo/drew/vo.wav",
  words,
  display: { $13: "$13", Good: "GOULD" },
  hook: ["Worth $13 million.", "Died broke?"],
  hookTop: 900,
  look: "film",
  twistAt: 11.54,
  question: { windows: [[17.84, 19.8], [21.4, 23.2]], text: "Genius or crook?" },
  durationSec: 23.2,
  cards: [
    { kind: "stamp", at: 8.4, until: 9.3, text: "WATERED STOCK" },
    { kind: "number", at: 10.8, until: 11.5, value: "$13M", label: "at his peak" },
    { kind: "number", at: 14.64, until: 15.9, value: "−$1.5M", label: "Gould & Fisk · 1870" },
    { kind: "stamp", at: 16.1, until: 17.4, text: "1873" },
    { kind: "number", at: 19.9, until: 21.3, value: "$13M", label: "gone" },
  ],
  shots: [
    { src: "img/drew/port.jpg", at: 0, move: "in", focus: "50% 0%", fit: "contain" },
    { src: "img/drew/run1873.jpg", at: 1.2, move: "in", focus: "50% 50%" },
    { src: "img/drew/port.jpg", at: 2.84, move: "in", focus: "50% 20%", zoom: 1.3 },
    { src: "img/drew/cattle.jpg", at: 3.84, move: "right", focus: "50% 50%" },
    { src: "img/drew/stampede.jpg", at: 5.18, move: "in", focus: "50% 50%" },
    { src: "img/drew/cattle.jpg", at: 6.68, move: "left", focus: "30% 50%", zoom: 1.3 },
    { src: "img/drew/vf.jpg", at: 8.4, move: "in", focus: "50% 50%" },
    { src: "img/drew/grand.jpg", at: 9.46, move: "up", focus: "50% 50%" },
    { src: "img/drew/steamboat.jpg", at: 10.36, move: "right", focus: "50% 50%" },
    { src: "img/drew/port.jpg", at: 11.54, move: "in", focus: "50% 22%", zoom: 1.5 },
    { src: "img/drew/gould.jpg", at: 13.4, move: "in", focus: "50% 25%" },
    { src: "img/drew/fisk.jpg", at: 13.88, move: "in", focus: "50% 25%" },
    { src: "img/drew/erie1855.jpg", at: 14.64, move: "left", focus: "50% 50%" },
    { src: "img/drew/run1873.jpg", at: 15.98, move: "in", focus: "50% 50%", zoom: 1.3 },
    { src: "img/drew/tompkins.jpg", at: 16.9, move: "right", focus: "50% 50%" },
    { src: "img/drew/seminary.jpg", at: 17.84, move: "in", focus: "50% 40%" },
    { src: "img/drew/vanderbilt.jpg", at: 19.1, move: "in", focus: "50% 25%" },
    { src: "img/drew/port.jpg", at: 19.9, move: "out", focus: "50% 15%", zoom: 1.2 },
    { src: "img/drew/port.jpg", at: 21.44, move: "in", focus: "50% 0%", fit: "contain" },
  ],
};
