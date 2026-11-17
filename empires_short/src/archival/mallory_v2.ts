import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/mallory/words.json";

/**
 * Night File — George Mallory, lost on Everest in 1924, found in 1999. V2-native (scripts_v2/mallory.json).
 * Hook-test experiment (experiments/hook_test_2026-10.json): arm = CONSEQUENCE. Look "vhs", VO am_michael atempo 1.05.
 * Facts (en.wikipedia "George Mallory", "1924 British Mount Everest expedition", "Mallory and Irvine Research Expedition";
 * smithsonianmag.com; npr.org 2024-10-12): set out 8 Jun 1924; Odell saw them high on the ridge before cloud closed;
 * body found 1 May 1999 on the north face; letters in a handkerchief; daughter Clare: photo of Ruth to leave on the summit,
 * not on the body; camera never found; Hillary 1953. Summit question is UNRESOLVED. No body imagery.
 * Images: mallory1915.jpg (PD), irvine.jpg (PD), ruth.jpg (PD), team.jpg 1921 expedition (PD, Nationaal Archief),
 * northface.jpg (CC BY-SA 3.0 Carsten.nebel), steps.jpg (CC BY 2.0 Gunther Hagleitner, annotated), rongbuk.jpg
 * (CC BY-SA 3.0 Csearl), rombok.jpg (CC BY-SA 3.0 John Hill), kodak.jpg Vest Pocket Kodak (CC BY-SA 3.0 Berthold Werner;
 * same model, not theirs). CC credits in the description.
 */
export const malloryV2: ArchivalShortProps = {
  brand: "nightfile",
  look: "vhs",
  templateVersion: "v2",
  vo: "vo/mallory/vo.wav",
  words,
  display: {},
  hook: ["Lost on Everest in 1924.", "Found 75 years later."],
  twistAt: 23.02,
  durationSec: 32.4,
  v2: {
    hook: { lines: ["Lost on Everest in 1924.", "Found 75 years later."], until: 2.0, emphasis: "75 years later", top: 760 },
    payoff: {
      at: 23.02, until: 27.5, kind: "unresolved", style: "hero", kicker: "What was missing",
      text: "The photo of Ruth he meant to leave on the summit wasn't on him.", source: "HIS DAUGHTER CLARE · SUNDAY MIRROR, 1999",
    },
  },
  cards: [
    { kind: "number", at: 11.48, until: 14.4, value: "75 years", label: "1924 → 1999" },
  ],
  shots: [
    { src: "img/mallory/mallory1915.jpg", at: 0, move: "in", focus: "50% 35%", role: "hook" },
    { src: "img/mallory/irvine.jpg", at: 2.84, move: "in", focus: "50% 35%", role: "setup", credit: "ANDREW “SANDY” IRVINE" },
    { src: "img/mallory/rombok.jpg", at: 4.1, move: "up", focus: "50% 25%", role: "setup", credit: "EVEREST FROM RONGBUK · MODERN, CC BY-SA" },
    { src: "img/mallory/steps.jpg", at: 5.48, move: "in", focus: "75% 30%", zoom: 1.4, role: "conflict", credit: "THE NORTHEAST RIDGE · MODERN, CC BY" },
    { src: "img/mallory/northface.jpg", at: 8.68, move: "up", focus: "50% 30%", role: "conflict", credit: "EVEREST NORTH FACE · MODERN, CC BY-SA" },
    { src: "img/mallory/rongbuk.jpg", at: 11.48, move: "left", focus: "50% 40%", role: "evidence", credit: "RONGBUK VALLEY, BELOW THE NORTH FACE · MODERN, CC BY-SA" },
    { src: "img/mallory/team.jpg", at: 15.56, move: "left", focus: "55% 45%", role: "evidence", credit: "MALLORY (CENTRE) · EVEREST EXPEDITION, 1921" },
    { src: "img/mallory/ruth.jpg", at: 18.76, move: "in", focus: "50% 35%", role: "reveal", credit: "RUTH MALLORY" },
    { src: "img/mallory/ruth.jpg", at: 23.02, move: "in", focus: "50% 30%", zoom: 1.3, role: "payoff", credit: "RUTH MALLORY" },
    { src: "img/mallory/kodak.jpg", at: 24.24, move: "in", focus: "50% 50%", role: "payoff", credit: "VEST POCKET KODAK · SAME MODEL, CC BY-SA" },
    { src: "img/mallory/northface.jpg", at: 27.6, move: "in", focus: "50% 20%", zoom: 1.5, role: "evidence", credit: "EVEREST SUMMIT · MODERN, CC BY-SA" },
    { src: "img/mallory/mallory1915.jpg", at: 30.8, move: "in", focus: "50% 35%", zoom: 1.2, role: "evidence", credit: "GEORGE MALLORY" },
  ],
};
