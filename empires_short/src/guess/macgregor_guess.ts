import type { GuessShortProps } from "./types";

/**
 * Aurelis — Gregor MacGregor / Poyais, "Guess first" test (experiments/guess_test_2026-10.json). No voiceover.
 * Facts (en.wikipedia "Gregor MacGregor" (Sinclair 2004); Amusing Planet; The Scotsman 11 Dec 2017; see src/archival/macgregor_v2.ts):
 * land certificates + a £200,000 Poyais loan (1822); guidebook with a capital, opera house, cathedral; gold swapped for Poyais
 * notes; ~250 emigrants, more than half died; died Caracas 1845 with full military honours. Images and credits: macgregor_v2.ts.
 */
export const macgregorGuess: GuessShortProps = {
  brand: "aurelis",
  compact: true,
  question: ["250 SETTLERS SAILED TO A COUNTRY SOLD IN LONDON.", "WHAT DID THEY FIND?"],
  evidence: { src: "img/macgregor/note.jpg", credit: "BANK OF POYAIS ONE-DOLLAR NOTE · 1820s", fit: "contain", box: { top: 760, height: 460 } },
  options: [
    { key: "A", text: "A CAPITAL WITH AN OPERA HOUSE" },
    { key: "B", text: "JUNGLE, AND NO COUNTRY" },
    { key: "C", text: "A GOLD RUSH TOWN" },
  ],
  correct: "B",
  revealImage: { src: "img/macgregor/fort.jpg", credit: "BLACK RIVER, MOSQUITO COAST · 1840s", focus: "50% 50%" },
  stamp: "JUNGLE. POYAIS DIDN'T EXIST.",
  countdownLabel: "GUESS BEFORE 0",
  cards: [
    { text: "1822: Gregor MacGregor sold land in Poyais, plus a £200,000 government loan.", hl: "£200,000", img: { src: "img/macgregor/sir.jpg", credit: "“SIR” GREGOR MACGREGOR · ENGRAVING", focus: "50% 35%" } },
    { text: "His guidebook promised a capital with an opera house and a cathedral.", hl: "an opera house and a cathedral.", img: { src: "img/macgregor/blackriver.jpg", credit: "“PORT OF BLACK RIVER, POYAIS” · FROM HIS GUIDEBOOK, 1822", focus: "45% 50%" } },
    { text: "The settlers swapped their gold for Poyais banknotes, then sailed.", hl: "Poyais banknotes", img: { src: "img/macgregor/note.jpg", credit: "BANK OF POYAIS ONE-DOLLAR NOTE · 1820s", focus: "75% 50%" } },
    { text: "More than half of them died.", hl: "More than half", img: { src: "img/macgregor/bluefields.jpg", credit: "MOSQUITO COAST · SKETCH, 1845", focus: "25% 30%" } },
  ],
  closing: { text: "MacGregor died in Caracas in 1845, with full military honours.", img: { src: "img/macgregor/portrait.jpg", credit: "GREGOR MACGREGOR · PORTRAIT BY RAEBURN", focus: "50% 25%" }, byReadingTime: true },
};
