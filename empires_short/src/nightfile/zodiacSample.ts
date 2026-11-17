import type { NightfileProps } from "./NightfileDecoder";

/**
 * Baseline Zodiac episode (15 s @ 30 fps = 450 frames).
 * Facts: Zodiac attacks in Northern California 1968–69; four ciphers mailed
 * (Z408, Z340, Z13, Z32). Z408 solved 1969 (Harden); Z340 solved Dec 2020
 * (Oranchak, Blake, Van Eycke). Z13 and Z32 remain unsolved. Never identified.
 */
export const zodiacSample: NightfileProps = {
  channel: "NIGHTFILE HQ",
  caseId: "CASE 1969-Z",
  coordinates: "38.10N 122.25W",
  triggers: ["KILLER", "TERRORIZED", "CIPHERS"],
  captions: [
    { text: "A KILLER", from: 0, to: 40 },
    { text: "TERRORIZED", from: 40, to: 80 },
    { text: "NORTHERN CALIFORNIA.", from: 80, to: 125 },
    { text: "HE CALLED HIMSELF", from: 125, to: 165 },
    { text: "THE ZODIAC.", from: 165, to: 205 },
    { text: "HE MAILED FOUR", from: 205, to: 245 },
    { text: "CIPHERS", from: 245, to: 285 },
    { text: "TO THE PRESS.", from: 285, to: 325 },
    { text: "TWO WERE CRACKED.", from: 325, to: 365 },
    { text: "TWO STILL AREN'T.", from: 365, to: 405 },
    { text: "HE WAS NEVER CAUGHT.", from: 405, to: 450 },
  ],
  ciphers: [
    { id: "Z408", status: "solved", note: "SOLVED 1969", length: 12 },
    { id: "Z340", status: "solved", note: "SOLVED 2020", length: 12 },
    { id: "Z13", status: "unsolved", note: "", length: 13 },
    { id: "Z32", status: "unsolved", note: "", length: 12 },
  ],
};
