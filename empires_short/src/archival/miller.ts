import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/miller/words.json";

/**
 * Night File — Glenn Miller (full-bleed archival, look "film" — Bierce was "vhs"). Oct 7 rules: question opener,
 * ≤3 beats after the vanish, VERBAL loop ("So ask yourself:" → "How does the most famous bandleader…").
 * Facts (en.wikipedia, verified Oct 7 2026): 16 number-one records; gave up ~$20,000/week to enlist (1942, aged 38);
 * Dec 15 1944 UC-64 Norseman from RAF Twinwood Farm to Paris, fog; never found (Miller, Lt Col Baessell, pilot
 * Morgan); 2001 theory: struck by bombs jettisoned by RAF Lancasters returning over the Channel (an airman
 * reported seeing a small plane go down).
 * Images: PD — Miller portraits, band 1940–41, UC-64A + UC-46/64 photos (USAF), Twinwood 1948 RAF airphoto,
 * Lancaster poster (OEM) + RAF gunner CH8795. CC BY-SA: Twinwood tower — MilborneOne (3.0); Channel — Rolf
 * Süssbrich (3.0); Arlington marker — Kinfo Pedia (4.0).
 */
export const miller: ArchivalShortProps = {
  brand: "nightfile",
  look: "film",
  vo: "vo/miller/vo.wav",
  words,
  display: { "$20": "$20,000", ",000": "" },
  hook: ["America's biggest bandleader.", "Vanished into thin air?"],
  hookTop: 1000,
  twistAt: 16.68,
  question: { windows: [[20.0, 21.9], [26.5, 28.6]], text: "Fog, or friendly bombs?" },
  durationSec: 28.6,
  cards: [
    { kind: "number", at: 4.86, until: 6.3, value: "16", label: "number-one records" },
    { kind: "number", at: 7.18, until: 9.0, value: "$20,000", label: "a week — given up" },
    { kind: "stamp", at: 10.04, until: 11.8, text: "DEC 15, 1944" },
    { kind: "stamp", at: 18.14, until: 19.0, text: "NO WRECK" },
    { kind: "stamp", at: 19.02, until: 20.0, text: "NO BODIES" },
  ],
  shots: [
    { src: "evidence/miller/billboard.jpg", at: 0, move: "in", focus: "22% 20%" },
    { src: "evidence/miller/band.jpg", at: 1.4, move: "in", focus: "50% 50%" },
    { src: "evidence/miller/uc46.jpg", at: 2.5, move: "left", focus: "50% 55%" },
    { src: "evidence/miller/port.jpg", at: 4.26, move: "in", focus: "50% 25%" },
    { src: "evidence/miller/band.jpg", at: 5.3, move: "right", focus: "40% 50%", zoom: 1.3 },
    { src: "evidence/miller/billboard.jpg", at: 6.44, move: "out", focus: "40% 30%" },
    { src: "evidence/miller/marker.jpg", at: 8.5, move: "up", focus: "50% 40%" },
    { src: "evidence/miller/twinwood48.jpg", at: 10.04, move: "in", focus: "50% 50%" },
    { src: "evidence/miller/tower.jpg", at: 11.3, move: "left", focus: "50% 50%" },
    { src: "evidence/miller/norseman.jpg", at: 12.32, move: "in", focus: "50% 50%" },
    { src: "evidence/miller/uc46.jpg", at: 13.66, move: "right", focus: "50% 55%" },
    { src: "evidence/miller/twinwood48.jpg", at: 15.2, move: "in", focus: "50% 50%", zoom: 1.5 },
    { src: "evidence/miller/port.jpg", at: 16.68, move: "in", focus: "50% 22%", zoom: 1.5 },
    { src: "evidence/miller/norseman.jpg", at: 18.14, move: "out", focus: "50% 50%", zoom: 1.3 },
    { src: "evidence/miller/lancs.jpg", at: 20.02, move: "in", focus: "50% 40%" },
    { src: "evidence/miller/gunner.jpg", at: 21.6, move: "in", focus: "50% 40%" },
    { src: "evidence/miller/lancs.jpg", at: 22.94, move: "left", focus: "45% 40%", zoom: 1.4 },
    { src: "evidence/miller/uc46.jpg", at: 24.06, move: "in", focus: "50% 55%", zoom: 1.5 },
    { src: "evidence/miller/marker.jpg", at: 25.3, move: "up", focus: "50% 30%", zoom: 1.2 },
    { src: "evidence/miller/billboard.jpg", at: 26.5, move: "in", focus: "22% 20%" },
  ],
};
