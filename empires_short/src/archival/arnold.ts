import type { ArchivalShortProps } from "./ArchivalShort";
import words from "../../public/vo/arnold/words.json";

/**
 * Night File — Dorothy Arnold (archival, full-bleed; QUESTION opener — Oct 5 2026 A/B winner).
 * Facts (en.wikipedia, verified Oct 5 2026): b. 1885; vanished Dec 12 1910 aged 25, carrying ~$25–30;
 * bought chocolates (Park & Tilford) and a book (Brentano's); told friend Gladys King she'd walk through Central
 * Park; last seen near Fifth Ave & 27th St; family delayed the police report ~a month, hiring private
 * investigators first; father spent ~$250,000 searching; never found.
 * Images (Wikimedia): PD — Arnold portrait (Library of Congress), Fifth Avenue 1905, "Christmas on Fifth Avenue"
 * (Alice Barber Stephens, 1896), Stieglitz "Flatiron" 1903, Flatiron c.1903, Social Register 1920,
 * King's 1893 bird's-eye view of Fifth Ave, Central Park 1862 (Victor Prevost). CC BY 2.0: Central Park mall 1901
 * (…trialsanderrors).
 */
export const arnold: ArchivalShortProps = {
  brand: "nightfile",
  vo: "vo/arnold/vo.wav",
  words,
  display: { "5th": "FIFTH", "25,": "25," },
  hook: ["Rich man's daughter.", "Vanished in broad daylight?"],
  hookTop: 960,
  twistAt: 15.88,
  question: { windows: [[19.5, 21.9], [28.4, 31.2]], text: "Ran away or taken?" },
  durationSec: 31.2,
  cards: [
    { kind: "stamp", at: 4.14, until: 5.7, text: "DEC 12, 1910" },
    { kind: "number", at: 8.04, until: 9.6, value: "$30", label: "in her purse" },
    { kind: "stamp", at: 17.88, until: 19.4, text: "NO POLICE" },
    { kind: "number", at: 23.74, until: 25.8, value: "$250,000", label: "spent searching" },
    { kind: "stamp", at: 26.84, until: 28.3, text: "NO TRACE" },
  ],
  shots: [
    { src: "evidence/arnold/port.jpg", at: 0, move: "in", focus: "50% 0%", fit: "contain" },
    { src: "evidence/arnold/fifth1905.jpg", at: 1.4, move: "in", focus: "50% 50%" },
    { src: "evidence/arnold/flatiron.jpg", at: 2.6, move: "up", focus: "50% 40%" },
    { src: "evidence/arnold/xmas.jpg", at: 4.1, move: "in", focus: "50% 40%" },
    { src: "evidence/arnold/port.jpg", at: 5.8, move: "in", focus: "50% 20%", zoom: 1.3 },
    { src: "evidence/arnold/register.jpg", at: 7.3, move: "in", focus: "50% 30%" },
    { src: "evidence/arnold/birdseye.jpg", at: 8.9, move: "left", focus: "50% 50%" },
    { src: "evidence/arnold/fifth1905.jpg", at: 9.84, move: "right", focus: "50% 50%", zoom: 1.3 },
    { src: "evidence/arnold/xmas.jpg", at: 11.0, move: "in", focus: "30% 50%", zoom: 1.3 },
    { src: "evidence/arnold/park1901.jpg", at: 12.1, move: "left", focus: "50% 50%" },
    { src: "evidence/arnold/centralpark1862.jpg", at: 13.3, move: "in", focus: "50% 50%" },
    { src: "evidence/arnold/port.jpg", at: 14.54, move: "out", focus: "50% 15%", zoom: 1.2 },
    { src: "evidence/arnold/port.jpg", at: 15.88, move: "in", focus: "50% 22%", zoom: 1.6 },
    { src: "evidence/arnold/flat1903.jpg", at: 17.1, move: "up", focus: "50% 50%" },
    { src: "evidence/arnold/fifth1905.jpg", at: 18.6, move: "in", focus: "60% 50%", zoom: 1.4 },
    { src: "evidence/arnold/xmas.jpg", at: 19.7, move: "left", focus: "50% 50%", zoom: 1.2 },
    { src: "evidence/arnold/birdseye.jpg", at: 21.2, move: "in", focus: "40% 60%", zoom: 1.4 },
    { src: "evidence/arnold/register.jpg", at: 22.9, move: "out", focus: "50% 50%" },
    { src: "evidence/arnold/park1901.jpg", at: 24.3, move: "in", focus: "50% 50%", zoom: 1.3 },
    { src: "evidence/arnold/centralpark1862.jpg", at: 25.4, move: "right", focus: "50% 50%" },
    { src: "evidence/arnold/flatiron.jpg", at: 26.6, move: "in", focus: "50% 30%", zoom: 1.2 },
    { src: "evidence/arnold/port.jpg", at: 28.4, move: "in", focus: "50% 0%", fit: "contain" },
  ],
};
