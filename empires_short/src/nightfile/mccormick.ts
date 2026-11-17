import type { NightfileCaseFileProps } from "./NightfileCaseFile";

/**
 * Night File — Ricky McCormick's encrypted notes (timings = word starts from public/vo/mccormick/vo.json).
 * Facts (Wikipedia / FBI 2011 appeal): Ricky McCormick, 41, last seen June 25 1999 at
 * Forest Park Hospital, St. Louis; found dead June 30 1999 in a cornfield near West Alton,
 * St. Charles County, MO, ~15 mi from home; two encrypted notes in his pockets; cause of
 * death undetermined (possible homicide); FBI CRRU public appeal March 29 2011; unsolved.
 * Evidence: notes = FBI-released images (US gov work, public domain). Field/road = Pexels,
 * labelled ILLUSTRATIVE on screen.
 */
export const mccormick: NightfileCaseFileProps = {
  briefing: [
    { label: "FILE REGISTRY", value: "#0630-RM" },
    { label: "STATUS", value: "UNSOLVED", alert: true },
    { label: "LOCATION", value: "WEST ALTON, MO · 1999" },
  ],
  evidence: [
    { src: "evidence/note1_crop.jpg", caption: "EXHIBIT A — NOTE 1 OF 2 · FBI", fromWord: 0 },
    { src: "evidence/cornfield.jpg", caption: "CORNFIELD · ILLUSTRATIVE", fromWord: 9, position: "30% 70%" },
    { src: "evidence/road.jpg", caption: "15 MILES FROM HOME · ILLUSTRATIVE", fromWord: 19 },
    { src: "evidence/note1_detail.jpg", caption: "EXHIBIT A — DETAIL · FBI", fromWord: 28 },
    { src: "evidence/note2_crop.jpg", caption: "EXHIBIT B — NOTE 2 OF 2 · FBI", fromWord: 34, position: "50% 20%" },
    { src: "evidence/note2_crop.jpg", caption: "EXHIBIT B — NOTE 2 OF 2 · FBI", fromWord: 47, position: "50% 85%" },
    { src: "evidence/note1_crop.jpg", caption: "EXHIBIT A — NOTE 1 OF 2 · FBI", fromWord: 54 },
  ],
  script: "TWO PAGES OF CODE, | FOUND ON A DEAD MAN. | JUNE 1999. | A MISSOURI CORNFIELD. | HIS NAME WAS | RICKY MCCORMICK. | HE'D BEEN MISSING | FIVE DAYS, | FIFTEEN MILES | FROM HOME. | NOBODY COULD SAY | HOW HE DIED. | IN 2011, | THE FBI RELEASED | HIS NOTES | AND ASKED THE PUBLIC | FOR HELP. | ITS OWN | CODE BREAKERS | COULDN'T CRACK THEM. | NOBODY HAS. | WHAT DID HE WRITE?",
  timings: [0, 16, 26, 32, 43, 55, 62, 65, 71, 80, 104, 127, 154, 165, 191, 209, 218, 225, 234, 256, 274, 276, 283, 295, 307, 321, 333, 340, 352, 376, 385, 392, 400, 404, 415, 434, 452, 461, 475, 492, 500, 510, 516, 525, 530, 538, 545, 554, 575, 583, 595, 611, 620, 626, 640, 656, 671, 689, 693, 695],
  loop: 731,
  vo: "vo/mccormick/vo.wav",
  bed: "audio/horror_bed.wav",
  bedVolume: 0.2,
};
