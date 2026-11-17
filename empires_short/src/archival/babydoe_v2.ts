import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/babydoe/words.json";

/**
 * Aurelis — Baby Doe Tabor: a $7,000 wedding dress in 1883, found dead in a cabin at the Matchless mine in 1935.
 * V2-native (scripts_v2/babydoe.json). Hook-test experiment (experiments/hook_test_2026-10.json): arm = CONSEQUENCE.
 * Look "ticker", VO bf_emma atempo 1.0.
 * Facts (en.wikipedia "Baby Doe Tabor" + "Matchless Mine", history.com, Denver Public Library, cowboystatedaily.com,
 * leadville.com, babydoe.org): Willard Hotel wedding 1 Mar 1883, President Arthur attended, $7,000 satin dress;
 * Sherman Act repeal / Panic of 1893 cost Tabor his fortune; Tabor died nearly broke Apr 1899; she lived for decades in
 * the Matchless cabin; found dead on the cabin floor after a snowstorm, March 1935. Cause (froze vs heart failure) is
 * disputed → "found dead".
 * Images: babydoe.jpg c.1883 (PD), babydoe2.jpg (PD), horace.jpg Brady-Handy (PD), opera.jpg Tabor Opera House Denver
 * stereoview (PD), panic.jpg NYSE 5 May 1893 (PD, LOC), judge.jpg Judge 15 Jul 1893 (PD), matchless.jpg (CC BY 3.0
 * Plazak), operaL.jpg Tabor Opera House Leadville 2007 (CC BY 3.0 Plazak). CC credits in the description.
 */
export const babydoeV2: ArchivalShortProps = {
  look: "ticker",
  lookText: "SILVER · 1893",
  templateVersion: "v2",
  vo: "vo/babydoe/vo.wav",
  words,
  display: { seven: "$7,000", thousand: "", "dollars.": "" },
  hook: ["A $7,000 wedding dress.", "Found dead in a mine shack."],
  twistAt: 27.96,
  durationSec: 35.7,
  v2: {
    hook: { lines: ["A $7,000 wedding dress.", "Found dead in a mine shack."], until: 2.0, emphasis: "mine shack", top: 760 },
    payoff: {
      at: 31.24, kind: "resolved", style: "hero", kicker: "Leadville · March 1935",
      text: "Found dead on the floor of her cabin at the Matchless mine.", source: "AFTER A SNOWSTORM · CAUSE STILL DEBATED",
    },
  },
  cards: [
    { kind: "number", at: 10.08, until: 12.84, value: "$7,000", label: "her white satin wedding dress" },
    { kind: "stamp", at: 17.42, until: 20.3, text: "SILVER CRASH" },
  ],
  shots: [
    { src: "img/babydoe/babydoe.jpg", at: 0, move: "in", focus: "50% 30%", role: "hook" },
    { src: "img/babydoe/horace.jpg", at: 1.9, move: "left", focus: "45% 30%", role: "setup", credit: "HORACE TABOR · BRADY-HANDY STUDIO" },
    { src: "img/babydoe/babydoe2.jpg", at: 4.96, move: "in", focus: "50% 35%", role: "setup", credit: "BABY DOE TABOR · 1880s" },
    { src: "img/babydoe/babydoe.jpg", at: 8.78, move: "up", focus: "50% 50%", zoom: 1.2, role: "setup", credit: "BABY DOE TABOR · c.1883" },
    { src: "img/babydoe/opera.jpg", at: 11.7, move: "left", focus: "25% 50%", zoom: 1.2, role: "conflict", credit: "TABOR OPERA HOUSE, DENVER · STEREOVIEW" },
    { src: "img/babydoe/panic.jpg", at: 13.94, move: "in", focus: "50% 55%", role: "conflict", credit: "PANIC AT THE STOCK EXCHANGE · MAY 1893" },
    { src: "img/babydoe/judge.jpg", at: 18.88, move: "up", focus: "50% 40%", role: "evidence", credit: "JUDGE MAGAZINE · JULY 1893" },
    { src: "img/babydoe/horace.jpg", at: 20.38, move: "in", focus: "45% 25%", zoom: 1.3, role: "evidence", credit: "HORACE TABOR · DIED 1899" },
    { src: "img/babydoe/operaL.jpg", at: 22.76, move: "left", focus: "50% 50%", role: "reveal", credit: "LEADVILLE · MODERN PHOTO, CC BY" },
    { src: "img/babydoe/matchless.jpg", at: 25.86, move: "in", focus: "35% 55%", role: "reveal", credit: "THE MATCHLESS MINE & HER CABIN · MODERN, CC BY" },
    { src: "img/babydoe/matchless.jpg", at: 31.24, move: "in", focus: "30% 60%", zoom: 1.4, role: "payoff", credit: "HER CABIN · MODERN PHOTO, CC BY" },
    { src: "img/babydoe/babydoe2.jpg", at: 33.64, move: "in", focus: "50% 35%", zoom: 1.2, role: "evidence", credit: "BABY DOE TABOR · 1880s" },
  ],
};
