import type { NightfileCaseFileProps } from "./NightfileCaseFile";

/**
 * Night File — Theodosia Burr Alston (format "polaroid"; STATEMENT opener — Le Prince used a question).
 * Oct 4 2026 rules: face on frame 0 with hook card, evidence switches every ~1.5–2 s, route map, theory prompt.
 * Facts (en.wikipedia, verified Oct 4 2026): daughter of VP Aaron Burr (who killed Hamilton in the 1804 duel);
 * son died June 30 1812 aged 10; sailed Dec 31 1812 from Georgetown SC for New York on the schooner Patriot,
 * never heard from again; storm off Cape Hatteras Jan 2–3 1813, pirates, wreckers all theorised; 1869 Dr William
 * Pool obtained the "Nag's Head portrait" from a dying Outer Banks woman who said it came from a wrecked ship.
 * Images: PD — Gilbert Stuart 1794, anonymous adult portrait, Vanderlyn's Burr, duel illustration, Nag's Head
 * portrait, San Francisco Call "walks the plank", Aivazovsky "The Ninth Wave". CC BY-SA: Cape Hatteras Light
 * (Magicalwhimsy, 4.0), schooner Lewis R. French (Raphodon, 3.0). Map: Natural Earth (PD).
 */
export const theodosia: NightfileCaseFileProps = {
  format: "polaroid",
  briefing: [
    { label: "FILE REGISTRY", value: "#1231-TB" },
    { label: "STATUS", value: "NEVER FOUND", alert: true },
    { label: "LOCATION", value: "OFF CAROLINA · 1813" },
  ],
  hookCard: { lines: ["The VP's daughter.", "Never seen again."], untilWord: 12 },
  prompt: { text: "Storm, pirates, or wreckers?", fromWord: 109 },
  evidence: [
    { kind: "window", src: "evidence/theodosia/adult.jpg", caption: "THEODOSIA BURR ALSTON", fromWord: 0, position: "50% 25%" },
    { kind: "window", src: "evidence/theodosia/stuart.jpg", caption: "AGE 11 · GILBERT STUART, 1794", fromWord: 12, position: "50% 30%" },
    { kind: "window", src: "evidence/theodosia/burr.jpg", caption: "VICE PRESIDENT AARON BURR", fromWord: 17, position: "50% 25%" },
    { kind: "window", src: "evidence/theodosia/duel.jpg", caption: "WEEHAWKEN · JULY 11, 1804", fromWord: 23, position: "50% 50%" },
    { kind: "window", src: "evidence/theodosia/engraving.jpg", caption: "THEODOSIA · ENGRAVING, H. WRIGHT SMITH", fromWord: 28, position: "50% 30%" },
    { kind: "window", src: "evidence/theodosia/alston.jpg", caption: "HUSBAND · GOV. JOSEPH ALSTON", fromWord: 38, position: "50% 30%" },
    { kind: "window", src: "evidence/theodosia/adult.jpg", caption: "SON DIED · JUNE 30, 1812", fromWord: 43, position: "50% 20%" },
    { kind: "window", src: "evidence/theodosia/schooner.jpg", caption: "A SCHOONER LIKE THE PATRIOT · CC BY-SA 3.0", fromWord: 59, position: "50% 50%" },
    {
      kind: "map",
      caption: "DEC 31, 1812 · ROUTE APPROXIMATE",
      fromWord: 66,
      map: {
        from: [[-84, 29], [-66, 44]],
        to: [[-81, 31.5], [-71, 41.5]],
        zoomFrames: 50,
        pins: [
          { lon: -79.29, lat: 33.37, label: "GEORGETOWN, SC", tone: "white", anchor: "right" },
          { lon: -74.0, lat: 40.71, label: "NEW YORK", tone: "white", anchor: "left", atFrame: 20 },
          { lon: -75.53, lat: 35.25, label: "CAPE HATTERAS", tone: "amber", anchor: "right", atFrame: 45 },
        ],
        line: { a: 0, b: 1, label: "", atFrame: 10 },
      },
    },
    { kind: "window", src: "evidence/theodosia/wave.jpg", caption: "THE NINTH WAVE · AIVAZOVSKY, 1850", fromWord: 77, position: "50% 50%" },
    { kind: "window", src: "evidence/theodosia/plank.jpg", caption: "SAN FRANCISCO CALL · 1900s LEGEND", fromWord: 78, position: "50% 40%" },
    { kind: "window", src: "evidence/theodosia/hatteras.jpg", caption: "THE OUTER BANKS · CC BY-SA 4.0", fromWord: 87, position: "50% 50%" },
    { kind: "window", src: "evidence/theodosia/nagshead.jpg", caption: "THE NAG'S HEAD PORTRAIT · 1869", fromWord: 99, position: "50% 30%" },
    { kind: "window", src: "evidence/theodosia/wave.jpg", caption: "\"FROM A SHIP THAT WRECKED\"", fromWord: 113, position: "30% 50%" },
    { kind: "window", src: "evidence/theodosia/nagshead.jpg", caption: "IS IT HER?", fromWord: 121, position: "50% 25%" },
  ],
  script:
    "THE VICE PRESIDENT'S DAUGHTER | BOARDED A SHIP AND WAS NEVER SEEN AGAIN. | HER NAME WAS THEODOSIA BURR. | HER FATHER, AARON BURR, | HAD KILLED ALEXANDER HAMILTON IN A DUEL. | SHE WAS THE ONE PERSON | WHO NEVER TURNED ON HIM. | IN THE SUMMER OF 1812, | HER ONLY SON DIED. | HE WAS TEN. | THAT WINTER SHE SAILED | NORTH TO SEE HER FATHER | ON A SMALL SHIP CALLED THE PATRIOT. | IT LEFT SOUTH CAROLINA | ON NEW YEAR'S EVE. | IT NEVER ARRIVED. | STORM, | PIRATES, | NO ONE COULD SAY. | THEN FIFTY-SIX YEARS LATER, | A DOCTOR ON THE OUTER BANKS | WAS CALLED TO A DYING WOMAN. | ON HER WALL | HUNG A PORTRAIT | OF A YOUNG LADY. | SHE SAID IT CAME | FROM A SHIP THAT | WRECKED ON THAT COAST. | WAS IT HER? | NO ONE KNOWS.",
  timings: [0, 13, 20, 40, 46, 60, 64, 69, 74, 77, 85, 92, 116, 119, 127, 133, 149, 169, 174, 189, 193, 208, 210, 217, 230, 247, 251, 254, 274, 277, 280, 284, 289, 300, 305, 311, 320, 327, 345, 349, 352, 358, 363, 387, 389, 397, 404, 423, 426, 430, 452, 460, 467, 475, 483, 490, 496, 500, 505, 513, 518, 522, 528, 538, 544, 548, 574, 578, 584, 591, 604, 613, 618, 628, 646, 650, 656, 683, 701, 725, 730, 736, 740, 770, 783, 796, 807, 823, 824, 833, 839, 842, 851, 859, 866, 874, 880, 883, 892, 917, 922, 926, 936, 944, 947, 959, 964, 967, 973, 997, 1000, 1007, 1010, 1015, 1022, 1025, 1033, 1040, 1049, 1052, 1057, 1084, 1088, 1093, 1114, 1120, 1126],
  loop: 1153,
  vo: "vo/theodosia/vo.wav",
  bed: "audio/horror_bed.wav",
  bedVolume: 0.2,
};
