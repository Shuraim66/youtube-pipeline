import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/flight19/words.json";

/**
 * Night File — Flight 19, five Navy Avengers and the PBM Mariner sent after them, lost off Florida, 5 Dec 1945.
 * V2-native (scripts_v2/flight19.json). V3 batch (V3_BATCH_BRIEF.md §3.1, experiments/v3_test_2026-10.json): arm S
 * (short loop: "They were never found." → "Five Navy bombers…"), spoken hook first, evidence on frame 0.
 * Look "vhs", VO am_michael atempo 1.05.
 * Facts (en.wikipedia "Flight 19"): 5 TBM Avengers from NAS Fort Lauderdale, 14 airmen; Lt. Charles C. Taylor radioed
 * "Both of my compasses are out."; PBM-5 Mariner with 13 crew lost searching; SS Gaines Mills reported flames; no wreck
 * confirmed; Navy blamed Taylor, amended to "cause unknown" after his mother objected. Nothing supernatural claimed.
 * Images (licences read via the en.wikipedia API; Commons itself is unreachable from here):
 *  formation.jpg  "Grumman TBF-1 Avengers of VGS-29 in flight over Norfolk, Virginia (USA), on 1 September 1942 (80-G-427475).jpg"
 *                 PD (US Navy, Horace Bristol) — 1942 TBF formation, same type, not Flight 19
 *  randolph.jpg   "TBM on USS Randolph 1945.jpg" PD (US Navy)
 *  map.png        "Flt19map.png" CC BY 2.5 (User:Moriori / Anynobody) — route map; credit in description
 *  taylor.jpg     "Charles C. Taylor.jpg" PD (NAS Fort Lauderdale)
 *  coralsea.jpg   "TBM-3Es VC-22 over USS Coral Sea (CVB-43).jpg" PD (US Navy) — postwar, same type
 *  mariner.jpg    "Martin PBM-5 Mariner in flight c1945.jpeg" PD (US Navy) — same type, not the lost aircraft
 *  sea.jpg        "Waves in pacifica 1.jpg" CC BY-SA 4.0 (Brocken Inaglory) — modern, illustrative; credit in description
 * No body imagery. Brief's hook credit said "TBM AVENGERS"; the photo is of TBF-1s (same aircraft, Grumman-built), so
 * the credit says "AVENGERS, 1942".
 */
export const flight19V2: ArchivalShortProps = {
  brand: "nightfile",
  look: "vhs",
  templateVersion: "v2",
  vo: "vo/flight19/vo.wav",
  words,
  display: {},
  hook: ["5 BOMBERS. 1\u00a0RESCUE PLANE.", "NONE FOUND."],
  twistAt: 19.46,
  durationSec: 25.4,
  v2: {
    hook: {
      lines: ["5 BOMBERS. 1\u00a0RESCUE PLANE.", "NONE FOUND."], until: 2.8, emphasis: "NONE FOUND.",
      shot: { src: "img/flight19/formation.jpg", at: 0, move: "in", focus: "45% 50%", zoom: 1.1, role: "hook", credit: "AVENGERS, 1942 · SAME TYPE, NOT FLIGHT 19" },
    },
    payoff: {
      at: 19.46, until: 23.0, kind: "unresolved", style: "hero", kicker: "THE NAVY'S VERDICT",
      text: "First: the leader's error. Then, after his mother objected: cause unknown.", source: "US NAVY BOARD OF INVESTIGATION",
    },
  },
  cards: [
    { kind: "quote", at: 9.6, until: 12.0, text: "Both of my compasses are out.", source: "LT. CHARLES TAYLOR · RADIO, DEC 5, 1945" },
    { kind: "number", at: 14.04, until: 16.9, value: "27", label: "men lost (14 + 13)" },
  ],
  shots: [
    { src: "img/flight19/coralsea.jpg", at: 2.8, move: "left", focus: "62% 22%", zoom: 1.3, role: "setup", credit: "AVENGERS · LATER PHOTO, SAME TYPE" },
    { src: "img/flight19/map.png", at: 5.58, move: "in", focus: "50% 60%", role: "setup", credit: "FLIGHT 19'S ROUTE · CC BY 2.5" },
    { src: "img/flight19/taylor.jpg", at: 8.22, move: "in", focus: "50% 35%", role: "conflict", credit: "LT. CHARLES C. TAYLOR, FLIGHT LEADER" },
    { src: "img/flight19/randolph.jpg", at: 10.94, move: "left", focus: "38% 55%", role: "conflict", credit: "TBM AVENGER, 1945 · SAME TYPE" },
    { src: "img/flight19/mariner.jpg", at: 13.02, move: "in", focus: "50% 50%", role: "evidence", credit: "PBM MARINER · SAME TYPE" },
    { src: "img/flight19/sea.jpg", at: 17.08, move: "up", focus: "50% 50%", role: "evidence", credit: "OPEN SEA · MODERN, ILLUSTRATIVE" },
    { src: "img/flight19/taylor.jpg", at: 19.46, move: "in", focus: "50% 22%", zoom: 1.15, role: "payoff", credit: "LT. CHARLES C. TAYLOR" },
    { src: "img/flight19/formation.jpg", at: 23.1, move: "in", focus: "45% 50%", zoom: 1.1, role: "reveal", credit: "AVENGERS, 1942 · SAME TYPE, NOT FLIGHT 19" },
  ],
};
