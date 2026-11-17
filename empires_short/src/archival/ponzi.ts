import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/ponzi/words.json";

/**
 * Aurelis — Charles Ponzi. Oct 9 test: SLOWER shots (~3–4 s, motion inside each), mid re-hook at ~45%
 * ("But that's not the strangest part."), concrete details only, face on frame 0, complete-sentence verbal loop
 * ("Long before all that," → "Charles Ponzi arrived in America with $2.50."). Look "film" (Hetty was ticker).
 * Facts (en.wikipedia, verified Oct 9 2026): arrived Boston 1903 with $2.50; 1920 promised 50% in 45 days via
 * international reply coupons; approaching $1M/day by July 1920; ~15,000 investors incl. ~75% of Boston's police;
 * 160 million coupons would have been needed vs ~27,000 in circulation; collapsed Aug 1920; died 1949 in a Rio
 * charity ward with $75.
 * Images (Wikimedia, PD): Ponzi portraits (Boston Library/NYT; 1920), "Don't Be Ponzied" (Washington Mutual),
 * British international reply coupon, Boston Post 1919 front page, Boston Post building (Moses King).
 */
export const ponzi: ArchivalShortProps = {
  vo: "vo/ponzi/vo.wav",
  words,
  display: { $2: "$2.50", ".50.": "", "%": "", "50": "50%", "15": "15,000", ",000": "", ",000,": "", "27": "27,000", "-quarters": "QUARTERS" },
  hook: ["Arrived with $2.50.", "Made $1M a day."],
  hookTop: 960,
  look: "film",
  twistAt: 14.88,
  question: { windows: [[21.86, 23.7], [25.74, 27.9]], text: "Genius or fraud?" },
  durationSec: 27.9,
  cards: [
    { kind: "number", at: 5.36, until: 6.5, value: "$1M", label: "a day · 1920" },
    { kind: "number", at: 7.04, until: 9.6, value: "50%", label: "in 45 days" },
    { kind: "number", at: 9.72, until: 13.1, value: "15,000", label: "investors · incl. Boston police" },
    { kind: "number", at: 17.26, until: 20.3, value: "160M", label: "coupons needed" },
    { kind: "number", at: 20.54, until: 21.8, value: "27,000", label: "actually existed" },
    { kind: "number", at: 25.2, until: 25.74, value: "$75", label: "left at death" },
  ],
  shots: [
    { src: "img/ponzi/p1920.jpg", at: 0, move: "in", focus: "50% 12%" },
    { src: "img/ponzi/port.jpg", at: 3.56, move: "in", focus: "50% 30%" },
    { src: "img/ponzi/coupon.jpg", at: 6.58, move: "left", focus: "50% 50%" },
    { src: "img/ponzi/post.jpg", at: 9.72, move: "up", focus: "50% 30%" },
    { src: "img/ponzi/port.jpg", at: 13.2, move: "in", focus: "50% 22%", zoom: 1.5 },
    { src: "img/ponzi/postbldg.jpg", at: 14.88, move: "up", focus: "50% 50%" },
    { src: "img/ponzi/coupon.jpg", at: 17.26, move: "in", focus: "40% 50%", zoom: 1.5 },
    { src: "img/ponzi/ponzied.jpg", at: 21.86, move: "in", focus: "50% 40%" },
    { src: "img/ponzi/p1920.jpg", at: 23.78, move: "in", focus: "50% 25%", zoom: 1.4 },
    { src: "img/ponzi/p1920.jpg", at: 25.74, move: "in", focus: "50% 12%" },
  ],
};
