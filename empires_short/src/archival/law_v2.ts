import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/law/words.json";

/**
 * Aurelis — John Law: duel, death sentence, then France's finance chief, then the Mississippi Bubble. V2-native
 * (scripts_v2/law.json). Hook-test experiment (experiments/hook_test_2026-10.json): arm = MYSTERY.
 * Look "ticker", VO bf_emma atempo 1.0 (same as Whitney / MacGregor / Ward).
 * Facts (en.wikipedia "John Law (economist)" (Buchan), "John Law's Bank", "Mississippi Company";
 * newworldencyclopedia.org; undiscoveredscotland.co.uk): duel 9 Apr 1694, convicted of murder, sentenced to death,
 * escaped 1695; bank 1716; Mississippi Company; Controller-General 5 Jan 1720, richest man in Europe; collapse 1720,
 * run on notes; left France 1720; died Venice 21 Mar 1729, poor.
 * Images: law.jpg Casimir Balthazar portrait (PD), louisiana.jpg Senex map 1721 (PD), biloxi.jpg Law's camp, Biloxi
 * 1720 (PD), tafereel.jpg / madhead.jpg / satire.jpg Dutch 1720 bubble satires (PD), collapse.jpg "Le Diable d'Argent"
 * (PD, Chéreau), note10.jpg 10 livres Banque Royale 1720 (CC BY-SA 4.0, Osama Shukir Muhammed Amin), grave.jpg
 * San Moisè, Venice (CC BY-SA 4.0, Karmakolle). CC credits in the description.
 */
export const lawV2: ArchivalShortProps = {
  look: "ticker",
  lookText: "PARIS · 1720",
  templateVersion: "v2",
  vo: "vo/law/vo.wav",
  words,
  display: {},
  hook: ["A convicted killer", "ran France's money. How?"],
  twistAt: 27.26,
  durationSec: 38.3,
  v2: {
    hook: { lines: ["A convicted killer", "ran France's money. How?"], until: 2.0, emphasis: "How?", top: 760 },
    payoff: {
      at: 34.74, kind: "resolved", style: "hero", kicker: "How it ended",
      text: "Richest man in Europe in 1720. Died poor in Venice, 1729.", source: "JOHN LAW · 1671–1729",
    },
  },
  cards: [
    { kind: "number", at: 22.46, until: 25.64, value: "1720", label: "France's finance minister" },
    { kind: "stamp", at: 28.64, until: 30.3, text: "BUBBLE BURST" },
  ],
  shots: [
    { src: "img/law/law.jpg", at: 0, move: "in", focus: "50% 25%", zoom: 1.2, role: "hook" },
    { src: "img/law/law.jpg", at: 1.46, move: "left", focus: "50% 40%", role: "setup", credit: "JOHN LAW · PORTRAIT BY CASIMIR BALTHAZAR" },
    { src: "img/law/law.jpg", at: 5.22, move: "in", focus: "20% 75%", zoom: 1.5, role: "setup", credit: "JOHN LAW · PORTRAIT BY CASIMIR BALTHAZAR" },
    { src: "img/law/note10.jpg", at: 7.94, move: "left", focus: "50% 50%", role: "conflict", credit: "10-LIVRE NOTE, BANQUE ROYALE · 1720 · CC BY-SA" },
    { src: "img/law/louisiana.jpg", at: 15.34, move: "in", focus: "50% 50%", role: "conflict", credit: "MAP OF LOUISIANA · 1721" },
    { src: "img/law/biloxi.jpg", at: 18.74, move: "left", focus: "40% 50%", role: "conflict", credit: "LAW'S COMPANY CAMP, BILOXI · 1720" },
    { src: "img/law/tafereel.jpg", at: 20.76, move: "up", focus: "50% 25%", role: "evidence", credit: "DUTCH SATIRE OF THE SHARE MANIA · 1720" },
    { src: "img/law/law.jpg", at: 23.86, move: "in", focus: "50% 30%", zoom: 1.3, role: "evidence", credit: "JOHN LAW · PORTRAIT BY CASIMIR BALTHAZAR" },
    { src: "img/law/collapse.jpg", at: 27.26, move: "up", focus: "50% 45%", role: "reveal", credit: "“LE DIABLE D'ARGENT” · SATIRE OF LAW'S COLLAPSE" },
    { src: "img/law/madhead.jpg", at: 29.78, move: "in", focus: "50% 30%", role: "reveal", credit: "“THE ISLAND OF MADHEAD” · DUTCH SATIRE, 1720" },
    { src: "img/law/satire.jpg", at: 32.18, move: "in", focus: "50% 40%", role: "reveal", credit: "DUTCH BUBBLE SATIRE · 1720" },
    { src: "img/law/grave.jpg", at: 34.74, move: "up", focus: "50% 70%", role: "payoff", credit: "HIS GRAVE, SAN MOISÈ, VENICE · CC BY-SA" },
  ],
};
