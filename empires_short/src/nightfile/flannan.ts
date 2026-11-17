import type { NightfileCaseFileProps } from "./NightfileCaseFile";

/**
 * Night File — the Flannan Isles lighthouse keepers (timings = Whisper word starts, public/vo/flannan).
 * Facts (Wikipedia, "Flannan Isles Lighthouse"): keepers James Ducat, Thomas Marshall, Donald MacArthur;
 * light seen not lit by the steamer Archtor on Dec 15 1900; relief tender Hesperus arrived Dec 26 1900;
 * relief keeper Joseph Moore found the compound gate and main door closed, beds unmade, clock unwound
 * (stopped), one set of oilskins left behind. Superintendent Muirhead concluded they were swept away by
 * an unexpectedly large wave at the west landing. Bodies never found. Islands 32 km (≈20 mi) west of Lewis.
 * NOT used (myths): the dramatic log entries, overturned chair, uneaten meal (Gibson's 1912 poem / later fiction).
 * Images: Chris Downer (geograph 3201947, 3206350), CC BY-SA 2.0. Map: Natural Earth, public domain.
 */
export const flannan: NightfileCaseFileProps = {
  briefing: [
    { label: "FILE REGISTRY", value: "#1215-FI" },
    { label: "STATUS", value: "UNSOLVED", alert: true },
    { label: "LOCATION", value: "OUTER HEBRIDES · 1900" },
  ],
  evidence: [
    { kind: "window", src: "evidence/flannan/lighthouse.jpg", caption: "FLANNAN ISLES LIGHTHOUSE · EILEAN MÒR", fromWord: 0, position: "50% 40%" },
    {
      kind: "map",
      caption: "58.29°N 7.59°W · 20 MILES WEST OF LEWIS",
      fromWord: 11,
      map: {
        from: [[-12.2, 55.4], [-0.8, 59.4]],
        to: [[-8.9, 57.95], [-6.35, 58.62]],
        zoomFrames: 70,
        pins: [
          { lon: -7.588, lat: 58.288, label: "FLANNAN ISLES", tone: "amber", anchor: "left" },
          { lon: -6.93, lat: 58.23, label: "LEWIS", tone: "white", atFrame: 55 },
        ],
        line: { a: 0, b: 1, label: "32 KM", atFrame: 60 },
      },
    },
    {
      kind: "clock",
      caption: "DECEMBER 1900",
      fromWord: 21,
      times: [
        { time: "DEC 15", label: "LIGHT SEEN DARK" },
        { time: "DEC 26", label: "RELIEF BOAT LANDS" },
      ],
    },
    {
      kind: "checklist",
      caption: "FOUND BY THE RELIEF KEEPER · DEC 26",
      fromWord: 37,
      items: [
        { text: "Gate and door: shut", atWord: 38 },
        { text: "Beds: unmade", atWord: 44 },
        { text: "Clock: stopped", atWord: 47 },
        { text: "One coat: left behind", atWord: 52 },
      ],
    },
    { kind: "window", src: "evidence/flannan/islands.jpg", caption: "THE FLANNAN ISLES · PHOTO: CHRIS DOWNER, CC BY-SA 2.0", fromWord: 56, position: "50% 50%" },
    { kind: "count", caption: "THE KEEPERS", fromWord: 63, count: { n: 3, label: "MEN", highlight: 3, highlightLabel: "NEVER FOUND" } },
  ],
  script:
    "THREE LIGHTHOUSE KEEPERS | VANISHED | FROM AN ISLAND | WITH NOWHERE TO GO. | DECEMBER 1900. | THE FLANNAN ISLES, | TWENTY MILES | WEST OF SCOTLAND. | A PASSING SHIP | SAW THE LIGHT | HAD GONE DARK. | ELEVEN DAYS LATER, | A RELIEF BOAT ARRIVED. | THE GATE AND DOOR | WERE SHUT. | THE BEDS UNMADE. | THE CLOCK | HAD STOPPED. | ONE MAN'S COAT | WAS LEFT BEHIND. | THE OFFICIAL REPORT | SAID A GIANT WAVE. | BUT NONE | OF THE THREE MEN | WAS EVER FOUND.",
  timings: [0, 17, 28, 47, 57, 65, 70, 81, 89, 100, 109, 130, 140, 181, 184, 197, 213, 220, 231, 240, 245, 274, 277, 289, 300, 307, 311, 319, 323, 330, 358, 365, 374, 393, 394, 404, 413, 443, 446, 455, 462, 470, 476, 500, 502, 511, 545, 548, 556, 563, 593, 599, 611, 618, 625, 631, 663, 667, 677, 694, 701, 705, 714, 740, 746, 752, 756, 759, 767, 776, 784, 792],
  loop: 850,
  format: "polaroid",
  vo: "vo/flannan/vo.wav",
  bed: "audio/horror_bed.wav",
  bedVolume: 0.2,
};
