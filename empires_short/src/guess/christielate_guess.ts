import type { GuessShortProps } from "./types";

/**
 * Night File — Agatha Christie, "Guess first, late reveal" (reveal: "end"; experiments/guess_test_2026-10.json, arm late_reveal). No voiceover.
 * Facts (published description + src/archival/christie_v2.ts, en.wikipedia "Agatha Christie"): vanished Dec 1926; car found at Newlands Corner above
 * a chalk quarry with clothes + expired licence; >1,000 police and 15,000 volunteers; found alive 11 days later at the Swan Hydropathic Hotel, Harrogate,
 * registered as "Mrs Neele", surname of Nancy Neele, the woman her husband loved.
 * Clue cards show nothing Harrogate-related; baths/swan/hydro images appear only at the reveal and closing.
 * Images: young.jpg Christie portrait (PD); cowley.jpg "1926 Morris Bullnose Cowley" (CC BY 2.0, same model, NOT her car — labelled);
 * newlands.jpg "Newlands Corner, Surrey - pan SE" (CC BY-SA 3.0, modern); swan.jpg "Old Swan Hotel Harrogate" (CC BY 3.0, modern); hydro.jpg 1926 newspaper (PD).
 */
const PORTRAIT = { src: "img/christie/young.jpg", credit: "AGATHA CHRISTIE · EARLY PORTRAIT", focus: "60% 40%" };
const COWLEY = { src: "img/christie/cowley.jpg", credit: "1926 MORRIS COWLEY · SAME MODEL, NOT HER CAR", focus: "35% 75%" };
const NEWLANDS = { src: "img/christie/newlands.jpg", credit: "NEWLANDS CORNER, SURREY · MODERN PHOTO", focus: "25% 50%" };
const NEWLANDS2 = { src: "img/christie/newlands.jpg", credit: "NEWLANDS CORNER, SURREY · MODERN PHOTO", focus: "85% 50%" };
const SWAN = { src: "img/christie/swan.jpg", credit: "THE SWAN HYDRO (NOW OLD SWAN HOTEL) · MODERN PHOTO", focus: "50% 60%" };
const NEWSPAPER = { src: "img/christie/hydro.jpg", credit: "NEWSPAPER REPORT · DECEMBER 1926", focus: "50% 15%" };

export const christieLateGuess: GuessShortProps = {
  brand: "nightfile",
  reveal: "end",
  question: ["AGATHA CHRISTIE VANISHED FOR 11 DAYS IN 1926.", "WHERE WAS SHE FOUND?"],
  evidence: PORTRAIT,
  options: [
    { key: "A", text: "A HARROGATE SPA HOTEL" },
    { key: "B", text: "A LONDON HOSPITAL" },
    { key: "C", text: "A SHIP TO AMERICA" },
  ],
  correct: "A",
  revealImage: SWAN,
  stamp: "A HARROGATE SPA HOTEL.",
  countdownLabel: "",
  cards: [
    { text: "December 1926: her car was found above a chalk quarry, with clothes and an expired licence inside.", hl: "chalk quarry", img: COWLEY },
    { text: "More than 1,000 police and 15,000 volunteers searched.", hl: "15,000 volunteers", img: NEWLANDS },
    { text: "Eleven days later, she was found alive.", hl: "found alive.", img: NEWLANDS2 },
  ],
  closing: { text: "She had registered as ‘Mrs Neele’, the surname of the woman her husband loved.", img: NEWSPAPER, byReadingTime: true },
};
