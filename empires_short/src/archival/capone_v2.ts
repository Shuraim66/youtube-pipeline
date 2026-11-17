import type { ArchivalShortProps } from "./ArchivalShort";
import { capone } from "./capone";

/**
 * V2 experiment variant of `capone` (same voiceover, captions, images and facts — only the template changes).
 * Hook phase 0–2 s on the mugshot (face + the consequence), fewer overlays, role-driven transitions,
 * a factual payoff card instead of the question pill. Facts: see capone.ts (en.wikipedia "Al Capone").
 */
export const caponeV2: ArchivalShortProps = {
  ...capone,
  templateVersion: "v2",
  question: undefined,
  v2: {
    hook: {
      lines: ["Never convicted of murder.", "Jailed for taxes."],
      until: 2.0,
      shot: { src: "img/capone/mug_hook.jpg", at: 0, move: "in", focus: "50% 30%" },
      top: 860,
    },
    payoff: { at: 18.46, kind: "resolved", text: "11 years for tax evasion. Never for murder.", source: "CONVICTED 1931" },
  },
  // one number per beat; "1931" and "11 YRS" are carried by the captions + payoff card
  cards: [
    { kind: "number", at: 7.34, until: 9.85, value: "$50,000", label: "bounty on his head" },
    { kind: "number", at: 9.92, until: 12.4, value: "10+", label: "gunmen tried · all dead" },
  ],
  shots: [
    { src: "img/capone/p1930.jpg", at: 0, move: "in", focus: "50% 20%", role: "setup" },
    { src: "img/capone/florida.jpg", at: 3.42, move: "left", focus: "85% 40%", role: "setup" },
    { src: "img/capone/p1930.jpg", at: 7.34, move: "in", focus: "50% 15%", zoom: 1.3, role: "conflict" },
    { src: "img/capone/soup.jpg", at: 9.92, move: "left", focus: "50% 50%", role: "conflict" },
    { src: "img/capone/mug.jpg", at: 12.5, move: "in", focus: "50% 25%", zoom: 1.3, role: "reveal" },
    { src: "img/capone/record.jpg", at: 14.44, move: "up", focus: "50% 40%", role: "evidence" },
    { src: "img/capone/record.jpg", at: 18.46, move: "in", focus: "50% 30%", zoom: 1.3, role: "payoff" },
    { src: "img/capone/p1930.jpg", at: 20.58, move: "in", focus: "50% 20%", role: "payoff" },
  ],
};
