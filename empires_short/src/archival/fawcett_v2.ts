import type { ArchivalShortProps } from "./ArchivalShort";
import { fawcett } from "./fawcett";

/**
 * V2 experiment variant of `fawcett` (same voiceover, captions, images and facts — only the template changes).
 * Hook phase with the date emphasised, fewer stamps, role-driven transitions, and an explicit UNRESOLVED payoff
 * (RGS declared the party lost in Jan 1927; no remains confirmed) instead of the question pill.
 * Facts: see fawcett.ts (en.wikipedia "Percy Fawcett").
 */
export const fawcettV2: ArchivalShortProps = {
  ...fawcett,
  templateVersion: "v2",
  question: undefined,
  v2: {
    hook: { lines: ["“Don't come looking for me.”", "Vanished · 1925"], until: 2.0, emphasis: "1925", top: 900 },
    payoff: { at: 25.72, kind: "unresolved", text: "No remains ever confirmed. Declared lost in 1927.", source: "ROYAL GEOGRAPHICAL SOCIETY" },
  },
  cards: [
    { kind: "stamp", at: 20.06, until: 22.4, text: "5 DAYS" },
    { kind: "stamp", at: 24.34, until: 25.6, text: "NOT HIS" },
  ],
  shots: [
    { src: "evidence/fawcett/face.jpg", at: 0, move: "in", focus: "50% 30%", role: "hook" },
    { src: "evidence/fawcett/kalapalo.jpg", at: 3.32, move: "left", focus: "50% 50%", role: "setup" },
    { src: "evidence/fawcett/face.jpg", at: 6.76, move: "in", focus: "50% 45%", zoom: 1.15, role: "setup" },
    { src: "evidence/fawcett/ms1.jpg", at: 8.8, move: "up", focus: "50% 30%", role: "setup" },
    { src: "evidence/fawcett/glyphs.png", at: 10.48, move: "in", focus: "50% 50%", role: "setup" },
    { src: "evidence/fawcett/ms1.jpg", at: 14.0, move: "in", focus: "50% 40%", zoom: 1.6, role: "conflict" },
    { src: "evidence/fawcett/kalapalo.jpg", at: 16.64, move: "in", focus: "60% 50%", zoom: 1.5, role: "reveal" },
    { src: "evidence/fawcett/glyphs.png", at: 20.06, move: "in", focus: "50% 50%", zoom: 1.6, role: "reveal" },
    { src: "evidence/fawcett/ms1.jpg", at: 22.58, move: "in", focus: "50% 60%", zoom: 1.5, role: "evidence" },
    { src: "evidence/fawcett/face.jpg", at: 25.72, move: "in", focus: "50% 30%", role: "payoff" },
  ],
};
