import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/whitney/words.json";

/**
 * Aurelis — Richard Whitney, "White Knight of Wall Street" → Sing Sing. V2-native (scripts_v2/whitney.json), round 2
 * (Gate 2 review): "saved Wall Street" → "tried to stop the crash" + "the market collapsed anyway"; headline = his press
 * nickname vs. Sing Sing (adds to, not repeats, the narration); more varied 14–29 s; hero payoff; every image labelled.
 * Round-1 render kept in out/gate2_r1/. Look "ticker" (Capone was film). VO atempo 1.0 (2.95 w/s).
 * Facts (en.wikipedia "Richard Whitney (financier)" + "Wall Street Crash of 1929", cross-checked
 * historynet.com/wall-street-embezzler-richard-whitney, SEC Historical Society 1938 report records): Black Thursday
 * 24 Oct 1929 bid $205/share for U.S. Steel above the market for a bankers' group, slide halted that day; collapse on
 * Black Tuesday 29 Oct; "White Knight of Wall Street"; NYSE president 1930–35; embezzled from the NYSE Gratuity Fund, the
 * New York Yacht Club (treasurer), his father-in-law's estate; charged 10 Mar 1938 by D.A. Thomas E. Dewey; pleaded guilty;
 * 5–10 years in Sing Sing.
 * Images (all PD): senate.jpg (LOC LCCN2016871192), crowd2.jpg "Crowd outside nyse" (1929 crash), crowd.jpg "Crowds gathering
 * outside New York Stock Exchange (3)", nyt.jpg NYT front page 30 Oct 1929, nyyc.jpg "New York Yacht Club, 1901" (LOC),
 * dewey.jpg "Thomas E. Dewey by NYT Studios 1937", singsing.jpg "Sing Sing (prison) with warden" (cropped to the cells; the
 * men are not Whitney), cells.jpg "Sing Sing old cell block" (guard tower).
 */
export const whitneyV2: ArchivalShortProps = {
  look: "ticker",
  lookText: "NYSE · 1929",
  templateVersion: "v2",
  vo: "vo/whitney/vo.wav",
  words,
  display: { "205": "$205", dollars: "" },
  hook: ["Wall Street's “White Knight”", "Sing Sing inmate."],
  twistAt: 21.08,
  durationSec: 37.7,
  v2: {
    hook: { lines: ["Wall Street's “White Knight”", "Sing Sing inmate."], until: 2.0, emphasis: "Sing Sing", top: 880 },
    payoff: {
      at: 33.5, kind: "resolved", style: "hero", kicker: "The verdict · 1938",
      text: "Pleaded guilty to embezzlement. 5 to 10 years in Sing Sing.", source: "CHARGED BY D.A. THOMAS E. DEWEY",
    },
  },
  cards: [
    { kind: "number", at: 8.7, until: 12.3, value: "$205", label: "a share · U.S. Steel" },
    { kind: "stamp", at: 23.66, until: 29.9, text: "EMBEZZLED" },
  ],
  shots: [
    { src: "img/whitney/senate.jpg", at: 0, move: "in", focus: "50% 28%", role: "hook" },
    { src: "img/whitney/cells.jpg", at: 3.14, move: "left", focus: "75% 50%", role: "setup", credit: "SING SING PRISON · OSSINING, N.Y." },
    { src: "img/whitney/crowd2.jpg", at: 5.44, move: "up", focus: "50% 40%", role: "setup", credit: "WALL STREET · OCTOBER 1929" },
    { src: "img/whitney/crowd.jpg", at: 8.52, move: "in", focus: "45% 65%", role: "setup", credit: "OUTSIDE THE N.Y. STOCK EXCHANGE · 1929" },
    { src: "img/whitney/crowd2.jpg", at: 12.44, move: "left", focus: "60% 75%", zoom: 1.6, role: "setup", credit: "WALL STREET · OCTOBER 1929" },
    { src: "img/whitney/nyt.jpg", at: 16.08, move: "up", focus: "45% 20%", role: "conflict", credit: "NEW YORK TIMES · 30 OCT 1929 (BLACK TUESDAY)" },
    { src: "img/whitney/senate.jpg", at: 18.74, move: "in", focus: "50% 32%", role: "conflict", credit: "RICHARD WHITNEY · LIBRARY OF CONGRESS" },
    { src: "img/whitney/nyt.jpg", at: 21.08, move: "left", focus: "75% 55%", zoom: 1.8, role: "evidence", credit: "NYT · 30 OCT 1929 · MARKET-WIDE LOSSES" },
    { src: "img/whitney/crowd.jpg", at: 23.66, move: "in", focus: "50% 8%", zoom: 1.2, role: "evidence", credit: "THE N.Y. STOCK EXCHANGE · 1929" },
    { src: "img/whitney/nyyc.jpg", at: 26.18, move: "up", focus: "50% 40%", role: "evidence", credit: "NEW YORK YACHT CLUB · 1901" },
    { src: "img/whitney/dewey.jpg", at: 30.22, move: "in", focus: "50% 30%", role: "reveal", credit: "PROSECUTOR THOMAS E. DEWEY · 1937" },
    { src: "img/whitney/singsing.jpg", at: 33.5, move: "in", focus: "82% 35%", role: "payoff", credit: "SING SING CELL BLOCK · ARCHIVE PHOTO" },
    { src: "img/whitney/cells.jpg", at: 35.4, move: "left", focus: "60% 50%", role: "payoff", credit: "SING SING PRISON · OSSINING, N.Y." },
  ],
};
