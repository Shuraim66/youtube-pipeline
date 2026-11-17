import type { GuessShortProps } from "./types";

/**
 * Aurelis — Ferdinand Ward, "Guess first" test (experiments/guess_test_2026-10.json). No voiceover.
 * Facts (en.wikipedia "Ferdinand Ward", "Personal Memoirs of U. S. Grant"; see src/archival/ward_v2.ts): firm 1880 with Buck Grant;
 * ex-President invested; 2-3% a month; claimed government-contract access; a Ponzi scheme; collapsed May 1884, Grant ruined;
 * Ward ten years (Sing Sing); memoirs earned his widow ~$450,000. Images and credits: ward_v2.ts.
 */
export const wardGuess: GuessShortProps = {
  brand: "aurelis",
  compact: true,
  question: ["A BROKER PAID INVESTORS 2–3% A MONTH.", "WHERE DID THE MONEY COME FROM?"],
  evidence: { src: "img/ward/panic.jpg", credit: "WALL STREET · HARPER'S WEEKLY, 1884", focus: "40% 50%" },
  options: [
    { key: "A", text: "NEW INVESTORS' MONEY" },
    { key: "B", text: "GOVERNMENT CONTRACTS" },
    { key: "C", text: "RAILROAD STOCKS" },
  ],
  correct: "A",
  revealImage: { src: "img/ward/ward.jpg", credit: "FERDINAND WARD · LITHOGRAPH", focus: "50% 35%" },
  stamp: "NEW INVESTORS' MONEY.",
  countdownLabel: "GUESS BEFORE 0",
  cards: [
    { text: "1880: Ferdinand Ward partnered with Ulysses S. Grant's son. Grant invested too.", hl: "Grant invested too.", img: { src: "img/ward/grant.jpg", credit: "ULYSSES S. GRANT · c.1870", focus: "50% 40%" } },
    { text: "Ward claimed inside access to government contracts.", hl: "inside access", img: { src: "img/ward/ward.jpg", credit: "FERDINAND WARD · LITHOGRAPH", focus: "50% 45%" } },
    { text: "May 1884: the firm collapsed. Grant was ruined.", hl: "Grant was ruined.", img: { src: "img/ward/panic.jpg", credit: "PANIC OF 1884 · HARPER'S WEEKLY", focus: "60% 60%" } },
    { text: "Ward got ten years in Sing Sing.", hl: "ten years", img: { src: "img/ward/singsing.jpg", credit: "SING SING · LATER PHOTO, NOT WARD", focus: "25% 50%" } },
  ],
  closing: { text: "Grant's memoirs later earned his widow about $450,000.", img: { src: "img/ward/memoirs.jpg", credit: "THE MEMOIRS · CC BY-SA 3.0", focus: "50% 50%" }, byReadingTime: true },
};
