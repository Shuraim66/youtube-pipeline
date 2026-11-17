import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/ward/words.json";

/**
 * Aurelis — Ferdinand Ward, the broker who bankrupted Ulysses S. Grant (Grant & Ward, 1884). V2-native
 * (scripts_v2/ward.json). Hook-test experiment (experiments/hook_test_2026-10.json): arm = MYSTERY.
 * Look "ticker", VO bf_emma atempo 1.0 (same as Whitney / MacGregor).
 * Facts (en.wikipedia "Ferdinand Ward" + "Personal Memoirs of U. S. Grant", historynet.com "The Sword and the Pen",
 * biography.com, essentialcivilwarcurriculum.com): firm 1880 with Buck Grant; ex-President invested $100,000; 2-3% a
 * month; claimed government-contract access; Ponzi; collapsed May 1884; Grant ruined, throat cancer that fall; Ward ten
 * years (Sing Sing); memoir finished 18 Jul 1885, died 5 days later; Julia received ~$450,000.
 * Images: grant.jpg Brady c.1870 (PD), ward.jpg 1894 lithograph (PD), panic.jpg Harper's Weekly May 1884 (PD),
 * grant1885.jpg / lastphoto.jpg (PD), cottage.jpg Grant Cottage (PD per uploader), memoirs.jpg (CC BY-SA 3.0,
 * BrokenSphere — credit in description), singsing.jpg "Sing Sing (prison) with warden" (PD, later photo, labelled).
 */
export const wardV2: ArchivalShortProps = {
  look: "ticker",
  lookText: "WALL ST · 1884",
  templateVersion: "v2",
  vo: "vo/ward/vo.wav",
  words,
  display: { four: "$450,000", hundred: "", and: "", fifty: "", thousand: "", "dollars.": "" },
  hook: ["How did one broker", "bankrupt Ulysses S. Grant?"],
  twistAt: 28.7,
  durationSec: 35.0,
  v2: {
    hook: { lines: ["How did one broker", "bankrupt Ulysses S. Grant?"], until: 2.0, emphasis: "Ulysses S. Grant", top: 640 },
    payoff: {
      at: 28.7, kind: "resolved", style: "hero", kicker: "Grant's last book · 1885",
      text: "Finished 5 days before he died. It earned his widow about $450,000.", source: "PERSONAL MEMOIRS OF U. S. GRANT",
    },
  },
  cards: [
    { kind: "number", at: 9.1, until: 12.5, value: "2–3%", label: "promised a month" },
    { kind: "stamp", at: 13.72, until: 16.4, text: "PONZI" },
  ],
  shots: [
    { src: "img/ward/grant.jpg", at: 0, move: "in", focus: "50% 35%", role: "hook" },
    { src: "img/ward/ward.jpg", at: 0.98, move: "in", focus: "50% 35%", role: "setup", credit: "FERDINAND WARD · LITHOGRAPH" },
    { src: "img/ward/grant.jpg", at: 4.16, move: "left", focus: "50% 40%", zoom: 1.2, role: "setup", credit: "ULYSSES S. GRANT · c.1870" },
    { src: "img/ward/panic.jpg", at: 7.8, move: "left", focus: "40% 50%", role: "conflict", credit: "WALL STREET · HARPER'S WEEKLY, 1884" },
    { src: "img/ward/ward.jpg", at: 10.78, move: "up", focus: "50% 45%", zoom: 1.3, role: "conflict", credit: "FERDINAND WARD · LITHOGRAPH" },
    { src: "img/ward/panic.jpg", at: 16.48, move: "in", focus: "60% 60%", zoom: 1.5, role: "reveal", credit: "PANIC OF 1884 · HARPER'S WEEKLY" },
    { src: "img/ward/grant1885.jpg", at: 18.9, move: "in", focus: "50% 40%", role: "reveal", credit: "GRANT · 1885" },
    { src: "img/ward/singsing.jpg", at: 22.86, move: "left", focus: "25% 50%", zoom: 1.4, role: "evidence", credit: "SING SING · LATER PHOTO, NOT WARD" },
    { src: "img/ward/lastphoto.jpg", at: 25.32, move: "in", focus: "55% 45%", role: "evidence", credit: "GRANT WRITING · SUMMER 1885" },
    { src: "img/ward/memoirs.jpg", at: 28.7, move: "up", focus: "50% 50%", role: "payoff", credit: "THE MEMOIRS · CC BY-SA 3.0" },
    { src: "img/ward/cottage.jpg", at: 31.1, move: "left", focus: "40% 50%", role: "evidence", credit: "GRANT COTTAGE, WHERE HE DIED" },
  ],
};
