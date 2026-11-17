import type { SectionSpec } from "./types";

/**
 * Aurelis HQ long-form — "15 Skills That Will Pay More by 2030" (AURELIS_LONGFORM_BRIEF.md, 2026-10-28).
 * Original script/data; every number on screen carries its source line (brief section 3). Visuals: own Remotion
 * graphics + Pexels stock (Pexels License: free commercial use, attribution optional; creators credited in the
 * description anyway). No Alux or other channel material. No logos of cited organisations. VO: Kokoro bf_emma.
 * Music: original generated bed (scripts/gen_longform_bed.py), no third-party audio.
 *
 * MEDIA (file | Pexels page | creator | licence) — regenerate with scripts/gen_longform_header.py:
 * MEDIA-BEGIN
 *  s01_1.mp4 | https://www.pexels.com/video/clouds-moves-by-the-wind-over-towering-buildings-2852289/ | Magda Ehlers | Pexels License
 *  s01_2.mp4 | https://www.pexels.com/video/woman-typing-on-the-laptop-5385839/ | Monstera Production | Pexels License
 *  s01_3.mp4 | https://www.pexels.com/video/dynamic-financial-data-analysis-on-screen-38512647/ | Rafael Minguet Delgado | Pexels License
 *  s02_0.mp4 | https://www.pexels.com/video/people-looking-at-work-documents-7710597/ | https://kaboompics.com/ | Pexels License
 *  s02_1.mp4 | https://www.pexels.com/video/tablet-displaying-financial-data-analytics-36328573/ | Jakub Zerdzicki | Pexels License
 *  s02_2.mp4 | https://www.pexels.com/video/close-up-shot-of-a-spinning-globe-11268971/ | Engin Akyurt | Pexels License
 *  s02_3.mp4 | https://www.pexels.com/video/a-paper-of-pie-graph-7947431/ | RDNE Stock project | Pexels License
 *  s02_4.mp4 | https://www.pexels.com/video/cryptocurrency-market-data-analysis-38656966/ | Rafael Minguet Delgado | Pexels License
 *  s02_5.mp4 | https://www.pexels.com/video/geometric-shapes-objects-7601656/ | Marina Leonova | Pexels License
 *  s03_0.mp4 | https://www.pexels.com/video/man-signing-the-paper-8061370/ | Pavel Danilyuk | Pexels License
 *  s03_1.mp4 | https://www.pexels.com/video/person-putting-signature-on-a-document-5778854/ | RDNE Stock project | Pexels License
 *  s03_2.mp4 | https://www.pexels.com/video/road-and-trees-in-autumn-14239824/ | Steven Van Elk | Pexels License
 *  s03_3.mp4 | https://www.pexels.com/video/person-signing-on-the-documents-7685212/ | ArtHouse Studio | Pexels License
 *  s04_0.mp4 | https://www.pexels.com/video/woman-showing-a-book-to-a-child-8343425/ | Mikhail Nilov | Pexels License
 *  s04_1.mp4 | https://www.pexels.com/video/video-of-a-student-writing-on-paper-8342362/ | Pavel Danilyuk | Pexels License
 *  s04_2.mp4 | https://www.pexels.com/video/typing-on-a-laptop-6767924/ | olia danilevich | Pexels License
 *  s05_0.mp4 | https://www.pexels.com/video/people-in-a-business-meeting-discussing-about-data-and-charts-on-the-table-3246669/ | fauxels | Pexels License
 *  s05_1.mp4 | https://www.pexels.com/video/woman-presenting-documents-and-percentage-in-a-meeting-8170487/ | Kampus Production | Pexels License
 *  s05_2.mp4 | https://www.pexels.com/video/people-having-a-discussion-at-a-meeting-7507758/ | Moe Magners | Pexels License
 *  s05_3.mp4 | https://www.pexels.com/video/women-listening-to-a-presentation-8170495/ | Kampus Production | Pexels License
 *  s06_0.mp4 | https://www.pexels.com/video/dynamic-night-time-city-intersection-view-31022068/ | Pham Huynh  Tuan Vy | Pexels License
 *  s06_1.mp4 | https://www.pexels.com/video/a-delivery-man-going-down-the-stair-while-carrying-a-thermal-bag-7701963/ | MART  PRODUCTION | Pexels License
 *  s06_2.mp4 | https://www.pexels.com/video/a-man-walking-slowly-while-reading-a-document-7651687/ | Kindel Media | Pexels License
 *  s07_0.mp4 | https://www.pexels.com/video/person-sticking-sticky-notes-on-a-whiteboard-7429487/ | cottonbro studio | Pexels License
 *  s07_1.mp4 | https://www.pexels.com/video/person-drawing-an-artwork-on-the-tablet-5474816/ | Pavel Danilyuk | Pexels License
 *  s07_2.mp4 | https://www.pexels.com/video/man-sketching-on-a-notebook-10474641/ | RDNE Stock project | Pexels License
 *  s07_3.mp4 | https://www.pexels.com/video/woman-posting-sticky-notes-6563922/ | Mikhail Nilov | Pexels License
 *  s08_0.mp4 | https://www.pexels.com/video/a-close-up-of-a-person-using-a-laptop-at-home-8480679/ | ArtHouse Studio | Pexels License
 *  s08_1.mp4 | https://www.pexels.com/video/stock-market-analysis-on-dual-monitors-38600650/ | Rafael Minguet Delgado | Pexels License
 *  s08_2.mp4 | https://www.pexels.com/video/person-using-a-magnifying-glass-7947467/ | RDNE Stock project | Pexels License
 *  s08_3.mp4 | https://www.pexels.com/video/close-up-video-of-a-person-using-a-laptop-7651999/ | Kindel Media | Pexels License
 *  s09_0.mp4 | https://www.pexels.com/video/wind-turbines-in-a-semi-desert-landscape-9790229/ | Kindel Media | Pexels License
 *  s09_1.mp4 | https://www.pexels.com/video/an-aerial-view-of-solar-panels-in-a-field-27009032/ | Rustem Muratov | Pexels License
 *  s09_2.mp4 | https://www.pexels.com/video/in-the-middle-of-the-hood-part-1-11986207/ | Florian Delée | Pexels License
 *  s09_3.mp4 | https://www.pexels.com/video/wind-turbines-spinning-on-a-clear-day-28938115/ | Satvinder Ghotra | Pexels License
 *  s10_0.mp4 | https://www.pexels.com/video/close-up-of-a-cpu-7140928/ | MrColo | Pexels License
 *  s10_1.mp4 | https://www.pexels.com/video/sunset-silhouette-of-power-lines-against-golden-sky-31008623/ | 정규송 Nui MALAMA | Pexels License
 *  s10_2.mp4 | https://www.pexels.com/video/electricians-repairing-power-lines-from-elevated-buckets-30567734/ | Ibrahim Bennett | Pexels License
 *  s10_3.mp4 | https://www.pexels.com/video/high-tech-traffic-management-control-room-38779103/ | Kiwi and Camera | Pexels License
 *  s11_0.mp4 | https://www.pexels.com/video/paying-with-card-on-card-reader-11158789/ | Towfiqu barbhuiya | Pexels License
 *  s11_1.mp4 | https://www.pexels.com/video/dynamic-stock-market-display-analysis-38557069/ | Rafael Minguet Delgado | Pexels License
 *  s11_2.mp4 | https://www.pexels.com/video/close-up-video-of-a-cellphone-7822023/ | RDNE Stock project | Pexels License
 *  s12_0.mp4 | https://www.pexels.com/video/a-person-working-hard-on-a-computer-laptop-5495781/ | Pavel Danilyuk | Pexels License
 *  s12_1.mp4 | https://www.pexels.com/video/close-up-view-of-a-motherboard-6754818/ | Tima Miroshnichenko | Pexels License
 *  s12_2.mp4 | https://www.pexels.com/video/advanced-robotics-in-automated-factory-32386590/ | Usman AbdulrasheedGambo | Pexels License
 *  s13_0.mp4 | https://www.pexels.com/video/padlock-against-black-background-10241357/ | max laurell | Pexels License
 *  s13_1.mp4 | https://www.pexels.com/video/database-storage-of-a-server-5028622/ | ALL IZ Well | Pexels License
 *  s13_2.mp4 | https://www.pexels.com/video/colorful-code-on-dark-background-34268861/ | Jakub Zerdzicki | Pexels License
 *  s13_3.mp4 | https://www.pexels.com/video/hand-operating-metal-door-lock-close-up-35999369/ | Jakub Bukowski | Pexels License
 *  s14_0.mp4 | https://www.pexels.com/video/blue-colored-cables-1085656/ | Dima Krivoy | Pexels License
 *  s14_1.mp4 | https://www.pexels.com/video/a-footage-of-a-locked-door-8846989/ | Анатолий | Pexels License
 *  s14_2.mp4 | https://www.pexels.com/video/high-tech-control-room-for-traffic-monitoring-38779098/ | Kiwi and Camera | Pexels License
 *  s15_0.mp4 | https://www.pexels.com/video/crypto-market-analysis-on-dual-screens-38512646/ | Rafael Minguet Delgado | Pexels License
 *  s15_1.mp4 | https://www.pexels.com/video/man-analyzing-graphs-8480474/ | ArtHouse Studio | Pexels License
 *  s15_2.mp4 | https://www.pexels.com/video/close-up-footage-of-a-person-working-using-laptop-8478748/ | ArtHouse Studio | Pexels License
 *  s15_3.mp4 | https://www.pexels.com/video/analyzing-financial-data-on-multiscreen-setup-38656963/ | Rafael Minguet Delgado | Pexels License
 *  s16_0.mp4 | https://www.pexels.com/video/dynamic-neural-network-visualization-video-40057909/ | Nicola Narracci | Pexels License
 *  s16_1.mp4 | https://www.pexels.com/video/close-up-of-text-on-computer-screen-35475054/ | Shutter  Break | Pexels License
 *  s16_2.mp4 | https://www.pexels.com/video/a-human-hand-touching-prosthetic-arm-6153453/ | cottonbro studio | Pexels License
 *  s16_3.mp4 | https://www.pexels.com/video/futuristic-sci-fi-abstract-neural-network-animation-30739786/ | Nicola Narracci | Pexels License
 *  s17_0.mp4 | https://www.pexels.com/video/colleagues-discussing-about-work-7691551/ | Yan Krukau | Pexels License
 *  s17_1.mp4 | https://www.pexels.com/video/a-person-computing-while-writing-on-a-notepad-5981346/ | https://kaboompics.com/ | Pexels License
 *  s17_2.mp4 | https://www.pexels.com/video/students-gossip-about-a-classmate-7396321/ | cottonbro studio | Pexels License
 *  s17_3.mp4 | https://www.pexels.com/video/a-woman-having-a-job-interview-7426752/ | Pavel Danilyuk | Pexels License
 *  s17_4.mp4 | https://www.pexels.com/video/a-laptop-computer-on-a-desk-with-a-plant-and-cactus-15940565/ | Enrique | Pexels License
 *  s17_5.mp4 | https://www.pexels.com/video/high-angle-shot-of-coworkers-having-a-meeting-7688000/ | Kindel Media | Pexels License
 *  s18_0.mp4 | https://www.pexels.com/video/motorcycle-assembly-line-in-action-30283095/ | Emrul Kausar Emon | Pexels License
 *  s18_1.mp4 | https://www.pexels.com/video/person-adjusting-a-tool-5967519/ | Ono  Kosuki | Pexels License
 *  s18_2.mp4 | https://www.pexels.com/video/high-tech-automated-manufacturing-process-32386569/ | Usman AbdulrasheedGambo | Pexels License
 *  s19_0.mp4 | https://www.pexels.com/video/drone-view-of-hikers-on-a-dirt-path-in-the-jungle-15953001/ | Nitin Khajotia | Pexels License
 *  s19_1.mp4 | https://www.pexels.com/video/women-using-laptops-8145101/ | olia danilevich | Pexels License
 *  s19_2.mp4 | https://www.pexels.com/video/black-and-white-video-of-a-busy-street-853946/ | Coverr | Pexels License
 *  s19_3.mp4 | https://www.pexels.com/video/aerial-view-of-forest-intersection-35132715/ | Georg Bergen | Pexels License
 *  s19_4.mp4 | https://www.pexels.com/video/colleagues-having-discussion-7252800/ | Ivan S | Pexels License
 *  s19_5.mp4 | https://www.pexels.com/video/vibrant-street-life-in-ankara-turkey-34892306/ | Talha Uğuz | Pexels License
 *  s20_0.mp4 | https://www.pexels.com/video/aerial-view-of-city-skyline-at-dusk-35645580/ | umar muazu | Pexels License
 *  s20_1.mp4 | https://www.pexels.com/video/woman-drinking-from-a-cup-while-looking-outside-7617180/ | Los Muertos Crew | Pexels License
 * MEDIA-END
 */

const WEF = "WEF Future of Jobs Report 2025";
const PWC = "PwC 2026 Global AI Jobs Barometer";
const ISC2 = "ISC2 2025";
const LC = "Lightcast, 2025 (1.3B postings)";

export const SECTIONS: SectionSpec[] = [
  { id: "s01", chapter: "Intro", cards: [
    { from: "PwC read", to: "That skill", kind: "stats", stats: [{ value: 62, suffix: "%", label: "average wage premium for AI skills" }], source: PWC },
  ] },
  { id: "s02", chapter: "Where the numbers come from", card: "WHERE THE NUMBERS COME FROM", cards: [
    { from: "World Economic Forum", to: "PwC analysed", kind: "stats", stats: [{ value: 1000, suffix: "+", label: "employers" }, { value: 14, suffix: "M+", label: "workers" }, { value: 55, label: "economies" }], source: WEF },
    { from: "PwC analysed", to: "And ISC2", kind: "stats", stats: [{ value: 1, suffix: "B+", label: "job ads" }, { value: 27, label: "countries" }], source: PWC },
    { from: "And ISC2", to: "One finding", kind: "stats", stats: [{ value: 16000, suffix: "+", label: "cybersecurity professionals" }], source: "ISC2 Cybersecurity Workforce Study 2025" },
    { from: "Employers expect", to: "One honest", kind: "stats", stats: [{ value: 39, suffix: "%", label: "of core skills expected to change by 2030" }], source: WEF },
  ] },
  { id: "s03", num: 15, chapter: "15. Expert judgement", card: "EXPERT JUDGEMENT", cards: [
    { from: "professionalised", to: "The lesson", kind: "stats", headline: "Professionalised roles", stats: [{ display: "2×", label: "job growth" }, { value: 42, suffix: "%", label: "faster salary growth" }], source: "PwC 2026" },
  ] },
  { id: "s04", num: 14, chapter: "14. Curiosity and lifelong learning", card: "CURIOSITY AND LIFELONG LEARNING", cards: [
    { from: "Half", to: "If two", kind: "stats", stats: [{ value: 50, suffix: "%", label: "of employers call it a core skill" }], source: WEF },
  ] },
  { id: "s05", num: 13, chapter: "13. Leadership and social influence", card: "LEADERSHIP AND SOCIAL INFLUENCE", cards: [
    { from: "junior jobs", to: "Influence", kind: "stats", headline: "AI-exposed entry-level jobs (US)", stats: [{ display: "7×", label: "more likely to require senior-level human skills" }], source: "PwC 2026", source2: "Top 3 core skill · WEF Future of Jobs Report 2025" },
  ] },
  { id: "s06", num: 12, chapter: "12. Resilience, flexibility and agility", card: "RESILIENCE, FLEXIBILITY AND AGILITY", cards: [
    { from: "Sixty-seven", to: "When a fifth", kind: "stats", stats: [{ value: 67, suffix: "%", label: "of employers call it a core skill" }], source: WEF },
    { from: "When a fifth", to: "To start", kind: "stats", stats: [{ value: 22, suffix: "%", label: "of jobs created or destroyed by 2030" }], source: WEF },
  ] },
  { id: "s07", num: 11, chapter: "11. Creative thinking", card: "CREATIVE THINKING", cards: [
    { from: "top ten", to: "AI can", kind: "stats", stats: [{ display: "TOP 10", label: "fastest-growing skills" }], source: WEF },
  ] },
  { id: "s08", num: 10, chapter: "10. Analytical thinking", card: "ANALYTICAL THINKING", cards: [
    { from: "Seven in", to: "It means", kind: "stats", stats: [{ display: "~70%", label: "of employers: the #1 core skill" }], source: WEF },
  ] },
  { id: "s09", num: 9, chapter: "9. Green skills", card: "GREEN SKILLS", cards: [
    { from: "LinkedIn found", to: "that green hiring", kind: "stats", stats: [{ value: 46.6, decimals: 1, suffix: "%", label: "higher hiring rate for green talent" }], source: "LinkedIn Global Green Skills Report 2025" },
    { from: "that green hiring", to: "When demand", kind: "bars", bars: [{ label: "Green hiring", value: 7.7, decimals: 1, prefix: "+", suffix: "%" }, { label: "Green talent supply", value: 4.3, decimals: 1, prefix: "+", suffix: "%" }], source: "LinkedIn Global Green Skills Report 2025" },
  ] },
  { id: "s10", num: 8, chapter: "8. Power for data centres", card: "POWER FOR DATA CENTRES", cards: [
    { from: "International Energy", to: "Every one", dur: 7, kind: "stats", headline: "Data-centre electricity use by 2030", stats: [{ display: "~945 TWh", label: "roughly double today · more than Japan uses today" }], source: "IEA, Energy and AI (2025)" },
  ] },
  { id: "s11", num: 7, chapter: "7. Fintech engineering", card: "FINTECH ENGINEERING", cards: [
    { from: "Fintech engineers", to: "Payments", kind: "stats", headline: "Fintech engineers", stats: [{ display: "FASTEST-GROWING", label: "among the fastest-growing jobs" }], source: WEF },
  ] },
  { id: "s12", num: 6, chapter: "6. Technological literacy", card: "TECHNOLOGICAL LITERACY", cards: [
    { from: "the third", to: "This isn't", kind: "stats", stats: [{ display: "#3", label: "fastest-growing skill" }], source: WEF },
  ] },
  { id: "s13", num: 5, chapter: "5. Securing AI and the cloud", card: "SECURING AI AND THE CLOUD", cards: [
    { from: "In ISC2's", to: "Companies are", kind: "bars", headline: "Most pressing skills needs", bars: [{ label: "AI", value: 41, suffix: "%" }, { label: "Cloud security", value: 36, suffix: "%" }], source: ISC2 },
  ] },
  { id: "s14", num: 4, chapter: "4. Cybersecurity", card: "CYBERSECURITY", cards: [
    { from: "Networks and", to: "And ninety-five", kind: "stats", stats: [{ display: "#2", label: "fastest-growing skill: networks and cybersecurity" }], source: WEF },
    { from: "And ninety-five", to: "To start", kind: "stats", stats: [{ value: 95, suffix: "%", label: "report at least one skills gap" }], source: ISC2 },
  ] },
  { id: "s15", num: 3, chapter: "3. Working with data", card: "WORKING WITH DATA", cards: [
    { from: "AI and big data", to: "You don't", kind: "stats", stats: [{ display: "#1", label: "fastest-growing skill: AI and big data" }], source: WEF },
  ] },
  { id: "s16", num: 2, chapter: "2. Building AI systems", card: "BUILDING AI SYSTEMS", cards: [
    { from: "specific AI", to: "To start", kind: "bars", headline: "Job growth", note: "≈8× faster", noteFrom: "roughly eight", bars: [{ label: "Jobs requiring AI skills", value: 69, prefix: "+", suffix: "%" }, { label: "Job market overall", value: 9, prefix: "+", suffix: "%" }], source: "PwC 2026" },
  ] },
  { id: "s17", num: 1, chapter: "1. Using AI in your own job", card: "USING AI IN YOUR OWN JOB", cards: [
    { from: "PwC found", to: "Lightcast looking", kind: "stats", headline: "AI-skills wage premium", stats: [{ value: 62, suffix: "%", label: "this year" }, { value: 57, suffix: "%", label: "a year earlier" }], source: "PwC 2026" },
    { from: "Lightcast looking", to: "And here's", kind: "stats", headline: "Postings asking for AI skills", stats: [{ value: 28, prefix: "+", suffix: "%", label: "more pay" }, { value: 18000, prefix: "~$", label: "a year" }], source: LC },
    { from: "more than half", to: "You don't", kind: "stats", stats: [{ value: 51, suffix: "%", label: "of AI-skill postings were outside IT" }], source: LC },
  ] },
  { id: "s18", chapter: "What's losing value", card: "WHAT'S LOSING VALUE", cards: [
    { from: "Employers expect", to: "Dependability", kind: "stats", headline: "Manual dexterity, endurance, precision", stats: [{ value: 24, suffix: "%", label: "of employers expect lower importance" }], source: WEF },
  ] },
  { id: "s19", chapter: "How to use this list", card: "HOW TO USE THIS LIST", cards: [
    { from: "Numbers one to nine", to: "The data points", dur: 9, kind: "split", cols: [
      { title: "TECHNICAL", range: "#1 – #9", items: ["AI", "Data", "Security", "Finance", "Energy", "Green"] },
      { title: "HUMAN", range: "#10 – #15", items: ["Analysis", "Creativity", "Adaptability", "Leadership", "Learning", "Judgement"] },
    ] },
    { from: "the strongest position", to: "A marketer", kind: "pair", dur: 6 },
  ] },
  { id: "s20", chapter: "Close", cards: [
    { from: "Which one", kind: "cta", dur: 6 },
  ] },
];
