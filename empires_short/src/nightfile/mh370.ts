import type { NightfileCaseFileProps } from "./NightfileCaseFile";

/**
 * Night File — MH370 (format "casefile"; STATEMENT opener — Vine used a question; alternate per episode).
 * Rules (Oct 2 2026): hook card in the caption slot (never over the key visual), every beat a new strange
 * detail, theory prompt from mid-video, final line loops into the hook. VO sped 1.15x (35 s → 29.4 s).
 * Facts (Wikipedia, verified Oct 2 2026): 8 Mar 2014, departed KL 00:42 MYT for Beijing, 239 aboard;
 * last voice 01:19:30 "Good night. Malaysian three seven zero"; transponder lost 01:21; military radar tracked
 * it west back across the Malay Peninsula / Strait of Malacca, last at 02:22 ~200 nmi NW of Penang;
 * Inmarsat handshakes until 08:19 (~6 h after radar loss); flaperon found on Réunion 29 Jul 2015;
 * main wreckage never found; final report (2017) cause "inconclusive".
 * Images: Ocean Shield / Bluefin-21 (U.S. Navy, PD); Boeing 777 flaperon (PD); messages wall — مانفی, CC BY-SA 3.0.
 * Map: Natural Earth (PD). Radar/search positions approximate and labelled as such.
 */
export const mh370: NightfileCaseFileProps = {
  format: "casefile",
  briefing: [
    { label: "FILE REGISTRY", value: "#0308-MH" },
    { label: "STATUS", value: "NEVER FOUND", alert: true },
    { label: "FLIGHT", value: "MH370 · KUL → PEK · 2014" },
  ],
  hookCard: { lines: ["239 people.", "Vanished."], untilWord: 9 },
  prompt: { text: "What do you think happened?", fromWord: 44 },
  evidence: [
    { kind: "full", src: "evidence/mh370/search.jpg", caption: "THE SEARCH · U.S. NAVY (PUBLIC DOMAIN)", fromWord: 0, position: "50% 50%" },
    {
      kind: "clock",
      caption: "8 MARCH 2014 · MALAYSIA TIME",
      fromWord: 9,
      times: [
        { time: "00:42", label: "TAKES OFF" },
        { time: "01:19", label: "\"GOOD NIGHT\"" },
        { time: "01:21", label: "TRANSPONDER LOST" },
      ],
    },
    {
      kind: "map",
      caption: "MILITARY RADAR · POSITIONS APPROXIMATE",
      fromWord: 32,
      map: {
        from: [[88, -6], [118, 18]],
        to: [[92, -1], [108, 12]],
        zoomFrames: 50,
        pins: [
          { lon: 101.71, lat: 2.75, label: "KUALA LUMPUR", tone: "white" },
          { lon: 97.7, lat: 7.0, label: "LAST RADAR", tone: "amber", anchor: "left", atFrame: 30 },
        ],
        line: { a: 0, b: 1, label: "", atFrame: 10 },
      },
    },
    { kind: "count", caption: "INMARSAT SATELLITE HANDSHAKES", fromWord: 49, count: { n: 6, label: "MORE HOURS", highlight: 6, highlightLabel: "STILL PINGING" } },
    {
      kind: "map",
      caption: "INDIAN OCEAN · SEARCH AREA APPROXIMATE",
      fromWord: 58,
      map: {
        from: [[30, -48], [125, 20]],
        to: [[42, -44], [122, 8]],
        zoomFrames: 40,
        pins: [
          { lon: 55.5, lat: -21.1, label: "RÉUNION · 2015", tone: "amber", anchor: "right", atFrame: 20 },
          { lon: 101.71, lat: 2.75, label: "KUALA LUMPUR", tone: "white" },
          { lon: 95, lat: -36, label: "SEARCH AREA", tone: "white", anchor: "left" },
        ],
      },
    },
    { kind: "window", src: "evidence/mh370/flaperon.jpg", caption: "A BOEING 777 FLAPERON (PUBLIC DOMAIN)", fromWord: 67 },
    { kind: "full", src: "evidence/mh370/hope.jpg", caption: "MESSAGES FOR MH370 · CC BY-SA 3.0", fromWord: 74, position: "50% 50%" },
  ],
  script:
    "A PLANE WITH 239 PEOPLE | WENT SILENT, | AND VANISHED. | MARCH 2014. | MH370 LEFT KUALA LUMPUR | FOR BEIJING. | THE CAPTAIN'S LAST WORDS: | GOOD NIGHT, | MALAYSIAN 370. | TWO MINUTES LATER, | ITS TRANSPONDER WENT DARK. | BUT MILITARY RADAR | SAW IT TURN AROUND | AND FLY BACK ACROSS MALAYSIA. | THEN OUT OVER THE OCEAN. | FOR SIX MORE HOURS, | IT KEPT PINGING A SATELLITE. | OVER A YEAR LATER, | A PIECE OF ITS WING | WASHED UP ON AN ISLAND | NEAR AFRICA. | THE REST OF THE PLANE | HAS NEVER BEEN FOUND.",
  timings: [0, 13, 22, 29, 67, 77, 83, 94, 100, 128, 132, 171, 200, 207, 217, 227, 233, 256, 259, 271, 277, 301, 305, 315, 326, 363, 367, 373, 386, 389, 406, 412, 434, 437, 449, 460, 469, 473, 477, 486, 493, 499, 506, 514, 543, 547, 553, 559, 563, 587, 590, 596, 604, 619, 620, 625, 635, 640, 667, 670, 674, 680, 696, 698, 704, 709, 713, 719, 731, 737, 740, 745, 753, 762, 775, 807, 813, 818, 820, 829, 841, 848, 854],
  loop: 900,
  vo: "vo/mh370/vo.wav",
  bed: "audio/horror_bed.wav",
  bedVolume: 0.2,
};
