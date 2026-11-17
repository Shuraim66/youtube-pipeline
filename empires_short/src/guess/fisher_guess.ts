import type { GuessShortProps } from "./types";

/**
 * Aurelis — Irving Fisher, "Guess first" test (experiments/guess_test_2026-10.json). No voiceover.
 * Facts (en.wikipedia "Irving Fisher", "Wall Street crash of 1929"; NYT 16 Oct 1929 as cited there; see src/archival/fisher_v2.ts):
 * said it 15 Oct 1929, NYT ran it 16 Oct; Black Thursday 24 Oct, Black Tuesday 29 Oct; crash cost him much of his wealth and
 * reputation; Schumpeter's "greatest economist". Images and credits: fisher_v2.ts.
 */
/** box: below the countdown row (which ends ~y 1325), so no newspaper text sits behind the question block or any option */
const BANNER = { src: "img/fisher/nyt_banner.jpg", credit: "NEW YORK TIMES · OCT 30, 1929", fit: "contain" as const, box: { top: 1340, height: 250 } };

export const fisherGuess: GuessShortProps = {
  brand: "aurelis",
  compact: true,
  question: ["OCTOBER 1929. A FAMOUS YALE ECONOMIST JUDGED THE STOCK MARKET.", "WHAT DID HE SAY?"],
  evidence: BANNER,
  options: [
    { key: "A", text: "A BUBBLE ABOUT TO BURST" },
    { key: "B", text: "DANGEROUSLY OVERVALUED" },
    { key: "C", text: "A PERMANENTLY HIGH PLATEAU" },
  ],
  correct: "C",
  revealImage: { src: "img/fisher/fisher.jpg", credit: "IRVING FISHER · YALE ECONOMIST", focus: "50% 30%" },
  stamp: "“A PERMANENTLY HIGH PLATEAU.”",
  countdownLabel: "GUESS BEFORE 0",
  cards: [
    { text: "Irving Fisher said it on October 15, 1929. The New York Times ran it the next day.", hl: "October 15, 1929.", img: { src: "img/fisher/fisher2.jpg", credit: "IRVING FISHER · WIDE WORLD PHOTOS", focus: "28% 30%" } },
    { text: "Nine days later, on Black Thursday, the market broke.", hl: "Black Thursday", img: { src: "img/fisher/crowd.jpg", credit: "WALL STREET CROWD · OCT 1929", focus: "50% 40%" } },
    { text: "The crash cost Fisher much of his fortune and his reputation.", hl: "fortune and his reputation.", img: { src: "img/fisher/fisher.jpg", credit: "IRVING FISHER · YALE ECONOMIST", focus: "50% 25%" } },
  ],
  closing: { text: "Schumpeter still called him America's greatest economist.", img: { src: "img/fisher/schumpeter.png", credit: "JOSEPH SCHUMPETER · 1945", focus: "50% 35%" }, byReadingTime: true },
};
