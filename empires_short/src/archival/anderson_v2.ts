import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/anderson/words.json";

/**
 * Night File — Anna Anderson, the woman who said she was Anastasia. V2-native (scripts_v2/anderson.json).
 * Hook-test experiment (experiments/hook_test_2026-10.json): arm = MYSTERY. Look "vhs", VO am_michael atempo 1.05;
 * "Schanzkowska" spoken "Shants-koff-ska".
 * Facts (en.wikipedia "Anna Anderson" (Gill 1994, Coble, Rogaev); history.co.uk; todayifoundout.com; readthehook.net;
 * UVA archives): Landwehrkanal 27 Feb 1920; Dalldorf "Fräulein Unbekannt"; called Anastasia by 1921-22; longest-running
 * lawsuit in German history, ended 1970 without a ruling on identity; died Charlottesville 1984; 1994 mtDNA from hospital
 * tissue: not a Romanov, matched Karl Maucher (great-nephew of Franziska Schanzkowska).
 * Images (all PD via Wikimedia): mugshot.jpg Dalldorf 1920, anna1922.jpg, profile.jpg (Gilliard's comparison),
 * anastasia.jpg Grand Duchess Anastasia, family.jpg Imperial Family 1913, tobolsk.jpg Anastasia in captivity,
 * franziska.jpg Franziska Schanzkowska (pre-1920).
 */
export const andersonV2: ArchivalShortProps = {
  brand: "nightfile",
  look: "vhs",
  templateVersion: "v2",
  vo: "vo/anderson/vo.wav",
  words,
  display: {},
  hook: ["She said she was Anastasia.", "Who was she really?"],
  twistAt: 32.14,
  durationSec: 39.9,
  v2: {
    hook: { lines: ["She said she was Anastasia.", "Who was she really?"], until: 2.0, emphasis: "Who was she", top: 760 },
    payoff: {
      at: 33.8, kind: "resolved", style: "hero", kicker: "What the DNA showed",
      text: "Not a Romanov. She matched the family of Franziska Schanzkowska.", source: "mtDNA TESTS · 1994",
    },
  },
  cards: [
    { kind: "stamp", at: 21.9, until: 24.6, text: "NEVER ESTABLISHED" },
  ],
  shots: [
    { src: "img/anderson/mugshot.jpg", at: 0, move: "in", focus: "85% 40%", role: "hook" },
    { src: "img/anderson/mugshot.jpg", at: 2.04, move: "left", focus: "85% 45%", role: "setup", credit: "“MISS UNKNOWN” · DALLDORF ASYLUM, 1920" },
    { src: "img/anderson/mugshot.jpg", at: 5.5, move: "in", focus: "55% 45%", zoom: 1.3, role: "setup", credit: "“MISS UNKNOWN” · DALLDORF ASYLUM, 1920" },
    { src: "img/anderson/anastasia.jpg", at: 11.42, move: "in", focus: "50% 35%", role: "conflict", credit: "GRAND DUCHESS ANASTASIA · c.1914" },
    { src: "img/anderson/family.jpg", at: 14.46, move: "left", focus: "50% 40%", role: "conflict", credit: "THE IMPERIAL FAMILY · 1913" },
    { src: "img/anderson/tobolsk.jpg", at: 16.32, move: "in", focus: "40% 40%", role: "conflict", credit: "ANASTASIA IN CAPTIVITY · TOBOLSK, 1917" },
    { src: "img/anderson/anna1922.jpg", at: 17.84, move: "left", focus: "35% 40%", role: "evidence", credit: "ANNA ANDERSON · 1922" },
    { src: "img/anderson/anastasia.jpg", at: 24.96, move: "in", focus: "50% 30%", zoom: 1.3, role: "evidence", credit: "GRAND DUCHESS ANASTASIA · c.1914" },
    { src: "img/anderson/mugshot.jpg", at: 27.2, move: "up", focus: "15% 45%", zoom: 1.2, role: "reveal", credit: "ANNA ANDERSON · 1920" },
    { src: "img/anderson/franziska.jpg", at: 33.8, move: "in", focus: "50% 30%", zoom: 1.2, role: "payoff", credit: "FRANZISKA SCHANZKOWSKA · BEFORE 1920" },
    { src: "img/anderson/anna1922.jpg", at: 36.82, move: "in", focus: "40% 40%", zoom: 1.1, role: "payoff", credit: "ANNA ANDERSON · 1922" },
  ],
};
