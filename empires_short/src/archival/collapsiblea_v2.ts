import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/collapsiblea/words.json";

/**
 * Night File — Titanic's Collapsible A, found adrift by RMS Oceanic on 13 May 1912 with three dead aboard.
 * V2-native (scripts_v2/collapsiblea.json). V3 batch (V3_BATCH_BRIEF.md §3.3): arm L, spoken hook first, evidence on
 * frame 0. Look "vhs", VO am_michael atempo 1.05.
 * Facts (en.wikipedia "Lifeboats of the Titanic"; Encyclopedia Titanica "RMS Oceanic finds Collapsible Lifeboat A
 * adrift"): floated off as Titanic sank; ~30 clung to it, swamped; Lowe (Lifeboat 14) took survivors off, left 3 dead;
 * found 13 May 1912 almost 190 miles away; Thomson Beattie (1st class) + two believed firemen; buried at sea; boat to NY.
 * Images (licences read via the en.wikipedia API) — NO body imagery anywhere:
 *  boatA.jpg     "Titanic - Bote plegable A.jpg" PD — Collapsible A itself at recovery by Oceanic, two crewmen aboard
 *                (no bodies visible); found on Commons, so no Collapsible D substitute needed for the hook
 *  titanic.jpg   "RMS Titanic 3.jpg" PD — Titanic leaving Southampton, 10 Apr 1912
 *  ogden8.webp   "Titanic Lifeboats - Louis Ogden 8.webp" PD (Louis Ogden, from Carpathia) — two Titanic lifeboats, boat
 *                numbers not stated, so the credit names none
 *  lowe.jpg      "Harold Lowe WSL circa 1911.jpg" PD
 *  lifeboatD.jpg "Titanic lifeboat.jpg" PD (Louis Ogden) — Collapsible D, survivors aboard; shot 2 (Gate 2), off the Lowe beat
 *  oceanic.jpg   "RMS Oceanic New York (cropped).jpg" PD (Detroit Publishing Co.)
 *  recovered.jpg "Titanic life boats recovered.jpg" PD — Titanic's lifeboats in New York, 1912
 * No public-domain portrait of Thomson Beattie was reachable, so that shot is dropped.
 */
export const collapsibleaV2: ArchivalShortProps = {
  brand: "nightfile",
  look: "vhs",
  templateVersion: "v2",
  vo: "vo/collapsiblea/vo.wav",
  words,
  display: {},
  hook: ["190 MILES AWAY.", "3 STILL ABOARD."],
  twistAt: 29.28,
  durationSec: 35.2,
  v2: {
    hook: {
      lines: ["190 MILES AWAY.", "3 STILL ABOARD."], until: 2.8, emphasis: "190 MILES",
      shot: { src: "img/collapsiblea/boatA.jpg", at: 0, move: "in", fit: "contain", focus: "50% 6%", zoom: 1.15, role: "hook", credit: "COLLAPSIBLE A · RECOVERED BY OCEANIC, MAY 1912" },
    },
    payoff: {
      at: 29.28, kind: "resolved", style: "hero", kicker: "WHO WAS ABOARD",
      text: "Passenger Thomson Beattie and two men believed to be crew. Buried at sea, May 1912.", source: "ENCYCLOPEDIA TITANICA",
    },
  },
  cards: [
    { kind: "number", at: 12.76, until: 15.7, value: "~30", label: "clung to it in the water" },
    { kind: "number", at: 27.32, until: 29.2, value: "190 miles", label: "from where Titanic sank" },
  ],
  shots: [
    { src: "img/collapsiblea/lifeboatD.jpg", at: 2.8, move: "left", focus: "45% 60%", zoom: 1.0, role: "setup", credit: "COLLAPSIBLE D, APRIL 1912 · SAME TYPE AS A" },
    { src: "img/collapsiblea/titanic.jpg", at: 7.72, move: "left", focus: "50% 50%", role: "setup", credit: "TITANIC LEAVES SOUTHAMPTON · APRIL 10, 1912" },
    { src: "img/collapsiblea/ogden8.webp", at: 12.76, move: "in", focus: "40% 50%", role: "conflict", credit: "TITANIC LIFEBOATS NEAR CARPATHIA · APRIL 15, 1912" },
    { src: "img/collapsiblea/lowe.jpg", at: 17.86, move: "in", focus: "50% 25%", role: "evidence", credit: "FIFTH OFFICER HAROLD LOWE" },
    { src: "img/collapsiblea/boatA.jpg", at: 21.2, move: "in", focus: "60% 70%", zoom: 1.3, role: "reveal", credit: "COLLAPSIBLE A · MAY 1912" },
    { src: "img/collapsiblea/oceanic.jpg", at: 23.22, move: "left", focus: "50% 50%", role: "reveal", credit: "RMS OCEANIC" },
    { src: "img/collapsiblea/recovered.jpg", at: 29.28, move: "left", focus: "50% 50%", role: "payoff", credit: "TITANIC'S LIFEBOATS IN NEW YORK, 1912" },
    { src: "img/collapsiblea/boatA.jpg", at: 32.98, move: "in", focus: "55% 70%", zoom: 1.15, role: "payoff", credit: "COLLAPSIBLE A · MAY 1912" },
  ],
};
