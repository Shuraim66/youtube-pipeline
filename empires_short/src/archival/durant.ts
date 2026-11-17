import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/durant/words.json";

/**
 * Aurelis — William C. Durant (archival montage; person + money + reversal). Oct 5 2026 rules applied:
 * QUESTION opener, full-bleed face on frame 0, twist ("lost it. Twice.") at 10.5 s, one setup beat only.
 * Facts (en.wikipedia, verified Oct 5 2026): Durant-Dort Carriage Co. (1886) grew $2,000 → $2M, largest US
 * horse-drawn vehicle maker by 1890; founded GM Sept 16 1908; lost control 1910 (bankers); regained it by 1916
 * via Chevrolet; ousted again 1920; Durant Motors failed 1933; bankrupt 1936; ran a bowling alley in Flint.
 * Images (Wikimedia): PD — Durant portrait + 1909 newspaper photo, 1904 Buick, Louis Chevrolet in a Buick c.1900,
 * 1913 Chevrolet bowtie, Tarrytown plant postcard, 1927 Chevrolet ad, Durant Motors share certificate,
 * Saginaw St Flint postcard, 1908 bowling alley (Lewis Hine), 1894 bowling lithograph (H. Schile); reused PD
 * 1929–33 crowd / bank-run / unemployed photos. CC: carriage factory — Andrew Jameson (BY-SA 3.0); road cart —
 * Michael Barera (BY-SA 4.0); 1923 Durant A-22 — Greg Gjerdingen (BY 2.0).
 */
export const durant: ArchivalShortProps = {
  vo: "vo/durant/vo.wav",
  words,
  display: { $2: "$2,000", ",000": "", GM: "G.M." },
  hook: ["He founded GM.", "Ended up at a bowling alley?"],
  hookTop: 900,
  twistAt: 10.46,
  question: { windows: [[18.1, 20.2], [26.9, 29.4]], text: "Genius or gambler?" },
  durationSec: 29.4,
  cards: [
    { kind: "number", at: 4.82, until: 5.9, value: "$2,000", label: "starting money" },
    { kind: "number", at: 6.2, until: 7.9, value: "$2M", label: "carriage empire" },
    { kind: "stamp", at: 8.48, until: 9.9, text: "1908 · GM" },
    { kind: "stamp", at: 10.46, until: 12.0, text: "LOST IT ×2" },
    { kind: "stamp", at: 16.96, until: 18.0, text: "1920" },
    { kind: "stamp", at: 22.38, until: 23.4, text: "BANKRUPT" },
  ],
  shots: [
    { src: "img/durant/port.jpg", at: 0, move: "in", focus: "50% 0%", fit: "contain" },
    { src: "img/durant/bowling1908.jpg", at: 1.3, move: "in" },
    { src: "img/durant/bowling1894.jpg", at: 2.5, move: "up", focus: "50% 40%" },
    { src: "img/durant/port.jpg", at: 3.7, move: "in", focus: "50% 20%", zoom: 1.3 },
    { src: "img/durant/cart.jpg", at: 4.8, move: "right" },
    { src: "img/durant/carriage.jpg", at: 5.9, move: "left" },
    { src: "img/durant/flint.jpg", at: 7.0, move: "in" },
    { src: "img/durant/buick1904.jpg", at: 8.3, move: "in" },
    { src: "img/durant/port1909.jpg", at: 9.4, move: "in", focus: "50% 30%" },
    { src: "img/durant/port.jpg", at: 10.46, move: "in", focus: "50% 22%", zoom: 1.5 },
    { src: "img/durant/durantmotors.jpg", at: 12.1, move: "right" },
    { src: "img/durant/louis.jpg", at: 13.2, move: "in", focus: "40% 40%" },
    { src: "img/durant/chevlogo.jpg", at: 14.24, move: "in" },
    { src: "img/durant/chevplant.jpg", at: 15.4, move: "left" },
    { src: "img/durant/capitol.jpg", at: 16.3, move: "up", focus: "50% 40%" },
    { src: "img/durant/durantcar.jpg", at: 17.2, move: "right" },
    { src: "img/livermore/crowd29.jpg", at: 18.1, move: "in" },
    { src: "img/livermore/bank.jpg", at: 19.2, move: "left" },
    { src: "img/livermore/unemployed.jpg", at: 20.2, move: "in", focus: "50% 30%" },
    { src: "img/durant/port.jpg", at: 21.3, move: "out", focus: "50% 15%", zoom: 1.2 },
    { src: "img/durant/durantmotors.jpg", at: 22.4, move: "in", focus: "50% 30%", zoom: 1.4 },
    { src: "img/durant/flint.jpg", at: 23.44, move: "right" },
    { src: "img/durant/bowling1908.jpg", at: 25.0, move: "in", focus: "50% 50%", zoom: 1.2 },
    { src: "img/durant/bowling1894.jpg", at: 26.0, move: "out" },
    { src: "img/durant/port.jpg", at: 26.9, move: "in", focus: "50% 0%", fit: "contain" },
  ],
};
