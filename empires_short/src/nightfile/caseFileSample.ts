import type { NightfileCaseFileProps } from "./NightfileCaseFile";

/** Sample episode. The last block ("…AND NOBODY KNOWS") reads straight into the first on loop. */
export const caseFileSample: NightfileCaseFileProps = {
  briefing: [
    { label: "FILE REGISTRY", value: "#0492-Z" },
    { label: "STATUS", value: "COLD CASE", alert: true },
    { label: "REGION", value: "N. CALIFORNIA · 1969" },
  ],
  evidence: { caption: "EXHIBIT A — CASE DOCUMENT" },
  script:
    "HE MAILED FOUR | CIPHERS TO | THE PRESS. | TWO WERE CRACKED. | TWO STILL AREN'T. | HE WAS NEVER CAUGHT | AND NOBODY KNOWS WHY",
};
