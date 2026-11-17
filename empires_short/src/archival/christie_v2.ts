import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/christie/words.json";

/**
 * Night File — Agatha Christie's 11-day disappearance (Dec 1926). V2-native (scripts_v2/christie.json), round 2 (Gate 2 review):
 * hook no longer reveals the alias (payoff does), headline ≠ spoken first line, credits on every non-hook image,
 * "hero" payoff. Round 3: ending condensed to one spoken line naming the three disputed explanations (no extra card). Round-1 render kept in out/gate2_r1/.
 * Look "vhs" (Fawcett was film). VO atempo 1.05 (2.8 w/s).
 * Facts (en.wikipedia "Agatha Christie" §1926, cross-checked aetv.com, sundaypost.com, the-line-up.com): vanished 3 Dec 1926;
 * Morris Cowley found next morning at Newlands Corner above a chalk quarry, expired licence + clothes inside; >1,000 police,
 * 15,000 volunteers; found 14 Dec at the Swan Hydropathic Hotel, Harrogate, registered "Mrs Tressa/Teresa Neele" (first name
 * varies → only "Mrs Neele"); Archie loved Nancy Neele. DISPUTED: two doctors — genuine memory loss; Jared Cade — planned;
 * biographer Laura Thompson — breakdown.
 * Images: young.jpg "Agatha Christie as a young woman" (PD) → young_face.jpg; hydro.jpg "Christie at Hydro" 1926 newspaper (PD);
 * cowley.jpg "1926 Morris Bullnose Cowley RW6677" (CC BY 2.0 — same model, NOT her car; labelled on screen);
 * newlands.jpg "Newlands Corner, Surrey - pan SE" (CC BY-SA 3.0, modern); baths.jpg "Royal Baths, Harrogate, England"
 * LCCN2002696783 (PD, c.1900); swan.jpg "OldSwanHotelHarrogate20080807 0183" (CC BY 3.0, modern). CC credits in the description.
 */
export const christieV2: ArchivalShortProps = {
  brand: "nightfile",
  look: "vhs",
  templateVersion: "v2",
  vo: "vo/christie/vo.wav",
  words,
  display: {},
  hook: ["Agatha Christie.", "Missing for 11 days."],
  twistAt: 21.38,
  durationSec: 34.2,
  v2: {
    hook: { lines: ["Agatha Christie.", "Missing for 11 days."], until: 2.0, emphasis: "11 days", top: 880 },
    payoff: {
      at: 21.38, until: 28.9, kind: "resolved", style: "hero", kicker: "Where she was",
      text: "Signed in as “Mrs Neele” — her husband's lover's surname.", source: "SWAN HYDRO, HARROGATE · 14 DEC 1926",
    },
  },
  cards: [
    { kind: "number", at: 13.68, until: 17.3, value: "15,000", label: "volunteers searched" },
  ],
  shots: [
    { src: "img/christie/young_face.jpg", at: 0, move: "in", focus: "45% 35%", role: "hook" },
    { src: "img/christie/young.jpg", at: 2.38, move: "left", focus: "60% 40%", role: "setup", credit: "AGATHA CHRISTIE · EARLY PORTRAIT" },
    { src: "img/christie/cowley.jpg", at: 5.2, move: "left", focus: "35% 75%", zoom: 1.3, role: "setup", credit: "1926 MORRIS COWLEY · SAME MODEL, NOT HER CAR" },
    { src: "img/christie/newlands.jpg", at: 7.76, move: "left", focus: "25% 50%", role: "conflict", credit: "NEWLANDS CORNER, SURREY · MODERN PHOTO" },
    { src: "img/christie/newlands.jpg", at: 10.56, move: "in", focus: "55% 75%", zoom: 1.8, role: "conflict", credit: "NEWLANDS CORNER, SURREY · MODERN PHOTO" },
    { src: "img/christie/newlands.jpg", at: 13.68, move: "left", focus: "85% 50%", zoom: 1.2, role: "evidence", credit: "NEWLANDS CORNER, SURREY · MODERN PHOTO" },
    { src: "img/christie/baths.jpg", at: 17.42, move: "in", focus: "55% 45%", role: "reveal", credit: "HARROGATE, A SPA TOWN · c.1900" },
    { src: "img/christie/swan.jpg", at: 19.6, move: "up", focus: "50% 60%", role: "reveal", credit: "THE SWAN HYDRO (NOW OLD SWAN HOTEL) · MODERN PHOTO" },
    { src: "img/christie/hydro.jpg", at: 21.38, move: "up", focus: "50% 15%", role: "payoff", credit: "NEWSPAPER REPORT · DECEMBER 1926" },
    { src: "img/christie/hydro.jpg", at: 24.04, move: "left", focus: "50% 80%", role: "payoff", credit: "NEWSPAPER REPORT · DECEMBER 1926" },
    { src: "img/christie/young_face.jpg", at: 28.9, move: "in", focus: "45% 35%", zoom: 1.15, role: "evidence", credit: "AGATHA CHRISTIE · EARLY PORTRAIT" },
    { src: "img/christie/hydro.jpg", at: 31.0, move: "in", focus: "50% 33%", zoom: 1.2, role: "evidence", credit: "“HER MEMORY GONE” · NEWSPAPER, DEC 1926" },
  ],
};
