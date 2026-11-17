import { ponzi } from "./archival/ponzi";
import { crater } from "./archival/crater";
import { kreuger } from "./archival/kreuger";
import { capone } from "./archival/capone";
import { fawcett } from "./archival/fawcett";
import { caponeV2 } from "./archival/capone_v2";
import { fawcettV2 } from "./archival/fawcett_v2";
import { christieV2 } from "./archival/christie_v2";
import { babydoeV2 } from "./archival/babydoe_v2";
import { lawV2 } from "./archival/law_v2";
import { andersonV2 } from "./archival/anderson_v2";
import { malloryV2 } from "./archival/mallory_v2";
import { flight19V2 } from "./archival/flight19_v2";
import { GuessShort } from "./guess/GuessShort";
import { andreeLateGuess } from "./guess/andreelate_guess";
import { christieLateGuess } from "./guess/christielate_guess";
import { celesteLateGuess } from "./guess/celestelate_guess";
import { guessTiming } from "./guess/types";
import { flight19Guess } from "./guess/flight19_guess";
import { collapsibleaGuess } from "./guess/collapsiblea_guess";
import { malloryGuess } from "./guess/mallory_guess";
import { ladybegoodGuess } from "./guess/ladybegood_guess";
import { wardGuess } from "./guess/ward_guess";
import { macgregorGuess } from "./guess/macgregor_guess";
import { tulipGuess } from "./guess/tulip_guess";
import { fisherGuess } from "./guess/fisher_guess";
import { newtonV2 } from "./archival/newton_v2";
import { tulipV2 } from "./archival/tulip_v2";
import { fisherV2 } from "./archival/fisher_v2";
import { collapsibleaV2 } from "./archival/collapsiblea_v2";
import { voynichV2 } from "./archival/voynich_v2";
import { wardV2 } from "./archival/ward_v2";
import { andreeV2 } from "./archival/andree_v2";
import { macgregorV2 } from "./archival/macgregor_v2";
import { ladybegoodV2 } from "./archival/ladybegood_v2";
import { whitneyV2 } from "./archival/whitney_v2";
import { earhart } from "./archival/earhart";
import { hetty } from "./archival/hetty";
import { cyclops } from "./archival/cyclops";
import { drew } from "./archival/drew";
import { miller } from "./archival/miller";
import { insull } from "./archival/insull";
import { bierce } from "./archival/bierce";
import { arnold } from "./archival/arnold";
import { durant } from "./archival/durant";
import { livermore } from "./archival/livermore";
import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { EmpireShort, getEmpireDuration, type EmpireShortProps } from "./empire/EmpireShort";
import { blockbuster } from "./empire/data/blockbuster";
import { blackberry } from "./empire/data/blackberry";
import { lehman } from "./empire/data/lehman";
import { theranos } from "./empire/data/theranos";
import { quibi } from "./empire/data/quibi";
import { vine } from "./empire/data/vine";
import { ArchivalShort } from "./archival/ArchivalShort";
import { carnegie } from "./archival/carnegie";
import { leprince } from "./archival/leprince";
import { FPS, HEIGHT, WIDTH } from "./empire/theme";
import { AluxExecutive } from "./alux/AluxExecutive";
import { CinematicDataShort, getCinematicDuration } from "./cinematic/CinematicDataShort";
import { blockbusterCinematic } from "./cinematic/blockbusterCinematic";
import { NightfileDecoder } from "./nightfile/NightfileDecoder";
import { zodiacSample } from "./nightfile/zodiacSample";
import { NightfileCaseFile, getCaseFileDuration } from "./nightfile/NightfileCaseFile";
import { caseFileSample } from "./nightfile/caseFileSample";
import { mccormick } from "./nightfile/mccormick";
import { villisca } from "./nightfile/villisca";
import { celeste } from "./nightfile/celeste";
import { flannan } from "./nightfile/flannan";
import { cooper } from "./nightfile/cooper";
import { mh370 } from "./nightfile/mh370";
import { theodosia } from "./nightfile/theodosia";
import { BlackBerry3D } from "./three/BlackBerry3D";
import { LongForm } from "./longform/LongForm";
import { SkillsThumb } from "./longform/Thumb";
import { TOTAL_FRAMES } from "./longform/timeline";

export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="AurelisSkills2030" component={LongForm} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
  <Composition id="AurelisSkills2030Thumb" component={SkillsThumb} durationInFrames={1} fps={FPS} width={1280} height={720} />
  <Composition id="BlackBerry3D" component={BlackBerry3D} durationInFrames={165} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition id="NightfileTheodosia" component={NightfileCaseFile} durationInFrames={getCaseFileDuration(theodosia)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={theodosia} calculateMetadata={({ props }) => ({ durationInFrames: getCaseFileDuration(props) })} />
  <Composition id="NightfileMH370" component={NightfileCaseFile} durationInFrames={getCaseFileDuration(mh370)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={mh370} calculateMetadata={({ props }) => ({ durationInFrames: getCaseFileDuration(props) })} />
  <Composition id="NightfileCooper" component={NightfileCaseFile} durationInFrames={getCaseFileDuration(cooper)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={cooper} calculateMetadata={({ props }) => ({ durationInFrames: getCaseFileDuration(props) })} />
  <Composition id="NightfileFlannan" component={NightfileCaseFile} durationInFrames={getCaseFileDuration(flannan)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={flannan} calculateMetadata={({ props }) => ({ durationInFrames: getCaseFileDuration(props) })} />
  <Composition id="NightfileCeleste" component={NightfileCaseFile} durationInFrames={getCaseFileDuration(celeste)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={celeste} calculateMetadata={({ props }) => ({ durationInFrames: getCaseFileDuration(props) })} />
  <Composition id="NightfileArnold" component={ArchivalShort} durationInFrames={Math.round(arnold.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={arnold} />
  <Composition id="NightfileLePrince" component={ArchivalShort} durationInFrames={Math.round(leprince.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={leprince} />
  <Composition id="NightfileMiller" component={ArchivalShort} durationInFrames={Math.round(miller.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={miller} />
  <Composition id="PonziShort" component={ArchivalShort} durationInFrames={Math.round(ponzi.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={ponzi} />
  <Composition id="NightfileCrater" component={ArchivalShort} durationInFrames={Math.round(crater.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={crater} />
  <Composition id="KreugerShort" component={ArchivalShort} durationInFrames={Math.round(kreuger.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={kreuger} />
  <Composition id="NightfileEarhart" component={ArchivalShort} durationInFrames={Math.round(earhart.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={earhart} />
  <Composition id="CaponeShort" component={ArchivalShort} durationInFrames={Math.round(capone.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={capone} />
  <Composition id="NightfileFawcett" component={ArchivalShort} durationInFrames={Math.round(fawcett.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={fawcett} />
  {/* V2 template experiments (same story/VO as the V1 comps above) — local A/B only, never auto-uploaded */}
  <Composition id="CaponeShortV2" component={ArchivalShort} durationInFrames={Math.round(caponeV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={caponeV2} />
  <Composition id="NightfileFawcettV2" component={ArchivalShort} durationInFrames={Math.round(fawcettV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={fawcettV2} />
  <Composition id="NightfileChristieV2" component={ArchivalShort} durationInFrames={Math.round(christieV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={christieV2} />
  <Composition id="BabyDoeShortV2" component={ArchivalShort} durationInFrames={Math.round(babydoeV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={babydoeV2} />
  <Composition id="LawShortV2" component={ArchivalShort} durationInFrames={Math.round(lawV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={lawV2} />
  <Composition id="NightfileAndersonV2" component={ArchivalShort} durationInFrames={Math.round(andersonV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={andersonV2} />
  <Composition id="NightfileMalloryV2" component={ArchivalShort} durationInFrames={Math.round(malloryV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={malloryV2} />
  <Composition id="NightfileFlight19V2" component={ArchivalShort} durationInFrames={Math.round(flight19V2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={flight19V2} />
  {/* "Guess first" format test — no VO; not in registry.ts (ArchivalShort only) */}
  <Composition id="NightfileFlight19Guess" component={GuessShort} durationInFrames={guessTiming(flight19Guess).durationFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={flight19Guess} />
  <Composition id="NightfileCollapsibleAGuess" component={GuessShort} durationInFrames={guessTiming(collapsibleaGuess).durationFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={collapsibleaGuess} />
  <Composition id="NightfileMalloryGuess" component={GuessShort} durationInFrames={guessTiming(malloryGuess).durationFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={malloryGuess} />
  <Composition id="NightfileLadyBeGoodGuess" component={GuessShort} durationInFrames={guessTiming(ladybegoodGuess).durationFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={ladybegoodGuess} />
  <Composition id="WardGuessShort" component={GuessShort} durationInFrames={guessTiming(wardGuess).durationFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={wardGuess} />
  <Composition id="MacGregorGuessShort" component={GuessShort} durationInFrames={guessTiming(macgregorGuess).durationFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={macgregorGuess} />
  <Composition id="TulipGuessShort" component={GuessShort} durationInFrames={guessTiming(tulipGuess).durationFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={tulipGuess} />
  <Composition id="FisherGuessShort" component={GuessShort} durationInFrames={guessTiming(fisherGuess).durationFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={fisherGuess} />
  <Composition id="NightfileAndreeLate" component={GuessShort} durationInFrames={guessTiming(andreeLateGuess).durationFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={andreeLateGuess} />
  <Composition id="NightfileChristieLate" component={GuessShort} durationInFrames={guessTiming(christieLateGuess).durationFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={christieLateGuess} />
  <Composition id="NightfileCelesteLate" component={GuessShort} durationInFrames={guessTiming(celesteLateGuess).durationFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={celesteLateGuess} />
  <Composition id="NewtonBubbleShortV2" component={ArchivalShort} durationInFrames={Math.round(newtonV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={newtonV2} />
  <Composition id="TulipShortV2" component={ArchivalShort} durationInFrames={Math.round(tulipV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={tulipV2} />
  <Composition id="FisherCrashShortV2" component={ArchivalShort} durationInFrames={Math.round(fisherV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={fisherV2} />
  <Composition id="NightfileCollapsibleAV2" component={ArchivalShort} durationInFrames={Math.round(collapsibleaV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={collapsibleaV2} />
  <Composition id="NightfileVoynichV2" component={ArchivalShort} durationInFrames={Math.round(voynichV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={voynichV2} />
  <Composition id="WardShortV2" component={ArchivalShort} durationInFrames={Math.round(wardV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={wardV2} />
  <Composition id="NightfileAndreeV2" component={ArchivalShort} durationInFrames={Math.round(andreeV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={andreeV2} />
  <Composition id="MacGregorShortV2" component={ArchivalShort} durationInFrames={Math.round(macgregorV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={macgregorV2} />
  <Composition id="NightfileLadyBeGoodV2" component={ArchivalShort} durationInFrames={Math.round(ladybegoodV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={ladybegoodV2} />
  <Composition id="WhitneyShortV2" component={ArchivalShort} durationInFrames={Math.round(whitneyV2.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={whitneyV2} />
  <Composition id="HettyShort" component={ArchivalShort} durationInFrames={Math.round(hetty.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={hetty} />
  <Composition id="NightfileCyclops" component={ArchivalShort} durationInFrames={Math.round(cyclops.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={cyclops} />
  <Composition id="DrewShort" component={ArchivalShort} durationInFrames={Math.round(drew.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={drew} />
  <Composition id="InsullShort" component={ArchivalShort} durationInFrames={Math.round(insull.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={insull} />
  <Composition id="NightfileBierce" component={ArchivalShort} durationInFrames={Math.round(bierce.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={bierce} />
  <Composition id="DurantShort" component={ArchivalShort} durationInFrames={Math.round(durant.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={durant} />
  <Composition id="LivermoreShort" component={ArchivalShort} durationInFrames={Math.round(livermore.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={livermore} />
  <Composition id="CarnegieShort" component={ArchivalShort} durationInFrames={Math.round(carnegie.durationSec * FPS)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={carnegie} />
  <Composition
    id="VineShort"
    component={EmpireShort}
    durationInFrames={getEmpireDuration(vine, FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ timeline: vine } satisfies EmpireShortProps}
    calculateMetadata={({ props }) => ({ durationInFrames: getEmpireDuration(props.timeline, FPS) })}
  />
  <Composition
    id="QuibiShort"
    component={EmpireShort}
    durationInFrames={getEmpireDuration(quibi, FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ timeline: quibi } satisfies EmpireShortProps}
    calculateMetadata={({ props }) => ({ durationInFrames: getEmpireDuration(props.timeline, FPS) })}
  />
  <Composition
    id="TheranosShort"
    component={EmpireShort}
    durationInFrames={getEmpireDuration(theranos, FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ timeline: theranos } satisfies EmpireShortProps}
    calculateMetadata={({ props }) => ({ durationInFrames: getEmpireDuration(props.timeline, FPS) })}
  />
  <Composition
    id="LehmanShort"
    component={EmpireShort}
    durationInFrames={getEmpireDuration(lehman, FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ timeline: lehman } satisfies EmpireShortProps}
    calculateMetadata={({ props }) => ({ durationInFrames: getEmpireDuration(props.timeline, FPS) })}
  />
  <Composition id="NightfileVillisca" component={NightfileCaseFile} durationInFrames={getCaseFileDuration(villisca)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={villisca} calculateMetadata={({ props }) => ({ durationInFrames: getCaseFileDuration(props) })} />
  <Composition
    id="BlackBerryShort"
    component={EmpireShort}
    durationInFrames={getEmpireDuration(blackberry, FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ timeline: blackberry, footage: true } satisfies EmpireShortProps}
    calculateMetadata={({ props }) => ({ durationInFrames: getEmpireDuration(props.timeline, FPS) })}
  />
  <Composition id="NightfileMcCormick" component={NightfileCaseFile} durationInFrames={getCaseFileDuration(mccormick)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={mccormick} calculateMetadata={({ props }) => ({ durationInFrames: getCaseFileDuration(props) })} />
  <Composition id="NightfileCaseFile" component={NightfileCaseFile} durationInFrames={getCaseFileDuration(caseFileSample)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={caseFileSample} calculateMetadata={({ props }) => ({ durationInFrames: getCaseFileDuration(props) })} />
  <Composition id="NightfileDecoder" component={NightfileDecoder} durationInFrames={450} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={zodiacSample} />
  <Composition id="CinematicDataShort" component={CinematicDataShort} durationInFrames={getCinematicDuration(blockbusterCinematic)} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={blockbusterCinematic} calculateMetadata={({ props }) => ({ durationInFrames: getCinematicDuration(props) })} />
  <Composition id="AluxExecutive" component={AluxExecutive} durationInFrames={FPS * 12} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition
    id="EmpireShort"
    component={EmpireShort}
    durationInFrames={getEmpireDuration(blockbuster, FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ timeline: blockbuster } satisfies EmpireShortProps}
    calculateMetadata={({ props }) => ({ durationInFrames: getEmpireDuration(props.timeline, FPS) })}
  />
  <Composition
    id="EmpireShortFootage"
    component={EmpireShort}
    durationInFrames={getEmpireDuration(blockbuster, FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ timeline: blockbuster, footage: true } satisfies EmpireShortProps}
    calculateMetadata={({ props }) => ({ durationInFrames: getEmpireDuration(props.timeline, FPS) })}
  />
  </>
);
