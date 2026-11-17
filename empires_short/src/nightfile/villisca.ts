import type { NightfileCaseFileProps } from "./NightfileCaseFile";

/**
 * Night File — the Villisca axe murders (timings = word starts from public/vo/villisca/vo.json).
 * Facts (Wikipedia): night of June 9–10 1912, Villisca, Iowa. 8 killed: Josiah & Sarah Moore,
 * their 4 children, and guests Ina & Lena Stillinger (6 children total). Family home from the
 * church Children's Day program ~9:45–10 pm; neighbour raised alarm ~7 am. Mirrors covered,
 * slab of bacon laid next to the axe, bloody water on the kitchen table. Rev. George Kelly tried
 * twice in 1917 (hung jury, then acquittal). Unsolved. House restored, open to visitors/overnights.
 * Images: house — Jason McLaren, CC BY-SA 4.0; The Day Book (Chicago) 14 June 1912 — public domain;
 * county map — Arkyan, CC BY-SA 3.0. (Attic photo on Wikipedia is fair-use only — NOT used.)
 */
export const villisca: NightfileCaseFileProps = {
  briefing: [
    { label: "FILE REGISTRY", value: "#0610-VA" },
    { label: "STATUS", value: "UNSOLVED", alert: true },
    { label: "LOCATION", value: "VILLISCA, IOWA · 1912" },
  ],
  evidence: [
    { kind: "full", src: "evidence/villisca/house.jpg", caption: "THE MOORE HOUSE · TODAY", fromWord: 0, position: "30% 50%" },
    { kind: "window", src: "evidence/villisca/map.svg", caption: "VILLISCA · MONTGOMERY CO., IOWA", fromWord: 13, invert: true },
    {
      kind: "clock",
      caption: "JUNE 9–10, 1912",
      fromWord: 17,
      times: [
        { time: "9:30 PM", label: "CHURCH PROGRAM ENDS" },
        { time: "10:00 PM", label: "HOME, DOORS LOCKED" },
        { time: "7:00 AM", label: "NO ONE WAKES" },
      ],
    },
    { kind: "count", caption: "THE VICTIMS", fromWord: 32, count: { n: 8, label: "DEAD", highlight: 6, highlightLabel: "6 CHILDREN" } },
    {
      kind: "checklist",
      caption: "FOUND IN THE HOUSE",
      fromWord: 43,
      items: [
        { text: "Every mirror covered", atWord: 43 },
        { text: "Bacon beside the axe", atWord: 51 },
        { text: "Bloody water on table", atWord: 60 },
      ],
    },
    { kind: "window", src: "evidence/villisca/daybook_crop.jpg", caption: "THE DAY BOOK, CHICAGO · JUNE 14, 1912", fromWord: 70, position: "50% 20%" },
    { kind: "full", src: "evidence/villisca/house.jpg", caption: "THE MOORE HOUSE · TODAY", fromWord: 91, position: "30% 50%" },
  ],
  script: "EIGHT PEOPLE | WENT TO SLEEP | IN THIS HOUSE. | NONE OF THEM | WOKE UP. | JUNE 1912. | VILLISCA, IOWA. | THE MOORE FAMILY | CAME HOME FROM CHURCH | AROUND TEN. | TWO LITTLE GIRLS | STAYED THE NIGHT. | BY MORNING, | ALL EIGHT | WERE DEAD. | SIX OF THEM | WERE CHILDREN. | EVERY MIRROR | IN THE HOUSE | HAD BEEN COVERED. | A SLAB OF BACON | LAY NEXT TO THE AXE. | A BOWL OF | BLOODY WATER | SAT ON THE KITCHEN TABLE. | A PREACHER | WAS PUT ON TRIAL TWICE. | HE WALKED FREE. | MORE THAN | A CENTURY LATER, | NO ONE KNOWS | WHO DID IT. | AND PEOPLE STILL SLEEP | IN THAT HOUSE.",
  timings: [0, 17, 28, 33, 35, 43, 49, 53, 76, 82, 85, 88, 95, 118, 122, 163, 179, 203, 206, 211, 223, 232, 240, 246, 255, 265, 286, 291, 298, 307, 316, 322, 341, 347, 356, 366, 373, 377, 399, 403, 407, 410, 414, 433, 440, 451, 456, 458, 466, 470, 475, 497, 500, 509, 515, 526, 534, 542, 547, 550, 575, 579, 586, 591, 600, 612, 622, 628, 631, 638, 665, 669, 676, 686, 692, 697, 709, 739, 743, 751, 777, 784, 789, 795, 803, 819, 827, 833, 843, 850, 856, 860, 893, 902, 911, 922, 927, 932],
  loop: 967,
  vo: "vo/villisca/vo.wav",
  bed: "audio/horror_bed.wav",
  bedVolume: 0.2,
};
