import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/macgregor/words.json";

/**
 * Aurelis — Gregor MacGregor and Poyais, the invented nation. V2-native (scripts_v2/macgregor.json).
 * Hook-test experiment (experiments/hook_test_2026-10.json): arm = CONSEQUENCE. Look "ticker" + VO bf_emma atempo 1.0
 * (same as Whitney); "Poyais" spoken as "Poy-ice".
 * Facts (en.wikipedia "Gregor MacGregor" (Sinclair 2004), amusingplanet.com 2025, The Scotsman 11 Dec 2017,
 * undiscoveredscotland.co.uk): Cazique of Poyais from 1821; land certificates + £200,000 loan (Perring, Oct 1822);
 * "Sketch of the Mosquito Shore" guidebook (St Joseph: opera house, cathedral); gold swapped for Poyais notes; Honduras
 * Packet + Kennersley Castle; ~250 emigrants, more than half died; tried in France 1826, acquitted; died Caracas 1845,
 * full military honours.
 * Images (all PD via Wikimedia): sir.jpg "Sir Gregor Macgregor" (engraving), portrait.jpg Raeburn portrait,
 * note.jpg "Bank of Poyais 1 Hard Dollar", cert.jpg "1827 Poyaisian stock certificate", blackriver.jpg engraving from
 * "Sketch of the Mosquito Shore" (the advertised port), fort.jpg "Fort Wellington on the Black River, mid 1840s",
 * bluefields.jpg "Bluefields Mosquito Coast 1845", force.jpg "Cour intérieure de la Force en 1840" (Paris prison, labelled).
 */
export const macgregorV2: ArchivalShortProps = {
  look: "ticker",
  lookText: "LONDON · 1822",
  templateVersion: "v2",
  vo: "vo/macgregor/vo.wav",
  words,
  display: { two: "£200,000", hundred: "", thousand: "", "pounds.": "" },
  hook: ["250 settlers sailed to his country.", "It didn't exist."],
  twistAt: 25.36,
  durationSec: 38.0,
  v2: {
    hook: { lines: ["250 settlers sailed to his country.", "It didn't exist."], until: 2.0, emphasis: "didn't exist", top: 700 },
    payoff: {
      at: 25.36, until: 30.5, kind: "resolved", style: "hero", kicker: "What they found",
      text: "Poyais was invented. More than half of the settlers died.", source: "MOSQUITO COAST, HONDURAS · 1823",
    },
  },
  cards: [
    { kind: "number", at: 10.88, until: 13.84, value: "£200,000", label: "Poyais government loan · 1822" },
  ],
  shots: [
    { src: "img/macgregor/sir.jpg", at: 0, move: "in", focus: "45% 25%", zoom: 1.3, role: "hook" },
    { src: "img/macgregor/portrait.jpg", at: 1.42, move: "left", focus: "50% 30%", role: "setup", credit: "GREGOR MACGREGOR · PORTRAIT BY RAEBURN" },
    { src: "img/macgregor/sir.jpg", at: 4.38, move: "in", focus: "50% 35%", role: "setup", credit: "“SIR” GREGOR MACGREGOR · ENGRAVING" },
    { src: "img/macgregor/note.jpg", at: 9.1, move: "in", focus: "75% 50%", role: "conflict", credit: "BANK OF POYAIS ONE-DOLLAR NOTE · 1820s" },
    { src: "img/macgregor/blackriver.jpg", at: 12.48, move: "left", focus: "45% 50%", role: "evidence", credit: "“PORT OF BLACK RIVER, POYAIS” · FROM HIS GUIDEBOOK, 1822" },
    { src: "img/macgregor/note.jpg", at: 16.14, move: "left", focus: "20% 50%", zoom: 1.3, role: "evidence", credit: "BANK OF POYAIS ONE-DOLLAR NOTE · 1820s" },
    { src: "img/macgregor/fort.jpg", at: 18.48, move: "left", focus: "50% 50%", role: "reveal", credit: "BLACK RIVER, MOSQUITO COAST · 1840s" },
    { src: "img/macgregor/bluefields.jpg", at: 19.94, move: "in", focus: "25% 30%", zoom: 1.6, role: "reveal", credit: "MOSQUITO COAST · SKETCH, 1845" },
    { src: "img/macgregor/blackriver.jpg", at: 25.36, move: "in", focus: "50% 45%", zoom: 1.3, role: "payoff", credit: "THE PORT HIS GUIDEBOOK PROMISED" },
    { src: "img/macgregor/force.jpg", at: 30.66, move: "up", focus: "50% 50%", role: "evidence", credit: "LA FORCE PRISON, PARIS · 1840" },
    { src: "img/macgregor/portrait.jpg", at: 33.52, move: "in", focus: "50% 25%", zoom: 1.3, role: "evidence", credit: "GREGOR MACGREGOR · PORTRAIT BY RAEBURN" },
  ],
};
