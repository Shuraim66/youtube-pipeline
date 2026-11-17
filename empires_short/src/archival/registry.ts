/**
 * Composition id → ArchivalShort props, for tooling only (validator CLI + tests). Root.tsx stays the source of truth for
 * rendering; tests/archival.test.ts fails if this list and Root.tsx's ArchivalShort compositions drift apart.
 */
import type { ArchivalShortProps } from "./ArchivalShort";
import { arnold } from "./arnold";
import { bierce } from "./bierce";
import { capone } from "./capone";
import { caponeV2 } from "./capone_v2";
import { carnegie } from "./carnegie";
import { crater } from "./crater";
import { cyclops } from "./cyclops";
import { drew } from "./drew";
import { durant } from "./durant";
import { earhart } from "./earhart";
import { fawcett } from "./fawcett";
import { fawcettV2 } from "./fawcett_v2";
import { christieV2 } from "./christie_v2";
import { babydoeV2 } from "./babydoe_v2";
import { lawV2 } from "./law_v2";
import { andersonV2 } from "./anderson_v2";
import { malloryV2 } from "./mallory_v2";
import { flight19V2 } from "./flight19_v2";
import { newtonV2 } from "./newton_v2";
import { tulipV2 } from "./tulip_v2";
import { fisherV2 } from "./fisher_v2";
import { collapsibleaV2 } from "./collapsiblea_v2";
import { voynichV2 } from "./voynich_v2";
import { wardV2 } from "./ward_v2";
import { andreeV2 } from "./andree_v2";
import { macgregorV2 } from "./macgregor_v2";
import { ladybegoodV2 } from "./ladybegood_v2";
import { whitneyV2 } from "./whitney_v2";
import { hetty } from "./hetty";
import { insull } from "./insull";
import { kreuger } from "./kreuger";
import { leprince } from "./leprince";
import { livermore } from "./livermore";
import { miller } from "./miller";
import { ponzi } from "./ponzi";

export const ARCHIVAL_EPISODES: Record<string, { props: ArchivalShortProps; channel: "Aurelis HQ" | "The Night File" }> = {
  CarnegieShort: { props: carnegie, channel: "Aurelis HQ" },
  LivermoreShort: { props: livermore, channel: "Aurelis HQ" },
  DurantShort: { props: durant, channel: "Aurelis HQ" },
  InsullShort: { props: insull, channel: "Aurelis HQ" },
  DrewShort: { props: drew, channel: "Aurelis HQ" },
  HettyShort: { props: hetty, channel: "Aurelis HQ" },
  PonziShort: { props: ponzi, channel: "Aurelis HQ" },
  KreugerShort: { props: kreuger, channel: "Aurelis HQ" },
  CaponeShort: { props: capone, channel: "Aurelis HQ" },
  CaponeShortV2: { props: caponeV2, channel: "Aurelis HQ" },
  NightfileLePrince: { props: leprince, channel: "The Night File" },
  NightfileArnold: { props: arnold, channel: "The Night File" },
  NightfileBierce: { props: bierce, channel: "The Night File" },
  NightfileMiller: { props: miller, channel: "The Night File" },
  NightfileCyclops: { props: cyclops, channel: "The Night File" },
  NightfileCrater: { props: crater, channel: "The Night File" },
  NightfileEarhart: { props: earhart, channel: "The Night File" },
  NightfileFawcett: { props: fawcett, channel: "The Night File" },
  NightfileFawcettV2: { props: fawcettV2, channel: "The Night File" },
  NightfileChristieV2: { props: christieV2, channel: "The Night File" },
  BabyDoeShortV2: { props: babydoeV2, channel: "Aurelis HQ" },
  LawShortV2: { props: lawV2, channel: "Aurelis HQ" },
  NightfileAndersonV2: { props: andersonV2, channel: "The Night File" },
  NightfileMalloryV2: { props: malloryV2, channel: "The Night File" },
  NightfileFlight19V2: { props: flight19V2, channel: "The Night File" },
  NewtonBubbleShortV2: { props: newtonV2, channel: "Aurelis HQ" },
  TulipShortV2: { props: tulipV2, channel: "Aurelis HQ" },
  FisherCrashShortV2: { props: fisherV2, channel: "Aurelis HQ" },
  NightfileCollapsibleAV2: { props: collapsibleaV2, channel: "The Night File" },
  NightfileVoynichV2: { props: voynichV2, channel: "The Night File" },
  WardShortV2: { props: wardV2, channel: "Aurelis HQ" },
  NightfileAndreeV2: { props: andreeV2, channel: "The Night File" },
  MacGregorShortV2: { props: macgregorV2, channel: "Aurelis HQ" },
  NightfileLadyBeGoodV2: { props: ladybegoodV2, channel: "The Night File" },
  WhitneyShortV2: { props: whitneyV2, channel: "Aurelis HQ" },
};
