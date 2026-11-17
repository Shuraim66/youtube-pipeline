import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/andree/words.json";

/**
 * Night File — Andrée's 1897 Arctic balloon expedition and the film found 33 years later. V2-native
 * (scripts_v2/andree.json). Hook-test experiment (experiments/hook_test_2026-10.json): arm = MYSTERY.
 * Look "vhs", VO am_michael atempo 1.05 (same as Christie / Lady Be Good); "Svalbard" spoken "Svaalbar".
 * Facts (en.wikipedia "Andrée's Arctic balloon expedition" + "Nils Strindberg", svalbardmuseum.no,
 * onthisdateinphotography.com): lift-off 11 Jul 1897; down on the ice 14 Jul; camp found 1930 on Kvitøya by Bratvaag;
 * diaries + five exposed rolls, one in the camera; John Hertzberg saved 93 frames; diaries end 7-8 Oct 1897.
 * Cause of death is disputed → not stated. No remains imagery.
 * Images (all PD via Wikimedia; 1897 frames are Strindberg's recovered film; explorers.jpg = Commons "Balloon.explorers.jpg", PD-US, checked 2026-10-14): andree.jpg (Nordiska Museet portrait),
 * trio.png (Swedenborg, Strindberg, Frænkel, Andrée, studio), station.jpg (balloon house, Danes Island), north.png
 * (Örnen after lift-off), map.png (route), crashed.jpg, sled.jpg, boat.jpg (recovered film), hut.jpg (Strindberg's sketch).
 */
export const andreeV2: ArchivalShortProps = {
  brand: "nightfile",
  look: "vhs",
  templateVersion: "v2",
  vo: "vo/andree/vo.wav",
  words,
  display: {},
  hook: ["What was on the film", "from a 33-year-old camp?"],
  twistAt: 24.14,
  durationSec: 36.8,
  v2: {
    hook: { lines: ["What was on the film", "from a 33-year-old camp?"], until: 2.0, emphasis: "the film", top: 760 },
    payoff: {
      at: 24.14, until: 28.1, kind: "resolved", style: "hero", kicker: "What the film showed",
      text: "Their balloon, down on the ice less than three days after take-off.", source: "NILS STRINDBERG'S FILM · 14 JULY 1897",
    },
  },
  cards: [
    { kind: "number", at: 22.4, until: 24.0, value: "93", label: "frames saved from the film" },
  ],
  shots: [
    { src: "img/andree/andree.jpg", at: 0, move: "in", focus: "55% 30%", zoom: 1.2, role: "hook" },
    { src: "img/andree/trio.png", at: 2.14, move: "left", focus: "50% 40%", role: "setup", credit: "ANDRÉE'S TEAM + A RESERVE · STUDIO PORTRAIT" },
    { src: "img/andree/station.jpg", at: 3.88, move: "in", focus: "40% 55%", role: "setup", credit: "BALLOON HOUSE, SVALBARD · 1897" },
    { src: "img/andree/north.png", at: 6.2, move: "up", focus: "50% 40%", role: "setup", credit: "THE BALLOON AFTER LIFT-OFF · 11 JULY 1897" },
    { src: "img/andree/map.png", at: 7.98, move: "in", focus: "55% 45%", zoom: 1.4, role: "conflict", credit: "THEIR ROUTE · SVALBARD TO KVITØYA" },
    { src: "img/andree/map.png", at: 10.82, move: "left", focus: "60% 55%", zoom: 1.8, role: "conflict", credit: "KVITØYA (WHITE ISLAND)" },
    { src: "img/andree/hut.jpg", at: 14.74, move: "up", focus: "50% 40%", role: "evidence", credit: "STRINDBERG'S SKETCH OF THEIR HUT · 1897" },
    { src: "img/andree/andree.jpg", at: 17.24, move: "in", focus: "55% 30%", zoom: 1.5, role: "evidence", credit: "S. A. ANDRÉE · EXPEDITION LEADER" },
    { src: "img/andree/explorers.jpg", at: 19.76, move: "left", focus: "50% 50%", role: "reveal", credit: "PREPARING THE BALLOON · 1897" },
    { src: "img/andree/crashed.jpg", at: 24.14, move: "in", focus: "65% 50%", role: "payoff", credit: "RECOVERED FILM · 14 JULY 1897" },
    { src: "img/andree/sled.jpg", at: 28.12, move: "left", focus: "45% 50%", role: "evidence", credit: "RECOVERED FILM · ON THE ICE, 1897" },
    { src: "img/andree/boat.jpg", at: 30.66, move: "in", focus: "50% 50%", role: "evidence", credit: "RECOVERED FILM · ON THE ICE, 1897" },
    { src: "img/andree/crashed.jpg", at: 32.42, move: "in", focus: "60% 50%", zoom: 1.4, role: "evidence", credit: "RECOVERED FILM · 14 JULY 1897" },
  ],
};
