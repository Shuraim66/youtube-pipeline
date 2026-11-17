import type { NightfileCaseFileProps } from "./NightfileCaseFile";

/**
 * Night File — D.B. Cooper (format "tape"; timings = Whisper word starts, public/vo/cooper).
 * Built on Flannan Studio feedback: 80% viewed but only 34% stayed-to-watch → bold frame-0 hook card
 * + static burst; zero comments → on-screen theory prompt at the end.
 * Facts (Wikipedia): Nov 24 1971, Northwest Orient Flight 305 (Boeing 727), Portland → Seattle; ticket as
 * "Dan Cooper" ("D.B." was a press error); $200,000 ransom + 4 parachutes delivered at Seattle; flew on toward
 * Reno; jumped from the aft airstair ~8:13 PM over the Pacific Northwest wearing a suit, raincoat and loafers.
 * Feb 10 1980: 8-year-old Brian Ingram found $5,994 of the ransom at Tena Bar on the Columbia River (~9 mi below
 * Vancouver, WA). FBI suspended the active investigation July 8 2016. Never identified.
 * Images: FBI composite sketch + wanted poster (public domain); 727 airstair diagram — Anynobody, CC BY 2.5.
 * Map: Natural Earth (public domain).
 */
export const cooper: NightfileCaseFileProps = {
  format: "tape",
  briefing: [
    { label: "FILE REGISTRY", value: "#1124-DB" },
    { label: "STATUS", value: "UNIDENTIFIED", alert: true },
    { label: "LOCATION", value: "FLIGHT 305 · NOV 24 1971" },
  ],
  hookCard: { lines: ["Hijacked. Jumped.", "Never found."], untilWord: 17 },
  prompt: { text: "Did he survive the jump?", fromWord: 62 },
  evidence: [
    { kind: "window", src: "evidence/cooper/sketch.jpg", caption: "FBI COMPOSITE SKETCH (PUBLIC DOMAIN)", fromWord: 0, position: "50% 30%" },
    {
      kind: "checklist",
      caption: "FLIGHT 305 · NOVEMBER 24, 1971",
      fromWord: 17,
      items: [
        { text: "Ticket name: Dan Cooper", atWord: 17 },
        { text: "Ransom: $200,000", atWord: 19 },
        { text: "Parachutes: four", atWord: 22 },
      ],
    },
    {
      kind: "map",
      caption: "FLIGHT 305 · SEATTLE → RENO",
      fromWord: 24,
      map: {
        from: [[-131, 36.5], [-112, 50]],
        to: [[-126.5, 38.8], [-116.5, 48.4]],
        zoomFrames: 50,
        pins: [
          { lon: -122.31, lat: 47.45, label: "SEATTLE", tone: "white" },
          { lon: -119.77, lat: 39.5, label: "RENO", tone: "white" },
          { lon: -122.55, lat: 45.95, label: "JUMP ZONE (EST.)", tone: "amber", anchor: "right", atFrame: 30 },
        ],
        line: { a: 0, b: 1, label: "", atFrame: 8 },
      },
    },
    { kind: "window", src: "evidence/cooper/airstair.png", caption: "BOEING 727 REAR AIRSTAIR · DIAGRAM: ANYNOBODY, CC BY 2.5", fromWord: 30, invert: true },
    { kind: "window", src: "evidence/cooper/poster.jpg", caption: "FBI WANTED POSTER (PUBLIC DOMAIN)", fromWord: 37, position: "50% 20%" },
    {
      kind: "clock",
      caption: "THE CASE FILE",
      fromWord: 42,
      times: [
        { time: "1971", label: "HE JUMPS" },
        { time: "1980", label: "$5,994 FOUND · TENA BAR" },
        { time: "2016", label: "FBI ENDS ACTIVE SEARCH" },
      ],
    },
    { kind: "count", caption: "THE HIJACKER", fromWord: 62, count: { n: 1, label: "MAN", highlight: 1, highlightLabel: "NEVER IDENTIFIED" } },
  ],
  script:
    "A MAN HIJACKED A PLANE, | TOOK TWO HUNDRED THOUSAND DOLLARS, | AND JUMPED OUT. | HE WAS NEVER FOUND. | NOVEMBER 1971. | HE CALLED HIMSELF | DAN COOPER. | OVER THE PACIFIC NORTHWEST, | AT NIGHT, | HE OPENED THE REAR STAIRS | AND JUMPED. | IN A SUIT AND LOAFERS. | NINE YEARS LATER, | A BOY FOUND | ALMOST SIX THOUSAND DOLLARS | OF THE RANSOM | IN THE SAND | OF THE COLUMBIA RIVER. | THE REST | WAS NEVER FOUND. | NEITHER WAS HE.",
  timings: [0, 15, 23, 40, 44, 59, 62, 71, 79, 87, 95, 114, 122, 141, 143, 146, 152, 185, 191, 243, 248, 254, 265, 276, 307, 311, 315, 324, 336, 352, 364, 366, 374, 381, 387, 398, 410, 421, 440, 443, 452, 458, 494, 500, 509, 526, 529, 536, 547, 560, 574, 584, 593, 608, 611, 623, 630, 633, 643, 646, 649, 659, 688, 691, 701, 707, 716, 746, 753, 763],
  loop: 810,
  vo: "vo/cooper/vo.wav",
  bed: "audio/horror_bed.wav",
  bedVolume: 0.2,
};
