import type { GuessImage, GuessShortProps } from "./types";
import { celesteLateGuess } from "./celestelate_guess";

/**
 * TEST (not for upload without approval): NightfileCelesteLate with every backdrop replaced by one continuous Blender render
 * (blender_celeste/build_celeste.py, CC0 assets listed in blender_celeste/README.md). Text, options, cards, stamp, closing and
 * timings are the approved late-reveal data unchanged; only images and credit lines differ. Frames: public/blender/celeste/f_0000..0695.jpg.
 * Shots: 0-8.7 s ship drifting; 8.7-17.47 s deck; 17.47 s- empty boat stowage over the main hatch (Wikipedia: the yawl had
 * "apparently been stowed across the main hatch" - no davits).
 */
const SEQ = { dir: "blender/celeste", count: 696 };
const ship: GuessImage = { src: "", seq: SEQ, credit: "THE MARY CELESTE (BRIGANTINE) · 3D RECONSTRUCTION" };
const deck: GuessImage = { src: "", seq: SEQ, credit: "THE DECK · 3D RECONSTRUCTION" };
const hatch: GuessImage = { src: "", seq: SEQ, credit: "MAIN HATCH · BOAT APPARENTLY STOWED HERE · 3D" };
const L = celesteLateGuess;

export const celesteBlenderGuess: GuessShortProps = {
  ...L,
  evidence: ship,
  revealImage: hatch,
  cards: [
    { ...L.cards[0]!, img: ship },
    { ...L.cards[1]!, img: { ...deck, typed: L.cards[1]!.img.typed } },
    { ...L.cards[2]!, img: deck },
  ],
  closing: { ...L.closing, img: hatch },
};
