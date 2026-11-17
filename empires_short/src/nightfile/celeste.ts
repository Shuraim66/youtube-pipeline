import type { NightfileCaseFileProps } from "./NightfileCaseFile";

/**
 * Night File — the Mary Celeste (timings = word starts from public/vo/celeste/vo.json).
 * Facts (Wikipedia): left New York Nov 7 1872 for Genoa; last log entry Nov 25; found adrift
 * Dec 4 1872 by the Dei Gratia off the Azores. 10 aboard: Capt. Benjamin Briggs, wife Sarah,
 * daughter Sophia (2), 7 crew. Still amply provisioned; belongings undisturbed; lifeboat missing;
 * most papers + the captain's navigational instruments missing. Press (e.g. Boston Post, Feb 1873)
 * suspected murder/piracy; the Gibraltar salvage court found no conclusive evidence of foul play.
 * NOT used (myth): the "untouched dinner / galley fire burning" — invented in an 1883 retelling.
 * Images: ship painted 1861 as Amazon — public domain; newspaper Feb 1873 — public domain.
 */
export const celeste: NightfileCaseFileProps = {
  briefing: [
    { label: "FILE REGISTRY", value: "#1204-MC" },
    { label: "STATUS", value: "UNSOLVED", alert: true },
    { label: "LOCATION", value: "OFF THE AZORES · 1872" },
  ],
  evidence: [
    { kind: "full", src: "evidence/celeste/ship.jpg", caption: "THE SHIP · PAINTED 1861 (AS AMAZON)", fromWord: 0, position: "40% 50%" },
    {
      kind: "clock",
      caption: "THE VOYAGE · 1872",
      fromWord: 12,
      times: [
        { time: "NOV 7", label: "LEAVES NEW YORK" },
        { time: "NOV 25", label: "LAST LOG ENTRY" },
        { time: "DEC 4", label: "FOUND ADRIFT" },
      ],
    },
    { kind: "count", caption: "ABOARD", fromWord: 17, count: { n: 10, label: "PEOPLE", highlight: 3, highlightLabel: "CAPTAIN'S FAMILY" } },
    {
      kind: "checklist",
      caption: "FOUND ABOARD · DEC 4, 1872",
      fromWord: 35,
      items: [
        { text: "Food, water: plenty", atWord: 35 },
        { text: "Belongings: untouched", atWord: 47 },
        { text: "Lifeboat: missing", atWord: 51 },
        { text: "Papers: missing", atWord: 56 },
      ],
    },
    { kind: "window", src: "evidence/celeste/news_crop.jpg", caption: "NEWSPAPER REPORT · FEBRUARY 1873", fromWord: 63, position: "50% 0%" },
    { kind: "full", src: "evidence/celeste/ship.jpg", caption: "THE SHIP · PAINTED 1861 (AS AMAZON)", fromWord: 75, position: "40% 50%" },
  ],
  script: "A SHIP WAS FOUND | DRIFTING IN THE ATLANTIC. | EVERYONE ABOARD | HAD VANISHED. | DECEMBER 1872. | THE MARY CELESTE. | TEN PEOPLE | HAD LEFT NEW YORK ON HER. | THE CAPTAIN, | HIS WIFE, | AND THEIR TWO YEAR OLD DAUGHTER. | WHEN SAILORS | CLIMBED ABOARD, | SHE STILL HAD PLENTY | OF FOOD AND WATER. | THEIR BELONGINGS | WERE UNTOUCHED. | BUT THE LIFEBOAT | WAS GONE. | SO WERE THE CAPTAIN'S | PAPERS AND INSTRUMENTS. | THE NEWSPAPERS | SAID PIRATES. | MURDER. | A COURT FOUND | NO PROOF OF EITHER. | NO ONE ABOARD | WAS EVER SEEN AGAIN. | AND THE SHIP | JUST KEPT SAILING.",
  timings: [0, 15, 21, 27, 35, 47, 54, 57, 83, 93, 103, 112, 144, 153, 197, 201, 209, 238, 242, 253, 259, 265, 272, 280, 287, 303, 307, 322, 325, 338, 341, 344, 352, 358, 364, 389, 393, 403, 415, 432, 434, 442, 447, 457, 461, 470, 475, 497, 500, 514, 522, 547, 550, 553, 568, 574, 598, 602, 607, 610, 625, 635, 643, 674, 678, 688, 702, 730, 754, 759, 765, 776, 782, 791, 796, 817, 823, 830, 840, 848, 856, 865, 900, 913, 917, 923, 929, 937],
  loop: 978,
  vo: "vo/celeste/vo.wav",
  bed: "audio/horror_bed.wav",
  bedVolume: 0.2,
};
