import { toWords, type CinematicDataProps } from "./CinematicDataShort";

/**
 * Baseline looping episode. The last words ("…that's how you lose a") feed
 * straight back into the first ("$6 billion empire"), so the loop reads as one sentence.
 * Keywords are marked with `*`.
 */
const SCRIPT =
  "*$6 *billion empire. Gone. In 2000 *Netflix offered itself for *$50 *million. " +
  "Blockbuster *laughed. By 2004 they had *9,000 stores. " +
  "Then Netflix started *streaming. Revenue fell off a *cliff. " +
  "2010: *Chapter *11. They were offered the *future for $50 million. " +
  "They said *no. That's how you lose a";

const captions = toWords(SCRIPT);

/** Index of the first caption word matching `text` (after `from`). */
const at = (text: string, from = 0) => {
  const i = captions.findIndex((w, idx) => idx >= from && w.text.replace(/[.,:]/g, "") === text);
  if (i < 0) throw new Error(`Chart cue "${text}" not in script`);
  return i;
};

export const blockbusterCinematic: CinematicDataProps = {
  kicker: "Blockbuster · 2000–2014",
  metricLabel: "Annual revenue",
  unitPrefix: "$",
  unitSuffix: "B",
  captions,
  // Approximate annual revenue ($B) from 10-K filings — verify before publishing.
  chart: [
    { label: "2000", value: 4.96, atWord: 0 },
    { label: "2004", value: 6.05, atWord: at("2004") },
    { label: "2007", value: 5.54, atWord: at("streaming") },
    { label: "2009", value: 4.06, atWord: at("cliff") },
    { label: "2010", value: 3.24, atWord: at("2010") },
    { label: "2014", value: 0, atWord: at("no") },
  ],
};
