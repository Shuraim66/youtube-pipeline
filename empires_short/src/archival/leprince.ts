import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/leprince/words.json";

/**
 * Night File — Louis Le Prince (archival montage, brand "nightfile"; QUESTION opener — MH370 was a statement).
 * Obscure, person-led, historical, real unanswered question (Oct 3 2026 Night File research).
 * Facts (Wikipedia, verified Oct 3 2026): b. 1841 Metz; Roundhay Garden Scene shot 14 Oct 1888 in Leeds
 * (20 surviving frames, <2 s) — possibly the first single-lens moving-picture sequence; Leeds Bridge film
 * Oct 1888; planned to travel on to the United States; 16 Sep 1890 last seen by his brother boarding the
 * train at Dijon for Paris; neither he nor his luggage ever found; declared dead 1897. Son Adolphe testified
 * in the 1898 patent case against Edison (for American Mutoscope); found shot dead on Fire Island, NY, 1902.
 * 2003: photo of a man drowned in the Seine in 1890, resembling him, found in Paris police archives (disputed).
 * Images: Wikimedia — PD (portraits, Roundhay + Leeds Bridge frames, Longley camera sketch, Tissandier
 * kinetoscope engraving, L.C. Handy Edison photo, Daguerre Pont Neuf, Oakwood Hall); Leeds Bridge — Immanuel
 * Giel CC0; Dijon station — Benjamin Smith, CC BY-SA 4.0.
 */
export const leprince: ArchivalShortProps = {
  brand: "nightfile",
  vo: "vo/leprince/vo.wav",
  words,
  display: { sin: "SEINE", "12": "TWELVE" },
  hook: ["He made one of the first films.", "Then he vanished."],
  twistAt: 22.7,
  question: { windows: [[16.0, 19.0], [34.2, 37.2]], text: "What happened to him?" },
  durationSec: 37.2,
  cards: [
    { kind: "stamp", at: 6.1, until: 7.6, text: "1888" },
    { kind: "number", at: 9.6, until: 11.6, value: "<2 SEC", label: "of film · Roundhay garden" },
    { kind: "stamp", at: 14.2, until: 15.7, text: "1890" },
    { kind: "stamp", at: 21.9, until: 22.7, text: "NOTHING" },
    { kind: "number", at: 26.3, until: 27.8, value: "1902", label: "his son · found shot dead" },
    { kind: "number", at: 28.5, until: 30.0, value: "2003", label: "police photo found" },
  ],
  shots: [
    { src: "evidence/leprince/portrait2.png", at: 0, move: "in", focus: "50% 25%" },
    { src: "evidence/leprince/portrait.jpg", at: 1.9, move: "out", focus: "50% 30%" },
    { src: "evidence/leprince/dijon.jpg", at: 3.4, move: "in", focus: "50% 50%" },
    { src: "evidence/leprince/portrait2.png", at: 4.9, move: "in", focus: "50% 22%", zoom: 1.4 },
    { src: "evidence/leprince/roundhay.png", at: 6.1, move: "in" },
    { src: "evidence/leprince/oakwood.JPG", at: 7.7, move: "right", focus: "50% 50%" },
    { src: "evidence/leprince/roundhay.png", at: 9.3, move: "out", focus: "30% 50%", zoom: 1.2 },
    { src: "evidence/leprince/leeds1888.png", at: 10.8, move: "left" },
    { src: "evidence/leprince/camera.jpeg", at: 11.8, move: "in" },
    { src: "evidence/leprince/leeds1888.png", at: 13.1, move: "in", focus: "55% 50%", zoom: 1.3 },
    { src: "evidence/leprince/portrait.jpg", at: 14.2, move: "in", focus: "50% 28%" },
    { src: "evidence/leprince/dijon.jpg", at: 15.8, move: "right", focus: "40% 50%" },
    { src: "evidence/leprince/dijon.jpg", at: 17.5, move: "in", focus: "60% 55%", zoom: 1.4 },
    { src: "evidence/leprince/portrait2.png", at: 19.1, move: "out", focus: "50% 25%" },
    { src: "evidence/leprince/camera.jpeg", at: 20.2, move: "out" },
    { src: "evidence/leprince/bridge.jpg", at: 21.0, move: "left", focus: "50% 50%" },
    { src: "evidence/leprince/edison.jpg", at: 22.7, move: "in", focus: "50% 30%" },
    { src: "evidence/leprince/kinetoscope.jpg", at: 24.4, move: "right" },
    { src: "evidence/leprince/edison.jpg", at: 25.5, move: "in", focus: "45% 22%", zoom: 1.5 },
    { src: "evidence/leprince/seine.jpg", at: 27.9, move: "in" },
    { src: "evidence/leprince/seine.jpg", at: 29.6, move: "right", focus: "50% 60%", zoom: 1.3 },
    { src: "evidence/leprince/portrait.jpg", at: 31.0, move: "in", focus: "50% 28%", zoom: 1.2 },
    { src: "evidence/leprince/seine.jpg", at: 32.4, move: "left", focus: "50% 50%" },
    { src: "evidence/leprince/portrait2.png", at: 34.2, move: "in", focus: "50% 25%" },
  ],
};
