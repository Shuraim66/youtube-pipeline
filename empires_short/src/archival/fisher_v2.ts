import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/fisher/words.json";

/**
 * Aurelis — Irving Fisher's "permanently high plateau", nine days before the 1929 crash.
 * V2-native (scripts_v2/fisher.json). V3 batch (V3_BATCH_BRIEF.md §3.4): arm L, spoken hook first, evidence on frame 0.
 * Look "ticker", VO bf_emma atempo 1.0.
 * Facts (en.wikipedia "Irving Fisher", "Wall Street crash of 1929"; NYT 16 Oct 1929 p. 8 as cited there): said it 15 Oct
 * 1929, NYT ran it 16 Oct; Yale; sold his index filing system (1925, Kardex Rand); crash cost much of his wealth and
 * reputation; Schumpeter's "greatest economist"; Black Thursday 24 Oct, Black Tuesday 29 Oct. No dollar loss figure.
 * Images (licences read via the en.wikipedia API):
 *  nyt.jpg     "19291030 Crash of '29 - New York Times.jpg" PD (NYT work for hire, 1929; US PD since 2025) —
 *              SUBSTITUTE for the Brooklyn Daily Eagle 24 Oct page (not reachable); the hook crops to the headline
 *  nyt_banner.jpg = nyt.jpg cropped to the main banner headline (ffmpeg), hook + end shot
 *  crowd.jpg   "Crowd outside nyse.jpg" PD (US gov) — crowd on Wall Street after the crash
 *  fisher2.jpg "Irving Fisher, 1867-1947 (cropped).jpg" PD (Wide World Photos)
 *  fisher.jpg  "Irvingfisher.jpg" PD (Bain News Service) — SUBSTITUTE for the index-card / Kardex shot (none reachable)
 *  schumpeter.png "Joseph Schumpeter 1945 Bachrach portrait.png" PD
 */
export const fisherV2: ArchivalShortProps = {
  look: "ticker",
  lookText: "WALL ST · OCT 1929",
  templateVersion: "v2",
  vo: "vo/fisher/vo.wav",
  words,
  display: {},
  hook: ["OCT 15: \"PERMANENT.\"", "OCT 24: CRASH."],
  twistAt: 24.6,
  durationSec: 34.9,
  v2: {
    hook: {
      lines: ["OCT 15: \"PERMANENT.\"", "OCT 24: CRASH."], until: 2.8, emphasis: "OCT 24: CRASH.", top: 700,
      shot: { src: "img/fisher/nyt_banner.jpg", at: 0, move: "out", fit: "contain", focus: "50% 22%", zoom: 0.88, role: "hook", credit: "NEW YORK TIMES · OCT 30, 1929" },
    },
    payoff: {
      at: 24.6, kind: "explanation", style: "hero", kicker: "THE IRONY",
      text: "The crash cost Fisher much of his fortune. Schumpeter still called him America's greatest economist.", source: "J. SCHUMPETER, VIA WIKIPEDIA \"IRVING FISHER\"",
    },
  },
  cards: [
    { kind: "quote", at: 5.46, until: 7.4, text: "what looks like a permanently high plateau", source: "IRVING FISHER · NYT, OCT 16, 1929" },
    { kind: "number", at: 18.76, until: 21.8, value: "9 days", label: "from \"permanently high\" to Black Thursday" },
  ],
  shots: [
    { src: "img/fisher/crowd.jpg", at: 2.8, move: "up", focus: "50% 40%", role: "setup", credit: "WALL STREET CROWD · OCT 1929" },
    { src: "img/fisher/fisher.jpg", at: 7.44, move: "in", focus: "50% 30%", role: "setup", credit: "IRVING FISHER · YALE ECONOMIST" },
    { src: "img/fisher/fisher2.jpg", at: 10.2, move: "in", focus: "28% 30%", role: "setup", credit: "IRVING FISHER · WIDE WORLD PHOTOS" },
    { src: "img/fisher/crowd.jpg", at: 13.4, move: "left", focus: "50% 20%", zoom: 1.2, role: "evidence", credit: "WALL STREET · OCT 1929" },
    { src: "img/fisher/crowd.jpg", at: 18.62, move: "in", focus: "50% 60%", zoom: 1.4, role: "conflict", credit: "WALL STREET · OCT 1929" },
    { src: "img/fisher/nyt.jpg", at: 21.9, move: "up", focus: "60% 30%", role: "reveal", credit: "NYT · OCT 30, 1929, AFTER BLACK TUESDAY" },
    { src: "img/fisher/fisher.jpg", at: 24.6, move: "in", focus: "50% 25%", zoom: 1.2, role: "payoff", credit: "IRVING FISHER" },
    { src: "img/fisher/schumpeter.png", at: 30.18, move: "in", focus: "50% 35%", role: "payoff", credit: "JOSEPH SCHUMPETER · 1945" },
    { src: "img/fisher/nyt_banner.jpg", at: 32.64, move: "out", fit: "contain", focus: "50% 22%", zoom: 0.88, role: "payoff", credit: "NEW YORK TIMES · OCT 30, 1929" },
  ],
};
