import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/livermore/words.json";

/**
 * Aurelis — Jesse Livermore (archival montage; person + money + reversal). Question opener (A/B vs Carnegie's
 * statement opener), conflict + payoff stated in the first 2 s, no logo until the hook docks.
 * Facts (en.wikipedia, verified Oct 4 2026): b. 1877; left home at 14 for a $5/week board-boy job; $500K by 24;
 * 1906 shorted Union Pacific before the SF earthquake; 1907 panic $1M in one day, J.P. Morgan asked him to stop;
 * ~$100M in the 1929 crash; third bankruptcy 1934 with $2.5M debts vs $84K assets.
 * Images (Wikimedia): PD — Livermore c.1923 + 1940 Acme press photo, crowd outside NYSE 1929, NYT 30 Oct 1929,
 * Keppler "Bears on Wall Street", NYSE floor, curb market (Bain), SF in ruin (Lawrence), SF burning (Pillsbury),
 * 1906 earthquake train (G.K. Gilbert), NY pool-room (W.A. Rogers), Edison ticker (NMAH), American Union Bank run,
 * Bank of the United States failure (NYWTS), Knickerbocker Trust, unemployed march. CC BY-SA 3.0 (Soerfm):
 * 1907 panic crop, J.P. Morgan crop.
 */
export const livermore: ArchivalShortProps = {
  vo: "vo/livermore/vo.wav",
  words,
  display: { "84": "$84,000", ",000": "", JP: "J.P." },
  hook: ["Made $100M in a crash.", "Still went broke?"],
  hookTop: 960,
  twistAt: 25.76,
  question: { windows: [[21.4, 24.2], [36.4, 39.6]], text: "Skill or luck?" },
  durationSec: 39.6,
  cards: [
    { kind: "number", at: 5.4, until: 6.4, value: "$5", label: "a week · age 14" },
    { kind: "number", at: 8.3, until: 9.9, value: "$500K", label: "by age 24" },
    { kind: "stamp", at: 10.02, until: 11.3, text: "1906" },
    { kind: "number", at: 16.6, until: 18.4, value: "$1M", label: "in one day · 1907" },
    { kind: "number", at: 24.2, until: 25.7, value: "$100M", label: "betting on the crash · 1929" },
    { kind: "stamp", at: 28.4, until: 29.4, text: "1934" },
    { kind: "number", at: 29.5, until: 31.1, value: "−$2.5M", label: "in debt" },
    { kind: "number", at: 31.3, until: 32.8, value: "$84K", label: "left" },
    { kind: "stamp", at: 32.8, until: 34.1, text: "BANKRUPT ×3" },
  ],
  shots: [
    { src: "img/livermore/port1923.jpg", at: 0, move: "in", focus: "50% 0%", fit: "contain" },
    { src: "img/livermore/crowd29.jpg", at: 1.3, move: "in", focus: "50% 40%" },
    { src: "img/livermore/nyt29.jpg", at: 2.3, move: "up", focus: "50% 15%" },
    { src: "img/livermore/port1923.jpg", at: 3.4, move: "in", focus: "55% 2%", zoom: 1.4 },
    { src: "img/livermore/poolroom.jpg", at: 4.5, move: "right" },
    { src: "img/livermore/ticker.jpg", at: 5.6, move: "in", focus: "50% 35%" },
    { src: "img/livermore/curb.jpg", at: 6.9, move: "left" },
    { src: "img/livermore/nyse.jpg", at: 8.1, move: "in" },
    { src: "img/livermore/port1923.jpg", at: 9.3, move: "out", focus: "55% 0%" },
    { src: "img/livermore/train.jpg", at: 10.0, move: "in" },
    { src: "img/livermore/sfruin.jpg", at: 11.4, move: "right" },
    { src: "img/livermore/sffire.jpg", at: 12.4, move: "left" },
    { src: "img/livermore/sfruin.jpg", at: 13.6, move: "in", focus: "40% 50%", zoom: 1.5 },
    { src: "img/livermore/panic07.jpg", at: 14.9, move: "in" },
    { src: "img/livermore/bears07.jpg", at: 15.9, move: "right" },
    { src: "img/livermore/knick.jpg", at: 17.0, move: "up" },
    { src: "img/livermore/morgan.jpg", at: 18.4, move: "in", focus: "50% 30%" },
    { src: "img/livermore/morgan.jpg", at: 19.6, move: "out", focus: "50% 25%", zoom: 1.4 },
    { src: "img/livermore/panic07.jpg", at: 20.5, move: "left", zoom: 1.3 },
    { src: "img/livermore/crowd29.jpg", at: 21.4, move: "up" },
    { src: "img/livermore/nyt29.jpg", at: 22.6, move: "in", focus: "50% 12%", zoom: 1.4 },
    { src: "img/livermore/bankus.jpg", at: 23.6, move: "right" },
    { src: "img/livermore/port1923.jpg", at: 24.6, move: "in", focus: "55% 0%", zoom: 1.25 },
    { src: "img/livermore/port1940.jpg", at: 25.76, move: "in", focus: "50% 35%" },
    { src: "img/livermore/bank.jpg", at: 27.0, move: "left" },
    { src: "img/livermore/unemployed.jpg", at: 28.4, move: "in", focus: "50% 30%" },
    { src: "img/livermore/bankus.jpg", at: 29.5, move: "in", focus: "40% 50%", zoom: 1.3 },
    { src: "img/livermore/port1940.jpg", at: 31.1, move: "in", focus: "50% 30%", zoom: 1.5 },
    { src: "img/livermore/crowd29.jpg", at: 32.8, move: "out" },
    { src: "img/livermore/port1940.jpg", at: 34.1, move: "in", focus: "50% 35%" },
    { src: "img/livermore/port1923.jpg", at: 35.5, move: "out", focus: "55% 0%" },
    { src: "img/livermore/port1940.jpg", at: 36.5, move: "in", focus: "50% 35%", zoom: 1.2 },
  ],
};
