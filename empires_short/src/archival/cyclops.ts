import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/cyclops/words.json";

/**
 * Night File — USS Cyclops. Oct 8 test: SUPERLATIVE/PARADOX STATEMENT opener + frame-0 boom + complete-sentence
 * verbal loop ("…nobody can explain how" → "a giant navy ship vanished with 306 men…"). Look "vhs" (Miller was film).
 * Facts (en.wikipedia, verified Oct 8 2026): 19,360-ton collier; left Barbados for Baltimore Mar 4 1918 with 306
 * aboard and 10,800 long tons of manganese ore (over normal 8,000); no distress call; Lt Cdr George Worley born Johan
 * Frederick Wichmann in Germany; declared lost June 1 1918; wreck never found.
 * Images (PD): Cyclops 1911 (NY), Worley, US Weather Bureau storm map, 1950 Bermuda Triangle AP map, sister colliers
 * Proteus + Nereus (US Navy), USS Merrimac, USGS manganese ore, HMS Atalanta (The Graphic 1880), "Unloading a collier"
 * (Atkinson). CC BY-SA 4.0: waves — Brocken Inaglory.
 */
export const cyclops: ArchivalShortProps = {
  brand: "nightfile",
  look: "vhs",
  lookText: "USS CYCLOPS · MARCH 1918",
  vo: "vo/cyclops/vo.wav",
  words,
  display: { "10": "10,000", ",000": "", USS: "U.S.S." },
  hook: ["306 men vanished.", "Not one distress call."],
  hookTop: 1150,
  twistAt: 13.7,
  question: { windows: [[18.4, 20.5], [24.9, 26.5]], text: "Storm, or sabotage?" },
  durationSec: 26.5,
  cards: [
    { kind: "stamp", at: 5.96, until: 7.4, text: "MARCH 1918" },
    { kind: "number", at: 11.2, until: 13.0, value: "10,000", label: "tons of ore" },
    { kind: "stamp", at: 15.56, until: 17.3, text: "ALIAS" },
    { kind: "stamp", at: 21.54, until: 22.8, text: "NO WRECK" },
  ],
  shots: [
    { src: "evidence/cyclops/ship.jpg", at: 0, move: "in", focus: "50% 50%" },
    { src: "evidence/cyclops/waves.jpg", at: 1.3, move: "left", focus: "50% 50%" },
    { src: "evidence/cyclops/ship.jpg", at: 3.36, move: "in", focus: "40% 50%", zoom: 1.4 },
    { src: "evidence/cyclops/merrimac.jpg", at: 4.6, move: "right", focus: "50% 50%" },
    { src: "evidence/cyclops/map.jpg", at: 5.96, move: "in", focus: "50% 50%" },
    { src: "evidence/cyclops/nereus.jpg", at: 7.56, move: "in", focus: "50% 50%" },
    { src: "evidence/cyclops/map1950.jpg", at: 8.94, move: "up", focus: "60% 50%" },
    { src: "evidence/cyclops/unloading.jpg", at: 10.46, move: "in", focus: "50% 40%" },
    { src: "evidence/cyclops/ore.jpg", at: 11.9, move: "in", focus: "40% 50%" },
    { src: "evidence/cyclops/worley.jpg", at: 13.7, move: "in", focus: "50% 25%" },
    { src: "evidence/cyclops/worley.jpg", at: 15.56, move: "in", focus: "50% 15%", zoom: 1.6 },
    { src: "evidence/cyclops/proteus.jpg", at: 17.0, move: "left", focus: "50% 50%" },
    { src: "evidence/cyclops/map1950.jpg", at: 18.4, move: "in", focus: "70% 30%", zoom: 1.5 },
    { src: "evidence/cyclops/atlanta.jpg", at: 19.9, move: "right", focus: "50% 50%" },
    { src: "evidence/cyclops/waves.jpg", at: 21.54, move: "in", focus: "50% 50%", zoom: 1.3 },
    { src: "evidence/cyclops/ship.jpg", at: 22.9, move: "out", focus: "50% 50%" },
    { src: "evidence/cyclops/worley.jpg", at: 24.38, move: "in", focus: "50% 20%", zoom: 1.3 },
    { src: "evidence/cyclops/ship.jpg", at: 25.6, move: "in", focus: "50% 50%" },
  ],
};
