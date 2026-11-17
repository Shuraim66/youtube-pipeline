import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/capone/words.json";

/**
 * Aurelis — Al Capone. Oct 11 test (Kreuger + Earhart learnings): line 1 is a CONTRAST ("never convicted of a single murder…
 * so they got him on taxes"), the name comes second, famous person + little-known detail, ≤30 s, face on frame 0,
 * mid re-hook, spoken closing question = pinned comment. Look "film" (Kreuger was ticker).
 * Facts (en.wikipedia "Al Capone", Oct 11 2026): bought whole Pullman sleeper cars to leave Chicago; Aiello's $50,000 bounty,
 * "at least ten gunmen tried… but ended up dead"; convicted 1931 on tax evasion, judge admitted his own admissions made while
 * negotiating to pay the taxes; sentenced to 11 years; imprisoned at 33.
 * Images (PD): Capone 1930, Alcatraz mugshot, Capone in Florida, 1932 criminal record, NARA soup kitchen 1931.
 */
export const capone: ArchivalShortProps = {
  vo: "vo/capone/vo.wav",
  words,
  display: { $50: "$50,000", ",000": "" },
  hook: ["Never convicted of murder.", "Jailed for taxes."],
  hookTop: 960,
  look: "film",
  twistAt: 14.44,
  question: { windows: [[20.58, 23.3]], text: "Businessman or gangster?" },
  durationSec: 23.3,
  cards: [
    { kind: "number", at: 7.34, until: 9.85, value: "$50,000", label: "bounty on his head" },
    { kind: "number", at: 9.92, until: 12.4, value: "10+", label: "gunmen tried · all dead" },
    { kind: "number", at: 14.44, until: 18.3, value: "1931", label: "convicted · unpaid taxes" },
    { kind: "number", at: 18.46, until: 20.5, value: "11 YRS", label: "locked up at 33" },
  ],
  shots: [
    { src: "img/capone/p1930.jpg", at: 0, move: "in", focus: "50% 20%" },
    { src: "img/capone/florida.jpg", at: 3.42, move: "left", focus: "85% 40%" },
    { src: "img/capone/p1930.jpg", at: 7.34, move: "in", focus: "50% 15%", zoom: 1.3 },
    { src: "img/capone/soup.jpg", at: 9.92, move: "left", focus: "50% 50%" },
    { src: "img/capone/mug.jpg", at: 12.5, move: "in", focus: "50% 25%", zoom: 1.3 },
    { src: "img/capone/record.jpg", at: 14.44, move: "up", focus: "50% 40%" },
    { src: "img/capone/record.jpg", at: 18.46, move: "in", focus: "50% 30%", zoom: 1.3 },
    { src: "img/capone/p1930.jpg", at: 20.58, move: "in", focus: "50% 20%" },
  ],
};
