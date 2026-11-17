import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/ladybegood/words.json";

/**
 * Night File — Lady Be Good, the B-24 lost "at sea" in 1943 and found in the Libyan desert in 1958. V2-native
 * (scripts_v2/ladybegood.json). Hook-test experiment (experiments/hook_test_2026-10.json): arm = CONSEQUENCE.
 * Look "vhs", VO am_michael atempo 1.05 (same as Christie); "bailed" spoken as "baled" (Kokoro mispronounced it).
 * Facts (en.wikipedia "Lady Be Good (aircraft)" incl. Barker; migflug.com; pbswisconsin.org; stelzriede.com):
 * lost 4 Apr 1943 returning from Naples, crew's first mission; presumed down in the Mediterranean; BP flight sighted it
 * 9 Nov 1958 ~440 mi inland; overflew Soluch at night and flew ~2 h south; bailed out not knowing they were over land;
 * Toner's diary: eight days, one canteen. Remains imagery deliberately not used.
 * Images (all USAF/US gov PD via Wikimedia): crew.jpg "LADY BE GOOD Crew", formation.jpg 93rd BG B-24Ds c.1943 (NOT this
 * plane; labelled), lowalt.jpg "B-24 Liberators at low altitude" (labelled), naples.jpg "Allied Bombers Smash Naples",
 * wreck.jpg "Lady Be Good Wreckage Discovery" 1958, cockpit/tail/wreck4.jpg "Lady Be Good crash photos 1960",
 * f014.jpg USAF 0000050606-F-1234P-014 (wreck site), inside.jpg "Inside Lady Be Good".
 */
export const ladybegoodV2: ArchivalShortProps = {
  brand: "nightfile",
  look: "vhs",
  templateVersion: "v2",
  vo: "vo/ladybegood/vo.wav",
  words,
  display: {},
  hook: ["Presumed lost at sea.", "Found in the Sahara."],
  twistAt: 25.44,
  durationSec: 34.4,
  v2: {
    hook: { lines: ["Presumed lost at sea.", "Found in the Sahara."], until: 2.0, emphasis: "Sahara", top: 880 },
    payoff: {
      at: 25.44, until: 28.1, kind: "resolved", style: "hero", kicker: "What the diary showed",
      text: "They bailed out not knowing they were over land.", source: "CO-PILOT ROBERT TONER'S DIARY · 1943",
    },
  },
  cards: [
    { kind: "number", at: 15.04, until: 18.1, value: "440 mi", label: "inland · Libyan desert" },
    { kind: "number", at: 29.52, until: 32.9, value: "8 days", label: "one canteen of water" },
  ],
  shots: [
    { src: "img/ladybegood/crew.jpg", at: 0, move: "in", focus: "35% 45%", zoom: 1.5, role: "hook" },
    { src: "img/ladybegood/crew.jpg", at: 2.1, move: "left", focus: "50% 55%", role: "setup", credit: "THE LADY BE GOOD CREW · 1943" },
    { src: "img/ladybegood/formation.jpg", at: 3.8, move: "left", focus: "40% 50%", role: "setup", credit: "B-24D LIBERATORS · SAME TYPE, NOT THIS PLANE" },
    { src: "img/ladybegood/naples.jpg", at: 5.26, move: "in", focus: "50% 50%", role: "conflict", credit: "RAID ON NAPLES · 1943" },
    { src: "img/ladybegood/lowalt.jpg", at: 6.98, move: "left", focus: "75% 55%", role: "conflict", credit: "B-24s · SAME TYPE, NOT THIS PLANE" },
    { src: "img/ladybegood/lowalt.jpg", at: 8.48, move: "up", focus: "20% 25%", zoom: 1.5, role: "conflict", credit: "B-24s · SAME TYPE, NOT THIS PLANE" },
    { src: "img/ladybegood/wreck.jpg", at: 11.56, move: "in", focus: "15% 45%", zoom: 1.4, role: "evidence", credit: "THE WRECK FROM THE AIR · 1958" },
    { src: "img/ladybegood/cockpit.jpg", at: 16.58, move: "in", focus: "40% 50%", role: "reveal", credit: "LADY BE GOOD · FOUND 1958" },
    { src: "img/ladybegood/f014.jpg", at: 19.24, move: "left", focus: "30% 50%", role: "reveal", credit: "THE CRASH SITE · USAF PHOTO" },
    { src: "img/ladybegood/wreck4.jpg", at: 23.18, move: "in", focus: "40% 30%", role: "reveal", credit: "LADY BE GOOD · USAF PHOTO, 1960" },
    { src: "img/ladybegood/tail.jpg", at: 25.44, move: "up", focus: "50% 50%", role: "payoff", credit: "LADY BE GOOD · USAF PHOTO, 1960" },
    { src: "img/ladybegood/inside.jpg", at: 28.16, move: "in", focus: "50% 50%", role: "evidence", credit: "INSIDE THE FUSELAGE · 1960" },
    { src: "img/ladybegood/crew.jpg", at: 31.36, move: "in", focus: "35% 45%", zoom: 1.4, role: "evidence", credit: "THE LADY BE GOOD CREW · 1943" },
  ],
};
