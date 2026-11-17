import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/bierce/words.json";

/**
 * Night File — Ambrose Bierce (full-bleed archival, look "vhs" — Arnold was "film"; QUESTION opener; ~26 s;
 * twist = his last letter at ~14.7 s). Facts (en.wikipedia, verified Oct 6 2026): Civil War veteran; author of
 * "An Occurrence at Owl Creek Bridge" / The Devil's Dictionary; aged 71, crossed into Mexico Dec 1913 during the
 * revolution; rode with Villa's army as an observer; last letter from Chihuahua dated Dec 26 1913: "As to me, I
 * leave here tomorrow for an unknown destination." Never heard from again; theories: firing squad, or a planned exit.
 * Images (Wikimedia): PD — Bierce portraits (Partington; 1892; c.1866), Owl Creek 1891 printing, Thulstrup
 * "Battle of Shiloh", Villa portraits (D.W. Hoffman; 1910; Bain), Villa and staff, Obregón/Villa/Pershing 1914,
 * Villa before a firing squad, LOC Juárez + insurrectos. CC BY-SA 3.0: Villa statue, Chihuahua — Lyricmac.
 */
export const bierce: ArchivalShortProps = {
  brand: "nightfile",
  look: "vhs",
  lookText: "CHIHUAHUA · DEC 26 1913",
  vo: "vo/bierce/vo.wav",
  words,
  display: { "71": "71" },
  hook: ["He rode into a war at 71.", "Then vanished?"],
  hookTop: 960,
  twistAt: 14.74,
  question: { windows: [[20.4, 22.1], [22.2, 26.0]], text: "Shot, or planned it?" },
  durationSec: 26.0,
  cards: [
    { kind: "stamp", at: 2.48, until: 3.3, text: "AGE 71" },
    { kind: "stamp", at: 8.62, until: 9.6, text: "1913" },
    { kind: "quote", at: 16.54, until: 20.3, text: "“I leave here tomorrow for an unknown destination.”", source: "— BIERCE, LAST LETTER, DEC 26 1913" },
    { kind: "stamp", at: 20.42, until: 22.1, text: "NEVER FOUND" },
  ],
  shots: [
    { src: "evidence/bierce/abierce.jpg", at: 0, move: "in", focus: "50% 0%", fit: "contain" },
    { src: "evidence/bierce/staff.jpg", at: 1.3, move: "in", focus: "50% 50%" },
    { src: "evidence/bierce/juarez.jpg", at: 2.5, move: "up", focus: "40% 50%" },
    { src: "evidence/bierce/port1892.jpg", at: 4.32, move: "in", focus: "50% 20%" },
    { src: "evidence/bierce/shiloh.jpg", at: 5.14, move: "left", focus: "50% 50%" },
    { src: "evidence/bierce/owl.jpg", at: 6.44, move: "up", focus: "50% 30%" },
    { src: "evidence/bierce/port.jpg", at: 7.3, move: "in", focus: "50% 30%" },
    { src: "evidence/bierce/insurrectos.jpg", at: 8.48, move: "right", focus: "50% 50%" },
    { src: "evidence/bierce/juarez.jpg", at: 9.64, move: "in", focus: "50% 50%", zoom: 1.3 },
    { src: "evidence/bierce/ftbliss.jpg", at: 10.66, move: "left", focus: "50% 40%" },
    { src: "evidence/bierce/villa.jpg", at: 12.52, move: "in", focus: "50% 25%" },
    { src: "evidence/bierce/bandolier.jpg", at: 13.56, move: "in", focus: "50% 35%" },
    { src: "evidence/bierce/port1892.jpg", at: 14.74, move: "in", focus: "50% 25%", zoom: 1.5 },
    { src: "evidence/bierce/chihuahua.jpg", at: 16.54, move: "up", focus: "50% 50%" },
    { src: "evidence/bierce/staff.jpg", at: 18.3, move: "right", focus: "50% 50%", zoom: 1.3 },
    { src: "evidence/bierce/port.jpg", at: 20.42, move: "in", focus: "50% 20%", zoom: 1.3 },
    { src: "evidence/bierce/firing.jpg", at: 22.2, move: "in", focus: "50% 50%" },
    { src: "evidence/bierce/abierce.jpg", at: 24.1, move: "in", focus: "50% 0%", fit: "contain" },
  ],
};
